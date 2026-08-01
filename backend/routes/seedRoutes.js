import express from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
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

// @route POST /api/seed
// @desc Seed MongoDB Atlas database with official Admin & Organizer accounts
router.post('/', async (req, res) => {
  try {
    const imgParmishPune = getBase64Image('media__1785611696548.jpg');
    const imgBharatRangDelhi = getBase64Image('media__1785611696562.jpg');
    const imgBengaluruNightMarket = getBase64Image('media__1785611696580.jpg');
    const imgSilaaJammingHyd = getBase64Image('media__1785611696668.jpg');
    const imgMumbaiSymphony = getBase64Image('media__1785611696688.jpg');

    await User.deleteMany({});
    await Category.deleteMany({});
    await Event.deleteMany({});
    await Booking.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const orgPass = await bcrypt.hash('organizer123', salt);
    const userPass = await bcrypt.hash('user123', salt);

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

    const participant = await User.create({
      name: 'Aarav Patel',
      email: 'participant@demo.com',
      password: userPass,
      role: 'participant',
      phone: '+91 91234 56789',
      isApproved: true
    });

    await Category.insertMany([
      { name: 'Cultural', slug: 'cultural', icon: 'Music', description: 'Music concerts, drama festivals & live performances', image: imgMumbaiSymphony },
      { name: 'Food & Drinks', slug: 'food-drinks', icon: 'Utensils', description: 'Night markets, food festivals & culinary popups', image: imgBengaluruNightMarket },
      { name: 'Technical', slug: 'technical', icon: 'Code', description: 'Tech expos, hackathons & summits', image: imgBharatRangDelhi },
      { name: 'Workshop', slug: 'workshop', icon: 'BookOpen', description: 'Masterclasses & interactive jamming', image: imgSilaaJammingHyd },
      { name: 'Sports', slug: 'sports', icon: 'Activity', description: 'Marathons & fitness expos', image: imgParmishPune }
    ]);

    // Event 1: Parmish Verma Pune Concert
    const event1 = await Event.create({
      title: 'Shera India Tour ft. Parmish Verma',
      description: 'Punjabi superstar Parmish Verma brings his Shera India Tour to Pune with a festival-scale concert featuring chart-topping hits, massive visuals, surprise acts, and high-energy Punjabi music.',
      category: 'Cultural',
      organizerId: organizer._id,
      organizerName: 'Experience Entertainment',
      venue: {
        name: 'Xclusive Club and Kitchen',
        address: 'Viman Nagar, Pune',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        pincode: '411014',
        location: { type: 'Point', coordinates: [73.9143, 18.5679] }
      },
      venueName: 'Xclusive Club and Kitchen, Pune',
      address: 'Viman Nagar',
      city: 'Pune',
      dateTime: new Date('2026-06-14T19:00:00.000Z'),
      ticketPrice: 1299,
      maxCapacity: 1500,
      totalCapacity: 1500,
      availableSeats: 1240,
      status: 'approved',
      bannerUrl: imgParmishPune,
      speakers: [{ name: 'Parmish Verma', title: 'Headliner Artist', bio: 'Punjabi Music Superstar & Actor' }]
    });

    // Event 2: 25th Bharat Rang Mahotsav 2026 (Delhi)
    const event2 = await Event.create({
      title: '25th Bharat Rang Mahotsav 2026',
      description: 'Asia\'s largest international theatre festival organized by National School of Drama under Ministry of Culture, Govt of India. Featuring global theatrical masterclasses, folk performances, and contemporary drama.',
      category: 'Cultural',
      organizerId: organizer._id,
      organizerName: 'National School of Drama',
      venue: {
        name: 'National School of Drama',
        address: 'Bahawalpur House, Bhagwan Das Road, Mandi House',
        city: 'Delhi NCR',
        state: 'Delhi',
        country: 'India',
        pincode: '110001',
        location: { type: 'Point', coordinates: [77.2315, 28.6252] }
      },
      venueName: 'National School of Drama, Mandi House',
      address: 'Mandi House',
      city: 'Delhi NCR',
      dateTime: new Date('2026-02-10T18:00:00.000Z'),
      ticketPrice: 0,
      maxCapacity: 2000,
      totalCapacity: 2000,
      availableSeats: 1650,
      status: 'approved',
      bannerUrl: imgBharatRangDelhi
    });

    // Event 3: Bengaluru Night Market
    const event3 = await Event.create({
      title: 'Bengaluru Night Market - Stay Lit',
      description: '12 Hours. One Market. Endless Experiences. Featuring craft drinks, gourmet food, live music, curated vintage finds, artisan workshops, pet friendly zones, and kids entertainment from 12 Noon to 12 Midnight.',
      category: 'Food & Drinks',
      organizerId: organizer._id,
      organizerName: 'Essensai Events',
      venue: {
        name: 'Essensai 067',
        address: 'Indiranagar 100ft Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        pincode: '560038',
        location: { type: 'Point', coordinates: [77.6412, 12.9716] }
      },
      venueName: 'Essensai 067, Bengaluru',
      address: 'Indiranagar 100ft Road',
      city: 'Bengaluru',
      dateTime: new Date('2026-07-11T12:00:00.000Z'),
      ticketPrice: 199,
      maxCapacity: 3000,
      totalCapacity: 3000,
      availableSeats: 2450,
      status: 'approved',
      bannerUrl: imgBengaluruNightMarket
    });

    // Event 4: Silaa Thursday Telugu & Hindi Jamming (Hyderabad)
    const event4 = await Event.create({
      title: 'Silaa Thursday Telugu & Hindi Jamming',
      description: 'Live Music. Real Vibes! An open-air acoustic jamming night featuring soulful Telugu and Hindi hit melodies under the stars at Silaa Garden Cafe in Jubilee Hills.',
      category: 'Cultural',
      organizerId: organizer._id,
      organizerName: 'Silaa Garden Collective',
      venue: {
        name: 'Silaa The Garden Cafe',
        address: 'Road No. 36, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        pincode: '500033',
        location: { type: 'Point', coordinates: [78.4071, 17.4319] }
      },
      venueName: 'Silaa The Garden Cafe, Jubilee Hills',
      address: 'Jubilee Hills',
      city: 'Hyderabad',
      dateTime: new Date('2026-07-23T20:00:00.000Z'),
      ticketPrice: 299,
      maxCapacity: 350,
      totalCapacity: 350,
      availableSeats: 280,
      status: 'approved',
      bannerUrl: imgSilaaJammingHyd
    });

    // Event 5: Mumbai Symphony & Classical & Jazz Night
    const event5 = await Event.create({
      title: 'Mumbai Symphony & Classical & Jazz Night',
      description: 'A grand fusion of orchestral magnificence and vibrant jazz rhythms featuring The Bombay Chamber Orchestra, Midnight Blue Jazz Collective, and special guest vocalist Priya Sharma live at NCPA Mumbai.',
      category: 'Cultural',
      organizerId: organizer._id,
      organizerName: 'Symphony & Jazz Night Mumbai',
      venue: {
        name: 'The Jamshed Bhabha Theatre, NCPA',
        address: 'NCPA Marg, Nariman Point',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400021',
        location: { type: 'Point', coordinates: [72.8208, 18.9248] }
      },
      venueName: 'The Jamshed Bhabha Theatre, NCPA',
      address: 'Nariman Point',
      city: 'Mumbai',
      dateTime: new Date('2026-11-16T19:00:00.000Z'),
      ticketPrice: 1500,
      maxCapacity: 1000,
      totalCapacity: 1000,
      availableSeats: 820,
      status: 'approved',
      bannerUrl: imgMumbaiSymphony,
      speakers: [
        { name: 'The Bombay Chamber Orchestra', title: 'Orchestral Ensemble' },
        { name: 'The Midnight Blue Jazz Collective', title: 'Jazz Ensemble' },
        { name: 'Priya Sharma', title: 'Special Guest Vocalist' }
      ]
    });

    const bookingCode = 'EVT-IN78901';
    const verifyCode = `VERIFY-${bookingCode}-INDIA2026`;
    const qrPayload = JSON.stringify({ bNo: bookingCode, code: verifyCode, eId: event5._id, uId: participant._id });
    const qrImage = await generateQRCode(qrPayload);

    await Booking.create({
      bookingNumber: bookingCode,
      eventId: event5._id,
      event: event5._id,
      userId: participant._id,
      user: participant._id,
      seatsBooked: 2,
      ticketsCount: 2,
      unitPrice: 1500,
      totalAmount: 3000,
      paymentStatus: 'successful',
      paymentMethod: 'upi',
      paymentId: 'PAY-IN981237-UPI',
      qrCodeData: qrImage,
      verificationCode: verifyCode,
      attendeeName: participant.name,
      attendeeEmail: participant.email,
      attendeePhone: participant.phone
    });

    res.json({
      message: 'MongoDB Atlas database seeded with admin & organizer accounts!',
      credentials: {
        admin: { email: 'admin123@gmail.com', password: 'admin123', role: 'admin' },
        organizer: { email: 'organizer123@gmail.com', password: 'organizer123', role: 'organizer' }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error seeding database' });
  }
});

export default router;
