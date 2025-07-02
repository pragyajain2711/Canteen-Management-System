
import { useState, useEffect } from "react"
import { employeeMenuApi, menuApi } from "./api"
import api from "./api"
import { useAuth } from "./AuthContext"
import {
  CheckCircle,
  Loader,
  Plus,
  X,
  ShoppingCart,
  Search,
  Filter,
  Calendar,
  Minus,
  Trash2,
  Package,
  ChefHat,
  Coffee,
  Utensils,
  Cookie,
  Wine,
  AlertCircle,
} from "lucide-react"

export default function EmployeeMenu() {
  const { employee, isAdmin } = useAuth()
  
  // State variables
  const [menuItems, setMenuItems] = useState([])
  const [filteredItems, setFilteredItems] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDay, setSelectedDay] = useState("WEDNESDAY")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchMode, setSearchMode] = useState(false)
  const [filters, setFilters] = useState({
    category: "all",
    status: "active",
  })

  // Order dialog state
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [orderRemarks, setOrderRemarks] = useState("")
  const [orderingItem, setOrderingItem] = useState(null)

  // Cart state
  const [cartItems, setCartItems] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)

  // Success notification
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)
  const [orderSuccessData, setOrderSuccessData] = useState(null)

  // Admin ordering context
  const [orderContext, setOrderContext] = useState("self")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")

  const ALL_DAYS = [
    { key: "MONDAY", label: "Mon", fullName: "Monday" },
    { key: "TUESDAY", label: "Tue", fullName: "Tuesday" },
    { key: "WEDNESDAY", label: "Wed", fullName: "Wednesday" },
    { key: "THURSDAY", label: "Thu", fullName: "Thursday" },
    { key: "FRIDAY", label: "Fri", fullName: "Friday" },
    { key: "SATURDAY", label: "Sat", fullName: "Saturday" },
    { key: "SUNDAY", label: "Sun", fullName: "Sunday" },
  ]

  const getCurrentDay = () => {
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
    return days[new Date().getDay()]
  }

  const isCurrentDay = (day) => day === getCurrentDay()

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "breakfast": return <Coffee className="w-6 h-6 text-orange-600" />
      case "lunch": return <Utensils className="w-6 h-6 text-green-600" />
      case "thali": return <ChefHat className="w-6 h-6 text-purple-600" />
      case "snacks": return <Cookie className="w-6 h-6 text-yellow-600" />
      case "beverages": return <Wine className="w-6 h-6 text-blue-600" />
      default: return <Package className="w-6 h-6 text-gray-600" />
    }
  }

  const loadMenuItems = async () => {
    try {
      setLoading(true)
      setError(null)
      setSearchMode(false)

      const response = await employeeMenuApi.getWeeklyMenu(selectedDay, filters.category)
      const items = response.data?.map(item => item.menuItem) || []
      setMenuItems(items)
      
      // Group by category
      const grouped = items.reduce((groups, item) => {
        const category = item.category || 'Other'
        if (!groups[category]) groups[category] = []
        groups[category].push(item)
        return groups
      }, {})
      
      setFilteredItems(grouped)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load menu items")
      console.error("API Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadMenuItems()
      return
    }

    try {
      setLoading(true)
      setSearchMode(true)
      
      const response = await menuApi.getActiveItems()
      
      // Get unique items by name
      const uniqueItems = response.data.reduce((acc, item) => {
        if (!acc.some(i => i.name === item.name)) acc.push(item)
        return acc
      }, [])

      // Filter by search and active status
      const filtered = uniqueItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      ).filter(item => item.isActive)

      // Group by category
      const grouped = filtered.reduce((groups, item) => {
        const category = item.category || 'Other'
        if (!groups[category]) groups[category] = []
        groups[category].push(item)
        return groups
      }, {})

      setFilteredItems(grouped)
    } catch (err) {
      setError(err.response?.data?.message || "Search failed")
      console.error("Search Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadCartItems = async () => {
    try {
      setCartLoading(true)
      const employeeId = isAdmin && orderContext === "employee" 
        ? selectedEmployeeId 
        : employee?.employeeId

      if (!employeeId) {
        setCartItems([])
        return
      }

      const response = await api.get(`/api/orders/pending/${employeeId}`)
      setCartItems(response.data?.map(item => ({
        ...item,
        itemName: item.itemName || item.name || "Unknown Item",
        priceAtOrder: Number(item.priceAtOrder || item.price || 0),
        quantity: Number(item.quantity || 1),
        totalPrice: Number(item.priceAtOrder || item.price || 0) * Number(item.quantity || 1),
        status: item.status || "PENDING",
        category: item.category || "general",
      })) || [])
    } catch (err) {
      console.error("Failed to load cart items:", err)
      setCartItems([])
    } finally {
      setCartLoading(false)
    }
  }

  const handleConfirmOrder = async () => {
    if (!selectedItem) return

    try {
      setOrderingItem(selectedItem.id)
      const employeeId = isAdmin && orderContext === "employee" 
        ? selectedEmployeeId 
        : employee?.employeeId

      if (!employeeId) throw new Error("Employee ID not available")

      const response = await api.post("/api/orders", {
        employeeId,
        menuId: selectedItem.menuId,
        quantity: orderQuantity,
        expectedDeliveryDate: new Date().toISOString().split("T")[0],
        remarks: orderRemarks
      })

      setOrderSuccessData({
        itemName: selectedItem.name,
        orderId: response.data.id,
        quantity: orderQuantity,
        price: selectedItem.price,
        totalPrice: selectedItem.price * orderQuantity,
        forEmployee: isAdmin && orderContext === "employee" ? selectedEmployeeId : null,
      })

      setShowOrderSuccess(true)
      setShowOrderDialog(false)
      loadCartItems()
    } catch (err) {
      alert(`Failed to place order: ${err.response?.data?.message || err.message}`)
    } finally {
      setOrderingItem(null)
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return
    try {
      await api.delete(`/api/orders/${orderId}`)
      loadCartItems()
    } catch (err) {
      alert(`Failed to cancel order: ${err.response?.data?.message || err.message}`)
    }
  }

  useEffect(() => {
    loadMenuItems()
    loadCartItems()
  }, [selectedDay, filters.category])

  useEffect(() => {
    if (searchQuery.trim() === "" && searchMode) {
      setSearchMode(false)
      loadMenuItems()
    }
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-blue-500 p-4 rounded-xl mr-4 shadow-lg">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Menu</h1>
                <p className="text-gray-600 text-lg">Delicious meals, delivered fresh</p>
              </div>
            </div>
            
            {/* Admin Controls */}
            {isAdmin && (
              <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={orderContext === "self"}
                      onChange={() => setOrderContext("self")}
                      className="mr-2 w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-700 font-medium text-sm">Order to me</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={orderContext === "employee"}
                      onChange={() => {
                        setOrderContext("employee")
                        setSelectedEmployeeId("")
                      }}
                      className="mr-2 w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-700 font-medium text-sm">Order for others</span>
                  </label>
                </div>
                {orderContext === "employee" && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="Enter employee ID"
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 ? (
                <>
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                </>
              ) : (
                "View Cart"
              )}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setSearchMode(false)
                    loadMenuItems()
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
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
              <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
              >
                <option value="active">Available Only</option>
                <option value="all">All Items</option>
              </select>
            </div>
          </div>
        </div>

        {/* Day Navigation */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-2">
            <div className="flex">
              {ALL_DAYS.map((day) => (
                <button
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedDay === day.key
                      ? "bg-blue-500 text-white shadow-lg"
                      : "text-gray-700 hover:text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {day.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Day Notice */}
        {!isCurrentDay(selectedDay) && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>View Only Mode:</strong> You can only place orders for today ({getCurrentDay()}).
                  You're currently viewing the menu for {selectedDay}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
              <span className="text-gray-700 text-lg">Loading delicious options...</span>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchMode && !loading && (
          <div className="bg-white rounded-xl shadow-lg mt-4 max-h-[70vh] overflow-y-auto">
            {/* Search Header */}
            <div className="sticky top-0 bg-white p-4 border-b z-10 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center">
                <Search className="mr-2 w-5 h-5" />
                Search Results for "{searchQuery}"
              </h3>
              <button 
                onClick={() => {
                  setSearchMode(false)
                  setSearchQuery("")
                  loadMenuItems()
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Results Content */}
            {Object.keys(filteredItems).length > 0 ? (
              Object.entries(filteredItems).map(([category, items]) => (
                <div key={category} className="p-4 border-b last:border-b-0">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                      {getCategoryIcon(category)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 capitalize">{category}</h3>
                    <span className="ml-auto bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(item => (
                      <div 
                        key={item.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg mr-4">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                              {item.description || "No description available"}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="font-bold text-blue-600">₹{item.price}</span>
                              <button
                                onClick={() => {
                                  setSelectedItem(item)
                                  setOrderQuantity(1)
                                  setOrderRemarks("")
                                  setShowOrderDialog(true)
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h4 className="text-lg font-medium text-gray-900">No items found</h4>
                <p className="text-gray-500">Try a different search term</p>
              </div>
            )}
          </div>
        )}

        {/* Weekly Menu Display (when not in search mode) */}
        {!searchMode && !loading && !error && Object.keys(filteredItems).length > 0 && (
          <div className="space-y-8">
            {Object.entries(filteredItems).map(([category, items]) => (
              <div key={category} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    {getCategoryIcon(category)}
                    <h3 className="ml-3 text-2xl font-bold text-gray-900 capitalize">{category}</h3>
                    <span className="ml-auto bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                      {items.length} items
                    </span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {items.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {getCategoryIcon(item.category)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {item.description || "No description available"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {item.quantity} {item.unit}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-blue-600">₹{item.price}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {item.isActive ? "Available" : "Unavailable"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => {
                                  setSelectedItem(item)
                                  setOrderQuantity(1)
                                  setOrderRemarks("")
                                  setShowOrderDialog(true)
                                }}
                                disabled={!item.isActive || !isCurrentDay(selectedDay)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                  item.isActive && isCurrentDay(selectedDay)
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                {!isCurrentDay(selectedDay)
                                  ? "View Only"
                                  : item.isActive
                                    ? "Add to Cart"
                                    : "Unavailable"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && Object.keys(filteredItems).length === 0 && !searchMode && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <ChefHat className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No items available</h3>
            <p className="text-gray-500">No menu items found for {selectedDay}</p>
          </div>
        )}

        {/* Order Dialog */}
        {showOrderDialog && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add to Cart</h3>
                <button
                  onClick={() => setShowOrderDialog(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg flex items-center justify-center mr-4">
                    {getCategoryIcon(selectedItem.category)}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedItem.name}</h4>
                    <p className="text-blue-500 font-bold text-xl">₹{selectedItem.price}</p>
                  </div>
                </div>
                {selectedItem.description && <p className="text-gray-600 text-sm">{selectedItem.description}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-bold text-gray-900 w-12 text-center">{orderQuantity}</span>
                  <button
                    onClick={() => setOrderQuantity(orderQuantity + 1)}
                    className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center hover:bg-teal-200 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-teal-600" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
                <textarea
                  value={orderRemarks}
                  onChange={(e) => setOrderRemarks(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  rows={3}
                  placeholder="Any special requests..."
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-gray-700">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{(selectedItem.price * orderQuantity).toFixed(2)}
                  </span>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowOrderDialog(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmOrder}
                    disabled={orderingItem === selectedItem.id}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {orderingItem === selectedItem.id ? (
                      <>
                        <Loader className="animate-spin w-4 h-4 mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)} />
            <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <ShoppingCart className="w-6 h-6 mr-2 text-blue-500" />
                      Your Cart
                    </h3>
                    {cartItems.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {cartItems.reduce((sum, item) => sum + item.quantity, 0)} item
                        {cartItems.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 's' : ''} • ₹
                        {cartItems.reduce((sum, item) => sum + (item.priceAtOrder * item.quantity), 0).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {cartLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="animate-spin h-8 w-8 text-blue-500" />
                      <span className="ml-2 text-gray-600">Loading cart...</span>
                    </div>
                  ) : cartItems.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h4>
                      <p className="text-gray-500">Add some delicious items to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map(item => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <div className="mr-4">
                              {getCategoryIcon(item.category)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="font-medium text-gray-900">{item.itemName}</h4>
                                <span className="font-bold text-blue-600">₹{(item.priceAtOrder * item.quantity).toFixed(2)}</span>
                              </div>
                              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              {item.remarks && (
                                <p className="text-xs text-gray-500 mt-1">Note: {item.remarks}</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end">
                            {item.status === "PENDING" && (
                              <button
                                onClick={() => handleCancelOrder(item.id)}
                                className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="border-t border-gray-200 p-6 bg-white">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-700">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{cartItems.reduce((sum, item) => sum + (item.priceAtOrder * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                    <button
                      className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-all"
                      onClick={() => {
                        setShowCart(false)
                        alert('Order placed successfully!')
                      }}
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Order Success Modal */}
        {showOrderSuccess && orderSuccessData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Added!</h3>
              <div className="text-gray-600 mb-4">
                <p className="mb-2">
                  {orderSuccessData.quantity}x {orderSuccessData.itemName}
                </p>
                <p className="text-lg font-semibold text-blue-600">Total: ₹{orderSuccessData.totalPrice?.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-2">Order ID: #{orderSuccessData.orderId}</p>
                {isAdmin && orderSuccessData.forEmployee && (
                  <p className="text-sm text-gray-500 mt-1">Ordered for: {orderSuccessData.forEmployee}</p>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowOrderSuccess(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Continue Ordering
                </button>
                <button
                  onClick={() => {
                    setShowOrderSuccess(false)
                    setShowCart(true)
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all"
                >
                  View Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}