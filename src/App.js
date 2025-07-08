import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import EmployeeMenu from "./components/EmployeeMenu";
import ViewCart from "./components/ViewCart";
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
import AdminTransactionManagement from "./components/Admin/AdminTransactionManagement";
import EmployeeBillPayment from "./components/EmployeeBillPayment";
import FastOrdering from "./components/Admin/FastOrdering";
import SuggestionsComplaints from "./components/SuggestionsComplaints";
import { NotificationProvider } from './components/NotificationContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <ThemeProvider>
              <Navbar />
              <Routes>
                <Route path="/" element={<CanteenHomePage />} />
                <Route path="/sign_up" element={<SignUp />} />
                <Route path="/sign_in" element={<SignIn />} />
                <Route path="/menu" element={<EmployeeMenu />} />
                <Route path="/order" element={<EmployeeOrders />} />
                <Route path="/cart" element={<ViewCart />} />
                <Route path="/bills" element={
                  <ProtectedRoute>
                    <EmployeeBillPayment />
                  </ProtectedRoute>
                } />
                <Route path="/suggestions" element={
                  <ProtectedRoute>
                    <SuggestionsComplaints />
                  </ProtectedRoute>
                } />
                
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
                  <Route path="transactions" element={<AdminTransactionManagement />} />
                  <Route path="fastordering" element={<FastOrdering />} />
                  <Route path="suggestions" element={<SuggestionsComplaints />} />
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
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;