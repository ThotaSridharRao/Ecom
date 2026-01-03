import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <div className="bg-light min-vh-100 position-relative">
            {/* Sidebar */}
            <AdminSidebar show={showSidebar} onToggle={() => setShowSidebar(!showSidebar)} />

            {/* Main Content */}
            <div className="admin-content-wrapper d-flex flex-column min-vh-100">
                <div className="flex-grow-1 d-flex flex-column overflow-auto" style={{ overflowX: 'hidden' }}>
                    {/* Mobile Toggle & Header - Removed sticky-top to simplify flow */}
                    <div className="bg-white shadow-sm py-3 px-4 d-flex justify-content-between align-items-center flex-shrink-0 border-bottom">
                        <div className="d-flex align-items-center">
                            <Button variant="link" className="p-0 me-3 d-lg-none text-dark" onClick={() => setShowSidebar(!showSidebar)}>
                                <FaBars size={24} />
                            </Button>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <span className="fw-semibold d-none d-md-inline">Welcome, {user?.name}</span>
                            <Button variant="outline-danger" size="sm" onClick={() => { logout(); navigate('/'); }}>Logout</Button>
                        </div>
                    </div>

                    {/* Content - Added padding top to separate from header */}
                    <div className="px-2 px-md-4 py-4 flex-grow-1 bg-light admin-main-content">
                        {children}
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {showSidebar && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
                    style={{ zIndex: 1030 }}
                    onClick={() => setShowSidebar(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
