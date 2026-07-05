import { createContext, useEffect, useState } from "react";
import { fetchFoodList } from "../service/foodService";
import axios from "axios";
import { toast } from "react-toastify";
import {
  addToCart,
  getCartData,
  removeQtyFromCart,
} from "../service/cartService";
import { supabase } from "../supabaseClient";

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
  const [foodList, setFoodList] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [token, setToken] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Chennai");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    const checkFirstTime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsFirstTime(false);
        return;
      }
      try {
        const { count, error } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
          
        if (error) throw error;
        setIsFirstTime(count === 0);
      } catch (err) {
        console.error("Error checking user order count:", err);
        setIsFirstTime(false);
      }
    };

    if (token) {
      checkFirstTime();
    } else {
      setIsFirstTime(false);
      setCouponCode("");
      setCouponDiscount(0);
    }
  }, [token]);

  const increaseQty = async (foodId) => {
    const currentQty = quantities[foodId] || 0;
    if (currentQty >= 10) {
      toast.warning("Maximum quantity (10) allowed per item.");
      return;
    }
    setQuantities((prev) => ({ ...prev, [foodId]: currentQty + 1 }));
    await addToCart(foodId, token);
  };

  const decreaseQty = async (foodId) => {
    setQuantities((prev) => ({
      ...prev,
      [foodId]: prev[foodId] > 0 ? prev[foodId] - 1 : 0,
    }));
    await removeQtyFromCart(foodId, token);
  };

  const removeFromCart = (foodId) => {
    setQuantities((prevQuantities) => {
      const updatedQuantitites = { ...prevQuantities };
      delete updatedQuantitites[foodId];
      return updatedQuantitites;
    });
  };

  const loadCartData = async (token) => {
    try {
      const items = await getCartData(token);
      setQuantities(items || {});
    } catch (error) {
      console.error('Error loading cart data:', error);
      setQuantities({});
    }
  };

  const contextValue = {
    foodList,
    increaseQty,
    decreaseQty,
    quantities: quantities || {},
    removeFromCart,
    token,
    setToken,
    setQuantities,
    loadCartData,
    selectedLocation,
    setSelectedLocation,
    couponCode,
    setCouponCode,
    couponDiscount,
    setCouponDiscount,
    isFirstTime,
    setIsFirstTime,
  };

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchFoodList();
        setFoodList(data || []);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setFoodList([]);
      }
    }
    loadData();

    // Sync token and load cart data whenever auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const accessToken = session.access_token;
          setToken(accessToken);
          localStorage.setItem("token", accessToken);
          await loadCartData(accessToken);

          // If the user just signed in via Google (flag set before redirect)
          if (localStorage.getItem("oauthFlow") === "true") {
            const user = session.user;
            const rawName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "there";
            let firstName = rawName.split(" ")[0].split(".")[0].split("_")[0];
            firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
            
            // Delay toast slightly to ensure ToastContainer has mounted after page reload
            setTimeout(() => {
              toast.success(`Welcome back, ${firstName}!`);
            }, 500);
            
            // Clean hash to remove trailing # left by Supabase
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
            localStorage.removeItem("oauthFlow");
          }
        } else {
          setToken("");
          localStorage.removeItem("token");
          setQuantities({});
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
