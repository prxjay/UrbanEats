import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./ListFood.css";
import { deleteFoodItem, getAllFoodItems, updateFoodItem } from "../../services/foodService";

const categories = ["Biryani", "Burger", "Cake", "Ice cream", "Pizza", "Rolls", "Salad"];

const ListFood = () => {
  const [list, setList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editItem, setEditItem] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Biryani",
    dietType: "Veg",
    offer: "None"
  });

  const fetchList = async () => {
    try {
      const data = await getAllFoodItems();
      setList(data);
    } catch (error) {
      toast.error("Error while reading the foods.");
    }
  };

  const removeFood = async (foodId) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) return;
    try {
      await deleteFoodItem(foodId);
      toast.success("Food removed.");
      await fetchList();
    } catch (error) {
      toast.error("Error occurred while removing the food.");
    }
  };

  const toggleSoldOut = async (item) => {
    try {
      const newSoldOutState = !item.isSoldOut;
      await updateFoodItem(item.id, { isSoldOut: newSoldOutState });
      toast.success(`Food marked as ${newSoldOutState ? 'Sold Out' : 'Available'}.`);
      await fetchList();
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleEditClick = (item) => {
    setEditItem(item);
    setEditData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category || "Biryani",
      dietType: item.dietType || "Veg",
      offer: item.offer || "None"
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const priceVal = Number(editData.price);
      const computedDeliveryTime = Math.min(35, Math.max(17, Math.round(17 + ((priceVal - 100) / 400) * 18)));

      await updateFoodItem(editItem.id, {
        ...editData,
        price: priceVal,
        deliveryTime: computedDeliveryTime
      });

      toast.success("Food item updated successfully.");
      setEditItem(null);
      await fetchList();
    } catch (error) {
      toast.error("Failed to update food item.");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Filter items based on search query and category
  const filteredList = list.filter((item) => {
    const nameMatch = (item.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const catMatch = selectedCategory === "All" || item.category === selectedCategory;
    return (nameMatch || descMatch) && catMatch;
  });

  return (
    <div className="container py-4">
      <h2 className="mb-4">Food Database</h2>

      {/* Filter Row card (Matches Orders.jsx style) */}
      <div className="card border-0 bg-white shadow-sm p-4 mt-0 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-6">
            <label className="form-label fw-bold text-secondary" style={{ fontSize: "13px" }}>Search Food</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, ingredients or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderColor: "var(--gray-300)" }}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold text-secondary" style={{ fontSize: "13px" }}>Filter Category</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ borderColor: "var(--gray-300)" }}
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-outline-secondary w-100 fw-bold"
              style={{ padding: "10px 0", borderColor: "var(--gray-300)" }}
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Database List Container */}
      <div className="card border-0 bg-white shadow-sm p-4 mt-0">
        <h4 className="mb-4 fw-bold text-secondary">Food Items List ({filteredList.length})</h4>
        {filteredList.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-egg-fried fs-1 mb-2 d-block"></i>
            No matching food items found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Type</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item, index) => {
                  return (
                    <tr key={item.id || index}>
                      <td>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          height={52}
                          width={52}
                          style={{
                            borderRadius: "10px",
                            objectFit: "cover",
                            filter: item.isSoldOut ? "grayscale(100%)" : "none",
                            border: "1px solid var(--gray-200)"
                          }}
                        />
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{item.name}</div>
                        {item.offer && item.offer !== "None" && (
                          <span className="badge bg-light text-primary fw-bold" style={{ fontSize: "10px" }}>
                            {item.offer}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-light text-secondary px-3 py-2 fw-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="fw-bold text-dark">&#8377;{Number(item.price).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${item.dietType === "Veg" ? "bg-success-light text-success" : "bg-danger-light text-danger"} px-2.5 py-1.5 fw-bold`} style={{ fontSize: "11px" }}>
                          {item.dietType}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm fw-bold rounded-pill px-3 ${item.isSoldOut ? "btn-outline-danger" : "btn-outline-success"}`}
                          onClick={() => toggleSoldOut(item)}
                          style={{ fontSize: "12px" }}
                        >
                          {item.isSoldOut ? "Sold Out" : "Available"}
                        </button>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-sm btn-light border"
                            onClick={() => handleEditClick(item)}
                            title="Edit Details"
                            style={{ borderRadius: "50%", width: "36px", height: "36px", padding: "0" }}
                          >
                            <i className="bi bi-pencil-fill text-warning fs-6"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-light border"
                            onClick={() => removeFood(item.id)}
                            title="Delete Food"
                            style={{ borderRadius: "50%", width: "36px", height: "36px", padding: "0" }}
                          >
                            <i className="bi bi-trash-fill text-danger fs-6"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal Overlay */}
      {editItem && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <div className="modal-header-bar">
              <h4 className="fw-bold mb-0">Altering Details</h4>
              <button className="btn-close" onClick={() => setEditItem(null)}></button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-body-form">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  required
                  value={editData.name}
                  onChange={handleEditChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  required
                  value={editData.description}
                  onChange={handleEditChange}
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    className="form-select"
                    value={editData.category}
                    onChange={handleEditChange}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Veg / Non-Veg</label>
                  <select
                    name="dietType"
                    className="form-select"
                    value={editData.dietType}
                    onChange={handleEditChange}
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Offer / Discount</label>
                  <select
                    name="offer"
                    className="form-select"
                    value={editData.offer}
                    onChange={handleEditChange}
                  >
                    <option value="None">None</option>
                    <option value="10% OFF">10% OFF</option>
                    <option value="15% OFF">15% OFF</option>
                    <option value="20% OFF">20% OFF</option>
                  </select>
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label">Price (&#8377;)</label>
                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    required
                    value={editData.price}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light border fw-bold"
                  onClick={() => setEditItem(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListFood;
