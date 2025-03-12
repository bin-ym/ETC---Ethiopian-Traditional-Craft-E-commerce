import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, useLocation } from "react-router-dom"; // Removed BrowserRouter import
import { CartProvider } from "./contexts/CartContext";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
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

const appStyles = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const LoadingSpinner = () => (
  <div className="py-4 text-center bg-gray-100">
    <svg
      className="inline-block w-5 h-5 text-blue-600 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
);

function ShowNavbar() {
  const location = useLocation();
  const [role, setRole] = useState(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchSessionRole = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/session/role", {
          withCredentials: true,
          timeout: 5000
        });
        if (isMounted) {
          setRole(response.data.role || null);
          setIsLoadingRole(false);
        }
      } catch (err) {
        if (isMounted) {
          setRole(null);
          setIsLoadingRole(false);
          console.error("Failed to fetch role:", err.message);
        }
      }
    };
    
    fetchSessionRole();
    return () => { isMounted = false; };
  }, [location.pathname]);

  const navbar = useMemo(() => {
    if (location.pathname.startsWith("/admin")) return null;
    if (isLoadingRole) return <LoadingSpinner />;
    if (role === "artisan") return <NavbarArtisan />;
    if (role === "user") return <NavbarCustomer />;
    return <Navbar />;
  }, [location.pathname, role, isLoadingRole]);

  return navbar;
}

function App() {
  return (
    <CartProvider>
      <div style={appStyles}>
        <ShowNavbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/payment-page" element={<PaymentPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="/artisan/*" element={<ArtisanApp />} />
            <Route path="/customer/*" element={<CustomerApp />} />
            <Route
              path="*"
              element={
                <div className="py-10 text-center">
                  <h1 className="mb-2 text-4xl text-red-600">404: Page Not Found</h1>
                  <p className="text-gray-600">The requested page does not exist.</p>
                </div>
              }
            />
          </Routes>
        </main>
        <FooterWrapper />
      </div>
    </CartProvider>
  );
}

function FooterWrapper() {
  const location = useLocation();
  if (
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/artisan") ||
    location.pathname.startsWith("/customer")
  ) {
    return null;
  }
  return <Footer />;
}

export default App;