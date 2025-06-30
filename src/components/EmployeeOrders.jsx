import { useState, useEffect } from 'react';
import { 
  ClipboardList, Clock, CheckCircle, X, Loader, 
  AlertCircle, Plus, Search, Filter
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function EmployeeOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const status = activeTab === 'current' ? 'PENDING,PREPARING,READY' : 'DELIVERED,CANCELLED';
      const response = await api.get(`/api/orders/employee/${user.employeeId}`, { 
        params: { status } 
      });
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.delete(`/api/orders/${orderId}`);
      fetchOrders();
    } catch (err) {
      alert('Failed to cancel order: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
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

  if (loading) return <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <button 
          onClick={() => setShowOrderForm(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} className="mr-2" />
          New Order
        </button>
      </div>

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

      {showOrderForm && (
        <OrderForm 
          onClose={() => setShowOrderForm(false)} 
          onOrderPlaced={fetchOrders}
          employeeId={user.employeeId}
        />
      )}

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
                  ${order.priceAtOrder.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${order.totalPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
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
          </div>
        )}
      </div>
    </div>
  );
}

function OrderForm({ onClose, onOrderPlaced, employeeId }) {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await api.get('/api/menu/items/active');
        setMenuItems(response.data);
      } catch (err) {
        console.error('Failed to fetch menu items', err);
      }
    };
    fetchMenuItems();
  }, []);

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

  const handleQuantityChange = (menuId, quantity) => {
    if (quantity < 1) return;
    setSelectedItems(prev =>
      prev.map(item => 
        item.menuId === menuId ? { ...item, quantity } : item
      )
    );
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item');
      return;
    }

    try {
      setLoading(true);
      for (const item of selectedItems) {
        await api.post('/api/orders', {
          employeeId,
          menuId: item.menuId,
          quantity: item.quantity,
          expectedDeliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
          remarks
        });
      }
      onOrderPlaced();
      onClose();
    } catch (err) {
      alert('Failed to place order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Place New Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3">Available Items</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {menuItems.map(item => (
                <div key={item.menuId} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">${item.price.toFixed(2)}</div>
                  </div>
                  <button 
                    onClick={() => handleAddItem(item)}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

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
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Selected Items</h4>
                {selectedItems.length === 0 ? (
                  <p className="text-gray-500 text-sm">No items selected</p>
                ) : (
                  <div className="space-y-3">
                    {selectedItems.map(item => (
                      <div key={item.menuId} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">${item.price.toFixed(2)} each</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleQuantityChange(item.menuId, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center border rounded"
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.menuId, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center border rounded"
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
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border rounded-lg text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || selectedItems.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}