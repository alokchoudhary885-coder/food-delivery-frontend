import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginRequiredModal({ isOpen, onClose, redirectPath = '/cart' }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  };

  const handleRegister = () => {
    onClose();
    navigate(`/register?redirect=${encodeURIComponent(redirectPath)}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-box glass"
          style={{ maxWidth: 420, padding: '2rem', textAlign: 'center' }}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔐</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Login Required
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            Please login or create an account to continue with your food order.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              className="btn btn-primary btn-full btn-lg"
              onClick={handleLogin}
            >
              Login to Order →
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-full"
              onClick={handleRegister}
            >
              Create New Account
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
