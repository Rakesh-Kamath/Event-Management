import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true },
  icon: { type: String, default: 'Calendar' },
  description: { type: String, default: '' },
  image: { type: String, default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop' }
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
