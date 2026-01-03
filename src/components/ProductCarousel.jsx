import React, { useRef, useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart } from 'react-icons/fa';
import './ProductCarousel.css';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

import { useCart } from '../context/CartContext';

const ProductCarousel = ({ title, products, viewAllLink }) => {
    const { isLoggedIn, openLoginModal } = useAuth();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToCart, cart, updateQuantity, removeFromCart } = useCart();

    const toggleWishlist = (item) => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        if (isInWishlist(item.id)) {
            removeFromWishlist(item.id, item.name);
        } else {
            addToWishlist(item);
        }
    };

    const handleAddToCart = (item) => {
        addToCart(item);
    };

    const scrollRef = useRef(null);
    const [showLeftBtn, setShowLeftBtn] = useState(false);
    const [showRightBtn, setShowRightBtn] = useState(true);

    const checkScrollButtons = () => {
        const { current } = scrollRef;
        if (current) {
            const { scrollLeft, scrollWidth, clientWidth } = current;
            // Use a threshold of 10px to avoid showing button due to minor snap offsets
            setShowLeftBtn(scrollLeft > 10);
            // Allow a small buffer for float calculation errors on the right side too
            setShowRightBtn(scrollLeft + clientWidth < scrollWidth - 2);
        }
    };

    useEffect(() => {
        const { current } = scrollRef;
        if (current) {
            checkScrollButtons(); // Initial check
            current.addEventListener('scroll', checkScrollButtons);
            // Also check on window resize as clientWidth changes
            window.addEventListener('resize', checkScrollButtons);
        }
        return () => {
            if (current) {
                current.removeEventListener('scroll', checkScrollButtons);
            }
            window.removeEventListener('resize', checkScrollButtons);
        };
    }, []);

    const scroll = (direction) => {
        const { current } = scrollRef;
        if (current) {
            const { clientWidth } = current;
            // Scroll by the full visible width (minus a small padding for context if desired, or full width)
            const scrollAmount = clientWidth;

            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="product-carousel-section mb-5 section-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-start fw-bold mb-0">{title}</h2>
                {viewAllLink && <Link to={viewAllLink} className="btn btn-outline-primary btn-sm">View All</Link>}
            </div>

            <div className="carousel-wrapper position-relative">
                {showLeftBtn && (
                    <Button
                        variant="light"
                        className="carousel-btn btn-left shadow-sm rounded-circle d-none d-md-flex"
                        onClick={() => scroll('left')}
                        aria-label="Scroll Left"
                    >
                        <FaChevronLeft />
                    </Button>
                )}

                <div className="d-flex overflow-auto pb-3 gap-3 product-scroll-container" ref={scrollRef}>
                    {products.map((item) => (
                        <div key={item.id} className="product-card-wrapper">
                            <Card className="h-100 product-card border-0">
                                <div className="mobile-discount-tag">20% OFF</div>
                                <div className="wishlist-icon" onClick={() => toggleWishlist(item)}>
                                    {isInWishlist(item.id) ? <FaHeart color="#dc3545" /> : <FaRegHeart color="#adb5bd" />}
                                </div>
                                <Link to={`/product/${item.id}`}>
                                    <div className="card-img-box rounded-top">
                                        <Card.Img variant="top" src={item.img} className="h-100 w-100 object-fit-cover" />
                                    </div>
                                </Link>
                                <Card.Body className="d-flex flex-column p-2">
                                    <Link to={`/product/${item.id}`} className="text-decoration-none text-dark">
                                        <Card.Title className="fs-6 mb-1 text-truncate-2">{item.name}</Card.Title>
                                    </Link>
                                    <div className="mt-auto d-flex justify-content-between align-items-center">
                                        <div className="d-flex flex-column">
                                            <span className="fw-bold small">{item.price}</span>
                                            <small className="text-decoration-line-through text-muted" style={{ fontSize: '0.7rem' }}>₹999</small>
                                        </div>
                                        {cart.find(cartItem => cartItem.id === item.id) ? (
                                            <div className="d-flex align-items-center bg-success text-white rounded overflow-hidden" style={{ height: '31px' }}>
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    className="px-2 py-0 border-0 rounded-0 h-100 d-flex align-items-center"
                                                    onClick={() => {
                                                        const cartItem = cart.find(c => c.id === item.id);
                                                        if (cartItem.qty > 1) {
                                                            updateQuantity(item.id, cartItem.qty - 1);
                                                        } else {
                                                            removeFromCart(item.id, item.name);
                                                        }
                                                    }}
                                                >
                                                    -
                                                </Button>
                                                <span className="px-2 small fw-bold">{cart.find(c => c.id === item.id).qty}</span>
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    className="px-2 py-0 border-0 rounded-0 h-100 d-flex align-items-center"
                                                    onClick={() => {
                                                        const cartItem = cart.find(c => c.id === item.id);
                                                        updateQuantity(item.id, cartItem.qty + 1);
                                                    }}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="px-3 py-0 fw-bold mobile-add-btn"
                                                onClick={() => handleAddToCart(item)}
                                            >
                                                ADD
                                            </Button>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    ))}
                </div>

                {showRightBtn && (
                    <Button
                        variant="light"
                        className="carousel-btn btn-right shadow-sm rounded-circle d-none d-md-flex"
                        onClick={() => scroll('right')}
                        aria-label="Scroll Right"
                    >
                        <FaChevronRight />
                    </Button>
                )}
            </div>
        </div >
    );
};

export default ProductCarousel;
