import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import api from './utils/api';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Addresses from './pages/Addresses';
import Orders from './pages/Orders';
import CategoryProducts from './pages/CategoryProducts';
import SearchResults from './pages/SearchResults';
import ProductDetails from './pages/ProductDetails';
import AdminDashboard from './pages/AdminDashboard';
import AddProduct from './pages/AddProduct';
import ViewProducts from './pages/ViewProducts';
import BarcodeGenerator from './pages/BarcodeGenerator';
import BulkTaxUpdate from './pages/BulkTaxUpdate';
import AllItemReport from './pages/AllItemReport';
import RateReport from './pages/RateReport';
import CreateInvoice from './pages/CreateInvoice';
import SaleInvoiceList from './pages/SaleInvoiceList';
import PartialPayment from './pages/PartialPayment';
import PartialPaymentList from './pages/PartialPaymentList';
import CreatePurchase from './pages/CreatePurchase';
import PurchaseList from './pages/PurchaseList';
import RoleMaster from './pages/RoleMaster';
import PageAccess from './pages/PageAccess';
import CreateEmployee from './pages/CreateEmployee';
import CustomerMaster from './pages/CustomerMaster';
import VendorMaster from './pages/VendorMaster';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import SupportChat from './pages/SupportChat';
import Support from './pages/Support';
import Footer from './components/Footer';
import './App.css';

import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AddressProvider } from './context/AddressContext';
import { OrderProvider } from './context/OrderContext';
import { ProductProvider } from './context/ProductContext';


import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import PageWrapper from './components/PageWrapper';

function App() {
  // Pinger to wake up backend on initial load
  useEffect(() => {
    const pingBackend = async () => {
      try {
        await api.get('/products?limit=1');
        console.log("Backend awake!");
      } catch (error) {
        // Silent fail - just a wake up call
        console.log("Waking up backend...", error.message);
      }
    };
    pingBackend();
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <AddressProvider>
              <OrderProvider>
                <ProductProvider>
                  <Router>
                    <ScrollToTop />
                    <div className="App">
                      <Navigation />
                      <Routes>
                        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                        <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
                        <Route path="/checkout" element={
                          <ProtectedRoute>
                            <PageWrapper><Checkout /></PageWrapper>
                          </ProtectedRoute>
                        } />
                        <Route path="/wishlist" element={
                          <ProtectedRoute>
                            <PageWrapper><Wishlist /></PageWrapper>
                          </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                          <ProtectedRoute>
                            <PageWrapper><Profile /></PageWrapper>
                          </ProtectedRoute>
                        } />
                        <Route path="/addresses" element={
                          <ProtectedRoute>
                            <PageWrapper><Addresses /></PageWrapper>
                          </ProtectedRoute>
                        } />
                        <Route path="/orders" element={
                          <ProtectedRoute>
                            <PageWrapper><Orders /></PageWrapper>
                          </ProtectedRoute>
                        } />
                        <Route path="/support-chat" element={
                          <ProtectedRoute>
                            <PageWrapper><SupportChat /></PageWrapper>
                          </ProtectedRoute>
                        } />
                        <Route path="/support" element={
                          <ProtectedRoute>
                            <PageWrapper><Support /></PageWrapper>
                          </ProtectedRoute>
                        } />
                        <Route path="/category/:categoryName" element={<PageWrapper><CategoryProducts /></PageWrapper>} />
                        <Route path="/search" element={<PageWrapper><SearchResults /></PageWrapper>} />
                        {/* New PDP Route */}
                        <Route path="/product/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />

                        {/* Admin Route */}
                        <Route path="/admin/dashboard" element={
                          <ProtectedAdminRoute>
                            <AdminDashboard />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/products" element={
                          <ProtectedAdminRoute>
                            <ViewProducts />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/products/add" element={
                          <ProtectedAdminRoute>
                            <AddProduct />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/products/barcode" element={
                          <ProtectedAdminRoute>
                            <BarcodeGenerator />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/store/reports/all-items" element={
                          <ProtectedAdminRoute>
                            <AllItemReport />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/store/reports/rates" element={
                          <ProtectedAdminRoute>
                            <RateReport />
                          </ProtectedAdminRoute>
                        } />

                        {/* Sales Routes */}
                        <Route path="/admin/sales/create-invoice" element={
                          <ProtectedAdminRoute>
                            <CreateInvoice />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/sales/invoices" element={
                          <ProtectedAdminRoute>
                            <SaleInvoiceList />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/sales/partial-payment" element={
                          <ProtectedAdminRoute>
                            <PartialPayment />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/sales/partial-payments-list" element={
                          <ProtectedAdminRoute>
                            <PartialPaymentList />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/sales/bulk-tax-update" element={
                          <ProtectedAdminRoute>
                            <BulkTaxUpdate />
                          </ProtectedAdminRoute>
                        } />

                        {/* Purchase Routes */}
                        <Route path="/admin/purchase/create" element={
                          <ProtectedAdminRoute>
                            <CreatePurchase />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/purchase/list" element={
                          <ProtectedAdminRoute>
                            <PurchaseList />
                          </ProtectedAdminRoute>
                        } />

                        {/* Employee Routes */}
                        <Route path="/admin/employee/roles" element={
                          <ProtectedAdminRoute>
                            <RoleMaster />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/employee/access" element={
                          <ProtectedAdminRoute>
                            <PageAccess />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/employee/create" element={
                          <ProtectedAdminRoute>
                            <CreateEmployee />
                          </ProtectedAdminRoute>
                        } />

                        {/* Contact Routes */}
                        <Route path="/admin/contacts/customers" element={
                          <ProtectedAdminRoute>
                            <CustomerMaster />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/contacts/vendors" element={
                          <ProtectedAdminRoute>
                            <VendorMaster />
                          </ProtectedAdminRoute>
                        } />

                        <Route path="*" element={<PageWrapper><div className="text-center py-5"><h3>404 - Page Not Found</h3><p>The page you are looking for does not exist.</p><a href="/" className="btn btn-primary">Go Home</a></div></PageWrapper>} />
                      </Routes>
                      <Footer />
                    </div>
                  </Router>
                </ProductProvider>
              </OrderProvider>
            </AddressProvider>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
