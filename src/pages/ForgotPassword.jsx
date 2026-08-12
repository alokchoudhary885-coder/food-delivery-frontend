import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      return toast.error('Please enter a valid email address.');
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast.success('Password reset email sent! Check your inbox 📬');
    } catch (err) {
      console.error('Password reset error:', err);
      toast.error(err.message || 'Failed to send password reset email.');
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
      >
        <div className="auth-logo">🍕 <span className="gradient-text">FoodRush</span></div>
        <h1 className="auth-title">Reset Password</h1>
        <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Enter your registered email to receive a password reset link
        </p>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📬</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Email Sent!</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '8px 0 1.5rem' }}>
              We have sent password reset instructions to <strong style={{ color: '#fff' }}>{email}</strong>.
            </p>
            <Link to="/login" className="btn btn-primary btn-full">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
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
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Sending Link...' : 'Send Reset Link 📧'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
              <Link to="/login" style={{ color: 'var(--color-orange)', fontWeight: 600 }}>
                ← Back to Login
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
