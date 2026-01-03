import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Form, Table, Button, Badge, Modal } from 'react-bootstrap';
import AdminLayout from '../components/AdminLayout';
import { useProduct } from '../context/ProductContext';
import Barcode from 'react-barcode';
import { FaPrint, FaSearch, FaCheckSquare, FaSquare } from 'react-icons/fa';

const BarcodeGenerator = () => {
    const { products } = useProduct();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]); // List of product objects
    const [printMode, setPrintMode] = useState(false);

    // Search Filter
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const toggleSelect = (product) => {
        if (selectedProducts.find(p => p.id === product.id)) {
            setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
        } else {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AdminLayout>
            <Container fluid className="p-0">
                <style>
                    {`
                        @media print {
                            body * {
                                visibility: hidden;
                            }
                            #printable-area, #printable-area * {
                                visibility: visible;
                            }
                            #printable-area {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                            }
                            .no-print {
                                display: none !important;
                            }
                        }
                    `}
                </style>

                <div className="d-flex justify-content-between align-items-center mb-3 no-print">
                    <h3 className="fw-bold text-dark mb-0">Barcode Generator</h3>
                    <Button variant="primary" onClick={handlePrint} disabled={selectedProducts.length === 0}>
                        <FaPrint className="me-2" /> Print Labels
                    </Button>
                </div>

                <Row className="no-print">
                    {/* Selection Panel */}
                    <Col lg={4} className="mb-3">
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-bottom-0 py-3">
                                <h6 className="mb-0 fw-bold">Select Products</h6>
                            </Card.Header>
                            <Card.Body className="p-0 d-flex flex-column h-100">
                                <div className="p-3 border-bottom">
                                    <Form.Control
                                        placeholder="Search by name or code..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="table-responsive flex-grow-1" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                                    <Table hover size="sm" className="mb-0 align-middle">
                                        <thead className="bg-light sticky-top">
                                            <tr>
                                                <th className="px-3" style={{ width: '40px' }}>
                                                    <Form.Check
                                                        checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                                                        onChange={toggleSelectAll}
                                                    />
                                                </th>
                                                <th className="px-3">Product</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.map(p => {
                                                const isSelected = !!selectedProducts.find(s => s.id === p.id);
                                                return (
                                                    <tr key={p.id} onClick={() => toggleSelect(p)} role="button" className={isSelected ? 'table-primary' : ''}>
                                                        <td className="px-3">
                                                            <Form.Check
                                                                checked={isSelected}
                                                                onChange={() => toggleSelect(p)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </td>
                                                        <td className="px-3">
                                                            <div className="fw-semibold small text-truncate" style={{ maxWidth: '200px' }}>{p.name}</div>
                                                            <div className="text-muted extra-small">ID: {p.code || p.id}</div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {filteredProducts.length === 0 && (
                                                <tr><td colSpan="2" className="text-center py-3 text-muted">No products found</td></tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                                <div className="p-3 border-top bg-light">
                                    <small className="text-muted">{selectedProducts.length} items selected</small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Preview Panel */}
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm h-100 overflow-auto" style={{ maxHeight: 'calc(100vh - 150px)' }}>
                            <Card.Header className="bg-white border-bottom-0 py-3">
                                <h6 className="mb-0 fw-bold">Preview (A4 Standard)</h6>
                            </Card.Header>
                            <Card.Body className="bg-light d-flex justify-content-center p-4">
                                {/* Simulated Paper Sheet */}
                                <div
                                    className="bg-white shadow p-4"
                                    style={{
                                        width: '210mm',     // A4 width
                                        minHeight: '297mm', // A4 height
                                        padding: '10mm',    // Margins
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        alignContent: 'flex-start',
                                        gap: '2mm'
                                    }}
                                >
                                    {selectedProducts.length === 0 ? (
                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                            Select products to generate barcodes
                                        </div>
                                    ) : (
                                        selectedProducts.map((p, idx) => (
                                            <div
                                                key={`${p.id}-${idx}`}
                                                className="border d-flex flex-column align-items-center justify-content-center p-2"
                                                style={{
                                                    width: '48mm',   // Approx 4 cols on A4
                                                    height: '30mm',  // Standard label height
                                                    boxSizing: 'border-box',
                                                    pageBreakInside: 'avoid'
                                                }}
                                            >
                                                <div className="fw-bold text-truncate w-100 text-center" style={{ fontSize: '8px' }}>
                                                    {p.name}
                                                </div>
                                                <div style={{ transform: 'scale(0.8)', transformOrigin: 'center' }}>
                                                    <Barcode value={p.code || String(p.id).padStart(8, '0')} width={1.5} height={30} fontSize={10} displayValue={true} />
                                                </div>
                                                <div className="fw-bold" style={{ fontSize: '10px' }}>
                                                    {p.price}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Printable Area (Hidden Default, Visible on Print) */}
                <div id="printable-area" className="d-none d-print-block">
                    <div
                        style={{
                            width: '210mm',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignContent: 'flex-start',
                            padding: '5mm', // Printer margins usually require less padding here
                        }}
                    >
                        {selectedProducts.map((p, idx) => (
                            <div
                                key={`${p.id}-${idx}-print`}
                                className="d-flex flex-column align-items-center justify-content-center p-1"
                                style={{
                                    width: '25%',   // 4 cols
                                    height: '35mm',
                                    border: '1px dotted #ddd', // Light border for cutting guide
                                    boxSizing: 'border-box',
                                    pageBreakInside: 'avoid'
                                }}
                            >
                                <div className="fw-bold text-truncate w-100 text-center" style={{ fontSize: '10px', marginBottom: '2px' }}>
                                    {p.name}
                                </div>
                                <div style={{ transform: 'scale(0.9)', transformOrigin: 'center' }}>
                                    <Barcode value={p.code || String(p.id).padStart(8, '0')} width={1.5} height={35} fontSize={10} displayValue={true} />
                                </div>
                                <div className="fw-bold" style={{ fontSize: '12px', marginTop: '2px' }}>
                                    {p.price}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </Container>
        </AdminLayout>
    );
};

export default BarcodeGenerator;
