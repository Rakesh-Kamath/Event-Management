import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingNumber: { type: String, required: true, unique: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // Alias for frontend populate compatibility
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Alias for frontend populate compatibility
  seatsBooked: { type: Number, required: true, default: 1 },
  ticketsCount: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'successful', 'failed', 'refunded'], 
    default: 'successful' 
  },
  paymentMethod: { type: String, default: 'card' },
  paymentId: { type: String, required: true },
  qrCodeData: { type: String },
  verificationCode: { type: String },
  attended: { type: Boolean, default: false },
  attendedAt: { type: Date, default: null },
  attendeeName: { type: String },
  attendeeEmail: { type: String },
  attendeePhone: { type: String },
  bookingDate: { type: Date, default: Date.now }
}, { timestamps: true });

bookingSchema.index({ eventId: 1 });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ event: 1 });
bookingSchema.index({ user: 1 });

// Pre-save hook to populate aliases
bookingSchema.pre('save', function (next) {
  if (!this.event) this.event = this.eventId;
  if (!this.user) this.user = this.userId;
  if (!this.ticketsCount) this.ticketsCount = this.seatsBooked;
  next();
});

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
