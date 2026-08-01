import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  PlusCircle, 
  QrCode, 
  Users, 
  IndianRupee, 
  Ticket, 
  X, 
  BarChart3, 
  TrendingUp,
  Edit3,
  Download,
  Search,
  Upload,
  Lock,
  Unlock,
  Clock
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import axios from 'axios';
import QrScannerModal from '../components/QrScannerModal';
import VenueAutocomplete from '../components/VenueAutocomplete';

export default function OrganizerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [selectedEventAttendees, setSelectedEventAttendees] = useState(null);
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    venueName: '',
    address: '',
    city: 'Bengaluru',
    dateTime: '',
    ticketPrice: 0,
    maxCapacity: 100,
    totalCapacity: 100,
    registrationDeadline: '',
    bannerUrl: '',
    coordinates: []
  });

  const [editFormData, setEditFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      const [analyticsRes, eventsRes] = await Promise.all([
        axios.get('/api/analytics/organizer'),
        axios.get('/api/events/my-events')
      ]);
      setAnalytics(analyticsRes.data);
      setEvents(eventsRes.data);
    } catch (err) {
      console.error('Error fetching organizer dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageFileUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) {
        setEditFormData(prev => ({ ...prev, bannerUrl: reader.result }));
      } else {
        setFormData(prev => ({ ...prev, bannerUrl: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        ...formData,
        venue: {
          name: formData.venueName,
          address: formData.address || formData.venueName,
          city: formData.city,
          country: 'India',
          location: { type: 'Point', coordinates: formData.coordinates && formData.coordinates.length ? formData.coordinates : [77.5946, 12.9716] }
        }
      };
      await axios.post('/api/events', payload);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'Technical',
        venueName: '',
        address: '',
        city: 'Bengaluru',
        dateTime: '',
        ticketPrice: 0,
        maxCapacity: 100,
        totalCapacity: 100,
        registrationDeadline: '',
        bannerUrl: ''
      });
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error creating event');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (evt) => {
    setEditFormData({
      id: evt._id,
      title: evt.title,
      description: evt.description,
      category: evt.category,
      venueName: evt.venue?.name || evt.venueName || '',
      address: evt.venue?.address || evt.address || '',
      city: evt.venue?.city || evt.city || 'Bengaluru',
      dateTime: evt.dateTime ? new Date(evt.dateTime).toISOString().slice(0, 16) : '',
      ticketPrice: evt.ticketPrice || 0,
      maxCapacity: evt.maxCapacity || evt.totalCapacity || 100,
      registrationDeadline: evt.registrationDeadline ? new Date(evt.registrationDeadline).toISOString().slice(0, 16) : '',
      bannerUrl: evt.bannerUrl || '',
      coordinates: evt.venue?.location?.coordinates || [77.5946, 12.9716]
    });
    setShowEditModal(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        ...editFormData,
        venue: {
          name: editFormData.venueName,
          address: editFormData.address,
          city: editFormData.city,
          country: 'India',
          location: { type: 'Point', coordinates: editFormData.coordinates }
        }
      };
      await axios.put(`/api/events/${editFormData.id}`, payload);
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error updating event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRegistration = async (evt) => {
    const isCurrentlyClosed = evt.availableSeats <= 0;
    const confirmMsg = isCurrentlyClosed 
      ? 'Reopen registrations for this event?' 
      : 'Close registrations for this event now?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.put(`/api/events/${evt._id}`, {
        isClosed: !isCurrentlyClosed
      });
      fetchData();
    } catch (err) {
      alert('Error updating registration status');
    }
  };

  const handleCancelEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel this event?')) return;
    try {
      await axios.patch(`/api/events/${eventId}/cancel`);
      fetchData();
    } catch (err) {
      alert('Error cancelling event');
    }
  };

  const handleViewAttendees = async (eventId) => {
    try {
      const res = await axios.get(`/api/bookings/event/${eventId}`);
      setSelectedEventAttendees(res.data);
      setAttendeeSearchQuery('');
    } catch (err) {
      alert('Error loading attendee roster');
    }
  };

  const handleDownloadCSV = () => {
    if (!selectedEventAttendees || !selectedEventAttendees.bookings) return;
    const bookings = selectedEventAttendees.bookings;
    const headers = ['Booking ID', 'Attendee Name', 'Attendee Email', 'Passes Booked', 'Total Amount (INR)', 'Payment Status', 'Gate Check-in Status'];
    const rows = bookings.map(b => [
      b.bookingNumber,
      `"${b.attendeeName || 'N/A'}"`,
      `"${b.attendeeEmail || 'N/A'}"`,
      b.seatsBooked || b.ticketsCount || 1,
      b.totalAmount,
      b.paymentStatus,
      b.attended ? 'Checked In' : 'Not Checked In'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Participant_List_${selectedEventAttendees.event?.title || 'Event'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
      </div>
    );
  }

  const metrics = analytics?.metrics || {};

  const filteredBookings = selectedEventAttendees?.bookings?.filter(b => {
    const q = attendeeSearchQuery.toLowerCase();
    return (
      b.bookingNumber?.toLowerCase().includes(q) ||
      b.attendeeName?.toLowerCase().includes(q) ||
      b.attendeeEmail?.toLowerCase().includes(q)
    );
  }) || [];

  return (
    <div className="min-h-screen max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 py-6 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-monochrome-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Organizer Studio</h1>
          <p className="text-xs text-monochrome-400 font-mono mt-1">
            Complete event lifecycle control: creation, editing, seat capacity management, attendee CSV downloads & gate check-in.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScannerModal(true)}
            className="px-4 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 hover:bg-monochrome-800 text-white text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <QrCode className="w-4 h-4" />
            Gate Check-in QR Scanner
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-monochrome-200 flex items-center gap-2 transition-all shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-monochrome-800">
          <div className="flex items-center justify-between text-monochrome-400">
            <span className="text-[10px] uppercase font-mono tracking-widest">Total Events</span>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono mt-2">{metrics.totalEvents || events.length || 0}</p>
          <span className="text-[11px] text-monochrome-400 font-mono">{metrics.activeEvents || events.filter(e => e.status === 'approved').length} active</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-monochrome-800">
          <div className="flex items-center justify-between text-monochrome-400">
            <span className="text-[10px] uppercase font-mono tracking-widest">Tickets Sold</span>
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono mt-2">{metrics.ticketsSold || 0}</p>
          <span className="text-[11px] text-monochrome-400 font-mono">{metrics.totalBookings || 0} bookings</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-monochrome-800">
          <div className="flex items-center justify-between text-monochrome-400">
            <span className="text-[10px] uppercase font-mono tracking-widest">Total Revenue (₹)</span>
            <IndianRupee className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono mt-2">₹{(metrics.revenueGenerated || 0).toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-monochrome-400 font-mono">Total earnings</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-monochrome-800">
          <div className="flex items-center justify-between text-monochrome-400">
            <span className="text-[10px] uppercase font-mono tracking-widest">Attendance Rate</span>
            <Users className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono mt-2">{metrics.attendanceRate || 0}%</p>
          <span className="text-[11px] text-monochrome-400 font-mono">QR scanned at gate</span>
        </div>

      </div>

      {analytics?.monthlyRevenue && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="glass-panel p-6 rounded-3xl border border-monochrome-800 space-y-4">
            <div className="flex items-center justify-between border-b border-monochrome-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-white" />
                Monthly Ticket Revenue Velocity (₹)
              </h3>
              <span className="text-[10px] font-mono text-monochrome-400">Performance</span>
            </div>

            <div className="h-60 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff', borderRadius: '8px' }} 
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#ffffff" strokeWidth={2.5} dot={{ fill: '#ffffff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-monochrome-800 space-y-4">
            <div className="flex items-center justify-between border-b border-monochrome-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-white" />
                Tickets Sold by Event Category
              </h3>
              <span className="text-[10px] font-mono text-monochrome-400">Distribution</span>
            </div>

            <div className="h-60 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryData || [{ name: 'Cultural', value: 5 }, { name: 'Food & Drinks', value: 3 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff', borderRadius: '8px' }} 
                  />
                  <Bar dataKey="value" fill="#e4e4e7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      <div className="glass-panel p-6 rounded-3xl border border-monochrome-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-monochrome-800">
          <div>
            <h3 className="text-base font-bold text-white">Event Management & Seat Controls</h3>
            <p className="text-xs text-monochrome-400 font-mono">Edit event info, update schedules, toggle registration status, and view participants.</p>
          </div>
          <span className="text-xs font-mono text-monochrome-400">{events.length} total events</span>
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center text-xs text-monochrome-400">
            No events created yet. Click "Create New Event" to publish your first Indian event.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-monochrome-800 text-monochrome-400 uppercase text-[10px]">
                  <th className="pb-3">Event Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date & Metro City</th>
                  <th className="pb-3">Price (₹)</th>
                  <th className="pb-3">Seat Management</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-monochrome-800/60">
                {events.map((evt) => {
                  const maxCap = evt.maxCapacity || evt.totalCapacity || 100;
                  const booked = maxCap - evt.availableSeats;
                  const city = evt.venue?.city || evt.city || 'Bengaluru';
                  const isClosed = evt.availableSeats <= 0;

                  return (
                    <tr key={evt._id} className="hover:bg-monochrome-900/40">
                      <td className="py-3.5 font-bold text-white max-w-xs truncate">{evt.title}</td>
                      <td className="py-3.5 text-monochrome-300">{evt.category}</td>
                      <td className="py-3.5 text-monochrome-400">
                        {new Date(evt.dateTime).toLocaleDateString('en-IN')} • {city}
                      </td>
                      <td className="py-3.5 font-bold text-white">
                        {evt.ticketPrice === 0 ? 'FREE' : `₹${evt.ticketPrice.toLocaleString('en-IN')}`}
                      </td>
                      <td className="py-3.5 text-monochrome-300">
                        <div className="space-y-1">
                          <div>
                            <span className="text-white font-bold">{booked}</span> / {maxCap} booked
                          </div>
                          <span className={`text-[10px] block font-semibold ${isClosed ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isClosed ? '🔒 Registrations Closed' : `🟢 ${evt.availableSeats} seats left`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          evt.status === 'approved' 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                            : evt.status === 'cancelled'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => openEditModal(evt)}
                          title="Edit event details, schedule & capacity"
                          className="p-1.5 rounded bg-monochrome-800 hover:bg-white hover:text-black text-white transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleRegistration(evt)}
                          title={isClosed ? 'Reopen Registrations' : 'Close Registrations'}
                          className={`p-1.5 rounded border transition-colors ${
                            isClosed
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                              : 'bg-amber-950 text-amber-300 border-amber-800 hover:bg-amber-900'
                          }`}
                        >
                          {isClosed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleViewAttendees(evt._id)}
                          className="px-2.5 py-1 rounded bg-monochrome-800 hover:bg-white hover:text-black text-white text-[11px] transition-colors"
                        >
                          Participants
                        </button>

                        {evt.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelEvent(evt._id)}
                            className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-monochrome-950 border border-monochrome-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-monochrome-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Create New Event
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-monochrome-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              
              <div>
                <label className="text-monochrome-300 font-semibold block mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Pune Music Fest"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-monochrome-300 font-semibold block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none"
                  >
                    <option value="Cultural">Cultural</option>
                    <option value="Food & Drinks">Food & Drinks</option>
                    <option value="Technical">Technical</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Sports">Sports</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="text-monochrome-300 font-semibold block mb-1">Indian Metro City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Goa">Goa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-monochrome-300 font-semibold block mb-1">Venue Location (Google Autocomplete)</label>
                  <VenueAutocomplete onSelect={(data) => setFormData({ ...formData, address: data.address, coordinates: data.coordinates })} />
                </div>

                <div>
                  <label className="text-monochrome-300 font-semibold block mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-monochrome-300 font-semibold block mb-1">Ticket Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-monochrome-300 font-semibold block mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value, totalCapacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-monochrome-300 font-semibold block mb-1">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-monochrome-300 font-semibold block mb-1">Event Banner Poster</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, false)}
                    className="hidden"
                    id="banner-file-input"
                  />
                  <label
                    htmlFor="banner-file-input"
                    className="px-3.5 py-2 rounded-xl bg-monochrome-800 hover:bg-monochrome-700 text-white font-semibold flex items-center gap-2 cursor-pointer border border-monochrome-600"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Poster Image File
                  </label>
                  <span className="text-[11px] text-monochrome-400">or paste Base64 string below</span>
                </div>
                <input
                  type="text"
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                  className="w-full mt-2 px-3.5 py-2 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none text-xs font-mono truncate"
                  placeholder="data:image/jpeg;base64,..."
                />
                {formData.bannerUrl && (
                  <img src={formData.bannerUrl} alt="Preview" className="mt-2 h-20 rounded-lg object-cover border border-monochrome-800" />
                )}
              </div>

              <div>
                <label className="text-monochrome-300 font-semibold block mb-1">Event Description</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none"
                  placeholder="Detailed event description, highlights, and guidelines..."
                />
              </div>

              {formError && (
                <p className="text-red-400 bg-red-950/50 p-2.5 rounded-lg border border-red-800 text-xs">{formError}</p>
              )}

              <div className="pt-3 border-t border-monochrome-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-300 text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-monochrome-200 transition-all shadow-lg"
                >
                  {submitting ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {showEditModal && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-monochrome-950 border border-monochrome-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-monochrome-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Edit Event Details & Controls
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-monochrome-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="space-y-4 text-xs">
              
              <div>
                <label className="text-monochrome-300 font-semibold block mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-monochrome-300 font-semibold block mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none"
                  >
                    <option value="Cultural">Cultural</option>
                    <option value="Food & Drinks">Food & Drinks</option>
                    <option value="Technical">Technical</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Sports">Sports</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="text-monochrome-300 font-semibold block mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={editFormData.dateTime}
                    onChange={(e) => setEditFormData({ ...editFormData, dateTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-monochrome-300 font-semibold block mb-1">Ticket Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.ticketPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, ticketPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-monochrome-300 font-semibold block mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editFormData.maxCapacity}
                    onChange={(e) => setEditFormData({ ...editFormData, maxCapacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-monochrome-300 font-semibold block mb-1">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    value={editFormData.registrationDeadline}
                    onChange={(e) => setEditFormData({ ...editFormData, registrationDeadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-monochrome-300 font-semibold block mb-1">Update Event Banner Poster</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, true)}
                    className="hidden"
                    id="edit-banner-file-input"
                  />
                  <label
                    htmlFor="edit-banner-file-input"
                    className="px-3.5 py-2 rounded-xl bg-monochrome-800 hover:bg-monochrome-700 text-white font-semibold flex items-center gap-2 cursor-pointer border border-monochrome-600"
                  >
                    <Upload className="w-4 h-4" />
                    Choose New Image File
                  </label>
                </div>
                {editFormData.bannerUrl && (
                  <img src={editFormData.bannerUrl} alt="Preview" className="mt-2 h-20 rounded-lg object-cover border border-monochrome-800" />
                )}
              </div>

              <div>
                <label className="text-monochrome-300 font-semibold block mb-1">Event Description</label>
                <textarea
                  rows="3"
                  required
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none"
                />
              </div>

              {formError && (
                <p className="text-red-400 bg-red-950/50 p-2.5 rounded-lg border border-red-800 text-xs">{formError}</p>
              )}

              <div className="pt-3 border-t border-monochrome-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-300 text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-monochrome-200 transition-all shadow-lg"
                >
                  {submitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {showScannerModal && (
        <QrScannerModal onClose={() => setShowScannerModal(false)} />
      )}

      {selectedEventAttendees && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-monochrome-950 border border-monochrome-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-monochrome-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Registered Participants</h3>
                <p className="text-xs text-monochrome-400 font-mono">{selectedEventAttendees.event?.title}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCSV}
                  className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-monochrome-200 flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV
                </button>

                <button onClick={() => setSelectedEventAttendees(null)} className="text-monochrome-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-monochrome-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={attendeeSearchQuery}
                onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                placeholder="Search registered participants by name, email, or booking ID..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white text-xs focus:outline-none focus:border-white font-mono"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-monochrome-800 text-monochrome-400 uppercase text-[10px]">
                    <th className="pb-2">Booking ID</th>
                    <th className="pb-2">Attendee Name</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Passes</th>
                    <th className="pb-2">Amount (₹)</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Check-in</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-monochrome-800">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-monochrome-500 text-xs">
                        No registered participants found.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-monochrome-900/50">
                        <td className="py-2.5 font-bold text-white">{b.bookingNumber}</td>
                        <td className="py-2.5 text-monochrome-100 font-semibold">{b.attendeeName}</td>
                        <td className="py-2.5 text-monochrome-400">{b.attendeeEmail}</td>
                        <td className="py-2.5 text-white font-bold">{b.seatsBooked || b.ticketsCount || 1}</td>
                        <td className="py-2.5 text-white font-mono font-bold">₹{(b.totalAmount || 0).toLocaleString('en-IN')}</td>
                        <td className="py-2.5 uppercase font-bold text-emerald-400 text-[10px]">{b.paymentStatus}</td>
                        <td className="py-2.5">
                          {b.attended ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[10px]">Checked In ✓</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-monochrome-900 text-monochrome-400 text-[10px]">Not Checked In</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
