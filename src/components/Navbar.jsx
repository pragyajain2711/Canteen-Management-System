import React ,{useContext,useState,useEffect} from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import {useTheme} from "../ThemeContext";
import { Moon, Sun } from "lucide-react";

function Navbar() {
  const { isAuthenticated, employee, logout } = useContext(AuthContext);
  const {theme,toggleTheme}=useTheme();
  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    //backgroundColor: '#ffffff', // white background
    color: '#000', // black text
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // optional subtle shadow
    backgroundColor: theme === "light" ? "#ffffff" : "#1e1e1e",
    color: theme === "light" ? "#000" : "#fff",
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
    backgroundColor: theme === "light" ? "#ffffff" : "#1e1e1e",
    color: theme === "light" ? "#000" : "#fff",
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
  const toggleButtonStyle = {
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    border: "none",
    backgroundColor: theme === "light" ? "#e2e8f0" : "#2d3748",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
  };
   const iconStyle = {
    color: theme === "light" ? "#000" : "#fff",
  };

  return (
    <nav className="navbar" style={navStyle}>
      <h2 style={{ margin: 0 }}>Canteen</h2>

      <div style={centerLinksStyle}>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/menu" style={linkStyle}>Menu</Link>
        {isAuthenticated && <Link to="/cart" style={linkStyle}>Cart</Link>}
      </div>
       <div style={rightButtonsStyle}>
        <button onClick={toggleTheme} style={toggleButtonStyle} title="Toggle Theme">
          {theme === "light" ? <Moon size={18} style={iconStyle} /> : <Sun size={18} style={iconStyle} />}
        </button>
       {isAuthenticated ? (
          <>
            <span style={{ marginRight: '10px' }}>Hi, {employee?.fullName}</span>
            <button 
              onClick={logout}
              style={{ 
                ...linkStyle,
                padding: '5px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
        <Link to="/sign_in" style={signInStyle}>Sign In</Link>
        <Link to="/sign_up" style={signUpStyle}>Sign Up</Link>
        </>)}
      </div>
    </nav>
  );
}

export default Navbar;
