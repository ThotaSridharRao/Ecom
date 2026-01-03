import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Breadcrumb } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProduct } from '../context/ProductContext';
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import './CategoryProducts.css'; // Reuse existing styles

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const { isLoggedIn, openLoginModal } = useAuth();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { products } = useProduct();

    // Filter Logic
    const filteredProducts = useMemo(() => {
        if (!query) return [];
        const lowerQuery = query.toLowerCase().trim();
        return products.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery) ||
            (p.brand && p.brand.toLowerCase().includes(lowerQuery)) ||
            (p.description && p.description.toLowerCase().includes(lowerQuery))
        );
    }, [query, products]);

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

    return (
        <div className="search-results-page">
            <div className="category-page-header">
                <Container>
                    <Breadcrumb>
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Home</Breadcrumb.Item>
                        <Breadcrumb.Item active>Search Results</Breadcrumb.Item>
                    </Breadcrumb>
                    <h1 className="display-6 fw-bold">Results for "{query}"</h1>
                    <p className="lead text-muted">{filteredProducts.length} items found</p>
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
                                            <Card.Img variant="top" src={product.img} />
                                        </div>
                                    </Link>
                                    <Card.Body className="d-flex flex-column">
                                        <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                                            <Card.Title className="fs-6 text-truncate-2">{product.name}</Card.Title>
                                        </Link>
                                        <Card.Text className="fw-bold text-primary mb-auto">
                                            {product.sellingPrice ? `₹${product.sellingPrice}` : product.price}
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
                        <div className="mb-4 text-muted" style={{ fontSize: '4rem' }}>😕</div>
                        <h3>No matches found for "{query}"</h3>
                        <p className="text-muted">Try checking your spelling or use different keywords.</p>
                        <Link to="/">
                            <Button variant="primary" className="mt-3">Browse All Products</Button>
                        </Link>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default SearchResults;
