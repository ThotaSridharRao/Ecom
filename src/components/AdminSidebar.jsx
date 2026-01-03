import React, { useState } from 'react';
import { Nav, Collapse } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaStore, FaPlus, FaList, FaChevronDown, FaChevronRight, FaChartLine, FaFileInvoice, FaMoneyBillWave, FaShoppingBag, FaUsersCog, FaKey, FaLock, FaUserPlus, FaAddressBook, FaUserFriends, FaTruck, FaBarcode, FaPercentage, FaClipboardList, FaFileAlt, FaTable } from 'react-icons/fa';

const AdminSidebar = ({ show, onToggle }) => {
    const location = useLocation();

    // Initialize open state based on current path
    const [openStore, setOpenStore] = useState(() => location.pathname.includes('/products') || location.pathname.includes('/store'));
    const [openSales, setOpenSales] = useState(() => location.pathname.includes('/sales'));
    const [openPurchase, setOpenPurchase] = useState(() => location.pathname.includes('/purchase'));
    const [openContacts, setOpenContacts] = useState(() => location.pathname.includes('/contacts'));
    const [openEmployee, setOpenEmployee] = useState(() => location.pathname.includes('/employee'));
    const [openStoreReports, setOpenStoreReports] = useState(() => location.pathname.includes('/admin/store/reports'));

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${show ? 'show' : ''}`}
                onClick={onToggle}
            ></div>

            {/* Sidebar */}
            <div className={`admin-sidebar d-flex flex-column ${show ? 'show' : ''}`}>
                <div className="sidebar-brand text-center d-none d-lg-block header-spacing">
                    Admin Panel
                </div>
                {/* Mobile Header in Sidebar */}
                <div className="sidebar-brand d-lg-none d-flex justify-content-between align-items-center p-3">
                    <span className="fw-bold fs-5">Admin Panel</span>
                    <button className="btn btn-link text-white p-0" onClick={onToggle} style={{ fontSize: '1.5rem' }}>&times;</button>
                </div>

                <Nav className="flex-column flex-grow-1 py-3">
                    <Nav.Link as={Link} to="/admin/dashboard" active={location.pathname === '/admin/dashboard'} className="sidebar-link d-flex align-items-center px-4 py-2">
                        <FaHome className="me-3" /> Dashboard
                    </Nav.Link>

                    {/* Store Menu */}
                    <div className="nav-item">
                        <div
                            className={`sidebar-link d-flex align-items-center justify-content-between px-4 py-2 ${openStore ? 'text-white' : ''}`}
                            onClick={() => setOpenStore(!openStore)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="d-flex align-items-center">
                                <FaStore className="me-3" /> Store
                            </div>
                            {openStore ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                        </div>
                        <Collapse in={openStore}>
                            <div className="submenu bg-dark bg-opacity-25" style={{ paddingLeft: '0' }}>
                                <Nav.Link as={Link} to="/admin/products/add" active={location.pathname === '/admin/products/add'} className="sidebar-link d-flex align-items-center py-2 ps-5" style={{ fontSize: '0.9rem' }}>
                                    <FaPlus className="me-3" size={12} /> Add Product
                                </Nav.Link>
                                <Nav.Link as={Link} to="/admin/products" active={location.pathname === '/admin/products'} className="sidebar-link d-flex align-items-center py-2 ps-5" style={{ fontSize: '0.9rem' }}>
                                    <FaList className="me-3" size={12} /> View Products
                                </Nav.Link>
                                <Nav.Link as={Link} to="/admin/products/barcode" active={location.pathname === '/admin/products/barcode'} className="sidebar-link d-flex align-items-center py-2 ps-5" style={{ fontSize: '0.9rem' }}>
                                    <FaBarcode className="me-3" size={12} /> Barcode Labels
                                </Nav.Link>
                                {/* Nested Reports Submenu */}
                                <div>
                                    <div
                                        className={`sidebar-link d-flex align-items-center justify-content-between py-2 ps-5 pe-4 ${openStoreReports ? 'text-white' : ''}`}
                                        onClick={(e) => { e.preventDefault(); setOpenStoreReports(!openStoreReports); }}
                                        style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                                    >
                                        <div className="d-flex align-items-center">
                                            <FaClipboardList className="me-3" size={12} /> Reports
                                        </div>
                                        {openStoreReports ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                                    </div>
                                    <Collapse in={openStoreReports}>
                                        <div className="bg-dark bg-opacity-50">
                                            <Nav.Link as={Link} to="/admin/store/reports/all-items" active={location.pathname === '/admin/store/reports/all-items'} className="sidebar-link d-flex align-items-center py-2" style={{ paddingLeft: '4.5rem', fontSize: '0.85rem' }}>
                                                <FaFileAlt className="me-3" size={10} /> All Item Report
                                            </Nav.Link>
                                            <Nav.Link as={Link} to="/admin/store/reports/rates" active={location.pathname === '/admin/store/reports/rates'} className="sidebar-link d-flex align-items-center py-2" style={{ paddingLeft: '4.5rem', fontSize: '0.85rem' }}>
                                                <FaTable className="me-3" size={10} /> Rate Report
                                            </Nav.Link>
                                        </div>
                                    </Collapse>
                                </div>
                            </div>
                        </Collapse>
                    </div>

                    {/* Sales Menu */}
                    <div className="nav-item">
                        <div
                            className={`sidebar-link d-flex align-items-center justify-content-between px-4 py-2 ${openSales ? 'text-white' : ''}`}
                            onClick={() => setOpenSales(!openSales)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="d-flex align-items-center">
                                <FaChartLine className="me-3" /> Sales
                            </div>
                            {openSales ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                        </div>
                        <Collapse in={openSales}>
                            <div className="submenu bg-dark bg-opacity-25" style={{ paddingLeft: '0' }}>
                                <Nav.Link as={Link} to="/admin/sales/create-invoice" active={location.pathname === '/admin/sales/create-invoice'} className="sidebar-link d-flex align-items-center py-2 ps-5" style={{ fontSize: '0.9rem' }}>
                                    <FaFileInvoice className="me-3" size={12} /> Create Invoice
                                </Nav.Link>
                                <Nav.Link as={Link} to="/admin/sales/invoices" active={location.pathname === '/admin/sales/invoices'} className="sidebar-link d-flex align-items-center py-2 ps-5" style={{ fontSize: '0.9rem' }}>
                                    <FaList className="me-3" size={12} /> Sale Invoice List
                                </Nav.Link>
                                <Nav.Link as={Link} to="/admin/sales/partial-payment" active={location.pathname === '/admin/sales/partial-payment'} className="sidebar-link d-flex align-items-center py-2 ps-5" style={{ fontSize: '0.9rem' }}>
                                    <FaMoneyBillWave className="me-3" size={12} /> Customer Ledger
                                </Nav.Link>
                                <Nav.Link as={Link} to="/admin/sales/partial-payments-list" active={location.pathname === '/admin/sales/partial-payments-list'} className="sidebar-link d-flex align-items-center py-2 ps-5" style={{ fontSize: '0.9rem' }}>
                                    <FaList className="me-3" size={12} /> Payment History
                                </Nav.Link>
                                <Nav.Link as={Link} to="/admin/sales/bulk-tax-update" active={location.pathname === '/admin/sales/bulk-tax-update'} className="sidebar-link d-flex align-items-center py-2 ps-5" style={{ fontSize: '0.9rem' }}>
                                    <FaPercentage className="me-3" size={12} /> GST Rate Revisions
                                </Nav.Link>
                            </div>
                        </Collapse>
                    </div>
                    {/* Purchase Menu */}
                    <div className="nav-item">
                        <div
                            className={`sidebar-link d-flex align-items-center justify-content-between px-4 py-2 ${openPurchase ? 'text-white' : ''}`}
                            onClick={() => setOpenPurchase(!openPurchase)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="d-flex align-items-center">
                                <FaShoppingBag className="me-3" /> Purchase
                            </div>
                            {openPurchase ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                        </div>
                        <Collapse in={openPurchase}>
                            <div className="submenu bg-dark bg-opacity-25" style={{ paddingLeft: '0' }}>
                                <Nav.Link as={Link} to="/admin/purchase/create" active={location.pathname === '/admin/purchase/create'} className="sidebar-link d-flex align-items-center py-2 ps-5" style={{ fontSize: '0.9rem' }}>
                                    <FaPlus className="me-3" size={12} /> Create Purchase
                                </Nav.Link>
                                <Nav.Link as={Link} to="/admin/purchase/list" active={location.pathname === '/admin/purchase/list'} className="sidebar-link d-flex align-items-center py-2 ps-5" style={{ fontSize: '0.9rem' }}>
                                    <FaList className="me-3" size={12} /> Purchase List
                                </Nav.Link>
                            </div>
                        </Collapse>
                    </div>
                    {/* Contacts Menu */}
                    <div className="nav-item">
                        <div
                            className={`sidebar-link d-flex align-items-center justify-content-between px-4 py-2 ${openContacts ? 'text-white' : ''}`}
                            onClick={() => setOpenContacts(!openContacts)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="d-flex align-items-center">
                                <FaAddressBook className="me-3" /> Contacts
                            </div>
                            {openContacts ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                        </div>
                        <Collapse in={openContacts}>
                            <div className="submenu bg-dark bg-opacity-25" style={{ paddingLeft: '0' }}>
                                <Nav.Link as={Link} to="/admin/contacts/customers" active={location.pathname === '/admin/contacts/customers'} className="sidebar-link d-flex align-items-center py-2 ps-5" style={{ fontSize: '0.9rem' }}>
                                    <FaUserFriends className="me-3" size={12} /> Customers
                                </Nav.Link>
                                <Nav.Link as={Link} to="/admin/contacts/vendors" active={location.pathname === '/admin/contacts/vendors'} className="sidebar-link d-flex align-items-center py-2 ps-5" style={{ fontSize: '0.9rem' }}>
                                    <FaTruck className="me-3" size={12} /> Vendors
                                </Nav.Link>
                            </div>
                        </Collapse>
                    </div>

                    {/* Employee Menu */}
                    <div className="nav-item">
                        <div
                            className={`sidebar-link d-flex align-items-center justify-content-between px-4 py-2 ${openEmployee ? 'text-white' : ''}`}
                            onClick={() => setOpenEmployee(!openEmployee)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="d-flex align-items-center">
                                <FaUsersCog className="me-3" /> Employee
                            </div>
                            {openEmployee ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                        </div>
                        <Collapse in={openEmployee}>
                            <div className="submenu bg-dark bg-opacity-25" style={{ paddingLeft: '0' }}>
                                <Nav.Link as={Link} to="/admin/employee/roles" active={location.pathname === '/admin/employee/roles'} className="sidebar-link d-flex align-items-center py-2 ps-5" style={{ fontSize: '0.9rem' }}>
                                    <FaKey className="me-3" size={12} /> Role Master
                                </Nav.Link>
                                <Nav.Link as={Link} to="/admin/employee/access" active={location.pathname === '/admin/employee/access'} className="sidebar-link d-flex align-items-center py-2 ps-5" style={{ fontSize: '0.9rem' }}>
                                    <FaLock className="me-3" size={12} /> Page Access
                                </Nav.Link>
                                <Nav.Link as={Link} to="/admin/employee/create" active={location.pathname === '/admin/employee/create'} className="sidebar-link d-flex align-items-center py-2 ps-5" style={{ fontSize: '0.9rem' }}>
                                    <FaUserPlus className="me-3" size={12} /> Create Employee
                                </Nav.Link>
                            </div>
                        </Collapse>
                    </div>
                </Nav >

                <div className="p-3 text-center text-muted small border-top border-secondary">
                    &copy; 2023 EcomStore
                </div>
            </div >
        </>
    );
};

export default AdminSidebar;
