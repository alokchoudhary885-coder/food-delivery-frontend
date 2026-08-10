import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import ImageUpload from '../components/ImageUpload';

const STATUS_OPTIONS = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

export default function OwnerDashboard() {
  const { user } = useAuthStore();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tab, setTab] = useState('orders');
  const [loading, setLoading] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '', category: 'Main Course', image: '' });

  // Load owner's restaurants
  useEffect(() => {
    api.get('/restaurants/my-restaurants')
      .then(({ data }) => {
        const list = data.data?.restaurants || [];
        setRestaurants(list);
        if (list.length > 0) setSelectedRestaurant(list[0]);
      })
      .catch(() => toast.error('Restaurants load nahi ho sake'));
  }, []);

  // Load orders + menu when restaurant changes
  useEffect(() => {
    if (!selectedRestaurant) return;
    setLoading(true);
    Promise.all([
      api.get(`/orders/restaurant/${selectedRestaurant._id}`),
      api.get(`/restaurants/${selectedRestaurant._id}/menu`),
    ]).then(([ordRes, menuRes]) => {
      setOrders(ordRes.data.data?.orders || []);
      setMenuItems(menuRes.data.data?.items || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [selectedRestaurant]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      toast.success(`Status updated: ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const deleteMenuItem = async (itemId) => {
    if (!confirm('Ye item delete karna chahte ho?')) return;
    try {
      await api.delete(`/menu/${itemId}`);
      setMenuItems((prev) => prev.filter((i) => i._id !== itemId));
      toast.success('Item deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const addMenuItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return toast.error('Name aur price required hai');
    try {
      const { data } = await api.post(`/restaurants/${selectedRestaurant._id}/menu`, {
        name: newItem.name,
        price: Number(newItem.price),
        description: newItem.description,
        category: newItem.category,
        image: newItem.image || undefined,
      });
      setMenuItems((prev) => [...prev, data.data?.item || data.data]);
      setNewItem({ name: '', price: '', description: '', category: 'Main Course', image: '' });
      setShowAddItem(false);
      toast.success('Menu item add ho gaya! 🍕');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Add failed');
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>🏪 Owner Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '2rem' }}>
            <p className="text-muted">Welcome, {user?.name}</p>
            <Link to="/create-restaurant" className="btn btn-primary btn-sm">+ New Restaurant</Link>
          </div>
        </motion.div>

        {/* Restaurant Selector */}
        {restaurants.length > 1 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <select
              className="form-select" style={{ maxWidth: 320 }}
              value={selectedRestaurant?._id}
              onChange={(e) => setSelectedRestaurant(restaurants.find((r) => r._id === e.target.value))}
            >
              {restaurants.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </div>
        )}

        {restaurants.length === 0 && !loading && (
          <div className="empty-state">
            <div className="icon">🏪</div>
            <h3>Koi restaurant nahi hai</h3>
            <p>Pehle ek restaurant create karo</p>
            <Link to="/create-restaurant" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              + Create Restaurant
            </Link>
          </div>
        )}

        {selectedRestaurant && (
          <>
            {/* Restaurant Info */}
            <div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedRestaurant.name}</h2>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>{selectedRestaurant.address?.city} • ₹{selectedRestaurant.deliveryFee} delivery</p>
              </div>
              <span className={`badge ${selectedRestaurant.isActive ? 'badge-green' : 'badge-red'}`}>
                {selectedRestaurant.isActive ? '🟢 Active' : '🔴 Inactive'}
              </span>
            </div>

            {/* Tabs */}
            <div className="dash-tabs">
              {['orders', 'menu'].map((t) => (
                <button key={t} className={`dash-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t === 'orders' ? `📦 Orders (${orders.length})` : `🍽️ Menu (${menuItems.length})`}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
              </div>
            ) : tab === 'orders' ? (
              <div style={{ marginTop: '1.5rem' }}>
                {orders.length === 0 ? (
                  <div className="empty-state"><div className="icon">📦</div><h3>Koi order nahi aaya abhi</h3></div>
                ) : orders.map((order) => (
                  <div key={order._id} className="order-row glass">
                    <div className="order-row-info">
                      <div className="order-row-id">#{order._id.slice(-8).toUpperCase()}</div>
                      <div className="order-row-items text-muted">
                        {order.items?.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--color-orange)' }}>₹{order.grandTotal}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span className={`badge status-${order.status}`}>{order.status.replace('_', ' ')}</span>
                      <select
                        className="form-select"
                        style={{ width: 'auto', fontSize: '0.8rem', padding: '6px 10px' }}
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        disabled={order.status === 'delivered' || order.status === 'cancelled'}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: '1.5rem' }}>
                {/* Add Item Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAddItem(!showAddItem)}>
                    {showAddItem ? '✕ Cancel' : '+ Add Menu Item'}
                  </button>
                </div>

                {/* Add Item Form */}
                {showAddItem && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    onSubmit={addMenuItem}
                    className="glass"
                    style={{ padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                  >
                    <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>🍕 New Menu Item</h3>
                    <ImageUpload type="menu" currentImage={newItem.image} onUpload={(url) => setNewItem({ ...newItem, image: url })} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input className="form-input" placeholder="Item name *" value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} required />
                      <input type="number" className="form-input" placeholder="Price ₹ *" value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} required />
                    </div>
                    <input className="form-input" placeholder="Description (optional)" value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
                    <select className="form-select" value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                      {['Starter', 'Main Course', 'Dessert', 'Beverages', 'Sides'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-primary">✅ Add Item</button>
                  </motion.form>
                )}

                {/* Menu Items List */}
                {menuItems.length === 0 ? (
                  <div className="empty-state"><div className="icon">🍽️</div><h3>Menu items nahi hain</h3><p>Upar se add karo!</p></div>
                ) : menuItems.map((item) => (
                  <div key={item._id} className="glass" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.image && <img src={item.image} alt={item.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }} />}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                        <div className="text-orange" style={{ fontWeight: 700 }}>₹{item.price}</div>
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteMenuItem(item._id)}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .dash-tabs { display: flex; gap: 8px; }
        .dash-tab { padding: 10px 20px; border-radius: 10px; font-size: 0.875rem; font-weight: 600; background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-muted); transition: all 0.2s; cursor: pointer; }
        .dash-tab.active { background: rgba(255,107,53,0.15); border-color: var(--color-orange); color: var(--color-orange); }
        .order-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; margin-bottom: 10px; gap: 12px; flex-wrap: wrap; }
        .order-row-id { font-size: 0.8rem; font-weight: 700; margin-bottom: 4px; }
        .order-row-items { font-size: 0.78rem; margin-bottom: 4px; }
      `}</style>
    </div>
  );
}
