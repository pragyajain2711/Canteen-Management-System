import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#ffffff', // white background
    color: '#000', // black text
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // optional subtle shadow
  };

  const centerLinksStyle = {
    display: 'flex',
    justifyContent: 'center',
    flex: 1,
    gap: '20px',
  };

  const linkStyle = {
    color: '#000', // black text
    textDecoration: 'none',
    fontWeight: '500',
  };

  const rightButtonsStyle = {
    display: 'flex',
    gap: '10px',
  };

  const signInStyle = {
    ...linkStyle,
    padding: '5px 12px',
    border: 'none',
    backgroundColor: 'transparent',
  };

  const signUpStyle = { 
    ...linkStyle,
    padding: '5px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '5px',
  };

  return (
    <nav className="navbar" style={navStyle}>
      <h2 style={{ margin: 0 }}>Canteen</h2>

      <div style={centerLinksStyle}>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/menu" style={linkStyle}>Menu</Link>
        <Link to="/cart" style={linkStyle}>Cart</Link>
      </div>

      <div style={rightButtonsStyle}>
        <Link to="/sign_in" style={signInStyle}>Sign In</Link>
        <Link to="/sign_up" style={signUpStyle}>Sign Up</Link>
      </div>
    </nav>
  );
}

export default Navbar;
