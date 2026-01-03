import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const { showToast } = useToast();
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        if (isLoggedIn) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [isLoggedIn]);

    const fetchWishlist = async () => {
        try {
            const { data } = await api.get('/wishlist');
            // Backend returns { user, products: [productObj, ...] }
            setWishlist(data.products || []);
        } catch (error) {
            console.error("Failed to fetch wishlist:", error);
        }
    };

    const addToWishlist = async (product) => {
        const id = product._id || product.id;
        const exists = wishlist.find(item => item.id === id || item._id === id);

        if (!exists) {
            // Optimistic Update
            setWishlist(prev => [...prev, product]);
            showToast('Item added to wishlist!', 'success');

            try {
                await api.post('/wishlist', { productId: id });
                // fetchWishlist(); // Optional
            } catch (error) {
                console.error("Add to wishlist failed:", error);
                showToast('Failed to add to wishlist', 'error');
                fetchWishlist(); // Revert
            }

        } else {
            showToast('Item is already in wishlist', 'info');
        }
    };

    const removeFromWishlist = async (productId, productName) => {
        // Optimistic Update
        setWishlist((prev) => prev.filter(item => item.id !== productId && item._id !== productId));
        if (productName) {
            showToast('Item removed from wishlist', 'info');
        }

        try {
            await api.delete(`/wishlist/${productId}`);
        } catch (error) {
            console.error("Remove from wishlist failed:", error);
            fetchWishlist(); // Revert
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item.id === productId || item._id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
