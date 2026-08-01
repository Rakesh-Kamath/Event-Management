import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  ticketId: { type: String, required: true, unique: true, index: true },
  qrCodeUrl: { type: String, required: true },
  isUsed: { type: Boolean, default: false },
  scannedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
