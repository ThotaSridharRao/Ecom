import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Table, Form, InputGroup, Button, Badge, Modal, Row, Col, Pagination } from 'react-bootstrap';
import { FaSearch, FaEye, FaFileDownload, FaFilter, FaCalendarAlt, FaTimes, FaEdit } from 'react-icons/fa';

const SaleInvoiceList = () => {
    const navigate = useNavigate();

    // Mock Data Generator
    const generateMockInvoices = () => {
        const data = [];
        const statuses = ['Paid', 'Pending', 'Cancelled'];
        const modes = ['Cash', 'UPI', 'Card', 'Net Banking'];

        for (let i = 1; i <= 25; i++) {
            data.push({
                id: i,
                invoiceNumber: `INV-2023-${1000 + i}`,
                date: new Date(2023, 11, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
                customerName: `Customer ${i}`,
                mobile: `98765432${i < 10 ? '0' + i : i}`,
                itemsCount: Math.floor(Math.random() * 5) + 1,
                totalAmount: (Math.random() * 10000 + 500).toFixed(2),
                paymentMode: modes[Math.floor(Math.random() * modes.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)]
            });
        }
        return data.reverse(); // Newest first
    };

    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // View Modal
    const [showModal, setShowModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        // Load mock data + any real local data
        const mock = generateMockInvoices();


        // Load persist data from "allInvoices" array
        const localInvoices = JSON.parse(localStorage.getItem('allInvoices') || '[]');

        // Format and Sort (Newest First)
        let localFormatted = [];
        if (localInvoices.length > 0) {
            localFormatted = localInvoices.map((parsed, idx) => ({
                id: `local-${parsed.timestamp || Date.now()}-${idx}`,
                invoiceNumber: parsed.invoiceNumber,
                date: parsed.invoiceDate,
                customerName: parsed.customerName,
                mobile: parsed.mobileNumber,
                itemsCount: parsed.items ? parsed.items.length : 0,
                totalAmount: parsed.summary ? parsed.summary.grandTotal.toFixed(2) : '0.00',
                paymentMode: parsed.summary ? parsed.summary.paymentMode : 'Cash',
                status: 'Paid',
                details: parsed
            })).reverse();
        }

        // Merge: Real Invoices First, then Mock
        // We use spread to clearly put localFormatted items first.
        const combined = [...localFormatted, ...mock];

        setInvoices(combined);
        setFilteredInvoices(combined);
    }, []);

    // Filter Logic
    useEffect(() => {
        let results = invoices;

        if (searchTerm) {
            results = results.filter(inv =>
                inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.mobile.includes(searchTerm)
            );
        }

        if (dateFilter) {
            results = results.filter(inv => inv.date === dateFilter);
        }

        setFilteredInvoices(results);
        setCurrentPage(1); // Reset to page 1 on filter change
    }, [searchTerm, dateFilter, invoices]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

    const handleView = (invoice) => {
        setSelectedInvoice(invoice);
        setShowModal(true);
    };

    const handleEdit = (invoice) => {
        // If it's a mock invoice (id < 9999 or simply not containing "local-"), we can't really edit it persistently.
        // But for user experience, let's treat it as a "Copy to New Invoice" or just block it. 
        // Let's block it for now to avoid confusion.
        if (typeof invoice.id === 'string' && invoice.id.startsWith('local-')) {
            navigate('/admin/sales/create-invoice', { state: { invoiceToEdit: invoice.details || invoice } });
        } else {
            // It's mock data. 
            // We could allow "Copy" functionality but the request said "Edit". 
            // Ideally we shouldn't edit mock data.
            alert("Cannot edit mock data. Only locally created invoices can be edited.");
        }
    };

    return (
        <AdminLayout>
            <Container fluid className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-dark mb-0">Sale Invoice List</h3>
                    <Button variant="success" size="sm"><FaFileDownload className="me-2" />Export Excel</Button>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                        <Row className="g-3 align-items-end">
                            <Col md={4}>
                                <Form.Label className="small text-muted mb-1">Search</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white"><FaSearch className="text-muted" /></InputGroup.Text>
                                    <Form.Control
                                        placeholder="Invoice No, Customer Name, Mobile..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={3}>
                                <Form.Label className="small text-muted mb-1">Filter by Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                />
                            </Col>
                            <Col md={2}>
                                {dateFilter && (
                                    <Button variant="link" className="text-danger p-0 text-decoration-none" onClick={() => setDateFilter('')}>
                                        <FaTimes className="me-1" /> Clear Date
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Table */}
                <Card className="border-0 shadow-sm" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table hover className="mb-0 align-middle text-nowrap">
                                <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Invoice No</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Mobile</th>
                                        <th className="px-4 py-3 text-center">Items</th>
                                        <th className="px-4 py-3">Payment</th>
                                        <th className="px-4 py-3 text-end">Amount</th>
                                        <th className="px-4 py-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((inv) => (
                                            <tr key={inv.id}>
                                                <td className="px-4 fw-bold text-primary small">{inv.invoiceNumber}</td>
                                                <td className="px-4 small text-muted">{inv.date}</td>
                                                <td className="px-4 fw-bold">{inv.customerName}</td>
                                                <td className="px-4 small font-monospace">{inv.mobile}</td>
                                                <td className="px-4 text-center"><Badge bg="secondary" pill>{inv.itemsCount}</Badge></td>
                                                <td className="px-4 small">
                                                    <span className={`badge bg-light text-dark border`}>{inv.paymentMode}</span>
                                                </td>
                                                <td className="px-4 text-end fw-bold text-success">₹{inv.totalAmount}</td>
                                                <td className="px-4 text-center">
                                                    <Button variant="outline-primary" size="sm" className="rounded-circle p-2 me-1" onClick={() => handleView(inv)} title="View Details">
                                                        <FaEye />
                                                    </Button>
                                                    <Button variant="outline-secondary" size="sm" className="rounded-circle p-2" onClick={() => handleEdit(inv)} title="Edit Invoice">
                                                        <FaEdit />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-5 text-muted">
                                                No invoices found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <Card.Footer className="bg-white border-0 py-3">
                            <Pagination className="justify-content-center mb-0">
                                <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} />
                                {[...Array(totalPages)].map((_, idx) => (
                                    <Pagination.Item key={idx + 1} active={idx + 1 === currentPage} onClick={() => setCurrentPage(idx + 1)}>
                                        {idx + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} />
                            </Pagination>
                        </Card.Footer>
                    )}
                </Card>

                {/* Details Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Invoice Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        {selectedInvoice && (
                            <>
                                <div className="d-flex justify-content-between mb-4">
                                    <div>
                                        <h5 className="fw-bold text-primary mb-1">{selectedInvoice.invoiceNumber}</h5>
                                        <div className="text-muted small">{selectedInvoice.date}</div>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-bold">{selectedInvoice.customerName}</div>
                                        <div className="small text-muted">{selectedInvoice.mobile}</div>
                                    </div>
                                </div>

                                {selectedInvoice.details ? (
                                    // Use stored full details if available
                                    <div className="table-responsive border rounded mb-3">
                                        <Table size="sm" className="mb-0">
                                            <thead className="bg-light">
                                                <tr><th>Item</th><th className="text-end">Qty</th><th className="text-end">Price</th><th className="text-end">Total</th></tr>
                                            </thead>
                                            <tbody>
                                                {selectedInvoice.details.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>{item.name}</td>
                                                        <td className="text-end">{item.qty}</td>
                                                        <td className="text-end">₹{item.mrp}</td>
                                                        <td className="text-end">₹{((item.mrp * (1 - item.discountPercent / 100)) * item.qty).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="alert alert-info small">Item details not available for mock data.</div>
                                )}

                                <div className="d-flex justify-content-between align-items-center border-top pt-3">
                                    <span className="text-muted">Payment Mode: <strong>{selectedInvoice.paymentMode}</strong></span>
                                    <span className="fs-4 fw-bold text-success">Total: ₹{selectedInvoice.totalAmount}</span>
                                </div>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                        <Button variant="primary" onClick={() => setShowModal(false)}><FaFileDownload className="me-2" /> Download PDF</Button>
                    </Modal.Footer>
                </Modal>

            </Container>
        </AdminLayout>
    );
};

export default SaleInvoiceList;
