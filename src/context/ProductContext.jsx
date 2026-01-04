import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
    // Consolidated Product Data
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/products');
            // Backend returns _id, frontend expects id. Map it.
            const formattedProducts = data.map(p => ({ ...p, id: p._id }));
            setProducts(formattedProducts);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            // Fallback or empty state could be handled here
        } finally {
            setLoading(false);
        }
    };

    const getProductById = (id) => {
        return products.find(p => p._id === id || p.id === id);
    };

    const getProductsByCategory = (category) => {
        return products.filter(p => p.category === category);
    };

    // For "Featured" or specific lists
    const getProductsByIds = (ids) => {
        return products.filter(p => ids.includes(p._id) || ids.includes(p.id));
    };

    // Recently Viewed Logic
    const [recentlyViewedIds, setRecentlyViewedIds] = useState(() => {
        const saved = localStorage.getItem('recentlyViewed');
        return saved ? JSON.parse(saved) : [];
    });

    const addToRecentlyViewed = (id) => {
        setRecentlyViewedIds(prev => {
            const newIds = [id, ...prev.filter(pid => pid !== id)].slice(0, 10); // Keep last 10 unique
            localStorage.setItem('recentlyViewed', JSON.stringify(newIds));
            return newIds;
        });
    };

    // Calculate Suggested Products based on history
    const getSuggestedProducts = () => {
        if (recentlyViewedIds.length === 0) return [];

        // 1. Get full product objects from history
        const viewedProducts = recentlyViewedIds
            .map(id => products.find(p => p._id === id || p.id === id))
            .filter(Boolean); // Filter out any undefined (e.g. if product removed)

        // 2. Count category frequency
        const categoryCounts = viewedProducts.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + 1;
            return acc;
        }, {});

        // 3. Find top categories (sorted by count)
        const topCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);

        if (topCategories.length === 0) return [];

        // 4. Find products in those categories that are NOT in history
        const suggestions = products.filter(p =>
            topCategories.includes(p.category) &&
            !recentlyViewedIds.includes(p._id) && !recentlyViewedIds.includes(p.id)
        );

        // 5. Sort suggestions: Prioritize most popular category, then randomize remainder for variety
        // For simplicity, we just shuffle them or return first 8 matches
        return suggestions.slice(0, 8);
    };

    const addProduct = (newProduct) => {
        setProducts(prev => [newProduct, ...prev]);
    };

    const updateProductStock = async (productId, quantityPurchased) => {
        // Optimistic update
        setProducts(prev => prev.map(p => {
            if (p.id == productId || p._id == productId) {
                const newStock = Math.max(0, (p.stock || 0) - quantityPurchased);
                return { ...p, stock: newStock };
            }
            return p;
        }));

        // Note: Real backend handles stock update via Orders, but if we need manual update:
        // await api.put(`/products/${productId}`, { stock: ... })
    };

    const updateProduct = async (updatedProduct) => {
        try {
            const id = updatedProduct._id || updatedProduct.id;
            const { data } = await api.put(`/products/${id}`, updatedProduct);
            setProducts(prev => prev.map(p => p._id === id || p.id === id ? data : p));
            return { success: true };
        } catch (error) {
            console.error("Update product failed:", error);
            return { success: false, message: error.response?.data?.message || "Failed to update product" };
        }
    };

    const updateProductsBulk = (updatedProducts) => {
        // Logic for bulk updates needs backend support, for now we can iterate or skip
        // This is often used for stock updates after order, which we handle in OrderContext now
    };

    return (
        <ProductContext.Provider value={{
            products,
            loading,
            getProductById,
            getProductsByCategory,
            getProductsByIds,
            recentlyViewedIds,
            addToRecentlyViewed,
            getSuggestedProducts,
            addProduct,
            updateProductStock,
            updateProduct,
            updateProductsBulk
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = () => useContext(ProductContext);
