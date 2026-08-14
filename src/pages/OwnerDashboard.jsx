import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import ImageUpload from '../components/ImageUpload';

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'rejected'];

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
      toast.success(`Order status: ${status.replace('_', ' ').toUpperCase()}! ✅`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
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
            <label className="form-label">Select Restaurant:</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {restaurants.map((r) => (
                <button
                  key={r._id}
                  type="button"
                  className={`btn btn-sm ${selectedRestaurant?._id === r._id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setSelectedRestaurant(r)}
                >
                  🏪 {r.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedRestaurant && (
          <>
            {/* Restaurant Info */}
            <div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedRestaurant.name}</h2>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {selectedRestaurant.address?.city} • 🛵 ₹{selectedRestaurant.deliveryFee} delivery • ⭐ {selectedRestaurant.rating || 4.5}
                </p>
              </div>
              <span className={`badge ${selectedRestaurant.isActive ? 'badge-green' : 'badge-red'}`}>
                {selectedRestaurant.isActive ? '🟢 Open for Orders' : '🔴 Closed'}
              </span>
            </div>

            {/* Tabs */}
            <div className="dash-tabs">
              {['orders', 'menu'].map((t) => (
                <button key={t} className={`dash-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t === 'orders' ? `📦 Incoming Orders (${orders.length})` : `🍽️ Menu (${menuItems.length})`}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
              </div>
            ) : tab === 'orders' ? (
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.length === 0 ? (
                  <div className="empty-state"><div className="icon">📦</div><h3>Koi order nahi aaya abhi</h3></div>
                ) : orders.map((order) => (
                  <div key={order._id} className="order-row glass" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <span className="order-row-id" style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: 8 }}>
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className={`badge status-${order.status}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-green' : 'badge-orange'}`}>
                          {order.paymentStatus === 'paid' ? 'PAID ✅' : 'COD 💵'}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.88rem' }}>
                      <p style={{ margin: '2px 0', fontWeight: 600 }}>
                        👤 Customer: {order.customer?.name || 'Customer'}
                      </p>
                      <p className="text-muted" style={{ margin: '2px 0', fontSize: '0.82rem' }}>
                        📍 {order.deliveryAddress?.street}, {order.deliveryAddress?.city} ({order.deliveryAddress?.pincode})
                      </p>
                      <div style={{ margin: '6px 0', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        {order.items?.map((i, idx) => (
                          <span key={idx} style={{ marginRight: 12, fontWeight: 500 }}>
                            🍕 {i.name} × <strong>{i.quantity}</strong>
                          </span>
                        ))}
                      </div>
                      <div style={{ fontWeight: 800, color: 'var(--color-orange)', fontSize: '1rem', marginTop: 4 }}>
                        Total: ₹{order.grandTotal || order.totalAmount}
                      </div>
                    </div>

                    {/* Step-by-Step Action Controls */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: '100%', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                      {order.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => updateStatus(order._id, 'confirmed')}
                          >
                            ✅ Accept Order
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ color: '#EF4444' }}
                            onClick={() => updateStatus(order._id, 'cancelled')}
                          >
                            ❌ Reject
                          </button>
                        </>
                      )}

                      {(order.status === 'confirmed' || order.status === 'accepted') && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => updateStatus(order._id, 'preparing')}
                        >
                          🍳 Start Preparing
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => updateStatus(order._id, 'ready')}
                        >
                          🔔 Mark Ready
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => updateStatus(order._id, 'out_for_delivery')}
                        >
                          🛵 Out for Delivery
                        </button>
                      )}

                      {order.status === 'out_for_delivery' && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ background: '#22C55E', borderColor: '#22C55E' }}
                          onClick={() => updateStatus(order._id, 'delivered')}
                        >
                          🎉 Mark Delivered
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <span style={{ color: '#22C55E', fontSize: '0.85rem', fontWeight: 700 }}>
                          ✓ Order Delivered Successfully
                        </span>
                      )}

                      {order.status === 'cancelled' && (
                        <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 600 }}>
                          ✕ Order Cancelled / Rejected
                        </span>
                      )}
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
                        <h4 style={{ fontWeight: 700, margin: '0 0 4px' }}>{item.name}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-orange)', fontWeight: 700 }}>₹{item.price}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 8 }}>{item.category}</span>
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ color: '#EF4444' }} onClick={() => deleteMenuItem(item._id)}>
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .dash-tabs { display: flex; gap: 8px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px; }
        .dash-tab { background: transparent; border: none; font-size: 0.95rem; font-weight: 600; color: var(--color-text-muted); padding: 8px 16px; border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; }
        .dash-tab.active { background: rgba(255,107,53,0.15); color: var(--color-orange); }
        .order-row { padding: 1.25rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
        .status-pending { background: rgba(234,179,8,0.15); color: #EAB308; }
        .status-confirmed, .status-accepted { background: rgba(59,130,246,0.15); color: #3B82F6; }
        .status-preparing { background: rgba(255,107,53,0.15); color: #FF6B35; }
        .status-ready { background: rgba(168,85,247,0.15); color: #A855F7; }
        .status-out_for_delivery { background: rgba(14,165,233,0.15); color: #0EA5E9; }
        .status-delivered { background: rgba(34,197,94,0.15); color: #22C55E; }
        .status-cancelled, .status-rejected { background: rgba(239,68,68,0.15); color: #EF4444; }
      `}</style>
    </div>
  );
}
