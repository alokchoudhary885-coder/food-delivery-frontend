import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import MenuItemCard from '../components/MenuItemCard';
import CartConflictModal from '../components/CartConflictModal';
import { SkeletonMenuCard } from '../components/SkeletonCard';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

export default function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu]             = useState([]);
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const totalItems  = useCartStore((s) => s.totalItems());
  const { user }    = useAuthStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [rRes, mRes, revRes] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/restaurants/${id}/menu`),
          api.get(`/reviews/restaurant/${id}`),
        ]);
        setRestaurant(rRes.data.data?.restaurant);
        setMenu(mRes.data.data?.items || []);
        setReviews(revRes.data.data?.reviews || []);
      } catch {
        toast.error('Restaurant load nahi ho saka');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="page">
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="skeleton" style={{ height: 240, borderRadius: 18, marginBottom: 24 }} />
        <div className="grid-menu">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonMenuCard key={i} />)}
        </div>
      </div>
    </div>
  );

  if (!restaurant) return (
    <div className="page"><div className="empty-state"><div className="icon">🍽️</div><h3>Restaurant nahi mila</h3></div></div>
  );

  const imgSrc = restaurant.image || `https://placehold.co/1200x300/1A1A2E/FF6B35?text=${encodeURIComponent(restaurant.name)}`;

  return (
    <div className="page">
      {/* Hero Banner */}
      <div className="restaurant-banner">
        <img src={imgSrc} alt={restaurant.name} className="banner-img" />
        <div className="banner-overlay" />
        <div className="banner-content container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="banner-title">{restaurant.name}</h1>
            <div className="banner-meta">
              {restaurant.cuisineType?.map((c) => (
                <span key={c} className="badge badge-orange">{c}</span>
              ))}
              <span className="meta-pill" style={{ color: '#F59E0B', fontWeight: 700 }}>
                ⭐ {restaurant.rating > 0 ? restaurant.rating : '4.5'} ({restaurant.totalRatings || reviews.length || 1} ratings)
              </span>
              <span className="meta-pill">🛵 ₹{restaurant.deliveryFee} delivery</span>
              {restaurant.address?.city && <span className="meta-pill">📍 {restaurant.address.city}</span>}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Menu Header */}
        <div className="menu-section-header">
          <h2 className="heading-3">🍽️ Menu</h2>
          {user?.role === 'customer' && totalItems > 0 && (
            <Link to="/cart" className="btn btn-primary btn-sm">
              🛒 View Cart ({totalItems})
            </Link>
          )}
        </div>

        {menu.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🍽️</div>
            <h3>Menu items nahi hain abhi</h3>
          </div>
        ) : (
          <motion.div className="grid-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            {menu.map((item) => (
              <MenuItemCard key={item._id} item={item} restaurantId={restaurant._id} restaurantName={restaurant.name} />
            ))}
          </motion.div>
        )}

        {/* Customer Reviews Section */}
        <div style={{ marginTop: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 className="heading-3">⭐ Customer Reviews ({reviews.length})</h2>
          </div>

          {reviews.length === 0 ? (
            <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', borderRadius: 16 }}>
              Abhi tak koi review nahi aaya hai. Pehle order karke review do!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {reviews.map((rev) => (
                <div key={rev._id} className="glass" style={{ padding: '1.25rem', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rev.user?.name || 'Customer'}</div>
                    <div style={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.85rem' }}>
                      {'⭐'.repeat(rev.rating)}
                    </div>
                  </div>
                  {rev.comment && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>"{rev.comment}"</p>}
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CartConflictModal />

      <style>{`
        .restaurant-banner { position: relative; height: 260px; overflow: hidden; display: flex; align-items: flex-end; padding-bottom: 2rem; }
        .banner-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6); }
        .banner-overlay { position: absolute; inset: 0; background: linear-gradient(to top, var(--color-bg) 0%, transparent 100%); }
        .banner-content { position: relative; z-index: 1; }
        .banner-title { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.75rem; color: #fff; }
        .banner-meta { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .meta-pill { background: rgba(15,14,23,0.7); backdrop-filter: blur(8px); border: 1px solid var(--color-border); padding: 4px 12px; border-radius: 100px; font-size: 0.8rem; font-weight: 500; }
        .menu-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .grid-menu { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }
      `}</style>
    </div>
  );
}
