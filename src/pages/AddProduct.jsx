import React, { useState, useRef } from 'react';
import { Card, Form, Button, Row, Col, Container, InputGroup, Modal } from 'react-bootstrap';
import AdminLayout from '../components/AdminLayout';
import './AddProduct.css';
import { useProduct } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { FaPlus, FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

const AddProduct = () => {
    const { addProduct } = useProduct();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Data lists state
    const [categories, setCategories] = useState(['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty']);
    const [subCategoryMap, setSubCategoryMap] = useState({
        'Electronics': ['Mobile', 'Laptop', 'Accessories'],
        'Fashion': ['Shirt', 'Jeans', 'Shoes'],
        'Home & Kitchen': ['Cookware', 'Decor'],
        'Beauty': ['Skincare', 'Makeup']
    });
    const [brands, setBrands] = useState(['Samsung', 'Apple', 'Nike', 'Adidas', 'Sony']);
    const [units, setUnits] = useState(['Piece', 'Kg', 'Litre', 'Box', 'Dozen']);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        hsnCode: '',
        description: '',
        unit: '',
        category: '',
        subCategory: '',
        brand: '',
        mrp: '',
        sellingPrice: '',
        purchasePrice: '',
        sellingPriceTaxType: 'Inclusive',
        sellingPriceTaxRate: '',
        purchasePriceTaxType: 'Inclusive',
        purchasePriceTaxRate: '',
        image: '',
        batchNo: '',
        mfgDate: '',
        expDate: ''
    });

    const [imagePreview, setImagePreview] = useState(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalField, setModalField] = useState(''); // 'category', 'subCategory', 'brand', 'unit'
    const [newOptionValue, setNewOptionValue] = useState('');

    // Derived state for subcategories
    const currentSubCategories = formData.category ? (subCategoryMap[formData.category] || []) : [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            // Reset subCategory if category changes
            if (name === 'category') {
                return { ...prev, [name]: value, subCategory: '' };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showToast('File size should be less than 5MB', 'warning');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (e) => {
        e.stopPropagation(); // Prevent triggering click on parent
        setImagePreview(null);
        setFormData(prev => ({ ...prev, image: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleOpenModal = (field) => {
        if (field === 'subCategory' && !formData.category) {
            showToast('Please select a Category first.', 'warning');
            return;
        }
        setModalField(field);
        setNewOptionValue('');
        setShowModal(true);
    };

    const handleAddOption = () => {
        if (!newOptionValue.trim()) {
            showToast('Please enter a value.', 'warning');
            return;
        }

        const value = newOptionValue.trim();

        switch (modalField) {
            case 'category':
                if (!categories.includes(value)) setCategories(prev => [...prev, value]);
                setFormData(prev => ({ ...prev, category: value }));
                break;
            case 'subCategory':
                if (formData.category) {
                    setSubCategoryMap(prev => ({
                        ...prev,
                        [formData.category]: [...(prev[formData.category] || []), value]
                    }));
                    setFormData(prev => ({ ...prev, subCategory: value }));
                }
                break;
            case 'brand':
                if (!brands.includes(value)) setBrands(prev => [...prev, value]);
                setFormData(prev => ({ ...prev, brand: value }));
                break;
            case 'unit':
                if (!units.includes(value)) setUnits(prev => [...prev, value]);
                setFormData(prev => ({ ...prev, unit: value }));
                break;
            default:
                break;
        }

        setShowModal(false);
        showToast(`${value} added to ${modalField}!`, 'success');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.sellingPrice || !formData.category) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        const newProduct = {
            id: Date.now(),
            ...formData,
            title: formData.name, // Mapping for compatibility
            price: parseFloat(formData.sellingPrice), // Mapping for compatibility
            rating: { rate: 0, count: 0 } // Default rating
        };

        if (addProduct) {
            addProduct(newProduct);
            showToast('Product added successfully!', 'success');
            navigate('/admin/products');
        } else {
            console.log("Add Product data:", newProduct);
            showToast('Product addition logic is not yet implemented fully in context.', 'info');
        }
    };

    // Helper to render label properly
    const getFieldLabel = (field) => {
        switch (field) {
            case 'category': return 'Category';
            case 'subCategory': return 'Sub Category';
            case 'brand': return 'Brand';
            case 'unit': return 'Unit';
            default: return '';
        }
    };

    return (
        <AdminLayout>
            <Container fluid className="add-product-container px-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-primary mb-0">Add New Product</h5>
                    <div className="d-flex gap-2">
                        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/admin/products')}>Cancel</Button>
                        <Button variant="primary" size="sm" onClick={handleSubmit}>Save Product</Button>
                    </div>
                </div>

                <Form onSubmit={handleSubmit}>
                    {/* Top Row: Identity & Media */}
                    <Card className="form-card bg-white mb-3 border-0 shadow-sm">
                        <Card.Body className="p-3">
                            <Row className="g-3">
                                {/* Left: Image (Compact) */}
                                <Col xs={12} lg={2} className="border-end-lg d-flex flex-column align-items-center justify-content-center mb-3 mb-lg-0">
                                    <div
                                        className={`image-upload-area ${imagePreview ? 'has-image' : ''} w-100`}
                                        style={{ height: '140px', minHeight: 'auto', padding: '1rem' }}
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="Preview" className="image-preview" />
                                                <div className="remove-image-btn" onClick={removeImage} style={{ width: '24px', height: '24px', top: '5px', right: '5px' }}>
                                                    <FaTimes size={12} />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center">
                                                <FaCloudUploadAlt className="image-upload-icon mb-2" style={{ fontSize: '2rem' }} />
                                                <p className="image-upload-text mb-0 small" style={{ fontSize: '0.75rem' }}>Upload</p>
                                            </div>
                                        )}
                                        <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleImageChange} />
                                    </div>
                                    <div className="text-muted small mt-2 text-center" style={{ fontSize: '0.7rem' }}>Max: 5MB</div>
                                </Col>

                                {/* Right: Basic Info Grid */}
                                <Col xs={12} lg={10}>
                                    <Row className="g-3">
                                        <Col xs={12} md={6}>
                                            <Form.Label className="small mb-1 text-muted">Product Name *</Form.Label>
                                            <Form.Control size="sm" type="text" placeholder="Product Name" name="name" value={formData.name} onChange={handleChange} required className="fw-bold" />
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Form.Label className="small mb-1 text-muted">Product Code</Form.Label>
                                            <Form.Control size="sm" type="text" placeholder="Code" name="code" value={formData.code} onChange={handleChange} />
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Form.Label className="small mb-1 text-muted">HSN Code</Form.Label>
                                            <Form.Control size="sm" type="text" placeholder="HSN" name="hsnCode" value={formData.hsnCode} onChange={handleChange} />
                                        </Col>

                                        {/* Categorization Row */}
                                        <Col xs={6} md={3}>
                                            <Form.Label className="small mb-1 text-muted">Unit</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Select name="unit" value={formData.unit} onChange={handleChange}>
                                                    <option value="">Select</option>
                                                    {units.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                                                </Form.Select>
                                                <Button variant="outline-secondary" onClick={() => handleOpenModal('unit')}><FaPlus /></Button>
                                            </InputGroup>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Form.Label className="small mb-1 text-muted">Category *</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Select name="category" value={formData.category} onChange={handleChange} required>
                                                    <option value="">Select</option>
                                                    {categories.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                                                </Form.Select>
                                                <Button variant="outline-secondary" onClick={() => handleOpenModal('category')}><FaPlus /></Button>
                                            </InputGroup>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Form.Label className="small mb-1 text-muted">Sub Category</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Select
                                                    name="subCategory"
                                                    value={formData.subCategory}
                                                    onChange={handleChange}
                                                    disabled={!formData.category}
                                                >
                                                    <option value="">Select</option>
                                                    {currentSubCategories.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                                                </Form.Select>
                                                <Button
                                                    variant="outline-secondary"
                                                    onClick={() => handleOpenModal('subCategory')}
                                                    disabled={!formData.category}
                                                >
                                                    <FaPlus />
                                                </Button>
                                            </InputGroup>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Form.Label className="small mb-1 text-muted">Brand</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Select name="brand" value={formData.brand} onChange={handleChange}>
                                                    <option value="">Select</option>
                                                    {brands.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                                                </Form.Select>
                                                <Button variant="outline-secondary" onClick={() => handleOpenModal('brand')}><FaPlus /></Button>
                                            </InputGroup>
                                        </Col>

                                        {/* Inventory / Batch Details */}
                                        <Col xs={12} md={4}>
                                            <Form.Label className="small mb-1 text-muted">Batch No</Form.Label>
                                            <Form.Control size="sm" type="text" placeholder="Batch No" name="batchNo" value={formData.batchNo} onChange={handleChange} />
                                        </Col>
                                        <Col xs={6} md={4}>
                                            <Form.Label className="small mb-1 text-muted">Mfg Date</Form.Label>
                                            <Form.Control size="sm" type="date" name="mfgDate" value={formData.mfgDate} onChange={handleChange} />
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Form.Label className="small mb-1 text-muted">Exp Date</Form.Label>
                                            <Form.Control size="sm" type="date" name="expDate" value={formData.expDate} onChange={handleChange} />
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Form.Label className="small mb-1 text-muted fw-bold">Stock Qty</Form.Label>
                                            <Form.Control size="sm" type="number" placeholder="Qty" name="stock" value={formData.stock} onChange={handleChange} min="0" />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Bottom Row: Description & Pricing */}
                    <Row className="g-3">
                        {/* Description Column */}
                        <Col xs={12} lg={4}>
                            <Card className="form-card bg-white mb-3 border-0 shadow-sm h-100">
                                <Card.Body className="p-3 d-flex flex-column">
                                    <Form.Label className="small fw-bold text-muted">Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="flex-grow-1"
                                        style={{ resize: 'none', minHeight: '180px' }}
                                        placeholder="Enter product description here..."
                                    />
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Pricing Logic Column */}
                        <Col xs={12} lg={8}>
                            <Card className="form-card bg-white mb-3 border-0 shadow-sm h-100">
                                <Card.Body className="p-3">
                                    {/* Selling Price Row */}
                                    <div className="bg-light p-2 rounded mb-2 border">
                                        <Row className="align-items-center g-2">
                                            <Col xs={12} md={2} className="fw-bold text-muted small">Selling Price</Col>
                                            <Col xs={6} md={3}>
                                                <InputGroup size="sm">
                                                    <InputGroup.Text>₹</InputGroup.Text>
                                                    <Form.Control type="number" placeholder="Price" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} min="0" step="0.01" />
                                                </InputGroup>
                                            </Col>
                                            <Col xs={6} md={3}>
                                                <Form.Select size="sm" name="sellingPriceTaxType" value={formData.sellingPriceTaxType} onChange={handleChange}>
                                                    <option value="Inclusive">Inclusive</option>
                                                    <option value="Exclusive">Exclusive</option>
                                                </Form.Select>
                                            </Col>
                                            <Col xs={6} md={2}>
                                                <Form.Select size="sm" name="sellingPriceTaxRate" value={formData.sellingPriceTaxRate} onChange={handleChange}>
                                                    <option value="">No Tax</option>
                                                    <option value="5">5%</option>
                                                    <option value="12">12%</option>
                                                    <option value="18">18%</option>
                                                    <option value="28">28%</option>
                                                </Form.Select>
                                            </Col>
                                            <Col xs={6} md={2} className="text-end small">
                                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Final Price</div>
                                                <div className="fw-bold text-dark">
                                                    ₹{formData.sellingPriceTaxType === 'Exclusive' && formData.sellingPriceTaxRate && formData.sellingPrice
                                                        ? (parseFloat(formData.sellingPrice) * (1 + parseFloat(formData.sellingPriceTaxRate) / 100)).toFixed(2)
                                                        : (parseFloat(formData.sellingPrice) || 0).toFixed(2)
                                                    }
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Purchase Price Row */}
                                    <div className="bg-light p-2 rounded mb-3 border">
                                        <Row className="align-items-center g-2">
                                            <Col xs={12} md={2} className="fw-bold text-muted small">Purchase Price</Col>
                                            <Col xs={6} md={3}>
                                                <InputGroup size="sm">
                                                    <InputGroup.Text>₹</InputGroup.Text>
                                                    <Form.Control type="number" placeholder="Price" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} min="0" step="0.01" />
                                                </InputGroup>
                                            </Col>
                                            <Col xs={6} md={3}>
                                                <Form.Select size="sm" name="purchasePriceTaxType" value={formData.purchasePriceTaxType} onChange={handleChange}>
                                                    <option value="Inclusive">Inclusive</option>
                                                    <option value="Exclusive">Exclusive</option>
                                                </Form.Select>
                                            </Col>
                                            <Col xs={6} md={2}>
                                                <Form.Select size="sm" name="purchasePriceTaxRate" value={formData.purchasePriceTaxRate} onChange={handleChange}>
                                                    <option value="">No Tax</option>
                                                    <option value="5">5%</option>
                                                    <option value="12">12%</option>
                                                    <option value="18">18%</option>
                                                    <option value="28">28%</option>
                                                </Form.Select>
                                            </Col>
                                            <Col xs={6} md={2} className="text-end small">
                                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Base Cost</div>
                                                <div className="fw-bold text-dark">
                                                    ₹{formData.purchasePriceTaxType === 'Inclusive' && formData.purchasePriceTaxRate && formData.purchasePrice
                                                        ? (parseFloat(formData.purchasePrice) / (1 + parseFloat(formData.purchasePriceTaxRate) / 100)).toFixed(2)
                                                        : (parseFloat(formData.purchasePrice) || 0).toFixed(2)
                                                    }
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Stats Row */}
                                    <Row className="g-3 align-items-center">
                                        <Col xs={12} md={4}>
                                            <Form.Label className="small mb-1 text-muted fw-bold">MRP (₹)</Form.Label>
                                            <Form.Control size="sm" type="number" placeholder="MRP" name="mrp" value={formData.mrp} onChange={handleChange} min="0" step="0.01" />
                                        </Col>
                                        <Col xs={12} md={8}>
                                            {formData.sellingPrice && formData.purchasePrice && (
                                                <div className={`alert p-2 mb-0 d-flex justify-content-between align-items-center small ${(() => {
                                                    const sBase = formData.sellingPriceTaxType === 'Inclusive' && formData.sellingPriceTaxRate
                                                        ? parseFloat(formData.sellingPrice) / (1 + parseFloat(formData.sellingPriceTaxRate) / 100)
                                                        : parseFloat(formData.sellingPrice);
                                                    const pBase = formData.purchasePriceTaxType === 'Inclusive' && formData.purchasePriceTaxRate
                                                        ? parseFloat(formData.purchasePrice) / (1 + parseFloat(formData.purchasePriceTaxRate) / 100)
                                                        : parseFloat(formData.purchasePrice);
                                                    return sBase - pBase >= 0 ? 'alert-success' : 'alert-danger';
                                                })()
                                                    }`}>
                                                    {(() => {
                                                        const sBase = formData.sellingPriceTaxType === 'Inclusive' && formData.sellingPriceTaxRate
                                                            ? parseFloat(formData.sellingPrice) / (1 + parseFloat(formData.sellingPriceTaxRate) / 100)
                                                            : parseFloat(formData.sellingPrice);
                                                        const pBase = formData.purchasePriceTaxType === 'Inclusive' && formData.purchasePriceTaxRate
                                                            ? parseFloat(formData.purchasePrice) / (1 + parseFloat(formData.purchasePriceTaxRate) / 100)
                                                            : parseFloat(formData.purchasePrice);
                                                        const profit = sBase - pBase;
                                                        const margin = sBase ? (profit / sBase) * 100 : 0;

                                                        return (
                                                            <>
                                                                <span className="fw-bold">Net Profit: ₹{profit.toFixed(2)}</span>
                                                                <span className="fw-bold">Margin: {margin.toFixed(2)}%</span>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </Container>

            {/* Add Option Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add New {getFieldLabel(modalField)}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>New {getFieldLabel(modalField)} Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={`Enter new ${getFieldLabel(modalField)}`}
                            value={newOptionValue}
                            onChange={(e) => setNewOptionValue(e.target.value)}
                            autoFocus
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddOption}>
                        Add Option
                    </Button>
                </Modal.Footer>
            </Modal>
        </AdminLayout >
    );
};

export default AddProduct;
