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
});

export const createOrder = async (orderData, token) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be logged in to place an order');

    const dbRow = {
      user_id: user.id,
      address: orderData.userAddress,
      items: orderData.orderedItems,
      amount: orderData.amount,
      status: 'Order Placed',
      coupon_code: orderData.couponApplied || 'None',
      coupon_discount: orderData.couponDiscountPercent || 0,
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([dbRow])
      .select();

    if (error) throw error;
    return mapOrder(data[0]);
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

export const getOrdersByUserId = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapOrder);
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapOrder);
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const verifyPayment = async (paymentData, token) => {
  console.log('Payment verification stub');
  return { success: true };
};