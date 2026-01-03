import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Badge, ListGroup } from 'react-bootstrap';
import { FaStar, FaShoppingCart, FaHeart, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import Loader from '../components/Loader';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getProductById, addToRecentlyViewed, loading } = useProduct();
    const { addToCart, cart, updateQuantity, removeFromCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { isLoggedIn, openLoginModal } = useAuth();
    const { showToast } = useToast();

    const product = getProductById(id);

    if (loading) {
        return <Loader />;
    }

    // Track Recently Viewed
    React.useEffect(() => {
        if (product) {
            addToRecentlyViewed(product.id);
        }
    }, [product, id]);

    // If product not found
    if (!product) {
        return (
            <Container className="py-5 text-center">
                <h2>Product not found!</h2>
                <Button variant="primary" onClick={() => navigate('/')}>Back to Home</Button>
            </Container>
        );
    }

    const [qty, setQty] = useState(1);

    const handleAddToCart = () => {
        addToCart({ ...product, qty });
    };

    const handleWishlist = () => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id, product.name);
        } else {
            addToWishlist(product);
        }
    };

    const handleBuyNow = () => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        addToCart({ ...product, qty });
        navigate('/checkout');
    };

    return (
        <Container className="py-5">
            <Row>
                {/* Product Image */}
                <Col md={6} className="mb-4">
                    <Card className="border-0 shadow-sm p-3">
                        <div className="position-relative overflow-hidden rounded bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                            <Card.Img variant="top" src={product.img} className="img-fluid object-fit-contain" style={{ maxHeight: '500px' }} />
                            <Badge bg="danger" className="position-absolute top-0 start-0 m-3 px-3 py-2 fs-6">20% OFF</Badge>
                        </div>
                    </Card>
                </Col>

                {/* Product Info */}
                <Col md={6}>
                    <div className="ps-lg-4">
                        <h6 className="text-secondary text-uppercase mb-2">{product.category}</h6>
                        <h2 className="fw-bold fs-1 mb-2">{product.name}</h2>

                        {/* Ratings */}
                        <div className="d-flex align-items-center mb-3">
                            <div className="text-warning me-2">
                                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar className="text-muted" />
                            </div>
                            <span className="text-muted small">(123 reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="mb-4">
                            <span className="fs-1 fw-bold text-dark me-3">{product.price}</span>
                            <span className="text-muted text-decoration-line-through fs-5">₹999</span>
                            <span className="text-success ms-2 fw-medium">Inclusive of all taxes</span>
                        </div>

                        {/* Description */}
                        <p className="text-secondary mb-4" style={{ lineHeight: '1.8' }}>
                            {product.description || "Experience premium quality with our latest collection. Designed for comfort and durability, this product is perfect for your everyday needs."}
                        </p>

                        {/* Action Buttons */}
                        <div className="d-flex gap-3 mb-4">
                            {cart.find(c => c.id === product.id) ? (
                                <div className="d-flex align-items-center bg-white border border-primary rounded flex-grow-1" style={{ height: '48px' }}>
                                    <Button
                                        variant="white"
                                        className="h-100 px-4 border-0 text-primary fw-bold"
                                        onClick={() => {
                                            const cartItem = cart.find(c => c.id === product.id);
                                            if (cartItem.qty > 1) {
                                                updateQuantity(product.id, cartItem.qty - 1);
                                            } else {
                                                removeFromCart(product.id, product.name);
                                            }
                                        }}
                                    >
                                        -
                                    </Button>
                                    <span className="flex-grow-1 text-center fw-bold fs-5">{cart.find(c => c.id === product.id).qty}</span>
                                    <Button
                                        variant="white"
                                        className="h-100 px-4 border-0 text-primary fw-bold"
                                        onClick={() => {
                                            const cartItem = cart.find(c => c.id === product.id);
                                            updateQuantity(product.id, cartItem.qty + 1);
                                        }}
                                    >
                                        +
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                    onClick={handleAddToCart}
                                >
                                    <FaShoppingCart /> Add to Cart
                                </Button>
                            )}
                            <Button
                                variant="outline-danger"
                                size="lg"
                                className="px-4"
                                onClick={handleWishlist}
                            >
                                {isInWishlist(product.id) ? <FaHeart /> : <FaHeart className="text-danger" />}
                            </Button>
                        </div>
                        <Button variant="success" size="lg" className="w-100 mb-4 fw-bold" onClick={handleBuyNow}>
                            Buy Now
                        </Button>

                        {/* Trust Badges */}
                        <div className="d-flex justify-content-between border-top border-bottom py-3 mb-4">
                            <div className="d-flex flex-column align-items-center text-center px-2">
                                <FaTruck className="fs-4 text-primary mb-2" />
                                <small className="fw-bold">Free Delivery</small>
                            </div>
                            <div className="d-flex flex-column align-items-center text-center px-2 border-start border-end flex-grow-1">
                                <FaShieldAlt className="fs-4 text-primary mb-2" />
                                <small className="fw-bold">1 Year Warranty</small>
                            </div>
                            <div className="d-flex flex-column align-items-center text-center px-2">
                                <FaUndo className="fs-4 text-primary mb-2" />
                                <small className="fw-bold">7 Days Return</small>
                            </div>
                        </div>

                        {/* Specifications */}
                        {product.specs && (
                            <div className="mb-4">
                                <h5 className="fw-bold mb-3">Highlights</h5>
                                <ListGroup variant="flush">
                                    {product.specs.map((spec, idx) => (
                                        <ListGroup.Item key={idx} className="bg-transparent ps-0 border-bottom">
                                            • {spec}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ProductDetails;
