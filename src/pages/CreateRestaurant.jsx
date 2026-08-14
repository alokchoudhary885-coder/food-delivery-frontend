import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ImageUpload from '../components/ImageUpload';
import useAuthStore from '../store/authStore';

const CUISINE_OPTIONS = ['Pizza', 'Burger', 'Biryani', 'Chinese', 'South Indian', 'Desserts', 'Tacos', 'Noodles', 'Sandwich', 'Bakery'];

export default function CreateRestaurant() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    name: '', phone: '', deliveryFee: 50,
    address: { street: '', city: '', state: '', pincode: '' },
    location: {
      type: 'Point',
      coordinates: [75.7873, 26.9124], // default Jaipur
    },
    cuisine: [],
    image: '',
  });
  const [locating, setLocating] = useState(false);
  const [locationPinned, setLocationPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleCuisine = (c) => {
    setForm((prev) => ({
      ...prev,
      cuisine: prev.cuisine.includes(c)
        ? prev.cuisine.filter((x) => x !== c)
        : [...prev.cuisine, c],
    }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser');
    }
    setLocating(true);
    toast.loading('Detecting restaurant GPS coordinates...', { id: 'rest-geo' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((prev) => ({
          ...prev,
          location: {
            type: 'Point',
            coordinates: [longitude, latitude], // GeoJSON order: [lng, lat]
          },
        }));
        setLocating(false);
        setLocationPinned(true);
        toast.success(`📍 Location Pinned: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`, { id: 'rest-geo' });
      },
      () => {
        setLocating(false);
        toast.error('Location permission denied. Pinned city center coordinates.', { id: 'rest-geo' });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address.city) return toast.error('Name aur city required hai');
    setLoading(true);
    try {
      await api.post('/restaurants', form);
      setSuccess(true);
      toast.success('Restaurant create ho gaya! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="page">
      <div className="container" style={{ paddingTop: '3rem', maxWidth: 500, textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h2 className="heading-2">Restaurant Created!</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Ab dashboard pe jao aur menu add karo</p>
        <a href="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard →</a>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: 600 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>🏪 New Restaurant</h1>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>Apna restaurant FoodRush par register karo</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Image Upload */}
            <div className="form-group">
              <label className="form-label">🖼️ Restaurant Banner Image</label>
              <ImageUpload
                type="restaurant"
                currentImage={form.image}
                onUpload={(url) => setForm({ ...form, image: url })}
              />
            </div>

            {/* Name */}
            <div className="form-group">
              <label className="form-label">Restaurant Name *</label>
              <input className="form-input" placeholder="e.g. Pizza Palace" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" placeholder="+91 98765 43210" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>

            {/* Delivery Fee */}
            <div className="form-group">
              <label className="form-label">Delivery Fee (₹)</label>
              <input type="number" className="form-input" min={0} value={form.deliveryFee}
                onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })} />
            </div>

            {/* Address & GPS Location Pinning */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="form-label" style={{ margin: 0 }}>📍 Address & GPS Location</label>
                <button
                  type="button"
                  className={`btn btn-xs ${locationPinned ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={handleDetectLocation}
                  disabled={locating}
                >
                  {locating ? '⌛ Detecting...' : locationPinned ? '📍 GPS Pinned ✅' : '📍 Pin My GPS Location'}
                </button>
              </div>

              <div className="addr-grid">
                {[
                  { key: 'street', placeholder: 'Street / Colony' },
                  { key: 'city',   placeholder: 'City *' },
                  { key: 'state',  placeholder: 'State' },
                  { key: 'pincode', placeholder: 'Pincode' },
                ].map(({ key, placeholder }) => (
                  <input key={key} className="form-input" placeholder={placeholder}
                    value={form.address[key]}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, [key]: e.target.value } })}
                  />
                ))}
              </div>
              {locationPinned && (
                <p style={{ fontSize: '0.75rem', color: '#22C55E', marginTop: 6, margin: 0 }}>
                  ✓ Exact Coordinates: Lat {form.location.coordinates[1].toFixed(4)}, Lng {form.location.coordinates[0].toFixed(4)}
                </p>
              )}
            </div>

            {/* Cuisine Type */}
            <div className="form-group">
              <label className="form-label">🍽️ Cuisine Types</label>
              <div className="cuisine-chips" style={{ marginTop: '8px' }}>
                {CUISINE_OPTIONS.map((c) => (
                  <button key={c} type="button"
                    className={`cuisine-chip ${form.cuisine.includes(c) ? 'active' : ''}`}
                    onClick={() => toggleCuisine(c)}
                  >{c}</button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
              {loading ? 'Creating...' : '🏪 Create Restaurant'}
            </button>
          </form>
        </motion.div>

        <style>{`
          .addr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .cuisine-chips { display: flex; flex-wrap: wrap; gap: 8px; }
          .cuisine-chip { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-full); padding: 7px 16px; font-size: 0.85rem; color: var(--color-text-muted); cursor: pointer; transition: all 0.2s; }
          .cuisine-chip.active { background: rgba(255,107,53,0.15); border-color: var(--color-orange); color: var(--color-orange); font-weight: 600; }
          .btn-xs { font-size: 0.75rem; padding: 4px 10px; border-radius: 8px; }
          @media (max-width: 600px) { .addr-grid { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </div>
  );
}
