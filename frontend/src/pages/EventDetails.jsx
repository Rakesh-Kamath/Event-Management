import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, User, Clock, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import IndiaGoogleMap from '../components/IndiaGoogleMap';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await axios.get(`/api/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        console.error('Error fetching event details');
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen max-w-[1600px] mx-auto px-3 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 px-4 py-2 bg-white text-black rounded-lg text-xs font-bold"
        >
          Return to Events
        </button>
      </div>
    );
  }

  const formattedDate = new Date(event.dateTime).toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = new Date(event.dateTime).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const isSoldOut = event.availableSeats <= 0;
  const isFree = event.ticketPrice === 0;

  const venueName = event.venue?.name || event.venueName || event.venue || 'Venue';
  const address = event.venue?.address || event.address || 'Address';
  const city = event.venue?.city || event.city || 'Bengaluru';
  const location = event.venue?.location || { type: 'Point', coordinates: [77.5946, 12.9716] };

  return (
    <div className="min-h-screen pb-10 space-y-6">
      
      {/* Top Navigation */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-mono text-monochrome-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events Catalog
        </button>
      </div>

      {/* Hero Banner Header */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5">
        <div className="relative h-[380px] md:h-[480px] rounded-3xl overflow-hidden border border-monochrome-800 shadow-2xl">
          <img
            src={event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-monochrome-950 via-monochrome-950/60 to-transparent" />
          
          {/* Floating Badges */}
          <div className="absolute top-6 left-6 flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-black/80 backdrop-blur-md text-white border border-white/20">
              {event.category}
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold font-mono bg-white text-black shadow-lg">
              {isFree ? 'FREE ENTRY' : `₹${event.ticketPrice} / TICKET`}
            </span>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-8 left-8 right-8 space-y-3">
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight max-w-4xl leading-tight">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs md:text-sm text-monochrome-300 font-mono">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white" />
                <span>{formattedDate} • {formattedTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-white" />
                <span>{venueName}, {city}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Grid) */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Description, Speakers, Schedule, Google Map */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Event */}
          <section className="glass-panel p-8 rounded-3xl space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight">About This Event</h3>
            <p className="text-monochrome-300 text-sm leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </section>

          {/* Keynote Speakers */}
          {event.speakers && event.speakers.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight">Keynote Speakers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.speakers.map((sp, idx) => (
                  <div key={idx} className="glass-panel p-5 rounded-2xl flex items-center gap-4 border border-monochrome-800">
                    <img
                      src={sp.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop'}
                      alt={sp.name}
                      className="w-14 h-14 rounded-full object-cover border border-monochrome-700"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{sp.name}</h4>
                      <p className="text-xs text-monochrome-400 font-mono">{sp.title}</p>
                      {sp.bio && <p className="text-[11px] text-monochrome-500 mt-1 line-clamp-2">{sp.bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Event Schedule */}
          {event.schedule && event.schedule.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight">Agenda & Schedule</h3>
              <div className="glass-panel p-6 rounded-3xl divide-y divide-monochrome-800">
                {event.schedule.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                    <div className="w-24 font-mono text-xs font-bold text-white flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                      <Clock className="w-3.5 h-3.5 text-monochrome-400" />
                      {item.time}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">{item.topic}</h5>
                      {item.speaker && <p className="text-xs text-monochrome-400 mt-0.5">Speaker: {item.speaker}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interactive Google Map & Location Section */}
          <section className="glass-panel p-8 rounded-3xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Venue & Location</h3>
                <p className="text-white font-bold text-sm mt-1">{venueName}</p>
                <p className="text-xs text-monochrome-400">{address}, {city}, India</p>
              </div>

              <span className="text-[10px] font-mono bg-monochrome-900 border border-monochrome-700 text-monochrome-300 px-2.5 py-1 rounded">
                GeoJSON 2dsphere Point
              </span>
            </div>

            {/* Interactive India Google Map & Get Directions */}
            <IndiaGoogleMap
              venueName={venueName}
              address={address}
              city={city}
              location={location}
            />
          </section>
        </div>

        {/* Right Column: Ticket Reservation Widget */}
        <div className="space-y-6">
          <div className="sticky top-24 glass-card p-6 rounded-3xl border border-monochrome-700 shadow-2xl space-y-6">
            
            <div className="border-b border-monochrome-800 pb-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-monochrome-400">TICKET RESERVATION</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {isFree ? 'FREE' : `₹${event.ticketPrice}`}
                </span>
                <span className="text-xs text-monochrome-400">per person</span>
              </div>
            </div>

            {/* Remaining Seats Counter */}
            <div className="p-4 rounded-xl bg-monochrome-900 border border-monochrome-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-monochrome-400">Remaining Capacity</span>
                <span className="font-mono font-bold text-white">
                  {event.availableSeats} / {event.maxCapacity || event.totalCapacity} Seats
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-monochrome-950 overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${Math.round((((event.maxCapacity || event.totalCapacity) - event.availableSeats) / (event.maxCapacity || event.totalCapacity)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Organizer Info */}
            <div className="p-4 rounded-xl bg-monochrome-900/60 border border-monochrome-800 flex items-center gap-3">
              <User className="w-5 h-5 text-monochrome-400" />
              <div>
                <span className="text-[10px] text-monochrome-500 font-mono block">Hosted by</span>
                <span className="text-xs font-bold text-white">{event.organizerName || 'Event Host'}</span>
              </div>
            </div>

            {/* Reserve CTA */}
            {isSoldOut ? (
              <button 
                disabled 
                className="w-full py-3.5 rounded-xl bg-monochrome-900 text-red-400 font-bold text-xs border border-red-900 cursor-not-allowed"
              >
                Registration Closed (Sold Out)
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                  } else {
                    setShowBookingModal(true);
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-monochrome-200 transition-all shadow-xl flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                {user ? 'Book Tickets Now' : 'Sign In to Reserve Ticket'}
              </button>
            )}

            <p className="text-[11px] text-monochrome-500 text-center font-mono">
              Digital QR pass & printable B&W PDF receipt included.
            </p>
          </div>
        </div>

      </div>

      {/* Booking Checkout Modal */}
      {showBookingModal && (
        <BookingModal
          event={event}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setEvent(prev => ({
              ...prev,
              availableSeats: Math.max(0, prev.availableSeats - 1)
            }));
          }}
        />
      )}

    </div>
  );
}
