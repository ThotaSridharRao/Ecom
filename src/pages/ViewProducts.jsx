import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Pagination } from 'react-bootstrap';
import { useProduct } from '../context/ProductContext';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ViewProducts = () => {
    const { products } = useProduct();
    const navigate = useNavigate();

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Logic for displaying current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calculate details for Pagination UI
    const totalPages = Math.ceil(products.length / itemsPerPage);

    return (
        <AdminLayout>
            <Container fluid className="p-0">
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                    <h3 className="fw-bold text-dark mb-0">Products</h3>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/admin/products/add')}
                        className="d-flex align-items-center gap-2 btn-sm my-2 my-sm-0"
                    >
                        <FaPlus /> Add Product
                    </Button>
                </div>

                <Card className="border-0 shadow-sm" style={{ maxWidth: '100%' }}>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table hover className="mb-0 alignment-middle text-nowrap table-sm">
                                <thead className="bg-light text-muted">
                                    <tr>
                                        <th className="py-3 px-4 border-bottom small text-uppercase fw-bold text-muted" style={{ backgroundColor: '#f8f9fa' }}>Product</th>
                                        <th className="py-3 px-4 border-bottom small text-uppercase fw-bold text-muted" style={{ backgroundColor: '#f8f9fa' }}>Category</th>
                                        <th className="py-3 px-4 border-bottom small text-uppercase fw-bold text-muted" style={{ backgroundColor: '#f8f9fa' }}>Price</th>
                                        <th className="py-3 px-4 border-bottom small text-uppercase fw-bold text-muted" style={{ backgroundColor: '#f8f9fa' }}>Stock</th>
                                        <th className="py-3 px-4 border-bottom small text-uppercase fw-bold text-muted" style={{ backgroundColor: '#f8f9fa' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-4 py-2">
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        className="rounded me-3 d-flex align-items-center justify-content-center bg-light border"
                                                        style={{ width: '36px', height: '36px', overflow: 'hidden' }}
                                                    >
                                                        {product.img || product.image ? (
                                                            <img
                                                                src={product.img || product.image}
                                                                alt={product.name}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <div className="text-muted" style={{ fontSize: '0.6rem' }}>No Img</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold text-dark small">{product.name}</div>
                                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{product.code || `ID: ${product.id}`}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <Badge bg="light" text="dark" className="border fw-normal text-muted">
                                                    {product.category}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2 fw-bold text-dark small">
                                                {product.price}
                                            </td>
                                            <td className="px-4 py-2">
                                                {product.stock !== undefined ? (
                                                    <div className="d-flex align-items-center">
                                                        <span
                                                            className={`d-inline-block rounded-circle me-2 ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}`}
                                                            style={{ width: '8px', height: '8px' }}
                                                        ></span>
                                                        <span className={product.stock > 0 ? 'text-dark' : 'text-danger fw-bold'}>
                                                            {product.stock}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="d-flex gap-2">
                                                    <Button variant="light" size="sm" className="text-primary p-1" style={{ lineHeight: 1 }}>
                                                        <FaEdit size={14} />
                                                    </Button>
                                                    <Button variant="light" size="sm" className="text-danger p-1" style={{ lineHeight: 1 }}>
                                                        <FaTrash size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-5 text-muted">
                                                No products found. Start by adding one!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <Card.Footer className="bg-white border-0 py-2 d-flex justify-content-center">
                            <Pagination size="sm" className="mb-0">
                                <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                                <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />

                                {[...Array(totalPages)].map((_, index) => (
                                    <Pagination.Item
                                        key={index + 1}
                                        active={index + 1 === currentPage}
                                        onClick={() => paginate(index + 1)}
                                    >
                                        {index + 1}
                                    </Pagination.Item>
                                ))}

                                <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                                <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </Card.Footer>
                    )}
                </Card>
            </Container>
        </AdminLayout>
    );
};

export default ViewProducts;
