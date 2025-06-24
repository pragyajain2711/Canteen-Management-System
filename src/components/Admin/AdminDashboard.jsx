
 import { useState, useEffect } from "react";
import { 
  Clock, CheckCircle, XCircle, Package, Search, Filter, ChevronDown, ChevronUp,
  Menu, X, ClipboardList, Utensils, Users 
} from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";


const statusIcons = {
  pending: Clock,
  preparing: Package,
  ready: CheckCircle,
  completed: CheckCircle,
  cancelled: XCircle,
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
 const[sidebarOpen,setSidebarOpen]=useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const navItems = [
    { icon: <Utensils size={20} />, label: 'Menu Management', path: '/admin-dashboard/menu' },
    { icon: <ClipboardList size={20} />, label: 'Order Management', path: '/admin/orders' },
    { icon: <Users size={20} />, label: 'Employee Management', path: '/admin/employees' }
  ];


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed md:relative z-20 w-64 bg-blue-800 text-white transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 flex items-center justify-between border-b border-blue-700">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 p-2 rounded hover:bg-blue-700 transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <button 
            className="md:hidden p-1 rounded-md hover:bg-gray-200"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-semibold">Admin Dasboard for Order Management</h2>
          <div className="flex items-center space-x-4">
            {/* User profile/notifications */}
          </div>
        </header>
        <Outlet />
      
                 
     </div>           
    </div>
  );
}