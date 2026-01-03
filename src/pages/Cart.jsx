import React from 'react';
import { Container, Button } from 'react-bootstrap';
import './Cart.css';

import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { isLoggedIn, openLoginModal } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <Container className="mt-5 text-center py-5">
                <div className="mb-4">
                    <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" alt="Empty Cart" style={{ width: '150px', opacity: 0.5 }} />
                </div>
                <h3>Your cart is empty</h3>
                <p className="text-muted mb-4">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/">
                    <Button variant="primary" size="lg" className="px-5 rounded-pill">Start Shopping</Button>
                </Link>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4 fw-bold">Shopping Cart ({cart.length} items)</h2>
            <div className="row">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-0">
                            {cart.map(item => (
                                <div key={item.id} className="d-flex align-items-center border-bottom p-3">
                                    <img src={item.img || item.image} alt={item.name} className="rounded object-fit-cover" style={{ width: '80px', height: '80px' }} />
                                    <div className="ms-3 flex-grow-1">
                                        <h6 className="mb-1 fw-bold">{item.name}</h6>
                                        <p className="text-muted small mb-0">{item.category}</p>
                                        <div className="d-flex align-items-center mt-2 d-md-none">
                                            <span className="fw-bold text-primary me-3">{item.price}</span>
                                        </div>
                                    </div>
                                    <div className="d-none d-md-block me-4">
                                        <span className="fw-bold fs-5">{item.price}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="input-group input-group-sm" style={{ width: '100px' }}>
                                            <button
                                                className="btn btn-outline-secondary"
                                                onClick={() => {
                                                    if (item.qty > 1) updateQuantity(item.id, item.qty - 1);
                                                    else removeFromCart(item.id, item.name);
                                                }}
                                            >-</button>
                                            <span className="form-control text-center bg-white">{item.qty}</span>
                                            <button
                                                className="btn btn-outline-secondary"
                                                onClick={() => updateQuantity(item.id, item.qty + 1)}
                                            >+</button>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-link text-danger ms-3"
                                        onClick={() => removeFromCart(item.id, item.name)}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="d-flex justify-content-between">
                        <Link to="/" className="btn btn-outline-secondary">
                            <FaArrowLeft className="me-2" /> Continue Shopping
                        </Link>
                        <Button variant="outline-danger" onClick={clearCart}>Clear Cart</Button>
                    </div>
                </div>
                <div className="col-lg-4 mt-4 mt-lg-0">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <h5 className="card-title fw-bold mb-4">Order Summary</h5>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Subtotal</span>
                                <span>₹{getCartTotal().toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Shipping</span>
                                <span className="text-success">Free</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Tax</span>
                                <span>₹0</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4">
                                <span className="fw-bold fs-5">Total</span>
                                <span className="fw-bold fs-5 text-primary">₹{getCartTotal().toLocaleString()}</span>
                            </div>
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-100 rounded-pill"
                                onClick={() => {
                                    if (isLoggedIn) {
                                        navigate('/checkout');
                                    } else {
                                        showToast('Please login to proceed to checkout', 'info');
                                        openLoginModal();
                                    }
                                }}
                            >
                                Proceed to Checkout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default Cart;
