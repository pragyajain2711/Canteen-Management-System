import { useState } from 'react';
import { 
  ClipboardList, Search, Filter, X, Loader, 
  Info, User, Utensils, DollarSign, ChevronDown,
  Clock, CheckCircle, Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const statusClasses = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PREPARING: 'bg-blue-100 text-blue-800',
  READY: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800'
};

export default function AdminOrderManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [priceHistory, setPriceHistory] = useState(null);
  const queryClient = useQueryClient();

  // Fetch active orders
  /*const { data: orders, isLoading, error } = useQuery({
    queryKey: ['activeOrders'],
    queryFn: () => orderApi.getAllOrders({ status: 'PENDING,PREPARING,READY' }),
    refetchInterval: 30000
  });*/

  // In AdminOrderManagement.jsx, modify the query:
const { data: orders, isLoading, error } = useQuery({
  queryKey: ['activeOrders'],
  queryFn: async () => {
    const response = await orderApi.getAllOrders(); // fetch all

    console.log('API Response:', response); // Add this line
    return response.data;
  },
  refetchInterval: 30000
});

 //✅ Filter only active statuses in frontend
  const activeStatuses = ['PENDING', 'PREPARING', 'READY'];

  // Fetch detailed order data
  const { data: orderDetails } = useQuery({
    queryKey: ['orderDetails', selectedOrder?.id],
    queryFn: () => selectedOrder ? orderApi.getOrderDetails(selectedOrder.id) : null,
    enabled: !!selectedOrder
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }) => 
      orderApi.updateStatus(orderId, status),
    onSuccess: () => queryClient.invalidateQueries(['activeOrders'])
  });

  // Cancel order mutation
  const cancelMutation = useMutation({
    mutationFn: (orderId) => orderApi.cancelOrder(orderId),
    onSuccess: () => queryClient.invalidateQueries(['activeOrders'])
  });

  // Fetch price history
  const fetchPriceHistory = async (orderId) => {
    try {
      const { data } = await orderApi.getOrderPriceHistory(orderId);
      setPriceHistory(data);
    } catch (err) {
      console.error('Failed to fetch price history:', err);
    }
  };


const normalizedOrders = orders?.map(order => ({
  ...order,
  employeeId: String(order.employee?.id || ''),         // ← force to string
  employeeName: String(order.employee?.name || ''),
  menuItemName: String(order.menuItem?.name || '')
})) || [];


  // Filter orders
const filteredOrders = normalizedOrders.filter(order => {
  const isActiveStatus = activeStatuses.includes(order.status);
  const matchesSearch = 
    order.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesStatus =
    statusFilter === 'all' || order.status === statusFilter.toUpperCase();
  return isActiveStatus && matchesSearch && matchesStatus;
});


  // New orders notification
  const newOrders = orders?.filter(o => o.status === 'PENDING').slice(0, 3) || [];

  if (isLoading) return <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>;
  if (error) return <div className="text-red-500 p-4">{error.message}</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Active Orders</h1>
        <div className="flex items-center space-x-4">
          {newOrders.length > 0 && (
            <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
              <ClipboardList className="text-blue-600 mr-2" size={18} />
              <span className="text-sm font-medium">{newOrders.length} new orders</span>
            </div>
          )}
          <Link to="/admin-dashboard/orders/history" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View Order History →
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="text-gray-500" size={18} />
          <select 
            className="border rounded-lg px-3 py-2 flex-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
          </select>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Amount:</span>
            <span className="font-bold">
              ${filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.employeeId}</div>
                  <div className="text-sm text-gray-500">{order.employeeName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="hover:text-blue-600 flex items-center"
                  >
                    {order.menuItemName}
                    <Info className="ml-1" size={16} />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[order.status]}`}>
                    {order.status.toLowerCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <select
                    value={order.status}
                    onChange={(e) => statusMutation.mutate({
                      orderId: order.id, 
                      status: e.target.value
                    })}
                    className="text-xs border rounded px-2 py-1"
                    disabled={statusMutation.isLoading}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="READY">Ready</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                  <button 
                    onClick={() => {
                      if (window.confirm('Cancel this order?')) {
                        cancelMutation.mutate(order.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-200 rounded"
                    disabled={cancelMutation.isLoading}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="p-8 text-center text-gray-500">No active orders found</div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Order Details (#{selectedOrder.id})</h2>
              <button onClick={() => {
                setSelectedOrder(null);
                setPriceHistory(null);
              }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 flex items-center">
                  <ClipboardList className="mr-2" size={18} /> Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[selectedOrder.status]}`}>
                      {selectedOrder.status.toLowerCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p>{new Date(selectedOrder.orderTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivery Date</p>
                    <p>{new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Price</p>
                    <p className="font-medium">${selectedOrder.totalPrice?.toFixed(2)}</p>
                  </div>
                  {selectedOrder.remarks && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Remarks</p>
                      <p className="text-sm">{selectedOrder.remarks}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Employee Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 flex items-center">
                  <User className="mr-2" size={18} /> Employee Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Employee ID</p>
                    <p className="font-medium">{selectedOrder.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p>{selectedOrder.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p>{orderDetails?.employee?.department || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <button 
                      onClick={() => orderApi.getOrderEmployeeDetails(selectedOrder.id)}
                      className="text-blue-600 text-sm flex items-center"
                    >
                      View full details <ChevronDown size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Item Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 flex items-center">
                  <Utensils className="mr-2" size={18} /> Item Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Item Name</p>
                    <p className="font-medium">{selectedOrder.menuItemName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p>{orderDetails?.menuItem?.category || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p>{selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unit Price</p>
                    <p>${selectedOrder.priceAtOrder?.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Price History */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 flex items-center">
                  <DollarSign className="mr-2" size={18} /> Price History
                </h3>
                <button 
                  onClick={() => fetchPriceHistory(selectedOrder.id)}
                  className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm flex items-center"
                >
                  {priceHistory ? 'Refresh History' : 'Load Price History'}
                  <ChevronDown size={16} className="ml-1" />
                </button>
                {priceHistory && (
                  <div className="mt-2 border rounded p-2 max-h-40 overflow-y-auto">
                    {priceHistory.length > 0 ? (
                      priceHistory.map((history, idx) => (
                        <div key={idx} className="text-sm py-1 border-b flex justify-between">
                          <span>{new Date(history.date).toLocaleDateString()}</span>
                          <span className="font-medium">${history.price.toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No price history available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}