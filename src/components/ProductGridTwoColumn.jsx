import React, { useRef, useState, useEffect } from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart } from 'react-icons/fa';
import './ProductCarousel.css'; // Reusing carousel styles
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const ProductGridTwoColumn = ({
    leftTitle,
    leftProducts,
    rightTitle,
    rightProducts
}) => {
    return (
        <div className="mb-5 section-container">
            <Row>
                {/* Left Column */}
                <Col lg={6} className="mb-4 mb-lg-0">
                    <div className="bg-white p-3 rounded h-100 border">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="fw-bold mb-0">{leftTitle}</h4>
                            <Link to="#" className="text-decoration-none small fw-bold">See more</Link>
                        </div>
                        <div className="row g-3">
                            {leftProducts.slice(0, 4).map((item) => (
                                <Col xs={6} key={item.id}>
                                    <SimpleProductCard item={item} />
                                </Col>
                            ))}
                        </div>
                    </div>
                </Col>

                {/* Right Column */}
                <Col lg={6}>
                    <div className="bg-white p-3 rounded h-100 border">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="fw-bold mb-0">{rightTitle}</h4>
                            <Link to="#" className="text-decoration-none small fw-bold">See more</Link>
                        </div>
                        <div className="row g-3">
                            {rightProducts.slice(0, 4).map((item) => (
                                <Col xs={6} key={item.id}>
                                    <SimpleProductCard item={item} />
                                </Col>
                            ))}
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const SimpleProductCard = ({ item }) => {
    return (
        <Card className="h-100 border-0 shadow-sm">
            <Link to={`/product/${item.id}`} className="text-decoration-none">
                <div className="card-img-box rounded bg-light mb-2" style={{ height: '150px' }}>
                    <Card.Img variant="top" src={item.img} className="h-100 w-100 object-fit-contain p-2" />
                </div>
            </Link>
            <Card.Body className="p-0">
                <Link to={`/product/${item.id}`} className="text-decoration-none text-dark">
                    <Card.Title className="fs-6 mb-1 text-truncate">{item.name}</Card.Title>
                </Link>
                <div className="fw-bold small">{item.price}</div>
            </Card.Body>
        </Card>
    );
};

export default ProductGridTwoColumn;
