import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const employeeData = localStorage.getItem('employee');
    
    if (token && employeeData) {
      setIsAuthenticated(true);
      setEmployee(JSON.parse(employeeData));
    }
  }, []);

  const login = (token, employeeData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('employee', JSON.stringify(employeeData));
    setEmployee(employeeData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    setEmployee(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ employee, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};