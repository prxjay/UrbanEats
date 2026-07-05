import React, { useContext, useState, useEffect } from "react";
import "./PlaceOrder.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { calculateCartTotals } from "../../util/cartUtils";
import { toast } from "react-toastify";
import { RAZORPAY_KEY } from "../../util/contants";
import { useNavigate, Link } from "react-router-dom";
import {
  createOrder,
  deleteOrder,
  verifyPayment,
} from "../../service/orderService";
import { clearCartItems } from "../../service/cartService";
import Swal from 'sweetalert2';
const PlaceOrder = () => {
  const {
    foodList,
    quantities,
    setQuantities,
    token,
    selectedLocation,
    couponCode,
    couponDiscount,
    setCouponCode,
    setCouponDiscount
  } = useContext(StoreContext);
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [data, setData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    state: "Tamil Nadu",
    city: selectedLocation || "",
    zip: "",
    landmark: "",
  });

  useEffect(() => {
    if (selectedLocation) {
      setData((prev) => ({ ...prev, city: selectedLocation }));
    }
  }, [selectedLocation]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'email', 'phoneNumber', 'address', 'city', 'zip'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (!data.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (data.phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const cartItems = foodList.filter(food => quantities[food.id] > 0);
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const { subtotal, shipping, tax, total } = calculateCartTotals(cartItems, quantities);
    const discountAmount = subtotal * (couponDiscount / 100);
    const finalPayTotal = total - discountAmount;

    const orderData = {
      userAddress: `${data.name}, ${data.address}, ${data.city}, ${data.state}, ${data.zip}`,
      phoneNumber: data.phoneNumber.toString(),
      email: data.email,
      orderedItems: cartItems.map((item) => {
        const quantity = quantities[item.id] || 0;
        const price = item.price || 0;
        return {
          foodId: item.id.toString(),
          quantity: Number(quantity),
          price: Number((price * quantity).toFixed(2)),
          category: item.category || '',
          imageUrl: item.imageUrl || '',
          description: item.description || '',
          name: item.name || ''
        };
      }),
      amount: Number(finalPayTotal.toFixed(2)),
      couponApplied: couponCode || 'None',
      couponDiscountPercent: Number(couponDiscount || 0),
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'unpaid'
    };

    try {
      const response = await createOrder(orderData, token);
      if (response.id) {
        if (paymentMethod === 'cod') {
          await Swal.fire({
            title: 'Order Placed Successfully!',
            text: 'Your order has been placed and is being prepared.',
            icon: 'success',
            confirmButtonText: 'View Orders',
            showCancelButton: true,
            cancelButtonText: 'Continue Shopping',
            confirmButtonColor: '#fc8019',
            cancelButtonColor: '#64748b',
            background: '#ffffff',
            color: '#1e293b'
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/myorders');
            } else {
              navigate('/');
            }
          });
          await clearCartItems(token);
          setQuantities({});
          setCouponCode("");
          setCouponDiscount(0);
        }
      } else {
        toast.error('Unable to place order. Please try again.');
      }
    } catch (error) {
      toast.error(error.message || 'Unable to place order. Please try again.');
      console.error('Order error:', error);
    }
  };

  const initiateRazorpayPayment = (order) => {
    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount, //Convert to paise
      currency: "INR",
      name: "Food Land",
      description: "Food order payment",
      order_id: order.razorpayOrderId,
      handler: verifyPaymentHandler,
      prefill: {
        name: `${data.name}`,
        email: data.email,
        contact: data.phoneNumber,
      },
      theme: { color: "#3399cc" },
      modal: {
        ondismiss: deleteOrderHandler,
      },
    };
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const verifyPaymentHandler = async (razorpayResponse) => {
    const paymentData = {
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_signature: razorpayResponse.razorpay_signature,
    };
    try {
      const success = await verifyPayment(paymentData, token);
      if (success) {
        toast.success("Payment successful.");
        await clearCartItems(token);
        setCouponCode("");
        setCouponDiscount(0);
        navigate("/myorders");
      } else {
        toast.error("Payment failed. Please try again.");
        navigate("/");
      }
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    }
  };

  const deleteOrderHandler = async (orderId) => {
    try {
      await deleteOrder(orderId, token);
    } catch (error) {
      toast.error("Something went wrong. Contact support.");
    }
  };

  return (
    <div className="place-order-page page-content">
      <h1>Checkout</h1>
      
      <div className="place-order-layout">
        {/* Left Side Form */}
        <div className="checkout-form-card">
          <form onSubmit={onSubmitHandler}>
            <h3 className="checkout-section-title">Delivery Information</h3>
            
            <div className="mb-3">
              <label htmlFor="name" className="form-label-swiggy">Full Name</label>
              <input
                type="text"
                className="form-swiggy"
                id="name"
                name="name"
                value={data.name}
                onChange={onChangeHandler}
                placeholder="e.g. John Doe"
                maxLength={20}
                required
              />
            </div>
            
            <div className="form-grid-2">
              <div className="mb-3">
                <label htmlFor="email" className="form-label-swiggy">Email Address</label>
                <input
                  type="email"
                  className="form-swiggy"
                  id="email"
                  name="email"
                  value={data.email}
                  onChange={onChangeHandler}
                  placeholder="e.g. john@example.com"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label-swiggy">Phone Number</label>
                <div style={{ position: "relative" }}>
                  <span className="contact-phone-prefix" style={{ left: "14px", fontWeight: "700" }}>+91</span>
                  <input
                    type="tel"
                    className="form-swiggy"
                    style={{ paddingLeft: "46px" }}
                    id="phoneNumber"
                    name="phoneNumber"
                    value={data.phoneNumber}
                    onChange={onChangeHandler}
                    placeholder="Phone number"
                    maxLength={15}
                    pattern="[0-9]{7,15}"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="form-label-swiggy">Delivery Address</label>
              <textarea
                className="form-swiggy"
                style={{ resize: "none" }}
                rows={3}
                id="address"
                name="address"
                value={data.address}
                onChange={onChangeHandler}
                placeholder="Flat / House No., Street, Area"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="landmark" className="form-label-swiggy">Nearest Landmark (Optional)</label>
              <input
                type="text"
                className="form-swiggy"
                id="landmark"
                name="landmark"
                value={data.landmark}
                onChange={onChangeHandler}
                placeholder="e.g. Behind Central Mall"
              />
            </div>

            <div className="form-grid-2">
              <div className="mb-3">
                <label htmlFor="city" className="form-label-swiggy">City</label>
                <select
                  className="form-swiggy"
                  style={{
                    appearance: "none",
                    paddingRight: "36px",
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2393959f' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center"
                  }}
                  id="city"
                  name="city"
                  value={data.city}
                  onChange={onChangeHandler}
                  required
                >
                  <option value="">Select City</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Erode">Erode</option>
                  <option value="Salem">Salem</option>
                  <option value="Trichy">Trichy</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="zip" className="form-label-swiggy">ZIP Code</label>
                <input
                  type="text"
                  className="form-swiggy"
                  id="zip"
                  name="zip"
                  value={data.zip}
                  onChange={onChangeHandler}
                  placeholder="600001"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="state" className="form-label-swiggy">State</label>
              <input
                type="text"
                className="form-swiggy"
                id="state"
                name="state"
                value={data.state}
                readOnly
                required
              />
            </div>

            <h3 className="checkout-section-title">Payment Method</h3>
            <div className="payment-method-options">
              <div className="payment-radio-card" onClick={() => setPaymentMethod('cod')}>
                <input
                  type="radio"
                  name="paymentMethod"
                  id="cod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <label htmlFor="cod">Cash on Delivery (COD)</label>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-swiggy btn-swiggy-primary w-100"
              style={{ padding: "16px", fontSize: "15px", borderRadius: "8px" }}
            >
              Confirm and Place Order
            </button>
          </form>
        </div>

        {/* Right Side Order Summary */}
        <div className="checkout-summary-card">
          <h3 className="checkout-section-title" style={{ border: "none", marginBottom: "14px" }}>Order Summary</h3>
          
          <div className="checkout-items-list">
            {foodList.filter(food => quantities[food.id] > 0).map((food) => (
              <div key={food.id} className="checkout-item-row">
                <span style={{ color: "var(--text-secondary)" }}>
                  {food.name} <strong style={{ color: "var(--text-primary)" }}>x{quantities[food.id]}</strong>
                </span>
                <span>₹{(food.price * quantities[food.id]).toFixed(0)}</span>
              </div>
            ))}
          </div>

          <div className="divider" style={{ margin: "16px 0" }} />

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>₹{calculateCartTotals(foodList.filter(food => quantities[food.id] > 0), quantities).subtotal.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Delivery Fee</span>
            <span>
              {calculateCartTotals(foodList.filter(food => quantities[food.id] > 0), quantities).subtotal >= 199 ? (
                <>
                  <span style={{ textDecoration: "line-through", color: "var(--text-muted)", marginRight: "6px" }}>₹30.00</span>
                  <span style={{ color: "var(--accent)", fontWeight: "700" }}>FREE</span>
                </>
              ) : (
                `₹${calculateCartTotals(foodList.filter(food => quantities[food.id] > 0), quantities).shipping.toFixed(2)}`
              )}
            </span>
          </div>
          <div className="cart-summary-row">
            <span>Taxes & Charges</span>
            <span>₹{calculateCartTotals(foodList.filter(food => quantities[food.id] > 0), quantities).tax.toFixed(2)}</span>
          </div>

          {couponDiscount > 0 && (
            <div className="cart-summary-row" style={{ color: "var(--accent)" }}>
              <span>Coupon Discount ({couponDiscount}%)</span>
              <span>-₹{(calculateCartTotals(foodList.filter(food => quantities[food.id] > 0), quantities).subtotal * (couponDiscount / 100)).toFixed(2)}</span>
            </div>
          )}

          <div className="cart-summary-total">
            <span>Total amount</span>
            <span style={{ color: "var(--primary)" }}>
              ₹{(
                calculateCartTotals(foodList.filter(food => quantities[food.id] > 0), quantities).total -
                (calculateCartTotals(foodList.filter(food => quantities[food.id] > 0), quantities).subtotal * (couponDiscount / 100))
              ).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "32px" }}>
        <Link to="/cart" className="btn-swiggy btn-swiggy-outline">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "16px", height: "16px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Cart
        </Link>
      </div>
    </div>
  );
};

export default PlaceOrder;

