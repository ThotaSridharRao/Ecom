import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Container, Card, Table, Button, Modal, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { useToast } from '../context/ToastContext';
import { FaUserFriends, FaSearch, FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa';

const CustomerMaster = () => {
    const { showToast } = useToast();
    const [customers, setCustomers] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        mobile: '',
        email: '',
        address: '',
        gstin: ''
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        filterData();
    }, [searchTerm, customers]);

    const loadCustomers = () => {
        let stored = JSON.parse(localStorage.getItem('allCustomers') || '[]');

        // Auto-Migration: If empty, try to populate from Invoices
        if (stored.length === 0) {
            const allInvoices = JSON.parse(localStorage.getItem('allInvoices') || '[]');
            const unique = {};

            allInvoices.forEach(inv => {
                const mobile = inv.mobileNumber;
                if (mobile && mobile.length >= 10 && !unique[mobile]) {
                    unique[mobile] = {
                        id: `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        name: inv.customerName,
                        mobile: mobile,
                        email: '',
                        address: '',
                        gstin: ''
                    };
                }
            });

            stored = Object.values(unique);
            if (stored.length > 0) {
                localStorage.setItem('allCustomers', JSON.stringify(stored));
                showToast(`Imported ${stored.length} customers from invoice history`, 'info');
            }
        }

        setCustomers(stored.reverse()); // Newest first
    };

    const filterData = () => {
        if (!searchTerm.trim()) {
            setFilteredData(customers);
            return;
        }
        const lower = searchTerm.toLowerCase();
        const filtered = customers.filter(c =>
            c.name.toLowerCase().includes(lower) ||
            c.mobile.includes(lower)
        );
        setFilteredData(filtered);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.mobile) {
            showToast('Name and Mobile are required', 'error');
            return;
        }

        const newCustomers = [...customers];

        if (isEditing) {
            const index = newCustomers.findIndex(c => c.id === formData.id);
            if (index > -1) {
                newCustomers[index] = formData;
                showToast('Customer updated', 'success');
            }
        } else {
            // Check duplicate mobile
            if (newCustomers.some(c => c.mobile === formData.mobile)) {
                showToast('Customer with this mobile already exists', 'error');
                return;
            }
            const newCust = { ...formData, id: `CUST-${Date.now()}` };
            newCustomers.unshift(newCust); // Add to top
            showToast('Customer added', 'success');
        }

        setCustomers(newCustomers);
        localStorage.setItem('allCustomers', JSON.stringify(newCustomers));
        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            const updated = customers.filter(c => c.id !== id);
            setCustomers(updated);
            localStorage.setItem('allCustomers', JSON.stringify(updated));
            showToast('Customer deleted', 'success');
        }
    };

    const openModal = (cust = null) => {
        if (cust) {
            setFormData(cust);
            setIsEditing(true);
        } else {
            setFormData({
                id: '', name: '', mobile: '', email: '', address: '', gstin: ''
            });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ id: '', name: '', mobile: '', email: '', address: '', gstin: '' });
    };

    return (
        <AdminLayout>
            <Container fluid className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-dark mb-0">Customer Master</h3>
                    <Button variant="primary" onClick={() => openModal()}>
                        <FaPlus className="me-2" /> Add Customer
                    </Button>
                </div>

                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                        <InputGroup>
                            <InputGroup.Text className="bg-white border-end-0"><FaSearch className="text-muted" /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search by Name or Mobile..."
                                className="border-start-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table hover className="mb-0 align-middle">
                                <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Mobile</th>
                                        <th className="px-4 py-3">Details</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? (
                                        filteredData.map(cust => (
                                            <tr key={cust.id}>
                                                <td className="px-4 fw-bold">{cust.name}</td>
                                                <td className="px-4 text-primary">{cust.mobile}</td>
                                                <td className="px-4 small text-muted">
                                                    {cust.gstin && <div>GST: {cust.gstin}</div>}
                                                    {cust.address && <div>Addr: {cust.address}</div>}
                                                </td>
                                                <td className="px-4 text-center">
                                                    <Button variant="link" className="text-primary me-2" onClick={() => openModal(cust)}><FaEdit /></Button>
                                                    <Button variant="link" className="text-danger" onClick={() => handleDelete(cust.id)}><FaTrash /></Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-5 text-muted">No customers found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>

                {/* Add/Edit Modal */}
                <Modal show={showModal} onHide={handleCloseModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{isEditing ? 'Edit Customer' : 'Add New Customer'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSave}>
                            <Form.Group className="mb-3">
                                <Form.Label>Customer Name *</Form.Label>
                                <Form.Control
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter full name"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Mobile Number *</Form.Label>
                                <Form.Control
                                    required
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    placeholder="Enter 10-digit mobile"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Optional"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>GSTIN</Form.Label>
                                <Form.Control
                                    value={formData.gstin}
                                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                                    placeholder="Optional"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Optional"
                                />
                            </Form.Group>
                            <div className="d-grid">
                                <Button variant="primary" type="submit">
                                    <FaSave className="me-2" /> {isEditing ? 'Update Customer' : 'Save Customer'}
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
        </AdminLayout>
    );
};

export default CustomerMaster;
