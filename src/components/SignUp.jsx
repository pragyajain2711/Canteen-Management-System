import React, { useState } from "react";
import { Link } from "react-router-dom";

function Sign_Up() {
  const [formData, setFormData] = useState({
    fullName: "",
    department: "",
    employeeId: "",
    password: "",
    confirmPassword: ""
  });
  
  const departments = [
    "Finance",
    "LPG",
    "IS",
    "HR",
    "Sales",
    "Reception",
    "Engineer",
    "Law"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Account Created:", formData);
    alert("Account created successfully!");
  };

  const containerStyle = {
    maxWidth: "450px",
    margin: "50px auto",
    padding: "30px",
    backgroundColor: "#ffffff",
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

      <label style={labelStyle}>Full Name</label>
      <input
        type="text"
        name="fullName"
        placeholder="Enter your full name"
        value={formData.fullName}
        onChange={handleChange}
        required
        style={inputStyle}
      />

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

      <button type="submit" style={buttonStyle}>Create Account</button>

      <Link to="/sign_in" style={linkStyle}>Already have an account? Sign in here</Link>
    </form>
  );
}

export default Sign_Up;
