import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useAdminAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { adminUser, signOut } = useAdminAuth();

  const navLinks = [
    { to: '/', icon: 'bi-speedometer2', label: 'Dashboard', end: true },
    { to: '/add', icon: 'bi-plus-circle', label: 'Add Food' },
    { to: '/list', icon: 'bi-list-ul', label: 'List Food' },
    { to: '/orders', icon: 'bi-clock-history', label: 'Orders' },
    { to: '/support', icon: 'bi-chat-left-text', label: 'Customer Support' },
  ];

  return (
    <>
      {/* === MOBILE TOP HEADER BAR === */}
      <div className="mobile-topbar d-flex d-md-none">
        <div className="mobile-topbar-brand">
          <img src={assets.logo} alt="UrbanEats" height={32} width={32} style={{ borderRadius: '8px', objectFit: 'contain' }} />
          <span>UrbanEats</span>
        </div>
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <i className={`bi ${mobileOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
        </button>
      </div>

      {/* === MOBILE DRAWER OVERLAY === */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* === SIDEBAR === */}
      <div className={`sidebar-panel ${mobileOpen ? 'sidebar-open' : ''}`} id="sidebar-wrapper">
        {/* Brand (visible only on desktop) */}
        <div className="sidebar-heading d-none d-md-flex">
          <img src={assets.logo} alt="" height={36} width={36} style={{ borderRadius: '8px', objectFit: 'contain' }} />
          <span className="sidebar-brand-name">UrbanEats</span>
        </div>

        <nav className="sidebar-nav" style={{ flex: 1 }}>
          {navLinks.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <i className={`bi ${icon}`}></i>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Admin info + Sign Out at bottom */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {adminUser && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                Signed in as
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adminUser.email}
              </div>
            </div>
          )}
          <button
            onClick={signOut}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(231,76,60,0.12)', border: '1px solid rgba(231,76,60,0.2)',
              borderRadius: '10px', padding: '10px 14px', color: '#e74c3c',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(231,76,60,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(231,76,60,0.12)'}
          >
            <i className="bi bi-box-arrow-left"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;