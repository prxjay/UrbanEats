import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./Header.css";

const LOCATIONS = ["Chennai", "Coimbatore", "Madurai", "Erode", "Salem", "Trichy"];

const Header = () => {
  const [searchText, setSearchText] = useState("");
  const { selectedLocation, setSelectedLocation } = useContext(StoreContext);
  const [locationOpen, setLocationOpen] = useState(false);
  const locationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/explore?q=${encodeURIComponent(searchText.trim())}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />

        <div className="hero-content">
          <h1 className="hero-title">
            Craving something<br />
            <span>delicious?</span>
          </h1>

          <p className="hero-subtitle">
            Order the best food from top restaurants. Fast delivery, hot meals, delivered right to you.
          </p>

          {/* Location + Search row */}
          <div className="hero-search-row-container" style={{ position: "relative", zIndex: 10 }}>
            <form className="hero-search-row" onSubmit={handleSearch}>
              {/* Location picker */}
              <div style={{ position: "relative" }} ref={locationRef}>
                <button
                  type="button"
                  className="hero-location-btn"
                  onClick={() => setLocationOpen(!locationOpen)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <span className="hero-loc-text">{selectedLocation}</span>
                  <span className="hero-location-arrow">▼</span>
                </button>

                {locationOpen && (
                  <div className="hero-location-dropdown">
                    {LOCATIONS.map((loc) => (
                      <div
                        key={loc}
                        className={`hero-location-option${loc === selectedLocation ? " selected" : ""}`}
                        onClick={() => { setSelectedLocation(loc); setLocationOpen(false); }}
                      >
                        {loc}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search input */}
              <div className="hero-search-wrap">
                <svg className="hero-search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for food..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  id="hero-search-input"
                />
                <button type="submit" className="hero-search-btn" id="hero-search-btn">Search</button>
              </div>
            </form>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">4.8<span>★</span></span>
              <span className="hero-stat-label">Avg Rating</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">25<span>min</span></span>
              <span className="hero-stat-label">Avg Delivery</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">100<span>%</span></span>
              <span className="hero-stat-label">Fresh Food</span>
            </div>
          </div>
        </div>
      </section>

      {/* Offer Cards (emojis replaced by inline SVG icons) */}
      <div className="hero-offers">
        <div className="offer-card">
          <div className="offer-icon offer-icon-orange">
            {/* Tag / Discount SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="var(--primary)" style={{ width: "24px", height: "24px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 0 0 3.182 0l5.178-5.178a2.25 2.25 0 0 0 0-3.182L12.01 3.659A2.25 2.25 0 0 0 10.418 3H9.568Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h.008v.008H6V7.5Z" />
            </svg>
          </div>
          <div className="offer-text">
            <h4> Upto 40% Offer</h4>
            <p>On your first order</p>
          </div>
        </div>
        <div className="offer-card">
          <div className="offer-icon offer-icon-green">
            {/* Shopping Cart SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="var(--accent)" style={{ width: "24px", height: "24px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </div>
          <div className="offer-text">
            <h4>Free Delivery</h4>
            <p>On orders above ₹199</p>
          </div>
        </div>
        <div className="offer-card">
          <div className="offer-icon offer-icon-blue">
            {/* Stopwatch / Timer SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="#3b82f6" style={{ width: "24px", height: "24px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div className="offer-text">
            <h4>Lightning Fast</h4>
            <p>Delivery in 30 minutes</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
