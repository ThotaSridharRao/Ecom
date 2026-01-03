import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Container, Card, Table, Button, Modal, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { useToast } from '../context/ToastContext';
import { FaTruck, FaSearch, FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa';

const VendorMaster = () => {
    const { showToast } = useToast();
    const [vendors, setVendors] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '', // Vendor Name / Company Name
        contactPerson: '',
        mobile: '',
        address: '',
        gstin: ''
    });

    useEffect(() => {
        loadVendors();
    }, []);

    useEffect(() => {
        filterData();
    }, [searchTerm, vendors]);

    const loadVendors = () => {
        let stored = JSON.parse(localStorage.getItem('allVendors') || '[]');

        // Auto-Migration from Purchases
        if (stored.length === 0) {
            const allPurchases = JSON.parse(localStorage.getItem('allPurchases') || '[]');
            const unique = {};

            allPurchases.forEach(pur => {
                const mobile = pur.contactNumber;
                let key = mobile;
                if (!key) key = pur.vendorName; // Fallback key if no mobile

                if (key && !unique[key]) {
                    unique[key] = {
                        id: `VEND-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        name: pur.vendorName,
                        contactPerson: '',
                        mobile: pur.contactNumber || '',
                        address: '',
                        gstin: ''
                    };
                }
            });

            stored = Object.values(unique);
            if (stored.length > 0) {
                localStorage.setItem('allVendors', JSON.stringify(stored));
                showToast(`Imported ${stored.length} vendors from purchase history`, 'info');
            }
        }

        setVendors(stored.reverse());
    };

    const filterData = () => {
        if (!searchTerm.trim()) {
            setFilteredData(vendors);
            return;
        }
        const lower = searchTerm.toLowerCase();
        const filtered = vendors.filter(v =>
            v.name.toLowerCase().includes(lower) ||
            v.mobile.includes(lower)
        );
        setFilteredData(filtered);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.name) {
            showToast('Vendor Name is required', 'error');
            return;
        }

        const newVendors = [...vendors];

        if (isEditing) {
            const index = newVendors.findIndex(v => v.id === formData.id);
            if (index > -1) {
                newVendors[index] = formData;
                showToast('Vendor updated', 'success');
            }
        } else {
            // Check duplicate mobile if mobile provided
            if (formData.mobile && newVendors.some(v => v.mobile === formData.mobile)) {
                showToast('Vendor with this mobile already exists', 'error');
                return;
            }
            const newVend = { ...formData, id: `VEND-${Date.now()}` };
            newVendors.unshift(newVend);
            showToast('Vendor added', 'success');
        }

        setVendors(newVendors);
        localStorage.setItem('allVendors', JSON.stringify(newVendors));
        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            const updated = vendors.filter(v => v.id !== id);
            setVendors(updated);
            localStorage.setItem('allVendors', JSON.stringify(updated));
            showToast('Vendor deleted', 'success');
        }
    };

    const openModal = (vend = null) => {
        if (vend) {
            setFormData(vend);
            setIsEditing(true);
        } else {
            setFormData({
                id: '', name: '', contactPerson: '', mobile: '', address: '', gstin: ''
            });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ id: '', name: '', contactPerson: '', mobile: '', address: '', gstin: '' });
    };

    return (
        <AdminLayout>
            <Container fluid className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-dark mb-0">Vendor Master</h3>
                    <Button variant="primary" onClick={() => openModal()}>
                        <FaPlus className="me-2" /> Add Vendor
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
                                        <th className="px-4 py-3">Vendor Name</th>
                                        <th className="px-4 py-3">Details</th>
                                        <th className="px-4 py-3">Address</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? (
                                        filteredData.map(vend => (
                                            <tr key={vend.id}>
                                                <td className="px-4">
                                                    <div className="fw-bold">{vend.name}</div>
                                                    {vend.contactPerson && <small className="text-muted">Contact: {vend.contactPerson}</small>}
                                                </td>
                                                <td className="px-4 small text-muted">
                                                    <div><span className="text-dark fw-bold">P:</span> {vend.mobile || 'N/A'}</div>
                                                    {vend.gstin && <div><span className="text-dark fw-bold">GST:</span> {vend.gstin}</div>}
                                                </td>
                                                <td className="px-4 small text-muted">
                                                    {vend.address || '-'}
                                                </td>
                                                <td className="px-4 text-center">
                                                    <Button variant="link" className="text-primary me-2" onClick={() => openModal(vend)}><FaEdit /></Button>
                                                    <Button variant="link" className="text-danger" onClick={() => handleDelete(vend.id)}><FaTrash /></Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-5 text-muted">No vendors found.</td>
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
                        <Modal.Title>{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSave}>
                            <Form.Group className="mb-3">
                                <Form.Label>Vendor Name *</Form.Label>
                                <Form.Control
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Company or Vendor Name"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Contact Person</Form.Label>
                                <Form.Control
                                    value={formData.contactPerson}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                    placeholder="Sales Rep Name"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Mobile Number</Form.Label>
                                <Form.Control
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    placeholder="Enter mobile"
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
                                    <FaSave className="me-2" /> {isEditing ? 'Update Vendor' : 'Save Vendor'}
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
        </AdminLayout>
    );
};

export default VendorMaster;
