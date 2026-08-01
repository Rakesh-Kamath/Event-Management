import express from 'express';
import Category from '../models/Category.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route GET /api/categories
// @desc Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// @route POST /api/categories (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, icon, description, image } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-0]+/g, '-');
    const category = await Category.create({ name, slug, icon, description, image });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error creating category' });
  }
});

export default router;
