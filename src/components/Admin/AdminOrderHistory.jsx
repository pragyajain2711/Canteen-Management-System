import { useState } from 'react';
import { 
  Search, Filter, X, Loader, Calendar,ClipboardList,
  Info, User, Utensils, DollarSign, ChevronDown
} from 'lucide-react';
import { orderApi } from '../api';
import { useQuery } from '@tanstack/react-query';

const statusClasses = {
  DELIVERED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800'
};

export default function AdminOrderHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [priceHistory, setPriceHistory] = useState(null);

  // Fetch historical orders
 const { data: rawOrders, isLoading, error } = useQuery({
  queryKey: ['historicalOrders', dateRange, departmentFilter, categoryFilter],
  queryFn: async () => {
    const response = await orderApi.getOrderHistory(
      dateRange.start,
      dateRange.end,
      departmentFilter === 'all' ? undefined : departmentFilter,
      categoryFilter === 'all' ? undefined : categoryFilter
    );
    console.log("Order history response:", response);
    return response.data; // ✅ extract the actual array here
  }
});



  // Fetch detailed order data
  const { data: orderDetails } = useQuery({
    queryKey: ['orderHistoryDetails', selectedOrder?.id],
    queryFn: () => selectedOrder ? orderApi.getOrderDetails(selectedOrder.id) : null,
    enabled: !!selectedOrder
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
const normalizedOrders = rawOrders?.map(order => ({
  ...order,
  employeeId: String(order.employee?.id || ''),
  employeeName: String(order.employee?.name || ''),
  menuItemName: String(order.menuItem?.name || ''),
})) || [];


const filteredOrders = normalizedOrders.filter(order => {
  const matchesSearch =
    order.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesStatus =
    statusFilter === 'all' || order.status === statusFilter.toUpperCase();
  return matchesSearch && matchesStatus;
});


  if (isLoading) return <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>;
  if (error) return <div className="text-red-500 p-4">{error.message}</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order History</h1>
        <div className="bg-white p-3 rounded-lg shadow border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Amount:</span>
            <span className="font-bold">
              ${filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="text-gray-500" size={18} />
          <select 
            className="border rounded-lg px-3 py-2 flex-1"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="text-gray-500" size={18} />
          <select 
            className="border rounded-lg px-3 py-2 flex-1"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="snacks">Snacks</option>
            <option value="beverages">Beverages</option>
          </select>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-500" size={18} />
          <input
            type="date"
            className="border rounded-lg px-3 py-2 flex-1"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
          />
          <span>to</span>
          <input
            type="date"
            className="border rounded-lg px-3 py-2 flex-1"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
          />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
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
                  {order.menuItemName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[order.status]}`}>
                    {order.status.toLowerCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Info size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="p-8 text-center text-gray-500">No historical orders found</div>
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