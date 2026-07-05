import React, { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import FoodItem from '../FoodItem/FoodItem';
import './FoodDisplay.css';

// Veg check logic (mirror of FoodItem)
const checkIsVeg = (name = "", category = "") => {
  const nonVegKeywords = ["chicken", "mutton", "fish", "prawn", "beef", "pork", "egg", "meat", "keema", "rolls"];
  const nonVegCategories = ["Rolls"];
  const lowerName = name.toLowerCase();
  if (nonVegCategories.includes(category)) return false;
  if (nonVegKeywords.some((k) => lowerName.includes(k))) return false;
  return true;
};

// Select a diverse set of foods across different categories for homepage Top Picks
const getDiverseFoods = (foods, limit = 8) => {
  if (foods.length <= limit) return foods;
  
  // Group foods by category
  const grouped = {};
  foods.forEach(f => {
    if (!grouped[f.category]) grouped[f.category] = [];
    grouped[f.category].push(f);
  });
  
  const result = [];
  const categoriesList = Object.keys(grouped);
  let index = 0;
  
  // Round-robin selection of categories
  while (result.length < limit && categoriesList.length > 0) {
    const cat = categoriesList[index % categoriesList.length];
    const items = grouped[cat];
    
    if (items.length > 0) {
      result.push(items.shift());
    } else {
      categoriesList.splice(categoriesList.indexOf(cat), 1);
    }
    index++;
  }
  
  return result;
};

const FoodDisplay = ({ category, searchText, dietFilter = 'All', hideTitle = false, limit }) => {
  const { foodList } = useContext(StoreContext);
  const navigate = useNavigate();

  const filteredFoods = foodList.filter(food => {
    const matchCategory = category === 'All' || food.category === category;
    const matchSearch = food.name.toLowerCase().includes((searchText || '').toLowerCase());
    const isVeg = food.dietType ? (food.dietType === 'Veg') : checkIsVeg(food.name, food.category);
    const matchDiet =
      dietFilter === 'All' ||
      (dietFilter === 'Veg' && isVeg) ||
      (dietFilter === 'Non-Veg' && !isVeg);
    return matchCategory && matchSearch && matchDiet;
  });

  // Custom sort order based on user preferences
  const categoryOrder = ["Biryani", "Burger", "Pizza", "Rolls", "Salad", "Ice cream", "Cake"];
  
  const sortedFoods = [...filteredFoods].sort((a, b) => {
    const idxA = categoryOrder.indexOf(a.category);
    const idxB = categoryOrder.indexOf(b.category);
    const valA = idxA === -1 ? 999 : idxA;
    const valB = idxB === -1 ? 999 : idxB;
    return valA - valB;
  });

  // Apply diversity limits for top picks home view using sorted list
  const displayedFoods = limit ? getDiverseFoods(sortedFoods, limit) : sortedFoods;

  return (
    <section className="food-display-section">
      {!hideTitle && (
        <div className="food-display-header">
          <div>
            <h2 className="section-title">
              {category === 'All' ? 'Top picks for you' : `${category} dishes`}
            </h2>
            <p className="section-subtitle">{filteredFoods.length} items available</p>
          </div>
        </div>
      )}

      {filteredFoods.length > 0 ? (
        <>
          <div className="food-grid">
            {displayedFoods.map((food, index) => (
              <FoodItem
                key={food.id || index}
                id={food.id}
                name={food.name}
                description={food.description}
                imageUrl={food.imageUrl}
                price={food.price}
                category={food.category}
                dietType={food.dietType}
                offer={food.offer}
                deliveryTime={food.deliveryTime}
                isSoldOut={food.isSoldOut}
              />
            ))}
          </div>
          {limit && filteredFoods.length > limit && (
            <div className="view-more-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
              <button
                className="view-more-btn"
                onClick={() => navigate('/explore')}
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '14px 38px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(252, 128, 25, 0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'none'; }}
              >
                View More Dishes
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="food-empty">
          <div className="food-empty-icon" style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: "64px", height: "64px", color: "var(--gray-300)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
            </svg>
          </div>
          <h3>No dishes found</h3>
          <p>
            {searchText
              ? `Sorry, we couldn't find any results for "${searchText}"`
              : "Try a different category or filter"}
          </p>
        </div>
      )}
    </section>
  );
};

export default FoodDisplay;