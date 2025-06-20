import React, { useState, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import { AuthProvider, AuthContext } from './components/AuthContext';
import Dashboard from './components/Dashboard';
import "./App.css";

function AppContent() {
  const [cart, setCart] = useState([]);

  const addToCart = (dish) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.name === dish.name);
      if (existingItem) {
        return prev.map(item =>
          item.name === dish.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...dish, quantity: 1 }];
      }
    });
    alert(`${dish.name} added to cart`);
  };

  const onIncrement = (dish) => {
    setCart(prev =>
      prev.map(item =>
        item.name === dish.name
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const onDecrement = (dish) => {
    setCart(prev =>
      prev
        .map(item =>
          item.name === dish.name
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const onClearCart = () => {
    setCart([]);
  };

  return (
    <div className="app-container">
      <Navbar cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route path="/menu" element={<Menu addToCart={addToCart} />} />
          <Route
            path="/cart"
            element={
              <Cart
                cartItems={cart}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onClearCart={onClearCart}
              />
            }
          />
          <Route path="/sign_in" element={<SignIn />} />
          <Route path="/sign_up" element={<SignUp />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/sign_in" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;