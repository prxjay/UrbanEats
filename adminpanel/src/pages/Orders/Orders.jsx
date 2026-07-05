import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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
        toast.error("Unable to load orders history. Please try again.");
      }
    };

    fetchOrders();

    const ordersSubscription = supabase
      .channel('public:orders_history')
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

  // Sequential order number: position in the full sorted list (oldest = #1)
  const getOrderNumber = (orderId) => {
    const idx = orders.findIndex(o => o.id === orderId);
    return idx >= 0 ? idx + 1 : '?';
  };

  // Filter orders: Delivered status, search query, date ranges
  const filteredOrders = orders.filter((order) => {
    // 1. Must be completed/Delivered
    if (order.orderStatus !== "Delivered") return false;

    // 2. Text Search (Order#, Address, Ordered Item names)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const numMatch = String(getOrderNumber(order.id)).includes(q);
      const addressMatch = (order.userAddress || "").toLowerCase().includes(q);
      const itemsMatch = (order.orderedItems || []).some((item) =>
        (item.name || "").toLowerCase().includes(q)
      );
      if (!numMatch && !addressMatch && !itemsMatch) return false;
    }

    // 3. Date Filter (From / To)
    if (order.createdAt) {
      const orderTime = new Date(order.createdAt).getTime();
      if (dateFrom) {
        const fromTime = new Date(`${dateFrom}T00:00:00`).getTime();
        if (orderTime < fromTime) return false;
      }
      if (dateTo) {
        const toTime = new Date(`${dateTo}T23:59:59`).getTime();
        if (orderTime > toTime) return false;
      }
    }

    return true;
  });

  return (
    <div className="container py-4">
      <h2 className="mb-4">Order History</h2>

      {/* Filter Row card */}
      <div className="card border-0 bg-white shadow-sm p-4 mt-0 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label className="form-label">Search Query</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Order #, Address, or Food Item name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="col-md-3 col-6">
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-control"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="col-md-3 col-6">
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-control"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="col-md-1">
            <button
              className="btn btn-outline-secondary w-100 fw-bold"
              style={{ padding: "10px 0" }}
              onClick={() => { setSearchQuery(""); setDateFrom(""); setDateTo(""); }}
              title="Reset Filters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Historical Orders Table */}
      <div className="card border-0 bg-white shadow-sm p-4 mt-0">
        <h4 className="mb-4 fw-bold text-secondary">Completed Shipments</h4>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-slash-circle fs-1 mb-2 d-block"></i>
            No matching completed orders found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer Address</th>
                  <th>Food Items</th>
                  <th>Amount</th>
                  <th>Delivered At</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const dateStr = order.createdAt
                    ? new Date(order.createdAt).toLocaleString("en-IN")
                    : "N/A";
                  return (
                    <tr key={order.id}>
                      <td className="fw-bold text-secondary" style={{ fontSize: "13px" }}>
                        #{getOrderNumber(order.id)}
                      </td>
                      <td>
                        <div className="fw-semibold">{order.userId ? "Registered Customer" : "Guest User"}</div>
                        <div className="text-muted small mb-1">{order.userAddress}</div>
                        {order.email && (
                          <a 
                            href={`mailto:${order.email}?subject=Your UrbanEats Order %23${getOrderNumber(order.id)} is Delivered!&body=Hi there,%0D%0A%0D%0AWe are happy to inform you that your UrbanEats order %23${getOrderNumber(order.id)} has been delivered!%0D%0A%0D%0AThank you for ordering with us.%0D%0A%0D%0AEnjoy your meal!`}
                            className="btn btn-sm btn-outline-primary mt-1 py-0 px-2"
                            style={{ fontSize: "11px", borderRadius: "10px" }}
                            title="Send Delivery Email"
                          >
                            ✉️ Email Client
                          </a>
                        )}
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
                      <td className="text-muted small">{dateStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
