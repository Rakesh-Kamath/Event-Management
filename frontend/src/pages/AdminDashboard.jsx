import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  Check, 
  Clock,
  Search,
  Printer,
  TrendingUp,
  Award,
  AlertCircle,
  FileText,
  Eye,
  X
} from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('events');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedOrganizerActivity, setSelectedOrganizerActivity] = useState(null);
  const [modifyingEventId, setModifyingEventId] = useState(null);
  const [modificationNote, setModificationNote] = useState('');

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, pendingRes, usersRes, eventsRes] = await Promise.all([
        axios.get('/api/analytics/admin'),
        axios.get('/api/events/pending'),
        axios.get('/api/users'),
        axios.get('/api/events?limit=100&status=All')
      ]);
      setMetrics(analyticsRes.data.metrics);
      setPendingEvents(pendingRes.data);
      setUsers(usersRes.data);
      setAllEvents(eventsRes.data.events || []);
    } catch (err) {
      console.error('Error loading admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveEvent = async (eventId, action, note = '') => {
    try {
      const payload = { action };
      if (action === 'approve') payload.status = 'approved';
      if (action === 'reject') payload.status = 'rejected';
      if (action === 'modify') {
        payload.status = 'pending';
        payload.feedback = note;
      }
      await axios.put(`/api/admin/events/${eventId}/status`, payload);
      setModifyingEventId(null);
      setModificationNote('');
      fetchAdminData();
    } catch (err) {
      alert('Error updating event approval status');
    }
  };

  const handleToggleBlockUser = async (userId) => {
    try {
      await axios.patch(`/api/users/${userId}/toggle-block`);
      fetchAdminData();
    } catch (err) {
      alert('Error updating user block status');
    }
  };

  const handleApproveOrganizer = async (userId) => {
    try {
      await axios.patch(`/api/users/${userId}/approve-organizer`);
      fetchAdminData();
    } catch (err) {
      alert('Error approving organizer');
    }
  };

  const handleDownloadPDFReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const q = userSearchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const organizers = users.filter(u => u.role === 'organizer');
  const participants = users.filter(u => u.role === 'participant');

  const organizerPerformance = organizers.map(org => {
    const orgEvents = allEvents.filter(e => e.organizerId === org._id || e.organizer === org._id || e.organizerName === org.name || e.organizerName === org.organizationName);
    const totalEventsCount = orgEvents.length;
    const activeEventsCount = orgEvents.filter(e => e.status === 'approved').length;
    return {
      organizer: org,
      totalEventsCount,
      activeEventsCount,
      events: orgEvents
    };
  });

  return (
    <div className="min-h-screen max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 py-6 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-monochrome-800 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-white" />
            Administrator Control Center
          </h1>
          <p className="text-xs text-monochrome-400 font-mono mt-1">
            Platform governance, event approvals, organizer verification, user moderation & PDF report generation.
          </p>
        </div>

        <div className="flex flex-wrap items-center bg-monochrome-900 border border-monochrome-800 rounded-xl p-1 font-mono text-xs gap-1">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'events' ? 'bg-white text-black font-bold' : 'text-monochrome-400 hover:text-white'
            }`}
          >
            Approvals ({pendingEvents.length})
          </button>

          <button
            onClick={() => setActiveTab('organizers')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'organizers' ? 'bg-white text-black font-bold' : 'text-monochrome-400 hover:text-white'
            }`}
          >
            Organizers ({organizers.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'users' ? 'bg-white text-black font-bold' : 'text-monochrome-400 hover:text-white'
            }`}
          >
            User Directory ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'reports' ? 'bg-white text-black font-bold' : 'text-monochrome-400 hover:text-white'
            }`}
          >
            PDF Reports & Analytics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 print:grid-cols-3">
        
        <div className="glass-panel p-4 rounded-2xl border border-monochrome-800">
          <span className="text-[10px] uppercase font-mono tracking-widest text-monochrome-400 block">Total Users</span>
          <p className="text-2xl font-extrabold font-mono text-white mt-1">{metrics?.totalUsers || participants.length || 0}</p>
          <span className="text-[10px] text-monochrome-500 font-mono">Participants</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-monochrome-800">
          <span className="text-[10px] uppercase font-mono tracking-widest text-monochrome-400 block">Organizers</span>
          <p className="text-2xl font-extrabold font-mono text-white mt-1">{metrics?.totalOrganizers || organizers.length || 0}</p>
          <span className="text-[10px] text-monochrome-500 font-mono">Hosts</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-monochrome-800">
          <span className="text-[10px] uppercase font-mono tracking-widest text-monochrome-400 block">Total Events</span>
          <p className="text-2xl font-extrabold font-mono text-white mt-1">{metrics?.totalEvents || allEvents.length || 0}</p>
          <span className="text-[10px] text-monochrome-500 font-mono">Platform events</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-monochrome-800">
          <span className="text-[10px] uppercase font-mono tracking-widest text-monochrome-400 block">Active Events</span>
          <p className="text-2xl font-extrabold font-mono text-white mt-1">{metrics?.activeEvents || 5}</p>
          <span className="text-[10px] text-emerald-400 font-mono">Published live</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-monochrome-800">
          <span className="text-[10px] uppercase font-mono tracking-widest text-monochrome-400 block">Total Bookings</span>
          <p className="text-2xl font-extrabold font-mono text-white mt-1">{metrics?.totalBookings || 0}</p>
          <span className="text-[10px] text-monochrome-500 font-mono">Reservations</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-monochrome-800 col-span-2 md:col-span-1">
          <span className="text-[10px] uppercase font-mono tracking-widest text-monochrome-400 block">Platform Revenue</span>
          <p className="text-2xl font-extrabold font-mono text-white mt-1">₹{(metrics?.totalRevenue || 0).toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-monochrome-500 font-mono">INR processed</span>
        </div>

      </div>

      {activeTab === 'events' && (
        <div className="glass-panel p-6 rounded-3xl border border-monochrome-800 space-y-4">
          <div className="flex items-center justify-between border-b border-monochrome-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-white" />
              Event Approval & Moderation Queue
            </h3>
            <span className="text-xs font-mono text-monochrome-400">{pendingEvents.length} pending events</span>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-monochrome-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-white font-bold">All Events Reviewed!</p>
              <p>There are currently no newly created events awaiting administrator approval.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEvents.map((evt) => {
                const venueName = evt.venue?.name || evt.venueName || evt.venue || 'Venue';
                const city = evt.venue?.city || evt.city || 'Bengaluru';
                const maxCap = evt.maxCapacity || evt.totalCapacity || 100;

                return (
                  <div key={evt._id} className="p-5 rounded-2xl bg-monochrome-900 border border-monochrome-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-black">
                          {evt.category}
                        </span>
                        <span className="text-xs text-monochrome-400 font-mono">
                          Organizer: {evt.organizerId?.name || evt.organizerName}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white leading-snug">{evt.title}</h4>
                      <p className="text-xs text-monochrome-400 line-clamp-2">{evt.description}</p>
                      
                      <div className="text-[11px] text-monochrome-400 font-mono pt-1">
                        Venue: {venueName}, {city}, India • Capacity: {maxCap} Seats • Price: ₹{evt.ticketPrice.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
                      
                      <button
                        onClick={() => handleApproveEvent(evt._id, 'approve')}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-monochrome-200 transition-all flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Check className="w-4 h-4" />
                        Approve & Publish
                      </button>

                      <button
                        onClick={() => setModifyingEventId(evt._id)}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-monochrome-800 border border-monochrome-700 text-monochrome-200 font-semibold text-xs hover:bg-monochrome-700 transition-all flex items-center justify-center gap-1.5"
                      >
                        <AlertCircle className="w-4 h-4" />
                        Request Modifications
                      </button>

                      <button
                        onClick={() => handleApproveEvent(evt._id, 'reject')}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-red-950 border border-red-800 text-red-300 font-bold text-xs hover:bg-red-900 transition-all flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'organizers' && (
        <div className="glass-panel p-6 rounded-3xl border border-monochrome-800 space-y-4">
          <div className="flex items-center justify-between border-b border-monochrome-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Organizer Management & Activity Tracking</h3>
              <p className="text-xs text-monochrome-400 font-mono">Approve host applications, monitor organizer activity, and manage block status.</p>
            </div>
            <span className="text-xs font-mono text-monochrome-400">{organizers.length} registered organizers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-monochrome-800 text-monochrome-400 uppercase text-[10px]">
                  <th className="pb-3">Organizer Name</th>
                  <th className="pb-3">Organization</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Approval Status</th>
                  <th className="pb-3">Account State</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-monochrome-800/60">
                {organizers.map((org) => (
                  <tr key={org._id} className="hover:bg-monochrome-900/40">
                    <td className="py-3.5 font-bold text-white">{org.name}</td>
                    <td className="py-3.5 text-monochrome-300">{org.organizationName || 'Individual Host'}</td>
                    <td className="py-3.5 text-monochrome-400">{org.email}</td>
                    <td className="py-3.5">
                      {!org.isApproved ? (
                        <button
                          onClick={() => handleApproveOrganizer(org._id)}
                          className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold hover:bg-amber-900"
                        >
                          Pending (Click to Approve)
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-bold">Approved ✓</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      {org.isBlocked || org.status === 'blocked' ? (
                        <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] uppercase font-bold">
                          Blocked
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] uppercase font-bold">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrganizerActivity(org)}
                        className="px-3 py-1 rounded bg-monochrome-800 hover:bg-white hover:text-black text-white text-[11px] font-semibold transition-colors"
                      >
                        <Eye className="w-3 h-3 inline mr-1" />
                        View Activity
                      </button>

                      <button
                        onClick={() => handleToggleBlockUser(org._id)}
                        className={`px-3 py-1 rounded text-[11px] font-bold transition-colors ${
                          org.isBlocked
                            ? 'bg-emerald-900 text-emerald-200 hover:bg-emerald-800'
                            : 'bg-red-950/80 text-red-300 border border-red-800 hover:bg-red-900'
                        }`}
                      >
                        {org.isBlocked ? 'Unblock' : 'Block Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-3xl border border-monochrome-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-monochrome-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Registered User Directory</h3>
              <p className="text-xs text-monochrome-400 font-mono">View all participants, search by email/name, and manage account suspensions.</p>
            </div>
            <span className="text-xs font-mono text-monochrome-400">{filteredUsers.length} accounts matching</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-monochrome-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search users by name, email, or role (participant, organizer)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white text-xs focus:outline-none focus:border-white font-mono"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-monochrome-800 text-monochrome-400 uppercase text-[10px]">
                  <th className="pb-3">User Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Account Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-monochrome-800/60">
                {filteredUsers.map((usr) => (
                  <tr key={usr._id} className="hover:bg-monochrome-900/40">
                    <td className="py-3.5 font-bold text-white">{usr.name}</td>
                    <td className="py-3.5 text-monochrome-300">{usr.email}</td>
                    <td className="py-3.5 uppercase font-bold text-white">{usr.role}</td>
                    <td className="py-3.5">
                      {usr.isBlocked || usr.status === 'blocked' ? (
                        <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] uppercase font-bold">
                          Suspended / Blocked
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] uppercase font-bold">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      {usr.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleBlockUser(usr._id)}
                          className={`px-3 py-1 rounded text-[11px] font-bold transition-colors ${
                            usr.isBlocked
                              ? 'bg-emerald-900 text-emerald-200 hover:bg-emerald-800'
                              : 'bg-red-950/80 text-red-300 border border-red-800 hover:bg-red-900'
                          }`}
                        >
                          {usr.isBlocked ? 'Unblock User' : 'Block Account'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="glass-panel p-8 rounded-3xl border border-monochrome-800 space-y-8 print:p-0 print:border-none">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-monochrome-800 pb-4 print:hidden">
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-white" />
                Platform Executive Performance & Revenue PDF Reports
              </h3>
              <p className="text-xs text-monochrome-400 font-mono mt-1">
                Event-wise bookings, popular events, organizer performance, & monthly ticket sales.
              </p>
            </div>

            <button
              onClick={handleDownloadPDFReport}
              className="px-5 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-monochrome-200 flex items-center gap-2 shadow-xl transition-all"
            >
              <Printer className="w-4 h-4" />
              Download Report as PDF
            </button>
          </div>

          <div className="space-y-8 text-white font-sans">
            
            <div className="border-b border-monochrome-700 pb-4 flex justify-between items-end">
              <div>
                <span className="text-2xl font-black tracking-tight block">EVENTLY PLATFORM REPORT</span>
                <span className="text-xs text-monochrome-400 font-mono">Full-Stack Event Management System</span>
              </div>
              <div className="text-right text-xs font-mono text-monochrome-400">
                <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
                <p>Status: Official Executive Summary</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-base font-bold text-white border-l-4 border-white pl-2">1. Event-wise Bookings & Revenue Report</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border border-monochrome-800">
                  <thead className="bg-monochrome-900 text-monochrome-300">
                    <tr>
                      <th className="p-2.5 border-b border-monochrome-800">Event Title</th>
                      <th className="p-2.5 border-b border-monochrome-800">City</th>
                      <th className="p-2.5 border-b border-monochrome-800">Category</th>
                      <th className="p-2.5 border-b border-monochrome-800">Price (₹)</th>
                      <th className="p-2.5 border-b border-monochrome-800">Available Seats</th>
                      <th className="p-2.5 border-b border-monochrome-800">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-monochrome-800">
                    {allEvents.map(e => (
                      <tr key={e._id}>
                        <td className="p-2.5 font-bold">{e.title}</td>
                        <td className="p-2.5 text-monochrome-300">{e.city || e.venue?.city || 'Bengaluru'}</td>
                        <td className="p-2.5">{e.category}</td>
                        <td className="p-2.5 font-bold">₹{e.ticketPrice.toLocaleString('en-IN')}</td>
                        <td className="p-2.5">{e.availableSeats} / {e.maxCapacity || e.totalCapacity || 100}</td>
                        <td className="p-2.5 uppercase font-bold text-emerald-400">{e.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-base font-bold text-white border-l-4 border-white pl-2">2. Popular Events Ranking</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allEvents.slice(0, 4).map((e, idx) => (
                  <div key={e._id} className="p-4 rounded-xl bg-monochrome-900 border border-monochrome-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-monochrome-400">RANK #{idx + 1}</span>
                      <h5 className="font-bold text-sm text-white">{e.title}</h5>
                      <span className="text-xs text-monochrome-400 font-mono">{e.category} • ₹{e.ticketPrice}</span>
                    </div>
                    <Award className="w-6 h-6 text-white" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-base font-bold text-white border-l-4 border-white pl-2">3. Organizer Performance Breakdown</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border border-monochrome-800">
                  <thead className="bg-monochrome-900 text-monochrome-300">
                    <tr>
                      <th className="p-2.5 border-b border-monochrome-800">Organizer Name</th>
                      <th className="p-2.5 border-b border-monochrome-800">Organization</th>
                      <th className="p-2.5 border-b border-monochrome-800">Events Published</th>
                      <th className="p-2.5 border-b border-monochrome-800">Account Approval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-monochrome-800">
                    {organizerPerformance.map(op => (
                      <tr key={op.organizer._id}>
                        <td className="p-2.5 font-bold">{op.organizer.name}</td>
                        <td className="p-2.5 text-monochrome-300">{op.organizer.organizationName || 'Independent Host'}</td>
                        <td className="p-2.5 font-bold">{op.totalEventsCount} Published ({op.activeEventsCount} Active)</td>
                        <td className="p-2.5 text-emerald-400 font-bold">{op.organizer.isApproved ? 'Approved ✓' : 'Pending'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {modifyingEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-monochrome-950 border border-monochrome-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Request Event Modifications</h3>
            <p className="text-xs text-monochrome-400">Specify what details the organizer should update before approval.</p>
            <textarea
              rows="4"
              value={modificationNote}
              onChange={(e) => setModificationNote(e.target.value)}
              placeholder="e.g. Please update the venue address details and add speaker bio..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white text-xs focus:outline-none"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModifyingEventId(null)} className="px-4 py-2 rounded-xl bg-monochrome-900 border border-monochrome-700 text-xs font-semibold text-monochrome-300">
                Cancel
              </button>
              <button
                onClick={() => handleApproveEvent(modifyingEventId, 'modify', modificationNote)}
                className="px-5 py-2 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-monochrome-200"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOrganizerActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-monochrome-950 border border-monochrome-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-monochrome-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Organizer Activity Log</h3>
                <p className="text-xs text-monochrome-400 font-mono">{selectedOrganizerActivity.name} ({selectedOrganizerActivity.email})</p>
              </div>
              <button onClick={() => setSelectedOrganizerActivity(null)} className="text-monochrome-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Events Created by Host</h4>
              {allEvents.filter(e => e.organizerId === selectedOrganizerActivity._id || e.organizer === selectedOrganizerActivity._id || e.organizerName === selectedOrganizerActivity.name).length === 0 ? (
                <p className="text-xs text-monochrome-500 py-4 text-center">No events created by this organizer yet.</p>
              ) : (
                <div className="space-y-2">
                  {allEvents.filter(e => e.organizerId === selectedOrganizerActivity._id || e.organizer === selectedOrganizerActivity._id || e.organizerName === selectedOrganizerActivity.name).map(e => (
                    <div key={e._id} className="p-3 rounded-xl bg-monochrome-900 border border-monochrome-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white">{e.title}</p>
                        <p className="text-[11px] text-monochrome-400 font-mono">{e.city} • ₹{e.ticketPrice}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${e.status === 'approved' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-300'}`}>
                        {e.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
