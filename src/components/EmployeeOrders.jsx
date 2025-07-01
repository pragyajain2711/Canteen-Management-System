import { useState, useEffect } from 'react';
import { 
  Loader, Plus, X, CheckCircle, ChevronDown, ChevronUp,
  ShoppingCart, Clock, Check, XCircle, AlertCircle
} from 'lucide-react';
import api from './api';
import { useAuth } from './AuthContext';

export default function EmployeeOrders() {
  // Authentication and user context
  const { employee, isAdmin ,admin} = useAuth();
  //const { employee = {}, isAdmin = false } = useAuth();

  // Order listing state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');
  
  // Order creation state
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderContext, setOrderContext] = useState('self');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

console.log("🔐 employee:", employee);
console.log("🛡️ isAdmin:", isAdmin);
console.log("📌 orderContext:", orderContext);
console.log("🧍 selectedEmployeeId:", selectedEmployeeId);

const getEffectiveEmployeeId = () => {
  if (!isAdmin) return employee?.employeeId;
  return orderContext === 'employee' ? selectedEmployeeId : employee?.employeeId;
};



const fetchOrders = async () => {
  try {
    setLoading(true);
    setError(null);

    const effectiveEmployeeId = getEffectiveEmployeeId();
    console.log("✅ Effective Employee ID:", effectiveEmployeeId);

    if (!effectiveEmployeeId) {
      setError("Employee ID not available");
      return;
    }

    const status = activeTab === 'current'
      ? 'PENDING,PREPARING,READY'
      : 'DELIVERED,CANCELLED';

   

    const response = await api.get(`/api/orders`); // no params
console.log("📦 Orders API Response:", response.data);
setOrders(response.data || []);

  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
  } finally {
    setLoading(false);
  }
};

  // Fetch menu items for order form
  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/api/menu/items/active');
      setMenuItems(response.data);
    } catch (err) {
      console.error('Failed to fetch menu items', err);
    }
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchOrders();
    if (showOrderForm) {
      fetchMenuItems();
    }
  }, [activeTab, orderContext, selectedEmployeeId, showOrderForm]);

  // Cancel an order
  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.delete(`/api/orders/${orderId}`);
      fetchOrders();
    } catch (err) {
      alert(`Failed to cancel order: ${err.response?.data?.message || err.message}`);
    }
  };

  // Add item to order
  const handleAddItem = (item) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.menuId === item.menuId);
      if (existing) {
        return prev.map(i => 
          i.menuId === item.menuId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Change item quantity
  const handleQuantityChange = (menuId, quantity) => {
    if (quantity < 1) return;
    setSelectedItems(prev =>
      prev.map(item => 
        item.menuId === menuId ? { ...item, quantity } : item
      )
    );
  };

  // Submit new order
  const handleSubmitOrder = async () => {
    if (selectedItems.length === 0) {
      setFormError('Please select at least one item');
      return;
    }

    try {
      setFormLoading(true);
      setFormError(null);
      
      const orderRequests = selectedItems.map(item => ({
        employeeId: getEffectiveEmployeeId(),
        menuId: item.menuId,
        quantity: item.quantity,
        expectedDeliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
        remarks: `${remarks} ${isAdmin ? `(Ordered by admin for ${orderContext === 'employee' ? 'employee ' + selectedEmployeeId : 'self'})` : ''}`
      }));

      // Submit all orders
      const responses = await Promise.all(
        orderRequests.map(order => api.post('/api/orders', order))
      );

      // Show success message
      setOrderSuccessData({
        itemCount: selectedItems.length,
        orderIds: responses.map(r => r.data.id)
      });
      setShowOrderSuccess(true);
      
      // Reset form and refresh orders
      setSelectedItems([]);
      setDeliveryDate('');
      setRemarks('');
      fetchOrders();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to place order');
      console.error('Order submission error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusClasses = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PREPARING: 'bg-blue-100 text-blue-800',
      READY: 'bg-green-100 text-green-800',
      DELIVERED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[status]}`}>
        {status.toLowerCase()}
      </span>
    );
  };

  // Render loading state
  if (loading && !showOrderForm) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  // Render error state
  if (error && !showOrderForm) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isAdmin ? 'Orders Management' : 'My Orders'}</h1>
        <button 
          onClick={() => setShowOrderForm(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          New Order
        </button>
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

      {/* Order Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'current' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('current')}
        >
          Current Orders
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('history')}
        >
          Order History
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.itemName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${order.priceAtOrder?.toFixed(2) || '0.00'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${order.totalPrice?.toFixed(2) || '0.00'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {order.status === 'PENDING' && (
                    <button 
                      onClick={() => cancelOrder(order.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No {activeTab === 'current' ? 'current' : 'past'} orders found
            {isAdmin && orderContext === 'employee' && selectedEmployeeId && ` for employee ${selectedEmployeeId}`}
          </div>
        )}
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {isAdmin 
                  ? `Place Order for ${orderContext === 'employee' ? 'Employee' : 'Myself'}`
                  : 'Place New Order'}
              </h2>
              <button 
                onClick={() => {
                  setShowOrderForm(false);
                  setSelectedItems([]);
                  setFormError(null);
                }} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {isAdmin && orderContext === 'employee' && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800">
                  You are ordering for employee: <span className="font-bold">{selectedEmployeeId}</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Available Items */}
              <div>
                <h3 className="font-medium mb-3">Available Items</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {menuItems.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Loader className="animate-spin h-6 w-6 mx-auto mb-2" />
                      Loading menu items...
                    </div>
                  ) : (
                    menuItems.map(item => (
                      <div key={item.menuId} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">${item.price.toFixed(2)}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                          )}
                        </div>
                        <button 
                          onClick={() => handleAddItem(item)}
                          className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-200"
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-medium mb-3">Order Summary</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                    <input
                      type="date"
                      className="w-full border rounded-lg px-3 py-2"
                      value={deliveryDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <textarea
                      className="w-full border rounded-lg px-3 py-2"
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Any special instructions..."
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Selected Items</h4>
                    {selectedItems.length === 0 ? (
                      <p className="text-gray-500 text-sm">No items selected yet</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedItems.map(item => (
                          <div key={item.menuId} className="flex justify-between items-center p-2 border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-600">${item.price.toFixed(2)} each</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleQuantityChange(item.menuId, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => handleQuantityChange(item.menuId, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between font-medium">
                      <span>Total Amount:</span>
                      <span>
                        ${selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                                    {formError && (
                    <div className="text-red-500 text-sm">{formError}</div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowOrderForm(false);
                        setSelectedItems([]);
                        setFormError(null);
                      }}
                      className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitOrder}
                      disabled={formLoading || selectedItems.length === 0}
                      className={`px-4 py-2 rounded-lg flex items-center ${
                        formLoading || selectedItems.length === 0
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {formLoading ? (
                        <>
                          <Loader className="animate-spin h-4 w-4 mr-2" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Place Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                {orderSuccessData.itemCount > 1
                  ? `Your ${orderSuccessData.itemCount} orders have been placed.`
                  : 'Your order has been placed.'}
                <br />
                {orderSuccessData.orderIds.length > 1 ? (
                  <span className="text-sm text-gray-600">
                    Order IDs: {orderSuccessData.orderIds.join(', ')}
                  </span>
                ) : (
                  <span className="text-sm text-gray-600">
                    Order ID: {orderSuccessData.orderIds[0]}
                  </span>
                )}
              </p>
              <button
                onClick={() => {
                  setShowOrderSuccess(false);
                  setShowOrderForm(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}