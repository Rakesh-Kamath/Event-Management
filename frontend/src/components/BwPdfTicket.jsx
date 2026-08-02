import React, { useRef } from 'react';
import { Printer, X, Download } from 'lucide-react';

export default function BwPdfTicket({ booking, onClose }) {
  const ticketRef = useRef(null);

  if (!booking) return null;

  const event = booking.event || booking.eventId || {};
  const formattedDate = event.dateTime 
    ? new Date(event.dateTime).toLocaleString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'TBD';

  const venueName = event.venue?.name || event.venueName || event.venue || 'Venue';
  const city = event.venue?.city || event.city || 'Bengaluru';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-monochrome-950 border border-monochrome-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Modal Controls — hidden when printing */}
        <div className="flex justify-between items-center no-print border-b border-monochrome-800 pb-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white text-base">Ticket Preview</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-white text-black font-bold text-xs hover:bg-monochrome-200 transition-all flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-monochrome-900 border border-monochrome-700 text-monochrome-300 hover:text-white hover:bg-monochrome-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE TICKET CONTAINER */}
        <div 
          ref={ticketRef}
          className="printable-ticket bg-white text-black p-8 rounded-xl border-4 border-black space-y-6 shadow-2xl relative overflow-hidden font-sans"
        >
          {/* Header Banner */}
          <div className="flex justify-between items-start border-b-2 border-black pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-black uppercase">EVENTLY ADMISSION TICKET</h1>
              <p className="text-xs font-mono text-black font-semibold mt-0.5">OFFICIAL DIGITAL PASS — TICKET # {booking.bookingNumber}</p>
            </div>
            <div className="text-right">
              <span className="inline-block border-2 border-black px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider">
                {booking.paymentStatus === 'successful' ? 'PAID & VERIFIED' : booking.paymentStatus}
              </span>
            </div>
          </div>

          {/* Body Section */}
          <div className="grid grid-cols-3 gap-6 items-center">
            
            {/* Left 2 Cols: Details */}
            <div className="col-span-2 space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/70">EVENT TITLE</span>
                <h2 className="text-xl font-bold text-black leading-snug">{event.title || 'Event Title'}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-black/70 block">DATE & TIME</span>
                  <span className="font-semibold text-black">{formattedDate}</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-black/70 block">VENUE LOCATION</span>
                  <span className="font-semibold text-black">{venueName}, {city}, India</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-black/70 block">PARTICIPANT NAME</span>
                  <span className="font-bold text-black text-sm">{booking.attendeeName || 'Attendee'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-black/70 block">TOTAL AMOUNT PAID</span>
                  <span className="font-mono font-bold text-black">
                    {booking.totalAmount === 0 ? 'FREE' : `₹${booking.totalAmount?.toLocaleString('en-IN')}`} ({booking.ticketsCount} Ticket)
                  </span>
                </div>
              </div>
            </div>

            {/* Right Col: QR Code Box */}
            <div className="col-span-1 flex flex-col items-center justify-center border-l-2 border-dashed border-black pl-6">
              {booking.qrCodeData ? (
                <img 
                  src={booking.qrCodeData} 
                  alt="Entry QR Code" 
                  className="w-32 h-32 border-2 border-black p-1 bg-white"
                />
              ) : (
                <div className="w-32 h-32 border-2 border-black flex items-center justify-center font-mono text-xs">
                  [QR CODE]
                </div>
              )}
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-black mt-2 text-center">
                SCAN AT VENUE GATE
              </span>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="border-t-2 border-black pt-4 flex justify-between items-center text-[10px] font-mono text-black">
            <div>
              <span>Verification Code: <strong>{booking.verificationCode}</strong></span>
            </div>
            <div>
              <span>Payment ID: <strong>{booking.paymentId}</strong></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
