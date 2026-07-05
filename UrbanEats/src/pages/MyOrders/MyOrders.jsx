import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./MyOrders.css";

// Helper to map DB row to customer order object
const mapOrder = (row) => ({
  id: row.id,
  orderStatus: row.status,
  orderedItems: row.items || [],
  amount: row.amount,
  userAddress: row.address,
  createdAt: row.created_at,
});

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserOrders = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: true }); // Ascending order to assign sequential numbers (#1, #2...)

        if (error) throw error;

        // Map and reverse so newest is displayed first
        const mapped = (data || []).map(mapOrder);
        setOrders(mapped);
      } catch (err) {
        console.error("Error fetching user orders:", err);
        toast.error("Unable to load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();

    // Subscribe to real-time updates for user's orders
    const subscription = supabase
      .channel(`public:orders:${currentUser.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${currentUser.id}` }, () => {
        fetchUserOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Food Preparing":
        return "status-preparing";
      case "Out for delivery":
        return "status-delivering";
      case "Delivered":
        return "status-delivered";
      default:
        return "status-pending";
    }
  };

  if (loading) {
    return (
      <div className="my-orders-container page-content text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Display orders sorted newest first
  const displayOrders = [...orders].reverse();

  // Get sequential order number based on index in ascending array
  const getOrderNumber = (orderId) => {
    const idx = orders.findIndex((o) => o.id === orderId);
    return idx >= 0 ? idx + 1 : "?";
  };

  return (
    <div className="my-orders-container page-content">
      <h2>My Orders</h2>
      {displayOrders.length === 0 ? (
        <p className="no-orders">You haven't placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {displayOrders.map((order) => {
            const dateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleString("en-IN")
              : "N/A";
            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span className="order-id">Order #{getOrderNumber(order.id)}</span>
                  <span className={`order-status ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
                <div className="order-details">
                  <div className="order-items">
                    <h4>Items:</h4>
                    <ul>
                      {order.orderedItems.map((item, index) => (
                        <li key={index}>
                          {item.name} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="order-info">
                    <p>
                      <strong>Total Amount:</strong> ₹{Number(order.amount).toFixed(2)}
                    </p>
                    <p>
                      <strong>Delivery Address:</strong> {order.userAddress}
                    </p>
                    <p>
                      <strong>Order Date:</strong> {dateStr}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
