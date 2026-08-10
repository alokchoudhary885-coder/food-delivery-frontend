import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useCartStore from '../store/cartStore';

/* ─── Coupon Codes ─────────────────────────────────────── */
const COUPONS = {
  SAVE50:      { discount: 50,  type: 'flat',    desc: '₹50 off on your order!' },
  FOODRUSH20:  { discount: 20,  type: 'percent', desc: '20% off (max ₹100)' },
  FIRST100:    { discount: 100, type: 'flat',    desc: '₹100 off on first order!' },
  WELCOME10:   { discount: 10,  type: 'percent', desc: '10% off — Welcome discount!' },
};

/* ─── Indian Cities for Autocomplete ───────────────────── */
const INDIAN_CITIES = [
  'Agra','Ahmedabad','Allahabad','Amritsar','Aurangabad',
  'Bangalore','Bhopal','Bhubaneswar','Chandigarh','Chennai',
  'Coimbatore','Dehradun','Delhi','Faridabad','Ghaziabad',
  'Gurgaon','Guwahati','Hyderabad','Indore','Jaipur',
  'Jalandhar','Jodhpur','Kanpur','Kochi','Kolkata',
  'Lucknow','Ludhiana','Madurai','Mumbai','Mysore',
  'Nagpur','Nashik','Noida','Patna','Pune',
  'Raipur','Rajkot','Ranchi','Surat','Thane',
  'Udaipur','Vadodara','Varanasi','Visakhapatnam',
];

/* ─── City Autocomplete Input ──────────────────────────── */
function CityInput({ value, onChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (val) => {
    onChange(val);
    if (val.length >= 2) {
      const filtered = INDIAN_CITIES.filter((c) => c.toLowerCase().startsWith(val.toLowerCase())).slice(0, 6);
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
    } else {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        className="form-input"
        placeholder="City 🗺️"
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        autoComplete="off"
      />
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="city-dropdown"
          >
            {suggestions.map((city) => (
              <li key={city} className="city-option"
                onMouseDown={(e) => { e.preventDefault(); onChange(city); setOpen(false); }}
              >
                📍 {city}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Cart Component ──────────────────────────────── */
export default function Cart() {
  const { items, restaurantId, restaurantName, subtotal, increment, decrement, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [address, setAddress]         = useState({ street: '', city: '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [loading, setLoading]         = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const DELIVERY_FEE = 50;
  const sub = subtotal();
  const discount = appliedCoupon
    ? appliedCoupon.type === 'flat'
      ? Math.min(appliedCoupon.discount, sub)
      : Math.min(Math.round(sub * appliedCoupon.discount / 100), 100)
    : 0;
  const grandTotal = sub + DELIVERY_FEE - discount;

  const applyCoupon = () => {
    setCouponLoading(true);
    setTimeout(() => {
      const code = couponInput.trim().toUpperCase();
      if (COUPONS[code]) {
        setAppliedCoupon({ ...COUPONS[code], code });
        toast.success(`🎁 Coupon "${code}" applied! ${COUPONS[code].desc}`);
      } else {
        toast.error('Invalid coupon code!');
      }
      setCouponLoading(false);
    }, 600);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    toast('Coupon removed', { icon: '🗑️' });
  };

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.state || !address.pincode) {
      return toast.error('Delivery address poora bharo');
    }
    if (items.length === 0) return toast.error('Cart empty hai');

    setLoading(true);
    try {
      const orderBody = {
        restaurant: restaurantId,
        items: items.map((i) => ({ menuItem: i._id, quantity: i.quantity })),
        deliveryAddress: address,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        discount,
      };
      const { data: orderData } = await api.post('/orders', orderBody);
      const orderId = orderData.data.order._id;

      if (paymentMethod === 'cash_on_delivery') {
        clearCart();
        toast.success('Order placed! 🎉 Cash on delivery.');
        navigate('/orders');
        return;
      }

      const { data: rzpData } = await api.post('/payments/create-order', { orderId });
      const { razorpayOrderId, amount, key_id } = rzpData.data;

      const ok = await loadRazorpay();
      if (!ok) { toast.error('Razorpay load nahi hua'); setLoading(false); return; }

      const rzp = new window.Razorpay({
        key: key_id,
        amount,
        currency: 'INR',
        order_id: razorpayOrderId,
        name: 'FoodRush',
        description: `Order from ${restaurantName}`,
        theme: { color: '#FF6B35' },
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            toast.success('Payment successful! Order confirmed 🎉');
            navigate('/orders');
          } catch {
            toast.error('Payment verification failed');
          }
        },
        modal: { ondismiss: () => { setLoading(false); toast('Payment cancelled'); } },
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
      setLoading(false);
    }
  };

  if (items.length === 0) return (
    <div className="page">
      <div className="empty-state">
        <div className="icon">🛒</div>
        <h3>Cart khali hai</h3>
        <p>Koi item add karo restaurant se</p>
        <a href="/restaurants" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Restaurants</a>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="container cart-layout">
        {/* ── Items ── */}
        <motion.div className="cart-items-col" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="heading-3" style={{ marginBottom: '1.5rem' }}>🛒 Your Cart</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            📍 {restaurantName}
          </p>

          <div className="cart-items">
            {items.map((item) => (
              <div key={item._id} className="cart-item glass">
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <span className="text-orange" style={{ fontWeight: 700 }}>₹{item.price}</span>
                </div>
                <div className="cart-item-controls">
                  <button className="qty-btn" onClick={() => decrement(item._id)}>−</button>
                  <span className="qty-val">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => increment(item._id)}>+</button>
                  <button className="remove-btn" onClick={() => removeItem(item._id)}>🗑️</button>
                </div>
                <div className="cart-item-total">₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>

          {/* ── Coupon Section ── */}
          <div className="coupon-section glass" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>🎁 Coupon Code</h3>
            {appliedCoupon ? (
              <div className="coupon-applied">
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--color-orange)' }}>✅ {appliedCoupon.code}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{appliedCoupon.desc}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={removeCoupon}>Remove</button>
              </div>
            ) : (
              <div className="coupon-input-row">
                <input
                  className="form-input"
                  placeholder="Enter coupon code (e.g. SAVE50)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={applyCoupon}
                  disabled={!couponInput || couponLoading}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
            )}
            <div className="coupon-hints">
              {['SAVE50','FOODRUSH20','FIRST100','WELCOME10'].map((c) => (
                <button key={c} className="coupon-hint-chip"
                  onClick={() => { setCouponInput(c); }}
                >{c}</button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Checkout ── */}
        <motion.div className="cart-checkout-col" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {/* Address */}
          <div className="checkout-section glass">
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>📍 Delivery Address</h3>
            <div className="addr-grid">
              <input
                className="form-input" placeholder="🏠 Street / Colony / Flat No."
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                style={{ gridColumn: '1 / -1' }}
              />
              <CityInput value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
              <input
                className="form-input" placeholder="State"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              />
              <input
                className="form-input" placeholder="📮 Pincode (6 digits)"
                type="number"
                maxLength={6}
                value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value.slice(0, 6) })}
                style={{ gridColumn: '1 / -1' }}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="checkout-section glass">
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>💳 Payment Method</h3>
            <div className="role-toggle">
              {[
                { val: 'cash_on_delivery', label: '💵 Cash on Delivery' },
                { val: 'online', label: '💳 Pay Online' },
              ].map(({ val, label }) => (
                <button
                  key={val} type="button"
                  className={`role-btn ${paymentMethod === val ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(val)}
                  style={{ flex: 1 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="checkout-section glass">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>🧾 Bill Summary</h3>
            <div className="bill-row"><span>Subtotal</span><span>₹{sub}</span></div>
            <div className="bill-row"><span>Delivery Fee</span><span>₹{DELIVERY_FEE}</span></div>
            {discount > 0 && (
              <motion.div
                className="bill-row"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                style={{ color: '#22C55E' }}
              >
                <span>🎁 Coupon Discount ({appliedCoupon?.code})</span>
                <span>−₹{discount}</span>
              </motion.div>
            )}
            <div className="divider" />
            <div className="bill-row bill-total">
              <span>Grand Total</span>
              <span className="text-orange">₹{grandTotal}</span>
            </div>
            {discount > 0 && (
              <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#22C55E', marginTop: '6px' }}>
                🎉 Aapne ₹{discount} bachaye!
              </div>
            )}

            <button
              id="place-order-btn"
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: '1.25rem' }}
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? 'Processing...' : paymentMethod === 'online' ? `💳 Pay ₹${grandTotal}` : '🛍️ Place Order'}
            </button>
          </div>
        </motion.div>
      </div>

      <style>{`
        .cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; padding-top: 2rem; padding-bottom: 4rem; align-items: start; }
        .cart-items { display: flex; flex-direction: column; gap: 12px; }
        .cart-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; flex-wrap: wrap; }
        .cart-item-info { flex: 1; min-width: 120px; }
        .cart-item-info h4 { font-size: 0.9rem; font-weight: 600; margin-bottom: 2px; }
        .cart-item-controls { display: flex; align-items: center; gap: 8px; }
        .qty-btn { width: 28px; height: 28px; border-radius: 8px; background: var(--color-surface-2); border: 1px solid var(--color-border); color: var(--color-text); font-size: 1rem; font-weight: 700; transition: all 0.15s; }
        .qty-btn:hover { background: var(--color-orange); border-color: var(--color-orange); }
        .qty-val { min-width: 24px; text-align: center; font-weight: 600; font-size: 0.9rem; }
        .remove-btn { background: none; border: none; font-size: 1rem; opacity: 0.6; transition: opacity 0.15s; }
        .remove-btn:hover { opacity: 1; }
        .cart-item-total { font-weight: 700; color: var(--color-orange); min-width: 60px; text-align: right; }
        .checkout-section { padding: 1.25rem; margin-bottom: 1rem; }
        .addr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .bill-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 0.9rem; color: var(--color-text-muted); }
        .bill-total { font-weight: 700; font-size: 1rem; color: var(--color-text); }
        .role-btn { padding: 10px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-muted); transition: all 0.2s; cursor: pointer; }
        .role-btn.active { background: rgba(255,107,53,0.15); border-color: var(--color-orange); color: var(--color-orange); }

        /* Coupon */
        .coupon-section { padding: 1.25rem; }
        .coupon-input-row { display: flex; gap: 8px; align-items: center; }
        .coupon-applied { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.25); border-radius: 10px; }
        .coupon-hints { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .coupon-hint-chip { padding: 4px 10px; border-radius: 100px; font-size: 0.72rem; font-weight: 600; background: rgba(255,107,53,0.08); border: 1px solid rgba(255,107,53,0.2); color: var(--color-orange); transition: all 0.15s; cursor: pointer; }
        .coupon-hint-chip:hover { background: rgba(255,107,53,0.18); }

        /* City Dropdown */
        .city-dropdown { position: absolute; top: 100%; left: 0; right: 0; z-index: 100; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; overflow: hidden; margin-top: 4px; list-style: none; padding: 4px 0; box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .city-option { padding: 9px 14px; font-size: 0.875rem; cursor: pointer; transition: background 0.15s; }
        .city-option:hover { background: rgba(255,107,53,0.1); color: var(--color-orange); }

        @media (max-width: 900px) { .cart-layout { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
