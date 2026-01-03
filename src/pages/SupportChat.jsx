import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Button, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaArrowLeft, FaHeadset, FaUser } from 'react-icons/fa';

const SupportChat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const order = location.state?.order;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Initial System Messages
        const initialMessages = [
            { id: 1, text: "Connecting you to a support agent...", sender: 'system', timestamp: new Date() },
        ];
        setMessages(initialMessages);

        // Simulate Agent Connection
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: 2,
                text: "You are now connected with Priya from Customer Support.",
                sender: 'system',
                timestamp: new Date()
            }]);

            // Agent acknowledges order
            setTimeout(() => {
                const orderText = order
                    ? `Hello! I see you have a query regarding Order #${order.id} for ${order.items[0].name}. How can I assist you today?`
                    : "Hello! How can I assist you today?";

                setMessages(prev => [...prev, {
                    id: 3,
                    text: orderText,
                    sender: 'agent',
                    timestamp: new Date()
                }]);
            }, 1000);
        }, 1500);
    }, [order]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const userMsg = {
            id: Date.now(),
            text: newMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setNewMessage('');

        // Simulate Agent Reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Thank you for providing those details. Let me check that for you right away.",
                sender: 'agent',
                timestamp: new Date()
            }]);
        }, 2000);
    };

    return (
        <Container className="py-3 h-100 d-flex flex-column" style={{ maxWidth: '600px', height: '90vh' }}>
            {/* Header */}
            <div className="d-flex align-items-center mb-3 bg-white p-3 rounded-3 shadow-sm border">
                <Button variant="link" className="text-dark p-0 me-3" onClick={() => navigate(-1)}>
                    <FaArrowLeft />
                </Button>
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary">
                        <FaHeadset size={20} />
                    </div>
                    <div>
                        <h6 className="fw-bold mb-0">Customer Support</h6>
                        <small className="text-success d-flex align-items-center gap-1">
                            <span className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></span> Online
                        </small>
                    </div>
                </div>
            </div>

            {/* Order Context Card */}
            {order && (
                <Card className="mb-3 border-0 shadow-sm bg-light">
                    <Card.Body className="p-2 d-flex align-items-center gap-3">
                        <img src={order.items[0].image} alt="Product" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div className="flex-grow-1 overflow-hidden">
                            <div className="small fw-bold text-truncate">Order #{order.id}</div>
                            <div className="small text-muted text-truncate">{order.items[0].name}</div>
                        </div>
                        <Badge bg={order.statusColor}>{order.status}</Badge>
                    </Card.Body>
                </Card>
            )}

            {/* Chat Area */}
            <div className="flex-grow-1 overflow-auto p-3 bg-white rounded-3 shadow-sm border mb-3 d-flex flex-column gap-3" style={{ minHeight: '0' }}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div
                            className={`p-3 rounded-3 ${msg.sender === 'user'
                                ? 'bg-primary text-white'
                                : msg.sender === 'system'
                                    ? 'bg-light text-muted small text-center w-100 fst-italic'
                                    : 'bg-light text-dark'
                                }`}
                            style={{ maxWidth: msg.sender === 'system' ? '100%' : '80%' }}
                        >
                            {msg.text}
                            {msg.sender !== 'system' && (
                                <div className={`text-end mt-1 ${msg.sender === 'user' ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.7rem' }}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <Form onSubmit={handleSendMessage} className="d-flex gap-2">
                <Form.Control
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="rounded-pill shadow-sm border-0 bg-light px-4"
                />
                <Button type="submit" variant="primary" className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '46px', height: '46px' }}>
                    <FaPaperPlane />
                </Button>
            </Form>
        </Container>
    );
};

export default SupportChat;
