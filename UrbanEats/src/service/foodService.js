import { supabase } from '../supabaseClient';

// Map DB snake_case to camelCase for the frontend app
const mapFoodItem = (item) => ({
  id: item.id,
  name: item.name,
  description: item.description,
  category: item.category,
  price: item.price,
  imageUrl: item.image_url,
  dietType: item.diet_type,
  offer: item.offer,
  deliveryTime: item.delivery_time,
  isSoldOut: item.is_sold_out,
  createdAt: item.created_at,
});

export const fetchFoodList = async () => {
  try {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapFoodItem);
  } catch (error) {
    console.error('Error fetching food list:', error);
    throw error;
  }
};

export const fetchFoodDetails = async (id) => {
  try {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapFoodItem(data);
  } catch (error) {
    console.error('Error fetching food details:', error);
    throw error;
  }
};