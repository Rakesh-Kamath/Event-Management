import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-monochrome-700 bg-monochrome-950 text-monochrome-500 text-xs py-5 mt-auto">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 flex flex-col md:flex-row items-center justify-between gap-4">

        <div className="flex items-center">
          <span className="font-black text-sm tracking-wider uppercase text-brand font-sans">
            Evently
          </span>
        </div>

        <div className="flex items-center space-x-6 text-monochrome-200 text-xs font-semibold">
          <Link to="/" className="hover:text-brand transition-colors">Discover Events</Link>
          <Link to="/my-bookings" className="hover:text-brand transition-colors">My Tickets</Link>
          <Link to="/login" className="hover:text-brand transition-colors">Sign In</Link>
        </div>

        <div className="text-monochrome-500 font-mono text-[10px]">
          © {new Date().getFullYear()} Evently. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
