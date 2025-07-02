"use client"

import { useState, useEffect } from "react"
import {
  Loader,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  Package,
  Eye,
  Trash2,
  Filter,
  Search,
  ChefHat,
} from "lucide-react"
import api from "./api"
import { orderApi } from "./api"
import { useAuth } from "./AuthContext"

export default function EmployeeOrders() {
  // Authentication and user context
  const { employee, isAdmin } = useAuth()

  // Order listing state
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("current")

  // Admin ordering context
  const [orderContext, setOrderContext] = useState("self")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [showEmployeeIdField, setShowEmployeeIdField] = useState(false)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)
  const [todayOrdersCount, setTodayOrdersCount] = useState(0)

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      // For admin ordering for employee
      if (isAdmin && orderContext === "employee") {
        if (!selectedEmployeeId.trim()) {
          setError("Please enter an employee ID")
          setLoading(false)
          return
        }
      }

      const effectiveEmployeeId = isAdmin && orderContext === "employee" ? selectedEmployeeId : employee?.employeeId

      if (!effectiveEmployeeId) {
        setError("Employee ID not available")
        setLoading(false)
        return
      }

      const response = await orderApi.getEmployeeOrders(effectiveEmployeeId)
      console.log("Full API Response:", response)

      let filteredOrders = response.data || []

      // Filter by date
      filteredOrders = filteredOrders.filter(
        (order) => new Date(order.expectedDeliveryDate).toISOString().split("T")[0] === selectedDate,
      )

      // Filter by tab
      if (activeTab === "current") {
        filteredOrders = filteredOrders.filter((order) => ["PENDING", "PREPARING", "READY"].includes(order.status))
      } else {
        filteredOrders = filteredOrders.filter((order) => ["DELIVERED", "CANCELLED"].includes(order.status))
      }

      // Filter by status
      if (statusFilter !== "all") {
        filteredOrders = filteredOrders.filter((order) => order.status?.toLowerCase() === statusFilter?.toLowerCase())
      }

      // Filter by search query
      if (searchQuery.trim()) {
        filteredOrders = filteredOrders.filter(
          (order) =>
            order.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id?.toString().includes(searchQuery),
        )
      }

      setOrders(filteredOrders)

      // Calculate today's total orders count for admin
      if (isAdmin) {
        const today = new Date().toISOString().split("T")[0]
        const todayOrders = response.data?.filter(
          (order) => new Date(order.expectedDeliveryDate).toISOString().split("T")[0] === today,
        )
        setTodayOrdersCount(todayOrders?.length || 0)
      }
    } catch (err) {
      console.error("Error:", err)
      setError(err.response?.data?.message || err.message || "Failed to fetch orders")
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchOrders()
  }, [activeTab, orderContext, selectedEmployeeId, statusFilter, searchQuery, selectedDate])

  // Cancel an order
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return
    try {
      await api.delete(`/api/orders/${orderId}`)
      fetchOrders()
    } catch (err) {
      alert(`Failed to cancel order: ${err.response?.data?.message || err.message}`)
    }
  }

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      PENDING: { bg: "bg-yellow-200", text: "text-yellow-900", icon: Clock },
      PREPARING: { bg: "bg-blue-200", text: "text-blue-900", icon: ChefHat },
      READY: { bg: "bg-green-200", text: "text-green-900", icon: CheckCircle },
      DELIVERED: { bg: "bg-purple-200", text: "text-purple-900", icon: Package },
      CANCELLED: { bg: "bg-red-200", text: "text-red-900", icon: X },
    }

    const config = statusConfig[status] || statusConfig.PENDING
    const IconComponent = config.icon

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text} border-2 border-gray-400`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {status.toLowerCase()}
      </span>
    )
  }

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "breakfast":
        return "🌅"
      case "lunch":
        return "🍽️"
      case "thali":
        return "🍛"
      case "snacks":
        return "🍿"
      case "beverages":
        return "🥤"
      default:
        return "🍴"
    }
  }

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <Loader className="animate-spin h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading your orders...</h3>
          <p className="text-gray-700 font-medium">Please wait while we fetch your delicious orders</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Global error display */}
        {error && !error.includes("Please enter") && (
          <div className="bg-red-100 border-l-4 border-red-600 rounded-lg p-4 mb-6 shadow-lg">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <span className="text-red-800 font-bold text-lg">{error}</span>
                {error.includes("not found") && (
                  <p className="text-sm text-red-700 mt-1 font-medium">Please verify the employee ID is correct</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header with Admin Controls on the side */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {/* Left side - Title */}
            <div className="flex items-center">
              <div className="bg-blue-500 p-4 rounded-lg mr-4 shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{isAdmin ? "Orders Management" : "My Orders"}</h1>
                <p className="text-gray-700 text-lg font-medium">Track and manage your food orders</p>
                {isAdmin && <p className="text-gray-700 text-sm font-medium">Today's Orders: {todayOrdersCount}</p>}
              </div>
            </div>

            {/* Right side - Admin Controls */}
            {isAdmin && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                <div className="flex items-center space-x-4 mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={orderContext === "self"}
                      onChange={() => {
                        setOrderContext("self")
                        setShowEmployeeIdField(false)
                        setError(null)
                      }}
                      className="mr-2 w-4 h-4 text-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      👤 View my orders
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={orderContext === "employee"}
                      onChange={() => {
                        setOrderContext("employee")
                        setShowEmployeeIdField(true)
                        setError(null)
                      }}
                      className="mr-2 w-4 h-4 text-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                      👥 View employee orders
                    </span>
                  </label>
                </div>

                {showEmployeeIdField && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={selectedEmployeeId}
                      onChange={(e) => {
                        setSelectedEmployeeId(e.target.value)
                        if (error) setError(null)
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      placeholder="Enter employee ID"
                    />
                    {error?.includes("Please enter") && (
                      <p className="mt-1 text-xs text-red-600 font-medium">Please enter a valid employee ID</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 font-medium"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-900 font-medium"
              >
                <option value="all">All Status</option>
                {activeTab === "current" ? (
                  <>
                    <option value="pending">⏳ Pending</option>
                    <option value="preparing">👨‍🍳 Preparing</option>
                    <option value="ready">✅ Ready</option>
                  </>
                ) : (
                  <>
                    <option value="delivered">📦 Delivered</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </>
                )}
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-900 font-medium ${
                  activeTab === "current" ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={activeTab === "current"}
              />
            </div>

            <div className="flex items-center text-sm text-gray-800 font-bold">
              <Calendar className="w-4 h-4 mr-2" />
              Showing {orders.length} orders
            </div>
          </div>
        </div>

        {/* Order Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-2">
            <div className="flex">
              <button
                className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                  activeTab === "current"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "text-gray-700 hover:text-blue-500 hover:bg-blue-50"
                }`}
                onClick={() => setActiveTab("current")}
              >
                <div className="flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Current Orders
                </div>
              </button>
              <button
                className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                  activeTab === "history"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "text-gray-700 hover:text-blue-500 hover:bg-blue-50"
                }`}
                onClick={() => setActiveTab("history")}
              >
                <div className="flex items-center justify-center">
                  <Package className="w-4 h-4 mr-2" />
                  Order History
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        {activeTab === "current" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Order Header */}
                <div className="bg-gray-800 p-4 border-b-2 border-gray-400">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">Order #{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center text-sm text-gray-300 font-medium">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">{getCategoryIcon(order.category)}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{order.itemName}</h3>
                      <p className="text-sm text-gray-700 font-medium">Quantity: {order.quantity}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-700 font-medium">
                      Unit Price: ₹{order.priceAtOrder?.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-lg font-bold text-blue-500">₹{order.totalPrice?.toFixed(2) || "0.00"}</div>
                  </div>

                  {order.remarks && (
                    <div className="bg-gray-100 rounded-lg p-3 mb-4 border-2 border-gray-300">
                      <p className="text-xs text-gray-700 font-medium">
                        <strong>Note:</strong> {order.remarks}
                      </p>
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedOrderDetails(order)
                        setShowOrderDetails(true)
                      }}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 px-3 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors flex items-center justify-center border-2 border-gray-400"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </button>
                    {order.status === "PENDING" && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="bg-red-200 text-red-800 py-2 px-3 rounded-lg text-sm font-bold hover:bg-red-300 transition-colors flex items-center justify-center border-2 border-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Order ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Item Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getCategoryIcon(order.category)}</span>
                          <div className="text-sm text-gray-900">{order.itemName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-blue-600">₹{order.totalPrice?.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedOrderDetails(order)
                            setShowOrderDetails(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center border-2 border-gray-200">
            <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-700 mb-6 font-medium">
              {activeTab === "current" ? "You don't have any current orders." : "No order history available yet."}
              {isAdmin && orderContext === "employee" && selectedEmployeeId && ` for employee ${selectedEmployeeId}`}
            </p>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrderDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl shadow-2xl border-2 border-gray-300">
              <div className="bg-blue-500 text-white p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <button
                    onClick={() => {
                      setShowOrderDetails(false)
                      setSelectedOrderDetails(null)
                    }}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Order #{selectedOrderDetails.id}</h3>
                  <p className="text-gray-700">
                    Item: {selectedOrderDetails.itemName} (Quantity: {selectedOrderDetails.quantity})
                  </p>
                  <p className="text-gray-700">
                    Delivery Date: {new Date(selectedOrderDetails.expectedDeliveryDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">Total Price: ₹{selectedOrderDetails.totalPrice?.toFixed(2)}</p>
                  <p className="text-gray-700">Status: {selectedOrderDetails.status}</p>
                </div>
                {selectedOrderDetails.remarks && (
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-gray-900">Remarks:</h4>
                    <p className="text-gray-700">{selectedOrderDetails.remarks}</p>
                  </div>
                )}
                <div className="text-right">
                  <button
                    onClick={() => {
                      setShowOrderDetails(false)
                      setSelectedOrderDetails(null)
                    }}
                    className="px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-800 font-bold hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}