import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true,
    default: [77.5946, 12.9716]
  }
});

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true, default: 'Bengaluru' },
  state: { type: String, default: 'Karnataka' },
  country: { type: String, default: 'India' },
  pincode: { type: String, default: '560001' },
  location: { type: locationSchema, required: true, default: () => ({ type: 'Point', coordinates: [77.5946, 12.9716] }) }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  bannerUrl: { 
    type: String, 
    default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop' 
  },
  venue: { type: venueSchema, required: true },
  venueName: { type: String },
  city: { type: String, default: 'Bengaluru' },
  address: { type: String },
  dateTime: { type: Date, required: true },
  ticketPrice: { type: Number, required: true, default: 0 },
  maxCapacity: { type: Number, required: true },
  totalCapacity: { type: Number },
  availableSeats: { type: Number, required: true },
  registrationDeadline: { type: Date },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organizerName: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'cancelled'], 
    default: 'pending' 
  },
  speakers: [{ name: String, title: String, bio: String, image: String }],
  schedule: [{ time: String, topic: String, speaker: String }]
}, { timestamps: true });

eventSchema.index({ 'venue.location': '2dsphere' });
eventSchema.index({ status: 1, category: 1, dateTime: 1 });
eventSchema.index({ status: 1, city: 1, dateTime: 1 });
eventSchema.index({ status: 1, dateTime: 1 });
eventSchema.index({ title: 'text', description: 'text' });

eventSchema.pre('save', function (next) {
  if (!this.organizer) {
    this.organizer = this.organizerId;
  }
  if (!this.organizerId) {
    this.organizerId = this.organizer;
  }
  if (this.maxCapacity && !this.totalCapacity) {
    this.totalCapacity = this.maxCapacity;
  }
  if (this.venue) {
    if (this.venue.name) this.venueName = this.venue.name;
    if (this.venue.city) this.city = this.venue.city;
    if (this.venue.address) this.address = this.venue.address;
  }
  next();
});

export default mongoose.models.Event || mongoose.model('Event', eventSchema);
