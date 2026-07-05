import Header from '../../components/Header/Header';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import { useState } from 'react';

const Home = () => {
  const [category, setCategory] = useState('All');
  return (
    <div style={{ paddingTop: "var(--nav-height)", flex: 1 }}>
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} searchText={''} limit={category === 'All' ? 8 : undefined} />
    </div>
  );
};

export default Home;