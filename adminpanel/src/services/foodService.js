import { supabase } from '../supabaseClient';

export const uploadImage = async (file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('food-images')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('food-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    throw error;
  }
};

export const addFoodItem = async (foodItem) => {
  try {
    const { data, error } = await supabase
      .from('food_items')
      .insert([{
        name: foodItem.name,
        description: foodItem.description,
        category: foodItem.category,
        price: foodItem.price,
        image_url: foodItem.imageUrl,
        diet_type: foodItem.dietType,
        offer: foodItem.offer,
        delivery_time: foodItem.deliveryTime,
        is_sold_out: foodItem.isSoldOut || false,
      }])
      .select();

    if (error) throw error;
    return data[0].id;
  } catch (error) {
    console.error('Error adding food item to Supabase:', error);
    throw error;
  }
};

export const updateFoodItem = async (id, updatedData) => {
  try {
    // Map camelCase to snake_case for the DB
    const dbData = {};
    if (updatedData.name !== undefined) dbData.name = updatedData.name;
    if (updatedData.description !== undefined) dbData.description = updatedData.description;
    if (updatedData.category !== undefined) dbData.category = updatedData.category;
    if (updatedData.price !== undefined) dbData.price = updatedData.price;
    if (updatedData.imageUrl !== undefined) dbData.image_url = updatedData.imageUrl;
    if (updatedData.dietType !== undefined) dbData.diet_type = updatedData.dietType;
    if (updatedData.offer !== undefined) dbData.offer = updatedData.offer;
    if (updatedData.deliveryTime !== undefined) dbData.delivery_time = updatedData.deliveryTime;
    if (updatedData.isSoldOut !== undefined) dbData.is_sold_out = updatedData.isSoldOut;

    const { error } = await supabase
      .from('food_items')
      .update(dbData)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating food item in Supabase:', error);
    throw error;
  }
};

export const deleteFoodItem = async (id) => {
  try {
    const { error } = await supabase
      .from('food_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting food item from Supabase:', error);
    throw error;
  }
};

export const getAllFoodItems = async () => {
  try {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map snake_case DB columns back to camelCase for the app
    return (data || []).map(item => ({
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
    }));
  } catch (error) {
    console.error('Error getting food items from Supabase:', error);
    throw error;
  }
};