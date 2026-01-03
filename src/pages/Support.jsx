import React, { useState } from 'react';
import { Container, Card, Button, Badge, Tab, Tabs, Row, Col, Modal } from 'react-bootstrap';
import { FaHeadset, FaPlus, FaPhoneAlt, FaComments, FaChevronRight, FaTicketAlt, FaHistory, FaCheckCircle, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Support = () => {
    const navigate = useNavigate();
    const [key, setKey] = useState('active');

    // Mock Data for Tickets
    const activeTickets = [
        {
            id: 'TKT-2023-901',
            subject: 'Order #ORD-2023-003 Not Delivered',
            status: 'Open',
            statusColor: 'primary',
            lastUpdate: '2 mins ago',
            type: 'Order Issue'
        },
        {
            id: 'TKT-2023-902',
            subject: 'Refund Status for #ORD-2023-001',
            status: 'In Progress',
            statusColor: 'warning',
            lastUpdate: '1 hour ago',
            type: 'Payment'
        }
    ];

    const pastTickets = [
        {
            id: 'TKT-2023-850',
            subject: 'Wrong Item Received',
            status: 'Resolved',
            statusColor: 'success',
            lastUpdate: 'Dec 01, 2023',
            type: 'Return/Exchange'
        },
        {
            id: 'TKT-2023-810',
            subject: 'Address Change Request',
            status: 'Closed',
            statusColor: 'secondary',
            lastUpdate: 'Nov 28, 2023',
            type: 'Account'
        }
    ];

    const handleNewTicket = () => {
        // For now, let's just navigate to the chat as a "New Ticket" flow
        navigate('/support-chat');
    };

    const handleCallSupport = () => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
        const supportNumber = "1800-123-4567";

        if (isMobile) {
            window.location.href = `tel:18001234567`;
        } else {
            alert(`Please call our support team at: ${supportNumber}\nAvailable 9 AM - 9 PM`);
        }
    };

    const TicketCard = ({ ticket }) => (
        <Card className="mb-3 border-0 shadow-sm hover-card">
            <Card.Body className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <div className={`p-3 rounded-circle bg-${ticket.statusColor} bg-opacity-10 text-${ticket.statusColor}`}>
                        <FaTicketAlt />
                    </div>
                    <div>
                        <h6 className="fw-bold mb-1">{ticket.subject}</h6>
                        <div className="d-flex align-items-center gap-2 small text-muted">
                            <Badge bg={ticket.statusColor} className="fw-normal">{ticket.status}</Badge>
                            <span>•</span>
                            <span>{ticket.id}</span>
                            <span>•</span>
                            <span>{ticket.lastUpdate}</span>
                        </div>
                    </div>
                </div>
                <Button variant="light" className="rounded-circle p-2" onClick={() => navigate('/support-chat', { state: { ticketId: ticket.id } })}>
                    <FaChevronRight className="text-muted" />
                </Button>
            </Card.Body>
        </Card>
    );

    return (
        <Container className="py-4" style={{ maxWidth: '800px' }}>
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Customer Support</h4>
                    <p className="text-muted small mb-0">Track your tickets and connect with our team.</p>
                </div>
                <Button variant="primary" className="d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm" onClick={handleNewTicket}>
                    <FaPlus size={12} /> New Ticket
                </Button>
            </div>

            {/* Quick Actions */}
            <Row className="g-3 mb-5">
                <Col xs={6}>
                    <div
                        className="p-3 bg-white border rounded-3 shadow-sm d-flex align-items-center gap-3 cursor-pointer h-100"
                        onClick={handleNewTicket}
                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                            <FaComments size={24} />
                        </div>
                        <div>
                            <div className="fw-bold">Chat with Us</div>
                            <div className="small text-muted">Start a live chat</div>
                        </div>
                    </div>
                </Col>
                <Col xs={6}>
                    <div
                        className="p-3 bg-white border rounded-3 shadow-sm d-flex align-items-center gap-3 cursor-pointer h-100"
                        onClick={handleCallSupport}
                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                            <FaPhoneAlt size={24} />
                        </div>
                        <div>
                            <div className="fw-bold">Call Us</div>
                            <div className="small text-muted">1800-123-4567</div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Tickets Section */}
            <h5 className="fw-bold mb-3">Your Tickets</h5>
            <Tabs
                id="support-tabs"
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="mb-4 border-bottom-0"
            >
                <Tab eventKey="active" title={<span className="d-flex align-items-center gap-2"><FaClock /> Active ({activeTickets.length})</span>}>
                    {activeTickets.length > 0 ? (
                        activeTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <FaCheckCircle size={40} className="mb-3 text-success opacity-50" />
                            <p>No active tickets. You're all good!</p>
                        </div>
                    )}
                </Tab>
                <Tab eventKey="past" title={<span className="d-flex align-items-center gap-2"><FaHistory /> Past ({pastTickets.length})</span>}>
                    {pastTickets.length > 0 ? (
                        pastTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <p>No past tickets found.</p>
                        </div>
                    )}
                </Tab>
            </Tabs>
        </Container>
    );
};

export default Support;
