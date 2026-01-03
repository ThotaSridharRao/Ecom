import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card, Image, Alert } from 'react-bootstrap';
import { FaCamera } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        image: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                image: user.image || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setShowSuccess(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateUser(formData);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <Container className="py-5">
            <h2 className="mb-4 fw-bold">My Profile</h2>
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <div className="position-relative d-inline-block">
                                    <Image
                                        src={formData.image || "https://via.placeholder.com/150"}
                                        roundedCircle
                                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                        className="border border-3 border-white shadow-sm"
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                    />
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="position-absolute bottom-0 end-0 rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                        style={{ width: '35px', height: '35px', padding: 0 }}
                                        onClick={handleImageClick}
                                    >
                                        <FaCamera className="text-white" />
                                    </Button>
                                </div>
                                <h4 className="mt-3 fw-bold">{user?.name}</h4>
                                <p className="text-muted">{user?.email}</p>
                            </div>

                            {showSuccess && (
                                <Alert variant="success" className="text-center py-2">
                                    Profile updated successfully!
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={true}
                                    />
                                    <Form.Text className="text-muted">
                                        Email cannot be changed.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                    />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button variant="primary" type="submit" size="lg">
                                        Save Changes
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;
