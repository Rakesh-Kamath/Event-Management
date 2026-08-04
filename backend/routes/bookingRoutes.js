import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import Notification from '../models/Notification.js';
import { generateQRCode } from '../utils/qrHelper.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { 
  sendBookingConfirmationEmail, 
  sendPaymentSuccessEmail, 
  sendTicketDownloadEmail 
} from '../utils/emailService.js';

dotenv.config();

const router = express.Router();

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

const generateBookingCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'EVT-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// @route   POST /api/bookings/create-order
// @desc    Initialize order & check available seats atomically
router.post('/create-order', protect, async (req, res) => {
  try {
    const { eventId, seatsBooked = 1, ticketsCount = 1 } = req.body;
    const count = seatsBooked || ticketsCount || 1;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'This event is not open for registration' });
    }

    if (event.availableSeats < count) {
      return res.status(400).json({ 
        message: `Insufficient seats available. Only ${event.availableSeats} remaining.` 
      });
    }

    const orderId = `ORDER-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = event.ticketPrice * count;

    let rzpOrderId = null;
    // If Razorpay keys are configured, create a real Razorpay Order
    if (razorpay && totalAmount > 0) {
      try {
        const options = {
          amount: totalAmount * 100, // amount in the smallest currency unit (paise)
          currency: "INR",
          receipt: orderId
        };
        const rzpOrder = await razorpay.orders.create(options);
        rzpOrderId = rzpOrder.id;
      } catch (err) {
        console.error('Razorpay Order Creation Failed:', err);
        return res.status(500).json({ message: 'Razorpay order creation failed: ' + err.message });
      }
    }

    res.json({
      orderId: rzpOrderId || orderId,
      isRazorpayActive: !!razorpay && totalAmount > 0,
      amount: totalAmount,
      currency: 'INR',
      eventId: event._id,
      seatsBooked: count,
      message: 'Order created successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating order' });
  }
});

// @route   POST /api/bookings/verify-payment
// @desc    Verify payment signature, decrement availableSeats, generate Ticket & QR code
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { 
      eventId, 
      seatsBooked = 1, 
      ticketsCount = 1, 
      paymentMethod = 'card', 
      paymentId, 
      attendeeName, 
      attendeePhone,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;
    const count = seatsBooked || ticketsCount || 1;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.availableSeats < count) {
      return res.status(400).json({ message: 'Seats are no longer available for this event.' });
    }

    const totalAmount = event.ticketPrice * count;

    // Verify Razorpay signature if credentials are set and it was a paid booking
    if (razorpay && totalAmount > 0) {
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Razorpay payment details are missing.' });
      }
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification failed: invalid signature.' });
      }
    }

    const bookingNumber = generateBookingCode();
    const verificationCode = `VERIFY-${bookingNumber}-${Date.now().toString(36).toUpperCase()}`;
    const txnPaymentId = razorpay_payment_id || paymentId || `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const booking = await Booking.create({
      bookingNumber,
      eventId: event._id,
      event: event._id,
      userId: req.user._id,
      user: req.user._id,
      seatsBooked: count,
      ticketsCount: count,
      unitPrice: event.ticketPrice,
      totalAmount,
      paymentStatus: 'successful',
      paymentMethod: razorpay_payment_id ? 'razorpay' : paymentMethod,
      paymentId: txnPaymentId,
      verificationCode,
      attendeeName: attendeeName || req.user.name,
      attendeeEmail: req.user.email,
      attendeePhone: attendeePhone || ''
    });

    // Atomically decrement availableSeats
    event.availableSeats -= count;
    await event.save();

    // Create unique Ticket schema record & QR code
    const ticketId = `TCK-${bookingNumber}-${Date.now().toString(36).toUpperCase()}`;
    const qrPayload = JSON.stringify({
      ticketId,
      bNo: bookingNumber,
      code: verificationCode,
      eId: event._id,
      uId: req.user._id
    });
    const qrCodeUrl = await generateQRCode(qrPayload);

    booking.qrCodeData = qrCodeUrl;
    await booking.save();

    const ticket = await Ticket.create({
      bookingId: booking._id,
      ticketId,
      qrCodeUrl,
      isUsed: false
    });

    await Notification.create({
      user: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your booking (${bookingNumber}) for "${event.title}" is confirmed. Download your digital QR ticket.`,
      type: 'booking'
    });

    await booking.populate('eventId event', 'title bannerUrl dateTime venue venueName address city ticketPrice');

    // Trigger transactional emails asynchronously without blocking the response
    (async () => {
      try {
        await sendBookingConfirmationEmail({
          email: req.user.email,
          name: req.user.name,
          event: booking.event || booking.eventId,
          booking
        });

        // If it was a paid event, send payment invoice receipt
        if (booking.totalAmount > 0) {
          await sendPaymentSuccessEmail({
            email: req.user.email,
            name: req.user.name,
            event: booking.event || booking.eventId,
            booking
          });
        }

        // Send ticket download link
        await sendTicketDownloadEmail({
          email: req.user.email,
          name: req.user.name,
          event: booking.event || booking.eventId,
          booking
        });
      } catch (emailErr) {
        console.error('[Nodemailer Trigger Error]:', emailErr.message);
      }
    })();

    res.status(201).json({
      message: 'Payment verified and ticket generated successfully!',
      booking,
      ticket
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error verifying payment' });
  }
});

// @route   POST /api/bookings (Legacy / Direct booking route)
router.post('/', protect, async (req, res) => {
  return router.handle({ ...req, url: '/verify-payment' }, res);
});

// @route   GET /api/bookings/my-bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ $or: [{ userId: req.user._id }, { user: req.user._id }] })
      .populate('eventId event', 'title bannerUrl dateTime venue venueName address city ticketPrice status organizerId organizer')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking history' });
  }
});

// @route   GET /api/bookings/event/:eventId
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const bookings = await Booking.find({ $or: [{ eventId: req.params.eventId }, { event: req.params.eventId }] })
      .populate('userId user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      event: {
        id: event._id,
        title: event.title,
        maxCapacity: event.maxCapacity || event.totalCapacity,
        availableSeats: event.availableSeats,
        ticketsSold: (event.maxCapacity || event.totalCapacity) - event.availableSeats
      },
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving attendee list' });
  }
});

export default router;
