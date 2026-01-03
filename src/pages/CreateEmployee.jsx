import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Container, Card, Form, Button, Row, Col, Table, Badge } from 'react-bootstrap';
import { useToast } from '../context/ToastContext';
import { FaUserPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa';

const CreateEmployee = () => {
    const { showToast } = useToast();
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);

    const [empForm, setEmpForm] = useState({
        id: '',
        name: '',
        email: '',
        password: '',
        role: '',
        mobile: ''
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const storedRoles = JSON.parse(localStorage.getItem('roles') || '[]');
        setRoles(storedRoles);

        // Assuming we store employees in "users" or "employees"
        // Let's use a distinct "employees" key for this simple mocked implementation
        // Real app would likely use the same User table but with role field
        const storedEmps = JSON.parse(localStorage.getItem('employees') || '[]');
        setEmployees(storedEmps);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!empForm.name || !empForm.email || !empForm.role) {
            showToast('Please fill required fields', 'error');
            return;
        }

        const newEmps = [...employees];
        if (isEditing) {
            const index = newEmps.findIndex(em => em.id === empForm.id);
            if (index > -1) {
                newEmps[index] = empForm;
                showToast('Employee updated', 'success');
            }
        } else {
            const newId = `EMP-${Date.now()}`;
            if (newEmps.some(em => em.email === empForm.email)) {
                showToast('Email already exists', 'error');
                return;
            }
            newEmps.push({ ...empForm, id: newId });
            showToast('Employee created', 'success');
        }

        setEmployees(newEmps);
        localStorage.setItem('employees', JSON.stringify(newEmps));
        resetForm();
    };

    const resetForm = () => {
        setEmpForm({ id: '', name: '', email: '', password: '', role: '', mobile: '' });
        setIsEditing(false);
    };

    const handleEdit = (emp) => {
        setEmpForm(emp);
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete employee?')) {
            const updated = employees.filter(e => e.id !== id);
            setEmployees(updated);
            localStorage.setItem('employees', JSON.stringify(updated));
            showToast('Employee deleted', 'success');
        }
    };

    return (
        <AdminLayout>
            <Container fluid className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-dark mb-0">Employee Management</h3>
                </div>

                <Row className="g-4">
                    {/* Create Form */}
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white fw-bold py-3">
                                {isEditing ? 'Edit Employee' : 'Create New Employee'}
                            </Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleSave}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Full Name *</Form.Label>
                                        <Form.Control
                                            value={empForm.name}
                                            onChange={e => setEmpForm({ ...empForm, name: e.target.value })}
                                            placeholder="Enter name"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email Address *</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={empForm.email}
                                            onChange={e => setEmpForm({ ...empForm, email: e.target.value })}
                                            placeholder="Enter email"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Mobile</Form.Label>
                                        <Form.Control
                                            value={empForm.mobile}
                                            onChange={e => setEmpForm({ ...empForm, mobile: e.target.value })}
                                            placeholder="Enter mobile"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Role *</Form.Label>
                                        <Form.Select
                                            value={empForm.role}
                                            onChange={e => setEmpForm({ ...empForm, role: e.target.value })}
                                        >
                                            <option value="">Select Role</option>
                                            {roles.map(r => (
                                                <option key={r.id} value={r.id}>{r.roleName}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label>Password {isEditing && '(Leave blank to keep current)'}</Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={empForm.password}
                                            onChange={e => setEmpForm({ ...empForm, password: e.target.value })}
                                            placeholder="Set password"
                                        />
                                    </Form.Group>
                                    <div className="d-grid gap-2">
                                        <Button variant="primary" type="submit">
                                            <FaSave className="me-2" /> {isEditing ? 'Update Employee' : 'Create Employee'}
                                        </Button>
                                        {isEditing && (
                                            <Button variant="outline-secondary" onClick={resetForm}>Cancel</Button>
                                        )}
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Employee List */}
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white fw-bold py-3">
                                Employee List
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <Table hover className="mb-0 align-middle">
                                        <thead className="bg-light text-muted small text-uppercase">
                                            <tr>
                                                <th className="px-4 py-3">Name</th>
                                                <th className="px-4 py-3">Role</th>
                                                <th className="px-4 py-3">Login ID</th>
                                                <th className="px-4 py-3 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employees.length > 0 ? (
                                                employees.map(emp => (
                                                    <tr key={emp.id}>
                                                        <td className="px-4">
                                                            <div className="fw-bold">{emp.name}</div>
                                                            <small className="text-muted">{emp.email}</small>
                                                        </td>
                                                        <td className="px-4">
                                                            <Badge bg="info">{roles.find(r => r.id === emp.role)?.roleName || emp.role}</Badge>
                                                        </td>
                                                        <td className="px-4 text-muted small">
                                                            P: {emp.password ? '****' : 'No Access'}
                                                        </td>
                                                        <td className="px-4 text-center">
                                                            <Button variant="link" className="text-primary me-2" onClick={() => handleEdit(emp)}><FaEdit /></Button>
                                                            <Button variant="link" className="text-danger" onClick={() => handleDelete(emp.id)}><FaTrash /></Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-5 text-muted">No employees found.</td>
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

export default CreateEmployee;
