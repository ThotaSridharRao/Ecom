import React, { useState } from 'react';
import { Container, Card, Table, Badge, Button, Row, Col, Pagination, Form } from 'react-bootstrap';
import AdminLayout from '../components/AdminLayout';
import { useProduct } from '../context/ProductContext';
import { FaDownload, FaFileAlt } from 'react-icons/fa';

const AllItemReport = () => {
    const { products } = useProduct();

    // Calculate Totals
    const totalItems = products.length;
    const totalStock = products.reduce((acc, p) => acc + (parseInt(p.stock) || 0), 0);
    const totalStockValue = products.reduce((acc, p) => {
        const cost = parseFloat(p.purchasePrice) || 0;
        const stock = parseInt(p.stock) || 0;
        return acc + (cost * stock);
    }, 0);
    const totalSalesValue = products.reduce((acc, p) => {
        const price = parseFloat(p.sellingPrice) || 0;
        const stock = parseInt(p.stock) || 0;
        return acc + (price * stock);
    }, 0);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Pagination Logic
    const indexOfLastItem = currentPage * (itemsPerPage === 'All' ? products.length : itemsPerPage);
    const indexOfFirstItem = indexOfLastItem - (itemsPerPage === 'All' ? products.length : itemsPerPage);
    const currentItems = itemsPerPage === 'All' ? products : products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = itemsPerPage === 'All' ? 1 : Math.ceil(products.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handlePrint = () => {
        window.print();
    };

    return (
        <AdminLayout>
            <Container fluid className="p-0">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-dark mb-0">All Item Inventory Report</h3>
                    <Button variant="outline-primary" size="sm" onClick={handlePrint} className="d-print-none">
                        <FaDownload className="me-2" /> Print / PDF
                    </Button>
                </div>

                {/* Metrics */}
                <Row className="g-3 mb-4 d-print-none">
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center">
                            <Card.Body>
                                <h6 className="text-muted small">Total Products</h6>
                                <h4 className="fw-bold text-primary">{totalItems}</h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center">
                            <Card.Body>
                                <h6 className="text-muted small">Total Stock Qty</h6>
                                <h4 className="fw-bold text-info">{totalStock}</h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center">
                            <Card.Body>
                                <h6 className="text-muted small">Stock Value (Cost)</h6>
                                <h4 className="fw-bold text-success">₹{totalStockValue.toLocaleString()}</h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm text-center">
                            <Card.Body>
                                <h6 className="text-muted small">Potential Sales Value</h6>
                                <h4 className="fw-bold text-warning">₹{totalSalesValue.toLocaleString()}</h4>
                            </Card.Body>
                        </Card>
                    </Col>
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

                {/* Paginated Report Section (Screen Only) */}
                <div className="d-print-none">
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0 text-nowrap table-bordered">
                                <thead className="bg-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Code/ID</th>
                                        <th>Product Name</th>
                                        <th>Category</th>
                                        <th>Brand</th>
                                        <th className="text-end">Stock</th>
                                        <th className="text-end">Cost Price</th>
                                        <th className="text-end">Sell Price</th>
                                        <th className="text-end">Total Cost Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((p, index) => {
                                        const cost = parseFloat(p.purchasePrice) || 0;
                                        const stock = parseInt(p.stock) || 0;
                                        const totalVal = cost * stock;
                                        // Use absolute index for listing
                                        const absIndex = (itemsPerPage === 'All' ? 0 : (currentPage - 1) * itemsPerPage) + index + 1;
                                        return (
                                            <tr key={p.id}>
                                                <td>{absIndex}</td>
                                                <td>{p.code || p.id}</td>
                                                <td className="fw-semibold text-wrap" style={{ maxWidth: '250px' }}>{p.name}</td>
                                                <td>{p.category}</td>
                                                <td>{p.brand || '-'}</td>
                                                <td className={`text-end fw-bold ${stock <= 10 ? 'text-danger' : ''}`}>{stock}</td>
                                                <td className="text-end">₹{cost}</td>
                                                <td className="text-end">₹{p.sellingPrice}</td>
                                                <td className="text-end">₹{totalVal.toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                    {/* Totals Row */}
                                    {(itemsPerPage === 'All' || currentPage === totalPages) && (
                                        <tr className="bg-light fw-bold">
                                            <td colSpan="5" className="text-end">Totals (All Items):</td>
                                            <td className="text-end">{totalStock}</td>
                                            <td></td>
                                            <td></td>
                                            <td className="text-end">₹{totalStockValue.toLocaleString()}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>

                {/* Full Report Section (Print Only) */}
                <div className="d-none d-print-block">
                    <Card className="border-0 shadow-none">
                        <Card.Body className="p-0">
                            <Table responsive className="mb-0 text-nowrap table-bordered">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Code/ID</th>
                                        <th>Product Name</th>
                                        <th>Category</th>
                                        <th>Brand</th>
                                        <th className="text-end">Stock</th>
                                        <th className="text-end">Cost Price</th>
                                        <th className="text-end">Sell Price</th>
                                        <th className="text-end">Total Cost Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p, index) => {
                                        const cost = parseFloat(p.purchasePrice) || 0;
                                        const stock = parseInt(p.stock) || 0;
                                        const totalVal = cost * stock;
                                        return (
                                            <tr key={p.id}>
                                                <td>{index + 1}</td>
                                                <td>{p.code || p.id}</td>
                                                <td className="fw-semibold text-wrap" style={{ maxWidth: '250px' }}>{p.name}</td>
                                                <td>{p.category}</td>
                                                <td>{p.brand || '-'}</td>
                                                <td className={`text-end fw-bold ${stock <= 10 ? 'text-danger' : ''}`}>{stock}</td>
                                                <td className="text-end">₹{cost}</td>
                                                <td className="text-end">₹{p.sellingPrice}</td>
                                                <td className="text-end">₹{totalVal.toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                    {/* Totals Row */}
                                    <tr className="bg-light fw-bold">
                                        <td colSpan="5" className="text-end">Totals:</td>
                                        <td className="text-end">{totalStock}</td>
                                        <td></td>
                                        <td></td>
                                        <td className="text-end">₹{totalStockValue.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
            <style>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 10mm;
                    }
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
                    .card {
                        border: 1px solid #ddd !important;
                        box-shadow: none !important;
                    }
                    
                    /* Table Optimization for Print */
                    table {
                        width: 100% !important;
                        font-size: 10pt !important;
                    }
                    th, td {
                        padding: 4px 8px !important;
                        white-space: normal !important; /* Allow clear text wrapping */
                        vertical-align: middle !important;
                    }
                    /* Ensure right-aligned columns don't get cut off */
                    td.text-end, th.text-end {
                        text-align: right !important;
                    }
                }
            `}</style>
        </AdminLayout >
    );
};

export default AllItemReport;
