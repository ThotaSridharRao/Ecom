import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useWishlist } from '../context/WishlistContext';
import { FaTrash } from 'react-icons/fa';
import './Wishlist.css';

const Wishlist = () => {
    const { wishlist, removeFromWishlist } = useWishlist();

    return (
        <Container className="mt-5 mb-5">
            <h2 className="mb-4 fw-bold">Your Wishlist</h2>
            {wishlist.length === 0 ? (
                <div className="text-center py-5">
                    <p className="fs-5 text-muted">No items in your wishlist.</p>
                </div>
            ) : (
                <Row>
                    {wishlist.map((item) => (
                        <Col key={item.id} xs={6} md={4} lg={3} className="mb-4">
                            <Card className="h-100 border-0 shadow-sm">
                                <div className="card-img-box rounded-top" style={{ height: '200px', overflow: 'hidden' }}>
                                    <Card.Img variant="top" src={item.img} className="h-100 w-100 object-fit-cover" />
                                </div>
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="fs-6 mb-2 text-truncate-2">{item.name}</Card.Title>
                                    <div className="mt-auto d-flex justify-content-between align-items-center">
                                        <span className="fw-bold">{item.price}</span>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => removeFromWishlist(item.id)}
                                            title="Remove from Wishlist"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default Wishlist;
