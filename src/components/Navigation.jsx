import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Nav, Container, Button, Form, Badge, Modal, Dropdown, NavDropdown, ListGroup } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaSearch, FaMapMarkerAlt, FaMicrophone, FaCamera, FaHeart, FaHeadset, FaUserCircle, FaBox, FaSignOutAlt, FaArrowLeft, FaAngleRight } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAddress } from '../context/AddressContext';
import { useProduct } from '../context/ProductContext';
import { useToast } from '../context/ToastContext';
import LocationPicker from './LocationPicker';
import './Navigation.css';

const Navigation = () => {
    const {
        isLoggedIn,
        user,
        login,
        register,
        logout,
        showLoginModal,
        openLoginModal,
        closeLoginModal
    } = useAuth();

    const { getCartCount } = useCart();
    const { defaultAddress } = useAddress();
    const { products } = useProduct();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const routeLocation = useLocation();

    // Auth State
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Location State
    const [showLocation, setShowLocation] = useState(false);
    const [location, setLocation] = useState(defaultAddress ? `${defaultAddress.line1}, ${defaultAddress.city}` : 'Select your address');
    const [locationError, setLocationError] = useState('');

    useEffect(() => {
        if (defaultAddress) {
            setLocation(`${defaultAddress.city} ${defaultAddress.zip}`);
        }
    }, [defaultAddress]);

    // Real Search Suggestions
    const [placeholder, setPlaceholder] = useState('Search for products, brands and more');

    const suggestions = searchQuery
        ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
        : [];

    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setShowSuggestions(false);
            setExpanded(false); // Close mobile menu if open
        }
    };

    const startVoiceSearch = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.start();

            showToast('info', 'Listening...');

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setSearchQuery(transcript);
                navigate(`/search?q=${encodeURIComponent(transcript)}`);
            };

            recognition.onerror = (event) => {
                showToast('error', 'Voice recognition failed. Try again.');
            };
        } else {
            showToast('warning', 'Voice search not supported in this browser.');
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            showToast('info', 'Scanning image...');
            // Simulate processing delay
            setTimeout(() => {
                // Determine a keyword based on filename for demo purposes, or fallback to random
                const cleanName = file.name.toLowerCase();
                let detected = 'Headphones';
                if (cleanName.includes('shoe') || cleanName.includes('sneaker')) detected = 'Running Shoes';
                if (cleanName.includes('watch')) detected = 'Smart Watch';
                if (cleanName.includes('bag')) detected = 'Bag';
                if (cleanName.includes('camera')) detected = 'Camera';

                showToast('success', `Found similar to: ${detected}`);
                setSearchQuery(detected);
                navigate(`/search?q=${encodeURIComponent(detected)}`);
            }, 1500);
        }
    };
    useEffect(() => {
        const placeholders = [
            'Search for "Mobiles"',
            'Search for "Shoes"',
            'Search for "Laptops"',
            'Search for "Watches"'
        ];
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % placeholders.length;
            setPlaceholder(placeholders[index]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const isHome = routeLocation.pathname === '/';

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setShowSuggestions(true);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (isRegistering) {
            if (!name || !email || !password || !confirmPassword) {
                setLoginError('All fields are required');
                return;
            }
            if (password !== confirmPassword) {
                setLoginError('Passwords do not match');
                return;
            }
            const result = await register({ name, email, password });
            if (result.success) {
                // Success handled by context (auto login)
                closeLoginModal();
            } else {
                setLoginError(result.message);
            }

        } else {
            if (!email || !password) {
                setLoginError('All fields are required');
                return;
            }
            const result = await login(email, password);
            if (result.success) {
                closeLoginModal();
                // Admin Redirect
                if (email === 'admin@admin.com') {
                    navigate('/admin/dashboard');
                }
            } else {
                setLoginError(result.message);
            }
        }
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setLoginError('');
        setPassword('');
        setConfirmPassword('');
    };

    const [expanded, setExpanded] = useState(false);

    // Sync expanded state with URL hash for history support
    useEffect(() => {
        setExpanded(routeLocation.hash === '#menu');
    }, [routeLocation.hash]);

    // Handle Menu Toggle
    const toggleMenu = () => {
        if (expanded) {
            navigate(-1); // Go back (close menu)
        } else {
            navigate({ hash: 'menu' }); // Add hash to history (open menu)
        }
    };

    // Close menu when location changes (navigating to a new page)
    useEffect(() => {
        if (routeLocation.hash !== '#menu') {
            setExpanded(false);
        }
    }, [routeLocation.pathname, routeLocation.hash]);

    // Lock Body Scroll when Menu is Open
    useEffect(() => {
        if (expanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [expanded]);

    // Hide Navigation on Admin Routes
    if (routeLocation.pathname.startsWith('/admin')) {
        return null;
    }

    // Helper for Search Bar JSX
    const renderSearchBar = () => (
        <Form className="search-container" onSubmit={handleSearchSubmit}>
            <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleImageUpload}
            />
            <div className="search-input-group">
                <Form.Control
                    type="search"
                    placeholder={placeholder}
                    className="search-input"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                <Button variant="link" className="search-icon-btn d-none d-md-flex" title="Voice Search" onClick={startVoiceSearch}>
                    <FaMicrophone />
                </Button>
                <Button variant="link" className="search-icon-btn d-none d-md-flex" title="Image Search" onClick={() => fileInputRef.current?.click()}>
                    <FaCamera />
                </Button>
                <Button variant="link" className="search-submit-btn" type="submit">
                    <FaSearch />
                </Button>
            </div>
            {/* Real Search Suggestions Dropdown */}
            {searchQuery && suggestions.length > 0 && showSuggestions && (
                <ListGroup className="position-absolute w-100 shadow rich-dropdown" style={{ zIndex: 1050 }}>
                    {suggestions.map(item => (
                        <ListGroup.Item
                            key={item.id}
                            action
                            className="d-flex align-items-center p-2 suggestion-item"
                            onClick={() => {
                                setSearchQuery(item.name);
                                navigate(`/search?q=${encodeURIComponent(item.name)}`);
                                setShowSuggestions(false);
                            }}
                        >
                            <img src={item.img} alt={item.name} className="suggestion-img me-3" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                            <div>
                                <div className="fw-bold small">{item.name}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>in {item.category}</div>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </Form>
    );

    // Smart Navbar Logic
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY;

                if (currentScrollY > 100) { // Threshold to start hiding
                    if (currentScrollY > lastScrollY) {
                        // Scrolling down
                        setIsVisible(false);
                    } else {
                        // Scrolling up
                        setIsVisible(true);
                    }
                } else {
                    // Always show at top
                    setIsVisible(true);
                }

                setLastScrollY(currentScrollY);
            }
        };

        window.addEventListener('scroll', controlNavbar);

        return () => {
            window.removeEventListener('scroll', controlNavbar);
        };
    }, [lastScrollY]);

    return (
        <>
            <Navbar
                bg="light"
                expand="lg"
                className="py-2 shadow-sm sticky-top"
                expanded={expanded}
                style={{
                    zIndex: expanded ? 1040 : 1020,
                    transition: 'transform 0.3s ease-in-out',
                    transform: isVisible ? 'translateY(0)' : 'translateY(-100%)'
                }}
            >
                <Container fluid>
                    {/* Top Row for Mobile: Brand + Toggle/Login */}
                    <div className="d-flex align-items-center justify-content-between w-100 d-lg-none">
                        <div className="d-flex align-items-center">
                            {(expanded || !isHome) && (
                                <Button
                                    variant="link"
                                    className="text-dark p-0 me-2 border-0"
                                    onClick={expanded ? toggleMenu : () => navigate(-1)}
                                    style={{ marginTop: '-2px' }}
                                >
                                    <FaArrowLeft className="fs-5" />
                                </Button>
                            )}
                            <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-primary">
                                EcomStore
                            </Navbar.Brand>
                        </div>
                        <div className="d-flex align-items-center">
                            {!expanded && (
                                <>
                                    <Link to="/cart" className="text-secondary me-3 position-relative">
                                        <FaShoppingCart className="fs-5" />
                                        {getCartCount() > 0 && (
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                                                {getCartCount()}
                                            </span>
                                        )}
                                    </Link>
                                    {isLoggedIn ? (
                                        <Navbar.Toggle
                                            aria-controls="basic-navbar-nav"
                                            onClick={toggleMenu}
                                            className="border-0 p-0 focus-ring-none"
                                            style={{ boxShadow: 'none' }}
                                        >
                                            {user?.image ? (
                                                <img
                                                    src={user.image}
                                                    alt="Profile"
                                                    className="rounded-circle border border-2 border-white shadow-sm"
                                                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                                    <FaUser className="fs-6 text-secondary" />
                                                </div>
                                            )}
                                        </Navbar.Toggle>
                                    ) : (
                                        <Button variant="primary" size="sm" onClick={openLoginModal}>
                                            Login
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    {!expanded && (
                        <div className="w-100 d-lg-none mt-2 mb-2">
                            {renderSearchBar()}
                        </div>
                    )}

                    {/* Mobile Location */}
                    {!expanded && (
                        <div className="w-100 d-lg-none mb-2 d-flex align-items-center justify-content-between" onClick={() => setShowLocation(true)}>
                            <div className="d-flex align-items-center text-muted small">
                                <FaMapMarkerAlt className="me-1" />
                                <span className="text-truncate" style={{ maxWidth: '200px' }}>{location}</span>
                            </div>
                            <span className="text-primary small">Change</span>
                        </div>
                    )}

                    {/* Desktop Layout */}
                    <div className="d-none d-lg-flex align-items-center w-100 position-relative">
                        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-primary me-3">
                            EcomStore
                        </Navbar.Brand>

                        <div className="d-flex align-items-center pointer me-3" onClick={() => setShowLocation(true)} style={{ minWidth: '150px' }}>
                            <FaMapMarkerAlt className="text-secondary me-1" />
                            <div className="d-flex flex-column">
                                <span className="small text-muted" style={{ fontSize: '10px', lineHeight: '1' }}>Delivering to</span>
                                <span className="small text-truncate fw-bold" style={{ maxWidth: '150px', lineHeight: '1.2' }}>{location}</span>
                            </div>
                        </div>

                        {renderSearchBar()}

                        <Nav className="ms-auto align-items-center">
                            {isLoggedIn && (
                                <Nav.Link as={Link} to="/wishlist" className="d-flex flex-column align-items-center mx-2 text-secondary">
                                    <FaHeart className="fs-5 mb-1" />
                                    <span className="small">Wishlist</span>
                                </Nav.Link>
                            )}

                            {isLoggedIn && (
                                <Nav.Link as={Link} to="/support" className="d-flex flex-column align-items-center mx-2 text-secondary">
                                    <FaHeadset className="fs-5 mb-1" />
                                    <span className="small">Support</span>
                                </Nav.Link>
                            )}

                            <Nav.Link as={Link} to="/cart" className="d-flex flex-column align-items-center mx-2 text-secondary position-relative">
                                <div className="position-relative">
                                    <FaShoppingCart className="fs-5 mb-1" />
                                    {getCartCount() > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem', transform: 'translate(50%, -50%)' }}>
                                            {getCartCount()}
                                        </span>
                                    )}
                                </div>
                                <span className="small">Cart</span>
                            </Nav.Link>

                            {isLoggedIn ? (
                                <NavDropdown
                                    title={<><span className="d-none d-lg-inline me-2 fw-medium text-dark">Hello, {user?.name || 'User'}</span><FaUserCircle className="fs-4 text-primary" /></>}
                                    id="basic-nav-dropdown"
                                    align="end"
                                    className="user-dropdown"
                                >
                                    {user?.role === 'admin' && (
                                        <>
                                            <NavDropdown.Item as={Link} to="/admin/dashboard" className="text-primary fw-bold">Admin Dashboard</NavDropdown.Item>
                                            <NavDropdown.Divider />
                                        </>
                                    )}
                                    <NavDropdown.Item as={Link} to="/profile">My Profile</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/addresses">Addresses</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/orders">My Orders</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={() => logout()} className="text-danger">
                                        Logout
                                    </NavDropdown.Item>
                                </NavDropdown>
                            ) : (
                                <Button variant="primary" className="ms-3 px-4" onClick={openLoginModal}>
                                    Login
                                </Button>
                            )}
                        </Nav>
                    </div>

                    {/* Mobile Menu Overlay Content */}
                    <Navbar.Collapse id="basic-navbar-nav" className="d-lg-none" style={{ maxHeight: 'calc(100vh - 60px)', overflowY: 'auto' }}>
                        <div className="d-flex flex-column bg-white min-vh-100 d-lg-none">
                            {/* Mobile Menu Header */}
                            <div className="d-flex align-items-center p-3 border-bottom bg-white">
                                {isLoggedIn ? (
                                    <div className="d-flex align-items-center flex-grow-1" onClick={() => { navigate('/profile'); setExpanded(false); }}>
                                        {user?.image ? (
                                            <img
                                                src={user.image}
                                                alt="Profile"
                                                className="rounded-circle border border-2 border-light shadow-sm me-3"
                                                style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px' }}>
                                                <FaUser className="fs-5 text-secondary" />
                                            </div>
                                        )}
                                        <div className="d-flex flex-column">
                                            <span className="fw-bold text-dark">{user?.name || 'User'}</span>
                                            <span className="text-primary small fw-medium">View Profile</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column">
                                        <span className="fw-bold fs-5">Welcome</span>
                                        <span className="text-muted small">Login to access your account</span>
                                    </div>
                                )}
                            </div>

                            <div className="d-lg-none flex-grow-1 overflow-auto">
                                {isLoggedIn ? (
                                    <div className="p-3">
                                        <div className="text-muted small fw-bold mb-3 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Your Information</div>

                                        <ListGroup variant="flush" className="mb-4 rounded-3 border-0">
                                            {user?.role === 'admin' && (
                                                <ListGroup.Item as={Link} to="/admin/dashboard" action className="d-flex align-items-center justify-content-between py-3 border-0 mb-1 rounded bg-light" onClick={() => setExpanded(false)}>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-white p-2 rounded-circle shadow-sm me-3 text-primary">
                                                            <FaUserCircle />
                                                        </div>
                                                        <span className="fw-medium">Admin Dashboard</span>
                                                    </div>
                                                    <FaAngleRight className="text-muted small" />
                                                </ListGroup.Item>
                                            )}
                                            <ListGroup.Item as={Link} to="/addresses" action className="d-flex align-items-center justify-content-between py-3 border-0 mb-1 rounded bg-light" onClick={() => setExpanded(false)}>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-white p-2 rounded-circle shadow-sm me-3 text-success">
                                                        <FaMapMarkerAlt />
                                                    </div>
                                                    <span className="fw-medium">Address Book</span>
                                                </div>
                                                <FaAngleRight className="text-muted small" />
                                            </ListGroup.Item>
                                            <ListGroup.Item as={Link} to="/orders" action className="d-flex align-items-center justify-content-between py-3 border-0 mb-1 rounded bg-light" onClick={() => setExpanded(false)}>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-white p-2 rounded-circle shadow-sm me-3 text-warning">
                                                        <FaBox />
                                                    </div>
                                                    <span className="fw-medium">My Orders</span>
                                                </div>
                                                <FaAngleRight className="text-muted small" />
                                            </ListGroup.Item>
                                        </ListGroup>

                                        <div className="text-muted small fw-bold mb-3 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>App Navigation</div>

                                        <ListGroup variant="flush" className="rounded-3 border-0">
                                            <ListGroup.Item as={Link} to="/support" action className="d-flex align-items-center justify-content-between py-3 border-0 mb-1 rounded bg-light" onClick={() => setExpanded(false)}>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-white p-2 rounded-circle shadow-sm me-3 text-primary">
                                                        <FaHeadset />
                                                    </div>
                                                    <span className="fw-medium">Customer Support</span>
                                                </div>
                                                <FaAngleRight className="text-muted small" />
                                            </ListGroup.Item>

                                            <ListGroup.Item as={Link} to="/wishlist" action className="d-flex align-items-center justify-content-between py-3 border-0 mb-1 rounded bg-light" onClick={() => setExpanded(false)}>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-white p-2 rounded-circle shadow-sm me-3 text-danger">
                                                        <FaHeart />
                                                    </div>
                                                    <span className="fw-medium">Wishlist</span>
                                                </div>
                                                <FaAngleRight className="text-muted small" />
                                            </ListGroup.Item>

                                            <ListGroup.Item as={Link} to="/cart" action className="d-flex align-items-center justify-content-between py-3 border-0 mb-1 rounded bg-light" onClick={() => setExpanded(false)}>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-white p-2 rounded-circle shadow-sm me-3 text-dark position-relative">
                                                        <FaShoppingCart />
                                                        {getCartCount() > 0 && (
                                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                                                                {getCartCount()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="fw-medium">Cart</span>
                                                </div>
                                                <FaAngleRight className="text-muted small" />
                                            </ListGroup.Item>
                                        </ListGroup>

                                        <div className="mt-4 pt-3 border-top">
                                            <Button variant="outline-danger" className="w-100 py-2 d-flex align-items-center justify-content-center" onClick={() => { logout(); setExpanded(false); }}>
                                                <FaSignOutAlt className="me-2" /> Logout
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 text-center mt-5">
                                        <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                                            <FaUser className="fs-1 text-secondary" />
                                        </div>
                                        <h5 className="mb-2">Welcome Guest</h5>
                                        <p className="text-muted mb-4 small">Login to view your profile, track orders, and manage your wishlist.</p>
                                        <Button variant="primary" className="w-100 py-2 rounded-pill" onClick={() => { openLoginModal(); setExpanded(false); }}>
                                            Login / Register
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Login Modal */}
            <Modal show={showLoginModal} onHide={closeLoginModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">{isRegistering ? 'Create Account' : 'Login'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleLogin}>
                        {loginError && <div className="alert alert-danger small py-2">{loginError}</div>}

                        {isRegistering && (
                            <Form.Group className="mb-3">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>

                        {isRegistering && (
                            <Form.Group className="mb-3">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </Form.Group>
                        )}

                        <Button variant="primary" className="w-100 mb-3" type="submit">
                            {isRegistering ? 'Register' : 'Login'}
                        </Button>

                        <div className="text-center">
                            <small className="text-muted">
                                {isRegistering ? 'Already have an account?' : 'New to EcomStore?'}
                                <span
                                    className="text-primary ms-1 cursor-pointer fw-bold"
                                    style={{ cursor: 'pointer' }}
                                    onClick={toggleMode}
                                >
                                    {isRegistering ? 'Login here' : 'Create an account'}
                                </span>
                            </small>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Location Modal */}
            <Modal show={showLocation} onHide={() => setShowLocation(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Choose your Location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted small">Select a delivery location to see product availability and delivery options</p>

                    {locationError && <div className="alert alert-danger small py-2">{locationError}</div>}

                    <Button
                        variant="outline-primary"
                        className="w-100 mb-3"
                        onClick={() => {
                            if (navigator.geolocation) {
                                setLocationError('');
                                navigator.geolocation.getCurrentPosition(
                                    async (position) => {
                                        try {
                                            const { latitude, longitude } = position.coords;
                                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                                            const data = await response.json();
                                            if (data && data.address) {
                                                const { city, town, village, state, postcode } = data.address;
                                                const cityVal = city || town || village || state;
                                                const locString = `${cityVal} - ${postcode}`;
                                                setLocation(locString);
                                                setShowLocation(false);
                                            } else {
                                                setLocationError("Address not found for this location.");
                                            }
                                        } catch (error) {
                                            setLocationError("Failed to fetch address details.");
                                        }
                                    },
                                    (error) => {
                                        setLocationError("Unable to retrieve your location. Please check browser permissions.");
                                    }
                                );
                            } else {
                                setLocationError("Geolocation is not supported by this browser.");
                            }
                        }}
                    >
                        <FaMapMarkerAlt className="me-2" /> Detect my location
                    </Button>

                    <div className="text-center text-muted small my-2">OR</div>

                    {defaultAddress && (
                        <div
                            className="p-3 border rounded mb-3 cursor-pointer hover-bg-light"
                            onClick={() => {
                                setLocation(`${defaultAddress.city} ${defaultAddress.zip}`);
                                setShowLocation(false);
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="fw-bold text-primary mb-1">Default Address</div>
                            <div className="small">{defaultAddress.name}</div>
                            <div className="small text-muted">{defaultAddress.line1}, {defaultAddress.city} - {defaultAddress.zip}</div>
                        </div>
                    )}

                    <LocationPicker
                        onLocationSelect={(coords) => {
                            // Reuse the same logic for map clicks
                            const fetchAddress = async () => {
                                try {
                                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`);
                                    const data = await response.json();
                                    if (data && data.address) {
                                        const { city, town, village, state, postcode, road, suburb } = data.address;
                                        // create a readable string
                                        const cityVal = city || town || village || state;
                                        const locString = `${cityVal} - ${postcode}`;
                                        setLocation(locString);
                                        setShowLocation(false);
                                    }
                                } catch (error) {
                                    console.error("Geocoding error", error);
                                }
                            };
                            fetchAddress();
                        }}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Navigation;
