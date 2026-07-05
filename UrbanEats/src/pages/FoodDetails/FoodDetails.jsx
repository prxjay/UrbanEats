import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchFoodDetails } from "../../service/foodService";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";

const FoodDetails = () => {
  const { id } = useParams();
  const { increaseQty } = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({});

  useEffect(() => {
    const loadFoodDetails = async () => {
      try {
        const foodData = await fetchFoodDetails(id);
        setData(foodData);
      } catch (error) {
        toast.error("Error displaying the food details.");
      }
    };
    loadFoodDetails();
  }, [id]);

  const addToCart = () => {
    increaseQty(data.id);
    navigate("/cart");
  };
  return (
    <div className="food-details-page page-content">
      <section className="py-5" style={{ minHeight: "70vh" }}>
        <div className="container px-4 px-lg-5">
          <div className="row gx-4 gx-lg-5 align-items-center">
            <div className="col-md-6">
              <img
                className="card-img-top mb-5 mb-md-0 rounded shadow"
                src={data.imageUrl}
                alt={data.name}
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
            </div>
            <div className="col-md-6">
              <div className="fs-5 mb-2">
                <span className="chip" style={{ background: "var(--primary-light)", color: "var(--primary)", fontWeight: "700" }}>
                  Category: {data.category}
                </span>
              </div>
              <h1 className="display-5 fw-bold" style={{ color: "var(--secondary)" }}>{data.name}</h1>
              <div className="fs-4 mb-3" style={{ fontWeight: "800", color: "var(--text-primary)" }}>
                <span>₹{data.price}</span>
              </div>
              <p className="lead" style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: "1.6" }}>
                {data.description}
              </p>
              <div className="d-flex mt-4" style={{ gap: "12px" }}>
                <button
                  className="btn-swiggy btn-swiggy-primary"
                  type="button"
                  onClick={addToCart}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "18px", height: "18px" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  Add to cart
                </button>
                <button
                  className="btn-swiggy btn-swiggy-outline"
                  type="button"
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FoodDetails;
