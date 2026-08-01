import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  MapPin, 
  Ticket,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import EventCard from '../components/EventCard';

const INDIAN_METROS = ['All', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Goa'];

export default function Home() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchParam = queryParams.get('search') || '';

  const [events, setEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCity, setSelectedCity] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (e) {
      console.error('Error fetching categories');
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchParam,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        city: selectedCity !== 'All' ? selectedCity : undefined,
        location: selectedCity !== 'All' ? selectedCity : undefined,
        page,
        limit: 9
      };
      const res = await axios.get('/api/events', { params });
      setEvents(res.data.events);
      setTotalPages(res.data.pages);
      setTotalEvents(res.data.totalEvents);

      if (featuredEvents.length === 0 && res.data.events.length > 0) {
        setFeaturedEvents(res.data.events.slice(0, 5));
      }
    } catch (e) {
      console.error('Error fetching events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchEvents(); }, [searchParam, selectedCategory, selectedType, selectedCity, page]);

  useEffect(() => {
    if (featuredEvents.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredEvents.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [featuredEvents]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedType('all');
    setSelectedCity('All');
    setPage(1);
  };

  const nextSlide = () => {
    if (featuredEvents.length > 0) setCurrentSlide((currentSlide + 1) % featuredEvents.length);
  };
  const prevSlide = () => {
    if (featuredEvents.length > 0) setCurrentSlide((currentSlide - 1 + featuredEvents.length) % featuredEvents.length);
  };

  const hasActiveFilters = searchParam || selectedCategory !== 'All' || selectedType !== 'all' || selectedCity !== 'All';

  return (
    <div className="min-h-screen pb-12">
      
      {/* FULL-WIDTH SLIDING HERO CAROUSEL */}
      <section className="relative w-full overflow-hidden bg-monochrome-950">
        {featuredEvents.length > 0 ? (
          <div className="relative w-full h-[320px] md:h-[420px] overflow-hidden">
            
            <div 
              className="flex w-full h-full transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {featuredEvents.map((evt, idx) => (
                <div key={evt._id || idx} className="w-full flex-shrink-0 relative h-full">
                  <img
                    src={evt.bannerUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="500" viewBox="0 0 1000 500"><rect width="1000" height="500" fill="%23111115"/></svg>'}
                    alt={evt.title}
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-monochrome-950 via-monochrome-950/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-monochrome-950/80 via-transparent to-monochrome-950/80" />

                  <div className="absolute inset-0 max-w-[1600px] mx-auto px-5 sm:px-5 lg:px-6 flex flex-col justify-end pb-8 pointer-events-none">
                    
                    <div className="flex items-center gap-2 mb-3 pointer-events-auto">
                      <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-white text-black flex items-center gap-1 shadow-lg">
                        <Sparkles className="w-3 h-3 fill-black text-black" />
                        FEATURED
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/70 backdrop-blur-md text-white border border-white/20">
                        {evt.category}
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight line-clamp-1 mb-1.5">
                      {evt.title}
                    </h2>

                    <div className="flex items-center gap-4 text-xs text-monochrome-300 font-mono mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-white" />
                        {new Date(evt.dateTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-white" />
                        {evt.venue?.city || evt.city || 'Bengaluru'}
                      </span>
                      <span className="text-monochrome-400">{evt.availableSeats} seats left</span>
                    </div>

                    <div className="pointer-events-auto">
                      <Link
                        to={`/events/${evt._id}`}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-monochrome-200 transition-all shadow-2xl"
                      >
                        <Ticket className="w-4 h-4" />
                        {evt.ticketPrice === 0 ? 'Get Free Ticket' : `Book · ₹${evt.ticketPrice.toLocaleString('en-IN')}`}
                      </Link>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-white hover:text-black text-white border border-white/10 backdrop-blur-sm transition-all z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-white hover:text-black text-white border border-white/10 backdrop-blur-sm transition-all z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 right-6 flex items-center gap-1.5 z-20">
              {featuredEvents.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1 rounded-full transition-all ${
                    currentSlide === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="h-48 w-full bg-monochrome-900 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          </div>
        )}
      </section>

      {/* FILTER DROPDOWNS */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 py-4 space-y-3">
        
        <div className="flex items-center gap-2 flex-wrap">
          
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl bg-monochrome-900 border border-monochrome-800 text-white text-xs font-medium focus:outline-none focus:border-white cursor-pointer appearance-none pr-7"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id || cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={(e) => { setSelectedCity(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl bg-monochrome-900 border border-monochrome-800 text-white text-xs font-medium focus:outline-none focus:border-white cursor-pointer appearance-none pr-7"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            {INDIAN_METROS.map((city) => (
              <option key={city} value={city}>{city === 'All' ? 'All Cities' : city}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl bg-monochrome-900 border border-monochrome-800 text-white text-xs font-medium focus:outline-none focus:border-white cursor-pointer appearance-none pr-7"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            <option value="all">All Prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-xl text-[11px] text-monochrome-400 hover:text-white flex items-center gap-1 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}

        </div>

        {/* Events count + heading */}
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-bold text-white">
            {searchParam ? `"${searchParam}"` : 'Upcoming Events'}
          </h2>
          <span className="text-[11px] text-monochrome-500 font-mono">
            {totalEvents} events
          </span>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Calendar className="w-8 h-8 text-monochrome-700 mx-auto" />
            <p className="text-sm text-monochrome-400">No events found</p>
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-monochrome-200"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg bg-monochrome-900 border border-monochrome-800 text-white disabled:opacity-30 hover:bg-monochrome-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-monochrome-500">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg bg-monochrome-900 border border-monochrome-800 text-white disabled:opacity-30 hover:bg-monochrome-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
