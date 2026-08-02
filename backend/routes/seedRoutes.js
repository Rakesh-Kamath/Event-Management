import express from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';
import Notification from '../models/Notification.js';
import { generateQRCode } from '../utils/qrHelper.js';

const router = express.Router();
const ARTIFACTS_DIR = 'C:/Users/kamat/.gemini/antigravity-ide/brain/c4ef3f33-0d16-4f51-9573-73394413fe89';

function getBase64Image(filename) {
  try {
    const filePath = path.join(ARTIFACTS_DIR, filename);
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath);
      return `data:image/jpeg;base64,${fileData.toString('base64')}`;
    }
  } catch (err) {
    console.error('Error reading image for seed route:', err);
  }
  return '';
}

// Helper to generate booking codes
function genBookingCode(prefix, idx) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 5; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `EVT-${prefix}${idx}-${suffix}`;
}

// Helper to generate a random date within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// @route POST /api/seed
// @desc Seed database with users, events, and analytics-rich booking data
router.post('/', async (req, res) => {
  try {
    const imgParmishPune = getBase64Image('media__1785611696548.jpg');
    const imgBharatRangDelhi = getBase64Image('media__1785611696562.jpg');
    const imgBengaluruNightMarket = getBase64Image('media__1785611696580.jpg');
    const imgSilaaJammingHyd = getBase64Image('media__1785611696668.jpg');
    const imgMumbaiSymphony = getBase64Image('media__1785611696688.jpg');

    // Clear everything
    await User.deleteMany({});
    await Category.deleteMany({});
    await Event.deleteMany({});
    await Booking.deleteMany({});
    await Ticket.deleteMany({});
    await Notification.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const orgPass = await bcrypt.hash('organizer123', salt);
    const userPass = await bcrypt.hash('user123', salt);

    // ===========================
    // CREATE USERS
    // ===========================
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin123@gmail.com',
      password: adminPass,
      role: 'admin',
      isApproved: true
    });

    const organizer = await User.create({
      name: 'Experience Entertainment',
      email: 'organizer123@gmail.com',
      password: orgPass,
      role: 'organizer',
      organizationName: 'Experience Entertainment India',
      phone: '+91 98765 43210',
      isApproved: true
    });

    // Create multiple test participants for realistic analytics
    const participantData = [
      { name: 'Aarav Patel', email: 'participant@demo.com', phone: '+91 91234 56789' },
      { name: 'Priya Sharma', email: 'priya.sharma@demo.com', phone: '+91 98765 11111' },
      { name: 'Rohan Gupta', email: 'rohan.gupta@demo.com', phone: '+91 98765 22222' },
      { name: 'Sneha Reddy', email: 'sneha.reddy@demo.com', phone: '+91 98765 33333' },
      { name: 'Vikram Singh', email: 'vikram.singh@demo.com', phone: '+91 98765 44444' },
      { name: 'Ananya Iyer', email: 'ananya.iyer@demo.com', phone: '+91 98765 55555' },
      { name: 'Karthik Nair', email: 'karthik.nair@demo.com', phone: '+91 98765 66666' },
      { name: 'Deepika Joshi', email: 'deepika.joshi@demo.com', phone: '+91 98765 77777' },
      { name: 'Arjun Menon', email: 'arjun.menon@demo.com', phone: '+91 98765 88888' },
      { name: 'Meera Kapoor', email: 'meera.kapoor@demo.com', phone: '+91 98765 99999' },
    ];

    const participants = [];
    for (const p of participantData) {
      const user = await User.create({
        ...p,
        password: userPass,
        role: 'participant',
        isApproved: true
      });
      participants.push(user);
    }

    // ===========================
    // CREATE CATEGORIES
    // ===========================
    await Category.insertMany([
      { name: 'Cultural', slug: 'cultural', icon: 'Music', description: 'Music concerts, drama festivals & live performances', image: imgMumbaiSymphony },
      { name: 'Food & Drinks', slug: 'food-drinks', icon: 'Utensils', description: 'Night markets, food festivals & culinary popups', image: imgBengaluruNightMarket },
      { name: 'Technical', slug: 'technical', icon: 'Code', description: 'Tech expos, hackathons & summits', image: imgBharatRangDelhi },
      { name: 'Workshop', slug: 'workshop', icon: 'BookOpen', description: 'Masterclasses & interactive jamming', image: imgSilaaJammingHyd },
      { name: 'Sports', slug: 'sports', icon: 'Activity', description: 'Marathons & fitness expos', image: imgParmishPune },
      { name: 'Business', slug: 'business', icon: 'Briefcase', description: 'Conferences, networking & startup meetups', image: '' }
    ]);

    // ===========================
    // CREATE EVENTS (7 events across categories & cities)
    // ===========================
    const event1 = await Event.create({
      title: 'Shera India Tour ft. Parmish Verma',
      description: 'Punjabi superstar Parmish Verma brings his Shera India Tour to Pune with a festival-scale concert.',
      category: 'Cultural',
      organizerId: organizer._id,
      organizerName: 'Experience Entertainment',
      venue: { name: 'Xclusive Club and Kitchen', address: 'Viman Nagar, Pune', city: 'Pune', state: 'Maharashtra', country: 'India', pincode: '411014', location: { type: 'Point', coordinates: [73.9143, 18.5679] } },
      venueName: 'Xclusive Club and Kitchen, Pune', address: 'Viman Nagar', city: 'Pune',
      dateTime: new Date('2026-06-14T19:00:00.000Z'),
      ticketPrice: 1299, maxCapacity: 1500, totalCapacity: 1500, availableSeats: 1500,
      status: 'approved', bannerUrl: imgParmishPune,
      speakers: [{ name: 'Parmish Verma', title: 'Headliner Artist', bio: 'Punjabi Music Superstar & Actor' }]
    });

    const event2 = await Event.create({
      title: '25th Bharat Rang Mahotsav 2026',
      description: "Asia's largest international theatre festival organized by National School of Drama.",
      category: 'Cultural',
      organizerId: organizer._id,
      organizerName: 'National School of Drama',
      venue: { name: 'National School of Drama', address: 'Mandi House', city: 'Delhi NCR', state: 'Delhi', country: 'India', pincode: '110001', location: { type: 'Point', coordinates: [77.2315, 28.6252] } },
      venueName: 'National School of Drama, Mandi House', address: 'Mandi House', city: 'Delhi NCR',
      dateTime: new Date('2026-02-10T18:00:00.000Z'),
      ticketPrice: 0, maxCapacity: 2000, totalCapacity: 2000, availableSeats: 2000,
      status: 'approved', bannerUrl: imgBharatRangDelhi
    });

    const event3 = await Event.create({
      title: 'Bengaluru Night Market - Stay Lit',
      description: '12 Hours. One Market. Endless Experiences. Craft drinks, gourmet food, live music.',
      category: 'Food & Drinks',
      organizerId: organizer._id,
      organizerName: 'Essensai Events',
      venue: { name: 'Essensai 067', address: 'Indiranagar 100ft Road', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560038', location: { type: 'Point', coordinates: [77.6412, 12.9716] } },
      venueName: 'Essensai 067, Bengaluru', address: 'Indiranagar 100ft Road', city: 'Bengaluru',
      dateTime: new Date('2026-07-11T12:00:00.000Z'),
      ticketPrice: 199, maxCapacity: 3000, totalCapacity: 3000, availableSeats: 3000,
      status: 'approved', bannerUrl: imgBengaluruNightMarket
    });

    const event4 = await Event.create({
      title: 'Silaa Thursday Telugu & Hindi Jamming',
      description: 'Live Music. Real Vibes! An open-air acoustic jamming night.',
      category: 'Workshop',
      organizerId: organizer._id,
      organizerName: 'Silaa Garden Collective',
      venue: { name: 'Silaa The Garden Cafe', address: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500033', location: { type: 'Point', coordinates: [78.4071, 17.4319] } },
      venueName: 'Silaa The Garden Cafe, Jubilee Hills', address: 'Jubilee Hills', city: 'Hyderabad',
      dateTime: new Date('2026-07-23T20:00:00.000Z'),
      ticketPrice: 299, maxCapacity: 350, totalCapacity: 350, availableSeats: 350,
      status: 'approved', bannerUrl: imgSilaaJammingHyd
    });

    const event5 = await Event.create({
      title: 'Mumbai Symphony & Classical Jazz Night',
      description: 'A grand fusion of orchestral magnificence and vibrant jazz rhythms at NCPA Mumbai.',
      category: 'Cultural',
      organizerId: organizer._id,
      organizerName: 'Symphony & Jazz Night Mumbai',
      venue: { name: 'The Jamshed Bhabha Theatre, NCPA', address: 'Nariman Point', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400021', location: { type: 'Point', coordinates: [72.8208, 18.9248] } },
      venueName: 'The Jamshed Bhabha Theatre, NCPA', address: 'Nariman Point', city: 'Mumbai',
      dateTime: new Date('2026-11-16T19:00:00.000Z'),
      ticketPrice: 1500, maxCapacity: 1000, totalCapacity: 1000, availableSeats: 1000,
      status: 'approved', bannerUrl: imgMumbaiSymphony,
      speakers: [
        { name: 'The Bombay Chamber Orchestra', title: 'Orchestral Ensemble' },
        { name: 'The Midnight Blue Jazz Collective', title: 'Jazz Ensemble' },
        { name: 'Priya Sharma', title: 'Special Guest Vocalist' }
      ]
    });

    const event6 = await Event.create({
      title: 'TechSpark Hackathon 2026',
      description: '48-hour hackathon for developers, designers and innovators. Build real products, win prizes up to ₹5,00,000.',
      category: 'Technical',
      organizerId: organizer._id,
      organizerName: 'TechSpark Foundation',
      venue: { name: 'IIIT Hyderabad', address: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500032', location: { type: 'Point', coordinates: [78.3494, 17.4454] } },
      venueName: 'IIIT Hyderabad, Gachibowli', address: 'Gachibowli', city: 'Hyderabad',
      dateTime: new Date('2026-08-20T09:00:00.000Z'),
      ticketPrice: 0, maxCapacity: 500, totalCapacity: 500, availableSeats: 500,
      status: 'approved', bannerUrl: ''
    });

    const event7 = await Event.create({
      title: 'Chennai Startup Summit 2026',
      description: 'South India\'s largest startup conference. Pitching sessions, investor meetings, and keynote talks.',
      category: 'Business',
      organizerId: organizer._id,
      organizerName: 'StartupTN',
      venue: { name: 'Chennai Trade Centre', address: 'Nandambakkam', city: 'Chennai', state: 'Tamil Nadu', country: 'India', pincode: '600089', location: { type: 'Point', coordinates: [80.1893, 13.0142] } },
      venueName: 'Chennai Trade Centre', address: 'Nandambakkam', city: 'Chennai',
      dateTime: new Date('2026-09-05T10:00:00.000Z'),
      ticketPrice: 499, maxCapacity: 800, totalCapacity: 800, availableSeats: 800,
      status: 'approved', bannerUrl: ''
    });

    const allEvents = [event1, event2, event3, event4, event5, event6, event7];

    // ===========================
    // CREATE BOOKINGS — spread across events, dates, and participants
    // ===========================
    const bookingConfigs = [
      // Event 1: Parmish Verma (₹1299) — 8 bookings
      { event: event1, participantIdx: 0, seats: 2, daysAgo: 28, attended: true },
      { event: event1, participantIdx: 1, seats: 3, daysAgo: 25, attended: true },
      { event: event1, participantIdx: 2, seats: 1, daysAgo: 20, attended: false },
      { event: event1, participantIdx: 3, seats: 4, daysAgo: 15, attended: true },
      { event: event1, participantIdx: 4, seats: 2, daysAgo: 10, attended: false },
      { event: event1, participantIdx: 5, seats: 1, daysAgo: 7, attended: false },
      { event: event1, participantIdx: 6, seats: 3, daysAgo: 5, attended: false },
      { event: event1, participantIdx: 7, seats: 2, daysAgo: 2, attended: false },

      // Event 2: Bharat Rang (FREE) — 6 bookings
      { event: event2, participantIdx: 0, seats: 2, daysAgo: 26, attended: true },
      { event: event2, participantIdx: 2, seats: 3, daysAgo: 22, attended: true },
      { event: event2, participantIdx: 4, seats: 1, daysAgo: 18, attended: true },
      { event: event2, participantIdx: 6, seats: 2, daysAgo: 14, attended: false },
      { event: event2, participantIdx: 8, seats: 4, daysAgo: 8, attended: false },
      { event: event2, participantIdx: 9, seats: 1, daysAgo: 3, attended: false },

      // Event 3: Night Market (₹199) — 7 bookings
      { event: event3, participantIdx: 1, seats: 4, daysAgo: 24, attended: true },
      { event: event3, participantIdx: 3, seats: 2, daysAgo: 19, attended: true },
      { event: event3, participantIdx: 5, seats: 3, daysAgo: 16, attended: false },
      { event: event3, participantIdx: 7, seats: 1, daysAgo: 12, attended: false },
      { event: event3, participantIdx: 8, seats: 2, daysAgo: 9, attended: false },
      { event: event3, participantIdx: 9, seats: 5, daysAgo: 4, attended: false },
      { event: event3, participantIdx: 0, seats: 3, daysAgo: 1, attended: false },

      // Event 4: Silaa Jamming (₹299) — 5 bookings
      { event: event4, participantIdx: 2, seats: 2, daysAgo: 21, attended: true },
      { event: event4, participantIdx: 4, seats: 1, daysAgo: 17, attended: true },
      { event: event4, participantIdx: 6, seats: 3, daysAgo: 11, attended: false },
      { event: event4, participantIdx: 8, seats: 2, daysAgo: 6, attended: false },
      { event: event4, participantIdx: 0, seats: 1, daysAgo: 2, attended: false },

      // Event 5: Mumbai Symphony (₹1500) — 6 bookings
      { event: event5, participantIdx: 1, seats: 2, daysAgo: 27, attended: true },
      { event: event5, participantIdx: 3, seats: 1, daysAgo: 23, attended: true },
      { event: event5, participantIdx: 5, seats: 2, daysAgo: 13, attended: false },
      { event: event5, participantIdx: 7, seats: 3, daysAgo: 8, attended: false },
      { event: event5, participantIdx: 9, seats: 1, daysAgo: 4, attended: false },
      { event: event5, participantIdx: 0, seats: 2, daysAgo: 1, attended: false },

      // Event 6: TechSpark (FREE) — 5 bookings
      { event: event6, participantIdx: 2, seats: 1, daysAgo: 15, attended: false },
      { event: event6, participantIdx: 4, seats: 1, daysAgo: 12, attended: false },
      { event: event6, participantIdx: 6, seats: 2, daysAgo: 9, attended: false },
      { event: event6, participantIdx: 8, seats: 1, daysAgo: 5, attended: false },
      { event: event6, participantIdx: 0, seats: 1, daysAgo: 1, attended: false },

      // Event 7: Chennai Summit (₹499) — 4 bookings
      { event: event7, participantIdx: 1, seats: 2, daysAgo: 14, attended: false },
      { event: event7, participantIdx: 3, seats: 1, daysAgo: 10, attended: false },
      { event: event7, participantIdx: 5, seats: 3, daysAgo: 6, attended: false },
      { event: event7, participantIdx: 9, seats: 2, daysAgo: 3, attended: false },
    ];

    let bookingCount = 0;
    const paymentMethods = ['upi', 'card', 'netbanking'];

    for (const cfg of bookingConfigs) {
      bookingCount++;
      const p = participants[cfg.participantIdx];
      const evt = cfg.event;
      const bookingNumber = genBookingCode('IN', bookingCount);
      const verificationCode = `VERIFY-${bookingNumber}`;
      const ticketId = `TCK-${bookingNumber}-${Date.now().toString(36).toUpperCase()}`;
      const totalAmount = evt.ticketPrice * cfg.seats;

      const qrPayload = JSON.stringify({
        ticketId,
        bNo: bookingNumber,
        code: verificationCode,
        eId: evt._id,
        uId: p._id
      });
      const qrImage = await generateQRCode(qrPayload);

      // Set createdAt to daysAgo
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - cfg.daysAgo);
      // Add some hour randomness
      createdAt.setHours(Math.floor(Math.random() * 14) + 8);
      createdAt.setMinutes(Math.floor(Math.random() * 60));

      const booking = await Booking.create({
        bookingNumber,
        eventId: evt._id,
        event: evt._id,
        userId: p._id,
        user: p._id,
        seatsBooked: cfg.seats,
        ticketsCount: cfg.seats,
        unitPrice: evt.ticketPrice,
        totalAmount,
        paymentStatus: 'successful',
        paymentMethod: paymentMethods[bookingCount % paymentMethods.length],
        paymentId: `PAY-${bookingNumber}-${paymentMethods[bookingCount % paymentMethods.length].toUpperCase()}`,
        qrCodeData: qrImage,
        verificationCode,
        attended: cfg.attended,
        attendedAt: cfg.attended ? createdAt : null,
        attendeeName: p.name,
        attendeeEmail: p.email,
        attendeePhone: p.phone,
        bookingDate: createdAt,
        createdAt
      });

      // Direct MongoDB update for historical createdAt timestamp
      await Booking.collection.updateOne({ _id: booking._id }, { $set: { createdAt, bookingDate: createdAt } });

      // Create Ticket record
      const ticket = await Ticket.create({
        bookingId: booking._id,
        ticketId,
        qrCodeUrl: qrImage,
        isUsed: cfg.attended,
        scannedAt: cfg.attended ? createdAt : null,
        createdAt
      });
      await Ticket.collection.updateOne({ _id: ticket._id }, { $set: { createdAt } });

      // Decrement available seats
      evt.availableSeats -= cfg.seats;
      await evt.save();
    }

    // Create notifications for the first participant
    await Notification.create([
      { user: participants[0]._id, title: 'Booking Confirmed!', message: `Your ticket for "Shera India Tour" is confirmed.`, type: 'booking' },
      { user: participants[0]._id, title: 'Booking Confirmed!', message: `Your ticket for "Bharat Rang Mahotsav" is confirmed.`, type: 'booking' },
    ]);

    // Summary stats
    const totalBookings = bookingConfigs.length;
    const totalTickets = bookingConfigs.reduce((sum, c) => sum + c.seats, 0);
    const totalRevenue = bookingConfigs.reduce((sum, c) => sum + (c.event.ticketPrice * c.seats), 0);
    const attendedBookings = bookingConfigs.filter(c => c.attended).length;

    res.json({
      message: `Database seeded successfully with rich analytics data!`,
      summary: {
        users: `${participants.length} participants + 1 organizer + 1 admin = ${participants.length + 2} users`,
        events: `${allEvents.length} events across ${['Cultural', 'Food & Drinks', 'Technical', 'Workshop', 'Business'].length} categories`,
        bookings: `${totalBookings} bookings, ${totalTickets} total tickets`,
        revenue: `₹${totalRevenue.toLocaleString('en-IN')} total revenue`,
        attendance: `${attendedBookings} checked in via QR`
      },
      credentials: {
        admin: { email: 'admin123@gmail.com', password: 'admin123', role: 'admin' },
        organizer: { email: 'organizer123@gmail.com', password: 'organizer123', role: 'organizer' },
        participant: { email: 'participant@demo.com', password: 'user123', role: 'participant' }
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: error.message || 'Error seeding database' });
  }
});

export default router;
