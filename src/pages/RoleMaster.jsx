import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Container, Card, Table, Button, Modal, Form, Badge, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaKey } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

const RoleMaster = () => {
    const { showToast } = useToast();
    const [roles, setRoles] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const [roleForm, setRoleForm] = useState({
        id: '',
        roleName: '',
        description: ''
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = () => {
        const storedRoles = JSON.parse(localStorage.getItem('roles') || '[]');
        // Default roles if none
        if (storedRoles.length === 0) {
            const defaults = [
                { id: 'admin', roleName: 'Admin', description: 'Full access' },
                { id: 'employee', roleName: 'Employee', description: 'Limited access' }
            ];
            setRoles(defaults);
            localStorage.setItem('roles', JSON.stringify(defaults));
        } else {
            setRoles(storedRoles);
        }
    };

    const handleSave = () => {
        if (!roleForm.roleName) {
            showToast('Role Name is required', 'error');
            return;
        }

        const newRoles = [...roles];
        if (isEditing) {
            const index = newRoles.findIndex(r => r.id === roleForm.id);
            if (index > -1) {
                newRoles[index] = roleForm;
                showToast('Role updated', 'success');
            }
        } else {
            const newId = roleForm.roleName.toLowerCase().replace(/\s+/g, '-');
            if (newRoles.some(r => r.id === newId)) {
                showToast('Role ID already exists', 'error');
                return;
            }
            newRoles.push({ ...roleForm, id: newId });
            showToast('Role created', 'success');
        }

        setRoles(newRoles);
        localStorage.setItem('roles', JSON.stringify(newRoles));
        setShowModal(false);
    };

    const handleEdit = (role) => {
        setRoleForm(role);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (id === 'admin') {
            showToast('Cannot delete Admin role', 'error');
            return;
        }
        if (window.confirm('Delete this role?')) {
            const updated = roles.filter(r => r.id !== id);
            setRoles(updated);
            localStorage.setItem('roles', JSON.stringify(updated));
            showToast('Role deleted', 'success');
        }
    };

    const openCreate = () => {
        setRoleForm({ id: '', roleName: '', description: '' });
        setIsEditing(false);
        setShowModal(true);
    };

    return (
        <AdminLayout>
            <Container fluid className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-dark mb-0">Role Master</h3>
                    <Button variant="primary" onClick={openCreate}><FaPlus className="me-2" /> Add Role</Button>
                </div>

                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                        <Table hover className="mb-0 align-middle">
                            <thead className="bg-light text-muted uppercase small">
                                <tr>
                                    <th className="px-4 py-3">Role Name</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3 text-center">ID</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map(role => (
                                    <tr key={role.id}>
                                        <td className="px-4 fw-bold">{role.roleName}</td>
                                        <td className="px-4 text-muted">{role.description}</td>
                                        <td className="px-4 text-center"><Badge bg="secondary">{role.id}</Badge></td>
                                        <td className="px-4 text-center">
                                            <Button variant="link" className="text-primary me-2" onClick={() => handleEdit(role)}><FaEdit /></Button>
                                            {role.id !== 'admin' && (
                                                <Button variant="link" className="text-danger" onClick={() => handleDelete(role.id)}><FaTrash /></Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{isEditing ? 'Edit Role' : 'Create Role'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Role Name</Form.Label>
                                <Form.Control
                                    value={roleForm.roleName}
                                    onChange={e => setRoleForm({ ...roleForm, roleName: e.target.value })}
                                    placeholder="e.g. Sales Manager"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea" rows={3}
                                    value={roleForm.description}
                                    onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                                    placeholder="Role responsibilities..."
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave}>Save Role</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </AdminLayout>
    );
};

export default RoleMaster;
