import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'otp'
  const [form, setForm]               = useState({ email: '', password: '' });
  const [phone, setPhone]             = useState('');
  const [otp, setOtp]                 = useState('');
  const [otpSent, setOtpSent]         = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [smsBanner, setSmsBanner]     = useState(null);
  const [timer, setTimer]             = useState(0);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [loading, setLoading]         = useState(false);
  const { login }                     = useAuthStore();
  const navigate                      = useNavigate();

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

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
      const sentOTP = data.data?.otp || '482910';
      setGeneratedOTP(sentOTP);
      setOtpSent(true);
      setTimer(30);
      setSmsBanner(`💬 SMS from FoodRush: Your OTP is ${sentOTP}. Valid for 10 mins.`);
      toast.success(`OTP Mobile Number par bhej diya gaya hai! 📲`);
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
      toast.success(`Mobile OTP Verified! Welcome 🎉`);
      setSmsBanner(null);
      navigate(data.data.user.role === 'owner' ? '/dashboard' : '/restaurants');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Correct OTP dalo!');
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
      toast.success(`Google Account se Sign In ho gaya: ${selectedEmail} 🌐`);
      navigate(data.data.user.role === 'owner' ? '/dashboard' : '/restaurants');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Simulated Phone SMS Top Notification */}
      <AnimatePresence>
        {smsBanner && (
          <motion.div
            className="sms-banner"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
          >
            <div className="sms-header">
              <span>💬 MESSAGES • Now</span>
              <button className="sms-close" onClick={() => setSmsBanner(null)}>✕</button>
            </div>
            <div className="sms-body">{smsBanner}</div>
            <div className="sms-hint" onClick={() => setOtp(generatedOTP)}>
              👉 Tap to auto-fill OTP ({generatedOTP})
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* Google Quick Sign-In */}
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
          <span>OR CONTINUE WITH</span>
        </div>

        {/* Login Method Selector */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${loginMethod === 'email' ? 'active' : ''}`}
            onClick={() => setLoginMethod('email')}
          >
            📧 Email
          </button>
          <button
            type="button"
            className={`login-tab ${loginMethod === 'otp' ? 'active' : ''}`}
            onClick={() => setLoginMethod('otp')}
          >
            📱 Mobile OTP
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0 }}>Enter 6-Digit OTP</label>
                  {timer > 0 ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Resend in {timer}s</span>
                  ) : (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={handleSendOTP} style={{ padding: '2px 6px', fontSize: '0.75rem' }}>
                      Resend OTP 🔄
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={6}
                  className="form-input"
                  placeholder="e.g. 482910"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ letterSpacing: '6px', fontSize: '1.2rem', fontWeight: 700, textAlign: 'center' }}
                  required
                />
              </motion.div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Processing...' : otpSent ? 'Verify & Login 🎉' : 'Get OTP on Phone 📲'}
            </button>

            {otpSent && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => { setOtpSent(false); setSmsBanner(null); }}
                style={{ marginTop: '0.25rem' }}
              >
                ← Change Phone Number
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Sign in with Google</h3>
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
          min-height: 100vh; padding-top: 70px; position: relative;
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

        .login-tabs { display: flex; gap: 8px; background: rgba(255,255,255,0.04); padding: 4px; border-radius: 12px; margin-bottom: 1.25rem; border: 1px solid var(--color-border); }
        .login-tab { flex: 1; padding: 8px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; background: none; border: none; color: var(--color-text-muted); cursor: pointer; transition: all 0.2s; }
        .login-tab.active { background: rgba(255,107,53,0.15); color: var(--color-orange); border: 1px solid rgba(255,107,53,0.3); }

        /* Phone SMS Banner */
        .sms-banner {
          position: fixed; top: 80px; z-index: 1000; width: 92%; max-width: 420px;
          background: #1E1B2E; border: 1px solid rgba(255,107,53,0.4); border-radius: 16px;
          padding: 14px 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        }
        .sms-header { display: flex; justify-content: space-between; font-size: 0.72rem; font-weight: 700; color: var(--color-orange); margin-bottom: 6px; }
        .sms-close { background: none; border: none; color: #888; cursor: pointer; font-weight: bold; }
        .sms-body { font-size: 0.875rem; color: #fff; font-weight: 600; line-height: 1.4; }
        .sms-hint { font-size: 0.75rem; color: #22C55E; margin-top: 6px; font-weight: 700; cursor: pointer; text-decoration: underline; }

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
