import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import RestaurantCard from '../components/RestaurantCard';
import { SkeletonCard } from '../components/SkeletonCard';

const CUISINES = ['Pizza', 'Burger', 'Biryani', 'Chinese', 'South Indian', 'Desserts', 'Tacos', 'Noodles', 'Sandwich'];

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
  const [showFilters, setShowFilters]   = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating]         = useState(false);

  const fetchRestaurants = async (pageNum = 1, filters = {}) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 9 };
      if (filters.name)      params.name      = filters.name;
      if (filters.city)      params.city      = filters.city;
      if (filters.cuisine)   params.cuisine   = filters.cuisine;
      if (filters.minRating) params.minRating = filters.minRating;

      const { data } = await api.get('/restaurants', { params });
      setRestaurants(data.data?.restaurants || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalResults(data.pagination?.totalResults || 0);
    } catch {
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants(page, { name: search, city, cuisine, minRating });
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRestaurants(1, { name: search, city, cuisine, minRating });
  };

  const handleCuisineClick = (c) => {
    const newCuisine = cuisine === c ? '' : c;
    setCuisine(newCuisine);
    setPage(1);
    fetchRestaurants(1, { name: search, city, cuisine: newCuisine, minRating });
  };

  const handleClearFilters = () => {
    setSearch(''); setCity(''); setCuisine(''); setMinRating('');
    setPage(1);
    fetchRestaurants(1, {});
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser');
    }
    setLocating(true);
    toast.loading('Finding your location...', { id: 'geo-toast' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setLocating(false);
        toast.success(`📍 Location detected! (${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)})`, { id: 'geo-toast' });
      },
      () => {
        setLocating(false);
        toast.error('Location permission denied or unavailable', { id: 'geo-toast' });
      },
      { timeout: 10000 }
    );
  };

  const hasActiveFilters = search || city || cuisine || minRating;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: '0.5rem' }}>
            <h1 className="heading-2" style={{ margin: 0 }}>🍽️ Restaurants</h1>
            <button
              type="button"
              className={`btn ${userLocation ? 'btn-primary' : 'btn-ghost'} btn-sm`}
              onClick={handleDetectLocation}
              disabled={locating}
            >
              {locating ? '⌛ Locating...' : userLocation ? '📍 Location Active ✅' : '📍 Detect My Location'}
            </button>
          </div>

          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            {totalResults > 0 ? `${totalResults} restaurants mile` : 'Apne area ke best restaurants dhundho'}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-row">
            <input
              id="restaurant-search"
              type="text"
              className="form-input"
              placeholder="🔍  Restaurant name dhundho..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" id="search-btn">Search</button>
            <button
              type="button"
              className={`btn ${showFilters ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setShowFilters(!showFilters)}
              id="filter-toggle-btn"
            >
              🔧 Filters {hasActiveFilters && <span className="filter-dot" />}
            </button>
            {hasActiveFilters && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleClearFilters}>
                ✕ Clear
              </button>
            )}
          </form>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="filters-panel glass"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="filter-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Jaipur, Delhi"
                    value={city}
                    onChange={(e) => { setCity(e.target.value); setPage(1); }}
                  />
                </div>

                <div className="filter-group">
                  <label className="form-label">Min Rating</label>
                  <select
                    className="form-input"
                    value={minRating}
                    onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
                  >
                    <option value="">All Ratings</option>
                    <option value="4.5">⭐ 4.5+</option>
                    <option value="4.0">⭐ 4.0+</option>
                    <option value="3.5">⭐ 3.5+</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cuisine Chips */}
          <div className="cuisine-chips-row">
            {CUISINES.map((c) => (
              <button
                key={c}
                type="button"
                className={`cuisine-chip-btn ${cuisine === c ? 'active' : ''}`}
                onClick={() => handleCuisineClick(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Restaurant Grid */}
        {loading ? (
          <div className="grid-restaurants">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🍽️</div>
            <h3>Koi restaurant nahi mila</h3>
            <p>Filter change karke try karo</p>
            {hasActiveFilters && (
              <button className="btn btn-ghost" onClick={handleClearFilters} style={{ marginTop: '1rem' }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <motion.div
            className="grid-restaurants"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {restaurants.map((r) => (
              <RestaurantCard key={r._id} restaurant={r} userLocation={userLocation} />
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Prev
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <style>{`
        .search-row { display: flex; gap: 10px; margin-bottom: 1rem; }
        .filter-dot {
          display: inline-block; width: 6px; height: 6px;
          border-radius: 50%; background: var(--color-orange); margin-left: 4px;
        }
        .filters-panel {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem; padding: 1.25rem; margin-bottom: 1.25rem; border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .filter-group { display: flex; flex-direction: column; gap: 6px; }
        .cuisine-chips-row {
          display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 2rem;
          scrollbar-width: none;
        }
        .cuisine-chips-row::-webkit-scrollbar { display: none; }
        .cuisine-chip-btn {
          white-space: nowrap; padding: 6px 14px; border-radius: var(--radius-full);
          font-size: 0.8rem; font-weight: 500;
          background: var(--color-surface); border: 1px solid var(--color-border);
          color: var(--color-text-muted); transition: all 0.2s; cursor: pointer;
        }
        .cuisine-chip-btn:hover, .cuisine-chip-btn.active {
          border-color: var(--color-orange); color: var(--color-orange);
          background: rgba(255,107,53,0.1);
        }
        .grid-restaurants {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;
        }
        .pagination {
          display: flex; align-items: center; justify-content: center;
          gap: 1rem; margin-top: 3rem;
        }
        .page-info { font-size: 0.875rem; color: var(--color-text-muted); }
      `}</style>
    </div>
  );
}
