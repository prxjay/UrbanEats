import React, { useContext, useState, useEffect, useRef } from "react";
import "./Menubar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { supabase } from "../../supabaseClient";

const Menubar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { quantities = {}, token, setToken, setQuantities, foodList = [] } = useContext(StoreContext);
  const uniqueItemsInCart = Object.keys(quantities || {}).filter(
    (id) => quantities[id] > 0 && foodList.some((food) => food.id === id)
  ).length;
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
    localStorage.removeItem("token");
    setToken("");
    setQuantities({});
    setProfileOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`swiggy-nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <img src={assets.logo} alt="UrbanEats" />
            <span className="nav-logo-text">UrbanEats</span>
          </Link>

          {/* Nav Links — desktop */}
          <div className="nav-links">
            <Link to="/" className={`nav-link-item${isActive("/") ? " active" : ""}`}>Home</Link>
            <Link to="/explore" className={`nav-link-item${isActive("/explore") ? " active" : ""}`}>Explore</Link>
            <Link to="/contact" className={`nav-link-item${isActive("/contact") ? " active" : ""}`}>Contact</Link>
          </div>

          {/* Right side controls */}
          <div className="nav-right">
            {/* User Icon (always visible near cart icon, even after signing out) */}
            {!token ? (
              <button 
                className="nav-user-guest-btn" 
                id="nav-user-guest-btn"
                onClick={() => navigate("/login")}
                aria-label="Sign in"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="nav-user-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span className="nav-signin-text hide-mobile">Sign in</span>
              </button>
            ) : (
              <div className="nav-profile" ref={dropdownRef}>
                <button className="nav-profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
                  <img src={assets.profile} alt="profile" className="nav-avatar" />
                  <span className="nav-profile-name hide-mobile">My Account</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {profileOpen && (
                  <div className="nav-dropdown">
                    <button className="nav-dropdown-item" onClick={() => { navigate("/myorders"); setProfileOpen(false); }}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zm3 0a1.5 1.5 0 113 0v.75h-3V6zm-3 11.25a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75-4.5a.75.75 0 000 1.5h6a.75.75 0 000-1.5h-6z" clipRule="evenodd" />
                      </svg>
                      My Orders
                    </button>
                    <div className="nav-dropdown-divider" />
                    <button className="nav-dropdown-item" onClick={() => { navigate("/myqueries"); setProfileOpen(false); }}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.908 48.908 0 0 1-2.906.32 1.888 1.888 0 0 0-1.503.784l-2.457 3.375a.75.75 0 0 1-1.228 0l-2.457-3.375a1.888 1.888 0 0 0-1.503-.784 48.908 48.908 0 0 1-2.906-.32c-1.978-.292-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.678 3.348-3.97Z" clipRule="evenodd" />
                      </svg>
                      My Queries
                    </button>
                    <div className="nav-dropdown-divider" />
                    <button className="nav-dropdown-item" onClick={logout}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-1.72 1.72h10.94a.75.75 0 010 1.5H10.81l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0z" clipRule="evenodd" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            <Link to="/cart" className="nav-cart" id="nav-cart-btn">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <span className="nav-cart-label hide-mobile">Cart</span>
              {uniqueItemsInCart > 0 && (
                <span className="nav-cart-count">{uniqueItemsInCart}</span>
              )}
            </Link>

            {/* Hamburger */}
            <button className="nav-hamburger" id="nav-hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
              <span className={mobileMenuOpen ? "open" : ""} />
              <span className={mobileMenuOpen ? "open" : ""} />
              <span className={mobileMenuOpen ? "open" : ""} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
        <div className="nav-mobile-menu">
          <Link to="/" className={`nav-mobile-link${isActive("/") ? " active" : ""}`}>Home</Link>
          <Link to="/explore" className={`nav-mobile-link${isActive("/explore") ? " active" : ""}`}>Explore</Link>
          <Link to="/contact" className={`nav-mobile-link${isActive("/contact") ? " active" : ""}`}>Contact</Link>
        </div>
      )}
    </>
  );
};

export default Menubar;
