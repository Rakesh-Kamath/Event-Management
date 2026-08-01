import express from 'express';
import Ticket from '../models/Ticket.js';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/tickets/verify-qr
// @desc    Verify QR Code payload and mark ticket attendance (Organizer only)
router.post('/verify-qr', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { ticketId, code, bookingNumber } = req.body;
    const searchCode = ticketId || code || bookingNumber;

    if (!searchCode) {
      return res.status(400).json({ message: 'Please provide ticketId or QR code payload' });
    }

    let ticket;
    let booking;

    // Check Ticket Schema
    ticket = await Ticket.findOne({ ticketId: searchCode }).populate({
      path: 'bookingId',
      populate: { path: 'eventId user' }
    });

    if (ticket) {
      booking = ticket.bookingId;
      if (ticket.isUsed) {
        return res.status(400).json({
          valid: false,
          alreadyAttended: true,
          message: `Already scanned at ${new Date(ticket.scannedAt).toLocaleString()}`,
          ticket,
          booking
        });
      }

      ticket.isUsed = true;
      ticket.scannedAt = new Date();
      await ticket.save();

      if (booking) {
        booking.attended = true;
        booking.attendedAt = ticket.scannedAt;
        await booking.save();
      }

      return res.json({
        valid: true,
        message: 'Attendance Verified',
        ticket,
        booking
      });
    }

    // Fallback search in Booking Schema
    let parsedCode = searchCode;
    if (typeof searchCode === 'string' && searchCode.startsWith('{')) {
      try {
        const parsed = JSON.parse(searchCode);
        parsedCode = parsed.code || parsed.bNo || searchCode;
      } catch (e) {}
    }

    booking = await Booking.findOne({
      $or: [{ bookingNumber: parsedCode }, { verificationCode: parsedCode }]
    }).populate('eventId user event');

    if (!booking) {
      return res.status(404).json({
        valid: false,
        message: 'INVALID TICKET: No matching record found.'
      });
    }

    if (booking.attended) {
      return res.status(400).json({
        valid: false,
        alreadyAttended: true,
        message: `Already scanned at ${new Date(booking.attendedAt).toLocaleString()}`,
        booking
      });
    }

    booking.attended = true;
    booking.attendedAt = new Date();
    await booking.save();

    res.json({
      valid: true,
      message: 'Attendance Verified',
      booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message || 'Error processing QR entry verification' });
  }
});

export default router;
