import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
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

    // Opti Show notification
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
    <Router>
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
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
