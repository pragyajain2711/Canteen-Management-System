import { useState } from "react"
import {
  ClipboardList,
  Search,
  X,
  Loader,
  User,
  Utensils,
  IndianRupee,
  ChevronDown,
  Clock,
  CheckCircle,
  Truck,
  Package,
  Bell,
  ChefHat,
  RefreshCw,
} from "lucide-react"
import { Link } from "react-router-dom"
import { orderApi } from "../api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"

const statusConfig = {
  PENDING: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    label: "Pending",
    priority: 1,
  },
  PREPARING: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: ChefHat,
    label: "Preparing",
    priority: 2,
  },
  READY: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    label: "Ready",
    priority: 3,
  },
  DELIVERED: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Truck,
    label: "Delivered",
    priority: 4,
  },
  CANCELLED: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: X,
    label: "Cancelled",
    priority: 5,
  },
}

const categoryConfig = {
  breakfast: { color: "bg-orange-100 text-orange-800", icon: "🌅" },
  lunch: { color: "bg-green-100 text-green-800", icon: "🍽️" },
  snacks: { color: "bg-purple-100 text-purple-800", icon: "🍿" },
  beverages: { color: "bg-blue-100 text-blue-800", icon: "☕" },
}

export default function AdminOrderManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [priceHistory, setPriceHistory] = useState(null)
  const [selectedOrders, setSelectedOrders] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: "orderTime", direction: "desc" })
  const [expandedOrders, setExpandedOrders] = useState({})
  const [activeOrderFilter, setActiveOrderFilter] = useState("all")
  const [lastRefreshed, setLastRefreshed] = useState(null)

  const queryClient = useQueryClient()

  const { 
    data: orders, 
    isLoading, 
    error, 
    refetch: refetchOrders 
  } = useQuery({
    queryKey: ["activeOrders"],
    queryFn: async () => {
      try {
        const response = await orderApi.getAllOrders()
        setLastRefreshed(new Date())
        return response.data
      } catch (error) {
        throw error
      }
    },
    refetchInterval: 30000,
  })

  const activeStatuses = ["PENDING", "PREPARING", "READY"]

  const { data: orderDetails } = useQuery({
    queryKey: ["orderDetails", selectedOrder?.id],
    queryFn: () => (selectedOrder ? orderApi.getOrderDetails(selectedOrder.id) : null),
    enabled: !!selectedOrder,
  })

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }) => orderApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["activeOrders"])
      toast.success("Order status updated successfully")
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`)
    }
  })

  const cancelMutation = useMutation({
    mutationFn: (orderId) => orderApi.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries(["activeOrders"])
      toast.success("Order cancelled successfully")
    },
    onError: (error) => {
      toast.error(`Failed to cancel order: ${error.message}`)
    }
  })

  const fetchPriceHistory = async (orderId) => {
    try {
      const { data } = await orderApi.getOrderPriceHistory(orderId)
      setPriceHistory(data)
      toast.success("Price history loaded")
    } catch (err) {
      console.error("Failed to fetch price history:", err)
      toast.error("Failed to load price history")
    }
  }

  const handleRefresh = async () => {
    try {
      await refetchOrders()
      toast.success(`Orders refreshed at ${new Date().toLocaleTimeString()}`)
    } catch (error) {
      toast.error("Failed to refresh orders")
    }
  }

  const normalizedOrders =
    orders?.map((order) => ({
      ...order,
      employeeId: String(order.employee?.employee_id || order.employee?.employeeId || order.employee?.id || ""),
      employeeName: String(order.employee?.name || order.employee?.fullName || ""),
      employeeDepartment: String(order.employee?.department || ""),
      employeeEmail: String(order.employee?.email || ""),
      menuItemName: String(order.menuItem?.name || ""),
      menuItemCategory: String(order.menuItem?.category || ""),
      menuItemId: String(order.menuItem?.menuId || order.menuItem?.id || ""),
      currentPrice: order.menuItem?.currentPrice || order.priceAtOrder,
    })) || []

  const filteredOrders = normalizedOrders.filter((order) => {
    const isActiveStatus = activeStatuses.includes(order.status)
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      searchTerm === "" ||
      order.employeeId.toLowerCase().includes(searchLower) ||
      order.employeeName.toLowerCase().includes(searchLower) ||
      order.menuItemName.toLowerCase().includes(searchLower) ||
      String(order.id).toLowerCase().includes(searchLower) ||
      order.menuItemId.toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === "all" || order.status === statusFilter.toUpperCase()
    const matchesDepartment = departmentFilter === "all" || order.employeeDepartment === departmentFilter

    return isActiveStatus && matchesSearch && matchesStatus && matchesDepartment
  })

  const allOrdersForStats = normalizedOrders || []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaysOrders = allOrdersForStats.filter((order) => {
    const orderDate = new Date(order.orderTime)
    orderDate.setHours(0, 0, 0, 0)
    return orderDate.getTime() === today.getTime()
  })

  const activeOrdersByStatus = filteredOrders.filter((order) => {
    if (activeOrderFilter === "all") return true
    return order.status === activeOrderFilter.toUpperCase()
  })

  const ordersToDisplay = activeOrdersByStatus

  const sortedOrders = [...ordersToDisplay].sort((a, b) => {
    let aValue = a[sortConfig.key]
    let bValue = b[sortConfig.key]

    if (sortConfig.key === "priority") {
      aValue = statusConfig[a.status]?.priority || 0
      bValue = statusConfig[b.status]?.priority || 0
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleBulkAction = (action) => {
    if (selectedOrders.length === 0) return

    selectedOrders.forEach((orderId) => {
      if (action === "mark-preparing") {
        statusMutation.mutate({ orderId, status: "PREPARING" })
      } else if (action === "mark-ready") {
        statusMutation.mutate({ orderId, status: "READY" })
      } else if (action === "mark-delivered") {
        statusMutation.mutate({ orderId, status: "DELIVERED" })
      }
    })
    setSelectedOrders([])
  }

  const newOrders = orders?.filter((o) => o.status === "PENDING").slice(0, 3) || []
  const deliveredOrders = allOrdersForStats.filter((order) => order.status === "DELIVERED").length
  const cancelledOrders = allOrdersForStats.filter((order) => order.status === "CANCELLED").length

  const activeOrdersCounts = {
    all: filteredOrders.length,
    pending: filteredOrders.filter((order) => order.status === "PENDING").length,
    preparing: filteredOrders.filter((order) => order.status === "PREPARING").length,
    ready: filteredOrders.filter((order) => order.status === "READY").length,
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader className="animate-spin w-6 h-6" />
          <span>Loading orders...</span>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <X className="w-5 h-5" />
            <span className="font-medium">Error loading orders</span>
          </div>
          <p className="text-red-600 mt-1">{error.message}</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="text-blue-600" size={32} />
              Active Order Management
              {newOrders.length > 0 && (
                <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full flex items-center gap-1">
                  <Bell size={14} />
                  {newOrders.length} New
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">Manage pending, preparing, and ready orders</p>
            {lastRefreshed && (
              <p className="text-xs text-gray-500 mt-1">
                Last refreshed: {lastRefreshed.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
            <Link
              to="/admin-dashboard/orders/history"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              View History
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-blue-600">{activeOrdersCounts[activeOrderFilter]}</p>
              </div>
              <Package className="text-blue-600" size={24} />
            </div>
            <div className="mt-2">
              <select
                className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                value={activeOrderFilter}
                onChange={(e) => setActiveOrderFilter(e.target.value)}
              >
                <option value="all">All Active ({activeOrdersCounts.all})</option>
                <option value="pending">Pending ({activeOrdersCounts.pending})</option>
                <option value="preparing">Preparing ({activeOrdersCounts.preparing})</option>
                <option value="ready">Ready ({activeOrdersCounts.ready})</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Orders</p>
                <p className="text-2xl font-bold text-gray-900">{todaysOrders.length}</p>
              </div>
              <Package className="text-gray-600" size={24} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{deliveredOrders}</p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{cancelledOrders}</p>
              </div>
              <X className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by ID, Name, or Item..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
            </select>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Finance">IS</option>
              <option value="Operations">LPG</option>
            </select>

            <div className="text-sm text-gray-600 flex items-center">Showing {sortedOrders.length} active orders</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedOrders.map((order) => {
          const statusConfig_ = statusConfig[order.status]
          const StatusIcon = statusConfig_?.icon || Clock
          const isExpanded = expandedOrders[order.id] || false

          return (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Order ID: #{order.id}</h3>
                    <div className="text-sm text-gray-500">
                      <div className="font-medium text-gray-900">{order.employeeName}</div>
                      <div className="text-gray-500">Employee ID: {order.employeeId || "N/A"}</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    Placed at:{" "}
                    {new Date(order.orderTime).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        statusMutation.mutate({
                          orderId: order.id,
                          status: e.target.value,
                        })
                      }
                      className={`text-sm font-medium px-3 py-1.5 rounded-md border ${statusConfig_?.color || "bg-gray-100 text-gray-800"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      disabled={statusMutation.isLoading}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="READY">Ready</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">Total: ₹{order.totalPrice?.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <button
                  onClick={() => setExpandedOrders((prev) => ({ ...prev, [order.id]: !prev[order.id] }))}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                  {isExpanded ? "Hide Items" : "View Items"}
                </button>

                <div className="mt-3 text-sm">
                  <span className="text-gray-500">Expected Delivery:</span>
                  <span className="ml-2 font-medium">
                    {new Date(order.expectedDeliveryDate || order.orderTime).toLocaleDateString()}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                            <th className="pb-2">Item</th>
                            <th className="pb-2 text-center">Qty</th>
                            <th className="pb-2 text-right">Price</th>
                            <th className="pb-2 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="text-sm">
                            <td className="py-2">
                              <div>
                                <div className="font-medium text-gray-900">{order.menuItemName}</div>
                                <div className="text-gray-500 text-xs">{order.menuItemCategory}</div>
                              </div>
                            </td>
                            <td className="py-2 text-center">
                              <span className="bg-gray-200 px-2 py-1 rounded text-xs font-medium">
                                {order.quantity}
                              </span>
                            </td>
                            <td className="py-2 text-right font-medium">₹{order.priceAtOrder?.toFixed(2)}</td>
                            <td className="py-2 text-right font-bold">₹{order.totalPrice?.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {order.remarks && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Remarks:</p>
                        <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                          {order.remarks}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Department:</span>
                        <span className="ml-2 font-medium">{order.employeeDepartment || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {sortedOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active orders found</h3>
            <p className="mt-1 text-sm text-gray-500">All orders have been completed or there are no new orders.</p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Order Details (#{selectedOrder.id})</h2>
              <button
                onClick={() => {
                  setSelectedOrder(null)
                  setPriceHistory(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 flex items-center">
                  <ClipboardList className="mr-2" size={18} /> Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusConfig[selectedOrder.status]?.color}`}>
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
                    <p className="font-medium">₹{selectedOrder.totalPrice?.toFixed(2)}</p>
                  </div>
                  {selectedOrder.remarks && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Remarks</p>
                      <p className="text-sm">{selectedOrder.remarks}</p>
                    </div>
                  )}
                </div>
              </div>

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
                    <p>{selectedOrder.employeeDepartment || orderDetails?.employee?.department || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{selectedOrder.employeeEmail || "N/A"}</p>
                  </div>
                </div>
              </div>

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
                    <p>{selectedOrder.menuItemCategory || orderDetails?.menuItem?.category || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p>{selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unit Price</p>
                    <p>₹{selectedOrder.priceAtOrder?.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 flex items-center">
                  <IndianRupee className="mr-2" size={18} /> Price History
                </h3>
                <button
                  onClick={() => fetchPriceHistory(selectedOrder.id)}
                  className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm flex items-center"
                >
                  {priceHistory ? "Refresh History" : "Load Price History"}
                  <ChevronDown size={16} className="ml-1" />
                </button>
                {priceHistory && (
                  <div className="mt-2 border rounded p-2 max-h-40 overflow-y-auto">
                    {priceHistory.length > 0 ? (
                      priceHistory.map((history, idx) => (
                        <div key={idx} className="text-sm py-1 border-b flex justify-between">
                          <span>{new Date(history.date).toLocaleDateString()}</span>
                          <span className="font-medium">₹{history.price.toFixed(2)}</span>
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
  )
}