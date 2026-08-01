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
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group hover:border-white/40 transition-all duration-300">
      
      <div className="relative h-44 overflow-hidden bg-monochrome-900">
        <img 
          src={event.bannerUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300"><rect width="600" height="300" fill="%2318181b"/><text x="300" y="150" fill="%23ffffff" font-family="sans-serif" font-size="20" text-anchor="middle">INDIA EVENT</text></svg>'} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-monochrome-950 via-transparent to-transparent opacity-80" />
        
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/80 backdrop-blur-md text-white border border-white/20">
            {event.category}
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-tight shadow-md border ${
            isFree 
              ? 'bg-white text-black border-white' 
              : 'bg-black/90 text-white border-monochrome-700'
          }`}>
            {isFree ? 'FREE' : `₹${event.ticketPrice.toLocaleString('en-IN')}`}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          
          <div className="flex items-center text-[11px] text-monochrome-400 gap-1 font-mono">
            <Calendar className="w-3.5 h-3.5 text-white" />
            <span>{formattedDate} • {formattedTime}</span>
          </div>

          <h3 className="text-sm font-bold text-white group-hover:text-monochrome-200 transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>

          <div className="flex items-center text-[11px] text-monochrome-400 gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-monochrome-500 flex-shrink-0" />
            <span className="truncate">{venueName}, {city}</span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-monochrome-800/80 flex items-center justify-between">
          
          <div className="flex items-center gap-1 text-[11px]">
            <Users className="w-3.5 h-3.5 text-monochrome-400" />
            {isSoldOut ? (
              <span className="text-[11px] font-semibold text-red-400 font-mono">SOLD OUT</span>
            ) : (
              <span className="text-monochrome-300 font-mono text-[10px]">
                <strong className="text-white">{event.availableSeats}</strong> seats left
              </span>
            )}
          </div>

          <Link
            to={`/events/${event._id}`}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-monochrome-900 group-hover:bg-white group-hover:text-black text-white border border-monochrome-700 transition-all duration-200"
          >
            {isSoldOut ? 'View Details' : 'Book Ticket'}
          </Link>
        </div>
      </div>
    </div>
  );
}
