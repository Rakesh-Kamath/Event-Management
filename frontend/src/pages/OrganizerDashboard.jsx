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
  Clock,
  Target,
  Zap,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  RadialBarChart, RadialBar, Legend
} from 'recharts';
import axios from 'axios';
import QrScannerModal from '../components/QrScannerModal';
import VenueAutocomplete from '../components/VenueAutocomplete';

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-monochrome-950 border border-monochrome-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-[11px] text-monochrome-400 font-mono mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-xs font-bold text-white font-mono">
            {entry.name}: {prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN') : entry.value}{suffix}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CHART_COLORS = ['#F84464', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#6B7280'];
const PIE_COLORS = ['#F84464', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#6B7280'];

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
          name: formData.venueName || formData.address || 'Online / TBD',
          address: formData.address || formData.venueName || 'Online / TBD',
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
          name: editFormData.venueName || editFormData.address || 'Online / TBD',
          address: editFormData.address || editFormData.venueName || 'Online / TBD',
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
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-monochrome-700">
        <div>
          <h1 className="text-3xl font-extrabold text-monochrome-100 tracking-tight">Organizer Studio</h1>
          <p className="text-xs text-monochrome-500 font-mono mt-1">
            Complete event lifecycle control: creation, editing, seat capacity management, attendee CSV downloads & gate check-in.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScannerModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white border border-monochrome-700 hover:text-brand hover:border-brand/40 text-monochrome-200 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <QrCode className="w-4 h-4 text-brand" />
            Gate Check-in QR Scanner
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-brand text-white font-extrabold text-xs hover:bg-brand-hover flex items-center gap-2 transition-all shadow-lg shadow-brand/10"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Event
          </button>
        </div>
      </div>

      {/* ============================================= */}
      {/* KPI METRIC CARDS — 6 cards, 2 rows on mobile  */}
      {/* ============================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="glass-panel p-4 rounded-2xl border border-monochrome-700">
          <div className="flex items-center justify-between text-monochrome-500 mb-2">
            <span className="text-[9px] uppercase font-mono tracking-widest">Total Events</span>
            <Calendar className="w-3.5 h-3.5 text-brand" />
          </div>
          <p className="text-xl font-extrabold text-monochrome-100 font-mono">{metrics.totalEvents || events.length || 0}</p>
          <span className="text-[10px] text-emerald-600 font-mono">{metrics.activeEvents || events.filter(e => e.status === 'approved').length} active</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-monochrome-700">
          <div className="flex items-center justify-between text-monochrome-500 mb-2">
            <span className="text-[9px] uppercase font-mono tracking-widest">Tickets Sold</span>
            <Ticket className="w-3.5 h-3.5 text-brand" />
          </div>
          <p className="text-xl font-extrabold text-monochrome-100 font-mono">{metrics.ticketsSold || 0}</p>
          <span className="text-[10px] text-monochrome-500 font-mono">{metrics.totalBookings || 0} bookings</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-monochrome-700">
          <div className="flex items-center justify-between text-monochrome-500 mb-2">
            <span className="text-[9px] uppercase font-mono tracking-widest">Revenue</span>
            <IndianRupee className="w-3.5 h-3.5 text-brand" />
          </div>
          <p className="text-xl font-extrabold text-monochrome-100 font-mono">₹{(metrics.revenueGenerated || 0).toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-monochrome-500 font-mono">Total earnings</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-monochrome-700">
          <div className="flex items-center justify-between text-monochrome-500 mb-2">
            <span className="text-[9px] uppercase font-mono tracking-widest">Attendance</span>
            <Users className="w-3.5 h-3.5 text-brand" />
          </div>
          <p className="text-xl font-extrabold text-monochrome-100 font-mono">{metrics.attendanceRate || 0}%</p>
          <span className="text-[10px] text-monochrome-500 font-mono">QR check-in rate</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-monochrome-700">
          <div className="flex items-center justify-between text-monochrome-500 mb-2">
            <span className="text-[9px] uppercase font-mono tracking-widest">Avg Ticket ₹</span>
            <Target className="w-3.5 h-3.5 text-brand" />
          </div>
          <p className="text-xl font-extrabold text-monochrome-100 font-mono">₹{(metrics.avgTicketPrice || 0).toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-monochrome-500 font-mono">Per ticket</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-monochrome-700">
          <div className="flex items-center justify-between text-monochrome-500 mb-2">
            <span className="text-[9px] uppercase font-mono tracking-widest">Rev/Event</span>
            <Zap className="w-3.5 h-3.5 text-brand" />
          </div>
          <p className="text-xl font-extrabold text-monochrome-100 font-mono">₹{(metrics.avgRevenuePerEvent || 0).toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-monochrome-500 font-mono">Avg per event</span>
        </div>
      </div>

      {/* ============================================= */}
      {/* CHARTS ROW 1: Revenue Trend + Category Donut  */}
      {/* ============================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Revenue Trend — Area Chart (spans 2 cols) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-monochrome-700 space-y-3">
          <div className="flex items-center justify-between border-b border-monochrome-750 pb-2.5">
            <h3 className="text-sm font-bold text-monochrome-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand" />
              Revenue & Booking Trend
            </h3>
            <span className="text-[10px] font-mono text-monochrome-550">Monthly</span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.monthlyRevenue || []}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F84464" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F84464" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E1E6" />
                <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip prefix="₹" />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#F84464" 
                  strokeWidth={2} 
                  fill="url(#revenueGradient)" 
                  name="Revenue"
                  dot={{ fill: '#F84464', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, stroke: '#F84464', strokeWidth: 2, fill: '#ffffff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#3B82F6" 
                  strokeWidth={1.5} 
                  fill="url(#bookingGradient)" 
                  name="Tickets"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution — Donut Pie Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-monochrome-700 space-y-3">
          <div className="flex items-center justify-between border-b border-monochrome-750 pb-2.5">
            <h3 className="text-sm font-bold text-monochrome-100 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-brand" />
              Category Split
            </h3>
            <span className="text-[10px] font-mono text-monochrome-555">Tickets</span>
          </div>

          <div className="h-56 flex items-center justify-center">
            {analytics?.categoryData && analytics.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {analytics.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                    formatter={(value, name) => [`${value} tickets`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-monochrome-500 font-mono">No category data yet</p>
            )}
          </div>
          {/* Legend below chart */}
          {analytics?.categoryData && analytics.categoryData.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
              {analytics.categoryData.map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-[10px] text-monochrome-400 font-mono">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================= */}
      {/* CHARTS ROW 2: Top Events + Seat Utilization   */}
      {/* ============================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Top Events by Revenue — Horizontal Bar */}
        <div className="glass-panel p-5 rounded-2xl border border-monochrome-700 space-y-3">
          <div className="flex items-center justify-between border-b border-monochrome-750 pb-2.5">
            <h3 className="text-sm font-bold text-monochrome-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand" />
              Top Events by Revenue
            </h3>
            <span className="text-[10px] font-mono text-monochrome-550">Top 5</span>
          </div>

          {analytics?.topEventsByRevenue && analytics.topEventsByRevenue.length > 0 ? (
            <div className="space-y-2.5">
              {analytics.topEventsByRevenue.map((evt, idx) => {
                const maxRevenue = analytics.topEventsByRevenue[0]?.revenue || 1;
                const widthPercent = maxRevenue > 0 ? (evt.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-monochrome-200 font-medium truncate max-w-[60%]">{evt.name}</span>
                      <span className="text-monochrome-100 font-bold font-mono">₹{evt.revenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-2 bg-monochrome-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand to-rose-300 rounded-full transition-all duration-700"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-monochrome-500 font-mono">{evt.tickets} tickets sold</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-monochrome-500 font-mono">No revenue data yet</div>
          )}
        </div>

        {/* Seat Utilization — Stacked Bar */}
        <div className="glass-panel p-5 rounded-2xl border border-monochrome-700 space-y-3">
          <div className="flex items-center justify-between border-b border-monochrome-750 pb-2.5">
            <h3 className="text-sm font-bold text-monochrome-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand" />
              Seat Utilization
            </h3>
            <span className="text-[10px] font-mono text-monochrome-550">By event</span>
          </div>

          {analytics?.seatUtilization && analytics.seatUtilization.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.seatUtilization} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E1E1E6" horizontal={false} />
                  <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={9} tickLine={false} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E1E1E6', borderRadius: '8px', fontSize: '11px', color: '#121217' }}
                    formatter={(value, name) => [value, name === 'booked' ? 'Booked' : 'Available']}
                  />
                  <Bar dataKey="booked" stackId="seats" fill="#F84464" radius={[0, 0, 0, 0]} name="Booked" />
                  <Bar dataKey="available" stackId="seats" fill="#E1E1E6" radius={[0, 4, 4, 0]} name="Available" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-monochrome-500 font-mono">No seat data yet</div>
          )}
        </div>
      </div>

      {/* ============================================= */}
      {/* CHARTS ROW 3: Daily Trend + Free/Paid Split   */}
      {/* ============================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Daily Booking Trend — Area chart (30 days) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-monochrome-700 space-y-3">
          <div className="flex items-center justify-between border-b border-monochrome-750 pb-2.5">
            <h3 className="text-sm font-bold text-monochrome-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand" />
              Booking Trend
            </h3>
            <span className="text-[10px] font-mono text-monochrome-550">Last 30 days</span>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.dailyBookingTrend || []}>
                <defs>
                  <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E1E6" />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  fontSize={9} 
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E1E1E6', borderRadius: '8px', fontSize: '11px', color: '#121217' }}
                  formatter={(value) => [`${value} tickets`, 'Bookings']}
                />
                <Area 
                  type="monotone" 
                  dataKey="tickets" 
                  stroke="#3B82F6" 
                  strokeWidth={2} 
                  fill="url(#dailyGradient)"
                  dot={false}
                  activeDot={{ r: 4, stroke: '#3B82F6', strokeWidth: 2, fill: '#ffffff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Free vs Paid — Donut */}
        <div className="glass-panel p-5 rounded-2xl border border-monochrome-700 space-y-3">
          <div className="flex items-center justify-between border-b border-monochrome-750 pb-2.5">
            <h3 className="text-sm font-bold text-monochrome-100 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-brand" />
              Free vs Paid
            </h3>
            <span className="text-[10px] font-mono text-monochrome-555">Tickets</span>
          </div>

          <div className="h-48 flex items-center justify-center">
            {analytics?.freePaidSplit && (analytics.freePaidSplit[0]?.value > 0 || analytics.freePaidSplit[1]?.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.freePaidSplit}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#F84464" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E1E1E6', borderRadius: '8px', fontSize: '11px', color: '#121217' }}
                    formatter={(value, name) => [`${value} tickets`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-monochrome-500 font-mono">No ticket data yet</p>
            )}
          </div>
          {analytics?.freePaidSplit && (analytics.freePaidSplit[0]?.value > 0 || analytics.freePaidSplit[1]?.value > 0) && (
            <div className="flex items-center justify-center gap-5 pt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span className="text-[11px] text-monochrome-400 font-mono">Free ({analytics.freePaidSplit[0]?.value || 0})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F84464]" />
                <span className="text-[11px] text-monochrome-400 font-mono">Paid ({analytics.freePaidSplit[1]?.value || 0})</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================= */}
      {/* EVENT MANAGEMENT TABLE                        */}
      {/* ============================================= */}
      <div className="glass-panel p-6 rounded-3xl border border-monochrome-700 space-y-4 animate-fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-monochrome-750">
          <div>
            <h3 className="text-base font-bold text-monochrome-100">Event Management & Seat Controls</h3>
            <p className="text-xs text-monochrome-500 font-mono">Edit event info, update schedules, toggle registration status, and view participants.</p>
          </div>
          <span className="text-xs font-mono text-monochrome-500">{events.length} total events</span>
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center text-xs text-monochrome-500">
            No events created yet. Click "Create New Event" to publish your first Indian event.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-monochrome-750 text-monochrome-500 uppercase text-[10px]">
                  <th className="pb-3">Event Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date & Metro City</th>
                  <th className="pb-3">Price (₹)</th>
                  <th className="pb-3">Seat Management</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-monochrome-750">
                {events.map((evt) => {
                  const maxCap = evt.maxCapacity || evt.totalCapacity || 100;
                  const booked = maxCap - evt.availableSeats;
                  const city = evt.venue?.city || evt.city || 'Bengaluru';
                  const isClosed = evt.availableSeats <= 0;

                  return (
                    <tr key={evt._id} className="hover:bg-monochrome-800/40">
                      <td className="py-3.5 font-bold text-monochrome-100 max-w-xs truncate">{evt.title}</td>
                      <td className="py-3.5 text-monochrome-200">{evt.category}</td>
                      <td className="py-3.5 text-monochrome-500">
                        {new Date(evt.dateTime).toLocaleDateString('en-IN')} • {city}
                      </td>
                      <td className="py-3.5 font-bold text-monochrome-100">
                        {evt.ticketPrice === 0 ? 'FREE' : `₹${evt.ticketPrice.toLocaleString('en-IN')}`}
                      </td>
                      <td className="py-3.5 text-monochrome-200">
                        <div className="space-y-1">
                          <div>
                            <span className="text-monochrome-100 font-bold">{booked}</span> / {maxCap} booked
                          </div>
                          <span className={`text-[10px] block font-semibold ${isClosed ? 'text-red-600' : 'text-emerald-600'}`}>
                            {isClosed ? '🔒 Registrations Closed' : `🟢 ${evt.availableSeats} seats left`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          evt.status === 'approved' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-250' 
                            : evt.status === 'cancelled'
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-amber-50 text-amber-600 border border-amber-250'
                        }`}>
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => openEditModal(evt)}
                          title="Edit event details, schedule & capacity"
                          className="p-1.5 rounded bg-monochrome-800 hover:bg-brand hover:text-white text-monochrome-200 transition-colors border border-monochrome-700 shadow-sm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleRegistration(evt)}
                          title={isClosed ? 'Reopen Registrations' : 'Close Registrations'}
                          className={`p-1.5 rounded border transition-colors ${
                            isClosed
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {isClosed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleViewAttendees(evt._id)}
                          className="px-2.5 py-1 rounded bg-monochrome-800 hover:bg-brand hover:text-white text-monochrome-200 text-[11px] transition-colors border border-monochrome-700 shadow-sm"
                        >
                          Participants
                        </button>

                        {evt.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelEvent(evt._id)}
                            className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] transition-colors"
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

      {/* ============================================= */}
      {/* CREATE EVENT MODAL                            */}
      {/* ============================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-monochrome-950 border border-monochrome-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-monochrome-750 pb-3">
              <h3 className="font-bold text-monochrome-100 text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-brand" />
                Create New Event
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-monochrome-500 hover:text-brand">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              
              <div>
                <label className="text-monochrome-200 font-semibold block mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Pune Music Fest"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-monochrome-200 font-semibold block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70 font-mono"
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
                  <label className="text-monochrome-200 font-semibold block mb-1">Indian Metro City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70 font-mono"
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
                  <label className="text-monochrome-200 font-semibold block mb-1">Venue Location (Google Autocomplete)</label>
                  <VenueAutocomplete onSelect={(data) => setFormData({ ...formData, address: data.address, coordinates: data.coordinates })} />
                </div>

                <div>
                  <label className="text-monochrome-200 font-semibold block mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-monochrome-200 font-semibold block mb-1">Ticket Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70 font-mono"
                  />
                </div>

                <div>
                  <label className="text-monochrome-200 font-semibold block mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value, totalCapacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70 font-mono"
                  />
                </div>

                <div>
                  <label className="text-monochrome-200 font-semibold block mb-1">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-monochrome-200 font-semibold block mb-1">Event Banner Poster</label>
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
                    className="px-3.5 py-2 rounded-xl bg-monochrome-800 hover:bg-brand hover:text-white text-monochrome-200 font-semibold flex items-center gap-2 cursor-pointer border border-monochrome-700 shadow-sm transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Poster Image File
                  </label>
                  <span className="text-[11px] text-monochrome-500">or paste Base64 string below</span>
                </div>
                <input
                  type="text"
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                  className="w-full mt-2 px-3.5 py-2 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70 text-xs font-mono truncate"
                  placeholder="data:image/jpeg;base64,..."
                />
                {formData.bannerUrl && (
                  <img src={formData.bannerUrl} alt="Preview" className="mt-2 h-20 rounded-lg object-cover border border-monochrome-700" />
                )}
              </div>

              <div>
                <label className="text-monochrome-200 font-semibold block mb-1">Event Description</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70 font-sans text-xs"
                  placeholder="Detailed event description, highlights, and guidelines..."
                />
              </div>

              {formError && (
                <p className="text-red-600 bg-red-500/10 p-2.5 rounded-lg border border-red-200 text-xs">{formError}</p>
              )}

              <div className="pt-3 border-t border-monochrome-750 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-monochrome-850 border border-monochrome-700 text-monochrome-200 hover:text-brand hover:bg-brand/5 text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-brand text-white font-extrabold text-xs hover:bg-brand-hover transition-all shadow-lg shadow-brand/10"
                >
                  {submitting ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* EDIT EVENT MODAL                              */}
      {/* ============================================= */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-monochrome-950 border border-monochrome-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-monochrome-750 pb-3">
              <h3 className="font-bold text-monochrome-100 text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand" />
                Edit Event Details & Controls
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-monochrome-500 hover:text-brand">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="space-y-4 text-xs">
              
              <div>
                <label className="text-monochrome-200 font-semibold block mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-monochrome-200 font-semibold block mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70 font-mono"
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
                  <label className="text-monochrome-200 font-semibold block mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={editFormData.dateTime}
                    onChange={(e) => setEditFormData({ ...editFormData, dateTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-monochrome-200 font-semibold block mb-1">Ticket Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.ticketPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, ticketPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70 font-mono"
                  />
                </div>

                <div>
                  <label className="text-monochrome-200 font-semibold block mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editFormData.maxCapacity}
                    onChange={(e) => setEditFormData({ ...editFormData, maxCapacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70 font-mono"
                  />
                </div>

                <div>
                  <label className="text-monochrome-200 font-semibold block mb-1">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    value={editFormData.registrationDeadline}
                    onChange={(e) => setEditFormData({ ...editFormData, registrationDeadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-monochrome-200 font-semibold block mb-1">Update Event Banner Poster</label>
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
                    className="px-3.5 py-2 rounded-xl bg-monochrome-800 hover:bg-brand hover:text-white text-monochrome-200 font-semibold flex items-center gap-2 cursor-pointer border border-monochrome-700 shadow-sm transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Choose New Image File
                  </label>
                </div>
                {editFormData.bannerUrl && (
                  <img src={editFormData.bannerUrl} alt="Preview" className="mt-2 h-20 rounded-lg object-cover border border-monochrome-700" />
                )}
              </div>

              <div>
                <label className="text-monochrome-200 font-semibold block mb-1">Event Description</label>
                <textarea
                  rows="3"
                  required
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-monochrome-100 focus:outline-none focus:border-brand/70 font-sans text-xs"
                />
              </div>

              {formError && (
                <p className="text-red-600 bg-red-500/10 p-2.5 rounded-lg border border-red-200 text-xs">{formError}</p>
              )}

              <div className="pt-3 border-t border-monochrome-750 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-monochrome-850 border border-monochrome-700 text-monochrome-200 hover:text-brand hover:bg-brand/5 text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-brand text-white font-extrabold text-xs hover:bg-brand-hover transition-all shadow-lg shadow-brand/10"
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

      {/* ============================================= */}
      {/* ATTENDEES MODAL                               */}
      {/* ============================================= */}
      {selectedEventAttendees && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-monochrome-950 border border-monochrome-700 rounded-2xl max-w-3xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-fade-in">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-monochrome-750 pb-3">
              <div>
                <h3 className="font-bold text-monochrome-100 text-base">Registered Participants</h3>
                <p className="text-xs text-monochrome-500 font-mono">{selectedEventAttendees.event?.title}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCSV}
                  className="px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover flex items-center gap-1.5 shadow-md shadow-brand/10 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV
                </button>

                <button onClick={() => setSelectedEventAttendees(null)} className="text-monochrome-500 hover:text-brand p-1 transition-colors">
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
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-monochrome-700 text-monochrome-100 text-xs focus:outline-none focus:border-brand/70 font-mono shadow-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-monochrome-750 text-monochrome-500 uppercase text-[10px]">
                    <th className="pb-2">Booking ID</th>
                    <th className="pb-2">Attendee Name</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Passes</th>
                    <th className="pb-2">Amount (₹)</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Check-in</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-monochrome-750">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-monochrome-500 text-xs">
                        No registered participants found.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-monochrome-800/40">
                        <td className="py-2.5 font-bold text-monochrome-100">{b.bookingNumber}</td>
                        <td className="py-2.5 text-monochrome-200 font-semibold">{b.attendeeName}</td>
                        <td className="py-2.5 text-monochrome-500">{b.attendeeEmail}</td>
                        <td className="py-2.5 text-monochrome-100 font-bold">{b.seatsBooked || b.ticketsCount || 1}</td>
                        <td className="py-2.5 text-monochrome-100 font-mono font-bold">₹{(b.totalAmount || 0).toLocaleString('en-IN')}</td>
                        <td className="py-2.5 uppercase font-bold text-emerald-600 text-[10px]">{b.paymentStatus}</td>
                        <td className="py-2.5">
                          {b.attended ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-[10px]">Checked In ✓</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-monochrome-800 text-monochrome-500 text-[10px]">Not Checked In</span>
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
