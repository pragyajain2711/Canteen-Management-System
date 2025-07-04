import { useState, useEffect } from "react"
import { employeeMenuApi } from "./api"
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
  // State for menu data and filtering
  const [menuItems, setMenuItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDay, setSelectedDay] = useState("WEDNESDAY") // Current day
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    category: "all",
    status: "active",
  })

  // State for order dialog
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [orderRemarks, setOrderRemarks] = useState("")
  const [orderingItem, setOrderingItem] = useState(null)

  // State for cart
  const [cartItems, setCartItems] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)

  // State for success notifications
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)
  const [orderSuccessData, setOrderSuccessData] = useState(null)

  // Admin ordering context
  const { employee, isAdmin, admin } = useAuth()
  const [orderContext, setOrderContext] = useState("self")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")

  // New state for managing cart items before they become orders
  const [pendingCartItems, setPendingCartItems] = useState([])

  // Get current day
  const getCurrentDay = () => {
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
    const today = new Date().getDay()
    return days[today]
  }

  // Load menu items
  const loadMenuItems = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await employeeMenuApi.getWeeklyMenu(selectedDay, filters.category)
      const items = response.data.map((item) => item.menuItem)
      setMenuItems(items)
      setFilteredItems(items)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load menu items")
      console.error("API Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadCartItems = async () => {
    try {
      setCartLoading(true)
      const employeeId =
        isAdmin && orderContext === "employee"
          ? selectedEmployeeId
          : employee?.employeeId || (isAdmin ? admin?.employeeId : null)

      if (!employeeId) {
        setCartItems([])
        return
      }

      console.log("Loading cart for employee:", employeeId)
      const response = await api.get(`/api/orders/pending/${employeeId}`)
      console.log("Cart response:", response.data)

      // Enhanced data structure with proper cart item format
      const items = Array.isArray(response.data)
        ? response.data.map((item) => ({
            ...item,
            itemName: item.itemName || item.name || "Unknown Item",
            priceAtOrder: Number.parseFloat(item.priceAtOrder || item.price || 0),
            quantity: Number.parseInt(item.quantity || 1),
            totalPrice: Number.parseFloat(item.priceAtOrder || item.price || 0) * Number.parseInt(item.quantity || 1),
            status: item.status || "PENDING",
            category: item.category || "general",
          }))
        : []

      setCartItems(items)
    } catch (err) {
      console.error("Failed to load cart items:", err)
      setCartItems([])
    } finally {
      setCartLoading(false)
    }
  }

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadMenuItems()
      return
    }

    try {
      setLoading(true)
      const response = await employeeMenuApi.searchItems(searchQuery)
      const items = response.data.filter((item) => filters.status === "all" || item.isActive)
      setMenuItems(items)
      setFilteredItems(items)
    } catch (err) {
      setError(err.response?.data?.message || "Search failed")
      console.error("Search Error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Filter items based on search and filters
  useEffect(() => {
    let filtered = menuItems

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((item) => (filters.status === "active" ? item.isActive : !item.isActive))
    }

    setFilteredItems(filtered)
  }, [menuItems, searchQuery, filters.status])

  // Load menu items when day or category changes
  useEffect(() => {
    loadMenuItems()
  }, [selectedDay, filters.category])

  // Load cart items on mount and when context changes
  useEffect(() => {
    loadCartItems()
  }, [orderContext, selectedEmployeeId])

  // Handle opening order dialog
  const handleOpenOrderDialog = (item) => {
    if (!item.isActive) return
    setSelectedItem(item)
    setOrderQuantity(1)
    setOrderRemarks("")
    setShowOrderDialog(true)
  }

  // Replace the handleConfirmOrder function with handleAddToCart that adds items to the pending cart instead of immediately placing orders:
  const handleAddToCart = async () => {
    if (!selectedItem) return

    try {
      setOrderingItem(selectedItem.id)

      const employeeId =
        isAdmin && orderContext === "employee"
          ? selectedEmployeeId
          : employee?.employeeId || (isAdmin ? admin?.employeeId : null)

      if (!employeeId) {
        throw new Error("Employee ID not available")
      }

      // Create cart item instead of placing order immediately
      const cartItem = {
        id: Date.now(), // Temporary ID for cart item
        menuId: selectedItem.menuId,
        itemName: selectedItem.name,
        category: selectedItem.category,
        priceAtOrder: selectedItem.price,
        quantity: orderQuantity,
        totalPrice: selectedItem.price * orderQuantity,
        remarks:` ${orderRemarks} ${isAdmin ? `Ordered by admin for ${orderContext === "employee" ? "employee " + selectedEmployeeId : "self"}` : ""}`,
        employeeId,
        status: "CART", // Special status for cart items
        expectedDeliveryDate: new Date().toISOString().split("T")[0],
      }

      setPendingCartItems((prev) => [...prev, cartItem])

      setOrderSuccessData({
        itemName: selectedItem.name,
        orderId: `CART-${Date.now()}`,
        quantity: orderQuantity,
        price: selectedItem.price,
        totalPrice: selectedItem.price * orderQuantity,
        forEmployee: isAdmin && orderContext === "employee" ? selectedEmployeeId : null,
      })

      setShowOrderSuccess(true)
      setShowOrderDialog(false)
    } catch (err) {
      alert(`Failed to add to cart: ${err.message}`)
    } finally {
      setOrderingItem(null)
    }
  }

  // Add a new function to place all cart items as orders:
  const handlePlaceAllOrders = async () => {
    if (pendingCartItems.length === 0) return

    try {
      setCartLoading(true)
      const orderPromises = pendingCartItems.map((item) =>
        api.post("/api/orders", {
          employeeId: item.employeeId,
          menuId: item.menuId,
          quantity: item.quantity,
          expectedDeliveryDate: item.expectedDeliveryDate,
          remarks: item.remarks,
        }),
      )

      await Promise.all(orderPromises)

      // Clear pending cart and refresh actual orders
      setPendingCartItems([])
      await loadCartItems()

      alert(`Successfully placed ${pendingCartItems.length} orders!`)
      setShowCart(false)
    } catch (err) {
      alert(`Failed to place orders: ${err.response?.data?.message || err.message}`)
    } finally {
      setCartLoading(false)
    }
  }

  // Add function to remove items from pending cart:
  const handleRemoveFromCart = (cartItemId) => {
    setPendingCartItems((prev) => prev.filter((item) => item.id !== cartItemId))
  }

  // Handle canceling order from cart
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return

    try {
      await api.delete(`/api/orders/${orderId}`)
      loadCartItems() // Refresh cart
    } catch (err) {
      alert(`Failed to cancel order: ${err.response?.data?.message || err.message}`)
    }
  }

  // Get icon for category
  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "breakfast":
        return <Coffee className="w-6 h-6 text-orange-600" />
      case "lunch":
        return <Utensils className="w-6 h-6 text-green-600" />
      case "thali":
        return <ChefHat className="w-6 h-6 text-purple-600" />
      case "snacks":
        return <Cookie className="w-6 h-6 text-yellow-600" />
      case "beverages":
        return <Wine className="w-6 h-6 text-blue-600" />
      default:
        return <Package className="w-6 h-6 text-gray-600" />
    }
  }

  // Get day name
  const getDayName = (day) => {
    const dayNames = {
      MONDAY: "Monday",
      TUESDAY: "Tuesday",
      WEDNESDAY: "Wednesday",
      THURSDAY: "Thursday",
      FRIDAY: "Friday",
      SATURDAY: "Saturday",
      SUNDAY: "Sunday",
    }
    return dayNames[day] || day
  }

  // Check if day is current day
  const isCurrentDay = (day) => {
    return day === getCurrentDay()
  }

  // Group items by category
  const groupedItems = filteredItems.reduce((groups, item) => {
    const category = item.category
    if (!groups[category]) groups[category] = []
    groups[category].push(item)
    return groups
  }, {})

  // Define category order
  const categoryOrder = ["breakfast", "lunch", "thali", "snacks", "beverages"]
  const sortedCategories = categoryOrder.filter((category) => groupedItems[category]?.length > 0)

  // All days of the week
  const ALL_DAYS = [
    { key: "MONDAY", label: "Mon", fullName: "Monday" },
    { key: "TUESDAY", label: "Tue", fullName: "Tuesday" },
    { key: "WEDNESDAY", label: "Wed", fullName: "Wednesday" },
    { key: "THURSDAY", label: "Thu", fullName: "Thursday" },
    { key: "FRIDAY", label: "Fri", fullName: "Friday" },
    { key: "SATURDAY", label: "Sat", fullName: "Saturday" },
    { key: "SUNDAY", label: "Sun", fullName: "Sunday" },
  ]

  // Enhanced Get cart total function
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.priceAtOrder || item.price || 0
      const itemQuantity = item.quantity || 1
      const itemTotal = itemPrice * itemQuantity
      return total + itemTotal
    }, 0)
  }

  // Update the cart notification text function to include pending items:
  const getCartNotificationText = () => {
    const totalCount = pendingCartItems.length + cartItems.length
    if (totalCount === 0) return "View Cart"
    if (totalCount === 1) return "1 item in cart"
    return `${totalCount} items in cart`
  }

  // Update the cart display logic to show both pending cart items and placed orders:
  const allCartItems = [...pendingCartItems, ...cartItems]

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
            <div className="flex items-center gap-4">
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

              <button
                onClick={() => setShowCart(true)}
                className="relative bg-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="w-5 h-5" />
                {getCartNotificationText()}
                {/* Update the cart badge count to show total items: */}
                {pendingCartItems.length + cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {pendingCartItems.length + cartItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search delicious food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
              >
                <option value="all">All Categories</option>
                <option value="breakfast">🌅 Breakfast</option>
                <option value="lunch">🍽️ Lunch</option>
                <option value="thali">🍛 Thali</option>
                <option value="snacks">🍿 Snacks</option>
                <option value="beverages">🥤 Beverages</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
              >
                <option value="active">✅ Available Only</option>
                <option value="all">📋 All Items</option>
                <option value="inactive">❌ Unavailable Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Weekday Navigation Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              {ALL_DAYS.map((day) => {
                const isCurrent = isCurrentDay(day.key)
                const isSelected = selectedDay === day.key
                const canOrder = isCurrent

                return (
                 <button
  key={day.key}
  onClick={() => setSelectedDay(day.key)}
  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
    isSelected && canOrder
      ? "bg-blue-500 text-white shadow-lg transform scale-105"
      : canOrder
        ? "text-blue-600 hover:bg-blue-50 border border-blue-200"
        : "text-gray-500 bg-gray-200 cursor-not-allowed"
  }`}
  title={canOrder ? `Order for ${day.fullName}` : `Cannot order for ${day.fullName}`}
>
  <div className="flex flex-col items-center">
    <span>{day.label}</span>
    <span className="text-xs mt-1">{day.fullName}</span>
    {isCurrent && <div className="w-2 h-2 bg-blue-400 rounded-full mt-1"></div>}
  </div>
</button>
                )
              })}
            </div>
          </div>
        </div>

        {!isCurrentDay(selectedDay) && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>View Only Mode:</strong> You can only place orders for today ({getDayName(getCurrentDay())}).
                  You're currently viewing the menu for {getDayName(selectedDay)}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
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

        {/* Menu Grid */}
        {!loading && !error && (
          <div>
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <ChefHat className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-500">
                  {`searchQuery
                    ? No items match "${searchQuery}"
                    : No menu items available for ${getDayName(selectedDay)}`}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {sortedCategories.map((category) => (
                  <div key={category} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Category Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getCategoryIcon(category)}
                          <h3 className="ml-3 text-2xl font-bold text-gray-900 capitalize">{category}</h3>
                          <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            {groupedItems[category].length} items
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category Items Table */}
                    <div className="p-6">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Item
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Description
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
                                Price
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Status
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {groupedItems[category].map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
                                        {getCategoryIcon(item.category)}
                                      </div>
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
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {item.isActive ? "Available" : "Unavailable"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() => handleOpenOrderDialog(item)}
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

              {/* Item Details */}
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

              {/* Quantity Selector */}
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

              {/* Special Instructions */}
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

              {/* Total and Actions */}
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={orderingItem === selectedItem.id}
                    className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

        {/* Enhanced Cart Sidebar with Full ViewCart Functionality */}
        {showCart && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)} />
            <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl">
              <div className="flex flex-col h-full">
                {/* Enhanced Cart Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <ShoppingCart className="w-6 h-6 mr-2 text-blue-500" />
                      Your Cart
                    </h3>
                    {allCartItems.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {allCartItems.reduce((sum, item) => sum + item.quantity, 0)} item
                        {allCartItems.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? "s" : ""} • ₹
                        {allCartItems
                          .reduce(
                            (total, item) => total + (item.priceAtOrder || item.price || 0) * (item.quantity || 1),
                            0,
                          )
                          .toFixed(2)}
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

                {/* Enhanced Cart Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {cartLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="animate-spin h-8 w-8 text-blue-500" />
                      <span className="ml-2 text-gray-600">Loading cart...</span>
                    </div>
                  ) : allCartItems.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h4>
                      <p className="text-gray-500">Add some delicious items to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Admin Context Info */}
                      {isAdmin && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
    <div className="flex items-center">
      <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
      <span className="text-sm text-blue-800 font-medium">
        {orderContext === "employee" && selectedEmployeeId
          ? `Cart for employee: ${selectedEmployeeId}`
          : "Your cart"}
      </span>
    </div>
  </div>
)}

                      {/* Cart Items Table - Enhanced */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900">Order Details</h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Item Name
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Price
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Quantity
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Total Price
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Status
                                </th>
                                <th scope="col" className="relative px-4 py-3">
                                  <span className="sr-only">Actions</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {allCartItems.map((item) => {
                                const itemTotal = (item.priceAtOrder || item.price || 0) * (item.quantity || 1)
                                return (
                                  <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 mr-3">{getCategoryIcon(item.category)}</div>
                                        <div>
                                          <div className="text-sm font-medium text-gray-900">
                                            {item.itemName || item.name || "Unknown Item"}
                                          </div>
                                          {item.remarks && (
                                            <div className="text-xs text-gray-500 mt-1">Note: {item.remarks}</div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      ₹{(item.priceAtOrder || item.price || 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                        {item.quantity}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                      ₹{itemTotal.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          item.status === "PENDING"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : item.status === "PREPARING"
                                              ? "bg-blue-100 text-blue-800"
                                              : item.status === "READY"
                                                ? "bg-green-100 text-green-800"
                                                : item.status === "CART"
                                                  ? "bg-purple-100 text-purple-800"
                                                  : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {item.status === "CART" ? "in cart" : item.status.toLowerCase()}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      {item.status === "PENDING" && (
                                        <button
                                          onClick={() => handleCancelOrder(item.id)}
                                          className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                                          title="Cancel Order"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                      {item.status === "CART" && (
                                        <button
                                          onClick={() => handleRemoveFromCart(item.id)}
                                          className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                                          title="Remove from Cart"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Enhanced Cart Summary */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Package className="w-4 h-4 mr-2 text-blue-600" />
                          Order Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Items:</span>
                            <span className="font-medium">
                              {allCartItems.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Number of Orders:</span>
                            <span className="font-medium">{cartItems.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">
                              ₹
                              {cartItems
                                .reduce((total, item) => {
                                  const itemPrice = item.priceAtOrder || item.price || 0
                                  const itemQuantity = item.quantity || 1
                                  const itemTotal = itemPrice * itemQuantity
                                  return total + itemTotal
                                }, 0)
                                .toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pending Subtotal:</span>
                            <span className="font-medium">
                              ₹
                              {pendingCartItems
                                .reduce((total, item) => {
                                  const itemPrice = item.priceAtOrder || item.price || 0
                                  const itemQuantity = item.quantity || 1
                                  const itemTotal = itemPrice * itemQuantity
                                  return total + itemTotal
                                }, 0)
                                .toFixed(2)}
                            </span>
                          </div>
                          <div className="border-t border-blue-200 pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-900">Total Amount:</span>
                              <span className="font-bold text-xl text-blue-600">
                                ₹
                                {allCartItems
                                  .reduce((total, item) => {
                                    const itemPrice = item.priceAtOrder || item.price || 0
                                    const itemQuantity = item.quantity || 1
                                    const itemTotal = itemPrice * itemQuantity
                                    return total + itemTotal
                                  }, 0)
                                  .toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Status Summary */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">Order Status</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {["PENDING", "PREPARING", "READY", "DELIVERED"].map((status) => {
                            const count = cartItems.filter((item) => item.status === status).length
                            const statusColors = {
                              PENDING: "text-yellow-600 bg-yellow-100",
                              PREPARING: "text-blue-600 bg-blue-100",
                              READY: "text-green-600 bg-green-100",
                              DELIVERED: "text-gray-600 bg-gray-100",
                            }
                            return (
                              <div key={status} className="flex justify-between items-center">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
                                  {status.toLowerCase()}
                                </span>
                                <span className="font-medium">{count}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Cart Footer */}
                {allCartItems.length > 0 && (
                  <div className="border-t border-gray-200 p-6 bg-white">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-lg font-semibold text-gray-700">Grand Total:</span>
                        <div className="text-sm text-gray-500">
                          {allCartItems.reduce((sum, item) => sum + item.quantity, 0)} item
                          {allCartItems.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? "s" : ""} •{" "}
                          {cartItems.length} order
                          {cartItems.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">
                        ₹
                        {allCartItems
                          .reduce((total, item) => {
                            const itemPrice = item.priceAtOrder || item.price || 0
                            const itemQuantity = item.quantity || 1
                            const itemTotal = itemPrice * itemQuantity
                            return total + itemTotal
                          }, 0)
                          .toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {pendingCartItems.length > 0 && (
                        <button
                          className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center mb-3"
                          onClick={handlePlaceAllOrders}
                          disabled={cartLoading}
                        >
                          {cartLoading ? (
                            <>
                              <Loader className="animate-spin w-4 h-4 mr-2" />
                              Placing Orders...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Place {pendingCartItems.length} Order{pendingCartItems.length !== 1 ? "s" : ""} (₹
                              {pendingCartItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)})
                            </>
                          )}
                        </button>
                      )}

                      <button
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-all flex items-center justify-center"
                        onClick={() => {
                          // Handle checkout logic here
                          alert(
                            `Proceeding to checkout with ${cartItems.length} orders totaling ₹${getCartTotal().toFixed(2)},
                          `)
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Proceed to Checkout (₹{getCartTotal().toFixed(2)})
                      </button>

                      <button
                        onClick={() => setShowCart(false)}
                        className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all"
                      >
                        Continue Shopping
                      </button>
                    </div>
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