import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import RestaurantCard from '../components/RestaurantCard';
import { SkeletonCard } from '../components/SkeletonCard';

const CUISINES = ['Pizza', 'Burger', 'Biryani', 'Chinese', 'South Indian', 'Desserts', 'Tacos', 'Noodles', 'Sandwich'];
const RADIUS_OPTIONS = [
  { label: '1 km', value: 1000 },
  { label: '3 km', value: 3000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
];

export default function Restaurants() {
  const [restaurants, setRestaurants]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Filters & Location
  const [search, setSearch]             = useState('');
  const [city, setCity]                 = useState('');
  const [cuisine, setCuisine]           = useState('');
  const [minRating, setMinRating]       = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius]             = useState(5000);
  const [locating, setLocating]         = useState(false);
  const [listening, setListening]       = useState(false);

  const fetchRestaurants = async (pageNum = 1, filters = {}, loc = userLocation, rad = radius) => {
    setLoading(true);
    try {
      if (loc?.lat && loc?.lng) {
        // Location-aware search using MongoDB $geoNear endpoint
        const params = {
          lat: loc.lat,
          lng: loc.lng,
          radius: rad,
        };
        if (filters.name)      params.name      = filters.name;
        if (filters.cuisine)   params.cuisine   = filters.cuisine;
        if (filters.minRating) params.minRating = filters.minRating;

        const { data } = await api.get('/restaurants/nearby', { params });
        const list = data.data?.restaurants || [];
        setRestaurants(list);
        setTotalResults(list.length);
        setTotalPages(1);
      } else {
        // Standard city/text search
        const params = { page: pageNum, limit: 9 };
        if (filters.name)      params.name      = filters.name;
        if (filters.city)      params.city      = filters.city;
        if (filters.cuisine)   params.cuisine   = filters.cuisine;
        if (filters.minRating) params.minRating = filters.minRating;

        const { data } = await api.get('/restaurants', { params });
        setRestaurants(data.data?.restaurants || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalResults(data.pagination?.totalResults || 0);
      }
    } catch {
      setRestaurants([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants(page, { name: search, city, cuisine, minRating }, userLocation, radius);
  }, [page, userLocation, radius]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRestaurants(1, { name: search, city, cuisine, minRating }, userLocation, radius);
  };

  const handleCuisineClick = (c) => {
    const newCuisine = cuisine === c ? '' : c;
    setCuisine(newCuisine);
    setPage(1);
    fetchRestaurants(1, { name: search, city, cuisine: newCuisine, minRating }, userLocation, radius);
  };

  const handleClearFilters = () => {
    setSearch(''); setCity(''); setCuisine(''); setMinRating(''); setUserLocation(null);
    setPage(1);
    fetchRestaurants(1, {}, null, 5000);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser');
    }
    setLocating(true);
    toast.loading('Finding FoodRush restaurants near you...', { id: 'geo-toast' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setLocating(false);
        setPage(1);
        toast.success(`📍 Location active! Showing nearby restaurants`, { id: 'geo-toast' });
      },
      () => {
        setLocating(false);
        toast.error('Location permission denied. Showing all restaurants.', { id: 'geo-toast' });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return toast.error('Voice search is not supported in this browser');
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      toast.loading('🎙️ Sun raha hoon... Bolye! (e.g. Pizza)', { id: 'voice-toast' });
    };

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setSearch(text);
      setListening(false);
      toast.success(`🔍 "${text}" search ho raha hai`, { id: 'voice-toast' });
      setPage(1);
      fetchRestaurants(1, { name: text, city, cuisine, minRating }, userLocation, radius);
    };

    recognition.onerror = (err) => {
      setListening(false);
      if (err.error === 'not-allowed') {
        toast.error('Mic permission block hai! Browser top bar mein Mic ALLOW karo 🎙️', { id: 'voice-toast', duration: 5000 });
      } else {
        toast.error('Voice samajh nahi aayi, dobara boliye', { id: 'voice-toast' });
      }
    };

    recognition.onend = () => setListening(false);

    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  };

  const hasActiveFilters = search || city || cuisine || minRating || userLocation;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: '0.5rem' }}>
            <h1 className="heading-2" style={{ margin: 0 }}>
              {userLocation ? '📍 Restaurants Near You' : '🍽️ Restaurants'}
            </h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {userLocation && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setUserLocation(null)}
                  title="Search Anywhere"
                >
                  ✕ Clear Location
                </button>
              )}
              <button
                type="button"
                className={`btn ${userLocation ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                onClick={handleDetectLocation}
                disabled={locating}
              >
                {locating ? '⌛ Locating...' : userLocation ? '📍 GPS Active ✅' : '📍 Detect My Location'}
              </button>
            </div>
          </div>

          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            {userLocation
              ? `Showing nearby restaurants within ${(radius / 1000)} km (${totalResults} found)`
              : totalResults > 0 ? `${totalResults} restaurants available` : 'Apne area ke best restaurants dhundho'}
          </p>

          {/* Location Radius Selector Pills */}
          {userLocation && (
            <div className="radius-pills-row">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                📏 Radius:
              </span>
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`radius-pill ${radius === opt.value ? 'active' : ''}`}
                  onClick={() => setRadius(opt.value)}
                >
                  Within {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-row">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="form-input search-input"
                placeholder={userLocation ? "Nearby restaurant ya dish dhundho..." : "Restaurant name ya dish dhundho..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="button"
                className={`mic-btn ${listening ? 'listening' : ''}`}
                onClick={handleVoiceSearch}
                title="Voice Search 🎙️"
              >
                🎙️
              </button>
            </div>
            {!userLocation && (
              <input
                type="text"
                className="form-input city-input"
                placeholder="City (e.g. Jaipur)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            )}
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          {/* Cuisine Filter Pills */}
          <div className="cuisine-pills">
            {CUISINES.map((c) => (
              <button
                key={c}
                type="button"
                className={`cuisine-pill ${cuisine === c ? 'active' : ''}`}
                onClick={() => handleCuisineClick(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Active Filters Clear Bar */}
          {hasActiveFilters && (
            <div className="active-filter-bar">
              <span className="filter-text">
                Filters: {userLocation && `📍 ${(radius / 1000)}km radius`} {search && `• Name: "${search}"`} {city && `• City: "${city}"`} {cuisine && `• Cuisine: "${cuisine}"`}
              </span>
              <button type="button" className="clear-btn" onClick={handleClearFilters}>
                ✕ Clear All
              </button>
            </div>
          )}
        </motion.div>

        {/* Restaurant Cards Grid */}
        <div style={{ marginTop: '2rem' }}>
          {loading ? (
            <div className="grid-restaurants">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🍽️</div>
              <h3>Koi restaurant nahi mila</h3>
              <p className="text-muted">
                {userLocation
                  ? `Within ${(radius / 1000)} km koi open restaurant nahi mila. Radius badhayein ya clear location karein.`
                  : 'Dusri search ya filters try karo'}
              </p>
              <button type="button" className="btn btn-ghost" onClick={handleClearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div
              className="grid-restaurants"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {restaurants.map((rest) => (
                <RestaurantCard
                  key={rest._id}
                  restaurant={rest}
                  userLocation={userLocation}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Pagination (for standard view) */}
        {!userLocation && totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <style>{`
        .search-row {
          display: flex; gap: 10px; margin-bottom: 1rem; flex-wrap: wrap;
        }
        .search-input-wrap {
          position: relative; flex: 1; min-width: 220px;
        }
        .search-input {
          padding-left: 38px; padding-right: 42px; width: 100%;
        }
        .search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          font-size: 0.9rem; pointer-events: none; opacity: 0.6;
        }
        .mic-btn {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: transparent; border: none; font-size: 1rem; cursor: pointer;
          opacity: 0.7; transition: all 0.2s;
        }
        .mic-btn:hover { opacity: 1; transform: translateY(-50%) scale(1.1); }
        .mic-btn.listening { animation: pulseMic 1s infinite alternate; }
        @keyframes pulseMic {
          0% { transform: translateY(-50%) scale(1); opacity: 0.7; }
          100% { transform: translateY(-50%) scale(1.3); opacity: 1; }
        }
        .city-input { width: 160px; }

        .radius-pills-row {
          display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
          margin-bottom: 1rem; padding: 8px 12px; border-radius: 12px;
          background: rgba(255, 107, 53, 0.08); border: 1px solid rgba(255, 107, 53, 0.2);
        }
        .radius-pill {
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: 999px; padding: 4px 12px; font-size: 0.8rem;
          color: var(--color-text-muted); cursor: pointer; transition: all 0.2s;
        }
        .radius-pill:hover { border-color: var(--color-orange); color: #fff; }
        .radius-pill.active {
          background: var(--color-orange); border-color: var(--color-orange);
          color: #fff; font-weight: 700;
        }

        .cuisine-pills {
          display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px;
          scrollbar-width: none;
        }
        .cuisine-pills::-webkit-scrollbar { display: none; }
        .cuisine-pill {
          white-space: nowrap; font-size: 0.8rem; font-weight: 500;
          padding: 6px 14px; border-radius: var(--radius-full);
          background: var(--color-surface); border: 1px solid var(--color-border);
          color: var(--color-text-muted); cursor: pointer; transition: all 0.2s;
        }
        .cuisine-pill:hover { border-color: var(--color-orange); color: var(--color-text); }
        .cuisine-pill.active {
          background: rgba(255, 107, 53, 0.15); border-color: var(--color-orange);
          color: var(--color-orange); font-weight: 600;
        }

        .active-filter-bar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 14px; border-radius: 10px; background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08); margin-top: 12px; font-size: 0.82rem;
        }
        .filter-text { color: var(--color-text-muted); }
        .clear-btn {
          background: transparent; border: none; color: #EF4444; font-size: 0.8rem;
          cursor: pointer; font-weight: 600;
        }

        .grid-restaurants {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .pagination {
          display: flex; justify-content: center; align-items: center; gap: 16px;
          margin-top: 3rem;
        }
        .page-info { font-size: 0.88rem; color: var(--color-text-muted); }
      `}</style>
    </div>
  );
}
