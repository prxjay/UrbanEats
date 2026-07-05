import { supabase } from '../supabaseClient';

// Map DB snake_case row to camelCase order object
const mapOrder = (row) => ({
  id: row.id,
  userId: row.user_id,
  userAddress: row.address,
  orderedItems: row.items || [],
  amount: row.amount,
  orderStatus: row.status,
  couponCode: row.coupon_code,
  couponDiscount: row.coupon_discount,
  createdAt: row.created_at,
  updatedAt: row.updated_at || row.created_at,
});

export const fetchAllOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapOrder);
  } catch (error) {
    console.error('Error occurred while fetching orders from Supabase', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error occurred while updating order status in Supabase', error);
    throw error;
  }
};