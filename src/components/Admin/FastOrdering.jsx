// FastOrdering.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search,
  Plus,
  Minus,
  X,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import api from '../api';

const FastOrdering = () => {
  // State
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeResults, setEmployeeResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', description: '', variant: '' });

  // Show toast function
  const showToast = (title, description, variant = 'default') => {
    setToast({ show: true, title, description, variant });
    setTimeout(() => setToast({ show: false, title: '', description: '', variant: '' }), 3000);
  };

  // Categories from your menu items
  const categories = ['Breakfast', 'Lunch', 'Beverages', 'Snacks'];

  // Load initial menu items
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setLoading(true);
        const response = await api.get('api/menu/items/active');
        setMenuItems(response.data);
        setFilteredItems(response.data);
      } catch (err) {
        showToast("Error", "Failed to load menu items", "destructive");
        console.error('Failed to load menu items:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMenuItems();
  }, []);

  // Search employees using the proper API endpoint with authentication
  const searchEmployees = async () => {
    if (employeeSearch.length < 2) {
      setEmployeeResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('api/admin/customers/filter', {
        params: { search: employeeSearch }
      });
      
      // Filter out superadmins and map to our format
      const validEmployees = response.data
        .filter(emp => !emp.isSuperAdmin)
        .map(emp => ({
          id: emp.id,
          employeeId: emp.employeeId, // business ID string
          firstName: emp.firstName,
          lastName: emp.lastName,
          department: emp.department || 'General',
          isActive: emp.isActive
        }));
      
      setEmployeeResults(validEmployees);
    } catch (err) {
      if (err.response?.status === 403) {
        showToast("Access Denied", "You don't have permission to search employees", "destructive");
      } else {
        showToast("Error", "Employee search failed", "destructive");
      }
      console.error('Employee search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employee details by ID using the proper API endpoint
  const fetchEmployeeDetails = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`api/admin/customers/${id}`);
      
      setSelectedEmployee({
        id: response.data.id, // database ID
        employeeId: response.data.employeeId, // business ID string
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        department: response.data.department || 'General',
        isActive: response.data.isActive
      });
    } catch (err) {
      if (err.response?.status === 403) {
        showToast("Access Denied", "You don't have permission to view employee details", "destructive");
      } else {
        showToast("Error", "Failed to load employee details", "destructive");
      }
      console.error('Failed to load employee details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items
  const filterMenuItems = () => {
    let results = menuItems.filter(item => 
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearch.toLowerCase())
    );

    if (activeCategory) {
      results = results.filter(item => item.category === activeCategory);
    }

    setFilteredItems(results);
  };

  // Add item to order
  const addToOrder = (item) => {
    if (!item.availableStatus) {
      showToast("Item unavailable", "This item is currently sold out", "destructive");
      return;
    }

    setOrderItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { 
        ...item, 
        quantity: 1,
        menuId: item.menuId // business ID string
      }];
    });
  };

  // Update item quantity
  const updateQuantity = (index, change) => {
    setOrderItems(prev => {
      const newQuantity = prev[index].quantity + change;
      if (newQuantity < 1) {
        return prev.filter((_, i) => i !== index);
      }
      return prev.map((item, i) => 
        i === index ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  // Submit order - always set status as DELIVERED for counter orders
 /* const submitOrder = async () => {
    if (!selectedEmployee || orderItems.length === 0) {
      showToast("Incomplete order", "Please select an employee and add items to order", "destructive");
      return;
    }

    try {
      setLoading(true);
      
      // Create orders for each item with status DELIVERED
      const results = await Promise.all(orderItems.map(item => 
        api.post('api/orders', {
          employeeId: selectedEmployee.employeeId, // business ID string
          menuId: item.menuId, // business ID string
          quantity: item.quantity,
          remarks: remarks,
          expectedDeliveryDate: new Date().toISOString().split('T')[0],
          status: 'DELIVERED' // Always set as DELIVERED for counter orders
        })
      ));

      setOrderItems([]);
      setRemarks('');
      showToast("Success", "Order placed and marked as delivered successfully!");
      
      // Immediately create transactions for these delivered orders
      try {
        await api.post('api/transactions/create-transactions');
      } catch (txnErr) {
        console.error('Failed to create transactions:', txnErr);
        // Not showing error to user as the order was successfully placed
      }
    } catch (err) {
      let errorMessage = "Failed to place order";
      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = "You don't have permission to place orders";
        } else if (err.response.data) {
          errorMessage = err.response.data.includes("Employee not found") 
            ? "Employee not found - please check the employee ID"
            : err.response.data;
        }
      }
      showToast("Order failed", errorMessage, "destructive");
      console.error('Order submission failed:', err);
    } finally {
      setLoading(false);
    }
  };*/

  // In FastOrdering.jsx - modify the submitOrder function
const submitOrder = async () => {
  if (!selectedEmployee || orderItems.length === 0) {
    showToast("Incomplete order", "Please select an employee and add items to order", "destructive");
    return;
  }

  try {
    setLoading(true);
    
    // Create orders for each item with status DELIVERED
    const results = await Promise.all(orderItems.map(item => 
      api.post('api/orders', {
        employeeId:  selectedEmployee.employeeId ,
        menuId: item.menuId ,
        quantity: item.quantity,
        remarks: remarks,
        expectedDeliveryDate: new Date().toISOString().split('T')[0],
        status: 'DELIVERED' // Always set as DELIVERED for counter orders
      })
    ));

    setOrderItems([]);
    setRemarks('');
    showToast("Success", "Order placed and marked as delivered successfully!");
    
    // Immediately create transactions for these delivered orders
    try {
      await api.post('api/transactions/create-transactions');
    } catch (txnErr) {
      console.error('Failed to create transactions:', txnErr);
    }
  } catch (err) {
    let errorMessage = "Failed to place order";
      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = "You don't have permission to place orders";
        } else if (err.response.data) {
          errorMessage = err.response.data.includes("Employee not found") 
            ? "Employee not found - please check the employee ID"
            : err.response.data;
        }
      }
      showToast("Order failed", errorMessage, "destructive");
      console.error('Order submission failed:', err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm ${
          toast.variant === 'destructive' 
            ? 'bg-red-100 border border-red-200 text-red-900' 
            : 'bg-green-100 border border-green-200 text-green-900'
        }`}>
          <div className="flex items-center gap-3">
            {toast.variant === 'destructive' ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <Check className="h-5 w-5 text-green-500" />
            )}
            <div>
              <h4 className="font-semibold">{toast.title}</h4>
              <p className="text-sm">{toast.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Left Column - Employee and Menu Search */}
      <div className="space-y-6">
        {/* Employee Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Customer Search</h3>
          </div>
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                value={employeeSearch}
                onChange={(e) => {
                  setEmployeeSearch(e.target.value);
                  searchEmployees();
                }}
                placeholder="Search by employee ID or name"
                className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            )}
            
            {employeeResults.length > 0 && (
              <div className="mt-4 h-48 rounded-md border border-gray-200 overflow-auto">
                <div className="p-2 space-y-2">
                  {employeeResults.map(emp => (
                    <div 
                      key={emp.id}
                      className="p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => fetchEmployeeDetails(emp.id)}
                    >
                      <div className="font-medium">{emp.employeeId}</div>
                      <div>{emp.firstName} {emp.lastName}</div>
                      <div className="text-sm text-gray-500">{emp.department}</div>
                      <div className={`text-xs mt-1 inline-block px-2 py-1 rounded-full ${
                        emp.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedEmployee && (
              <div className="mt-4 p-4 bg-blue-50/50 rounded-md border border-blue-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </h4>
                    <div className="text-sm">ID: {selectedEmployee.employeeId}</div>
                    <div className="text-sm text-gray-500">
                      Department: {selectedEmployee.department}
                    </div>
                    <div className={`text-xs mt-1 inline-block px-2 py-1 rounded-full ${
                      selectedEmployee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      Status: {selectedEmployee.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    onClick={() => setSelectedEmployee(null)}
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menu Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Menu Items</h3>
          </div>
          <div className="p-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                value={menuSearch}
                onChange={(e) => {
                  setMenuSearch(e.target.value);
                  filterMenuItems();
                }}
                placeholder="Search menu items"
                className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    activeCategory === cat 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setActiveCategory(activeCategory === cat ? null : cat);
                    filterMenuItems();
                  }}
                >
                  {cat}
                  {activeCategory === cat && <Check className="ml-2 h-4 w-4 inline" />}
                </button>
              ))}
            </div>

            {/* Menu Items List */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className={`rounded-lg border border-gray-200 cursor-pointer transition-all ${
                      !item.availableStatus ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md'
                    }`}
                    onClick={() => addToOrder(item)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-base">{item.name}</h4>
                        <div className="font-medium">₹{item.price}</div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    {!item.availableStatus && (
                      <div className="p-4 pt-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Order Summary */}
      <div className="sticky top-6 h-fit">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Order Summary</h3>
          </div>
          <div className="p-6">
            {selectedEmployee ? (
              <>
                <div className="font-medium mb-1">
                  For: {selectedEmployee.firstName} {selectedEmployee.lastName}
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  {selectedEmployee.employeeId} • {selectedEmployee.department}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 mb-4 text-center py-4">
                No customer selected
              </div>
            )}

            <textarea
              placeholder="Add remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              rows={3}
            />

            <div className="border-t border-gray-200 my-4"></div>

            {orderItems.length > 0 ? (
              <>
                <div className="max-h-72 mb-4 overflow-auto">
                  <div className="space-y-3 pr-4">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            ₹{item.price} × {item.quantity}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="h-8 w-8 p-0 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            onClick={() => updateQuantity(index, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <div className="w-8 text-center">{item.quantity}</div>
                          <button
                            className="h-8 w-8 p-0 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            onClick={() => updateQuantity(index, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            className="h-8 w-8 p-0 text-red-600 rounded-md flex items-center justify-center hover:bg-red-50"
                            onClick={() => updateQuantity(index, -item.quantity)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                <div className="flex justify-between mb-6">
                  <div className="font-medium">Total:</div>
                  <div className="font-medium">
                    ₹{orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center"
                    onClick={submitOrder}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Place Order (Delivered)
                  </button>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 text-center py-8">
                Add items to create an order
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FastOrdering;