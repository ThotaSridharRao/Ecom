import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Breadcrumb } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';

import { useProduct } from '../context/ProductContext';
import './CategoryProducts.css';


const CategoryProducts = () => {
    const { categoryName } = useParams();
    const { isLoggedIn, openLoginModal } = useAuth();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { getProductsByCategory } = useProduct();

    const handleAddToCart = (product) => {
        addToCart(product);
    };

    const toggleWishlist = (product) => {
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

    // Filter products based on the category from URL using Context
    const filteredProducts = categoryName === 'All'
        ? [] // Or fetch all if you have a method
        : getProductsByCategory(categoryName);

    // Note: getProductsByCategory returns exact matches. 
    // The URLs are /category/Electronics, etc. which match our data.
    // If categoryName is "All", we might want something else, but for now let's stick to specific categories.

    const displayCategoryName = categoryName ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1) : 'Products';

    return (
        <div className="category-products-page">
            <div className="category-page-header">
                <Container>
                    <Breadcrumb>
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Home</Breadcrumb.Item>
                        <Breadcrumb.Item active>{displayCategoryName}</Breadcrumb.Item>
                    </Breadcrumb>
                    <h1 className="display-5 fw-bold">{displayCategoryName}</h1>
                    <p className="lead text-muted">Explore our latest collection of {displayCategoryName}</p>
                </Container>
            </div>

            <Container className="mb-5">
                {filteredProducts.length > 0 ? (
                    <Row>
                        {filteredProducts.map(product => (
                            <Col key={product.id} xs={6} md={3} lg={3} className="mb-4">
                                <Card className="h-100 shadow-sm product-card">
                                    <Link to={`/product/${product.id}`} className="text-decoration-none">
                                        <div className="product-img-wrapper position-relative">
                                            <Card.Img variant="top" src={product.img} />{/* Context uses 'img' not 'image' */}
                                        </div>
                                    </Link>
                                    <Card.Body className="d-flex flex-column">
                                        <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                                            <Card.Title className="fs-6 text-truncate-2">{product.name}</Card.Title>
                                        </Link>
                                        <Card.Text className="fw-bold text-primary mb-auto">
                                            {product.price}
                                        </Card.Text>
                                        <div className="d-flex gap-2 mt-3">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="flex-grow-1"
                                                onClick={() => handleAddToCart(product)}
                                            >
                                                <FaShoppingCart className="me-1" /> Add
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => toggleWishlist(product)}
                                            >
                                                {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <div className="text-center py-5">
                        <h3>No products found in this category.</h3>
                        <Link to="/">
                            <Button variant="primary" className="mt-3">Go Back Home</Button>
                        </Link>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default CategoryProducts;
