import React, { useState, useEffect } from "react"; // Add useState and useEffect
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
import axios from "axios";

function ShowNavbar() {
  const location = useLocation();
  const [role, setRole] = useState(null);

  // Fetch session role on mount or path change
  useEffect(() => {
    const fetchSessionRole = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/session/role", {
          withCredentials: true,
        });
        setRole(response.data.role || null);
      } catch (err) {
        console.log("No active session:", err.response?.data || err.message);
        setRole(null); // No session or error
      }
    };
    fetchSessionRole();
  }, [location.pathname]);

  console.log("Current path:", location.pathname, "Role:", role);

  // Show NavbarArtisan for logged-in artisans
  if (role === "artisan") {
    return <NavbarArtisan />;
  }
  // Show NavbarCustomer for logged-in customers
  if (role === "user") {
    return <NavbarCustomer />;
  }
  // Show default Navbar for public routes (not admin) when not logged in
  if (!location.pathname.includes("/admin")) {
    return <Navbar />;
  }
  // No navbar for admin routes
  return null;
}

function App() {
  console.log("App is rendering");
  return (
    <CartProvider>
      <Router>
        <ShowNavbar />
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
              <div>
                {console.log("Rendering 404 for path:", window.location.pathname)}
                <h1 style={{ textAlign: "center", color: "red" }}>404: Page Not Found</h1>
                <p style={{ textAlign: "center" }}>The requested page does not exist.</p>
              </div>
            }
          />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;