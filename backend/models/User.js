import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['participant', 'organizer', 'admin'], 
    default: 'participant' 
  },
  organizationName: { type: String, default: '' },
  phone: { type: String, default: '' },
  isApproved: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  isBlocked: { type: Boolean, default: false },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
