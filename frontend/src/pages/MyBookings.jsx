import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, QrCode, Download, ShieldCheck, Search, AlertCircle } from 'lucide-react';
import axios from 'axios';
import BwPdfTicket from '../components/BwPdfTicket';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activePdfBooking, setActivePdfBooking] = useState(null);
  const [activeQrModalBooking, setActiveQrModalBooking] = useState(null);

  const fetchMyBookings = async () => {
    try {
      const res = await axios.get('/api/bookings/my-bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching my bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const filteredBookings = bookings.filter(b => {
    const title = b.event?.title || '';
    const number = b.bookingNumber || '';
    return title.toLowerCase().includes(search.toLowerCase()) || number.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 py-6 space-y-5">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-monochrome-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Ticket Passes</h1>
          <p className="text-xs text-monochrome-400 font-mono mt-1">
            Manage your booked events, view digital QR tickets, and download Black & White printable PDF tickets.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-monochrome-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event title or ticket ID..."
            className="pl-9 pr-4 py-2 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white text-xs font-mono focus:outline-none w-64"
          />
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-monochrome-400 font-mono">Loading your tickets...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl border border-monochrome-800 space-y-4">
          <Ticket className="w-12 h-12 text-monochrome-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Tickets Found</h3>
          <p className="text-xs text-monochrome-400 max-w-sm mx-auto">
            You haven't booked any event tickets yet or no tickets match your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((b) => {
            const event = b.event || {};
            const eventDate = event.dateTime ? new Date(event.dateTime).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
            }) : 'TBD';

            return (
              <div key={b._id} className="glass-card rounded-2xl p-6 border border-monochrome-800 flex flex-col justify-between space-y-6">
                
                <div className="space-y-4">
                  {/* Top Bar: Booking ID & Status */}
                  <div className="flex justify-between items-center pb-3 border-b border-monochrome-800">
                    <span className="font-mono text-xs font-bold text-white bg-monochrome-900 border border-monochrome-700 px-2.5 py-1 rounded">
                      ID: {b.bookingNumber}
                    </span>

                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                      {b.paymentStatus}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="flex gap-4">
                    <img
                      src={event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&auto=format&fit=crop'}
                      alt={event.title}
                      className="w-20 h-20 rounded-xl object-cover border border-monochrome-700 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-base leading-snug line-clamp-1">
                        {event.title || 'Event Title'}
                      </h3>
                      <div className="flex items-center text-xs text-monochrome-400 gap-1.5 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-white" />
                        <span>{eventDate}</span>
                      </div>
                      <div className="flex items-center text-xs text-monochrome-400 gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-monochrome-500" />
                        <span>{event.venueName}, {event.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Meta */}
                  <div className="p-3 rounded-xl bg-monochrome-900/80 border border-monochrome-800 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-monochrome-500 text-[10px] block">Attendee</span>
                      <span className="text-white font-bold truncate block">{b.attendeeName}</span>
                    </div>
                    <div>
                      <span className="text-monochrome-500 text-[10px] block">Passes</span>
                      <span className="text-white font-bold">{b.ticketsCount} Ticket(s)</span>
                    </div>
                  </div>
                </div>

                {/* Actions: Digital QR & B&W PDF */}
                <div className="pt-4 border-t border-monochrome-800 flex gap-3">
                  <button
                    onClick={() => setActiveQrModalBooking(b)}
                    className="flex-1 py-2.5 rounded-xl bg-monochrome-900 hover:bg-monochrome-800 text-white text-xs font-semibold border border-monochrome-700 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    Digital QR
                  </button>

                  <button
                    onClick={() => setActivePdfBooking(b)}
                    className="flex-1 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-monochrome-200 flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    Download B&W PDF Ticket
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* QR Modal */}
      {activeQrModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-monochrome-950 border border-monochrome-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="font-bold text-white text-base">Digital QR Code Pass</h3>
            <p className="text-xs text-monochrome-400 font-mono">Ticket # {activeQrModalBooking.bookingNumber}</p>
            
            {activeQrModalBooking.qrCodeData && (
              <img
                src={activeQrModalBooking.qrCodeData}
                alt="QR Code"
                className="w-48 h-48 mx-auto border-2 border-white p-2 bg-white rounded-xl shadow-2xl"
              />
            )}

            <button
              onClick={() => setActiveQrModalBooking(null)}
              className="w-full py-2 bg-monochrome-800 text-white rounded-lg text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* B&W PDF Printable Ticket Component */}
      {activePdfBooking && (
        <BwPdfTicket
          booking={activePdfBooking}
          onClose={() => setActivePdfBooking(null)}
        />
      )}

    </div>
  );
}
