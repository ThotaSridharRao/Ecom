import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table } from 'react-bootstrap';
import { useProduct } from '../context/ProductContext';
import { FaFileInvoiceDollar, FaMoneyBillWave, FaBalanceScaleRight, FaTruck, FaChartLine } from 'react-icons/fa';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
    const { products } = useProduct();
    const lowStockProducts = products.filter(p => p.stock !== undefined && p.stock <= 10); // Changed threshold to 10 for visibility
    const [metrics, setMetrics] = useState({
        totalSales: 0,
        todaySales: 0,
        totalReceived: 0,
        todayReceived: 0,
        totalOutstanding: 0,
        totalPurchases: 0
    });

    useEffect(() => {
        calculateMetrics();
    }, []);

    const calculateMetrics = () => {
        const allInvoices = JSON.parse(localStorage.getItem('allInvoices') || '[]');
        const allPayments = JSON.parse(localStorage.getItem('allPayments') || '[]'); // Manual/Ledger
        const allPurchases = JSON.parse(localStorage.getItem('allPurchases') || '[]');

        const today = new Date().toISOString().split('T')[0];

        // 1. Sales Calculation (Invoices)
        // Ensure grandTotal is treated as number
        const totalSales = allInvoices.reduce((acc, inv) => acc + (parseFloat(inv.summary?.grandTotal) || 0), 0);

        // Check date format compatibility. Standard is usually YYYY-MM-DD.
        // Some legacy data might differ, but assuming YYYY-MM-DD for now.
        const todaySales = allInvoices
            .filter(inv => {
                const d = inv.invoiceDate || inv.date;
                return d && d.startsWith(today);
            })
            .reduce((acc, inv) => acc + (parseFloat(inv.summary?.grandTotal) || 0), 0);

        // 2. Received Calculation
        // Part A: Initial payments on Invoices
        const invoicePaymentsTotal = allInvoices.reduce((acc, inv) => acc + (parseFloat(inv.summary?.amountPaid) || 0), 0);
        const invoicePaymentsToday = allInvoices
            .filter(inv => {
                const d = inv.invoiceDate || inv.date;
                return d && d.startsWith(today);
            })
            .reduce((acc, inv) => acc + (parseFloat(inv.summary?.amountPaid) || 0), 0);

        // Part B: Manual Ledger Payments
        const manualPaymentsTotal = allPayments.reduce((acc, pay) => acc + (parseFloat(pay.amount) || 0), 0);
        const manualPaymentsToday = allPayments
            .filter(pay => pay.date === today)
            .reduce((acc, pay) => acc + (parseFloat(pay.amount) || 0), 0);

        const totalReceived = invoicePaymentsTotal + manualPaymentsTotal;
        const todayReceived = invoicePaymentsToday + manualPaymentsToday;

        // 3. Outstanding (Theoretical)
        // Calculated as Total Sales - Total Received
        const totalOutstanding = totalSales - totalReceived;

        // 4. Purchases
        const totalPurchases = allPurchases.reduce((acc, pur) => acc + (parseFloat(pur.summary?.grandTotal) || 0), 0);

        setMetrics({
            totalSales,
            todaySales,
            totalReceived,
            todayReceived,
            totalOutstanding,
            totalPurchases
        });
    };

    const stats = [
        {
            title: 'Total Sales',
            subtitle: `Today: ₹${metrics.todaySales.toLocaleString('en-IN')}`,
            value: `₹${metrics.totalSales.toLocaleString('en-IN')}`,
            icon: <FaFileInvoiceDollar />,
            color: 'primary' // Blue
        },
        {
            title: 'Total Received',
            subtitle: `Today: ₹${metrics.todayReceived.toLocaleString('en-IN')}`,
            value: `₹${metrics.totalReceived.toLocaleString('en-IN')}`,
            icon: <FaMoneyBillWave />,
            color: 'success' // Green
        },
        {
            title: 'Outstanding Dues',
            subtitle: 'Customer Ledger Balance',
            value: `₹${metrics.totalOutstanding.toLocaleString('en-IN')}`,
            icon: <FaBalanceScaleRight />,
            color: 'warning' // Yellow/Orange
        },
        {
            title: 'Total Purchases',
            subtitle: 'Expenses',
            value: `₹${metrics.totalPurchases.toLocaleString('en-IN')}`,
            icon: <FaTruck />,
            color: 'danger' // Red
        },
    ];

    return (
        <AdminLayout>
            <Container fluid className="p-3">
                <h3 className="fw-bold text-dark mb-4">Business Dashboard</h3>

                {/* Stats Row */}
                <Row className="mb-4 g-3">
                    {stats.map((stat, index) => (
                        <Col md={6} xl={3} key={index}>
                            <Card className={`border-0 shadow-sm h-100 bg-${stat.color} text-white position-relative overflow-hidden`}>
                                <div className="position-absolute top-0 end-0 p-3 opacity-25" style={{ transform: 'scale(2.5)', transformOrigin: 'top right' }}>
                                    {stat.icon}
                                </div>
                                <Card.Body className="d-flex flex-column justify-content-between position-relative z-1">
                                    <div>
                                        <h6 className="text-white-50 text-uppercase fw-bold small mb-2">{stat.title}</h6>
                                        <h3 className="fw-bold mb-1">{stat.value}</h3>
                                        <small className="text-white-50">{stat.subtitle}</small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Additional Content */}
                <Row className="g-3">
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0 py-3">
                                <h5 className="mb-0 fw-bold">Recent Activity</h5>
                            </Card.Header>
                            <Card.Body className="text-center text-muted py-5">
                                <FaChartLine size={40} className="mb-3 opacity-25" />
                                <p>Charts and detailed analytics coming soon...</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold text-danger">Low Stock Alerts</h5>
                                <Badge bg="danger" pill>{lowStockProducts.length}</Badge>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <Table hover className="mb-0 text-nowrap table-sm align-middle">
                                        <thead className="bg-light text-muted small text-uppercase">
                                            <tr>
                                                <th className="px-3 py-2">Product</th>
                                                <th className="px-3 py-2 text-end">Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lowStockProducts.length > 0 ? (
                                                lowStockProducts.map(p => (
                                                    <tr key={p.id}>
                                                        <td className="px-3">
                                                            <div className="fw-semibold text-dark small text-truncate" style={{ maxWidth: '150px' }} title={p.name}>{p.name}</div>
                                                            <div className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>{p.code || `ID: ${p.id}`}</div>
                                                        </td>
                                                        <td className="px-3 text-end">
                                                            <Badge bg={p.stock === 0 ? 'danger' : 'warning'} className="text-dark bg-opacity-25 border border-danger">
                                                                {p.stock}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="2" className="text-center py-4 text-muted small">
                                                        No low stock items.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </AdminLayout>
    );
};

export default AdminDashboard;
