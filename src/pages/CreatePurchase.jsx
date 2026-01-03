import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Container, Row, Col, Card, Form, Button, Table, InputGroup, ListGroup, Badge, Modal } from 'react-bootstrap';
import { useProduct } from '../context/ProductContext';
import { FaSearch, FaBarcode, FaTrash, FaPlus, FaSave, FaPrint, FaTimes } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';

const CreatePurchase = () => {
    const { products } = useProduct(); // In real app, might want to add products not in DB? For now assume selecting existing.
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const searchRef = useRef(null);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [originalPurchase, setOriginalPurchase] = useState(null);

    // Scanner State
    const [showScanner, setShowScanner] = useState(false);
    const [scanInput, setScanInput] = useState('');
    const scannerInputRef = useRef(null);

    // Barcode Buffer
    const barcodeBuffer = useRef('');
    const lastKeyTime = useRef(0);
    const SCAN_TIMEOUT = 50;

    // Purchase Header Data
    const [purchaseData, setPurchaseData] = useState({
        vendorName: '',
        contactNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseNumber: `PUR-${Date.now()}`,
    });

    // Vendor Autocomplete State
    const [vendSuggestions, setVendSuggestions] = useState([]);
    const [showVendNameList, setShowVendNameList] = useState(false);
    const [showVendMobileList, setShowVendMobileList] = useState(false);
    const vendNameRef = useRef(null);
    const vendMobileRef = useRef(null);

    // Handle Click Outside Vendor Dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (vendNameRef.current && !vendNameRef.current.contains(event.target)) {
                setShowVendNameList(false);
            }
            if (vendMobileRef.current && !vendMobileRef.current.contains(event.target)) {
                setShowVendMobileList(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleVendNameChange = (e) => {
        const val = e.target.value;
        setPurchaseData({ ...purchaseData, vendorName: val });

        if (val.length > 0) {
            const all = JSON.parse(localStorage.getItem('allVendors') || '[]');
            const matches = all.filter(v => v.name.toLowerCase().includes(val.toLowerCase()));
            setVendSuggestions(matches);
            setShowVendNameList(true);
            setShowVendMobileList(false);
        } else {
            setShowVendNameList(false);
        }
    };

    const handleVendMobileChange = (e) => {
        const val = e.target.value;
        setPurchaseData({ ...purchaseData, contactNumber: val });

        if (val.length > 0) {
            const all = JSON.parse(localStorage.getItem('allVendors') || '[]');
            const matches = all.filter(v => v.mobile.includes(val));
            setVendSuggestions(matches);
            setShowVendMobileList(true);
            setShowVendNameList(false);
        } else {
            setShowVendMobileList(false);
        }
    };

    const selectVendor = (vend) => {
        setPurchaseData(prev => ({ ...prev, vendorName: vend.name, contactNumber: vend.mobile }));
        setShowVendNameList(false);
        setShowVendMobileList(false);
    };

    // Added Items
    const [items, setItems] = useState([]);

    // Purchase Summary Data
    const [summary, setSummary] = useState({
        extraCharge: 0,
        overallDiscount: 0,
        overallDiscountType: 'percentage',
        paymentMode: 'Cash',
        amountPaid: 0,
        isFullPayment: true // Default to full payment
    });

    // Check for Edit Data on Mount
    useEffect(() => {
        if (location.state && location.state.purchaseToEdit) {
            const editData = location.state.purchaseToEdit;
            console.log("Editing Purchase:", editData);

            setPurchaseData({
                vendorName: editData.vendorName,
                contactNumber: editData.contactNumber || editData.mobile,
                purchaseDate: editData.purchaseDate || editData.date,
                purchaseNumber: editData.purchaseNumber
            });

            if (editData.items) setItems(editData.items);
            if (editData.summary) {
                const s = editData.summary;
                const isFull = s.hasOwnProperty('isFullPayment') ? s.isFullPayment : (s.amountPaid === undefined || s.amountPaid >= s.grandTotal);
                const paid = s.amountPaid !== undefined ? s.amountPaid : s.grandTotal;
                setSummary({ ...s, isFullPayment: isFull, amountPaid: paid });
            }

            setIsEditing(true);
            setOriginalPurchase(editData);
        }
    }, [location.state]);

    // Search Logic
    useEffect(() => {
        if (searchTerm.trim()) {
            const results = products.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, products]);

    // Handle Click Outside Search
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus Scanner Input (Modal)
    useEffect(() => {
        if (showScanner && scannerInputRef.current) {
            scannerInputRef.current.focus();
        }
    }, [showScanner]);

    // Global Scanner Listener
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            const currentTime = Date.now();
            const timeDiff = currentTime - lastKeyTime.current;
            if (timeDiff > SCAN_TIMEOUT) {
                barcodeBuffer.current = '';
            }
            lastKeyTime.current = currentTime;

            if (e.key === 'Enter') {
                if (barcodeBuffer.current.length > 2) {
                    processScannedCode(barcodeBuffer.current);
                    barcodeBuffer.current = '';
                }
            } else if (e.key.length === 1) {
                barcodeBuffer.current += e.key;
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, [products, items]);

    // Process Code
    const processScannedCode = (code) => {
        const codeToFind = code.trim().toUpperCase();
        const found = products.find(p =>
            (p.code && p.code.toUpperCase() === codeToFind) ||
            String(p.id) === codeToFind
        );

        if (found) {
            addItem(found);
            showToast(`Scanned: ${found.name}`, 'success');
        } else {
            console.log("Scan not found:", codeToFind);
        }
    };

    // Add Item to Purchase
    const addItem = (product) => {
        const existingIndex = items.findIndex(item => item.productId === product.id);

        if (existingIndex > -1) {
            updateItem(existingIndex, 'qty', items[existingIndex].qty + 1);
            showToast(`Increased quantity for ${product.name}`, 'info');
        } else {
            // Note: Purchase Price might be different from Selling Price (MRP).
            // For now defaulting to MRP/Price, but user can edit.
            const price = parseFloat(product.price.replace(/[^\d.]/g, ''));
            const newItem = {
                productId: product.id,
                name: product.name,
                hsn: product.hsn || '',
                qty: 1,
                price: price, // Purchase Price
                discountPercent: 0,
                taxPercent: 0,
            };
            setItems(prevItems => [...prevItems, newItem]);
            showToast(`${product.name} added`, 'success');
        }
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleBarcodeSubmit = (e) => {
        e.preventDefault();
        const codeToFind = scanInput.trim().toUpperCase();
        if (!codeToFind) return;

        const found = products.find(p =>
            (p.code && p.code.toUpperCase() === codeToFind) ||
            String(p.id) === codeToFind
        );

        if (found) {
            addItem(found);
            setScanInput('');
            showToast(`Scanned: ${found.name}`, 'success');
        } else {
            showToast(`Product not found with code: ${codeToFind}`, 'error');
            setScanInput('');
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        let val = parseFloat(value);
        if (isNaN(val) && field !== 'name') val = 0;

        newItems[index] = { ...newItems[index], [field]: val };
        setItems(newItems);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const calculateRow = (item) => {
        const price = parseFloat(item.price || 0);
        const qty = parseFloat(item.qty || 0);
        const disc = parseFloat(item.discountPercent || 0);
        const tax = parseFloat(item.taxPercent || 0);

        const discountedPrice = price * (1 - disc / 100);
        const taxAmount = discountedPrice * (tax / 100);
        const total = (discountedPrice + taxAmount) * qty;

        return { discountedPrice, total };
    };

    const calculateSummary = () => {
        const subTotal = items.reduce((acc, item) => acc + calculateRow(item).total, 0);

        let discountAmount = 0;
        if (summary.overallDiscountType === 'percentage') {
            discountAmount = subTotal * (summary.overallDiscount / 100);
        } else {
            discountAmount = summary.overallDiscount;
        }

        const totalAfterDiscount = Math.max(0, subTotal - discountAmount);
        const grandTotal = totalAfterDiscount + parseFloat(summary.extraCharge || 0);

        return { subTotal, discountAmount, grandTotal };
    };

    const { subTotal, discountAmount, grandTotal } = calculateSummary();

    // Auto-update amountPaid if Full Payment
    useEffect(() => {
        if (summary.isFullPayment) {
            setSummary(prev => ({ ...prev, amountPaid: grandTotal }));
        }
    }, [grandTotal, summary.isFullPayment]);

    const handleSave = () => {
        if (!purchaseData.vendorName || !purchaseData.contactNumber) {
            showToast('Please enter vendor details', 'error');
            return;
        }
        if (items.length === 0) {
            showToast('Please add items', 'error');
            return;
        }

        const finalAmountPaid = summary.isFullPayment ? grandTotal : parseFloat(summary.amountPaid || 0);
        const balance = grandTotal - finalAmountPaid;
        let paymentStatus = 'Paid';
        if (balance > 0.5) {
            paymentStatus = finalAmountPaid > 0 ? 'Partial' : 'Pending';
        }

        const fullPurchase = {
            ...purchaseData,
            items,
            summary: {
                ...summary,
                subTotal,
                discountAmount,
                grandTotal,
                amountPaid: finalAmountPaid,
                balance,
                status: paymentStatus
            },
            timestamp: isEditing && originalPurchase.timestamp ? originalPurchase.timestamp : Date.now()
        };

        const existingPurchases = JSON.parse(localStorage.getItem('allPurchases') || '[]');

        if (isEditing) {
            const index = existingPurchases.findIndex(p => p.purchaseNumber === fullPurchase.purchaseNumber);
            if (index > -1) {
                existingPurchases[index] = fullPurchase;
                showToast('Purchase updated successfully', 'success');
            } else {
                existingPurchases.push(fullPurchase);
                showToast('New purchase created from edit', 'success');
            }
        } else {
            existingPurchases.push(fullPurchase);
            showToast('Purchase saved successfully!', 'success');
        }

        localStorage.setItem('allPurchases', JSON.stringify(existingPurchases));

        // Auto-Save Vendor to Master
        const allVendors = JSON.parse(localStorage.getItem('allVendors') || '[]');
        // Check by Mobile if exists, else check by Name (if mobile is empty, but mobile is mandatory here)
        const existingVendorIndex = allVendors.findIndex(v =>
            v.mobile === fullPurchase.contactNumber ||
            (v.name.toLowerCase() === fullPurchase.vendorName.toLowerCase() && v.mobile === fullPurchase.contactNumber)
        );

        if (existingVendorIndex === -1 && fullPurchase.contactNumber.length >= 10) {
            const newVend = {
                id: `VEND-${Date.now()}`,
                name: fullPurchase.vendorName,
                contactPerson: '',
                mobile: fullPurchase.contactNumber,
                address: '',
                gstin: ''
            };
            allVendors.unshift(newVend);
            localStorage.setItem('allVendors', JSON.stringify(allVendors));
            console.log("New vendor auto-added to Master:", newVend.name);
        }

        // Reset
        setTimeout(() => {
            setItems([]);
            setPurchaseData(prev => ({
                ...prev,
                vendorName: '',
                contactNumber: '',
                purchaseNumber: `PUR-${Date.now()}`
            }));
            setSummary({ extraCharge: 0, overallDiscount: 0, overallDiscountType: 'percentage', paymentMode: 'Cash', amountPaid: 0, isFullPayment: true });
            setIsEditing(false);
            setOriginalPurchase(null);
            navigate(location.pathname, { replace: true, state: {} });
        }, 1500);
    };

    return (
        <AdminLayout>
            <Container fluid className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="fw-bold text-dark mb-0">Create Purchase</h3>
                    {/* No Print Button for now, maybe Print PO later */}
                </div>

                <Card className="border-0 shadow-sm mb-3">
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={3} className="position-relative" ref={vendNameRef}>
                                <Form.Label className="small text-muted mb-1">Vendor Name *</Form.Label>
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    placeholder="Enter Vendor Name"
                                    value={purchaseData.vendorName}
                                    onChange={handleVendNameChange}
                                    onFocus={() => {
                                        if (purchaseData.vendorName) setShowVendNameList(true);
                                    }}
                                    autoComplete="off"
                                />
                                {showVendNameList && vendSuggestions.length > 0 && (
                                    <ListGroup className="position-absolute shadow w-100" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                        {vendSuggestions.map((vend, idx) => (
                                            <ListGroup.Item
                                                key={idx}
                                                action
                                                onClick={() => selectVendor(vend)}
                                                className="py-2"
                                            >
                                                <div className="fw-bold small">{vend.name}</div>
                                                <small className="text-muted">{vend.mobile}</small>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Col>
                            <Col md={3} className="position-relative" ref={vendMobileRef}>
                                <Form.Label className="small text-muted mb-1">Contact Number *</Form.Label>
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    placeholder="Enter Contact"
                                    value={purchaseData.contactNumber}
                                    onChange={handleVendMobileChange}
                                    onFocus={() => {
                                        if (purchaseData.contactNumber) setShowVendMobileList(true);
                                    }}
                                    autoComplete="off"
                                />
                                {showVendMobileList && vendSuggestions.length > 0 && (
                                    <ListGroup className="position-absolute shadow w-100" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                        {vendSuggestions.map((vend, idx) => (
                                            <ListGroup.Item
                                                key={idx}
                                                action
                                                onClick={() => selectVendor(vend)}
                                                className="py-2"
                                            >
                                                <div className="fw-bold small">{vend.mobile}</div>
                                                <small className="text-muted">{vend.name}</small>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Col>
                            <Col md={3}>
                                <Form.Label className="small text-muted mb-1">Purchase Date</Form.Label>
                                <Form.Control
                                    size="sm"
                                    type="date"
                                    value={purchaseData.purchaseDate}
                                    onChange={(e) => setPurchaseData({ ...purchaseData, purchaseDate: e.target.value })}
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="small text-muted mb-1">Purchase No</Form.Label>
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    value={purchaseData.purchaseNumber}
                                    readOnly
                                    className="bg-light"
                                />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>



                {/* Items Table (Moved to Top) */}
                <Card className="border-0 shadow-sm mb-3" style={{ maxWidth: '100%' }}>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table className="mb-0 text-nowrap table-sm align-middle">
                                <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="px-3 py-2" style={{ width: '20%' }}>Product Name</th>
                                        <th className="px-3 py-2" style={{ width: '10%' }}>HSN</th>
                                        <th className="px-3 py-2" style={{ width: '8%' }}>Qty</th>
                                        <th className="px-3 py-2" style={{ width: '10%' }}>Price/Unit</th>
                                        <th className="px-3 py-2" style={{ width: '8%' }}>Disc %</th>
                                        <th className="px-3 py-2" style={{ width: '8%' }}>Tax %</th>
                                        <th className="px-3 py-2 text-end" style={{ width: '15%' }}>Total</th>
                                        <th className="px-3 py-2 text-center" style={{ width: '6%' }}><FaTrash /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => {
                                        const { total } = calculateRow(item);
                                        return (
                                            <tr key={index}>
                                                <td className="px-3">{item.name}</td>
                                                <td className="px-3">
                                                    <Form.Control
                                                        size="sm" type="text"
                                                        value={item.hsn || ''}
                                                        onChange={(e) => updateItem(index, 'hsn', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-3">
                                                    <Form.Control
                                                        size="sm" type="number" min="1"
                                                        value={item.qty}
                                                        onChange={(e) => updateItem(index, 'qty', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-3">
                                                    <Form.Control
                                                        size="sm" type="number"
                                                        value={item.price}
                                                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-3">
                                                    <Form.Control
                                                        size="sm" type="number" min="0" max="100"
                                                        value={item.discountPercent}
                                                        onChange={(e) => updateItem(index, 'discountPercent', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-3">
                                                    <Form.Control
                                                        size="sm" type="number" min="0" max="100"
                                                        value={item.taxPercent}
                                                        onChange={(e) => updateItem(index, 'taxPercent', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-3 text-end fw-bold">
                                                    ₹{total.toFixed(2)}
                                                </td>
                                                <td className="px-3 text-center">
                                                    <Button variant="link" className="text-danger p-0" onClick={() => removeItem(index)}>
                                                        <FaTrash size={12} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4 text-muted small">
                                                No items added. Use the search bar below to add products.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>

                {/* Product Search & Add (Moved Below Table) */}
                <Card className="border-0 shadow-sm mb-3 overflow-visible">
                    <Card.Body>
                        <Row className="g-2">
                            <Col className="position-relative" ref={searchRef}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white border-end-0"><FaSearch className="text-muted" /></InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search Product to Purchase..."
                                        className="border-start-0"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                processScannedCode(searchTerm);
                                            }
                                        }}
                                        autoComplete="off"
                                    />
                                    <Button variant="outline-primary" onClick={() => setShowScanner(true)} title="Scan Barcode"><FaBarcode /> Scan/Enter Code</Button>
                                </InputGroup>
                                {searchResults.length > 0 && (
                                    <div className="position-absolute w-100 bg-white shadow-lg border rounded mt-1" style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}>
                                        <ListGroup variant="flush">
                                            {searchResults.map(prod => (
                                                <ListGroup.Item
                                                    key={prod.id}
                                                    action
                                                    onClick={() => addItem(prod)}
                                                    className="d-flex justify-content-between align-items-center"
                                                >
                                                    <div>
                                                        <div className="fw-bold small">{prod.name}</div>
                                                        <div className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>Code: {prod.code || 'N/A'}</div>
                                                    </div>
                                                    <div className="fw-bold text-primary">{prod.price}</div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Row className="g-3">
                    <Col lg={7}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <h6 className="fw-bold mb-3">Additional Details</h6>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Label className="small text-muted mb-1">Extra Charge (₹)</Form.Label>
                                        <Form.Control
                                            size="sm" type="number" min="0"
                                            value={summary.extraCharge}
                                            onChange={(e) => setSummary({ ...summary, extraCharge: e.target.value })}
                                        />
                                        <Form.Text className="text-muted extra-small">Shipping, etc.</Form.Text>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="small text-muted mb-1">Overall Discount (%)</Form.Label>
                                        <Form.Control
                                            size="sm" type="number" min="0"
                                            value={summary.overallDiscount}
                                            onChange={(e) => setSummary({ ...summary, overallDiscount: e.target.value })}
                                        />
                                    </Col>
                                </Row>
                                <Row className="align-items-center">
                                    <Col md={4}>
                                        <Form.Label className="small text-muted mb-1">Payment Mode</Form.Label>
                                        <Form.Select
                                            size="sm"
                                            value={summary.paymentMode}
                                            onChange={(e) => setSummary({ ...summary, paymentMode: e.target.value })}
                                        >
                                            <option value="Cash">Cash</option>
                                            <option value="UPI">UPI</option>
                                            <option value="Card">Card</option>
                                            <option value="Net Banking">Net Banking</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={4} className="pt-3">
                                        <Form.Check
                                            type="checkbox" label="Full Payment Paid"
                                            checked={summary.isFullPayment}
                                            onChange={(e) => setSummary({ ...summary, isFullPayment: e.target.checked })}
                                            className="small text-dark fw-bold"
                                        />
                                    </Col>
                                    {!summary.isFullPayment && (
                                        <Col md={4}>
                                            <Form.Label className="small text-muted mb-1">Amount Paid (₹)</Form.Label>
                                            <Form.Control
                                                size="sm" type="number" min="0"
                                                value={summary.amountPaid}
                                                onChange={(e) => setSummary({ ...summary, amountPaid: e.target.value })}
                                                className="border-primary"
                                            />
                                        </Col>
                                    )}
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={5}>
                        <Card className="border-0 shadow-sm h-100 bg-light">
                            <Card.Body className="d-flex flex-column justify-content-center">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Subtotal:</span>
                                    <span className="fw-bold">₹{subTotal.toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2 text-primary">
                                    <span className="text-muted">Discount:</span>
                                    <span>- ₹{discountAmount.toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Extra Charges:</span>
                                    <span>+ ₹{parseFloat(summary.extraCharge || 0).toFixed(2)}</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <span className="fs-5 fw-bold text-dark">Grand Total:</span>
                                    <span className="fs-4 fw-bold text-primary">₹{grandTotal.toFixed(2)}</span>
                                </div>
                                {!summary.isFullPayment && (
                                    <>
                                        <div className="d-flex justify-content-between align-items-center mb-1 text-success">
                                            <span className="fw-bold">Amount Paid:</span>
                                            <span className="fw-bold">₹{parseFloat(summary.amountPaid || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-4 text-danger border-top border-bottom py-2">
                                            <span className="fs-6 fw-bold">Balance Due:</span>
                                            <span className="fs-5 fw-bold">₹{(grandTotal - parseFloat(summary.amountPaid || 0)).toFixed(2)}</span>
                                        </div>
                                    </>
                                )}
                                <Button variant="success" size="lg" className="w-100 fw-bold" onClick={handleSave}>
                                    <FaSave className="me-2" /> Save Purchase
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Modal show={showScanner} onHide={() => setShowScanner(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="h5"><FaBarcode className="me-2" /> Scan Barcode</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleBarcodeSubmit}>
                            <InputGroup>
                                <Form.Control
                                    ref={scannerInputRef}
                                    placeholder="Listening for Scan..."
                                    value={scanInput}
                                    onChange={(e) => setScanInput(e.target.value)}
                                    autoComplete="off"
                                />
                                <Button type="submit" variant="primary">Submit</Button>
                            </InputGroup>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container >
        </AdminLayout >
    );
};

export default CreatePurchase;
