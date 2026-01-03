import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useCart } from './CartContext';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const { isLoggedIn } = useAuth();
    const { showToast } = useToast();
    const { clearCart } = useCart();

    useEffect(() => {
        if (isLoggedIn) {
            fetchOrders();
        } else {
            setOrders([]);
        }
    }, [isLoggedIn]);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/myorders');
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    };

    const addOrder = async (orderData) => {
        try {
            // Transform frontend order data to match backend expectation if needed
            // Backend expects: items: [{product: id, qty: n}], address: {...}, payment: {...}

            const payload = {
                items: orderData.items.map(item => ({
                    product: item.id || item._id, // Ensure we send the product ID
                    qty: item.qty
                })),
                address: orderData.address,
                payment: orderData.payment,
                bill: orderData.bill
                // Backend handles status, timeline, date
            };

            const { data } = await api.post('/orders', payload);

            setOrders(prev => [data, ...prev]);
            showToast('Order placed successfully!', 'success');

            // Clear cart after successful order
            clearCart();

            return { success: true, orderId: data.id || data._id };

        } catch (error) {
            console.error("Place order failed:", error);
            showToast('Failed to place order', 'error');
            return { success: false, message: error.response?.data?.message || 'Order failed' };
        }
    };

    const getAllOrders = () => orders;

    return (
        <OrderContext.Provider value={{ orders, addOrder, getAllOrders }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = () => useContext(OrderContext);
