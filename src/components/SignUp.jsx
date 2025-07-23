
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from './api';
import {useTheme} from "../ThemeContext";

function Sign_Up() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    department: "",
    employeeId: "",
    mobileNumber: "",
    customerType: "Employee", // Default value
    password: "",
    confirmPassword: "",
    isActive: true // Default to active
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const {theme} = useTheme();

  const departments = [
    "Finance", "LPG", "IS", "HR", "Sales", "Reception", "Engineer", "Law"
  ];

  const customerTypes = [
    "Intern", "Employee", "Trainee", "Helper","Apprentice"
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError("");  
    setSuccess(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await api.post('api/auth/signup', formData);
      setSuccess("Account created successfully!");

      setTimeout(() => {
        navigate("/sign_in", {
          state: {
            employeeId: formData.employeeId,
            password: formData.password
          }
        });
      }, 1500);

    } catch (err) {
      const message = err.response?.data || "Registration failed. Try again.";
      if (message === "Employee ID is already in use") {
        setError("An account with this Employee ID already exists.");
      } else {
        setError(message);
      }
    }
  };

  
  const containerStyle = {
    maxWidth: "450px",
    margin: "50px auto",
    padding: "30px",
    backgroundColor: "#ffffff",
    backgroundColor: theme === "light" ? "#f8f9fa" : "#1a1a1a",
    color: theme === "light" ? "#000" : "#fff",
    borderRadius: "8px",
    boxShadow: "0 0 15px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif"
  };

  const titleStyle = {
    textAlign: "center",
    fontSize: "1.8rem",
    marginBottom: "5px",
    fontWeight: "bold"
  };

  const subTitleStyle = {
    textAlign: "center",
    marginBottom: "25px",
    color: "#666"
  };

  const labelStyle = {
    fontWeight: "bold",
    marginBottom: "5px",
    display: "block"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "1rem"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px"
  };

  const linkStyle = {
    textAlign: "center",
    marginTop: "15px",
    display: "block",
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold"
  };

  return (
    <form style={containerStyle} onSubmit={handleSubmit}>
      <div style={titleStyle}>Create Account</div>
      <div style={subTitleStyle}>Join our canteen community today</div>

      <label style={labelStyle}>First Name</label>
      <input
        type="text"
        name="firstName"
        placeholder="Enter your first name"
        value={formData.firstName}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <label style={labelStyle}>Last Name</label>
      <input
        type="text"
        name="lastName"
        placeholder="Enter your last name"
        value={formData.lastName}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <label style={labelStyle}>Customer Type</label>
      <select
        name="customerType"
        value={formData.customerType}
        onChange={handleChange}
        required
        style={inputStyle}
      >
        {customerTypes.map((type, index) => (
          <option key={index} value={type}>{type}</option>
        ))}
      </select>

      <label style={labelStyle}>Department</label>
      <select
        name="department"
        value={formData.department}
        onChange={handleChange}
        required
        style={inputStyle}
      >
        <option value="">Select your department</option>
        {departments.map((dept, index) => (
          <option key={index} value={dept}>{dept}</option>
        ))}
      </select>

      <label style={labelStyle}>ID Number</label>
      <input
        type="text"
        name="employeeId"
        placeholder="Enter your Employee ID"
        value={formData.employeeId}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <label style={labelStyle}>Mobile Number</label>
      <input
        type="tel"
        name="mobileNumber"
        placeholder="Enter your mobile number"
        value={formData.mobileNumber}
        onChange={handleChange}
        style={inputStyle}
      />

      <label style={labelStyle}>Active Status</label>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          style={{ marginRight: '10px' }}
        />
        <span>Active Employee</span>
      </div>

      <label style={labelStyle}>Password</label>
      <input
        type="password"
        name="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <label style={labelStyle}>Confirm Password</label>
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '15px' }}>{success}</div>}

      <button type="submit" style={buttonStyle}>Create Account</button>

      <Link to="/sign_in" style={linkStyle}>Already have an account? Sign in here</Link>
    </form>
  );
}

export default Sign_Up;