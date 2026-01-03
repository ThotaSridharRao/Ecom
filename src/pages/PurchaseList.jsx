import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Table, Form, InputGroup, Button, Badge, Row, Col, Pagination } from 'react-bootstrap';
import { FaSearch, FaEye, FaFilter, FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa';

const PurchaseList = () => {
    const navigate = useNavigate();

    const [purchases, setPurchases] = useState([]);
    const [filteredPurchases, setFilteredPurchases] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        // Load persist data from "allPurchases" array
        const localPurchases = JSON.parse(localStorage.getItem('allPurchases') || '[]');

        // Format and Sort (Newest First)
        let formatted = localPurchases.map((parsed, idx) => ({
            id: `pur-${parsed.timestamp || Date.now()}-${idx}`,
            purchaseNumber: parsed.purchaseNumber,
            date: parsed.purchaseDate,
            vendorName: parsed.vendorName,
            contactNumber: parsed.contactNumber,
            itemsCount: parsed.items ? parsed.items.length : 0,
            totalAmount: parsed.summary ? parsed.summary.grandTotal.toFixed(2) : '0.00',
            amountPaid: parsed.summary && parsed.summary.amountPaid !== undefined ? parsed.summary.amountPaid : (parsed.summary?.grandTotal || 0),
            status: parsed.summary ? (parsed.summary.status || 'Paid') : 'Paid',
            details: parsed
        })).reverse();

        setPurchases(formatted);
        setFilteredPurchases(formatted);
    }, []);

    // Filter Logic
    useEffect(() => {
        let results = purchases;

        if (searchTerm) {
            results = results.filter(p =>
                p.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.contactNumber.includes(searchTerm)
            );
        }

        if (dateFilter) {
            results = results.filter(p => p.date === dateFilter);
        }

        setFilteredPurchases(results);
        setCurrentPage(1);
    }, [searchTerm, dateFilter, purchases]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

    const handleEdit = (purchase) => {
        // Navigate to CreatePurchase with data
        navigate('/admin/purchase/create', { state: { purchaseToEdit: purchase.details } });
    };

    const handleDelete = (purchaseId) => {
        if (window.confirm('Are you sure you want to delete this purchase?')) {
            const updated = purchases.filter(p => p.id !== purchaseId);
            setPurchases(updated);

            // Sync with LocalStorage
            // Need to map back to original structure or just filter existing storage
            const remaining = updated.map(u => u.details);
            // Wait, standard delete requires unique ID mapping.
            // Our ID is generated on fly. We should match by timestamp/Number.
            // Let's reload pure From Storage to be safe.
            const allPurchases = JSON.parse(localStorage.getItem('allPurchases') || '[]');
            // Find one to delete
            // `purchaseId` is derived `pur-{timestamp}-{idx}`. Not robust for deleting from raw array.
            // Better to match by invoiceNumber

            // However, purchaseNumber is unique enough?
            // Let's rely on purchaseNumber.

            const targetNumber = purchases.find(p => p.id === purchaseId)?.purchaseNumber;
            if (targetNumber) {
                const newStorage = allPurchases.filter(p => p.purchaseNumber !== targetNumber);
                localStorage.setItem('allPurchases', JSON.stringify(newStorage));
                setPurchases(prev => prev.filter(p => p.id !== purchaseId));
                // Trigger re-filter
                // (useEffect logic might conflict if we don't update `purchases` state correctly)
                // Actually `setPurchases` above does it, but subsequent filter effect runs.
            }
        }
    };

    return (
        <AdminLayout>
            <Container fluid className="p-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                    <h3 className="fw-bold text-dark mb-0">Purchase Orders</h3>
                    <Button variant="primary" onClick={() => navigate('/admin/purchase/create')}>
                        + Create Purchase
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={5}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white border-end-0"><FaSearch className="text-muted" /></InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search Vendor, PO Number..."
                                        className="border-start-0"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={3}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white border-end-0"><FaCalendarAlt className="text-muted" /></InputGroup.Text>
                                    <Form.Control
                                        type="date"
                                        className="border-start-0"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={2}>
                                <Button variant="outline-secondary" className="w-100" onClick={() => { setSearchTerm(''); setDateFilter(''); }}>
                                    Clear
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Table */}
                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table hover className="mb-0 align-middle text-nowrap">
                                <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="px-4 py-3">PO No</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Vendor</th>
                                        <th className="px-4 py-3 text-center">Items</th>
                                        <th className="px-4 py-3 text-end">Total</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((purchase) => (
                                            <tr key={purchase.id}>
                                                <td className="px-4 fw-bold text-primary">{purchase.purchaseNumber}</td>
                                                <td className="px-4 text-muted small">{purchase.date}</td>
                                                <td className="px-4">
                                                    <div className="fw-bold text-dark">{purchase.vendorName}</div>
                                                    <small className="text-muted">{purchase.contactNumber}</small>
                                                </td>
                                                <td className="px-4 text-center">{purchase.itemsCount}</td>
                                                <td className="px-4 text-end fw-bold">₹{purchase.totalAmount}</td>
                                                <td className="px-4 text-center">
                                                    <Badge bg={purchase.status === 'Paid' ? 'success' : purchase.status === 'Partial' ? 'warning' : 'danger'} pill>
                                                        {purchase.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 text-center">
                                                    <Button variant="link" className="text-primary p-0 me-3" title="Edit" onClick={() => handleEdit(purchase)}>
                                                        <FaEdit />
                                                    </Button>
                                                    <Button variant="link" className="text-danger p-0" title="Delete" onClick={() => handleDelete(purchase.id)}>
                                                        <FaTrash />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-muted">
                                                No purchases found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                    {totalPages > 1 && (
                        <Card.Footer className="bg-white border-0 py-3 d-flex justify-content-center">
                            <Pagination>
                                <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} />
                                {[...Array(totalPages)].map((_, i) => (
                                    <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                                        {i + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} />
                            </Pagination>
                        </Card.Footer>
                    )}
                </Card>
            </Container>
        </AdminLayout>
    );
};

export default PurchaseList;
