import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Container, Row, Col, Card, Form, Button, Table, InputGroup, ListGroup, Badge, Modal } from 'react-bootstrap';
import { useProduct } from '../context/ProductContext';
import { FaSearch, FaBarcode, FaTrash, FaPlus, FaSave, FaPrint, FaTimes } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';

const CreateInvoice = () => {
    const { products } = useProduct();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const searchRef = useRef(null);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [originalInvoice, setOriginalInvoice] = useState(null);

    // Scanner State
    const [showScanner, setShowScanner] = useState(false);
    const [scanInput, setScanInput] = useState('');
    const scannerInputRef = useRef(null);

    // Barcode Buffer
    const barcodeBuffer = useRef('');
    const lastKeyTime = useRef(0);
    const SCAN_TIMEOUT = 50;

    // Invoice Header Data
    const [invoiceData, setInvoiceData] = useState({
        customerName: '',
        mobileNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        invoiceNumber: `INV-${Date.now()}`,
    });

    // Customer Autocomplete State
    const [custSuggestions, setCustSuggestions] = useState([]);
    const [showCustNameList, setShowCustNameList] = useState(false);
    const [showCustMobileList, setShowCustMobileList] = useState(false);
    const custNameRef = useRef(null);
    const custMobileRef = useRef(null);

    // Handle Click Outside Customer Dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (custNameRef.current && !custNameRef.current.contains(event.target)) {
                setShowCustNameList(false);
            }
            if (custMobileRef.current && !custMobileRef.current.contains(event.target)) {
                setShowCustMobileList(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCustNameChange = (e) => {
        const val = e.target.value;
        setInvoiceData({ ...invoiceData, customerName: val });

        if (val.length > 0) {
            const all = JSON.parse(localStorage.getItem('allCustomers') || '[]');
            const matches = all.filter(c => c.name.toLowerCase().includes(val.toLowerCase()));
            setCustSuggestions(matches);
            setShowCustNameList(true);
            setShowCustMobileList(false);
        } else {
            setShowCustNameList(false);
        }
    };

    const handleCustMobileChange = (e) => {
        const val = e.target.value;
        setInvoiceData({ ...invoiceData, mobileNumber: val });

        if (val.length > 0) {
            const all = JSON.parse(localStorage.getItem('allCustomers') || '[]');
            // Match start of mobile for better UX? or includes?
            const matches = all.filter(c => c.mobile.includes(val));
            setCustSuggestions(matches);
            setShowCustMobileList(true);
            setShowCustNameList(false);
        } else {
            setShowCustMobileList(false);
        }
    };

    const selectCustomer = (cust) => {
        setInvoiceData(prev => ({ ...prev, customerName: cust.name, mobileNumber: cust.mobile }));
        setShowCustNameList(false);
        setShowCustMobileList(false);
    };

    // Added Items
    const [items, setItems] = useState([]);

    // Invoice Summary Data
    const [summary, setSummary] = useState({
        extraCharge: 0,
        overallDiscount: 0,
        overallDiscountType: 'percentage',
        paymentMode: 'Cash',
        amountPaid: 0,
        isFullPayment: true // Default to full payment
    });

    // Previous Dues State
    const [previousDues, setPreviousDues] = useState(0);

    // Calculate Previous Dues when Mobile Changes
    useEffect(() => {
        if (invoiceData.mobileNumber && invoiceData.mobileNumber.length >= 10) {
            const allInvoices = JSON.parse(localStorage.getItem('allInvoices') || '[]');
            const allPayments = JSON.parse(localStorage.getItem('allPayments') || '[]');

            const mobile = invoiceData.mobileNumber;

            // 1. Total Debits (Past Invoices)
            // If editing, exclude current invoice from history
            const pastInvoices = allInvoices.filter(inv =>
                inv.mobileNumber === mobile &&
                (!isEditing || inv.invoiceNumber !== invoiceData.invoiceNumber)
            );

            const totalDebits = pastInvoices.reduce((sum, inv) => sum + (inv.summary?.grandTotal || 0), 0);

            // 2. Total Credits (Past Payments)
            const totalInvoicePayments = pastInvoices.reduce((sum, inv) => sum + (inv.summary?.amountPaid || 0), 0);

            const manualPayments = allPayments
                .filter(p => p.mobileNumber === mobile)
                .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

            const totalCredits = totalInvoicePayments + manualPayments;

            const balance = totalDebits - totalCredits;
            setPreviousDues(balance);
        } else {
            setPreviousDues(0);
        }
    }, [invoiceData.mobileNumber, isEditing, invoiceData.invoiceNumber]);








    // Check for Edit Data on Mount
    useEffect(() => {
        if (location.state && location.state.invoiceToEdit) {
            const editData = location.state.invoiceToEdit;
            console.log("Editing Invoice:", editData);

            setInvoiceData({
                customerName: editData.customerName,
                mobileNumber: editData.mobileNumber || editData.mobile,
                invoiceDate: editData.invoiceDate || editData.date,
                invoiceNumber: editData.invoiceNumber
            });

            if (editData.items) setItems(editData.items);
            if (editData.summary) {
                const s = editData.summary;
                // Handle legacy data where isFullPayment/amountPaid might be missing
                const isFull = s.hasOwnProperty('isFullPayment') ? s.isFullPayment : (s.amountPaid === undefined || s.amountPaid >= s.grandTotal);
                const paid = s.amountPaid !== undefined ? s.amountPaid : s.grandTotal;

                setSummary({
                    ...s,
                    isFullPayment: isFull,
                    amountPaid: paid
                });
            }

            setIsEditing(true);
            setOriginalInvoice(editData);
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

            const tagName = document.activeElement.tagName;
            // Reset buffer if not rapid scan (human typing)
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

    // Add Item to Invoice
    const addItem = (product) => {
        const existingIndex = items.findIndex(item => item.productId === product.id);

        if (existingIndex > -1) {
            updateItem(existingIndex, 'qty', items[existingIndex].qty + 1);
            showToast(`Increased quantity for ${product.name}`, 'info');
        } else {
            const price = parseFloat(product.price.replace(/[^\d.]/g, ''));
            const newItem = {
                productId: product.id,
                name: product.name,
                hsn: product.hsn || '',
                qty: 1,
                mrp: price,
                discountPercent: 0,
                taxPercent: 0,
            };
            setItems(prevItems => [...prevItems, newItem]);
            showToast(`${product.name} added`, 'success');
        }
        setSearchTerm('');
        setSearchResults([]);
    };

    // Handle Barcode Scan (Modal / Manual)
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

    // Update Item Field
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

    // Calculations Helper
    const calculateRow = (item) => {
        const mrp = parseFloat(item.mrp || 0);
        const qty = parseFloat(item.qty || 0);
        const disc = parseFloat(item.discountPercent || 0);
        const tax = parseFloat(item.taxPercent || 0);

        const sellingPrice = mrp * (1 - disc / 100);
        const taxAmount = sellingPrice * (tax / 100);
        const total = (sellingPrice + taxAmount) * qty;

        return { sellingPrice, total };
    };

    // Summary Calculations
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

    // Auto-update amountPaid if Full Payment is selected
    useEffect(() => {
        if (summary.isFullPayment) {
            setSummary(prev => ({ ...prev, amountPaid: grandTotal }));
        }
    }, [grandTotal, summary.isFullPayment]);

    const handleSaveAndPrint = () => {
        if (!invoiceData.customerName || !invoiceData.mobileNumber) {
            showToast('Please enter customer details', 'error');
            return;
        }
        if (items.length === 0) {
            showToast('Please add items to invoice', 'error');
            return;
        }

        const finalAmountPaid = summary.isFullPayment ? grandTotal : parseFloat(summary.amountPaid || 0);
        const balance = grandTotal - finalAmountPaid;
        let paymentStatus = 'Paid';
        if (balance > 0.5) { // Small buffer for float issues
            paymentStatus = finalAmountPaid > 0 ? 'Partial' : 'Pending';
        }

        const fullInvoice = {
            ...invoiceData,
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
            timestamp: isEditing && originalInvoice.timestamp ? originalInvoice.timestamp : Date.now()
        };

        const existingInvoices = JSON.parse(localStorage.getItem('allInvoices') || '[]');

        if (isEditing) {
            // Find and Update
            const index = existingInvoices.findIndex(inv => inv.invoiceNumber === fullInvoice.invoiceNumber);
            if (index > -1) {
                existingInvoices[index] = fullInvoice;
                showToast('Invoice updated successfully', 'success');
            } else {
                existingInvoices.push(fullInvoice);
                showToast('New invoice created from edit', 'success');
            }
        } else {
            // Create New
            existingInvoices.push(fullInvoice);
            showToast('Invoice saved successfully!', 'success');
        }

        localStorage.setItem('allInvoices', JSON.stringify(existingInvoices));
        localStorage.setItem('lastInvoice', JSON.stringify(fullInvoice));

        // Auto-Save Customer to Master if new
        const allCustomers = JSON.parse(localStorage.getItem('allCustomers') || '[]');
        const existingCustIndex = allCustomers.findIndex(c => c.mobile === fullInvoice.mobileNumber);

        if (existingCustIndex === -1 && fullInvoice.mobileNumber.length >= 10) {
            const newCust = {
                id: `CUST-${Date.now()}`,
                name: fullInvoice.customerName,
                mobile: fullInvoice.mobileNumber,
                email: '',
                address: '',
                gstin: ''
            };
            allCustomers.unshift(newCust); // Add to top
            localStorage.setItem('allCustomers', JSON.stringify(allCustomers));
            // Optional: Update current session suggestion cache if we had one? 
            // The autocomplete reads from localstorage directly on render/change, so it will pick it up next time.
            console.log("New customer auto-added to Master:", newCust.name);
        } else if (existingCustIndex > -1) {
            // Optional: Update name if changed? 
            // Let's not overwrite existing details implicitly. 
            // Only add if new.
        }

        // Print immediately
        printInvoice(fullInvoice);

        // Auto-Reset Logic
        setTimeout(() => {
            setItems([]);
            setInvoiceData(prev => ({
                ...prev,
                customerName: '',
                mobileNumber: '',
                invoiceNumber: `INV-${Date.now()}`
            }));
            setSummary({ extraCharge: 0, overallDiscount: 0, overallDiscountType: 'percentage', paymentMode: 'Cash' });
            setIsEditing(false);
            setOriginalInvoice(null);

            // Clear navigation state
            navigate(location.pathname, { replace: true, state: {} });
        }, 1500);
    };

    const handlePrintLast = () => {
        const saved = localStorage.getItem('lastInvoice');
        if (!saved) {
            showToast('No saved invoice found to print', 'warning');
            return;
        }
        const invoice = JSON.parse(saved);
        printInvoice(invoice);
    };

    const printInvoice = (invoice) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showToast('Pop-up blocked. Please allow pop-ups.', 'error');
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice #${invoice.invoiceNumber}</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #333; }
                        .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #333; padding-bottom: 10px; }
                        .section { margin-bottom: 15px; }
                        .flex { display: flex; justify-content: space-between; margin-bottom: 5px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9em; }
                        th, td { text-align: left; padding: 5px; border-bottom: 1px solid #ddd; }
                        .text-right { text-align: right; }
                        .grand-total { border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 10px 0; margin-top: 20px; font-weight: bold; font-size: 1.2em; }
                        .footer { text-align: center; margin-top: 40px; font-size: 0.8em; color: #666; }
                        @media print {
                            body { width: 80mm; margin: 0; padding: 5mm; } 
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2 style="margin:0;">EcomStore Pos</h2>
                        <p style="margin:5px 0;">Market St, Mumbai, India</p>
                        <p style="margin:0;">GST: 27AAAAA0000A1Z5</p>
                    </div>
                    
                    <div class="section">
                        <div class="flex"><span>Inv:</span> <span>${invoice.invoiceNumber}</span></div>
                        <div class="flex"><span>Date:</span> <span>${invoice.invoiceDate}</span></div>
                        <div class="flex"><span>Customer:</span> <span>${invoice.customerName}</span></div>
                        <div class="flex"><span>Mobile:</span> <span>${invoice.mobileNumber}</span></div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th class="text-right">Q</th>
                                <th class="text-right">Price</th>
                                <th class="text-right">Tot</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.items.map(item => {
            const price = (item.mrp * (1 - item.discountPercent / 100));
            const taxAmt = price * (item.taxPercent / 100);
            const unitTotal = price + taxAmt;
            const rowTotal = unitTotal * item.qty;
            return `
                                <tr>
                                    <td colspan="4" style="border:none; padding-bottom:0; font-weight:bold;">${item.name}</td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td class="text-right">${item.qty}</td>
                                    <td class="text-right">${item.mrp}</td>
                                    <td class="text-right">${rowTotal.toFixed(2)}</td>
                                </tr>`;
        }).join('')}
                        </tbody>
                    </table>

                    <div class="section" style="margin-top: 20px; border-top: 1px solid #ddd; padding-top:10px;">
                        <div class="flex"><span>Subtotal:</span> <span class="text-right">${invoice.summary.subTotal.toFixed(2)}</span></div>
                        <div class="flex"><span>Extra:</span> <span class="text-right">${invoice.summary.extraCharge}</span></div>
                        <div class="flex"><span>Discount:</span> <span class="text-right">-${invoice.summary.overallDiscount}%</span></div>
                    </div>

                    <div class="grand-total flex">
                        <span>TOTAL</span>
                        <span>₹${invoice.summary.grandTotal.toFixed(2)}</span>
                    </div>

                    ${invoice.summary.balance > 0 ? `
                    <div class="flex" style="border-bottom: 1px dashed #333; padding-bottom: 5px;">
                        <span>Paid Amount:</span>
                        <span>₹${invoice.summary.amountPaid?.toFixed(2)}</span>
                    </div>
                    <div class="flex" style="font-weight:bold; margin-top:5px;">
                        <span>Balance Due:</span>
                        <span>₹${invoice.summary.balance?.toFixed(2)}</span>
                    </div>
                    ` : ''}

                    <div class="footer">
                        <p>Thank you for visiting!</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <AdminLayout>
            <Container fluid className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="fw-bold text-dark mb-0">Create Invoice</h3>
                    <Button variant="outline-dark" size="sm" onClick={handlePrintLast}><FaPrint className="me-2" />Print Last Invoice</Button>
                </div>

                {/* 1. Invoice Header Info */}
                <Card className="border-0 shadow-sm mb-3">
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={3} className="position-relative" ref={custNameRef}>
                                <Form.Label className="small text-muted mb-1">Customer Name *</Form.Label>
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    placeholder="Enter Name"
                                    value={invoiceData.customerName}
                                    onChange={handleCustNameChange}
                                    onFocus={() => {
                                        if (invoiceData.customerName) setShowCustNameList(true);
                                    }}
                                    autoComplete="off"
                                />
                                {showCustNameList && custSuggestions.length > 0 && (
                                    <ListGroup className="position-absolute shadow w-100" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                        {custSuggestions.map((cust, idx) => (
                                            <ListGroup.Item
                                                key={idx}
                                                action
                                                onClick={() => selectCustomer(cust)}
                                                className="py-2"
                                            >
                                                <div className="fw-bold small">{cust.name}</div>
                                                <small className="text-muted">{cust.mobile}</small>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Col>
                            <Col md={3} className="position-relative" ref={custMobileRef}>
                                <Form.Label className="small text-muted mb-1">Mobile Number *</Form.Label>
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    placeholder="Enter Mobile"
                                    value={invoiceData.mobileNumber}
                                    onChange={handleCustMobileChange}
                                    onFocus={() => {
                                        if (invoiceData.mobileNumber) setShowCustMobileList(true);
                                    }}
                                    autoComplete="off"
                                />
                                {showCustMobileList && custSuggestions.length > 0 && (
                                    <ListGroup className="position-absolute shadow w-100" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                        {custSuggestions.map((cust, idx) => (
                                            <ListGroup.Item
                                                key={idx}
                                                action
                                                onClick={() => selectCustomer(cust)}
                                                className="py-2"
                                            >
                                                <div className="fw-bold small">{cust.mobile}</div>
                                                <small className="text-muted">{cust.name}</small>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                                {previousDues !== 0 && (
                                    <div className={`mt-1 extra-small fw-bold ${previousDues > 0 ? 'text-danger' : 'text-success'}`}>
                                        {previousDues > 0 ? `Prev Due: ₹${previousDues.toFixed(2)}` : `Adv Credit: ₹${Math.abs(previousDues).toFixed(2)}`}
                                    </div>
                                )}
                            </Col>
                            <Col md={3}>
                                <Form.Label className="small text-muted mb-1">Invoice Date</Form.Label>
                                <Form.Control
                                    size="sm"
                                    type="date"
                                    value={invoiceData.invoiceDate}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })}
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="small text-muted mb-1">Invoice No</Form.Label>
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    value={invoiceData.invoiceNumber}
                                    readOnly
                                    className="bg-light"
                                />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* 2. Items Table (Moved to Top) */}
                <Card className="border-0 shadow-sm mb-3" style={{ maxWidth: '100%' }}>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table className="mb-0 text-nowrap table-sm align-middle">
                                <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="px-3 py-2" style={{ width: '20%' }}>Product Name</th>
                                        <th className="px-3 py-2" style={{ width: '10%' }}>HSN</th>
                                        <th className="px-3 py-2" style={{ width: '8%' }}>Qty</th>
                                        <th className="px-3 py-2" style={{ width: '10%' }}>MRP</th>
                                        <th className="px-3 py-2" style={{ width: '8%' }}>Disc %</th>
                                        <th className="px-3 py-2" style={{ width: '12%' }}>Selling Price</th>
                                        <th className="px-3 py-2" style={{ width: '8%' }}>Tax %</th>
                                        <th className="px-3 py-2 text-end" style={{ width: '15%' }}>Item Total</th>
                                        <th className="px-3 py-2 text-center" style={{ width: '6%' }}><FaTrash /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => {
                                        const { sellingPrice, total } = calculateRow(item);
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
                                                        value={item.mrp}
                                                        onChange={(e) => updateItem(index, 'mrp', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-3">
                                                    <Form.Control
                                                        size="sm" type="number" min="0" max="100"
                                                        value={item.discountPercent}
                                                        onChange={(e) => updateItem(index, 'discountPercent', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-3 fw-bold small text-muted">
                                                    ₹{sellingPrice.toFixed(2)}
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
                                            <td colSpan="9" className="text-center py-4 text-muted small">
                                                No items added. Use the search bar below to add products.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>

                {/* 3. Product Search & Add (Moved Below Table) */}
                <Card className="border-0 shadow-sm mb-3 overflow-visible">
                    <Card.Body>
                        <Row className="g-2">
                            <Col className="position-relative" ref={searchRef}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white border-end-0"><FaSearch className="text-muted" /></InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search Product by Name or Code..."
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

                                {/* Search Dropdown */}
                                {searchResults.length > 0 && (
                                    <div className="position-absolute w-100 bg-white shadow-lg border rounded mt-1" style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}>
                                        <ListGroup variant="flush">
                                            {searchResults.map(prod => (
                                                <ListGroup.Item
                                                    key={prod.id}
                                                    action
                                                    onClick={() => {
                                                        addItem(prod);
                                                        setSearchTerm('');
                                                    }}
                                                    className="d-flex justify-content-between align-items-center"
                                                >
                                                    <div>
                                                        <div className="fw-bold small">{prod.name}</div>
                                                        <div className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>Code: {prod.code || 'N/A'} | Stock: {prod.stock || 50}</div>
                                                    </div>
                                                    <div className="fw-bold text-primary">{prod.price}</div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </div>
                                )}
                            </Col>
                        </Row>
                        <div className="text-end mt-1">
                            <Button variant="link" size="sm" className="text-decoration-none p-0" onClick={() => navigate('/admin/products')}>+ Add New Product to Master</Button>
                        </div>
                    </Card.Body>
                </Card>

                {/* 4. Summary & Actions */}
                <Row className="g-3">
                    <Col lg={7}>
                        {/* Summary Inputs */}
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <h6 className="fw-bold mb-3">Additional Details</h6>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Label className="small text-muted mb-1">Extra Charge (₹)</Form.Label>
                                        <Form.Control
                                            size="sm"
                                            type="number"
                                            min="0"
                                            value={summary.extraCharge}
                                            onChange={(e) => setSummary({ ...summary, extraCharge: e.target.value })}
                                        />
                                        <Form.Text className="text-muted extra-small" style={{ fontSize: '0.7rem' }}>Shipping, Packaging, etc.</Form.Text>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="small text-muted mb-1">Overall Discount (%)</Form.Label>
                                        <Form.Control
                                            size="sm"
                                            type="number"
                                            min="0"
                                            value={summary.overallDiscount}
                                            onChange={(e) => setSummary({ ...summary, overallDiscount: e.target.value })}
                                        />
                                        <Form.Text className="text-primary extra-small" style={{ fontSize: '0.7rem' }}>Applied on Subtotal only.</Form.Text>
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
                                            <option value="Card">Credit/Debit Card</option>
                                            <option value="Net Banking">Net Banking</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={4} className="pt-3">
                                        <Form.Check
                                            type="checkbox"
                                            label="Full Payment Received"
                                            checked={summary.isFullPayment}
                                            onChange={(e) => setSummary({ ...summary, isFullPayment: e.target.checked })}
                                            className="small text-dark fw-bold"
                                        />
                                    </Col>
                                    {!summary.isFullPayment && (
                                        <Col md={4}>
                                            <Form.Label className="small text-muted mb-1">Amount Paid (₹)</Form.Label>
                                            <Form.Control
                                                size="sm"
                                                type="number"
                                                min="0"
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
                        {/* Totals Display */}
                        <Card className="border-0 shadow-sm h-100 bg-light">
                            <Card.Body className="d-flex flex-column justify-content-center">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Subtotal:</span>
                                    <span className="fw-bold">₹{subTotal.toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2 text-danger">
                                    <span className="text-muted">Direct Discount ({summary.overallDiscount}%):</span>
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

                                {previousDues !== 0 && (
                                    <div className="alert alert-info py-2 mb-3">
                                        <div className="d-flex justify-content-between small mb-1">
                                            <span>Previous Due:</span>
                                            <span className={previousDues > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                                {previousDues > 0 ? `+ ₹${previousDues.toFixed(2)}` : `- ₹${Math.abs(previousDues).toFixed(2)}`}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between border-top pt-1 fw-bold">
                                            <span>Net Payable:</span>
                                            <span>₹{(grandTotal + previousDues).toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
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
                                <Button variant="primary" size="lg" className="w-100 fw-bold" onClick={handleSaveAndPrint}>
                                    <FaPrint className="me-2" /> Save & Print
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Barcode Scanner Modal */}
                <Modal show={showScanner} onHide={() => setShowScanner(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="h5"><FaBarcode className="me-2" /> Scan Barcode</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p className="text-muted small">
                            Use your barcode scanner or manually type the product ID/Code below and press Enter.
                        </p>
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
                        <div className="mt-3 text-center">
                            <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                            <span className="small text-muted">Ready to scan...</span>
                        </div>
                    </Modal.Body>
                </Modal>

            </Container>
        </AdminLayout >
    );
};

export default CreateInvoice;
