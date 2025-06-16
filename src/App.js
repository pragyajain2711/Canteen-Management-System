import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Sign_Up from './components/SignUp';
import Sign_In from './components/SignIn';
import './App.css';

function App() {
  return (
    <Router>
    <div className="app-container">
      <Navbar />
      <div className="main-content">

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
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
