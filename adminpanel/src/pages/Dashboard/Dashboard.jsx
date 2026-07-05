import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { updateOrderStatus } from "../../services/orderService";
import { toast } from "react-toastify";

// Map DB row to app object
const mapOrder = (row) => ({
  id: row.id,
  userId: row.user_id,
  userAddress: row.address,
  orderedItems: row.items || [],
  amount: row.amount,
  orderStatus: row.status,
  createdAt: row.created_at,
});

const Dashboard = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: true }); // ascending so order #1 is oldest

        if (error) throw error;
        setOrders((data || []).map(mapOrder));
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Unable to load Dashboard. Please try again.");
      }
    };

    fetchOrders();

    const ordersSubscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [...prev, mapOrder(payload.new)]);
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? mapOrder(payload.new) : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(ordersSubscription); };
  }, []);

  const updateStatus = async (event, orderId) => {
    try {
      await updateOrderStatus(orderId, event.target.value);
      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Filter orders for active/dashboard view (not Delivered)
  const activeOrders = orders.filter((o) => o.orderStatus !== "Delivered");

  // Metrics calculations
  const pendingCount = activeOrders.filter((o) => o.orderStatus === "Order Placed").length;
  const preparingCount = activeOrders.filter((o) => o.orderStatus === "Food Preparing").length;
  const deliveryCount = activeOrders.filter((o) => o.orderStatus === "Out for delivery").length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "Delivered").length;

  // Sequential order number: position in the full sorted list (oldest = #1)
  const getOrderNumber = (orderId) => {
    const idx = orders.findIndex(o => o.id === orderId);
    return idx >= 0 ? idx + 1 : '?';
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Dashboard Overview</h2>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card p-3 border-0 bg-white shadow-sm h-100" style={{ borderLeft: "4px solid var(--gray-400) !important" }}>
            <div className="text-muted small fw-bold text-uppercase">Placed / Pending</div>
            <div className="my-2 fs-2 fw-bold text-dark">{pendingCount}</div>
            <span className="badge bg-light text-dark align-self-start">Waiting to prepare</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 border-0 bg-white shadow-sm h-100" style={{ borderLeft: "4px solid var(--primary) !important" }}>
            <div className="text-muted small fw-bold text-uppercase">Preparing</div>
            <div className="my-2 fs-2 fw-bold text-dark">{preparingCount}</div>
            <span className="badge bg-light text-dark align-self-start">Kitchen processing</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 border-0 bg-white shadow-sm h-100" style={{ borderLeft: "4px solid var(--accent) !important" }}>
            <div className="text-muted small fw-bold text-uppercase">Out for Delivery</div>
            <div className="my-2 fs-2 fw-bold text-dark">{deliveryCount}</div>
            <span className="badge bg-light text-dark align-self-start">In transit</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 border-0 bg-white shadow-sm h-100" style={{ borderLeft: "4px solid var(--secondary) !important" }}>
            <div className="text-muted small fw-bold text-uppercase">Completed</div>
            <div className="my-2 fs-2 fw-bold text-dark">{deliveredCount}</div>
            <span className="badge bg-light text-dark align-self-start">Delivered history</span>
          </div>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="row">
        <div className="col-12 card border-0 bg-white shadow-sm p-4 mt-0">
          <h4 className="mb-4 fw-bold text-secondary">Active Orders</h4>
          {activeOrders.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-check-circle fs-1 mb-2 d-block"></i>
              No active orders to prepare!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer details</th>
                    <th>Ordered Items</th>
                    <th>Total Amount</th>
                    <th>Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-bold text-secondary" style={{ fontSize: '13px' }}>
                        #{getOrderNumber(order.id)}
                      </td>
                      <td>
                        <div className="fw-bold">{order.userId ? "Registered Customer" : "Guest User"}</div>
                        <div className="text-muted small">{order.userAddress}</div>
                      </td>
                      <td>
                        <div className="fw-semibold">
                          {(order.orderedItems || []).map((item, index) => (
                            <span key={index}>
                              {item.name} x {item.quantity}
                              {index < (order.orderedItems.length - 1) ? ", " : ""}
                            </span>
                          ))}
                        </div>
                        <div className="text-muted small">{(order.orderedItems || []).length} items</div>
                      </td>
                      <td className="fw-bold text-dark">&#x20B9;{Number(order.amount).toFixed(2)}</td>
                      <td>
                        <select
                          className="form-select form-select-sm fw-bold border-1"
                          onChange={(e) => updateStatus(e, order.id)}
                          value={order.orderStatus}
                          style={{ borderColor: "var(--gray-300)", color: "var(--text-primary)", fontSize: "13px" }}
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Food Preparing">Food Preparing</option>
                          <option value="Out for delivery">Out for delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
