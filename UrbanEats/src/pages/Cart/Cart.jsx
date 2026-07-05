import React, { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./Cart.css";
import { Link, useNavigate } from "react-router-dom";
import { calculateCartTotals } from "../../util/cartUtils";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const Cart = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const {
    foodList,
    increaseQty,
    decreaseQty,
    quantities,
    removeFromCart,
    couponCode,
    setCouponCode,
    couponDiscount,
    setCouponDiscount,
    isFirstTime,
  } = useContext(StoreContext);

  const [typedCoupon, setTypedCoupon] = React.useState("");

  const cartItems = foodList.filter((food) => quantities[food.id] > 0);
  const { subtotal, shipping, tax, total } = calculateCartTotals(cartItems, quantities);

  const handleApplyCoupon = () => {
    // 1. Check if user is signed in
    if (!currentUser) {
      toast.error("Please sign in to apply coupons.");
      navigate("/login");
      return;
    }
    // 2. Validate the coupon code
    const code = typedCoupon.trim().toUpperCase();
    if (code !== "FIRST40") {
      toast.error("Invalid coupon code. Try FIRST40.");
      return;
    }
    // 3. Check if first-time user
    if (!isFirstTime) {
      toast.error("FIRST40 is only valid for first-time customers. You're not eligible.");
      return;
    }
    // 4. Apply
    setCouponCode("FIRST40");
    setCouponDiscount(40);
    toast.success("Coupon FIRST40 applied! You get 40% OFF.");
  };

  const discountAmount = subtotal * (couponDiscount / 100);
  const finalPayTotal = total - discountAmount;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page page-content">
        <div className="cart-empty">
          <div className="cart-empty-icon" style={{ color: "var(--gray-300)", marginBottom: "20px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: "80px", height: "80px", margin: "0 auto" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <h3>Your cart is empty!</h3>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="cart-continue-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Browse Food
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page-content">
      <h1 className="cart-page-title">Your Cart</h1>

      <div className="cart-layout">
        {/* Items Panel */}
        <div className="cart-items-panel">
          <div className="cart-items-header">
            <span>Item</span>
            <span>Price</span>
            <span>Quantity</span>
            <span style={{ textAlign: "right" }}>Total</span>
          </div>

          {cartItems.map((food) => (
            <div key={food.id} className="cart-item-row" style={food.isSoldOut ? { opacity: 0.6 } : {}}>
              {/* Info */}
              <div className="cart-item-info">
                <img src={food.imageUrl} alt={food.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <p className="cart-item-name">{food.name}</p>
                  <p className="cart-item-category">{food.category}</p>
                  {food.isSoldOut && <p style={{ color: "var(--danger)", fontSize: "12px", fontWeight: "700", margin: "2px 0" }}>Currently Sold Out</p>}
                  <button className="cart-item-remove" onClick={() => removeFromCart(food.id)}>
                    Remove
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="cart-item-price">₹{food.price}</div>

              {/* Qty */}
              <div className="cart-qty">
                <button className="cart-qty-btn" onClick={() => decreaseQty(food.id)}>−</button>
                <span className="cart-qty-count">{quantities[food.id]}</span>
                <button className="cart-qty-btn" onClick={() => !food.isSoldOut && increaseQty(food.id)} disabled={food.isSoldOut}>+</button>
              </div>

              {/* Total */}
              <div className="cart-item-total">₹{(food.price * quantities[food.id]).toFixed(0)}</div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="cart-summary-panel">
          <div className="cart-summary-header">Order Summary</div>
          <div className="cart-summary-body">
            <div className="cart-summary-row">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            {/* Coupon Box */}
            <div className="coupon-box">
              <label className="coupon-label">Apply Coupon</label>
              <div className="coupon-input-row">
                <input
                  type="text"
                  className="coupon-input"
                  placeholder="Enter Code"
                  value={typedCoupon}
                  onChange={(e) => setTypedCoupon(e.target.value.toUpperCase())}
                  disabled={couponDiscount > 0}
                  onKeyDown={(e) => e.key === "Enter" && !couponDiscount && handleApplyCoupon()}
                />
                {couponDiscount > 0 ? (
                  <button
                    className="coupon-btn coupon-btn-remove"
                    onClick={() => {
                      setCouponCode("");
                      setCouponDiscount(0);
                      setTypedCoupon("");
                      toast.info("Coupon removed.");
                    }}
                  >
                    Remove
                  </button>
                ) : (
                  <button className="coupon-btn coupon-btn-apply" onClick={handleApplyCoupon}>
                    Apply
                  </button>
                )}
              </div>
              {couponDiscount > 0 && (
                <div className="coupon-success-msg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
                  Coupon <strong>{couponCode}</strong> applied — 40% OFF!
                </div>
              )}
              <div className="coupon-hint">
                Use <strong>"FIRST40"</strong> for your first order
              </div>
            </div>

            <div className="cart-summary-row">
              <span>Delivery Fee</span>
              <span>
                {subtotal >= 199 ? (
                  <>
                    <span style={{ textDecoration: "line-through", color: "var(--text-muted)", marginRight: "6px" }}>₹30.00</span>
                    <span style={{ color: "var(--accent)", fontWeight: "700" }}>FREE</span>
                  </>
                ) : (
                  subtotal === 0 ? "₹0.00" : "₹30.00"
                )}
              </span>
            </div>
            <div className="cart-summary-row">
              <span>Taxes & Charges</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="cart-summary-row" style={{ color: "var(--primary)", fontWeight: "700" }}>
                <span>Coupon Discount ({couponDiscount}%)</span>
                <span>−₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="cart-summary-total">
              <span>To Pay</span>
              <span>₹{subtotal === 0 ? "0.00" : finalPayTotal.toFixed(2)}</span>
            </div>

            <button
              className="cart-checkout-btn"
              id="cart-checkout-btn"
              disabled={cartItems.length === 0 || cartItems.some(i => i.isSoldOut)}
              onClick={() => navigate("/order")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              Proceed to Checkout
            </button>

            <div className="cart-savings">
              You're saving ₹{((subtotal * 0.2) + discountAmount).toFixed(0)} on this order!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
