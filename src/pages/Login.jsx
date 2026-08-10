import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'otp'
  const [form, setForm]               = useState({ email: '', password: '' });
  const [phone, setPhone]             = useState('');
  const [otp, setOtp]                 = useState('');
  const [otpSent, setOtpSent]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const { login }                     = useAuthStore();
  const navigate                      = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.data.user, data.data.token);
      toast.success(`Welcome back, ${data.data.user.name}! 🎉`);
      navigate(data.data.user.role === 'owner' ? '/dashboard' : '/restaurants');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone || phone.length !== 10) return toast.error('10-digit mobile number enter karo');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/send-otp', { phone });
      setOtpSent(true);
      toast.success(`OTP Bheja gaya! Test OTP: ${data.data?.otp || '123456'} 📲`, { duration: 6000 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP send nahi ho saka');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error('6-digit OTP enter karo');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { phone, otp });
      login(data.data.user, data.data.token);
      toast.success(`Mobile login successful! Welcome 🎉`);
      navigate(data.data.user.role === 'owner' ? '/dashboard' : '/restaurants');
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verify failed');
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
        <h1 className="auth-title">Welcome back!</h1>
        <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Login to continue ordering your favourite food
        </p>

        {/* Login Method Selector */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${loginMethod === 'email' ? 'active' : ''}`}
            onClick={() => setLoginMethod('email')}
          >
            📧 Email Login
          </button>
          <button
            type="button"
            className={`login-tab ${loginMethod === 'otp' ? 'active' : ''}`}
            onClick={() => setLoginMethod('otp')}
          >
            📱 Mobile OTP Login
          </button>
        </div>

        {loginMethod === 'email' ? (
          <form onSubmit={handleEmailLogin} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>
        ) : (
          <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="auth-form">
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--color-border)' }}>+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  className="form-input"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  disabled={otpSent}
                  required
                />
              </div>
            </div>

            {otpSent && (
              <motion.div className="form-group" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="form-label">6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  className="form-input"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ letterSpacing: '4px', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}
                  required
                />
                <div style={{ fontSize: '0.78rem', color: 'var(--color-orange)', marginTop: 4 }}>
                  💡 Test Mode OTP: 123456
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Processing...' : otpSent ? 'Verify & Login 🎉' : 'Send OTP 📲'}
            </button>

            {otpSent && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setOtpSent(false)}
                style={{ marginTop: '0.25rem' }}
              >
                ← Change Number
              </button>
            )}
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Account nahi hai?{' '}
          <Link to="/register" style={{ color: 'var(--color-orange)', fontWeight: 600 }}>
            Sign up free
          </Link>
        </p>
      </motion.div>

      <style>{`
        .auth-page {
          min-height: 100vh; padding-top: 70px;
          display: flex; align-items: center; justify-content: center;
          background: radial-gradient(ellipse at center, rgba(255,107,53,0.06) 0%, transparent 65%);
          padding: 100px 1rem 2rem;
        }
        .auth-card { width: 100%; max-width: 440px; padding: 2.5rem; }
        .auth-logo { font-size: 1.5rem; font-weight: 800; margin-bottom: 1.5rem; }
        .auth-title { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.4rem; }
        .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .login-tabs { display: flex; gap: 8px; background: rgba(255,255,255,0.04); padding: 4px; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid var(--color-border); }
        .login-tab { flex: 1; padding: 8px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; background: none; border: none; color: var(--color-text-muted); cursor: pointer; transition: all 0.2s; }
        .login-tab.active { background: rgba(255,107,53,0.15); color: var(--color-orange); border: 1px solid rgba(255,107,53,0.3); }
      `}</style>
    </div>
  );
}
