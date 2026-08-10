import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="footer-logo">🍕 <span className="gradient-text">FoodRush</span></div>
          <p className="footer-tagline">Fast & fresh food delivered to your doorstep in 30 mins.</p>
        </div>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/restaurants">Restaurants</Link>
          <Link to="/orders">My Orders</Link>
        </div>

        <div className="footer-creator">
          <div>Crafted with ❤️ by <span className="creator-name">Alok Choudhary</span></div>
          <div className="footer-copy">© {new Date().getFullYear()} FoodRush. All rights reserved.</div>
        </div>
      </div>

      <style>{`
        .app-footer {
          background: rgba(15, 14, 23, 0.95);
          border-top: 1px solid var(--color-border);
          padding: 2.5rem 0 1.5rem;
          margin-top: auto;
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .footer-brand { max-width: 320px; }
        .footer-logo { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.4rem; }
        .footer-tagline { font-size: 0.8rem; color: var(--color-text-muted); line-height: 1.5; }
        .footer-links { display: flex; gap: 1.5rem; }
        .footer-links a {
          color: var(--color-text-muted); font-size: 0.85rem; font-weight: 500;
          transition: color 0.2s; text-decoration: none;
        }
        .footer-links a:hover { color: var(--color-orange); }
        .footer-creator { text-align: right; font-size: 0.82rem; color: var(--color-text-muted); }
        .creator-name {
          color: var(--color-orange);
          font-weight: 700;
          background: linear-gradient(135deg, #FF6B35, #FF8E53);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .footer-copy { font-size: 0.72rem; margin-top: 4px; opacity: 0.7; }
        @media (max-width: 768px) {
          .footer-content { flex-direction: column; text-align: center; }
          .footer-creator { text-align: center; }
          .footer-links { justify-content: center; }
        }
      `}</style>
    </footer>
  );
}
