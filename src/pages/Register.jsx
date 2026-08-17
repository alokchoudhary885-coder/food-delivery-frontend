import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import {
  auth,
  googleProvider,
  signInWithPopup,
} from '../config/firebase';

export default function Register() {
  const [form, setForm]               = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const { login }                     = useAuthStore();
  const navigate                      = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);

    try {
      // 1. Direct High-Speed MongoDB Registration with Secure Hashing
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email.toLowerCase().trim(),
        password: form.password,
        phone: form.phone.replace(/\D/g, '').slice(-10),
        role: form.role,
      });

      login(data.data.user, data.data.token);
      toast.success(`Welcome to FoodRush, ${data.data.user.name}! 🎉`);
      navigate(data.data.user.role === 'owner' ? '/dashboard' : '/restaurants');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (Capacitor.isNativePlatform()) {
      return toast('Google Web Login is not supported inside Android APK. Please use Mobile OTP or Password.', { icon: '📱' });
    }

    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken(true);

      const { data } = await api.post('/auth/firebase-login', {
        idToken,
        email: user.email,
        name: user.displayName,
        avatar: user.photoURL,
        authProvider: 'google',
        uid: user.uid,
      });

      login(data.data.user, data.data.token);
      toast.success(`Welcome, ${data.data.user.name || 'User'}! Registered with Google 🎉`);
      navigate(data.data.user.role === 'owner' ? '/dashboard' : '/restaurants');
    } catch (err) {
      console.error('Google Auth Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        toast.error('Google signup popup was closed.');
      } else {
        toast.error(err.response?.data?.message || err.message || 'Google Sign-Up failed.');
      }
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
        transition={{ duration: 0.35 }}
      >
        <div className="auth-logo">🍕 <span className="gradient-text">FoodRush</span></div>
        <h1 className="auth-title">Create account</h1>
        <p className="text-muted" style={{ marginBottom: '1.25rem', fontSize: '0.88rem' }}>
          Sign up to order food or manage your restaurant
        </p>

        {/* Real Google OAuth Button */}
        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{ marginBottom: '1rem' }}
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
          <span>OR SIGN UP WITH EMAIL</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Alok Choudhary"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number (Optional)</label>
            <input
              type="tel"
              maxLength={10}
              className="form-input"
              placeholder="9876543210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', fontSize: '1rem', color: 'var(--color-text-muted)'
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">I want to</label>
            <div className="role-selector">
              <label className={`role-option ${form.role === 'customer' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={form.role === 'customer'}
                  onChange={() => setForm({ ...form, role: 'customer' })}
                />
                🍕 Order Food
              </label>
              <label className={`role-option ${form.role === 'owner' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="owner"
                  checked={form.role === 'owner'}
                  onChange={() => setForm({ ...form, role: 'owner' })}
                />
                🏪 Sell Food (Owner)
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: '0.25rem' }}
          >
            {loading ? 'Creating Account...' : 'Sign Up Free 🎉'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Pehle se account hai?{' '}
          <Link to="/login" style={{ color: 'var(--color-orange)', fontWeight: 600 }}>
            Login karein
          </Link>
        </p>
      </motion.div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          background: radial-gradient(ellipse at center, rgba(255,107,53,0.06) 0%, transparent 65%);
          padding: calc(75px + max(env(safe-area-inset-top, 0px), 10px)) 1rem 2rem;
        }
        .auth-card { width: 100%; max-width: 440px; padding: 2rem 1.75rem; }
        .auth-logo { font-size: 1.4rem; font-weight: 800; margin-bottom: 1rem; }
        .auth-title { font-size: 1.6rem; font-weight: 800; margin-bottom: 0.35rem; }
        .auth-form { display: flex; flex-direction: column; gap: 0.95rem; }

        .google-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 12px 16px; border-radius: 12px; background: rgba(255,255,255,0.06);
          border: 1px solid var(--color-border); color: var(--color-text); font-weight: 600;
          font-size: 0.88rem; cursor: pointer; transition: all 0.2s;
        }
        .google-btn:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.25); }

        .auth-divider { display: flex; align-items: center; margin: 0.75rem 0; color: var(--color-text-muted); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; }
        .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--color-border); }
        .auth-divider span { padding: 0 10px; }

        .role-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .role-option {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px 8px; border-radius: 10px; border: 1px solid var(--color-border);
          background: rgba(255,255,255,0.03); color: var(--color-text-muted);
          font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .role-option input { display: none; }
        .role-option.active {
          border-color: var(--color-orange); background: rgba(255,107,53,0.12);
          color: var(--color-orange); font-weight: 700;
        }

        @media (max-width: 480px) {
          .auth-card { padding: 1.5rem 1.25rem; }
          .auth-title { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}
