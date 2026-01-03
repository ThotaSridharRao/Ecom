import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const AddressContext = createContext(null);

export const AddressProvider = ({ children }) => {
    const [addresses, setAddresses] = useState([]);
    const { isLoggedIn } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (isLoggedIn) {
            fetchAddresses();
        } else {
            setAddresses([]);
        }
    }, [isLoggedIn]);

    const fetchAddresses = async () => {
        try {
            const { data } = await api.get('/addresses');
            setAddresses(data);
        } catch (error) {
            console.error("Failed to fetch addresses:", error);
        }
    };

    const addAddress = async (newAddress) => {
        try {
            // Optimistic might be tricky with unique ID from server, better wait
            const { data } = await api.post('/addresses', newAddress);

            // If new address is default, update local state to reflect that
            if (data.isDefault) {
                setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })).concat(data));
            } else {
                setAddresses(prev => [...prev, data]);
            }
            showToast('Address added successfully!', 'success');
        } catch (error) {
            console.error("Add address failed:", error);
            showToast('Failed to add address', 'error');
        }
    };

    const updateAddress = async (id, updatedData) => {
        try {
            // Optimistic
            setAddresses(prev => prev.map(addr => {
                const addrId = addr._id || addr.id;
                if (addrId == id) {
                    return { ...addr, ...updatedData };
                }
                if (updatedData.isDefault) {
                    return { ...addr, isDefault: false };
                }
                return addr;
            }));

            await api.put(`/addresses/${id}`, updatedData);
            showToast('Address updated!', 'success');
            // fetchAddresses(); // Ensure sync
        } catch (error) {
            console.error("Update address failed:", error);
            showToast('Failed to update address', 'error');
            fetchAddresses();
        }
    };

    const deleteAddress = async (id) => {
        try {
            setAddresses(prev => prev.filter(addr => (addr._id || addr.id) !== id));
            await api.delete(`/addresses/${id}`);
            showToast('Address deleted!', 'info');
        } catch (error) {
            console.error("Delete address failed:", error);
            fetchAddresses();
        }
    };

    const setDefaultAddress = async (id) => {
        await updateAddress(id, { isDefault: true });
    };

    return (
        <AddressContext.Provider value={{ addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress }}>
            {children}
        </AddressContext.Provider>
    );
};

export const useAddress = () => useContext(AddressContext);
