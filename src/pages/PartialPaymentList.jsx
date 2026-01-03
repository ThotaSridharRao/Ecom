import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Container, Card, Table, Form, InputGroup, Button, Badge, Row, Col, Pagination } from 'react-bootstrap';
import { FaSearch, FaCalendarAlt, FaHistory, FaArrowDown, FaArrowUp } from 'react-icons/fa';

const PartialPaymentList = () => { // "Payment History"
    const [transactions, setTransactions] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        // 1. Get Manual Payments (Credits)
        const allPayments = JSON.parse(localStorage.getItem('allPayments') || '[]');
        const paymentLogs = allPayments.map(p => ({
            id: p.id,
            date: p.date,
            timestamp: p.timestamp,
            customerName: p.customerName,
            mobile: p.mobileNumber,
            amount: p.amount,
            type: 'Credit', // Payment Received
            description: p.note || 'Payment Received',
            source: 'Manual'
        }));

        // 2. Get Invoice Down Payments (Credits) ?
        // Actually, if we want a full "Transaction History", we should show Invoices as Debits too?
        // User asked for "Previous Payment List" -> which usually means the LOG of payments received.
        // Let's stick to "Payments Received" for now to keep it clean, as "Invoice List" already exists for Debits.
        // However, showing Invoice Creation as a Debit here makes it a true "Ledger Statement".
        // Let's do a MIXED view if possible?
        // No, let's keep this as "Payment History" (Cash Flow IN) as per the likely user intent for this specific page.
        // It complements "Sale Invoice List" (Sales).

        // Let's also include the "Amount Paid" part from Invoices as "Payment Received"
        const allInvoices = JSON.parse(localStorage.getItem('allInvoices') || '[]');
        const invoicePayments = allInvoices
            .filter(inv => inv.summary && inv.summary.amountPaid > 0)
            .map(inv => ({
                id: `INV-PAY-${inv.invoiceNumber}`,
                date: inv.invoiceDate,
                timestamp: inv.timestamp || Date.now(), // might be inaccurate if not saved
                customerName: inv.customerName,
                mobile: inv.mobileNumber,
                amount: inv.summary.amountPaid,
                type: 'Credit',
                description: `Payment for Invoice #${inv.invoiceNumber}`,
                source: 'Invoice'
            }));

        const combined = [...paymentLogs, ...invoicePayments];

        // Sort Newest First
        combined.sort((a, b) => b.timestamp - a.timestamp);

        setTransactions(combined);
        setFilteredData(combined);
    };

    // Filter Logic
    useEffect(() => {
        let results = transactions;

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            results = results.filter(t =>
                t.customerName.toLowerCase().includes(lower) ||
                t.mobile.includes(lower) ||
                t.description.toLowerCase().includes(lower)
            );
        }

        if (dateFilter) {
            results = results.filter(t => t.date === dateFilter);
        }

        setFilteredData(results);
        setCurrentPage(1);
    }, [searchTerm, dateFilter, transactions]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <AdminLayout>
            <Container fluid className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-dark mb-0">Payment History</h3>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={5}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white border-end-0"><FaSearch className="text-muted" /></InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search Customer..."
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

                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table hover className="mb-0 align-middle">
                                <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3">Source</th>
                                        <th className="px-4 py-3 text-end">Amount Received</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((trn, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 text-muted small">{trn.date}</td>
                                                <td className="px-4">
                                                    <div className="fw-bold text-dark">{trn.customerName}</div>
                                                    <small className="text-muted">{trn.mobile}</small>
                                                </td>
                                                <td className="px-4 text-muted">{trn.description}</td>
                                                <td className="px-4">
                                                    <Badge bg={trn.source === 'Manual' ? 'primary' : 'secondary'} className="rounded-pill fw-normal">
                                                        {trn.source}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 text-end fw-bold text-success">
                                                    + ₹{parseFloat(trn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted">No payment records found.</td>
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

export default PartialPaymentList;
