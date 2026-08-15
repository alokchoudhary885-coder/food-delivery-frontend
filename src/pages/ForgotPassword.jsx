import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

export default function ForgotPassword() {
  const [resetMethod, setResetMethod] = useState('phone'); // 'phone' | 'email'
  const [phone, setPhone]             = useState('');
  const [otpDigits, setOtpDigits]     = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent]         = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer]             = useState(0);
  const [loading, setLoading]         = useState(false);

  // Email state
  const [email, setEmail]             = useState('');
  const [emailSent, setEmailSent]     = useState(false);

  const { login } = useAuthStore();
  const navigate  = useNavigate();
  const otpInputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // 1. Send OTP for Password Reset
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return toast.error('Please enter a valid 10-digit mobile number.');
    }

    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone: cleanPhone });
      setOtpSent(true);
      setTimer(30);
      toast.success(`OTP sent to +91 ******${cleanPhone.slice(-4)} 📲`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP & Set New Password
  const handleResetWithOTP = async (e) => {
    e.preventDefault();
    const fullOTP = otpDigits.join('');
    if (fullOTP.length !== 6) {
      return toast.error('Please enter 6-digit OTP');
    }
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters long.');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        phone,
        otp: fullOTP,
        newPassword,
      });

      login(data.data.user, data.data.token);
      toast.success('Password updated successfully! Welcome back 🎉');
      navigate(data.data.user.role === 'owner' ? '/dashboard' : '/restaurants');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Email Reset via Firebase
  const handleEmailReset = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      return toast.error('Please enter a valid email address.');
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      toast.success('Password reset link sent to your email 📬');
    } catch (err) {
      console.error('Password reset error:', err);
      toast.error(err.message || 'Failed to send email link. Try Mobile OTP reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
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
        <h1 className="auth-title">Reset Password</h1>
        <p className="text-muted" style={{ marginBottom: '1.25rem', fontSize: '0.88rem' }}>
          Choose how you want to reset your account password
        </p>

        {/* Method Tabs */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${resetMethod === 'phone' ? 'active' : ''}`}
            onClick={() => { setResetMethod('phone'); setOtpSent(false); }}
          >
            📱 Mobile OTP
          </button>
          <button
            type="button"
            className={`login-tab ${resetMethod === 'email' ? 'active' : ''}`}
            onClick={() => setResetMethod('email')}
          >
            📧 Email Link
          </button>
        </div>

        {resetMethod === 'phone' ? (
          !otpSent ? (
            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="form-group">
                <label className="form-label">Registered Mobile Number</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="phone-prefix">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    className="form-input"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading || phone.length !== 10}
              >
                {loading ? 'Sending OTP...' : 'Send Reset OTP 📲'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetWithOTP} className="auth-form">
              <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Enter 6-Digit OTP</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  Sent to <strong style={{ color: '#fff' }}>+91 ******{phone.slice(-4)}</strong>
                </p>
              </div>

              {/* 6-Digit OTP Boxes */}
              <div className="otp-box-grid">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-single-box"
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                  />
                ))}
              </div>

              <div className="form-group" style={{ marginTop: '0.25rem' }}>
                <label className="form-label">Create New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.25rem 0' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setOtpSent(false)}
                  style={{ fontSize: '0.78rem' }}
                >
                  ← Change number
                </button>
                {timer > 0 ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Resend in {timer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleSendOTP}
                    style={{ color: 'var(--color-orange)', fontWeight: 700, fontSize: '0.78rem' }}
                  >
                    Resend OTP 🔄
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading || otpDigits.join('').length !== 6 || newPassword.length < 6}
              >
                {loading ? 'Updating Password...' : 'Save & Login 🎉'}
              </button>
            </form>
          )
        ) : (
          emailSent ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📬</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Reset Link Sent!</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '8px 0 1.5rem' }}>
                Password reset instructions have been sent to <strong style={{ color: '#fff' }}>{email}</strong>.
              </p>
              <Link to="/login" className="btn btn-primary btn-full">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleEmailReset} className="auth-form">
              <div className="form-group">
                <label className="form-label">Registered Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading || !email}
                style={{ marginTop: '0.5rem' }}
              >
                {loading ? 'Sending Link...' : 'Send Reset Link 📧'}
              </button>
            </form>
          )
        )}

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem' }}>
          <Link to="/login" style={{ color: 'var(--color-orange)', fontWeight: 600 }}>
            ← Back to Login
          </Link>
        </p>
      </motion.div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: calc(75px + max(env(safe-area-inset-top, 0px), 10px)) 1rem 2rem;
          background: radial-gradient(ellipse at center, rgba(255,107,53,0.06) 0%, transparent 65%);
        }
        .auth-card { width: 100%; max-width: 440px; padding: 2rem 1.75rem; }
        .auth-logo { font-size: 1.4rem; font-weight: 800; margin-bottom: 1rem; }
        .auth-title { font-size: 1.6rem; font-weight: 800; margin-bottom: 0.35rem; }
        .auth-form { display: flex; flex-direction: column; gap: 1rem; }

        .phone-prefix {
          font-size: 0.95rem; font-weight: 700; color: var(--color-text);
          background: rgba(255,255,255,0.05); padding: 12px 14px; border-radius: 12px;
          border: 1px solid var(--color-border);
        }

        .login-tabs { display: flex; gap: 8px; background: rgba(255,255,255,0.04); padding: 4px; border-radius: 12px; margin-bottom: 1.25rem; border: 1px solid var(--color-border); }
        .login-tab { flex: 1; padding: 8px; border-radius: 8px; font-size: 0.82rem; font-weight: 600; background: none; border: none; color: var(--color-text-muted); cursor: pointer; transition: all 0.2s; }
        .login-tab.active { background: rgba(255,107,53,0.15); color: var(--color-orange); border: 1px solid rgba(255,107,53,0.3); }

        .otp-box-grid { display: flex; gap: 6px; justify-content: center; margin: 0.25rem 0 0.75rem; }
        .otp-single-box {
          width: 44px; height: 50px; text-align: center; font-size: 1.2rem; font-weight: 800;
          border-radius: 12px; border: 1px solid var(--color-border); background: rgba(255,255,255,0.05);
          color: var(--color-orange); outline: none; transition: all 0.2s;
        }
        .otp-single-box:focus { border-color: var(--color-orange); box-shadow: 0 0 12px rgba(255,107,53,0.3); }

        @media (max-width: 480px) {
          .auth-card { padding: 1.5rem 1.25rem; }
          .auth-title { font-size: 1.4rem; }
          .otp-single-box { width: 38px; height: 46px; font-size: 1.05rem; }
        }
      `}</style>
    </div>
  );
}
