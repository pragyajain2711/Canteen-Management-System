"use client"

import { useState } from "react"
import {
  Search,
  X,
  Loader,
  Calendar,
  ClipboardList,
  User,
  Utensils,
  IndianRupee,
  ChevronDown,
  Package,
  Building2,
  Clock,
  CheckCircle,
  ArrowUpDown,
  Download,
  RefreshCw,
  Eye,
} from "lucide-react"
import { orderApi } from "../api"
import { useQuery } from "@tanstack/react-query"

const statusConfig = {
  DELIVERED: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    label: "Delivered",
    priority: 1,
  },
  CANCELLED: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: X,
    label: "Cancelled",
    priority: 2,
  },
}

const categoryConfig = {
  breakfast: { color: "bg-orange-100 text-orange-800", icon: "🌅" },
  lunch: { color: "bg-green-100 text-green-800", icon: "🍽️" },
  snacks: { color: "bg-purple-100 text-purple-800", icon: "🍿" },
  beverages: { color: "bg-blue-100 text-blue-800", icon: "☕" },
}

export default function AdminOrderHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [priceHistory, setPriceHistory] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: "orderTime", direction: "desc" })

  // Fetch historical orders - keeping your existing API call
  const {
    data: rawOrders,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["historicalOrders", dateRange, departmentFilter, categoryFilter],
    queryFn: async () => {
      const response = await orderApi.getOrderHistory(
        dateRange.start,
        dateRange.end,
        departmentFilter === "all" ? undefined : departmentFilter,
        categoryFilter === "all" ? undefined : categoryFilter,
      )
      console.log("Order history response:", response)
      return response.data
    },
  })

  // Fetch detailed order data - keeping your existing API call
  const { data: orderDetails } = useQuery({
    queryKey: ["orderHistoryDetails", selectedOrder?.id],
    queryFn: () => (selectedOrder ? orderApi.getOrderDetails(selectedOrder.id) : null),
    enabled: !!selectedOrder,
  })

  // Fetch price history - keeping your existing API call
  const fetchPriceHistory = async (orderId) => {
    try {
      const { data } = await orderApi.getOrderPriceHistory(orderId)
      // Transform the data if needed
      const transformedData = data.map((item) => ({
        ...item,
        price: item.price || item.currentPrice, // fallback to currentPrice if price not available
        startDate: item.startDate || item.createdAt, // fallback to createdAt if startDate not available
        isActive: item.isActive || item.wasActive, // handle different field names
      }))
      setPriceHistory(transformedData)
    } catch (err) {
      console.error("Failed to fetch price history:", err)
      setPriceHistory([]) // Set empty array on error
    }
  }

  const normalizedOrders =
    rawOrders?.map((order) => ({
      ...order,
      employeeId: String(order.employee?.id || order.employee?.employeeId || ""),
      employeeName: String(order.employee?.name || order.employee?.fullName || ""),
      employeeDepartment: String(order.employee?.department || ""),
      employeeEmail: String(order.employee?.email || ""),
      menuItemName: String(order.menuItem?.name || ""),
      menuItemCategory: String(order.menuItem?.category || ""),
      menuItemId: String(order.menuItem?.menuId || order.menuItem?.id || ""),
      currentPrice: order.menuItem?.currentPrice || order.priceAtOrder,
      completedTime: order.completedTime || order.updatedAt || order.orderTime,
    })) || []

  const filteredOrders = normalizedOrders.filter((order) => {
    const searchLower = searchTerm.toLowerCase().trim()
    const matchesSearch =
      !searchTerm ||
     order.employee?.employeeId?.toLowerCase().includes(searchLower) ||
      order.employeeName.toLowerCase().includes(searchLower) ||
      order.menuItemName.toLowerCase().includes(searchLower) ||
      order.id.toString().includes(searchLower)

    const matchesStatus = statusFilter === "all" || order.status === statusFilter.toUpperCase()
    const matchesDepartment = departmentFilter === "all" || order.employeeDepartment === departmentFilter
    const matchesCategory = categoryFilter === "all" || order.menuItemCategory === categoryFilter

    return matchesSearch && matchesStatus && matchesDepartment && matchesCategory
  })

  // Sorting
  const sortedOrders = [...filteredOrders].sort((a, b) => {
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

  const exportToCSV = () => {
    const csvData = filteredOrders.map((order) => ({
      "Order ID": order.id,
      "Employee Name": order.employeeName,
      "Employee ID": order.employeeId,
      Department: order.employeeDepartment,
      "Menu Item": order.menuItemName,
      Category: order.menuItemCategory,
      Quantity: order.quantity,
      "Total Price": order.totalPrice,
      Status: order.status,
      "Order Time": new Date(order.orderTime).toLocaleString(),
      "Completed Time": new Date(order.completedTime).toLocaleString(),
      Remarks: order.remarks || "",
    }))

    const csvContent = [Object.keys(csvData[0]).join(","), ...csvData.map((row) => Object.values(row).join(","))].join(
      "\n",
    )

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `order-history-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatFullDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCategoryStyle = (category) => {
    switch (category) {
      case "breakfast":
        return "bg-orange-100 text-orange-800"
      case "lunch":
        return "bg-green-100 text-green-800"
      case "snacks":
        return "bg-purple-100 text-purple-800"
      case "beverages":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalAmount = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
  const statusCounts = filteredOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {})

  // Check if user is actively searching
  const isSearching = searchTerm.trim().length > 0

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader className="animate-spin w-6 h-6" />
          <span>Loading order history...</span>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <X className="w-5 h-5" />
            <span className="font-medium">Error loading order history</span>
          </div>
          <p className="text-red-600 mt-1">{error.message}</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="text-purple-600" size={32} />
              Order History
            </h1>
            <p className="text-gray-600 mt-1">View completed and cancelled orders</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              disabled={filteredOrders.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards - Only show when not searching */}
        {!isSearching && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
                </div>
                <Package className="text-purple-600" size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">₹{totalAmount.toFixed(2)}</p>
                </div>
                <IndianRupee className="text-green-600" size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.DELIVERED || 0}</p>
                </div>
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.CANCELLED || 0}</p>
                </div>
                <X className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by employee name, employeeId, or order..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="IS">IS</option>
              <option value="LPG">LPG</option>
            </select>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="snacks">Snacks</option>
              <option value="beverages">Beverages</option>
            </select>

            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              placeholder="From Date"
            />

            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              placeholder="To Date"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort("id")} className="flex items-center gap-1 hover:text-gray-700">
                    Order ID
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("priority")}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Status
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Menu Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("totalPrice")}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Amount
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("orderTime")}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Order Time
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("deliveredtime")}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Delivered Date
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedOrders.map((order) => {
                const statusConfig_ = statusConfig[order.status]
                const categoryConfig_ = categoryConfig[order.menuItemCategory]
                const StatusIcon = statusConfig_?.icon || CheckCircle

                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="text-gray-400 mr-2" size={16} />
                        <span className="text-sm font-medium text-gray-900">#{order.id}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className="mr-2" size={16} />
                        <span
                          className={`text-xs font-medium px-2.5 py-1.5 rounded-full border ${statusConfig_?.color || "bg-gray-100 text-gray-800"}`}
                        >
                          {statusConfig_?.label}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="text-gray-400 mr-2" size={16} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.employeeName}</div>
                          <div className="text-sm text-gray-500">{order.employee?.employeeId || "N/A"}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="text-gray-400 mr-2" size={16} />
                        <span className="text-sm text-gray-900">{order.employeeDepartment}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{categoryConfig_?.icon || "🍽️"}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.menuItemName}</div>
                          <div className="text-sm text-gray-500">{order.menuItemId}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig_?.color || "bg-gray-100 text-gray-800"}`}
                      >
                        {order.menuItemCategory}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                        {order.quantity}x
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <IndianRupee className="text-green-600 mr-1" size={16} />
                        <span className="text-sm font-medium text-gray-900">₹{order.totalPrice?.toFixed(2)}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="text-gray-400 mr-2" size={16} />
                        <div>
                          <div className="text-sm text-gray-900">{new Date(order.orderTime).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{new Date(order.orderTime).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="text-gray-400 mr-2" size={16} />
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(order.completedTime).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.completedTime).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No order history found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isSearching
                ? "No orders match your search criteria."
                : "Completed orders will appear here once they are delivered or cancelled."}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal - keeping your existing modal structure */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Order Details (#{selectedOrder.id}) - {statusConfig[selectedOrder.status]?.label}
              </h2>
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
              {/* Order Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 flex items-center">
                  <ClipboardList className="mr-2" size={18} /> Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusConfig[selectedOrder.status]?.color}`}>
                      {statusConfig[selectedOrder.status]?.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p>{new Date(selectedOrder.orderTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivered Date</p>
                    <p>{new Date(selectedOrder.DeliveredDate).toLocaleString()}</p>
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

              {/* Employee Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 flex items-center">
                  <User className="mr-2" size={18} /> Employee Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-sm text-gray-500">Employee ID</p>
                    <p className="font-medium">{selectedOrder.employee?.employeeId || "N/A"}</p>

                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p>{selectedOrder.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p>{selectedOrder.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p>{selectedOrder.employeeDepartment || orderDetails?.employee?.department || "N/A"}</p>
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

              {/* Price History */}
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
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="font-semibold p-3 text-left">Price</th>
                            <th className="text-left p-3 font-medium text-gray-700">Category</th>
                            <th className="font-semibold p-3 text-left">Valid From</th>
                            <th className="font-semibold p-3 text-left">Valid Until</th>
                            <th className="font-semibold p-3 text-left">Status</th>
                            <th className="font-semibold p-3 text-left">Created By</th>
                            <th className="font-semibold p-3 text-left">Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {priceHistory.length > 0 ? (
                            priceHistory.map((history, index) => (
                              <tr key={`${history.price}-${history.startDate}`} className="hover:bg-gray-50 border-b">
                                <td className="p-3">
                                  <span className="font-semibold text-green-700">₹{history.price?.toFixed(2)}</span>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`badge ${getCategoryStyle(history.category)} px-2 py-1 rounded-full text-xs`}
                                  >
                                    {history.category}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2 cursor-help">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    {formatDateTime(history.startDate)}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2 cursor-help">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    {history.endDate ? formatDateTime(history.endDate) : "Present"}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                      history.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    <div
                                      className={`w-2 h-2 rounded-full ${history.isActive ? "bg-green-500" : "bg-red-500"}`}
                                    />
                                    {history.isActive ? "Active" : "Expired"}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    <span className="text-blue-700 font-medium">{history.createdBy || "System"}</span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="text-sm text-gray-600 cursor-help">
                                    {formatDateTime(history.createdAt)}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="p-4 text-center text-gray-500">
                                No price history available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
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