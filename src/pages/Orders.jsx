import React, { useState } from 'react';
import { Container, Button, Modal, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaChevronRight, FaCheck, FaCircle, FaTruck, FaMapMarkerAlt, FaFileInvoice, FaCreditCard, FaReceipt, FaStore, FaInfoCircle, FaCheckCircle, FaMoneyBillWave, FaHeadset, FaPhoneAlt, FaComments } from 'react-icons/fa';
import { useOrder } from '../context/OrderContext';
import './Orders.css';

const Orders = () => {
    const navigate = useNavigate();
    const { orders: allOrders } = useOrder();
    const [showTracking, setShowTracking] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const handleTrackOrder = (order) => {
        setSelectedOrder(order);
        setShowTracking(true);
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDetails(true);
    };

    const handleNeedHelp = (order) => {
        setSelectedOrder(order);
        setShowHelp(true);
    };

    const handleChatSupport = () => {
        setShowHelp(false);
        navigate('/support-chat', { state: { order: selectedOrder } });
    };

    const handleCallSupport = () => {
        // Check if device is likely mobile (touch capable or small screen)
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
        const supportNumber = "1800-123-4567";
        const cleanNumber = "18001234567";

        if (isMobile) {
            window.location.href = `tel:${cleanNumber}`;
        } else {
            // For desktop, we can update the UI to show the number or just alert it if we want to keep it simple,
            // but the user asked to "show the number".
            // Let's replace the modal content with the number info.
            alert(`Please call our support team at: ${supportNumber}\nAvailable 9 AM - 9 PM`);
        }
    };

    return (
        <Container className="py-4" style={{ maxWidth: '600px' }}>
            <h4 className="fw-bold mb-4">My Orders</h4>

            {allOrders.length === 0 ? (
                <div className="text-center py-5">
                    <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                        <FaBox size={40} className="text-muted" />
                    </div>
                    <h5>No orders found</h5>
                    <p className="text-muted small">Start shopping to see your orders here.</p>
                    <Button variant="dark" href="/" className="px-4 rounded-pill">Start Shopping</Button>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {allOrders.map((order) => (
                        <div key={order.id} className="order-minimal-card">
                            {/* Header */}
                            <div className="order-status-header">
                                <span className={`status-indicator ${order.statusColor}`}></span>
                                <span className="fw-bold fs-6 flex-grow-1">{order.status}</span>
                                <small className="text-muted">{order.expectedDelivery}</small>
                            </div>

                            {/* Product Preview */}
                            <div className="product-preview" onClick={() => handleViewDetails(order)} style={{ cursor: 'pointer' }}>
                                <img src={order.items[0].image} alt={order.items[0].name} className="product-thumb-large" />
                                <div className="flex-grow-1">
                                    <h6 className="fw-bold mb-1 text-truncate">{order.items[0].name}</h6>
                                    <div className="text-muted small mb-1">
                                        {order.items.length > 1 ? `+ ${order.items.length - 1} more items` : order.items[0].price}
                                    </div>
                                    <small className="text-secondary">Order #{order.id}</small>
                                </div>
                                <FaChevronRight className="text-muted" />
                            </div>

                            {/* Footer Actions */}
                            <div className="action-footer">
                                <Button
                                    variant="outline-dark"
                                    size="sm"
                                    className="flex-grow-1 rounded-pill"
                                    onClick={() => handleTrackOrder(order)}
                                >
                                    Track Order
                                </Button>
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="flex-grow-1 rounded-pill text-muted d-flex align-items-center justify-content-center gap-2"
                                    onClick={() => handleNeedHelp(order)}
                                >
                                    <FaHeadset size={14} /> Need Help?
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tracking Modal */}
            <Modal show={showTracking} onHide={() => setShowTracking(false)} centered className="tracking-modal">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold fs-5">Tracking Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2 pb-4">
                    {selectedOrder && (
                        <div>
                            <div className="mb-4 p-3 bg-light rounded-3 d-flex align-items-center gap-3">
                                <FaTruck className="text-primary fs-4" />
                                <div>
                                    <div className="fw-bold">Estimated Delivery</div>
                                    <div className="text-muted small">{selectedOrder.expectedDelivery}</div>
                                </div>
                            </div>

                            <div className="timeline-container ps-2">
                                {selectedOrder.timeline.map((step, index) => (
                                    <div key={index} className={`timeline-item ${step.completed ? 'completed' : ''} ${index === selectedOrder.currentStep ? 'current' : ''}`}>
                                        <div className="timeline-line"></div>
                                        <div className="timeline-icon">
                                            {step.completed ? <FaCheck /> : <FaCircle style={{ fontSize: '6px' }} />}
                                        </div>
                                        <div className="timeline-content">
                                            <div className="timeline-title">{step.title}</div>
                                            <div className="timeline-date">{step.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            {/* Need Help Modal */}
            <Modal show={showHelp} onHide={() => setShowHelp(false)} centered className="help-modal">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold fs-5">Need Help?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2 pb-4">
                    {selectedOrder && (
                        <div>
                            <p className="text-muted small mb-4">
                                Have an issue with Order <strong>#{selectedOrder.id}</strong>? Select an option below to connect with our support team.
                            </p>

                            <div className="d-grid gap-3">
                                <Button
                                    variant="outline-primary"
                                    size="lg"
                                    className="d-flex align-items-center justify-content-between p-3 help-option-btn"
                                    onClick={handleChatSupport}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary">
                                            <FaComments size={20} />
                                        </div>
                                        <div className="text-start">
                                            <div className="fw-bold fs-6">Chat with Support</div>
                                            <div className="small text-muted">Average wait time: 2 mins</div>
                                        </div>
                                    </div>
                                    <FaChevronRight className="text-muted small" />
                                </Button>

                                <Button
                                    variant="outline-dark"
                                    size="lg"
                                    className="d-flex align-items-center justify-content-between p-3 help-option-btn"
                                    onClick={handleCallSupport}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-dark bg-opacity-10 p-2 rounded-circle text-dark">
                                            <FaPhoneAlt size={20} />
                                        </div>
                                        <div className="text-start">
                                            <div className="fw-bold fs-6">Call Support</div>
                                            <div className="small text-muted">Available 9 AM - 9 PM</div>
                                        </div>
                                    </div>
                                    <FaChevronRight className="text-muted small" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            {/* Order Details Modal */}
            <Modal show={showDetails} onHide={() => setShowDetails(false)} centered scrollable className="details-modal">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold fs-5">Order Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2 pb-4">
                    {selectedOrder ? (
                        <div className="d-flex flex-column gap-4">
                            {/* Order ID & Date */}
                            <div className="bg-light p-3 rounded-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <div className="text-muted small text-uppercase fw-bold">Order ID</div>
                                        <div className="fw-bold">#{selectedOrder.id}</div>
                                    </div>
                                    <Badge bg={selectedOrder.statusColor}>{selectedOrder.status}</Badge>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <div className="text-muted small">Placed On</div>
                                        <div className="small fw-medium">{selectedOrder.date}, {selectedOrder.time}</div>
                                    </div>
                                    {selectedOrder.deliveredDate && (
                                        <div className="text-end">
                                            <div className="text-muted small">Delivered On</div>
                                            <div className="small fw-medium text-success">{selectedOrder.deliveredDate}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h6 className="fw-bold mb-3">Items in this order</h6>
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="d-flex gap-3 mb-3">
                                        <img src={item.image} alt={item.name} className="product-thumb-large" style={{ width: '60px', height: '60px' }} />
                                        <div>
                                            <div className="fw-bold small">{item.name}</div>
                                            <div className="text-muted small">Qty: {item.qty}</div>
                                            <div className="fw-bold small">{item.price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-0 text-muted opacity-25" />

                            {/* Vendor Details */}
                            <div>
                                <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                                    <FaStore className="text-muted" size={14} /> Sold By
                                </h6>
                                <div className="bg-white border rounded-3 p-3 small">
                                    <div className="fw-bold text-dark">{selectedOrder.vendor.name}</div>
                                    <div className="text-muted mt-1">{selectedOrder.vendor.address}</div>
                                    <div className="text-muted mt-1 d-flex align-items-center gap-1">
                                        <FaInfoCircle size={10} /> GSTIN: {selectedOrder.vendor.gst}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div>
                                <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                                    <FaMapMarkerAlt className="text-muted" size={14} /> Shipping Details
                                </h6>
                                <div className="bg-light p-3 rounded-3 small">
                                    <div className="fw-bold">{selectedOrder.address.name}</div>
                                    <div className="text-muted">{selectedOrder.address.line1}</div>
                                    <div className="text-muted">{selectedOrder.address.line2}</div>
                                    <div className="mt-1 fw-medium">{selectedOrder.address.phone}</div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div>
                                <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                                    {selectedOrder.payment.isOnline ? <FaCreditCard className="text-muted" size={14} /> : <FaMoneyBillWave className="text-muted" size={14} />}
                                    Payment Information
                                </h6>
                                <div className="bg-light p-3 rounded-3 small">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted">Payment Method</span>
                                        <span className="fw-bold">{selectedOrder.payment.method} {selectedOrder.payment.details && `(${selectedOrder.payment.details})`}</span>
                                    </div>

                                    {selectedOrder.payment.isOnline ? (
                                        <>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted">Status</span>
                                                <span className="fw-bold text-success d-flex align-items-center gap-1">
                                                    <FaCheckCircle size={12} /> {selectedOrder.payment.status}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="text-muted">Transaction ID</span>
                                                <span className="font-monospace text-dark">{selectedOrder.payment.transactionId}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-muted">Status</span>
                                            <span className="fw-bold text-warning">Pending (Pay on Delivery)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bill Details */}
                            <div>
                                <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                                    <FaReceipt className="text-muted" size={14} /> Bill Details
                                </h6>
                                <div className="border rounded-3 p-3 small">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Subtotal</span>
                                        <span>{selectedOrder.bill.subtotal}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Tax</span>
                                        <span>{selectedOrder.bill.tax}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Shipping</span>
                                        <span className="text-success">{selectedOrder.bill.shipping}</span>
                                    </div>
                                    {selectedOrder.bill.discount !== '₹0' && (
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Discount</span>
                                            <span className="text-success">{selectedOrder.bill.discount}</span>
                                        </div>
                                    )}
                                    <hr className="my-2" />
                                    <div className="d-flex justify-content-between fw-bold fs-6">
                                        <span>Total</span>
                                        <span>{selectedOrder.bill.total}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Invoice Button */}
                            <Button variant="outline-primary" className="w-100 d-flex align-items-center justify-content-center gap-2 py-2">
                                <FaFileInvoice /> Download Invoice
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Orders;
