import bcrypt from 'bcryptjs';
import { generateQRCode } from './qrHelper.js';

// In-Memory fallback store when MongoDB service is not running on localhost
class MemoryStore {
  constructor() {
    this.users = [];
    this.categories = [];
    this.events = [];
    this.bookings = [];
    this.notifications = [];
    this.isInitialized = false;
  }

  async seedDefaults() {
    if (this.isInitialized) return;
    
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const orgPass = await bcrypt.hash('org123', salt);
    const userPass = await bcrypt.hash('user123', salt);

    const admin = {
      _id: 'usr_admin_1',
      name: 'System Administrator',
      email: 'admin@eventmaster.com',
      password: adminPass,
      role: 'admin',
      isApproved: true,
      createdAt: new Date()
    };

    const organizer = {
      _id: 'usr_org_1',
      name: 'Elena Rostova',
      email: 'organizer@techsummit.com',
      password: orgPass,
      role: 'organizer',
      organizationName: 'Monochrome Tech Ventures',
      phone: '+1 (555) 234-5678',
      isApproved: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop',
      createdAt: new Date()
    };

    const participant = {
      _id: 'usr_part_1',
      name: 'Marcus Vance',
      email: 'participant@demo.com',
      password: userPass,
      role: 'participant',
      phone: '+1 (555) 987-6543',
      isApproved: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop',
      createdAt: new Date()
    };

    this.users = [admin, organizer, participant];

    this.categories = [
      { _id: 'cat_1', name: 'Technical', slug: 'technical', icon: 'Code', description: 'Tech summits, hackathons & developer conferences', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop' },
      { _id: 'cat_2', name: 'Cultural', slug: 'cultural', icon: 'Music', description: 'Music festivals, art galas & live performances', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop' },
      { _id: 'cat_3', name: 'Workshop', slug: 'workshop', icon: 'BookOpen', description: 'Interactive masterclasses & skill bootcamps', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop' },
      { _id: 'cat_4', name: 'Sports', slug: 'sports', icon: 'Activity', description: 'Marathons, tournaments & fitness expos', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop' },
      { _id: 'cat_5', name: 'Business', slug: 'business', icon: 'Briefcase', description: 'Executive forums & networking', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop' }
    ];

    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const futureDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const event1 = {
      _id: 'evt_1',
      title: 'Global AI & Web Architecture Summit 2026',
      description: 'Join world-renowned engineers, architects, and AI pioneers for an exclusive two-day deep dive into next-generation cloud infrastructure, autonomous agents, and reactive web applications.',
      category: 'Technical',
      organizer: organizer._id,
      organizerName: organizer.organizationName,
      venueName: 'The Metropolitan Grand Hall',
      address: '750 Fifth Avenue',
      city: 'New York',
      dateTime: futureDate1,
      ticketPrice: 299,
      totalCapacity: 500,
      availableSeats: 418,
      status: 'approved',
      bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop',
      speakers: [
        { name: 'Dr. Sarah Jenkins', title: 'Principal AI Researcher', bio: 'Expert in neural synthesis.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop' }
      ],
      schedule: [
        { time: '09:00 AM', topic: 'Keynote: Autonomous Agents in 2026', speaker: 'Dr. Sarah Jenkins' }
      ],
      createdAt: new Date()
    };

    const event2 = {
      _id: 'evt_2',
      title: 'Monochrome Jazz & Symphony Gala',
      description: 'An evening of breathtaking acoustics, live classical improvisations, and contemporary jazz performed by top international quartets.',
      category: 'Cultural',
      organizer: organizer._id,
      organizerName: organizer.organizationName,
      venueName: 'Symphony Center Auditorium',
      address: '220 S Michigan Ave',
      city: 'Chicago',
      dateTime: futureDate2,
      ticketPrice: 85,
      totalCapacity: 300,
      availableSeats: 150,
      status: 'approved',
      bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop',
      speakers: [],
      schedule: [],
      createdAt: new Date()
    };

    this.events = [event1, event2];

    const bookingCode = 'EVT-X78901';
    const verifyCode = `VERIFY-${bookingCode}-DEMO2026`;
    const qrPayload = JSON.stringify({
      bNo: bookingCode,
      code: verifyCode,
      eId: event1._id,
      uId: participant._id
    });
    const qrImage = await generateQRCode(qrPayload);

    this.bookings = [
      {
        _id: 'bk_1',
        bookingNumber: bookingCode,
        user: participant,
        event: event1,
        ticketsCount: 2,
        unitPrice: 299,
        totalAmount: 598,
        paymentStatus: 'successful',
        paymentMethod: 'card',
        paymentId: 'PAY-981237-DEMO',
        qrCodeData: qrImage,
        verificationCode: verifyCode,
        attended: false,
        attendedAt: null,
        attendeeName: participant.name,
        attendeeEmail: participant.email,
        attendeePhone: participant.phone,
        createdAt: new Date()
      }
    ];

    this.isInitialized = true;
  }
}

export const memoryStore = new MemoryStore();
