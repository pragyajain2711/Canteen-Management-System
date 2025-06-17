import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import Sign_Up from "./components/SignUp";
import Sign_In from "./components/SignIn";
import "./App.css";

function App() {
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
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="main-content">
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
            <Route path="/sign_in" element={<Sign_In />} />
            <Route path="/sign_up" element={<Sign_Up />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
