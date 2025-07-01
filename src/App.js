/*import React from "react";
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
import CustomerManagement from "./components/Admin/CustomerManagement";
import  MenuManagement from "./components/Admin/MenuManagement";
import WeeklyMenuManagement from "./components/Admin/WeeklyMenuManagement";


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
            
            {/* Regular protected route *
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin dashboard *
<Route 
  path="/admin-dashboard" 
  element={
    <AdminProtectedRoute>
      <AdminDashboard orders={orders} />
    </AdminProtectedRoute>
  } 
  >
   <Route index element={<div>Admin Dashboard Home</div>} />
              <Route path="menu/items" element={<MenuManagement />} />
              <Route path="menu/weekly" element={<WeeklyMenuManagement />} />
  <Route 
    path="customers" 
    element={<CustomerManagement />} 
  />
</Route>

{/* Super Admin dashboard *
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
*/

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
//import CanteenHomePage from "./components/CanteenHomePage";
import EmployeeMenu from "./components/EmployeeMenu";
import Cart from "./components/Cart";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import { AuthProvider } from './components/AuthContext';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminDashboard from "./components/Admin/AdminDashboard";
import SuperAdminDashboard from "./components/Admin/SuperAdminDashboard";
import CustomerManagement from "./components/Admin/CustomerManagement";
import MenuManagement from "./components/Admin/MenuManagement";
import AdminOrderHistory from "./components/Admin/AdminOrderHistory";
import AdminOrderManagement from "./components/Admin/AdminOrderManagement";
import WeeklyMenuManagement from "./components/Admin/WeeklyMenuManagement";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CanteenHomePage from "./components/CanteenHomePage";
import EmployeeOrders from "./components/EmployeeOrders";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Router>
        <ThemeProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<CanteenHomePage />} />
            <Route path="/sign_up" element={<SignUp />} />
            <Route path="/sign_in" element={<SignIn />} />
            <Route path="/menu" element={<EmployeeMenu />} />
            <Route path="/order" element={<EmployeeOrders />} />
            
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
                  <AdminDashboard />
                </AdminProtectedRoute>
              } 
            >
              <Route index element={<div>Admin Dashboard Home</div>} />
              <Route path="menu/items" element={<MenuManagement/>} />
              <Route path="menu/weekly" element={<WeeklyMenuManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="orders" element={<AdminOrderManagement />} />
             <Route path="orders/history" element={<AdminOrderHistory />} />
              {/* Placeholder routes for future implementation */}
             {/*} <Route path="orders" element={<div className="p-6">Order Management - Coming Soon</div>} />*/}
              <Route path="transactions" element={<div className="p-6">Transaction Management - Coming Soon</div>} />
              <Route path="payments" element={<div className="p-6">Payment Management - Coming Soon</div>} />
            </Route>

            {/* Super Admin dashboard */}
            <Route 
              path="/superadmin-dashboard" 
              element={
                <AdminProtectedRoute superAdminOnly>
                  <SuperAdminDashboard />
                </AdminProtectedRoute>
              } 
            />
          </Routes>
          <Footer />
        </ThemeProvider>
      </Router>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
