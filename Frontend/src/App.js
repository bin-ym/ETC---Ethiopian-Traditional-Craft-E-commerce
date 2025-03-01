import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ProductList from "./components/ProductList";
import ProductDetails from "./components/ProductDetails";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import PaymentPage from "./components/PaymentPage";
import ForgotPassword from "./components/ForgotPassword";
import AdminApp from "./Admin/AdminApp";
import ArtisanApp from "./Artisan/ArtisanApp";
import Navbar from "./components/Navbar";
import NavbarArtisan from "./Artisan/NavbarArtisan";
import NavbarCustomer from "./customer/NavbarCustomer";
import CustomerApp from "./customer/CustomerApp";
import PaymentSuccess from "./components/PaymentSuccess";
import Footer from "./components/Footer";
import axios from "axios";

// Note: We're keeping the inline styles for the layout structure
const appStyles = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

function ShowNavbar() {
  const location = useLocation();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchSessionRole = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/session/role", {
          withCredentials: true,
        });
        setRole(response.data.role || null);
        console.log("Fetched role:", response.data.role);
      } catch (err) {
        console.log("No active session:", err.response?.data || err.message);
        setRole(null);
      }
    };
    fetchSessionRole();
  }, [location.pathname]);

  console.log("ShowNavbar: Current path:", location.pathname, "Role:", role);

  if (location.pathname.startsWith("/admin")) {
    return null; // No navbar for admin routes
  }
  if (role === "artisan") {
    return <NavbarArtisan />;
  }
  if (role === "user") {
    return <NavbarCustomer />;
  }
  return <Navbar />;
}

function App() {
  console.log("App: Rendering main application");

  return (
    <CartProvider>
      <Router>
        <div style={appStyles}>
          <ShowNavbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/payment-page" element={<PaymentPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/admin/*" element={<AdminApp />} />
              <Route path="/artisan/*" element={<ArtisanApp />} />
              <Route path="/customer/*" element={<CustomerApp />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route
                path="*"
                element={
                  <div className="py-10 text-center">
                    {console.log("App: Rendering 404 for path:", window.location.pathname)}
                    <h1 className="mb-2 text-4xl text-red-600">404: Page Not Found</h1>
                    <p className="text-gray-600">The requested page does not exist.</p>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App; 