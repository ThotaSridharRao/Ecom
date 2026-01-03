import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    const location = useLocation();

    // Hide Footer on Admin Routes
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="footer">
            <Container>
                <Row>
                    <Col xs={12} md={3} className="mb-4">
                        <h5>EcomStore</h5>
                        <p className="small">
                            Your one-stop shop for all your needs. Quality products, best prices, and fast delivery.
                        </p>
                    </Col>
                    <Col xs={6} md={3} className="mb-4">
                        <h5>Quick Links</h5>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/category/Electronics">Electronics</Link></li>
                            <li><Link to="/category/Fashion">Fashion</Link></li>
                            <li><Link to="/category/Home & Kitchen">Home & Kitchen</Link></li>
                        </ul>
                    </Col>
                    <Col xs={6} md={3} className="mb-4">
                        <h5>Customer Service</h5>
                        <ul>
                            <li><Link to="/profile">My Account</Link></li>
                            <li><Link to="/orders">Order History</Link></li>
                            <li><Link to="/wishlist">Wishlist</Link></li>
                            <li><Link to="/cart">Cart</Link></li>
                        </ul>
                    </Col>
                    <Col xs={12} md={3} className="mb-4">
                        <h5>Connect With Us</h5>
                        <div className="d-flex">
                            <a href="#" className="footer-social-icon"><FaFacebook /></a>
                            <a href="#" className="footer-social-icon"><FaTwitter /></a>
                            <a href="#" className="footer-social-icon"><FaInstagram /></a>
                            <a href="#" className="footer-social-icon"><FaLinkedin /></a>
                        </div>
                        <div className="mt-3">
                            <small>Email: support@ecomstore.com</small><br />
                            <small>Phone: +91 98765 43210</small>
                        </div>
                    </Col>
                </Row>
                <div className="footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center">
                    <p className="mb-2 mb-md-0">&copy; {new Date().getFullYear()} EcomStore. All rights reserved.</p>
                    <div className="footer-legal-links">
                        <Link to="/privacy-policy" className="text-white text-decoration-none mx-2 small">Privacy Policy</Link>
                        <span className="text-white-50">|</span>
                        <Link to="/terms" className="text-white text-decoration-none mx-2 small">Terms & Conditions</Link>
                        <span className="text-white-50">|</span>
                        <Link to="/refund-policy" className="text-white text-decoration-none mx-2 small">Refund Policy</Link>
                    </div>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
