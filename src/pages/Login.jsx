import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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

export default function Login() {
  const [form, setForm]                 = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  const { login } = useAuthStore();
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || null;

  const getTargetRoute = (userRole) => {
    if (redirectTarget) return redirectTarget;
    return userRole === 'owner' ? '/dashboard' : '/restaurants';
  };

  // Handle Google OAuth Login (Desktop & Mobile Web)
  const handleGoogleLogin = async () => {
    if (Capacitor.isNativePlatform()) {
      return toast('Google Web Login is not supported inside Android APK. Please use Mobile Number or Password.', { icon: '📱' });
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
      toast.success(`Welcome, ${data.data.user.name || 'User'}! Signed in with Google 🎉`);
      navigate(getTargetRoute(data.data.user.role));
    } catch (err) {
      console.error('Google OAuth Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        toast.error('Google login popup was closed.');
      } else {
        toast.error(err.response?.data?.message || err.message || 'Google Sign-In unavailable.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Mobile Number / Email & Password Login (0.1s instant login)
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return toast.error('Please enter your mobile number or email, and password.');
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        identifier: form.email.trim(),
        password: form.password,
      });
      login(data.data.user, data.data.token);
      toast.success(`Welcome back, ${data.data.user.name}! 🎉`);
      navigate(getTargetRoute(data.data.user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect mobile/email or password. Please try again.');
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
        <h1 className="auth-title">Welcome back!</h1>
        <p className="text-muted" style={{ marginBottom: '1.25rem', fontSize: '0.88rem' }}>
          Continue with your account
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
          <span>OR SIGN IN WITH PASSWORD</span>
        </div>

        {/* Direct Phone / Email + Password Login Form */}
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label className="form-label">Mobile Number or Email</label>
            <input
              id="login-email"
              type="text"
              className="form-input"
              placeholder="e.g. 6352711294 or you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--color-orange)', fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                style={{ paddingRight: 42 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', fontSize: '1rem', color: 'var(--color-text-muted)',
                  cursor: 'pointer'
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: '0.35rem' }}
          >
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Account nahi hai?{' '}
          <Link to="/register" style={{ color: 'var(--color-orange)', fontWeight: 600 }}>
            Sign up free
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
        .auth-form { display: flex; flex-direction: column; gap: 1rem; }
        
        .google-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 12px 16px; border-radius: 12px; background: rgba(255,255,255,0.06);
          border: 1px solid var(--color-border); color: var(--color-text); font-weight: 600;
          font-size: 0.88rem; cursor: pointer; transition: all 0.2s;
        }
        .google-btn:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.25); }

        .auth-divider { display: flex; align-items: center; margin: 0.85rem 0; color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; }
        .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--color-border); }
        .auth-divider span { padding: 0 12px; }

        @media (max-width: 480px) {
          .auth-card { padding: 1.5rem 1.25rem; }
          .auth-title { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}
