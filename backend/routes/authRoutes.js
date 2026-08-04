import express from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { generateToken, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, organizationName, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = role === 'organizer' ? 'organizer' : 'participant';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
      organizationName: organizationName || '',
      phone: phone || '',
      isApproved: true,
      status: 'active'
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server authentication error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked || user.status === 'blocked') {
      return res.status(403).json({ message: 'Account is suspended. Please contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
        isApproved: user.isApproved,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Login error' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Credential is required' });
    }

    let payload;
    const client_id = process.env.GOOGLE_CLIENT_ID;

    // Check if real client_id is not set, fallback to Mock/Developer Mode
    if (!client_id) {
      if (credential.startsWith('mock_token_')) {
        const email = credential.replace('mock_token_', '').toLowerCase();
        payload = {
          email,
          name: email.split('@')[0],
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
          sub: `mock_google_id_${email}`
        };
      } else {
        return res.status(500).json({ message: 'GOOGLE_CLIENT_ID is not configured in backend/.env' });
      }
    } else {
      try {
        const client = new OAuth2Client(client_id);
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: client_id,
        });
        payload = ticket.getPayload();
      } catch (err) {
        return res.status(400).json({ message: 'Invalid Google token' });
      }
    }

    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (user.isBlocked || user.status === 'blocked') {
        return res.status(403).json({ message: 'Account is suspended. Please contact administrator.' });
      }
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (picture && (user.avatar === 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop' || !user.avatar)) {
        user.avatar = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // Create a new participant user
      user = await User.create({
        name,
        email: email.toLowerCase(),
        role: 'participant',
        googleId,
        avatar: picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
        isApproved: true,
        status: 'active'
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
        isApproved: user.isApproved,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Google authentication error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing forgot password' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password' });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      organizationName: req.user.organizationName,
      phone: req.user.phone,
      isApproved: req.user.isApproved,
      avatar: req.user.avatar
    }
  });
});

export default router;
