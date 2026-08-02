import React, { useState } from 'react';
import { X, ShieldCheck, Ticket, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function BookingModal({ event, onClose, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ticketsCount, setTicketsCount] = useState(1);
  const [attendeeName, setAttendeeName] = useState(user?.name || '');
  const [attendeePhone, setAttendeePhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [step, setStep] = useState(1); // 1: Quantity & Info, 2: Payment Mock, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const unitPrice = event.ticketPrice;
  const totalAmount = unitPrice * ticketsCount;

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!attendeeName.trim()) {
      setError('Please enter attendee full name');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/bookings/verify-payment', {
        eventId: event._id,
        ticketsCount,
        seatsBooked: ticketsCount,
        paymentMethod,
        attendeeName,
        attendeePhone
      });

      setConfirmedBooking(res.data.booking);
      setStep(3);
      if (onSuccess) onSuccess(res.data.booking);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment simulation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const venueName = event.venue?.name || event.venueName || event.venue || 'Venue';
  const city = event.venue?.city || event.city || 'Bengaluru';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-monochrome-950 border border-monochrome-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-monochrome-800 bg-monochrome-900/50">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white text-base">
              {step === 3 ? 'Booking Confirmed!' : 'Ticket Reservation'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-monochrome-400 hover:text-white hover:bg-monochrome-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Select Quantity & Attendee Info */}
        {step === 1 && (
          <form onSubmit={handleProceedToPayment} className="p-6 space-y-5">
            <div>
              <h4 className="text-xs uppercase tracking-wider font-mono text-monochrome-400">Event</h4>
              <p className="text-white font-bold text-base mt-0.5">{event.title}</p>
              <p className="text-xs text-monochrome-400">{venueName}, {city}, India</p>
            </div>

            {/* Ticket Quantity Selector */}
            <div className="p-4 rounded-xl bg-monochrome-900 border border-monochrome-800 flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-white block">Number of Tickets</label>
                <span className="text-[11px] text-monochrome-400 font-mono">
                  {event.availableSeats} seats remaining
                </span>
              </div>

              <div className="flex items-center space-x-3 bg-monochrome-950 border border-monochrome-700 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setTicketsCount(Math.max(1, ticketsCount - 1))}
                  className="w-7 h-7 rounded bg-monochrome-800 hover:bg-white hover:text-black text-white flex items-center justify-center font-bold text-sm"
                >
                  -
                </button>
                <span className="font-mono font-bold text-white px-2">{ticketsCount}</span>
                <button
                  type="button"
                  onClick={() => setTicketsCount(Math.min(event.availableSeats, ticketsCount + 1))}
                  className="w-7 h-7 rounded bg-monochrome-800 hover:bg-white hover:text-black text-white flex items-center justify-center font-bold text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Attendee Details */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-monochrome-300 block mb-1">Attendee Name</label>
                <input
                  type="text"
                  required
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-monochrome-900 border border-monochrome-700 text-white text-xs focus:outline-none focus:border-white"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-monochrome-300 block mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={attendeePhone}
                  onChange={(e) => setAttendeePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-monochrome-900 border border-monochrome-700 text-white text-xs focus:outline-none focus:border-white"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Total Summary in ₹ Rupees */}
            <div className="pt-3 border-t border-monochrome-800 flex justify-between items-center">
              <div>
                <span className="text-xs text-monochrome-400">Total Price</span>
                <p className="text-xl font-bold font-mono text-white">
                  {totalAmount === 0 ? 'FREE' : `₹${totalAmount.toLocaleString('en-IN')}`}
                </p>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-monochrome-200 transition-all shadow-lg"
              >
                Proceed to Payment →
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Payment Gateway Simulation (UPI / Card / NetBanking) */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-xl bg-monochrome-900 border border-monochrome-800 text-center">
              <span className="text-[10px] uppercase tracking-widest text-monochrome-400 font-mono">Payment Gateway Simulation (INR ₹)</span>
              <h4 className="text-2xl font-bold font-mono text-white mt-1">
                {totalAmount === 0 ? 'FREE RESERVATION' : `₹${totalAmount.toLocaleString('en-IN')}`}
              </h4>
              <p className="text-xs text-monochrome-400 mt-0.5">
                {ticketsCount} Ticket(s) for {event.title}
              </p>
            </div>

            {totalAmount > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-monochrome-300 block">Select Indian Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['upi', 'card', 'netbanking'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 rounded-lg border text-xs font-mono uppercase transition-all ${
                        paymentMethod === method
                          ? 'border-white bg-monochrome-800 text-white font-bold'
                          : 'border-monochrome-800 bg-monochrome-900 text-monochrome-400 hover:text-white'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-950/50 p-2.5 rounded border border-red-800">{error}</p>
            )}

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl border border-monochrome-700 text-monochrome-300 hover:text-white text-xs font-semibold"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-monochrome-200 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Pay & Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success & Digital Ticket Preview */}
        {step === 3 && confirmedBooking && (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-white">Booking Confirmed!</h4>
              <p className="text-xs text-monochrome-400 mt-1">
                Your ticket has been issued. Ticket ID: <strong className="font-mono text-white">{confirmedBooking.bookingNumber}</strong>
              </p>
            </div>

            {/* QR Ticket Preview Card */}
            <div className="p-4 rounded-2xl bg-white text-black text-left space-y-3 shadow-2xl border border-black">
              <div className="flex justify-between items-center border-b border-black/10 pb-2">
                <span className="font-extrabold text-xs tracking-tight">EVENTLY ADMISSION TICKET</span>
                <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5 rounded">CONFIRMED</span>
              </div>

              <div className="flex justify-between items-center gap-3">
                <div>
                  <h5 className="font-bold text-sm leading-tight text-black">{event.title}</h5>
                  <p className="text-[11px] text-gray-700 mt-0.5">{venueName}, {city}, India</p>
                  <p className="text-[11px] text-gray-800 font-mono mt-1">Attendee: {confirmedBooking.attendeeName}</p>
                </div>

                {confirmedBooking.qrCodeData && (
                  <img
                    src={confirmedBooking.qrCodeData}
                    alt="QR Code Ticket"
                    className="w-20 h-20 border border-black p-1 bg-white rounded"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/my-bookings');
                }}
                className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-monochrome-200 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                Go to My Tickets
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
