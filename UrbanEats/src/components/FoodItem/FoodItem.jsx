import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./FoodItem.css";

// Determine veg status based on food name/category
const isVeg = (name = "", category = "") => {
  const nonVegKeywords = ["chicken", "mutton", "fish", "prawn", "beef", "pork", "egg", "meat", "keema", "non-veg", "nonveg", "rolls"];
  const nonVegCategories = ["Rolls"]; // Rolls often non-veg; Biryani handled by name
  const lowerName = name.toLowerCase();
  if (nonVegCategories.includes(category)) return false;
  if (nonVegKeywords.some((k) => lowerName.includes(k))) return false;
  if (category === "Biryani" && (lowerName.includes("chicken") || lowerName.includes("mutton"))) return false;
  return true;
};

// Stable seed helper by id
const getSeed = (id) => {
  return String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
};

// Discount by price
const getDiscount = (price) => {
  if (price >= 250) return 20;
  if (price >= 150) return 15;
  return 10;
};

// Delivery time by category
const getDeliveryTime = (category, seed) => {
  if (category === "Cake" || category === "Ice cream") {
    return `${15 + (seed % 4)} mins`;
  }
  if (category === "Salad") {
    return `${20 + (seed % 3)} mins`;
  }
  return `${25 + (seed % 6)} mins`;
};

// Random rating 3.8 – 4.9 per item (stable by id)
const getRating = (id) => {
  const seed = getSeed(id);
  const range = 4.9 - 3.8;
  return (3.8 + (seed % 100) / 100 * range).toFixed(1);
};

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="10" height="10">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const FoodItem = ({ name, description, id, imageUrl, price, category, dietType, offer, deliveryTime, isSoldOut }) => {
  const { increaseQty, decreaseQty, quantities } = useContext(StoreContext);
  const qty = quantities[id] || 0;
  const seed = useMemo(() => getSeed(id), [id]);
  
  // Veg/Non-Veg override
  const vegStatus = useMemo(() => {
    if (dietType) return dietType === "Veg";
    return isVeg(name, category);
  }, [name, category, dietType]);

  // Discount percentage parsing
  const discountVal = useMemo(() => {
    if (offer) {
      return offer !== "None" ? parseInt(offer) : null;
    }
    return getDiscount(price);
  }, [price, offer]);

  // Dynamic delivery time logic based on price
  const displayDeliveryTime = useMemo(() => {
    if (deliveryTime) return `${deliveryTime} mins`;
    const computed = Math.min(35, Math.max(17, Math.round(17 + ((price - 100) / 400) * 18)));
    return `${computed} mins`;
  }, [price, deliveryTime]);

  const rating = useMemo(() => getRating(id || name), [id, name]);

  return (
    <div className={`food-card ${isSoldOut ? "sold-out-card" : ""}`} style={isSoldOut ? { opacity: 0.85 } : {}}>
      {/* Image */}
      <div className="food-card-img-wrap" style={isSoldOut ? { filter: "grayscale(1)" } : {}}>
        <Link to={`/food/${id}`}>
          <img src={imageUrl} alt={name} />
        </Link>

        {/* Veg/Non-veg indicator */}
        <div className={`food-card-type ${vegStatus ? "veg" : "nonveg"}`}>
          <span className="food-card-type-dot" />
        </div>

        {/* Discount badge */}
        {discountVal && (
          <div className="food-card-discount">{discountVal}% OFF</div>
        )}
      </div>

      {/* Body */}
      <div className="food-card-body">
        <div className="food-card-header">
          <Link to={`/food/${id}`} style={{ textDecoration: "none", flex: 1 }}>
            <h3 className="food-card-name">{name}</h3>
          </Link>
          <div className="food-rating">
            <StarIcon />
            {rating}
          </div>
        </div>

        <p className="food-card-description">{description}</p>

        <div className="food-card-meta">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {displayDeliveryTime}
          </span>
          {price >= 199 && (
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              Free delivery
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="food-card-footer">
        <div className="food-card-price" style={isSoldOut ? { color: "var(--text-muted)" } : {}}>
          <sub>₹</sub>{price}
        </div>

        {isSoldOut ? (
          <div className="food-sold-out-badge">
            Sold Out
          </div>
        ) : qty > 0 ? (
          <div className="food-qty">
            <button className="food-qty-btn" onClick={() => decreaseQty(id)}>−</button>
            <span className="food-qty-count">{qty}</span>
            <button className="food-qty-btn" onClick={() => increaseQty(id)}>+</button>
          </div>
        ) : (
          <button className="food-add-btn" onClick={() => increaseQty(id)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            ADD
          </button>
        )}
      </div>
    </div>
  );
};

export default FoodItem;
