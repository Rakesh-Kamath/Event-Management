import express from 'express';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users directory from MongoDB' });
  }
});

router.patch('/:id/toggle-block', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found in MongoDB' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block administrator account' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      isBlocked: user.isBlocked
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user block status' });
  }
});

router.patch('/:id/approve-organizer', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'organizer') {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    user.isApproved = true;
    await user.save();

    await Notification.create({
      user: user._id,
      title: 'Organizer Account Approved!',
      message: 'Your organizer account has been officially verified and approved. You can now publish public events.',
      type: 'system'
    });

    res.json({ message: 'Organizer approved successfully in MongoDB', user });
  } catch (error) {
    res.status(500).json({ message: 'Error approving organizer' });
  }
});

export default router;
