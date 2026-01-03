import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FaCheckCircle, FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';

const ToastContext = createContext(null);

const ToastItem = ({ toast, onClose }) => {
    const touchStartY = useRef(null);

    const onTouchStart = (e) => {
        touchStartY.current = e.targetTouches[0].clientY;
    };

    const onTouchEnd = (e) => {
        if (touchStartY.current === null) return;
        const touchEndY = e.changedTouches[0].clientY;
        const distance = touchEndY - touchStartY.current;

        // Swipe down (positive distance) to dismiss
        // Threshold of 30px
        if (distance > 30) {
            onClose();
        }
        touchStartY.current = null;
    };

    return (
        <Toast
            onClose={onClose}
            show={true}
            delay={5000}
            autohide
            className={`custom-toast toast-${toast.type} mb-3`}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            <Toast.Body className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    {toast.type === 'success' && <FaCheckCircle className="text-success me-3 fs-5" />}
                    {toast.type === 'info' && <FaInfoCircle className="text-primary me-3 fs-5" />}
                    {toast.type === 'error' && <FaExclamationCircle className="text-danger me-3 fs-5" />}
                    <span>{toast.message}</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering other touch events
                        onClose();
                    }}
                    className="btn-close ms-3"
                    aria-label="Close"
                    style={{ fontSize: '0.8rem', cursor: 'pointer', zIndex: 10 }}
                ></button>
            </Toast.Body>
        </Toast>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        // Replace existing toasts with the new one to prevent stacking
        setToasts([{ id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer className="p-3 position-fixed" position="bottom-center" style={{ zIndex: 9999, bottom: '20px' }}>
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </ToastContainer>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
