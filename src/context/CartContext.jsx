import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const { showToast } = useToast();
    const { isLoggedIn } = useAuth();

    // Fetch cart from backend on login
    useEffect(() => {
        if (isLoggedIn) {
            fetchCart();
        } else {
            setCart([]); // Clear cart on logout
        }
    }, [isLoggedIn]);

    const fetchCart = async () => {
        try {
            const { data } = await api.get('/cart');
            // Backend returns { items: [{ product: {...}, qty: 1 }] }
            // Frontend expects flat array: [{ ...product, qty: 1 }]
            const formattedCart = data.items.map(item => ({
                ...item.product,
                qty: item.qty,
                // Ensure ID is consistent
                id: item.product._id || item.product.id
            }));
            setCart(formattedCart);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        }
    };

    const addToCart = async (product) => {
        try {
            // Optimistic Update
            // Check if item exists
            const existingItem = cart.find(item => item.id === product.id || item._id === product.id);
            if (existingItem) {
                setCart(prev => prev.map(item =>
                    (item.id === product.id || item._id === product.id)
                        ? { ...item, qty: item.qty + 1 }
                        : item
                ));
            } else {
                setCart(prev => [...prev, { ...product, qty: 1 }]);
            }

            showToast('Item added to cart!', 'success');

            // API Call
            await api.post('/cart', {
                productId: product._id || product.id,
                qty: 1
            });

            // Re-fetch to ensure sync (optional but safer)
            // fetchCart(); 

        } catch (error) {
            console.error("Add to cart error:", error);
            showToast('Failed to add to cart', 'error');
            fetchCart(); // Revert on error
        }
    };

    const removeFromCart = async (productId, productName) => {
        try {
            setCart(prev => prev.filter(item => item.id !== productId && item._id !== productId));
            if (productName) {
                showToast('Item removed from cart', 'info');
            }

            await api.delete(`/cart/${productId}`);
        } catch (error) {
            console.error("Remove from cart error:", error);
            fetchCart();
        }
    };

    const updateQuantity = async (productId, newQty) => {
        if (newQty < 1) return;

        try {
            setCart(prev => prev.map(item =>
                (item.id === productId || item._id === productId) ? { ...item, qty: newQty } : item
            ));

            await api.put(`/cart/${productId}`, { qty: newQty });
        } catch (error) {
            console.error("Update quantity error:", error);
            fetchCart();
        }
    };

    const clearCart = async () => {
        try {
            setCart([]);
            await api.delete('/cart');
        } catch (error) {
            console.error("Clear cart error:", error);
        }
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            // Price might be number or string "₹19,999"
            let price = item.price;
            if (typeof price === 'string') {
                price = parseFloat(price.replace(/[^0-9.]/g, ''));
            }
            return total + (price * item.qty);
        }, 0);
    };

    const getCartCount = () => {
        return cart.length;
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
