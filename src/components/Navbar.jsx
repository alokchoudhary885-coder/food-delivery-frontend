import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { auth, signOut as firebaseSignOut } from '../config/firebase';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={closeMobile}>
            🍕 <span className="gradient-text">FoodRush</span>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar-links desktop-only">
            <Link to="/restaurants" className="nav-link">Restaurants</Link>
            {user?.role === 'customer' && <Link to="/orders" className="nav-link">My Orders</Link>}
            {user?.role === 'owner'    && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
          </div>

          {/* Right Actions */}
          <div className="navbar-actions">
            {user && (
              <Link to="/cart" className="cart-btn" onClick={closeMobile}>
                🛒
                {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
              </Link>
            )}

            {user ? (
              <div className="user-menu desktop-only">
                <button className="user-avatar" onClick={() => setMenuOpen(!menuOpen)}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </button>
                {menuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-name">{user.name}</div>
                    {user.phone && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>+91 {user.phone}</div>}
                    <div className="badge badge-orange dropdown-role">{user.role}</div>
                    <div className="divider" style={{ margin: '8px 0' }} />
                    <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>👤 Profile</Link>
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>🚪 Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="desktop-only" style={{ display: 'flex', gap: '8px' }}>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              className="hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <span className={`ham-line ${mobileOpen ? 'open-1' : ''}`} />
              <span className={`ham-line ${mobileOpen ? 'open-2' : ''}`} />
              <span className={`ham-line ${mobileOpen ? 'open-3' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={closeMobile}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            {user && (
              <div className="drawer-user">
                <div className="drawer-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{user.name}</div>
                  <div className="badge badge-orange" style={{ fontSize: '0.7rem', marginTop: '4px' }}>{user.role}</div>
                </div>
              </div>
            )}

            <div className="divider" />

            <nav className="drawer-nav">
              <Link to="/restaurants" className="drawer-link" onClick={closeMobile}>🍽️ Restaurants</Link>
              {user && <Link to="/cart" className="drawer-link" onClick={closeMobile}>🛒 Cart {totalItems > 0 ? `(${totalItems})` : ''}</Link>}
              {user?.role === 'customer' && <Link to="/orders" className="drawer-link" onClick={closeMobile}>📦 My Orders</Link>}
              {user?.role === 'owner'    && <Link to="/dashboard" className="drawer-link" onClick={closeMobile}>🏪 Dashboard</Link>}
              {user && <Link to="/profile" className="drawer-link" onClick={closeMobile}>👤 Profile</Link>}
            </nav>

            <div className="divider" />

            {user ? (
              <button className="btn btn-danger btn-full" onClick={handleLogout}>🚪 Logout</button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/login" className="btn btn-ghost btn-full" onClick={closeMobile}>Login</Link>
                <Link to="/register" className="btn btn-primary btn-full" onClick={closeMobile}>Sign Up Free</Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          background: rgba(15,14,23,0.9);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          height: 65px;
        }
        .navbar-inner { display: flex; align-items: center; justify-content: space-between; height: 100%; }
        .navbar-logo { font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; gap: 6px; }
        .navbar-links { display: flex; gap: 2rem; }
        .nav-link { color: var(--color-text-muted); font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: var(--color-text); }
        .navbar-actions { display: flex; align-items: center; gap: 10px; }

        /* Cart Button */
        .cart-btn {
          position: relative; font-size: 1.2rem;
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: 10px; padding: 7px 11px; transition: all 0.2s;
        }
        .cart-btn:hover { border-color: var(--color-orange); }
        .cart-count {
          position: absolute; top: -6px; right: -6px;
          background: var(--color-orange); color: white;
          border-radius: 50%; width: 18px; height: 18px;
          font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }

        /* User Menu */
        .user-menu { position: relative; }
        .user-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-orange), var(--color-pink));
          color: white; font-weight: 700; font-size: 0.95rem; transition: transform 0.2s;
        }
        .user-avatar:hover { transform: scale(1.05); }
        .user-dropdown {
          position: absolute; top: 46px; right: 0; min-width: 176px;
          background: #1A1A2E; border: 1px solid var(--color-border);
          border-radius: 14px; padding: 12px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        .dropdown-name { font-weight: 600; font-size: 0.875rem; margin-bottom: 4px; }
        .dropdown-role { display: inline-block; margin-bottom: 4px; }
        .dropdown-item {
          display: block; width: 100%; text-align: left;
          padding: 8px 10px; border-radius: 8px; font-size: 0.875rem;
          color: var(--color-text); background: none; transition: background 0.15s;
        }
        .dropdown-item:hover { background: var(--color-surface-2); }
        .dropdown-logout { color: var(--color-error); }

        /* Hamburger */
        .hamburger {
          display: none; flex-direction: column; justify-content: center;
          gap: 5px; background: none; border: none; padding: 6px;
          cursor: pointer; width: 36px; height: 36px;
        }
        .ham-line {
          display: block; height: 2px; width: 22px; border-radius: 2px;
          background: var(--color-text); transition: all 0.25s ease;
          transform-origin: center;
        }
        .open-1 { transform: translateY(7px) rotate(45deg); }
        .open-2 { opacity: 0; transform: scaleX(0); }
        .open-3 { transform: translateY(-7px) rotate(-45deg); }

        /* Mobile Drawer */
        .mobile-overlay {
          display: none; position: fixed; inset: 0; z-index: 49;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(3px);
        }
        .mobile-drawer {
          position: absolute; top: 65px; left: 0; right: 0;
          background: #16152A; border-bottom: 1px solid var(--color-border);
          padding: 1.5rem; animation: slideDown 0.25s ease;
        }
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } }
        .drawer-user { display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; }
        .drawer-avatar {
          width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, var(--color-orange), var(--color-pink));
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; font-weight: 800; color: white;
        }
        .drawer-nav { display: flex; flex-direction: column; gap: 4px; margin: 0.75rem 0; }
        .drawer-link {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; border-radius: 10px; font-size: 0.95rem; font-weight: 500;
          color: var(--color-text); transition: background 0.15s;
        }
        .drawer-link:hover { background: var(--color-surface-2); }

        /* Responsive */
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .hamburger { display: flex !important; }
          .mobile-overlay { display: block; }
        }
      `}</style>
    </>
  );
}
