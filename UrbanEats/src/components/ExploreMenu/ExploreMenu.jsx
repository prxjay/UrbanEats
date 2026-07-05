import React, { useRef } from "react";
import { categories } from "../../assets/assets";
import "./ExploreMenu.css";

const ExploreMenu = ({ category, setCategory }) => {
  const menuRef = useRef(null);

  const scrollLeft = () => {
    if (menuRef.current) menuRef.current.scrollBy({ left: -220, behavior: "smooth" });
  };
  const scrollRight = () => {
    if (menuRef.current) menuRef.current.scrollBy({ left: 220, behavior: "smooth" });
  };

  return (
    <section className="explore-section">
      {/* Header row */}
      <div className="explore-header">
        <div>
          <h2 className="section-title">What's on your mind?</h2>
          <p className="section-subtitle">Tap a category to filter dishes</p>
        </div>
        <div className="explore-scroll-btns">
          <button className="explore-scroll-btn" onClick={scrollLeft} aria-label="Scroll left">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button className="explore-scroll-btn" onClick={scrollRight} aria-label="Scroll right">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Category scroll */}
      <div className="category-scroll" ref={menuRef}>
        {categories.map((item, index) => (
          <div
            key={index}
            className={`category-item${item.category === category ? " active" : ""}`}
            onClick={() => setCategory((prev) => prev === item.category ? "All" : item.category)}
          >
            <div className="category-img-wrap">
              <img src={item.icon} alt={item.category} />
            </div>
            <span className="category-name">{item.category}</span>
          </div>
        ))}
      </div>

      <div className="explore-divider">
        <div className="explore-divider-dot" />
      </div>
    </section>
  );
};

export default ExploreMenu;
