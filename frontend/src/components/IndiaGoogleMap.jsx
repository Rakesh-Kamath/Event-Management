import React from 'react';
import { Navigation, MapPin, ExternalLink } from 'lucide-react';

export default function IndiaGoogleMap({ venueName, address, city, location }) {
  const fullAddress = `${venueName || ''}, ${address || ''}, ${city || 'Bengaluru'}, India`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="space-y-4">
      {/* Venue Address Details Card */}
      <div className="glass-card p-6 rounded-2xl border border-monochrome-800 bg-monochrome-900/80 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center flex-shrink-0 shadow-lg mt-0.5">
            <MapPin className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="space-y-1 flex-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-monochrome-400 block">
              Official Venue Address
            </span>
            <h4 className="text-base font-extrabold text-white leading-snug">
              {venueName || 'Venue Name'}
            </h4>
            <p className="text-xs text-monochrome-300 leading-relaxed font-mono">
              {address ? `${address}, ` : ''}{city || 'Bengaluru'}, India
            </p>
          </div>
        </div>

        {/* Action Link to Google Maps */}
        <div className="pt-3 border-t border-monochrome-800/80">
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-monochrome-200 transition-all flex items-center justify-center gap-2 shadow-xl group"
          >
            <Navigation className="w-4 h-4 fill-black group-hover:scale-110 transition-transform" />
            Open Location in Google Maps
            <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
}
