import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Ticket,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  PlusCircle,
  Bell,
  Menu,
  X,
  Search,
  CalendarDays,
  ChevronDown,
  Mail,
  Settings
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef(null);
  const notifRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const [navSearch, setNavSearch] = useState(queryParams.get('search') || '');

  // Sync search input state with URL changes (e.g. if filters are reset)
  useEffect(() => {
    const currentUrlSearch = new URLSearchParams(location.search).get('search') || '';
    if (currentUrlSearch !== navSearch) {
      setNavSearch(currentUrlSearch);
    }
  }, [location.search]);

  // Debounce search input changes before navigating and querying the API
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentUrlSearch = new URLSearchParams(location.search).get('search') || '';
      if (navSearch !== currentUrlSearch) {
        if (navSearch) {
          navigate(`/?search=${encodeURIComponent(navSearch)}`);
        } else {
          if (currentUrlSearch) {
            navigate('/');
          }
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [navSearch, navigate, location.search]);

  useEffect(() => {
    if (user) {
      setNotifications([
        { id: 1, title: 'Welcome to Evently', message: 'Browse top events and book your digital tickets.', time: 'Just now' },
        { id: 2, title: 'PDF Ticket Ready', message: 'Downloadable B&W PDF ticket available in My Tickets.', time: '5m ago' }
      ]);
    }
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setShowAccountMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setNavSearch(e.target.value);
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'organizer':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-monochrome-700 relative text-monochrome-300 shadow-sm">
      <div className="w-full px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-14 py-1.5 gap-2">

          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center group gap-1.5">
              <Ticket className="w-5 h-5 text-brand group-hover:rotate-12 transition-transform duration-300 fill-brand/10" />
              <span className="font-black text-xl tracking-wider uppercase text-brand hover:opacity-90 transition-opacity font-sans">
                Evently
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-sm md:max-w-md mx-2 sm:mx-4">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-monochrome-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={navSearch}
                onChange={handleSearchChange}
                placeholder="Search events, cities, topics..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-monochrome-700 text-monochrome-100 text-xs placeholder-monochrome-500 focus:outline-none focus:border-brand/70 focus:ring-1 focus:ring-brand/40 transition-all font-mono"
              />
              {navSearch && (
                <button
                  onClick={() => {
                    setNavSearch('');
                    navigate('/');
                  }}
                  className="absolute right-2 text-monochrome-500 hover:text-brand"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Spacer block (desktop links moved below) */}
          <div className="hidden lg:block flex-1" />

          {/* === RIGHT SECTION: Notifications + Account === */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">

            {/* Notification Bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setShowNotifs(!showNotifs); setShowAccountMenu(false); }}
                  className="p-2 rounded-lg text-monochrome-500 hover:text-brand hover:bg-monochrome-850 transition-all relative"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand animate-pulse" />
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 bg-monochrome-900 border border-monochrome-750 rounded-xl shadow-2xl p-3 z-50 text-xs text-monochrome-300">
                    <div className="flex justify-between items-center pb-2 border-b border-monochrome-800 font-semibold text-monochrome-100">
                      <span>Notifications</span>
                      <span className="text-[10px] text-monochrome-500 font-mono">{notifications.length} Unread</span>
                    </div>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="p-2 rounded-lg bg-monochrome-950 border border-monochrome-750 hover:border-monochrome-600">
                          <p className="font-semibold text-monochrome-100">{n.title}</p>
                          <p className="text-monochrome-500 text-[11px] mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-monochrome-650 font-mono mt-1 block">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            {user && <div className="w-px h-6 bg-monochrome-700" />}

            {/* Account Section */}
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => { setShowAccountMenu(!showAccountMenu); setShowNotifs(false); }}
                  className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-monochrome-850 transition-all group"
                >
                  {/* Avatar */}
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-lg object-cover border border-monochrome-700 group-hover:border-brand transition-colors"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-monochrome-800 to-monochrome-700 border border-monochrome-600 flex items-center justify-center text-[11px] font-bold text-white">
                      {getInitials(user.name)}
                    </div>
                  )}

                  {/* Name + Role */}
                  <div className="flex flex-col items-start text-monochrome-200">
                    <span className="text-xs font-semibold group-hover:text-brand leading-tight truncate max-w-[110px]">
                      {user.name}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0 rounded font-semibold uppercase tracking-wider border ${getRoleBadgeStyle(user.role)}`}>
                      {user.role}
                    </span>
                  </div>

                  <ChevronDown className="w-3 h-3 text-monochrome-500 transition-transform group-hover:text-brand" />
                </button>

                {/* Account Dropdown */}
                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-monochrome-900 border border-monochrome-750 rounded-xl shadow-2xl z-50 overflow-hidden text-monochrome-300">
                    {/* User Info Header */}
                    <div className="p-4 border-b border-monochrome-800 bg-monochrome-950/80">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-lg object-cover border border-monochrome-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-monochrome-800 to-monochrome-700 border border-monochrome-600 flex items-center justify-center text-sm font-bold text-white font-sans">
                            {getInitials(user.name)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-monochrome-100 truncate">{user.name}</p>
                          <p className="text-[11px] text-monochrome-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${getRoleBadgeStyle(user.role)}`}>
                          {user.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                          {user.role === 'organizer' && <PlusCircle className="w-3 h-3" />}
                          {user.role === 'participant' && <UserIcon className="w-3 h-3" />}
                          {user.role}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-1.5 bg-monochrome-900">
                      {user.role === 'participant' && (
                        <Link
                          to="/my-bookings"
                          onClick={() => setShowAccountMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-monochrome-300 hover:text-brand hover:bg-brand/5 transition-all font-semibold"
                        >
                          <Ticket className="w-3.5 h-3.5 text-brand" />
                          My Tickets
                        </Link>
                      )}
                      {(user.role === 'organizer' || user.role === 'admin') && (
                        <Link
                          to="/organizer"
                          onClick={() => setShowAccountMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-monochrome-300 hover:text-brand hover:bg-brand/5 transition-all font-semibold"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-brand" />
                          Organizer Studio
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setShowAccountMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-monochrome-300 hover:text-brand hover:bg-brand/5 transition-all font-semibold"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                          Admin Panel
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="p-1.5 border-t border-monochrome-750 bg-monochrome-900">
                      <button
                        onClick={() => { setShowAccountMenu(false); logout(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 font-semibold transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 text-xs font-bold text-white bg-brand rounded-md hover:bg-brand-hover transition-all shadow-sm shadow-brand/10"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-monochrome-500 hover:text-brand"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* SUB-NAVBAR CATEGORY STRIP (Desktop BookMyShow Style) */}
      <div className="w-full bg-monochrome-800 border-b border-monochrome-700 text-monochrome-300 hidden lg:block py-2 px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between">
          
          {/* Left: General Categories / Navigation */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`text-xs font-semibold hover:text-brand transition-colors flex items-center gap-1.5 ${
                location.pathname === '/' ? 'text-brand' : 'text-monochrome-400'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-brand" />
              All Events
            </Link>
          </div>

          {/* Right: User Studio / Action Spaces */}
          {user && (
            <div className="flex items-center gap-6">
              {user.role === 'participant' && (
                <Link
                  to="/my-bookings"
                  className={`text-xs font-semibold hover:text-brand transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/my-bookings' ? 'text-brand' : 'text-monochrome-450'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5 text-brand/80" />
                  My Tickets
                </Link>
              )}
              {(user.role === 'organizer' || user.role === 'admin') && (
                <Link
                  to="/organizer"
                  className={`text-xs font-semibold hover:text-brand transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/organizer' ? 'text-brand' : 'text-monochrome-450'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-brand/80" />
                  Organizer Studio
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`text-xs font-semibold hover:text-brand transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/admin' ? 'text-brand' : 'text-monochrome-450'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-brand/80" />
                  Admin Panel
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFFFFF] border-b border-monochrome-700 px-4 py-3 space-y-1 text-monochrome-300">

          {/* Events Section */}
          <div className="pb-2 mb-2 border-b border-monochrome-700/60">
            <p className="text-[10px] uppercase tracking-widest text-monochrome-500 font-semibold px-2 mb-1.5">Browse</p>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all border ${
                location.pathname === '/' ? 'bg-brand text-white border-transparent font-semibold shadow' : 'text-monochrome-400 hover:text-brand hover:bg-brand/5 border-transparent'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              All Events
            </Link>
          </div>

          {/* User Section */}
          {user && (
            <div className="pb-2 mb-2 border-b border-monochrome-700/60">
              <p className="text-[10px] uppercase tracking-widest text-monochrome-500 font-semibold px-2 mb-1.5">Your Space</p>

              {user.role === 'participant' && (
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all border ${
                    location.pathname === '/my-bookings' ? 'bg-brand text-white border-transparent font-semibold shadow' : 'text-monochrome-400 hover:text-brand hover:bg-brand/5 border-transparent'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  My Tickets
                </Link>
              )}

              {(user.role === 'organizer' || user.role === 'admin') && (
                <Link
                  to="/organizer"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all border ${
                    location.pathname === '/organizer' ? 'bg-brand text-white border-transparent font-semibold shadow' : 'text-monochrome-400 hover:text-brand hover:bg-brand/5 border-transparent'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Organizer Studio
                </Link>
              )}

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all border ${
                    location.pathname === '/admin' ? 'bg-brand text-white border-transparent font-semibold shadow' : 'text-monochrome-400 hover:text-brand hover:bg-brand/5 border-transparent'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
            </div>
          )}

          {/* Account Section (Mobile) */}
          {user ? (
            <div className="pt-1">
              <div className="flex items-center gap-3 px-2 py-2">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-lg object-cover border border-monochrome-700" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-monochrome-800 to-monochrome-750 border border-monochrome-700 flex items-center justify-center text-xs font-bold text-monochrome-350">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-monochrome-100 truncate">{user.name}</p>
                  <p className="text-[11px] text-monochrome-500 truncate">{user.email}</p>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border ${getRoleBadgeStyle(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="w-full flex items-center gap-2 px-2 py-2 mt-1 rounded-lg text-xs text-red-500 hover:text-red-650 hover:bg-red-500/10 transition-all font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center py-2 text-xs bg-brand text-white rounded-lg font-bold hover:bg-brand-hover transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
