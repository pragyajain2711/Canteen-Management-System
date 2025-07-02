import { useState } from "react";
import {
  Clock,
  CheckCircle,
  X,
  ClipboardList,
  Utensils,
  Users,
  BarChart3,
  ChevronDown,
  Calendar,
  BookOpen,
  ChevronRight,
  Receipt,
  CreditCard,
} from "lucide-react";
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuManagementOpen, setMenuManagementOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get active section from pathname
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('/menu/items')) return 'menu-items';
    if (path.includes('/menu/weekly')) return 'weekly-menu';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/transactions')) return 'transactions';
    if (path.includes('/payments')) return 'payments';
    if (path.includes('/customers')) return 'customers';
    return 'dashboard';
  };

  const activeSection = getActiveSection();

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const navItems = [
    {
      icon: <BarChart3 size={20} />,
      label: "Dashboard Overview",
      path: "/admin-dashboard",
      section: "dashboard",
    },
    {
      icon: <Utensils size={20} />,
      label: "Menu Management",
      path: "/admin-dashboard/menu/items",
      section: "menu-parent",
      hasSubmenu: true,
      submenu: [
        {
          icon: <BookOpen size={18} />,
          label: "Menu Items",
          path: "/admin-dashboard/menu/items",
          section: "menu-items",
        },
        {
          icon: <Calendar size={18} />,
          label: "Weekly Menu",
          path: "/admin-dashboard/menu/weekly",
          section: "weekly-menu",
        },
      ],
    },
    {
      icon: <ClipboardList size={20} />,
      label: "OrderManagement",
      path: "/admin-dashboard/orders",
      section: "orders",
      
                  
    },
     {
      icon: <ClipboardList size={20} />,
      label: "OrderHistory",
      path: "/admin-dashboard/orders/history",
      section: "orders-history",
      
        
    },

    {
      icon: <Receipt size={20} />,
      label: "Transaction Management",
      path: "/admin-dashboard/transactions",
      section: "transactions",
    },
    {
      icon: <CreditCard size={20} />,
      label: "Payment Management",
      path: "/admin-dashboard/payments",
      section: "payments",
    },
    {
      icon: <Users size={20} />,
      label: "Customer Management",
      path: "/admin-dashboard/customers",
      section: "customers",
    },
  ];

  const isMainDashboard = activeSection === "dashboard";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed z-20 w-64 bg-blue-800 text-white transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-0`}
      >
        <div className="p-4 flex items-center justify-between border-b border-blue-700">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden hover:bg-blue-700 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item, index) => (
            <div key={index}>
              {item.hasSubmenu ? (
                <div>
                  <button
                    onClick={() => setMenuManagementOpen(!menuManagementOpen)}
                    className={`w-full flex items-center justify-between space-x-2 p-2 rounded transition-colors hover:bg-blue-700 ${
                      activeSection.startsWith("menu") ? "bg-blue-700 text-white" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${menuManagementOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {menuManagementOpen && (
                    <div className="mt-2 ml-4 space-y-1">
                      {item.submenu?.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => handleNavigation(subItem.path)}
                          className={`w-full flex items-center space-x-2 p-2 rounded transition-colors text-sm hover:bg-blue-700 ${
                            activeSection === subItem.section ? "bg-blue-600 text-white" : ""
                          }`}
                        >
                          {subItem.icon}
                          <span>{subItem.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-2 p-2 rounded transition-colors hover:bg-blue-700 ${
                    activeSection === item.section ? "bg-blue-700 text-white" : ""
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-0">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <button
            className="p-2 rounded-md hover:bg-gray-200 transition-colors lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <div
              className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
                sidebarOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            ></div>
            <div
              className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
                sidebarOpen ? "opacity-0" : ""
              }`}
            ></div>
            <div
              className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
                sidebarOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            ></div>
          </button>

          <h2 className="text-xl font-semibold">
            {activeSection === "dashboard" && "Admin Dashboard Overview"}
            {activeSection === "menu-items" && "Menu Items Management"}
            {activeSection === "weekly-menu" && "Weekly Menu Management"}
            {activeSection === "orders" && "Order Management"}
            {activeSection === "transactions" && "Transaction Management"}
            {activeSection === "payments" && "Payment Management"}
            {activeSection === "customers" && "Customer Management"}
          </h2>
          <div className="flex items-center space-x-4"></div>
        </header>

        {/* Content based on active section */}
        <div className={activeSection === "customers" ? "" : "p-6"}>
          {isMainDashboard ? (
            <DashboardOverview handleNavigation={handleNavigation} />
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardOverview({ handleNavigation }) {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Admin Dashboard</h3>
        <p className="text-gray-600">Manage your canteen operations efficiently</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">248</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">189</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">32</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">156</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h4 className="text-lg font-semibold text-gray-800">Quick Actions</h4>
          </div>
          <div className="p-6 space-y-3">
            <button
              className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => handleNavigation("/admin-dashboard/transactions")}
            >
              <Receipt className="h-5 w-5 text-blue-600" />
              <span>View Transactions</span>
              <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
            </button>
            <button
              className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => handleNavigation("/admin-dashboard/menu/items")}
            >
              <Utensils className="h-5 w-5 text-green-600" />
              <span>Update Menu</span>
              <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
            </button>
            <button
              className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => handleNavigation("/admin-dashboard/orders")}
            >
              <ClipboardList className="h-5 w-5 text-orange-600" />
              <span>View Orders</span>
              <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h4 className="text-lg font-semibold text-gray-800">Recent Activity</h4>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center space-x-3 p-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Order #1234 completed</span>
            </div>
            <div className="flex items-center space-x-3 p-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">New menu item added</span>
            </div>
            <div className="flex items-center space-x-3 p-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Order #1235 pending</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h4 className="text-lg font-semibold text-gray-800">System Status</h4>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Canteen Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Order System</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Gateway</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}