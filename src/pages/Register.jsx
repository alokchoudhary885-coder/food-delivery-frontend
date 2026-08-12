import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

export default function Register() {
  const [form, setForm]                       = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });
  const [loading, setLoading]                 = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const { login }                             = useAuthStore();
  const navigate                              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error('Password kam se kam 6 characters ka hona chahiye');
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.data.user, data.data.token);
      toast.success(`Welcome, ${data.data.user.name}! 🎉`);
      navigate(data.data.user.role === 'owner' ? '/dashboard' : '/restaurants');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSelectAccount = async (selectedEmail, selectedName) => {
    setShowGoogleModal(false);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', { email: selectedEmail, name: selectedName });
      login(data.data.user, data.data.token);
      toast.success(`Google Account se Sign Up ho gaya: ${selectedEmail} 🌐`);
      navigate(data.data.user.role === 'owner' ? '/dashboard' : '/restaurants');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Auth failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card glass"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-logo">🍕 <span className="gradient-text">FoodRush</span></div>
        <h1 className="auth-title">Create account</h1>
        <p className="text-muted" style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          Join thousands of food lovers
        </p>

        {/* Google Quick Sign-Up */}
        <button
          type="button"
          className="google-btn"
          onClick={() => setShowGoogleModal(true)}
          style={{ marginBottom: '1.25rem' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="auth-divider">
          <span>OR REGISTER WITH EMAIL</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="reg-name" type="text" className="form-input" placeholder="Alok Kumar"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <input id="reg-phone" type="tel" className="form-input" placeholder="+91 98765 43210"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="reg-password" type="password" className="form-input" placeholder="Min 6 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">I am a</label>
            <div className="role-toggle">
              {['customer', 'owner'].map((r) => (
                <button
                  key={r} type="button"
                  className={`role-btn ${form.role === r ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, role: r })}
                >
                  {r === 'customer' ? '🛒 Customer' : '🏪 Restaurant Owner'}
                </button>
              ))}
            </div>
          </div>

          <button id="reg-submit" type="submit" className="btn btn-primary btn-full btn-lg"
            disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Pehle se account hai?{' '}
          <Link to="/login" style={{ color: 'var(--color-orange)', fontWeight: 600 }}>Login</Link>
        </p>
      </motion.div>

      {/* Google Account Selector Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGoogleModal(false)}>
            <motion.div className="modal-box" style={{ maxWidth: 400, padding: '1.75rem' }} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" style={{ marginBottom: 8 }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Sign up with Google</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Choose an account to continue to FoodRush</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  className="google-account-item"
                  onClick={() => handleGoogleSelectAccount('alokchoudhary885@gmail.com', 'Alok Choudhary')}
                >
                  <div className="google-avatar">A</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Alok Choudhary</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>alokchoudhary885@gmail.com</div>
                  </div>
                </button>

                <button
                  type="button"
                  className="google-account-item"
                  onClick={() => handleGoogleSelectAccount('choudharyalok539@gmail.com', 'Alok Chy')}
                >
                  <div className="google-avatar" style={{ background: '#34A853' }}>A</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Alok Chy</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>choudharyalok539@gmail.com</div>
                  </div>
                </button>
              </div>

              <div className="divider" style={{ margin: '12px 0' }} />

              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Or enter any google email..."
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (!customGoogleEmail.includes('@')) return toast.error('Valid email enter karo');
                    handleGoogleSelectAccount(customGoogleEmail, customGoogleEmail.split('@')[0]);
                  }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .auth-page {
          min-height: 100vh; padding-top: 70px;
          display: flex; align-items: center; justify-content: center;
          background: radial-gradient(ellipse at center, rgba(255,107,53,0.06) 0%, transparent 65%);
          padding: 100px 1rem 2rem;
        }
        .auth-card { width: 100%; max-width: 440px; padding: 2.25rem; }
        .auth-logo { font-size: 1.5rem; font-weight: 800; margin-bottom: 1.25rem; }
        .auth-title { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.4rem; }
        .auth-form { display: flex; flex-direction: column; gap: 1.15rem; }

        .google-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 11px 16px; border-radius: 12px; background: rgba(255,255,255,0.06);
          border: 1px solid var(--color-border); color: var(--color-text); font-weight: 600;
          font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
        }
        .google-btn:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.25); }

        .auth-divider { display: flex; align-items: center; margin: 1rem 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; }
        .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--color-border); }
        .auth-divider span { padding: 0 12px; }

        .role-toggle { display: flex; gap: 8px; }
        .role-btn {
          flex: 1; padding: 10px; border-radius: 10px; font-size: 0.85rem; font-weight: 600;
          background: var(--color-surface); border: 1px solid var(--color-border);
          color: var(--color-text-muted); transition: all 0.2s; cursor: pointer;
        }
        .role-btn.active {
          background: rgba(255,107,53,0.15); border-color: var(--color-orange);
          color: var(--color-orange);
        }
        .google-account-item {
          display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 14px;
          border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border);
          cursor: pointer; transition: all 0.2s; color: var(--color-text);
        }
        .google-account-item:hover { background: rgba(255,107,53,0.08); border-color: var(--color-orange); }
        .google-avatar {
          width: 36px; height: 36px; border-radius: 50%; background: #4285F4; color: #fff;
          display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
}
