import React, { useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import OfflineDetector from './components/OfflineDetector';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLayout from './pages/AdminLayout';
import AdminProfitsLayout from './pages/AdminProfitsLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminCollections from './pages/AdminCollections';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminProfits from './pages/AdminProfits';
import AdminSettings from './pages/AdminSettings';
import AdminLogin from './pages/AdminLogin';
import Announcements from './pages/Announcements';
import AddToCart from './pages/AddToCart';
import AdminProductDetail from './pages/AdminProductDetail';
import ProductDetail from './pages/ProductDetail';
import UserDetails from './pages/UserDetails';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';

// Component to handle Ctrl+0 hotkey
function AdminHotkeyHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Debug logging
      console.log('Key pressed:', event.key, 'Ctrl:', event.ctrlKey, 'Meta:', event.metaKey);
      
      // Check for Ctrl+0 (or Cmd+0 on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === '0') {
        console.log('Admin hotkey detected! Navigating to /admin');
        event.preventDefault();
        navigate('/admin');
      }
    };

    console.log('Admin hotkey handler mounted');
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      console.log('Admin hotkey handler unmounted');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return null;
}

// GuardedRoute component for /checkout
function GuardedCheckoutRoute({ element }) {
  const location = useLocation();
  const allowed = sessionStorage.getItem('allowCheckout') === 'true';
  if (!allowed) {
    // If not allowed, redirect to home
    const navigate = useNavigate();
    React.useEffect(() => {
      navigate('/', { replace: true });
    }, [navigate]);
    return null;
  }
  // Reset the flag so user can't revisit by typing
  React.useEffect(() => {
    sessionStorage.setItem('allowCheckout', 'false');
  }, []);
  return element;
}

function AppRoutes() {
  return (
    <>
      <AdminHotkeyHandler />
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<GuardedCheckoutRoute element={<UserDetails />} />} />
        <Route path="/payment" element={<Payment key="payment" />} />
        <Route path="/payment-success" element={<PaymentSuccess key="payment-success" />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/addtocart" element={<AddToCart />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        
        {/* Admin Login Route (not protected) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin/product/:slug" element={
          <ProtectedAdminRoute>
            <AdminProductDetail />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="collections" element={<AdminCollections />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="/admin/profits" element={
          <ProtectedAdminRoute>
            <AdminProfitsLayout />
          </ProtectedAdminRoute>
        }>
          <Route index element={<AdminProfits />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <AdminAuthProvider>
      <OfflineDetector>
        <Router>
          <AppRoutes />
        </Router>
      </OfflineDetector>
    </AdminAuthProvider>
  );
}

export default App;
