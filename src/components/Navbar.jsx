import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { auth, signOut as firebaseSignOut } from '../config/firebase';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    logout();
    navigate('/login');
    setMobileOpen(false);
    setMenuOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ── Top Navbar ── */}
      <nav className="navbar">
        <div className="container navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={closeMobile}>
            🍕 <span className="gradient-text">FoodRush</span>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar-links desktop-only">
            <Link to="/restaurants" className={`nav-link ${isActive('/restaurants') ? 'active' : ''}`}>Restaurants</Link>
            {user?.role === 'customer' && <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>My Orders</Link>}
            {user?.role === 'owner'    && <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>}
          </div>

          {/* Right Actions */}
          <div className="navbar-actions">
            {/* Quick Cart Button */}
            {user && (
              <Link to="/cart" className="cart-btn" onClick={closeMobile} aria-label="Cart">
                🛒
                {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
              </Link>
            )}

            {/* If Not Logged In: Quick Mobile Login Button */}
            {!user && (
              <Link to="/login" className="mobile-login-btn" onClick={closeMobile}>
                Login
              </Link>
            )}

            {/* Desktop User Menu / Auth Buttons */}
            {user ? (
              <div className="user-menu desktop-only">
                <button className="user-avatar" onClick={() => setMenuOpen(!menuOpen)} aria-label="User Profile">
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

            {/* Hamburger for mobile drawer */}
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

      {/* ── Mobile Top Drawer ── */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={closeMobile}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            {user && (
              <div className="drawer-user">
                <div className="drawer-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user.name}</div>
                  <div className="badge badge-orange" style={{ fontSize: '0.68rem', marginTop: '2px' }}>{user.role}</div>
                </div>
              </div>
            )}

            <nav className="drawer-nav">
              <Link to="/" className="drawer-link" onClick={closeMobile}>🏠 Home</Link>
              <Link to="/restaurants" className="drawer-link" onClick={closeMobile}>🍽️ Explore Restaurants</Link>
              {user && <Link to="/cart" className="drawer-link" onClick={closeMobile}>🛒 Cart {totalItems > 0 ? `(${totalItems})` : ''}</Link>}
              {user?.role === 'customer' && <Link to="/orders" className="drawer-link" onClick={closeMobile}>📦 My Orders</Link>}
              {user?.role === 'owner'    && <Link to="/dashboard" className="drawer-link" onClick={closeMobile}>🏪 Owner Dashboard</Link>}
              {user && <Link to="/profile" className="drawer-link" onClick={closeMobile}>👤 My Profile</Link>}
            </nav>

            <div className="divider" style={{ margin: '10px 0' }} />

            {user ? (
              <button className="btn btn-danger btn-full" onClick={handleLogout} style={{ padding: '10px', fontSize: '0.88rem' }}>
                🚪 Logout
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/login" className="btn btn-ghost btn-full" onClick={closeMobile} style={{ padding: '10px', fontSize: '0.88rem' }}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-full" onClick={closeMobile} style={{ padding: '10px', fontSize: '0.88rem' }}>
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Native-Style Mobile Bottom Navigation Bar ── */}
      <div className="mobile-bottom-bar">
        <Link to="/" className={`mbb-item ${isActive('/') ? 'active' : ''}`}>
          <span className="mbb-icon">🏠</span>
          <span className="mbb-label">Home</span>
        </Link>
        <Link to="/restaurants" className={`mbb-item ${isActive('/restaurants') ? 'active' : ''}`}>
          <span className="mbb-icon">🍽️</span>
          <span className="mbb-label">Explore</span>
        </Link>
        <Link to="/cart" className={`mbb-item mbb-cart-item ${isActive('/cart') ? 'active' : ''}`}>
          <div className="mbb-cart-wrap">
            <span className="mbb-icon">🛒</span>
            {totalItems > 0 && <span className="mbb-cart-badge">{totalItems}</span>}
          </div>
          <span className="mbb-label">Cart</span>
        </Link>
        {user?.role === 'owner' ? (
          <Link to="/dashboard" className={`mbb-item ${isActive('/dashboard') ? 'active' : ''}`}>
            <span className="mbb-icon">🏪</span>
            <span className="mbb-label">Dashboard</span>
          </Link>
        ) : (
          <Link to={user ? "/orders" : "/login"} className={`mbb-item ${isActive('/orders') ? 'active' : ''}`}>
            <span className="mbb-icon">📦</span>
            <span className="mbb-label">Orders</span>
          </Link>
        )}
        <Link to={user ? "/profile" : "/login"} className={`mbb-item ${isActive('/profile') || isActive('/login') ? 'active' : ''}`}>
          <span className="mbb-icon">{user ? '👤' : '🔑'}</span>
          <span className="mbb-label">{user ? 'Profile' : 'Login'}</span>
        </Link>
      </div>

      <style>{`
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          background: rgba(15,14,23,0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-top: max(env(safe-area-inset-top, 0px), 8px);
          padding-bottom: 8px;
          min-height: calc(56px + max(env(safe-area-inset-top, 0px), 8px));
        }
        .navbar-inner { display: flex; align-items: center; justify-content: space-between; width: 100%; }
        .navbar-logo { font-size: 1.25rem; font-weight: 800; display: flex; align-items: center; gap: 6px; }
        .navbar-links { display: flex; gap: 1.75rem; }
        .nav-link { color: var(--color-text-muted); font-size: 0.88rem; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover, .nav-link.active { color: var(--color-orange); }
        .navbar-actions { display: flex; align-items: center; gap: 8px; }

        /* Mobile Login Pill */
        .mobile-login-btn {
          display: none;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(255,107,53,0.15);
          border: 1px solid rgba(255,107,53,0.35);
          color: var(--color-orange);
          font-weight: 700;
          font-size: 0.78rem;
          transition: all 0.2s;
        }
        .mobile-login-btn:hover { background: var(--color-orange); color: white; }

        /* Cart Button */
        .cart-btn {
          position: relative; font-size: 1.15rem;
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: 10px; padding: 6px 10px; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .cart-btn:hover { border-color: var(--color-orange); }
        .cart-count {
          position: absolute; top: -5px; right: -5px;
          background: var(--color-orange); color: white;
          border-radius: 50%; width: 17px; height: 17px;
          font-size: 9.5px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }

        /* User Menu */
        .user-menu { position: relative; }
        .user-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-orange), var(--color-pink));
          color: white; font-weight: 700; font-size: 0.88rem; transition: transform 0.2s;
        }
        .user-avatar:hover { transform: scale(1.05); }
        .user-dropdown {
          position: absolute; top: 44px; right: 0; min-width: 176px;
          background: #1A1A2E; border: 1px solid var(--color-border);
          border-radius: 14px; padding: 12px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        .dropdown-name { font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; }
        .dropdown-role { display: inline-block; margin-bottom: 4px; font-size: 0.68rem; }
        .dropdown-item {
          display: block; width: 100%; text-align: left;
          padding: 8px 10px; border-radius: 8px; font-size: 0.82rem;
          color: var(--color-text); background: none; transition: background 0.15s;
        }
        .dropdown-item:hover { background: var(--color-surface-2); }
        .dropdown-logout { color: var(--color-error); }

        /* Hamburger */
        .hamburger {
          display: none; flex-direction: column; justify-content: center;
          gap: 4.5px; background: none; border: none; padding: 6px;
          cursor: pointer; width: 34px; height: 34px;
        }
        .ham-line {
          display: block; height: 2px; width: 20px; border-radius: 2px;
          background: var(--color-text); transition: all 0.25s ease;
          transform-origin: center;
        }
        .open-1 { transform: translateY(6.5px) rotate(45deg); }
        .open-2 { opacity: 0; transform: scaleX(0); }
        .open-3 { transform: translateY(-6.5px) rotate(-45deg); }

        /* Mobile Drawer */
        .mobile-overlay {
          display: none; position: fixed; inset: 0; z-index: 49;
          background: rgba(0,0,0,0.65); backdrop-filter: blur(4px);
        }
        .mobile-drawer {
          position: absolute; top: calc(56px + max(env(safe-area-inset-top, 0px), 8px));
          left: 0; right: 0;
          background: #16152A; border-bottom: 1px solid var(--color-border);
          padding: 1.25rem 1.5rem 1.5rem; animation: slideDown 0.25s ease;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        }
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } }
        .drawer-user { display: flex; align-items: center; gap: 10px; margin-bottom: 0.75rem; }
        .drawer-avatar {
          width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, var(--color-orange), var(--color-pink));
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; font-weight: 800; color: white;
        }
        .drawer-nav { display: flex; flex-direction: column; gap: 3px; margin: 0.5rem 0; }
        .drawer-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px; font-size: 0.88rem; font-weight: 500;
          color: var(--color-text); transition: background 0.15s;
        }
        .drawer-link:hover { background: var(--color-surface-2); }

        /* ── Mobile Bottom Navigation Bar ── */
        .mobile-bottom-bar {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 45;
          background: rgba(18, 17, 30, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 6px 12px calc(6px + env(safe-area-inset-bottom, 0px));
          justify-content: space-around;
          align-items: center;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.4);
        }
        .mbb-item {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; padding: 4px 8px; border-radius: 8px; color: var(--color-text-muted);
          font-size: 0.7rem; font-weight: 600; transition: all 0.2s; min-width: 52px;
        }
        .mbb-item.active { color: var(--color-orange); }
        .mbb-icon { font-size: 1.25rem; line-height: 1; }
        .mbb-label { font-size: 0.68rem; font-weight: 600; }
        .mbb-cart-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
        .mbb-cart-badge {
          position: absolute; top: -5px; right: -8px;
          background: var(--color-orange); color: white;
          border-radius: 50%; width: 15px; height: 15px;
          font-size: 8.5px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-login-btn { display: inline-flex !important; }
          .hamburger { display: flex !important; }
          .mobile-overlay { display: block; }
          .mobile-bottom-bar { display: flex !important; }
          .navbar-logo { font-size: 1.15rem; }
        }
      `}</style>
    </>
  );
}
