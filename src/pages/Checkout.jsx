import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAddress } from '../context/AddressContext';
import { useProduct } from '../context/ProductContext';
import { useOrder } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPlus, FaCreditCard, FaMoneyBillWave, FaGooglePay, FaCheckCircle } from 'react-icons/fa';
import LocationPicker from '../components/LocationPicker'; // Reusing LocationPicker if needed or just simple form

const Checkout = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const { addresses, addAddress } = useAddress();
    const { addOrder } = useOrder();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [selectedAddressId, setSelectedAddressId] = useState(addresses.find(a => a.isDefault)?.id || addresses[0]?.id);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [isProcessing, setIsProcessing] = useState(false);

    // Address Modal State (Simplified version of Addresses.jsx modal)
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newAddressData, setNewAddressData] = useState({
        type: 'Home',
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        addAddress(newAddressData);
        setShowAddressModal(false);
        // Select the newly added address (logic could be improved to select the last added)
    };

    const handlePlaceOrder = () => {
        if (!selectedAddressId) {
            showToast('Please select a delivery address', 'error');
            return;
        }

        setIsProcessing(true);

        // Simulate API Call
        setTimeout(() => {
            const selectedAddress = addresses.find(a => a.id === selectedAddressId);
            const totalAmount = getCartTotal();
            const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

            const newOrder = {
                id: orderId,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                total: `₹${totalAmount.toLocaleString()}`,
                status: 'Processing',
                statusColor: 'warning',
                expectedDelivery: `Arriving by ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                deliveredDate: null,
                currentStep: 1,
                payment: {
                    method: paymentMethod,
                    details: paymentMethod === 'UPI' ? 'PhonePe' : paymentMethod === 'Card' ? '**** 1234' : '',
                    isOnline: paymentMethod !== 'COD',
                    status: paymentMethod === 'COD' ? 'Pending' : 'Success',
                    transactionId: paymentMethod !== 'COD' ? `TXN${Date.now()}` : null,
                    date: new Date().toLocaleString()
                },
                address: {
                    name: selectedAddress.name,
                    line1: selectedAddress.address,
                    line2: `${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`,
                    phone: selectedAddress.phone
                },
                vendor: {
                    name: 'EcomStore Retailers',
                    gst: '27AAAAA0000A1Z5',
                    address: 'Mumbai, India'
                },
                bill: {
                    subtotal: `₹${totalAmount.toLocaleString()}`,
                    tax: '₹0', // Simplified
                    shipping: 'Free',
                    discount: '₹0',
                    total: `₹${totalAmount.toLocaleString()}`
                },
                items: cart.map(item => ({
                    name: item.name,
                    image: item.img || item.image,
                    qty: item.qty,
                    price: item.price,
                    id: item.id // Ensure ID is passed for tracking if needed later
                })),
                timeline: [
                    { title: 'Order Placed', date: 'Just Now', completed: true },
                    { title: 'Processing', date: 'In Progress', completed: true },
                    { title: 'Shipped', date: 'Pending', completed: false },
                    { title: 'Delivered', date: 'Pending', completed: false }
                ]
            };

            // Update Stock for each item
            cart.forEach(item => {
                updateProductStock(item.id, item.qty);
            });

            addOrder(newOrder);
            clearCart();
            setIsProcessing(false);
            showToast('Order placed successfully!', 'success');
            navigate('/orders');
        }, 2000);
    };

    if (cart.length === 0) {
        return (
            <Container className="py-5 text-center">
                <h3>Your cart is empty</h3>
                <p>Add items to checkout.</p>
                <Link to="/" className="btn btn-primary">Start Shopping</Link>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4 fw-bold">Checkout</h2>
            <Row>
                <Col lg={8}>
                    {/* Address Section */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white border-bottom py-3">
                            <h5 className="mb-0 fw-bold d-flex align-items-center">
                                <span className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '30px', height: '30px', fontSize: '1rem' }}>1</span>
                                Delivery Address
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {addresses.map(addr => (
                                <div key={addr.id} className={`border rounded p-3 mb-3 cursor-pointer ${selectedAddressId === addr.id ? 'border-primary bg-primary bg-opacity-10' : ''}`} onClick={() => setSelectedAddressId(addr.id)}>
                                    <Form.Check
                                        type="radio"
                                        id={`addr-${addr.id}`}
                                        name="address"
                                        checked={selectedAddressId === addr.id}
                                        onChange={() => setSelectedAddressId(addr.id)}
                                        label={
                                            <div>
                                                <div className="d-flex align-items-center mb-1">
                                                    <span className="fw-bold me-2">{addr.name}</span>
                                                    <Badge bg="secondary" className="me-2">{addr.type}</Badge>
                                                    <span className="fw-bold">{addr.phone}</span>
                                                </div>
                                                <div className="text-muted small">
                                                    {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                                                </div>
                                            </div>
                                        }
                                    />
                                </div>
                            ))}
                            <Button variant="outline-dark" size="sm" className="d-flex align-items-center" onClick={() => setShowAddressModal(true)}>
                                <FaPlus className="me-2" /> Add New Address
                            </Button>
                        </Card.Body>
                    </Card>

                    {/* Payment Section */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white border-bottom py-3">
                            <h5 className="mb-0 fw-bold d-flex align-items-center">
                                <span className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '30px', height: '30px', fontSize: '1rem' }}>2</span>
                                Payment Method
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className={`border rounded p-3 mb-3 cursor-pointer ${paymentMethod === 'UPI' ? 'border-primary bg-primary bg-opacity-10' : ''}`} onClick={() => setPaymentMethod('UPI')}>
                                <Form.Check
                                    type="radio"
                                    id="pay-upi"
                                    name="payment"
                                    checked={paymentMethod === 'UPI'}
                                    onChange={() => setPaymentMethod('UPI')}
                                    label={
                                        <div className="d-flex align-items-center">
                                            <FaGooglePay className="fs-4 me-3 text-primary" />
                                            <div>
                                                <div className="fw-bold">UPI (Google Pay / PhonePe)</div>
                                                <div className="text-muted small">Pay instantly using your UPI app</div>
                                            </div>
                                        </div>
                                    }
                                />
                            </div>
                            <div className={`border rounded p-3 mb-3 cursor-pointer ${paymentMethod === 'Card' ? 'border-primary bg-primary bg-opacity-10' : ''}`} onClick={() => setPaymentMethod('Card')}>
                                <Form.Check
                                    type="radio"
                                    id="pay-card"
                                    name="payment"
                                    checked={paymentMethod === 'Card'}
                                    onChange={() => setPaymentMethod('Card')}
                                    label={
                                        <div className="d-flex align-items-center">
                                            <FaCreditCard className="fs-5 me-3 text-secondary" />
                                            <div>
                                                <div className="fw-bold">Credit / Debit Card</div>
                                                <div className="text-muted small">Visa, Mastercard, RuPay</div>
                                            </div>
                                        </div>
                                    }
                                />
                            </div>
                            <div className={`border rounded p-3 mb-3 cursor-pointer ${paymentMethod === 'COD' ? 'border-primary bg-primary bg-opacity-10' : ''}`} onClick={() => setPaymentMethod('COD')}>
                                <Form.Check
                                    type="radio"
                                    id="pay-cod"
                                    name="payment"
                                    checked={paymentMethod === 'COD'}
                                    onChange={() => setPaymentMethod('COD')}
                                    label={
                                        <div className="d-flex align-items-center">
                                            <FaMoneyBillWave className="fs-5 me-3 text-success" />
                                            <div>
                                                <div className="fw-bold">Cash on Delivery</div>
                                                <div className="text-muted small">Pay when you receive the order</div>
                                            </div>
                                        </div>
                                    }
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm sticky-top" style={{ top: '90px' }}>
                        <Card.Body>
                            <h5 className="fw-bold mb-4">Order Summary</h5>
                            <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {cart.map(item => (
                                    <div key={item.id} className="d-flex align-items-center mb-3">
                                        <img src={item.img || item.image} alt={item.name} className="rounded object-fit-cover" style={{ width: '50px', height: '50px' }} />
                                        <div className="ms-3 flex-grow-1">
                                            <div className="small fw-bold text-truncate" style={{ maxWidth: '150px' }}>{item.name}</div>
                                            <div className="small text-muted">Qty: {item.qty}</div>
                                        </div>
                                        <div className="small fw-bold">{item.price}</div>
                                    </div>
                                ))}
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Subtotal</span>
                                <span>₹{getCartTotal().toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Shipping</span>
                                <span className="text-success">Free</span>
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
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : 'Place Order'}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Simple Add Address Modal */}
            <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Address</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddressSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" required onChange={e => setNewAddressData({ ...newAddressData, name: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control type="tel" required onChange={e => setNewAddressData({ ...newAddressData, phone: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control as="textarea" rows={2} required onChange={e => setNewAddressData({ ...newAddressData, address: e.target.value })} />
                        </Form.Group>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>City</Form.Label>
                                    <Form.Control type="text" required onChange={e => setNewAddressData({ ...newAddressData, city: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Pincode</Form.Label>
                                    <Form.Control type="text" required onChange={e => setNewAddressData({ ...newAddressData, pincode: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>State</Form.Label>
                            <Form.Control type="text" required onChange={e => setNewAddressData({ ...newAddressData, state: e.target.value })} />
                        </Form.Group>
                        <Button variant="dark" type="submit" className="w-100">Save Address</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Checkout;
