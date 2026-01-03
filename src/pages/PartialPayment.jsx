import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Container, Card, Table, Button, Modal, Form, InputGroup, Badge, Row, Col } from 'react-bootstrap';
import { useToast } from '../context/ToastContext';
import { FaMoneyBillWave, FaSearch, FaHistory, FaUser, FaArrowLeft } from 'react-icons/fa';

const PartialPayment = () => { // "Customer Ledger"
    const { showToast } = useToast();

    // Main Data
    const [ledgerData, setLedgerData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // View Mode: 'list' or 'details'
    const [viewMode, setViewMode] = useState('list');
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [customerInvoices, setCustomerInvoices] = useState([]);

    // Payment Modal State
    const [showPayModal, setShowPayModal] = useState(false);
    const [amountToPay, setAmountToPay] = useState('');
    const [paymentNote, setPaymentNote] = useState('');

    useEffect(() => {
        calculateLedger();
    }, []);

    useEffect(() => {
        filterData();
    }, [searchTerm, ledgerData]);

    // Recalculate Ledger (Process ALL invoices and payments)
    const calculateLedger = () => {
        const allInvoices = JSON.parse(localStorage.getItem('allInvoices') || '[]');
        const allPayments = JSON.parse(localStorage.getItem('allPayments') || '[]');
        const customers = {};

        // 1. Process Invoices (Debits)
        allInvoices.forEach(inv => {
            const mobile = inv.mobileNumber || 'Unknown';
            if (!customers[mobile]) {
                customers[mobile] = {
                    name: inv.customerName,
                    mobile: mobile,
                    totalPurchased: 0,
                    totalPaid: 0, // Paid via invoices (down payments)
                    itemsPurchased: 0,
                    invoices: []
                };
            }
            customers[mobile].totalPurchased += (inv.summary?.grandTotal || 0);
            const initialPaid = inv.summary?.amountPaid || 0;
            customers[mobile].totalPaid += initialPaid;
            customers[mobile].invoices.push(inv);
        });

        // 2. Process Separate Payments (Credits)
        allPayments.forEach(pay => {
            const mobile = pay.mobileNumber || 'Unknown';
            if (!customers[mobile]) {
                customers[mobile] = {
                    name: pay.customerName || 'Unknown',
                    mobile: mobile,
                    totalPurchased: 0,
                    totalPaid: 0,
                    itemsPurchased: 0,
                    invoices: []
                };
            }
            customers[mobile].totalPaid += (parseFloat(pay.amount) || 0);
        });

        // 3. Convert to Array and Filter
        const ledgerArray = Object.values(customers).map(c => ({
            ...c,
            balance: c.totalPurchased - c.totalPaid
        })).filter(c => Math.abs(c.balance) > 0.5); // Filter non-zero balances

        ledgerArray.sort((a, b) => b.balance - a.balance);
        setLedgerData(ledgerArray);
    };

    const filterData = () => {
        if (!searchTerm.trim()) {
            setFilteredData(ledgerData);
            return;
        }
        const lower = searchTerm.toLowerCase();
        const filtered = ledgerData.filter(d =>
            d.name.toLowerCase().includes(lower) ||
            d.mobile.includes(lower)
        );
        setFilteredData(filtered);
    };

    // --- Actions ---

    const handleViewDetails = (customer) => {
        setCurrentCustomer(customer);
        // Sort invoices by date desc
        const sortedInvoices = [...(customer.invoices || [])].sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));
        setCustomerInvoices(sortedInvoices);
        setViewMode('details');
    };

    const handleBackToList = () => {
        setViewMode('list');
        setCurrentCustomer(null);
    };

    const handleOpenPayModal = (customer) => {
        // If we are in detail view, use currentCustomer if passed/available
        // If triggered from list, 'customer' is passed.
        // If triggered from details sidebar, 'customer' is null, so use currentCustomer
        const target = customer || currentCustomer;
        setCurrentCustomer(target); // Ensure set for modal display
        setAmountToPay('');
        setPaymentNote('');
        setShowPayModal(true);
    };

    const handleProcessPayment = (e) => {
        e.preventDefault();
        const amount = parseFloat(amountToPay);

        if (isNaN(amount) || amount <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }

        const newPayment = {
            id: `PAY-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now(),
            customerName: currentCustomer.name,
            mobileNumber: currentCustomer.mobile,
            amount: amount,
            note: paymentNote,
            type: 'Credit'
        };

        const allPayments = JSON.parse(localStorage.getItem('allPayments') || '[]');
        allPayments.push(newPayment);
        localStorage.setItem('allPayments', JSON.stringify(allPayments));

        showToast(`₹${amount} received from ${currentCustomer.name}`, 'success');
        setShowPayModal(false);
        calculateLedger(); // Refresh Data
        // Note: currentCustomer object inside visual component won't auto-update until we sync it
    };

    // Sync currentCustomer with updated ledgerData after a payment
    useEffect(() => {
        if (viewMode === 'details' && currentCustomer) {
            const updated = ledgerData.find(c => c.mobile === currentCustomer.mobile);
            // If balance drops to 0, it might disappear from ledgerData due to filter. 
            // Handle gracefully if not found (maybe keep old data but set balance 0?)
            if (updated) {
                setCurrentCustomer(updated);
            } else {
                // If not found in filtered list, it means balance is 0. 
                // We should probably explicitly fetch it or manually update.
                // For now, let's just pretend balance is 0.
                setCurrentCustomer(prev => ({ ...prev, balance: 0, totalPaid: prev.totalPaid + parseFloat(amountToPay || 0) }));
            }
        }
    }, [ledgerData]);

    return (
        <AdminLayout>
            <Container fluid className="p-3">
                {viewMode === 'list' ? (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="fw-bold text-dark mb-0">Customer Ledger (Khata)</h3>
                            <div style={{ width: '300px' }}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white border-end-0"><FaSearch className="text-muted" /></InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search Customer..."
                                        className="border-start-0"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </div>
                        </div>

                        <Row className="mb-4">
                            <Col>
                                <Card className="border-0 shadow-sm bg-primary text-white">
                                    <Card.Body className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <h6 className="mb-1 opacity-75">Total Outstanding</h6>
                                            <h3 className="fw-bold mb-0">₹{ledgerData.reduce((acc, c) => acc + c.balance, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                                        </div>
                                        <FaMoneyBillWave size={32} className="opacity-50" />
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <h6 className="mb-1 text-muted">Customers with Due</h6>
                                            <h3 className="fw-bold mb-0 text-dark">{ledgerData.length}</h3>
                                        </div>
                                        <FaUser size={32} className="text-primary opacity-25" />
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <Table hover className="mb-0 align-middle">
                                        <thead className="bg-light text-muted small text-uppercase">
                                            <tr>
                                                <th className="px-4 py-3">Customer</th>
                                                <th className="px-4 py-3 text-end">Total Purchased</th>
                                                <th className="px-4 py-3 text-end">Total Paid</th>
                                                <th className="px-4 py-3 text-end">Current Balance</th>
                                                <th className="px-4 py-3 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.length > 0 ? (
                                                filteredData.map((cust, idx) => (
                                                    <tr key={idx} onClick={() => handleViewDetails(cust)} style={{ cursor: 'pointer' }}>
                                                        <td className="px-4">
                                                            <div className="fw-bold text-dark">{cust.name}</div>
                                                            <small className="text-muted">{cust.mobile}</small>
                                                        </td>
                                                        <td className="px-4 text-end fw-semibold">
                                                            ₹{cust.totalPurchased.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-4 text-end text-success">
                                                            ₹{cust.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-4 text-end">
                                                            <span className={`fw-bold ${cust.balance > 0 ? 'text-danger' : 'text-success'}`}>
                                                                ₹{cust.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="outline-primary" size="sm" onClick={() => handleOpenPayModal(cust)}>
                                                                <FaMoneyBillWave className="me-1" /> Receive Payment
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-5 text-muted">
                                                        No customers with pending dues found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </>
                ) : (
                    // DETAILS VIEW
                    <>
                        <div className="d-flex align-items-center mb-4">
                            <Button variant="link" className="text-dark p-0 me-3" onClick={handleBackToList}>
                                <FaArrowLeft className="me-2" /> Back to List
                            </Button>
                            <h3 className="fw-bold text-dark mb-0">Customer Details: {currentCustomer?.name}</h3>
                        </div>

                        <Row className="mb-4">
                            <Col md={8}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Header className="bg-white fw-bold">Purchase History (Invoices)</Card.Header>
                                    <Card.Body className="p-0">
                                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            <Table hover className="mb-0 align-middle">
                                                <thead className="bg-light text-muted small">
                                                    <tr>
                                                        <th className="px-4 py-2">Date</th>
                                                        <th className="px-4 py-2">Invoice #</th>
                                                        <th className="px-4 py-2 text-end">Items</th>
                                                        <th className="px-4 py-2 text-end">Amount Paid (Initial)</th>
                                                        <th className="px-4 py-2 text-end">Grand Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {customerInvoices.map((inv, i) => (
                                                        <tr key={i}>
                                                            <td className="px-4 text-muted small">{inv.invoiceDate}</td>
                                                            <td className="px-4 fw-bold small text-primary">{inv.invoiceNumber}</td>
                                                            <td className="px-4 text-end small">{inv.items?.length || 0}</td>
                                                            <td className="px-4 text-end text-success small">
                                                                ₹{(inv.summary?.amountPaid || 0).toFixed(2)}
                                                            </td>
                                                            <td className="px-4 text-end fw-bold small">
                                                                ₹{inv.summary?.grandTotal.toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {customerInvoices.length === 0 && (
                                                        <tr><td colSpan="5" className="text-center py-4 text-muted">No invoices found.</td></tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
                                    <Card.Body>
                                        <h5 className="mb-3 text-muted">Ledger Summary</h5>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Total Purchased:</span>
                                            <span className="fw-bold">₹{currentCustomer?.totalPurchased.toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-3">
                                            <span>Total Paid:</span>
                                            <span className="fw-bold text-success">₹{currentCustomer?.totalPaid.toFixed(2)}</span>
                                        </div>
                                        <div className="alert alert-danger text-center">
                                            <small className="text-muted text-uppercase fw-bold">Current Balance Due</small>
                                            <h2 className="fw-bold my-2">₹{currentCustomer?.balance.toFixed(2)}</h2>
                                        </div>
                                        <div className="d-grid mt-3">
                                            <Button variant="primary" size="lg" onClick={() => handleOpenPayModal(null)}>
                                                <FaMoneyBillWave className="me-2" /> Receive Payment
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}

                {/* Payment Modal */}
                <Modal show={showPayModal} onHide={() => setShowPayModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Receive Payment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {/* Use currentCustomer here, which is set by openModal */}
                        {currentCustomer && (
                            <Form onSubmit={handleProcessPayment}>
                                <div className="mb-4 text-center">
                                    <h5 className="mb-1">{currentCustomer.name}</h5>
                                    <div className="text-danger fw-bold fs-4">Due: ₹{currentCustomer.balance.toFixed(2)}</div>
                                </div>
                                <Form.Group className="mb-3">
                                    <Form.Label>Amount Receiving (₹)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter amount"
                                        value={amountToPay}
                                        onChange={(e) => setAmountToPay(e.target.value)}
                                        min="1"
                                        step="0.01"
                                        autoFocus
                                        required
                                        className="fs-5"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Note (Optional)</Form.Label>
                                    <Form.Control
                                        as="textarea" rows={2}
                                        placeholder="e.g. Paid via UPI"
                                        value={paymentNote}
                                        onChange={(e) => setPaymentNote(e.target.value)}
                                    />
                                </Form.Group>
                                <div className="d-grid">
                                    <Button variant="success" size="lg" type="submit">Confirm Payment</Button>
                                </div>
                            </Form>
                        )}
                    </Modal.Body>
                </Modal>
            </Container>
        </AdminLayout>
    );
};

export default PartialPayment;
