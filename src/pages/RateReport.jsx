import React, { useState } from 'react';
import { Container, Card, Table, Badge, Button, Row, Col, Pagination, Form } from 'react-bootstrap';
import AdminLayout from '../components/AdminLayout';
import { useProduct } from '../context/ProductContext';
import { FaDownload, FaPercentage } from 'react-icons/fa';

const RateReport = () => {
    const { products } = useProduct();

    // Metrics for Tax Slabs
    const taxDistribution = products.reduce((acc, p) => {
        const rate = p.sellingPriceTaxRate || '0';
        acc[rate] = (acc[rate] || 0) + 1;
        return acc;
    }, {});

    const handlePrint = () => {
        window.print();
    };

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Pagination Logic
    const indexOfLastItem = currentPage * (itemsPerPage === 'All' ? products.length : itemsPerPage);
    const indexOfFirstItem = indexOfLastItem - (itemsPerPage === 'All' ? products.length : itemsPerPage);
    const currentItems = itemsPerPage === 'All' ? products : products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = itemsPerPage === 'All' ? 1 : Math.ceil(products.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <AdminLayout>
            <Container fluid className="p-0">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-dark mb-0">Product GST Rate Report</h3>
                    <Button variant="outline-primary" size="sm" onClick={handlePrint} className="d-print-none">
                        <FaDownload className="me-2" /> Print / PDF
                    </Button>
                </div>

                {/* Metrics */}
                <Row className="g-3 mb-4 d-print-none">
                    {['0', '5', '12', '18', '28'].map(rate => (
                        <Col key={rate} md={2}>
                            <Card className="border-0 shadow-sm text-center">
                                <Card.Body className="p-2">
                                    <h6 className="text-muted small mb-1">{rate}% Rate</h6>
                                    <h4 className="fw-bold mb-0 text-primary">{taxDistribution[rate] || 0}</h4>
                                    <small className="text-muted" style={{ fontSize: '0.7em' }}>Products</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mb-3 d-print-none">
                    <div className="d-flex align-items-center">
                        <span className="me-2 text-muted small">Show</span>
                        <Form.Select
                            size="sm"
                            className="d-inline-block w-auto"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value="All">All</option>
                        </Form.Select>
                        <span className="ms-2 text-muted small">entries</span>
                    </div>

                    {itemsPerPage !== 'All' && products.length > itemsPerPage && (
                        <Pagination size="sm" className="mb-0">
                            <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                            {[...Array(totalPages)].map((_, i) => (
                                <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => paginate(i + 1)}>
                                    {i + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                        </Pagination>
                    )}
                </div>

                {/* Rate Table (Screen Only) */}
                <div className="d-print-none">
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0 text-nowrap table-bordered">
                                <thead className="bg-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Product Name</th>
                                        <th>HSN Code</th>
                                        <th className="text-end">Base Price</th>
                                        <th className="text-center">GST %</th>
                                        <th className="text-center">Type</th>
                                        <th className="text-end">Tax Amount</th>
                                        <th className="text-end">Final MRP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((p, index) => {
                                        const price = parseFloat(p.sellingPrice) || 0;
                                        const rate = parseFloat(p.sellingPriceTaxRate) || 0;
                                        const type = p.sellingPriceTaxType || 'Inclusive';

                                        let base = 0;
                                        let taxAmt = 0;
                                        let final = 0;

                                        if (type === 'Inclusive') {
                                            final = price;
                                            base = price / (1 + rate / 100);
                                            taxAmt = final - base;
                                        } else {
                                            base = price;
                                            taxAmt = price * (rate / 100);
                                            final = base + taxAmt;
                                        }

                                        const absIndex = (itemsPerPage === 'All' ? 0 : (currentPage - 1) * itemsPerPage) + index + 1;

                                        return (
                                            <tr key={p.id}>
                                                <td>{absIndex}</td>
                                                <td className="fw-semibold text-wrap" style={{ maxWidth: '300px' }}>{p.name}</td>
                                                <td>{p.hsnCode || '-'}</td>
                                                <td className="text-end">₹{base.toFixed(2)}</td>
                                                <td className="text-center">
                                                    <Badge bg={rate > 12 ? 'warning' : 'success'} className="fw-normal">
                                                        {rate}%
                                                    </Badge>
                                                </td>
                                                <td className="text-center small text-muted">{type}</td>
                                                <td className="text-end text-danger small">₹{taxAmt.toFixed(2)}</td>
                                                <td className="text-end fw-bold">₹{final.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>

                {/* Full Rate Report (Print Only) */}
                <div className="d-none d-print-block">
                    <Card className="border-0 shadow-none">
                        <Card.Body className="p-0">
                            <Table responsive className="mb-0 text-nowrap table-bordered">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Product Name</th>
                                        <th>HSN Code</th>
                                        <th className="text-end">Base Price</th>
                                        <th className="text-center">GST %</th>
                                        <th className="text-center">Type</th>
                                        <th className="text-end">Tax Amount</th>
                                        <th className="text-end">Final MRP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p, index) => {
                                        const price = parseFloat(p.sellingPrice) || 0;
                                        const rate = parseFloat(p.sellingPriceTaxRate) || 0;
                                        const type = p.sellingPriceTaxType || 'Inclusive';

                                        let base = 0;
                                        let taxAmt = 0;
                                        let final = 0;

                                        if (type === 'Inclusive') {
                                            final = price;
                                            base = price / (1 + rate / 100);
                                            taxAmt = final - base;
                                        } else {
                                            base = price;
                                            taxAmt = price * (rate / 100);
                                            final = base + taxAmt;
                                        }

                                        return (
                                            <tr key={p.id}>
                                                <td>{index + 1}</td>
                                                <td className="fw-semibold text-wrap" style={{ maxWidth: '300px' }}>{p.name}</td>
                                                <td>{p.hsnCode || '-'}</td>
                                                <td className="text-end">₹{base.toFixed(2)}</td>
                                                <td className="text-center">
                                                    <Badge bg={rate > 12 ? 'warning' : 'success'} className="fw-normal">
                                                        {rate}%
                                                    </Badge>
                                                </td>
                                                <td className="text-center small text-muted">{type}</td>
                                                <td className="text-end text-danger small">₹{taxAmt.toFixed(2)}</td>
                                                <td className="text-end fw-bold">₹{final.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .admin-main-content, .admin-main-content * {
                        visibility: visible;
                    }
                    .admin-main-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    .d-print-none {
                        display: none !important;
                    }
                }
            `}</style>
        </AdminLayout>
    );
};

export default RateReport;
