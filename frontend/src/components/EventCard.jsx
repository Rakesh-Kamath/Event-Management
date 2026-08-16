import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';

export default function EventCard({ event }) {
  const formattedDate = new Date(event.dateTime).toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
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
  const city = event.venue?.city || event.city || 'Bengaluru';

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group transition-all duration-300">

      <div className="relative h-44 overflow-hidden bg-monochrome-800">
        <img
          src={event.bannerUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300"><rect width="600" height="300" fill="%23F2F2F5"/><text x="300" y="150" fill="%23555770" font-family="sans-serif" font-size="20" text-anchor="middle">INDIA EVENT</text></svg>'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-monochrome-950/20 via-transparent to-transparent opacity-40" />

        <div className="absolute top-2.5 left-2.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 backdrop-blur-md text-brand border border-brand/10 uppercase shadow-sm">
            {event.category}
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-tight shadow-sm border ${isFree
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'bg-brand text-white border-brand shadow shadow-brand/20'
            }`}>
            {isFree ? 'FREE' : `₹${event.ticketPrice.toLocaleString('en-IN')}`}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">

          <div className="flex items-center text-[11px] text-monochrome-500 gap-1 font-mono">
            <Calendar className="w-3.5 h-3.5 text-brand" />
            <span>{formattedDate} • {formattedTime}</span>
          </div>

          <h3 className="text-sm font-bold text-monochrome-100 group-hover:text-brand transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>

          <div className="flex items-center text-[11px] text-monochrome-500 gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-brand flex-shrink-0" />
            <span className="truncate">{venueName}, {city}</span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-monochrome-700 flex items-center justify-between">

          <div className="flex items-center gap-1 text-[11px]">
            <Users className="w-3.5 h-3.5 text-monochrome-500" />
            {isSoldOut ? (
              <span className="text-[11px] font-semibold text-red-500 font-mono">SOLD OUT</span>
            ) : (
              <span className="text-monochrome-500 font-mono text-[10px]">
                <strong className="text-monochrome-100">{event.availableSeats}</strong> seats left
              </span>
            )}
          </div>

          <Link
            to={`/events/${event._id}`}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all duration-200 ${
              isSoldOut
                ? 'bg-monochrome-800 text-monochrome-500 border-monochrome-700 cursor-not-allowed'
                : 'bg-brand text-white border-brand hover:bg-brand-hover hover:border-brand-hover shadow-sm shadow-brand/10'
            }`}
          >
            {isSoldOut ? 'View Details' : 'Book Ticket'}
          </Link>
        </div>
      </div>
    </div>
  );
}
