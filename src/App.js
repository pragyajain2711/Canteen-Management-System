import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import { AuthProvider } from './components/AuthContext';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminDashboard from "./components/Admin/AdminDashboard";
import SuperAdminDashboard from "./components/Admin/SuperAdminDashboard";


const orders = [];
const employees = [];

function App() {
  return (
    <AuthProvider>
      <Router>
        <ThemeProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign_up" element={<SignUp />} />
            <Route path="/sign_in" element={<SignIn />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* Regular protected route */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin dashboard */}
<Route 
  path="/admin-dashboard" 
  element={
    <AdminProtectedRoute>
      <AdminDashboard orders={orders} />
    </AdminProtectedRoute>
  } 
  >
 {/* <Route 
    path="menu" 
    element={<MenuManagement />} 
  />*/}
</Route>

{/* Super Admin dashboard */}
<Route 
  path="/superadmin-dashboard" 
  element={
    <AdminProtectedRoute superAdminOnly>
      <SuperAdminDashboard orders={orders} employees={employees} />
    </AdminProtectedRoute>
  } 
/>
          </Routes>
          <Footer />
        </ThemeProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;