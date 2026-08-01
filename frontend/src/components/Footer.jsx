import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-monochrome-900 bg-monochrome-950 text-monochrome-400 text-xs py-3.5 mt-auto">
      <div className="w-full px-3 sm:px-5 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        <div className="flex items-center">
          <span className="font-black text-sm tracking-wider uppercase bg-gradient-to-r from-white via-monochrome-200 to-monochrome-400 bg-clip-text text-transparent font-sans">
            Evently
          </span>
        </div>

        <div className="flex items-center space-x-5 text-monochrome-400 text-xs">
          <Link to="/" className="hover:text-white transition-colors">Discover Events</Link>
          <Link to="/my-bookings" className="hover:text-white transition-colors">My Tickets</Link>
          <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
        </div>

        <div className="text-monochrome-500 font-mono text-[10px]">
          © {new Date().getFullYear()} Evently. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
