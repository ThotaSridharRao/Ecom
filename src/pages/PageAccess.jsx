import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Container, Card, Table, Button, Form, Row, Col } from 'react-bootstrap';
import { useToast } from '../context/ToastContext';
import { FaSave, FaCheck, FaTimes } from 'react-icons/fa';

const PageAccess = () => {
    const { showToast } = useToast();
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');

    // Hardcoded list of all available pages/routes in the system
    const availablePages = [
        { id: '/admin/dashboard', name: 'Dashboard', group: 'Core' },
        { id: '/admin/products', name: 'Product List', group: 'Store' },
        { id: '/admin/products/add', name: 'Add Product', group: 'Store' },
        { id: '/admin/sales/invoices', name: 'Sales Invoices', group: 'Sales' },
        { id: '/admin/sales/create-invoice', name: 'Create Invoice', group: 'Sales' },
        { id: '/admin/sales/partial-payment', name: 'Partial Payment', group: 'Sales' },
        { id: '/admin/sales/partial-payments-list', name: 'Partial Payment List', group: 'Sales' },
        { id: '/admin/purchase/list', name: 'Purchase List', group: 'Purchase' },
        { id: '/admin/purchase/create', name: 'Create Purchase', group: 'Purchase' },
        { id: '/admin/employee/roles', name: 'Role Master', group: 'Employee' },
        { id: '/admin/employee/access', name: 'Page Access', group: 'Employee' },
        { id: '/admin/employee/create', name: 'Create Employee', group: 'Employee' },
    ];

    const [permissions, setPermissions] = useState({}); // { [path]: boolean }

    useEffect(() => {
        const storedRoles = JSON.parse(localStorage.getItem('roles') || '[]');
        setRoles(storedRoles);
        if (storedRoles.length > 0) {
            setSelectedRole(storedRoles[0].id);
        }
    }, []);

    useEffect(() => {
        if (selectedRole) {
            loadPermissions(selectedRole);
        }
    }, [selectedRole]);

    const loadPermissions = (roleId) => {
        const allPerms = JSON.parse(localStorage.getItem('rolePermissions') || '{}');
        const rolePerms = allPerms[roleId] || []; // Array of allowed paths

        const permMap = {};
        availablePages.forEach(p => {
            permMap[p.id] = rolePerms.includes(p.id) || roleId === 'admin'; // Admin gets all by default
        });
        setPermissions(permMap);
    };

    const handleToggle = (path) => {
        if (selectedRole === 'admin') return; // Cannot edit admin
        setPermissions(prev => ({
            ...prev,
            [path]: !prev[path]
        }));
    };

    const handleSave = () => {
        if (selectedRole === 'admin') return;

        const allowedPaths = Object.keys(permissions).filter(k => permissions[k]);
        const allPerms = JSON.parse(localStorage.getItem('rolePermissions') || '{}');

        allPerms[selectedRole] = allowedPaths;
        localStorage.setItem('rolePermissions', JSON.stringify(allPerms));
        showToast('Permissions saved successfully', 'success');
    };

    // Group pages
    const groupedPages = availablePages.reduce((acc, page) => {
        if (!acc[page.group]) acc[page.group] = [];
        acc[page.group].push(page);
        return acc;
    }, {});

    return (
        <AdminLayout>
            <Container fluid className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-dark mb-0">Page Access Control</h3>
                    <Button variant="success" onClick={handleSave} disabled={selectedRole === 'admin'}>
                        <FaSave className="me-2" /> Save Changes
                    </Button>
                </div>

                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                        <Form.Group as={Row} className="align-items-center">
                            <Form.Label column sm={2} className="fw-bold">Select Role:</Form.Label>
                            <Col sm={4}>
                                <Form.Select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.roleName}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            {selectedRole === 'admin' && (
                                <Col sm={6} className="text-muted small">
                                    * Admin role has full access by default.
                                </Col>
                            )}
                        </Form.Group>
                    </Card.Body>
                </Card>

                <Row>
                    {Object.keys(groupedPages).map(group => (
                        <Col md={6} lg={4} key={group} className="mb-4">
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Header className="bg-white fw-bold border-bottom-0 pt-3">
                                    {group} Module
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <Table hover className="mb-0">
                                        <tbody>
                                            {groupedPages[group].map(page => (
                                                <tr key={page.id}>
                                                    <td className="ps-4 align-middle">{page.name}</td>
                                                    <td className="text-end pe-4">
                                                        <Form.Check
                                                            type="switch"
                                                            checked={permissions[page.id] || false}
                                                            onChange={() => handleToggle(page.id)}
                                                            disabled={selectedRole === 'admin'}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </AdminLayout>
    );
};

export default PageAccess;
