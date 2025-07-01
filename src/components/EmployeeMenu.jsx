import { useState, useEffect } from "react";
import { employeeMenuApi } from "./api";
import api from "./api";
import { useAuth } from './AuthContext';
import { CheckCircle, Loader, Plus, X, ShoppingCart } from 'lucide-react';

export default function EmployeeMenu() {
  // State for menu data and filtering
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState("MONDAY");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    status: "active"
  });

  // State for ordering
  const [orderingItem, setOrderingItem] = useState(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  // Admin ordering context
  const { employee, isAdmin ,admin} = useAuth();
  const [orderContext, setOrderContext] = useState('self');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Load menu items
  const loadMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await employeeMenuApi.getWeeklyMenu(selectedDay, filters.category);
      const items = response.data.map(item => item.menuItem);
      setMenuItems(items);
      setFilteredItems(items);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load menu items");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadMenuItems();
      return;
    }

    try {
      setLoading(true);
      const response = await employeeMenuApi.searchItems(searchQuery);
      const items = response.data.filter(item => filters.status === "all" || item.isActive);
      setMenuItems(items);
      setFilteredItems(items);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
      console.error("Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search and filters
  useEffect(() => {
    let filtered = menuItems;
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )}

    if (filters.status !== "all") {
      filtered = filtered.filter(item => 
        filters.status === "active" ? item.isActive : !item.isActive
      );
    }

    setFilteredItems(filtered);
  }, [menuItems, searchQuery, filters.status]);

  // Load menu items when day or category changes
  useEffect(() => {
    loadMenuItems();
  }, [selectedDay, filters.category]);

  // Handle ordering an item
  const handleOrderItem = async (item) => {
    if (!item.isActive) return;
    
    try {
      setOrderingItem(item.id);
      
      // Determine employee ID based on context
   const employeeId =
  isAdmin && orderContext === 'employee'
    ? selectedEmployeeId
    : employee?.employeeId || (isAdmin ? "admin_emp_id" : null);  // fallback


      
      if (!employeeId) {
        throw new Error("Employee ID not available");
      }

      const response = await api.post('/api/orders', {
        employeeId,
        menuId: item.menuId,
        quantity: 1,
        expectedDeliveryDate: new Date().toISOString().split('T')[0],
        remarks: isAdmin ? `Ordered by admin for ${orderContext === 'employee' ? 'employee ' + selectedEmployeeId : 'self'}` : ''
      });
      
      setOrderSuccessData({
        itemName: item.name,
        orderId: response.data.id,
        forEmployee: isAdmin && orderContext === 'employee' ? selectedEmployeeId : null
      });
      setShowOrderSuccess(true);
    } catch (err) {
      alert(`Failed to place order: ${err.response?.data?.message || err.message}`);
    } finally {
      setOrderingItem(null);
    }
  };

  // Handle ordering a whole category
  const handleOrderCategory = (category, items) => {
    const activeItems = items.filter(item => item.isActive);
    const totalPrice = activeItems.reduce((sum, item) => sum + item.price, 0);
    console.log("Ordering category:", category, activeItems);
    alert(`Ordering all ${category} items (${activeItems.length} items) - Total: ₹${totalPrice}`);
  };

  // Get icon for category
  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "breakfast":
        return (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
          </svg>
        );
      case "lunch":
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        );
      case "thali":
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case "snacks":
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        );
      case "beverages":
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  // Get day name
  const getDayName = (day) => {
    const dayNames = {
      MONDAY: "Monday",
      TUESDAY: "Tuesday",
      WEDNESDAY: "Wednesday",
      THURSDAY: "Thursday",
      FRIDAY: "Friday",
    };
    return dayNames[day] || day;
  };

  // Group items by category
  const groupedItems = filteredItems.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
    return groups;
  }, {});

  // Define category order
  const categoryOrder = ["breakfast", "lunch", "thali", "snacks", "beverages"];
  const sortedCategories = categoryOrder.filter((category) => groupedItems[category]?.length > 0);

  // Days of the week
  const DAYS = [
    { key: "MONDAY", label: "Monday" },
    { key: "TUESDAY", label: "Tuesday" },
    { key: "WEDNESDAY", label: "Wednesday" },
    { key: "THURSDAY", label: "Thursday" },
    { key: "FRIDAY", label: "Friday" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-600">Menu Management</h1>
                <p className="text-gray-600">Browse and order from our canteen menu</p>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
              </svg>
              View Cart
            </button>
          </div>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={orderContext === 'self'}
                  onChange={() => setOrderContext('self')}
                  className="mr-2"
                />
                Order for myself
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={orderContext === 'employee'}
                  onChange={() => {
                    setOrderContext('employee');
                    setSelectedEmployeeId('');
                  }}
                  className="mr-2"
                />
                Order for employee
              </label>
            </div>
            
            {orderContext === 'employee' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter employee ID"
                />
              </div>
            )}
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search Menu Items"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
              </div>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white"
              >
                <option value="all">All Categories</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="thali">Thali</option>
                <option value="snacks">Snacks</option>
                <option value="beverages">Beverages</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                  </svg>
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white"
              >
                <option value="active">Active Only</option>
                <option value="all">All Status</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Weekday Navigation Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            <div className="flex gap-1">
              {DAYS.map((day) => (
                <button
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedDay === day.key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700">Loading menu items...</span>
          </div>
        )}

        {/* Menu Table */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {filteredItems.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {searchQuery 
                  ? `No items found for "${searchQuery}"`
                  : `No menu items available for ${getDayName(selectedDay)}`}
              </div>
            ) : (
              <div>
                {sortedCategories.map((category) => (
                  <div key={category} className="border-b border-gray-200 last:border-b-0">
                    {/* Category Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getCategoryIcon(category)}
                          <h3 className="ml-3 text-lg font-semibold text-gray-900 capitalize">{category}</h3>
                          <span className="ml-2 text-sm text-gray-500">({groupedItems[category].length} items)</span>
                        </div>
                        <button
                          onClick={() => handleOrderCategory(category, groupedItems[category])}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                          </svg>
                          Order All
                        </button>
                      </div>
                    </div>

                    {/* Category Items Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ITEM NAME</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QUANTITY</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRICE</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {groupedItems[category].map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                  {item.description && <div className="text-sm text-gray-500">{item.description}</div>}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ₹{item.price}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                  {item.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleOrderItem(item)}
                                  disabled={!item.isActive || orderingItem === item.id}
                                  className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-all transform ${
                                    item.isActive
                                      ? "bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-lg hover:shadow-xl"
                                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  }`}
                                >
                                  {orderingItem === item.id ? (
                                    <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                  )}
                                  {orderingItem === item.id ? 'Ordering...' : 'Order'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order Success Modal */}
        {showOrderSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Order Placed Successfully!</h3>
                <p className="mb-4">
                  Your order for {orderSuccessData.itemName} has been placed.
                  <br />
                  Order ID: #{orderSuccessData.orderId}
                  {isAdmin && orderSuccessData.forEmployee && (
                    <span className="block text-sm text-gray-600 mt-2">
                      Ordered for employee: {orderSuccessData.forEmployee}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => setShowOrderSuccess(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}