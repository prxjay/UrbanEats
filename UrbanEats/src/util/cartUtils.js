export const calculateCartTotals = (cartItems, quantities) => {
    const subtotal = cartItems.reduce(
        (acc, food) => acc + food.price * quantities[food.id],
        0
    );
    
    const getDiscountPercentage = (item) => {
        if (item.offer) {
            return item.offer !== "None" ? parseInt(item.offer) : 0;
        }
        if (item.price >= 250) return 20;
        if (item.price >= 150) return 15;
        return 10;
    };

    const tax = cartItems.reduce((acc, food) => {
        const qty = quantities[food.id] || 0;
        const discountPercent = getDiscountPercentage(food);
        const taxRate = discountPercent / 2;
        return acc + (food.price * qty) * (taxRate / 100);
    }, 0);

    // Delivery fee standard ₹30, free for subtotal >= 199
    const shipping = subtotal >= 199 ? 0.0 : (subtotal === 0 ? 0.0 : 30.0);
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
};