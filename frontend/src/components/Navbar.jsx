import React, { useState, useEffect } from 'react';
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
  Search
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const queryParams = new URLSearchParams(location.search);
  const [navSearch, setNavSearch] = useState(queryParams.get('search') || '');

  useEffect(() => {
    if (user) {
      setNotifications([
        { id: 1, title: 'Welcome to Evently', message: 'Browse top events and book your digital tickets.', time: 'Just now' },
        { id: 2, title: 'PDF Ticket Ready', message: 'Downloadable B&W PDF ticket available in My Tickets.', time: '5m ago' }
      ]);
    }
  }, [user]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setNavSearch(val);
    if (val) {
      navigate(`/?search=${encodeURIComponent(val)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-monochrome-800/80 bg-monochrome-950/90 backdrop-blur-md">
      <div className="w-full px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-13 py-1.5 gap-2">
          
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <span className="font-black text-xl tracking-wider uppercase bg-gradient-to-r from-white via-monochrome-200 to-monochrome-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity font-sans">
                Evently
              </span>
            </Link>
          </div>

          <div className="flex-1 max-w-sm md:max-w-md mx-2 sm:mx-4">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-monochrome-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={navSearch}
                onChange={handleSearchChange}
                placeholder="Search events, cities, topics..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white text-xs placeholder-monochrome-500 focus:outline-none focus:border-white transition-all font-mono"
              />
              {navSearch && (
                <button
                  onClick={() => {
                    setNavSearch('');
                    navigate('/');
                  }}
                  className="absolute right-2 text-monochrome-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-4">

            {user?.role === 'participant' && (
              <Link 
                to="/my-bookings" 
                className={`text-xs font-medium flex items-center gap-1 transition-colors hover:text-white ${location.pathname === '/my-bookings' ? 'text-white underline underline-offset-6 decoration-2' : 'text-monochrome-400'}`}
              >
                <Ticket className="w-3.5 h-3.5" />
                My Tickets
              </Link>
            )}

            {user?.role === 'organizer' && (
              <Link 
                to="/organizer" 
                className={`text-xs font-medium flex items-center gap-1 transition-colors hover:text-white ${location.pathname === '/organizer' ? 'text-white underline underline-offset-6 decoration-2' : 'text-monochrome-400'}`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Organizer Studio
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`text-xs font-medium flex items-center gap-1 transition-colors hover:text-white ${location.pathname === '/admin' ? 'text-white underline underline-offset-6 decoration-2' : 'text-monochrome-400'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}
          </div>

          <div className="hidden sm:flex items-center space-x-3 flex-shrink-0">
            
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="p-1.5 rounded-full text-monochrome-400 hover:text-white hover:bg-monochrome-900 transition-colors relative"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 bg-monochrome-900 border border-monochrome-700 rounded-xl shadow-2xl p-3 z-50 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-monochrome-800 font-semibold text-white">
                      <span>Notifications</span>
                      <span className="text-[10px] text-monochrome-400 font-mono">{notifications.length} Unread</span>
                    </div>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="p-2 rounded-lg bg-monochrome-950/80 border border-monochrome-800 hover:border-monochrome-700">
                          <p className="font-semibold text-white">{n.title}</p>
                          <p className="text-monochrome-400 text-[11px] mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-monochrome-500 font-mono mt-1 block">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-monochrome-800">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-white truncate max-w-[120px]">{user.name}</span>
                  <span className="text-[9px] uppercase tracking-wider font-mono text-monochrome-400">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 rounded-lg bg-monochrome-900 hover:bg-white hover:text-black text-monochrome-300 transition-all border border-monochrome-800"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1 text-xs font-semibold text-black bg-white rounded-lg hover:bg-monochrome-200 transition-all shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-monochrome-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-monochrome-950 border-b border-monochrome-800 px-4 py-3 space-y-2.5">
          {user?.role === 'participant' && <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)} className="block text-xs text-monochrome-200 hover:text-white">My Tickets</Link>}
          {user?.role === 'organizer' && <Link to="/organizer" onClick={() => setMobileMenuOpen(false)} className="block text-xs text-monochrome-200 hover:text-white">Organizer Studio</Link>}
          {user?.role === 'admin' && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-xs text-monochrome-200 hover:text-white">Admin Panel</Link>}
          {user ? (
            <button onClick={logout} className="w-full text-left text-xs text-red-400 py-1">Logout ({user.name})</button>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center py-1.5 text-xs bg-white text-black rounded font-semibold">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
