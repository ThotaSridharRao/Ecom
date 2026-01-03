import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
    // Consolidated Product Data
    const productsData = [
        // Electronics
        { id: 9, name: "Noise Cancelling Headphones", price: "₹19,999", category: "Electronics", img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80", description: "Immerse yourself in music with industry-leading noise cancellation.", specs: ["30h Battery", "Bluetooth 5.0", "Over-ear"] },
        { id: 10, name: "4K Action Camera", price: "₹15,999", category: "Electronics", img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80", description: "Capture your adventures in stunning 4K resolution.", specs: ["4K 60fps", "Waterproof", "Touchscreen"] },
        { id: 11, name: "Bluetooth Speaker", price: "₹6,399", category: "Electronics", img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80", description: "Portable speaker with powerful bass and long battery life.", specs: ["12h Playtime", "Water Resistant", "Stereo Sound"] },
        { id: 12, name: "Drone with Camera", price: "₹39,999", category: "Electronics", img: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=600&q=80", description: "Professional grade drone for aerial photography.", specs: ["4K Camera", "5km Range", "30min Flight"] },
        { id: 33, name: "Tablet", price: "₹12,999", category: "Electronics", img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80", description: "Versatile tablet for work and play.", specs: ["10 inch Screen", "64GB Storage", "Android 12"] },
        { id: 34, name: "Power Bank", price: "₹1,999", category: "Electronics", img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80", description: "Fast charging power bank for your devices.", specs: ["20000mAh", "20W Fast Charge", "Dual Output"] },
        { id: 35, name: "Smart Bulb", price: "₹699", category: "Electronics", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80", description: "Control your lighting with voice or app.", specs: ["RGB Color", "WiFi Enabled", "Energy Efficient"] },
        { id: 36, name: "Router", price: "₹2,499", category: "Electronics", img: "https://images.unsplash.com/photo-1544197150-b99a580bbcbf?auto=format&fit=crop&w=600&q=80", description: "High speed dual-band router for seamless streaming.", specs: ["AC1200", "Dual Band", "4 Antennas"] },
        { id: 1, name: "Wireless Headphones", price: "₹15,999", category: "Electronics", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80", description: "Premium wireless sound.", specs: ["Noise Cancelling", "20h Battery"] },
        { id: 2, name: "Smart Watch", price: "₹23,999", category: "Electronics", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80", description: "Track your fitness and stay connected.", specs: ["Heart Rate Monitor", "GPS", "Water Resident"] },
        { id: 25, name: "Smart Speaker", price: "₹4,999", category: "Electronics", img: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=600&q=80", description: "Voice assistant for your smart home.", specs: ["Voice Control", "Good Bass"] },
        { id: 26, name: "Fitness Band", price: "₹2,499", category: "Electronics", img: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=80", description: "Basic fitness tracking on your wrist.", specs: ["Step Counter", "Sleep Tracking"] },
        { id: 27, name: "DSLR Camera", price: "₹45,999", category: "Electronics", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80", description: "Capture vivid moments.", specs: ["24MP", "Full HD Video"] },
        { id: 28, name: "Gaming Console", price: "₹29,999", category: "Electronics", img: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=600&q=80", description: "Next-gen gaming experience.", specs: ["1TB Storage", "4K Gaming"] },

        // Fashion
        { id: 13, name: "Classic Denim Jacket", price: "₹6,999", category: "Fashion", img: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=600&q=80", description: "Timeless denim jacket for casual wear.", specs: ["100% Cotton", "Blue Wash"] },
        { id: 14, name: "Summer Floral Dress", price: "₹4,799", category: "Fashion", img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80", description: "Light and breezy dress for summer days.", specs: ["Floral Pattern", "Midi Length"] },
        { id: 15, name: "Leather Boots", price: "₹11,999", category: "Fashion", img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80", description: "Durable and stylish leather boots.", specs: ["Genuine Leather", "Ankle height"] },
        { id: 16, name: "Aviator Sunglasses", price: "₹9,999", category: "Fashion", img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80", description: "Classic aviator style sunglasses.", specs: ["UV Protection", "Metal Frame"] },
        { id: 37, name: "Casual Sneakers", price: "₹2,499", category: "Fashion", img: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80", description: "Comfortable sneakers for everyday use.", specs: ["Breathable Mesh", "Rubber Sole"] },
        { id: 38, name: "Formal Shirt", price: "₹1,499", category: "Fashion", img: "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&w=600&q=80", description: "Crisp formal shirt for office wear.", specs: ["Slim Fit", "Cotton Blend"] },
        { id: 39, name: "Wrist Watch", price: "₹3,999", category: "Fashion", img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80", description: "Elegant wrist watch for any occasion.", specs: ["Leather Strap", "Quartz Movement"] },
        { id: 40, name: "Backpack", price: "₹1,999", category: "Fashion", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80", description: "Spacious backpack for travel or school.", specs: ["Laptop Compartment", "Water Resistant"] },
        { id: 3, name: "Running Shoes", price: "₹9,599", category: "Fashion", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", description: "High performance running shoes.", specs: ["Cushioned Sole", "Lightweight"] },
        { id: 4, name: "Designer Bag", price: "₹11,999", category: "Fashion", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80", description: "Luxury handbag.", specs: ["Leather", "Gold Hardware"] },
        { id: 7, name: "Sunglasses", price: "₹6,999", category: "Fashion", img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80", description: "Stylish shades.", specs: ["Polarized"] },

        // Home & Kitchen
        { id: 17, name: "Espresso Machine", price: "₹23,999", category: "Home & Kitchen", img: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80", description: "Barista quality coffee at home.", specs: ["15 Bar Pressure", "Milk Frother"] },
        { id: 18, name: "Stand Mixer", price: "₹15,999", category: "Home & Kitchen", img: "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?auto=format&fit=crop&w=600&q=80", description: "Perfect for baking and mixing.", specs: ["5L Bowl", "Multi-speed"] },
        { id: 19, name: "Ceramic Cookware Set", price: "₹11,999", category: "Home & Kitchen", img: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80", description: "Non-stick ceramic cookware.", specs: ["3 Pans", "2 Pots"] },
        { id: 20, name: "Air Fryer", price: "₹6,999", category: "Home & Kitchen", img: "https://images.unsplash.com/photo-1626162970420-111e4f246c08?auto=format&fit=crop&w=600&q=80", description: "Healthy frying with little to no oil.", specs: ["4L Capacity", "Digital Display"] },
        { id: 41, name: "Juicer", price: "₹2,999", category: "Home & Kitchen", img: "https://images.unsplash.com/photo-1570222094114-28a9d8896b74?auto=format&fit=crop&w=600&q=80", description: "Fresh juice in seconds.", specs: ["High Speed", "Easy Clean"] },
        { id: 42, name: "Toaster", price: "₹1,499", category: "Home & Kitchen", img: "https://images.unsplash.com/photo-1583241475880-0082631f54f0?auto=format&fit=crop&w=600&q=80", description: "Crispy toast every morning.", specs: ["2 Slice", "Browning Control"] },
        { id: 43, name: "Dinner Set", price: "₹3,499", category: "Home & Kitchen", img: "https://images.unsplash.com/photo-1603199830980-b8e5100737f3?auto=format&fit=crop&w=600&q=80", description: "Elegant dinnerware for your table.", specs: ["16 Pieces", "Ceramic"] },
        { id: 44, name: "Table Lamp", price: "₹999", category: "Home & Kitchen", img: "https://images.unsplash.com/photo-1507473888900-52e1adad5452?auto=format&fit=crop&w=600&q=80", description: "Warm lighting for your room.", specs: ["LED", "Modern Design"] },
        { id: 8, name: "Water Bottle", price: "₹1,999", category: "Home & Kitchen", img: "https://images.unsplash.com/photo-1602143407151-01114192003f?auto=format&fit=crop&w=600&q=80", description: "Insulated water bottle.", specs: ["Keeps Cold 24h", "Stainless Steel"] },

        // Beauty
        { id: 21, name: "Luxury Face Cream", price: "₹3,599", category: "Beauty", img: "https://images.unsplash.com/photo-1612817288484-92913477a8ae?auto=format&fit=crop&w=600&q=80", description: "Rejuvenating face cream.", specs: ["50ml", "Anti-aging"] },
        { id: 22, name: "Organic Shampoo", price: "₹1,999", category: "Beauty", img: "https://images.unsplash.com/photo-1585232351009-31336193e63d?auto=format&fit=crop&w=600&q=80", description: "Gentle organic shampoo.", specs: ["Sulfate Free", "300ml"] },
        { id: 23, name: "Matte Lipstick Set", price: "₹2,799", category: "Beauty", img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80", description: "Long lasting matte lipsticks.", specs: ["Set of 5", "Various Shades"] },
        { id: 24, name: "Perfume Collection", price: "₹6,799", category: "Beauty", img: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80", description: "Exquisite fragrance set.", specs: ["3 x 50ml", "Floral & Woody"] },
        { id: 45, name: "Hair Dryer", price: "₹1,299", category: "Beauty", img: "https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&w=600&q=80", description: "Fast drying hair dryer.", specs: ["2000W", "Ionic Technology"] },
        { id: 46, name: "Face Serum", price: "₹899", category: "Beauty", img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80", description: "Hydrating face serum.", specs: ["Vitamin C", "30ml"] },
        { id: 47, name: "Body Lotion", price: "₹499", category: "Beauty", img: "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&w=600&q=80", description: "Nourishing body lotion.", specs: ["Shea Butter", "200ml"] },
        { id: 48, name: "Makeup Kit", price: "₹2,499", category: "Beauty", img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80", description: "Complete makeup kit.", specs: ["Eyeshadow", "Blush", "Brushes"] },

        // Others (Gaming/Accesories map to Electronics mostly, or add new category if needed)
        { id: 5, name: "Gaming Mouse", price: "₹3,999", category: "Electronics", img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80", description: "Precision gaming mouse.", specs: ["RGB", "16000 DPI"] },
        { id: 6, name: "Mechanical Keyboard", price: "₹10,499", category: "Electronics", img: "https://images.unsplash.com/photo-1587829741301-dc798b91a603?auto=format&fit=crop&w=600&q=80", description: "Clicky mechanical keyboard.", specs: ["Cherry MX Blue", "RGB"] },
        { id: 29, name: "Wireless Mouse", price: "₹999", category: "Electronics", img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80", description: "Compact wireless mouse.", specs: ["Silent Click", "Long Battery"] },
        { id: 30, name: "USB-C Hub", price: "₹1,499", category: "Electronics", img: "https://images.unsplash.com/photo-1616410011236-7a42121dd981?auto=format&fit=crop&w=600&q=80", description: "Expand your connectivity.", specs: ["HDMI", "USB 3.0", "SD Card"] },
        { id: 31, name: "Laptop Stand", price: "₹1,299", category: "Electronics", img: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80", description: "Ergonomic laptop stand.", specs: ["Adjustable Height", "Aluminum"] },
        { id: 64, name: "Webcam", price: "₹2,999", category: "Electronics", img: "https://images.unsplash.com/photo-1587826574256-a2977326ee7d?auto=format&fit=crop&w=600&q=80", description: "HD Webcam for calls.", specs: ["1080p", "Built-in Mic"], stock: 50 },
    ];

    const [products, setProducts] = useState(() => {
        try {
            const saved = localStorage.getItem('allProducts');
            const parsed = saved ? JSON.parse(saved) : null;
            // Validate it's an array and has items, else fall back to default
            return (Array.isArray(parsed) && parsed.length > 0)
                ? parsed
                : productsData.map(p => ({ ...p, stock: p.stock || 50 }));
        } catch (e) {
            console.error("Failed to load products from storage:", e);
            return productsData.map(p => ({ ...p, stock: p.stock || 50 }));
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('allProducts', JSON.stringify(products));
        } catch (e) {
            console.error("Failed to save products:", e);
        }
    }, [products]);

    const getProductById = (id) => {
        return products.find(p => p.id === parseInt(id));
    };

    const getProductsByCategory = (category) => {
        return products.filter(p => p.category === category);
    };

    // For "Featured" or specific lists
    const getProductsByIds = (ids) => {
        return products.filter(p => ids.includes(p.id));
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
            .map(id => products.find(p => p.id === id))
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
            !recentlyViewedIds.includes(p.id)
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
