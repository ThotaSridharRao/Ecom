import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Alert, InputGroup, Modal } from 'react-bootstrap';
import AdminLayout from '../components/AdminLayout';
import { useProduct } from '../context/ProductContext';
import { useToast } from '../context/ToastContext';
import { FaFilter, FaCheckSquare, FaSave, FaPercentage } from 'react-icons/fa';

const BulkTaxUpdate = () => {
    const { products, updateProductsBulk } = useProduct();
    const { showToast } = useToast();

    // Filters
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSubCategory, setSelectedSubCategory] = useState('All');
    const [hsnFilter, setHsnFilter] = useState('');
    const [brandFilter, setBrandFilter] = useState('All');

    // Selection
    const [selectedProductIds, setSelectedProductIds] = useState([]);

    // Filters Derived Data
    const categories = ['All', ...[...new Set(products.map(p => p.category).filter(Boolean))]];
    // Subcategories depend on selected category generally, but for bulk we can show all used ones or filter
    const subCategories = ['All', ...[...new Set(products.filter(p => selectedCategory === 'All' || p.category === selectedCategory).map(p => p.subCategory).filter(Boolean))]];
    const brands = ['All', ...[...new Set(products.map(p => p.brand).filter(Boolean))]];

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchSub = selectedSubCategory === 'All' || p.subCategory === selectedSubCategory;
        const matchBrand = brandFilter === 'All' || p.brand === brandFilter;
        const matchHsn = !hsnFilter || (p.hsnCode && p.hsnCode.includes(hsnFilter));
        return matchCategory && matchSub && matchBrand && matchHsn;
    });

    const toggleSelectAll = () => {
        if (selectedProductIds.length === filteredProducts.length) {
            setSelectedProductIds([]);
        } else {
            setSelectedProductIds(filteredProducts.map(p => p.id));
        }
    };

    const toggleSelect = (id) => {
        if (selectedProductIds.includes(id)) {
            setSelectedProductIds(prev => prev.filter(pid => pid !== id));
        } else {
            setSelectedProductIds(prev => [...prev, id]);
        }
    };

    // Bulk Update State
    const [targetTaxType, setTargetTaxType] = useState('selling'); // 'selling' or 'purchase'
    const [newTaxRate, setNewTaxRate] = useState('');
    const [taxMode, setTaxMode] = useState('Inclusive'); // 'Inclusive' or 'Exclusive'

    // Pricing Strategy: 
    // If Inclusive: 'maintain_mrp' (Default) vs 'recalc_mrp'
    // If Exclusive: 'maintain_base' (Default) vs 'recalc_base' (Uncommon)
    const [pricingStrategy, setPricingStrategy] = useState('maintain_final'); // 'maintain_final' (MRP/Final Price stays same) or 'maintain_base' (Base price stays same)

    const handleApplyUpdate = () => {
        if (selectedProductIds.length === 0) {
            showToast('No products selected!', 'warning');
            return;
        }
        if (!newTaxRate) {
            showToast('Please select a new tax rate.', 'warning');
            return;
        }

        const taxRateVal = parseFloat(newTaxRate);

        const updatedList = products
            .filter(p => selectedProductIds.includes(p.id))
            .map(product => {
                let updates = {};

                // Determine keys based on target (selling or purchase)
                const priceKey = targetTaxType === 'selling' ? 'sellingPrice' : 'purchasePrice';
                const rateKey = targetTaxType === 'selling' ? 'sellingPriceTaxRate' : 'purchasePriceTaxRate';
                const typeKey = targetTaxType === 'selling' ? 'sellingPriceTaxType' : 'purchasePriceTaxType';

                const currentPrice = parseFloat(product[priceKey] || 0);
                const currentRate = parseFloat(product[rateKey] || 0);
                const currentType = product[typeKey] || 'Inclusive';

                // New values
                updates[rateKey] = taxRateVal;
                updates[typeKey] = taxMode;

                // Pricing Recalculation Logic
                if (currentPrice > 0) {
                    if (pricingStrategy === 'maintain_final') {
                        // Goal: Final Price (MRP) stays exactly the same.
                        // If mode is Inclusive: The Stored Price IS the Final Price. So NO CHANGE to price value.
                        // If mode is Exclusive: The Stored Price is Base. Final = Base * (1+Tax). We need new Base.

                        if (taxMode === 'Inclusive') {
                            // Price stored is inclusive. Just keep it. Tax component inside changes, but price stays.
                            updates[priceKey] = currentPrice;
                        } else {
                            // New mode is Exclusive.
                            // We want NewBase * (1 + NewTax) = OldFinal

                            // Calculate OldFinal
                            let oldFinal = 0;
                            if (currentType === 'Inclusive') oldFinal = currentPrice;
                            else oldFinal = currentPrice * (1 + currentRate / 100);

                            // NewBase = OldFinal / (1 + NewTax/100)
                            const newBase = oldFinal / (1 + taxRateVal / 100);
                            updates[priceKey] = newBase.toFixed(2);
                        }

                    } else if (pricingStrategy === 'maintain_base') {
                        // Goal: Base Price (Net Income/Cost) stays exactly the same.

                        // Calculate Old Base
                        let oldBase = 0;
                        if (currentType === 'Inclusive') oldBase = currentPrice / (1 + currentRate / 100);
                        else oldBase = currentPrice;

                        if (taxMode === 'Exclusive') {
                            // Price stored is Exclusive (Base). So keep it.
                            updates[priceKey] = oldBase.toFixed(2);
                        } else {
                            // New mode is Inclusive. Stored Price = Base * (1 + Tax)
                            const newInclusive = oldBase * (1 + taxRateVal / 100);
                            updates[priceKey] = newInclusive.toFixed(2);
                        }
                    }
                }

                return { ...product, ...updates };
            });

        updateProductsBulk(updatedList);
        showToast(`Successfully updated tax for ${updatedList.length} products!`, 'success');
        setSelectedProductIds([]); // Clear selection
    };

    return (
        <AdminLayout>
            <Container fluid className="p-0">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="fw-bold text-dark mb-0">Bulk GST Update</h3>
                    <Badge bg="info" className="p-2">Admin Tool</Badge>
                </div>

                <Row className="g-3">
                    {/* Filters & Selection */}
                    <Col lg={12}>
                        <Card className="border-0 shadow-sm mb-3">
                            <Card.Body className="p-3 bg-light rounded-top">
                                <Row className="g-3 align-items-end">
                                    <Col md={3}>
                                        <Form.Label className="small fw-bold text-muted">Category</Form.Label>
                                        <Form.Select size="sm" value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setSelectedSubCategory('All'); }}>
                                            {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                        </Form.Select>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="small fw-bold text-muted">Sub-Category</Form.Label>
                                        <Form.Select size="sm" value={selectedSubCategory} onChange={e => setSelectedSubCategory(e.target.value)}>
                                            {subCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                        </Form.Select>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Label className="small fw-bold text-muted">Brand</Form.Label>
                                        <Form.Select size="sm" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
                                            {brands.map((b, i) => <option key={i} value={b}>{b}</option>)}
                                        </Form.Select>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Label className="small fw-bold text-muted">HSN Code</Form.Label>
                                        <Form.Control size="sm" placeholder="Filter HSN" value={hsnFilter} onChange={e => setHsnFilter(e.target.value)} />
                                    </Col>
                                    <Col md={2} className="text-end">
                                        <small className="text-muted d-block mb-1">{filteredProducts.length} Items Found</small>
                                    </Col>
                                </Row>
                            </Card.Body>
                            <Card.Body className="p-0 table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <Table hover size="sm" className="mb-0 text-nowrap table-bordered border-light">
                                    <thead className="bg-light sticky-top">
                                        <tr>
                                            <th className="px-3 text-center" style={{ width: '40px' }}>
                                                <Form.Check
                                                    checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                                                    onChange={toggleSelectAll}
                                                />
                                            </th>
                                            <th className="px-3">Product Name</th>
                                            <th className="px-3">Category</th>
                                            <th className="px-3">HSN</th>
                                            <th className="px-3 text-end">Sell Price</th>
                                            <th className="px-3 text-center">Sell Tax</th>
                                            <th className="px-3 text-center">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map(p => (
                                                <tr key={p.id} className={selectedProductIds.includes(p.id) ? 'table-primary' : ''}>
                                                    <td className="px-3 text-center">
                                                        <Form.Check
                                                            checked={selectedProductIds.includes(p.id)}
                                                            onChange={() => toggleSelect(p.id)}
                                                        />
                                                    </td>
                                                    <td className="px-3 fw-semibold">{p.name || p.title}</td>
                                                    <td className="px-3 text-muted">{p.category}</td>
                                                    <td className="px-3">{p.hsnCode || '-'}</td>
                                                    <td className="px-3 text-end fw-bold">₹{p.sellingPrice}</td>
                                                    <td className="px-3 text-center">
                                                        <Badge bg={p.sellingPriceTaxRate > 12 ? 'warning' : 'success'} className="fw-normal">
                                                            {p.sellingPriceTaxRate || 0}%
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3 text-center small text-muted">{p.sellingPriceTaxType || 'Inclusive'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center py-5 text-muted">No products match current filters.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </Card.Body>
                            <Card.Footer className="bg-white py-2 border-top">
                                <span className="text-primary fw-bold">{selectedProductIds.length}</span> products selected for update.
                            </Card.Footer>
                        </Card>
                    </Col>

                    {/* Action Panel */}
                    <Col lg={12}>
                        <Card className="border-0 shadow-sm bg-primary bg-opacity-10">
                            <Card.Body>
                                <h6 className="fw-bold mb-3 d-flex align-items-center text-primary">
                                    <FaPercentage className="me-2" /> Configure New Tax Settings
                                </h6>
                                <Row className="g-3 align-items-end">
                                    <Col md={2}>
                                        <Form.Label className="small fw-bold">Update For</Form.Label>
                                        <Form.Select size="sm" value={targetTaxType} onChange={e => setTargetTaxType(e.target.value)}>
                                            <option value="selling">Selling Price</option>
                                            <option value="purchase">Purchase Price</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Label className="small fw-bold">New Tax Rate (%)</Form.Label>
                                        <Form.Select size="sm" value={newTaxRate} onChange={e => setNewTaxRate(e.target.value)}>
                                            <option value="">Select Rate</option>
                                            <option value="0">0% (Nil)</option>
                                            <option value="5">5%</option>
                                            <option value="12">12%</option>
                                            <option value="18">18%</option>
                                            <option value="28">28%</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Label className="small fw-bold">Tax Type</Form.Label>
                                        <Form.Select size="sm" value={taxMode} onChange={e => setTaxMode(e.target.value)}>
                                            <option value="Inclusive">Inclusive</option>
                                            <option value="Exclusive">Exclusive</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="small fw-bold">Pricing Strategy</Form.Label>
                                        <Form.Select size="sm" value={pricingStrategy} onChange={e => setPricingStrategy(e.target.value)}
                                            title="Determines how the price is recalculated."
                                        >
                                            <option value="maintain_final">Keep Final Price (MRP) Same</option>
                                            <option value="maintain_base">Keep Base Price Same</option>
                                        </Form.Select>
                                        <Form.Text className="text-muted" style={{ fontSize: '0.65rem' }}>
                                            {pricingStrategy === 'maintain_final'
                                                ? "Benefit/Loss absorbed by you. Customer pays same."
                                                : "Price changes for customer. Your margin stays same."}
                                        </Form.Text>
                                    </Col>
                                    <Col md={3} className="text-end">
                                        <Button
                                            variant="primary"
                                            onClick={handleApplyUpdate}
                                            disabled={selectedProductIds.length === 0 || !newTaxRate}
                                            className="w-100"
                                        >
                                            <FaSave className="me-2" /> Apply Bulk Update
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </AdminLayout>
    );
};

export default BulkTaxUpdate;
