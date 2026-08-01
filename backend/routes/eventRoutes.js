import express from 'express';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      city, 
      location,
      type, 
      minPrice, 
      maxPrice,
      priceRange, 
      status,
      page = 1, 
      limit = 12 
    } = req.query;

    const query = {};
    query.status = status || 'approved';

    const searchTerm = search || (location && location !== 'All' ? location : undefined);
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { venueName: { $regex: searchTerm, $options: 'i' } },
        { 'venue.name': { $regex: searchTerm, $options: 'i' } },
        { 'venue.city': { $regex: searchTerm, $options: 'i' } },
        { city: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') query.category = category;
    
    const targetCity = city || location;
    if (targetCity && targetCity !== 'All') {
      query.$or = [
        { city: { $regex: targetCity, $options: 'i' } },
        { 'venue.city': { $regex: targetCity, $options: 'i' } }
      ];
    }

    if (type === 'free') query.ticketPrice = 0;
    if (type === 'paid') query.ticketPrice = { $gt: 0 };

    if (minPrice || maxPrice || priceRange) {
      if (priceRange === 'free') query.ticketPrice = 0;
      else if (priceRange === 'paid') query.ticketPrice = { $gt: 0 };
      else {
        query.ticketPrice = {};
        if (minPrice) query.ticketPrice.$gte = Number(minPrice);
        if (maxPrice) query.ticketPrice.$lte = Number(maxPrice);
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalEvents = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate({ path: 'organizerId', select: 'name organizationName email', strictPopulate: false })
      .populate({ path: 'organizer', select: 'name organizationName email', strictPopulate: false })
      .sort({ dateTime: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      events,
      page: Number(page),
      pages: Math.ceil(totalEvents / Number(limit)) || 1,
      totalEvents
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

router.get('/my-events', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { 
      $or: [{ organizerId: req.user._id }, { organizer: req.user._id }] 
    };
    const events = await Event.find(filter).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organizer events' });
  }
});

router.get('/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending' })
      .populate({ path: 'organizerId', select: 'name organizationName email', strictPopulate: false })
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending events' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({ path: 'organizerId', select: 'name organizationName email phone avatar', strictPopulate: false });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving event details' });
  }
});

router.post('/', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      venue,
      venueName,
      address,
      city,
      dateTime,
      ticketPrice,
      maxCapacity,
      totalCapacity,
      registrationDeadline,
      bannerUrl,
      speakers,
      schedule
    } = req.body;

    const capacity = maxCapacity || totalCapacity || 100;

    const eventVenue = typeof venue === 'object' ? venue : {
      name: venueName || venue || 'KTPO Trade Centre',
      address: address || 'Whitefield',
      city: city || 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pincode: '560066',
      location: { type: 'Point', coordinates: [77.5946, 12.9716] }
    };

    const event = await Event.create({
      title,
      description,
      category,
      organizerId: req.user._id,
      organizer: req.user._id,
      organizerName: req.user.organizationName || req.user.name,
      venue: eventVenue,
      venueName: eventVenue.name,
      address: eventVenue.address,
      city: eventVenue.city,
      dateTime,
      ticketPrice: Number(ticketPrice) || 0,
      maxCapacity: Number(capacity),
      totalCapacity: Number(capacity),
      availableSeats: Number(capacity),
      registrationDeadline: registrationDeadline || dateTime,
      bannerUrl: bannerUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300"><rect width="600" height="300" fill="%2318181b"/><text x="300" y="150" fill="%23ffffff" font-family="sans-serif" font-size="20" text-anchor="middle">INDIA EVENT</text></svg>',
      speakers: speakers || [],
      schedule: schedule || [],
      status: 'approved'
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error creating event' });
  }
});

router.put('/:id', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (req.user.role !== 'admin' && event.organizerId.toString() !== req.user._id.toString() && event.organizer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to edit this event' });
    }

    const {
      title,
      description,
      category,
      venue,
      dateTime,
      ticketPrice,
      maxCapacity,
      registrationDeadline,
      bannerUrl,
      schedule,
      speakers,
      isClosed
    } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (venue) {
      event.venue = venue;
      if (venue.name) event.venueName = venue.name;
      if (venue.city) event.city = venue.city;
      if (venue.address) event.address = venue.address;
    }
    if (dateTime) event.dateTime = dateTime;
    if (ticketPrice !== undefined) event.ticketPrice = Number(ticketPrice);
    if (registrationDeadline) event.registrationDeadline = registrationDeadline;
    if (bannerUrl) event.bannerUrl = bannerUrl;
    if (schedule) event.schedule = schedule;
    if (speakers) event.speakers = speakers;

    if (maxCapacity && Number(maxCapacity) !== event.maxCapacity) {
      const bookedCount = (event.maxCapacity || event.totalCapacity) - event.availableSeats;
      const newMax = Number(maxCapacity);
      event.maxCapacity = newMax;
      event.totalCapacity = newMax;
      event.availableSeats = Math.max(0, newMax - bookedCount);
    }

    if (isClosed !== undefined) {
      if (isClosed) {
        event.availableSeats = 0;
      } else if (event.availableSeats === 0) {
        const booked = (event.maxCapacity || 100) - event.availableSeats;
        event.availableSeats = Math.max(1, (event.maxCapacity || 100) - booked);
      }
    }

    await event.save();
    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating event' });
  }
});

const handleUpdateStatus = async (req, res) => {
  try {
    const { status, action } = req.body;
    const targetStatus = status || (action === 'approve' ? 'approved' : 'rejected');

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.status = targetStatus;
    await event.save();

    await Notification.create({
      user: event.organizerId || event.organizer,
      title: `Event ${targetStatus.toUpperCase()}`,
      message: `Your event "${event.title}" status has been updated to ${targetStatus}.`,
      type: 'update'
    });

    res.json({ message: `Event status updated to ${targetStatus}`, event });
  } catch (error) {
    res.status(500).json({ message: 'Error updating event status' });
  }
};

router.put('/admin/events/:id/status', protect, authorize('admin'), handleUpdateStatus);
router.put('/:id/status', protect, authorize('admin'), handleUpdateStatus);
router.patch('/:id/approve', protect, authorize('admin'), handleUpdateStatus);

router.patch('/:id/cancel', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.status = 'cancelled';
    await event.save();

    res.json({ message: 'Event cancelled successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling event' });
  }
});

export default router;
