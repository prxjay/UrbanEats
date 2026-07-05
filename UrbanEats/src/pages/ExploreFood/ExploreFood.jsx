import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import './ExploreFood.css';

const ExploreFood = () => {
  const [searchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('All');
  const [dietFilter, setDietFilter] = useState('All'); // All | Veg | Non-Veg

  // Update search if URL query changes (from hero)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchText(q);
  }, [searchParams]);

  return (
    <div className="explore-page page-content">
      {/* Page header */}
      <div className="explore-page-header">
        <div className="explore-page-inner">
          <h1 className="explore-page-title">Explore Food</h1>
          <p className="explore-page-sub">Discover dishes from all categories</p>

          {/* Filter Row */}
          <div className="explore-filter-row">
            {/* Search */}
            <div className="explore-search-wrap">
              <svg className="explore-search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                id="explore-search-input"
                type="text"
                className="explore-search-input"
                placeholder="Search for your favourite dish..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <button className="explore-search-clear" onClick={() => setSearchText('')}>✕</button>
              )}
            </div>

            {/* Diet Filter */}
            <div className="explore-diet-filter">
              {['All', 'Veg', 'Non-Veg'].map((d) => (
                <button
                  key={d}
                  id={`diet-filter-${d}`}
                  className={`diet-btn${dietFilter === d ? ' active' : ''} diet-btn-${d.toLowerCase().replace('-', '')}`}
                  onClick={() => setDietFilter(d)}
                >
                  {d === 'Veg' && <span className="diet-dot veg-dot" />}
                  {d === 'Non-Veg' && <span className="diet-dot nonveg-dot" />}
                  {d}
                </button>
              ))}
            </div>

            {/* Category */}
            <select
              id="explore-category-select"
              className="explore-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Biryani">Biryani</option>
              <option value="Burger">Burger</option>
              <option value="Cake">Cakes</option>
              <option value="Ice cream">Ice Cream</option>
              <option value="Pizza">Pizza</option>
              <option value="Rolls">Rolls</option>
              <option value="Salad">Salad</option>
            </select>
          </div>
        </div>
      </div>

      {/* Food grid */}
      <FoodDisplay category={category} searchText={searchText} dietFilter={dietFilter} hideTitle={true} />
    </div>
  );
};

export default ExploreFood;