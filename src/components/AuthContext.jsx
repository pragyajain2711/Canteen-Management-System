import React, { createContext, useState, useEffect ,useContext} from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const employeeData = localStorage.getItem('employee');
   const superAdminStatus = localStorage.getItem('superAdmin');
    const adminStatus = localStorage.getItem('admin');
    if (token && employeeData) {
      setIsAuthenticated(true);
      setEmployee(JSON.parse(employeeData));
      setIsAdmin(adminStatus === 'true');
      setIsSuperAdmin(superAdminStatus === 'true');
    }
  }, []);

  const login = (token, employeeData,admin,superAdmin) => {
    localStorage.setItem('token', token);
    localStorage.setItem('employee', JSON.stringify(employeeData));
    localStorage.setItem('admin', admin);
    localStorage.setItem('superAdmin', superAdmin);
    setEmployee(employeeData);
    setIsAuthenticated(true);
    setIsAdmin(admin);
    setIsSuperAdmin(superAdmin);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    localStorage.removeItem('admin');
    localStorage.removeItem('superAdmin');

    setEmployee(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsSuperAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ employee, isAuthenticated, isAdmin,isSuperAdmin,login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// In AuthContext.jsx, add at the bottom:
export function useAuth() {
  return useContext(AuthContext);
}