import React, { useState } from 'react';
import { Container, Button, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaHome, FaBriefcase, FaMapMarkerAlt, FaPlus, FaTrash, FaPen } from 'react-icons/fa';
import LocationPicker from '../components/LocationPicker';
import { useAddress } from '../context/AddressContext';
import './Addresses.css';

const Addresses = () => {
    const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddress();

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        type: 'Home',
        customType: '',
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        isDefault: false,
        lat: null,
        lng: null
    });

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            type: 'Home',
            customType: '',
            name: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            phone: '',
            isDefault: false,
            lat: null,
            lng: null
        });
    };

    const handleShow = (address = null) => {
        if (address) {
            setEditingId(address.id);
            setFormData({
                ...address,
                customType: address.type !== 'Home' && address.type !== 'Work' ? address.type : ''
            });
        } else {
            setEditingId(null);
            resetForm();
        }
        setShowModal(true);
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleLocationSelect = async (latlng) => {
        setFormData(prev => ({ ...prev, lat: latlng.lat, lng: latlng.lng }));

        // Reverse Geocoding
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`);
            const data = await response.json();
            if (data && data.address) {
                const { road, suburb, city, state, postcode } = data.address;
                setFormData(prev => ({
                    ...prev,
                    address: [road, suburb].filter(Boolean).join(', ') || prev.address,
                    city: city || prev.city,
                    state: state || prev.state,
                    pincode: postcode || prev.pincode,
                    lat: latlng.lat,
                    lng: latlng.lng
                }));
            }
        } catch (error) {
            console.error("Error fetching address:", error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const finalType = formData.type === 'Other' && formData.customType
            ? formData.customType
            : formData.type;

        const addressToSave = {
            ...formData,
            type: finalType
        };
        delete addressToSave.customType;

        if (editingId) {
            updateAddress(editingId, addressToSave);
        } else {
            addAddress(addressToSave);
        }
        handleClose();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            deleteAddress(id);
        }
    };

    const handleSetDefault = (id) => {
        setDefaultAddress(id);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Home': return <FaHome />;
            case 'Work': return <FaBriefcase />;
            default: return <FaMapMarkerAlt />;
        }
    };

    return (
        <Container className="py-5" style={{ maxWidth: '800px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Saved Addresses</h3>
                    <p className="text-muted small mb-0">Manage your delivery locations</p>
                </div>
                <Button variant="dark" size="sm" className="d-flex align-items-center px-3 rounded-pill" onClick={() => handleShow()}>
                    <FaPlus className="me-2" size={12} /> Add New
                </Button>
            </div>

            <div className="d-flex flex-column gap-3">
                {addresses.map(addr => (
                    <div key={addr.id} className={`address-list-item p-3 ${addr.isDefault ? 'default-address' : ''}`}>
                        <div className="d-flex align-items-start">
                            <div className="address-icon-wrapper me-3">
                                {getIcon(addr.type)}
                            </div>
                            <div className="flex-grow-1">
                                <div className="d-flex align-items-center mb-1">
                                    <span className="fw-bold me-2">{addr.type}</span>
                                    {addr.isDefault && <Badge bg="primary" className="rounded-pill" style={{ fontSize: '0.65rem' }}>Default</Badge>}
                                </div>
                                <div className="address-details text-secondary mb-1">
                                    <span className="fw-medium text-dark">{addr.name}</span> • {addr.phone}
                                </div>
                                <div className="address-details text-muted">
                                    {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                                </div>
                            </div>
                            <div className="action-btn-group d-flex flex-column align-items-end gap-2 ms-3">
                                <div className="d-flex gap-1">
                                    <Button variant="link" className="btn-icon" onClick={() => handleShow(addr)} title="Edit">
                                        <FaPen size={14} />
                                    </Button>
                                    {!addr.isDefault && (
                                        <Button variant="link" className="btn-icon delete" onClick={() => handleDelete(addr.id)} title="Delete">
                                            <FaTrash size={14} />
                                        </Button>
                                    )}
                                </div>
                                {!addr.isDefault && (
                                    <Button
                                        variant="link"
                                        className="text-decoration-none p-0 small fw-medium"
                                        style={{ fontSize: '0.75rem' }}
                                        onClick={() => handleSetDefault(addr.id)}
                                    >
                                        Set Default
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleClose} centered backdrop="static" size="xl" className="address-modal">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">{editingId ? 'Edit Address' : 'Add New Address'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <Row className="g-0 h-100">
                        {/* Map Section */}
                        <Col lg={6} className="p-0 position-relative" style={{ minHeight: '400px' }}>
                            <LocationPicker
                                initialLat={formData.lat}
                                initialLng={formData.lng}
                                onLocationSelect={handleLocationSelect}
                            />
                        </Col>

                        {/* Form Section */}
                        <Col lg={6} className="p-4 overflow-auto" style={{ maxHeight: '80vh' }}>
                            <Form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <h6 className="fw-bold mb-3">Address Type</h6>
                                    <div className="d-flex gap-3 align-items-center flex-wrap">
                                        {['Home', 'Work', 'Other'].map(type => (
                                            <Form.Check
                                                key={type}
                                                type="radio"
                                                id={`type-${type}`}
                                                name="type"
                                                label={type}
                                                value={type}
                                                checked={formData.type === type}
                                                onChange={handleChange}
                                                className="custom-radio"
                                            />
                                        ))}
                                        {formData.type === 'Other' && (
                                            <Form.Control
                                                type="text"
                                                name="customType"
                                                placeholder="e.g. Hotel, Gym"
                                                value={formData.customType}
                                                onChange={handleChange}
                                                size="sm"
                                                style={{ width: '150px' }}
                                                required
                                            />
                                        )}
                                    </div>
                                </div>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Full Name *</Form.Label>
                                            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Phone Number *</Form.Label>
                                            <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted">Address (House No, Building, Street) *</Form.Label>
                                    <Form.Control as="textarea" rows={3} name="address" value={formData.address} onChange={handleChange} required placeholder="Flat, House no., Building, Company, Apartment" />
                                </Form.Group>

                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">City *</Form.Label>
                                            <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">State *</Form.Label>
                                            <Form.Control type="text" name="state" value={formData.state} onChange={handleChange} required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Pincode *</Form.Label>
                                            <Form.Control type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4 mt-2">
                                    <Form.Check
                                        type="checkbox"
                                        id="isDefault"
                                        name="isDefault"
                                        label="Make this my default address"
                                        checked={formData.isDefault}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button variant="dark" type="submit" size="lg">
                                        {editingId ? 'Update Address' : 'Save Address'}
                                    </Button>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Addresses;
