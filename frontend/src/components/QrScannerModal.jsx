import React, { useState } from 'react';
import { X, QrCode, CheckCircle2, AlertTriangle, XCircle, Search, ShieldCheck, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function QrScannerModal({ onClose }) {
  const [ticketInput, setTicketInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;

    setLoading(true);
    setScanResult(null);
    setErrorMsg('');

    try {
      const res = await axios.post('/api/bookings/verify-qr', {
        code: ticketInput.trim(),
        bookingNumber: ticketInput.trim()
      });

      setScanResult(res.data);
    } catch (err) {
      if (err.response && err.response.data) {
        setScanResult(err.response.data);
      } else {
        setErrorMsg('Network error or server unreachable');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-monochrome-950 border border-monochrome-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-monochrome-800 bg-monochrome-900/50">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white text-base">Venue Entry QR Ticket Verification</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-monochrome-400 hover:text-white hover:bg-monochrome-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 rounded-xl bg-monochrome-900 border border-monochrome-800 text-xs text-monochrome-400 leading-relaxed">
            <span className="font-bold text-white block mb-1">Gate Check-In Mode</span>
            Scan participant's digital QR code using an optical scanner or enter their Ticket ID (e.g. <strong className="font-mono text-white">EVT-X78901</strong>) to check in attendees and prevent duplicate entries.
          </div>

          <form onSubmit={handleVerify} className="space-y-3">
            <label className="text-xs font-semibold text-monochrome-300 block">Scan / Enter Ticket Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="Paste QR JSON payload or Ticket ID (e.g. EVT-X78901)..."
                className="flex-1 px-4 py-3 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white font-mono text-xs focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-monochrome-200 transition-all flex items-center gap-1.5 shadow-md flex-shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Verify Entry
              </button>
            </div>
          </form>

          {/* Quick Demo Fill Shortcut */}
          <div className="flex gap-2 text-[11px] text-monochrome-400">
            <span>Quick fill demo ticket:</span>
            <button 
              onClick={() => setTicketInput('EVT-X78901')}
              className="text-white hover:underline font-mono"
            >
              EVT-X78901
            </button>
          </div>

          {/* Scan Results Display */}
          {scanResult && (
            <div className={`p-5 rounded-2xl border ${
              scanResult.valid 
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200' 
                : scanResult.alreadyAttended
                  ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                  : 'bg-red-950/30 border-red-500/50 text-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {scanResult.valid ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : scanResult.alreadyAttended ? (
                  <AlertTriangle className="w-7 h-7 text-amber-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-7 h-7 text-red-400 flex-shrink-0 mt-0.5" />
                )}

                <div className="space-y-1">
                  <h4 className="font-bold text-sm">{scanResult.message}</h4>
                  
                  {scanResult.booking && (
                    <div className="text-xs space-y-1 pt-2 font-mono text-monochrome-300 border-t border-monochrome-800/60 mt-2">
                      <p><strong className="text-white">Attendee:</strong> {scanResult.booking.attendeeName}</p>
                      <p><strong className="text-white">Event:</strong> {scanResult.booking.event?.title}</p>
                      <p><strong className="text-white">Tickets:</strong> {scanResult.booking.ticketsCount} Person(s)</p>
                      {scanResult.booking.attendedAt && (
                        <p><strong className="text-white">Check-in Time:</strong> {new Date(scanResult.booking.attendedAt).toLocaleString()}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-red-400 bg-red-950/50 p-3 rounded-xl border border-red-800">{errorMsg}</p>
          )}

        </div>
      </div>
    </div>
  );
}
