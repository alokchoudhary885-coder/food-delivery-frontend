import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const STATUS_STEPS  = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
const STATUS_ICONS  = { pending: '⏳', confirmed: '✅', preparing: '👨‍🍳', ready: '🔔', out_for_delivery: '🛵', delivered: '🎉' };
const STATUS_LABELS = { pending: 'Order Placed', confirmed: 'Accepted', preparing: 'Preparing', ready: 'Food Ready', out_for_delivery: 'On the Way', delivered: 'Delivered' };

/* ─── Review Modal ─────────────────────────────────────── */
function ReviewModal({ order, onClose, onSuccess }) {
  const [rating, setRating]   = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!order?.restaurant?._id) return toast.error('Restaurant info missing');
    setLoading(true);
    try {
      await api.post('/reviews', {
        restaurantId: order.restaurant._id,
        orderId: order._id,
        rating,
        comment,
      });
      toast.success('Review submit ho gaya! Thank you ⭐');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review submit nahi ho saka');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-box" style={{ maxWidth: 440 }} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-order-id">⭐ Rate & Review</div>
            <div className="modal-date">{order.restaurant?.name}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Rating select karo:</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star} type="button"
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: '1.8rem', background: 'none', border: 'none', cursor: 'pointer',
                    transform: rating >= star ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.15s',
                    filter: rating >= star ? 'drop-shadow(0 0 6px rgba(255,165,0,0.6))' : 'grayscale(1)',
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Feedback / Review (optional)</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="Khana kaisa laga? Delivery kaisi thi?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review ⭐'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─── Order Detail Modal ────────────────────────────────── */
function OrderDetailModal({ order, onClose, onOpenReview }) {
  const stepIdx     = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-box" initial={{ scale: 0.92, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 30 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-order-id">Order #{order._id.slice(-8).toUpperCase()}</div>
            <div className="modal-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Restaurant */}
        {order.restaurant && (
          <div className="modal-restaurant">
            <span>🍽️</span>
            <span style={{ fontWeight: 600 }}>{order.restaurant.name || 'Restaurant'}</span>
            {order.restaurant.address?.city && <span className="text-muted">• {order.restaurant.address.city}</span>}
          </div>
        )}

        {/* Status Timeline */}
        {!isCancelled ? (
          <div className="modal-timeline">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className={`mtl-step ${i <= stepIdx ? 'done' : ''}`}>
                <div className="mtl-icon">{i <= stepIdx ? STATUS_ICONS[step] : '○'}</div>
                <div className="mtl-label">{STATUS_LABELS[step]}</div>
                {i < STATUS_STEPS.length - 1 && <div className="mtl-line" />}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', textAlign: 'center', color: '#ef4444', fontWeight: 600, marginBottom: '1rem' }}>
            ❌ Order Cancelled
          </div>
        )}

        {/* Items */}
        <div className="modal-section">
          <div className="modal-section-title">📋 Items Ordered</div>
          {order.items?.map((item, i) => (
            <div key={i} className="modal-item">
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>₹{item.price} × {item.quantity}</div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--color-orange)' }}>₹{item.price * item.quantity}</div>
            </div>
          ))}
        </div>

        {/* Bill */}
        <div className="modal-section">
          <div className="modal-section-title">🧾 Bill</div>
          <div className="modal-bill-row"><span>Subtotal</span><span>₹{order.subtotal ?? order.grandTotal}</span></div>
          {order.deliveryFee > 0 && <div className="modal-bill-row"><span>Delivery Fee</span><span>₹{order.deliveryFee}</span></div>}
          {order.discount > 0 && <div className="modal-bill-row" style={{ color: '#22C55E' }}><span>🎁 Discount</span><span>−₹{order.discount}</span></div>}
          <div className="divider" style={{ margin: '8px 0' }} />
          <div className="modal-bill-row" style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text)' }}>
            <span>Grand Total</span>
            <span className="text-orange">₹{order.grandTotal}</span>
          </div>
        </div>

        {/* Payment + Address */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="modal-section">
            <div className="modal-section-title">💳 Payment</div>
            <div style={{ fontSize: '0.875rem' }}>
              <div style={{ marginBottom: 4 }}>{order.paymentMethod === 'cash_on_delivery' ? '💵 Cash on Delivery' : '💳 Online'}</div>
              <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: '0.72rem' }}>
                {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
              </span>
            </div>
          </div>
          {order.deliveryAddress && (
            <div className="modal-section">
              <div className="modal-section-title">📍 Delivery</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {order.deliveryAddress.street && <div>{order.deliveryAddress.street}</div>}
                <div>{order.deliveryAddress.city}{order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ''}</div>
                {order.deliveryAddress.pincode && <div>{order.deliveryAddress.pincode}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { onClose(); onOpenReview(order); }}>
            ⭐ Rate Order
          </button>
          <Link to="/restaurants" className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center' }}>
            🔄 Order Again
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Order Card ────────────────────────────────────────── */
function OrderCard({ order, onViewDetail, onOpenReview }) {
  const stepIdx     = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <motion.div className="order-card glass" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }}>
      <div className="order-header">
        <div>
          <div className="order-id">Order #{order._id.slice(-8).toUpperCase()}</div>
          <div className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onOpenReview(order)} style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
            ⭐ Rate
          </button>
          <span className={`badge ${isCancelled ? 'badge-red' : order.status === 'delivered' ? 'badge-green' : 'badge-orange'}`}>
            {STATUS_ICONS[order.status] || '📦'} {order.status.replace(/_/g, ' ').toUpperCase()}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => onViewDetail(order)}>
            View Details →
          </button>
        </div>
      </div>

      {order.restaurant && (
        <div className="order-restaurant">🍽️ {order.restaurant.name || 'Restaurant'}</div>
      )}

      <div className="order-items">
        {order.items?.slice(0, 3).map((item, i) => (
          <div key={i} className="order-item">
            <span>{item.name} × {item.quantity}</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        {order.items?.length > 3 && (
          <div className="order-item text-muted" style={{ fontSize: '0.78rem' }}>
            +{order.items.length - 3} more items...
          </div>
        )}
      </div>

      <div className="divider" style={{ margin: '12px 0' }} />

      <div className="order-footer">
        <div>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Payment: </span>
          <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: '0.7rem' }}>
            {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ ' + (order.paymentMethod === 'cash_on_delivery' ? 'COD' : 'Pending')}
          </span>
        </div>
        <div className="order-total">₹{order.grandTotal}</div>
      </div>

      {!isCancelled && (
        <div className="status-timeline">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className={`timeline-step ${i <= stepIdx ? 'done' : ''}`}>
              <div className="timeline-dot" />
              {i < STATUS_STEPS.length - 1 && <div className="timeline-line" />}
              <div className="timeline-label">{STATUS_LABELS[step]}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function MyOrders() {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [page, setPage]                   = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewOrder, setReviewOrder]     = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/my-orders', { params: { page, limit: 5 } });
      setOrders(data.data?.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Live tracking auto-poll every 8 seconds for active status changes
    const interval = setInterval(() => {
      api.get('/orders/my-orders', { params: { page, limit: 5 } })
        .then(({ data }) => {
          setOrders(data.data?.orders || []);
        })
        .catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, [page]);

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
          <h1 className="heading-2">📦 My Orders</h1>
          <Link to="/restaurants" className="btn btn-primary btn-sm">+ New Order</Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📦</div>
            <h3>Koi order nahi hai abhi</h3>
            <p>Apna pehla order place karo!</p>
            <Link to="/restaurants" className="btn btn-primary" style={{ marginTop: '1rem' }}>Order Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map((o) => (
              <OrderCard key={o._id} order={o} onViewDetail={setSelectedOrder} onOpenReview={setReviewOrder} />
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="pagination" style={{ marginTop: '2rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>← Prev</button>
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>Page {page} / {totalPages}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}>Next →</button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onOpenReview={setReviewOrder} />}
        {reviewOrder && <ReviewModal order={reviewOrder} onClose={() => setReviewOrder(null)} onSuccess={fetchOrders} />}
      </AnimatePresence>

      <style>{`
        .order-card { padding: 1.25rem; cursor: default; transition: transform 0.2s; }
        .order-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
        .order-id { font-weight: 700; font-size: 0.95rem; }
        .order-date { font-size: 0.78rem; color: var(--color-text-muted); margin-top: 2px; }
        .order-restaurant { font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 10px; }
        .order-items { display: flex; flex-direction: column; gap: 4px; }
        .order-item { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--color-text-muted); }
        .order-footer { display: flex; justify-content: space-between; align-items: center; }
        .order-total { font-size: 1.1rem; font-weight: 800; color: var(--color-orange); }
        .status-timeline { display: flex; align-items: flex-start; margin-top: 16px; overflow-x: auto; padding-bottom: 4px; }
        .timeline-step { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 60px; position: relative; }
        .timeline-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--color-border); border: 2px solid var(--color-border); transition: all 0.3s; }
        .timeline-step.done .timeline-dot { background: var(--color-orange); border-color: var(--color-orange); }
        .timeline-line { position: absolute; top: 5px; left: 50%; width: 100%; height: 2px; background: var(--color-border); z-index: 0; }
        .timeline-step.done .timeline-line { background: var(--color-orange); }
        .timeline-label { font-size: 0.62rem; color: var(--color-text-muted); margin-top: 6px; text-align: center; text-transform: capitalize; }
        .timeline-step.done .timeline-label { color: var(--color-orange); }
        .pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; }

        /* Modal */
        .modal-backdrop { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .modal-box { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 20px; padding: 1.75rem; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 40px 100px rgba(0,0,0,0.5); }
        .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .modal-order-id { font-size: 1.1rem; font-weight: 800; }
        .modal-date { font-size: 0.78rem; color: var(--color-text-muted); margin-top: 3px; }
        .modal-close { background: rgba(255,255,255,0.08); border: 1px solid var(--color-border); border-radius: 8px; width: 32px; height: 32px; color: var(--color-text-muted); font-size: 0.9rem; transition: all 0.2s; cursor: pointer; }
        .modal-close:hover { background: rgba(255,255,255,0.15); color: var(--color-text); }
        .modal-restaurant { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(255,107,53,0.06); border: 1px solid rgba(255,107,53,0.15); border-radius: 10px; margin-bottom: 1.25rem; font-size: 0.9rem; }
        .modal-timeline { display: flex; align-items: flex-start; margin-bottom: 1.25rem; overflow-x: auto; padding-bottom: 4px; }
        .mtl-step { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 64px; position: relative; }
        .mtl-icon { font-size: 1.25rem; margin-bottom: 4px; filter: grayscale(1); transition: filter 0.3s; }
        .mtl-step.done .mtl-icon { filter: grayscale(0); }
        .mtl-label { font-size: 0.6rem; color: var(--color-text-muted); text-align: center; font-weight: 600; }
        .mtl-step.done .mtl-label { color: var(--color-orange); }
        .mtl-line { position: absolute; top: 14px; left: 50%; width: 100%; height: 2px; background: var(--color-border); }
        .mtl-step.done .mtl-line { background: var(--color-orange); }
        .modal-section { background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
        .modal-section-title { font-size: 0.78rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
        .modal-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--color-border); }
        .modal-item:last-child { border-bottom: none; }
        .modal-bill-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 0.875rem; color: var(--color-text-muted); }

        @media (max-width: 600px) {
          .modal-backdrop { align-items: flex-end; padding: 0; }
          .modal-box {
            border-radius: 22px 22px 0 0;
            max-height: 88vh;
            padding: 1.25rem 1rem calc(1.25rem + max(env(safe-area-inset-bottom, 0px), 8px));
            max-width: 100vw;
          }
          .order-card { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}
