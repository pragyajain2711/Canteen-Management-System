"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Search,
  Plus,
  Minus,
  X,
  Check,
  AlertCircle,
  Loader2,
  User,
  Clock,
  ShoppingCart,
  Zap,
  Filter,
  Users,
  History,
} from "lucide-react"
import api, { weeklyMenuApi, menuApi } from "../api"
import { getDay } from 'date-fns'

const FastOrdering = () => {
  // State
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [employeeResults, setEmployeeResults] = useState([])
  const [recentCustomers, setRecentCustomers] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [menuSearch, setMenuSearch] = useState("")
  const [todaysMenuItems, setTodaysMenuItems] = useState([])
  const [allMenuItems, setAllMenuItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [orderItems, setOrderItems] = useState([])
  const [remarks, setRemarks] = useState("")
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, title: "", description: "", variant: "" })
  const [categoryItems, setCategoryItems] = useState({})
  const [searchMode, setSearchMode] = useState(false)
  const [showEmployeeSuggestions, setShowEmployeeSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])

  // Refs
  const employeeSearchRef = useRef(null)
  const menuSearchRef = useRef(null)

  // Days of week mapping
  const daysOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
  const todayDay = daysOfWeek[new Date().getDay()]

  // Categories
  const categories = [
    { value: "breakfast", label: "Breakfast", icon: "🌅", color: "bg-orange-100 text-orange-800" },
    { value: "lunch", label: "Lunch", icon: "🍽️", color: "bg-green-100 text-green-800" },
    { value: "thali", label: "Thali", icon: "🍛", color: "bg-purple-100 text-purple-800" },
    { value: "snacks", label: "Snacks", icon: "🍿", color: "bg-yellow-100 text-yellow-800" },
    { value: "beverages", label: "Beverages", icon: "☕", color: "bg-blue-100 text-blue-800" },
  ]

  // Show toast function
  const showToast = (title, description, variant = "default") => {
    setToast({ show: true, title, description, variant })
    setTimeout(() => setToast({ show: false, title: "", description: "", variant: "" }), 3000)
  }

  // Load today's menu items from weekly menu
  const loadTodaysMenuItems = async () => {
    try {
      setLoading(true)
      
      // Get today's date in ISO format (without time)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()

      // Fetch weekly menu items for today
      const response = await weeklyMenuApi.getByDateRange(todayISO, todayISO)
      const todaysItems = response.data.filter((item) => item.dayOfWeek === todayDay)

      // Extract menu items with their categories
      const itemsWithCategories = todaysItems.map((item) => ({
        ...item.menuItem,
        mealCategory: item.mealCategory
      }))

      setTodaysMenuItems(itemsWithCategories)

      // Group items by category
      const itemsByCategory = {}
      categories.forEach((cat) => {
        itemsByCategory[cat.value] = itemsWithCategories.filter((item) => item.mealCategory === cat.value)
      })
      setCategoryItems(itemsByCategory)
    } catch (err) {
      showToast("Error", "Failed to load today's menu items", "destructive")
      console.error("Failed to load today's menu items:", err)
    } finally {
      setLoading(false)
    }
  }

  // Load all active menu items
  const loadAllMenuItems = async () => {
    try {
      setLoading(true)
      const response = await menuApi.getActiveItems()
      setAllMenuItems(response.data)
    } catch (err) {
      showToast("Error", "Failed to load menu items", "destructive")
      console.error("Failed to load menu items:", err)
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadTodaysMenuItems()
    loadAllMenuItems()
  }, [])

  // Add to recent searches
  const addToRecentSearches = (searchTerm) => {
    if (searchTerm.length < 2) return

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item !== searchTerm)
      return [searchTerm, ...filtered].slice(0, 5)
    })
  }

  // Debounced employee search
  const debouncedEmployeeSearch = useCallback(
    debounce(async (searchTerm) => {
      if (searchTerm.length < 2) {
        setEmployeeResults([])
        setShowEmployeeSuggestions(false)
        return
      }

      try {
        setSearchLoading(true)
        const response = await api.get("api/admin/customers/filter", {
          params: { search: searchTerm },
        })

        const validEmployees = response.data
          .filter((emp) => !emp.isSuperAdmin)
          .map((emp) => ({
            id: emp.id,
            employeeId: emp.employeeId,
            firstName: emp.firstName,
            lastName: emp.lastName,
            department: emp.department || "General",
            isActive: emp.isActive,
          }))

        setEmployeeResults(validEmployees)
        setShowEmployeeSuggestions(true)
      } catch (err) {
        if (err.response?.status === 403) {
          showToast("Access Denied", "You don't have permission to search employees", "destructive")
        } else {
          showToast("Error", "Employee search failed", "destructive")
        }
        console.error("Employee search failed:", err)
      } finally {
        setSearchLoading(false)
      }
    }, 300),
    [],
  )

  // Handle employee search
  const handleEmployeeSearch = (e) => {
    const searchTerm = e.target.value
    setEmployeeSearch(searchTerm)
    debouncedEmployeeSearch(searchTerm)
  }

  // Select employee
  const selectEmployee = async (employee) => {
    try {
      setLoading(true)
      const response = await api.get(`api/admin/customers/${employee.id}`)

      setSelectedEmployee({
        id: response.data.id,
        employeeId: response.data.employeeId,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        department: response.data.department || "General",
        isActive: response.data.isActive,
      })

      setEmployeeSearch("")
      setEmployeeResults([])
      setShowEmployeeSuggestions(false)

      // Add to recent customers if not already there
      setRecentCustomers((prev) => {
        const exists = prev.find((c) => c.id === response.data.id)
        if (!exists) {
          return [{
            id: response.data.id,
            employeeId: response.data.employeeId,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            department: response.data.department || "General",
            isActive: response.data.isActive,
          }, ...prev.slice(0, 4)]
        }
        return prev
      })

      // Focus on menu search after selecting employee
      setTimeout(() => menuSearchRef.current?.focus(), 100)
    } catch (err) {
      if (err.response?.status === 403) {
        showToast("Access Denied", "You don't have permission to view employee details", "destructive")
      } else {
        showToast("Error", "Failed to load employee details", "destructive")
      }
      console.error("Failed to load employee details:", err)
    } finally {
      setLoading(false)
    }
  }

  // Debounced menu search
  const debouncedMenuSearch = useCallback(
    debounce(async (searchTerm) => {
      if (searchTerm.length === 0) {
        setSearchMode(false)
        setFilteredItems([])
        setActiveCategory(null)
        return
      }

      try {
        setSearchLoading(true)
        const filtered = allMenuItems.filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        setFilteredItems(filtered)
        setSearchMode(true)
        setActiveCategory(null)
        addToRecentSearches(searchTerm)
      } catch (err) {
        console.error("Search failed:", err)
      } finally {
        setSearchLoading(false)
      }
    }, 200),
    [allMenuItems],
  )

  // Handle menu search
  const handleMenuSearch = (e) => {
    const searchTerm = e.target.value
    setMenuSearch(searchTerm)
    debouncedMenuSearch(searchTerm)
  }

  // Handle recent search click
  const handleRecentSearchClick = (searchTerm) => {
    setMenuSearch(searchTerm)
    debouncedMenuSearch(searchTerm)
  }

  // Toggle category
  const toggleCategory = (category) => {
    if (searchMode) return

    setActiveCategory(activeCategory === category ? null : category)
    setMenuSearch("")
  }

  // Add item to order
  const addToOrder = (item) => {
    if (!item.availableStatus) {
      showToast("Item unavailable", "This item is currently sold out", "destructive")
      return
    }

    setOrderItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [
        ...prev,
        {
          ...item,
          quantity: 1,
          menuId: item.menuId,
        },
      ]
    })

    showToast("Added", `${item.name} added to order`)
  }

  // Quick add all from category
  const addAllFromCategory = (category) => {
    const itemsToAdd = categoryItems[category]?.filter((item) => item.availableStatus)

    if (!itemsToAdd || itemsToAdd.length === 0) {
      showToast("No items available", `No available items in ${category} category`, "destructive")
      return
    }

    setOrderItems((prev) => {
      const newItems = [...prev]

      itemsToAdd.forEach((item) => {
        const existingIndex = newItems.findIndex((i) => i.id === item.id)
        if (existingIndex >= 0) {
          newItems[existingIndex].quantity += 1
        } else {
          newItems.push({
            ...item,
            quantity: 1,
            menuId: item.menuId,
          })
        }
      })

      return newItems
    })

    showToast("Items added", `All available ${category} items added to order`)
  }

  // Update quantity
  const updateQuantity = (index, change) => {
    setOrderItems((prev) => {
      const newQuantity = prev[index].quantity + change
      if (newQuantity < 1) {
        return prev.filter((_, i) => i !== index)
      }
      return prev.map((item, i) => (i === index ? { ...item, quantity: newQuantity } : item))
    })
  }

  // Submit order
  const submitOrder = async () => {
    if (!selectedEmployee || orderItems.length === 0) {
      showToast("Incomplete order", "Please select an employee and add items to order", "destructive")
      return
    }

    try {
      setLoading(true)

      // Create orders for each item with status DELIVERED
      const results = await Promise.all(
        orderItems.map((item) =>
          api.post("api/orders", {
            employeeId: selectedEmployee.employeeId,
            menuId: item.menuId,
            quantity: item.quantity,
            remarks: remarks,
            expectedDeliveryDate: new Date().toISOString().split("T")[0],
            status: "DELIVERED",
          }),
        ),
      )

      setOrderItems([])
      setRemarks("")
      showToast("Success", "Order placed and marked as delivered successfully!")

      // Immediately create transactions for these delivered orders
      try {
        await api.post("api/transactions/create-transactions")
      } catch (txnErr) {
        console.error("Failed to create transactions:", txnErr)
      }
    } catch (err) {
      let errorMessage = "Failed to place order"
      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = "You don't have permission to place orders"
        } else if (err.response.data) {
          errorMessage = err.response.data.includes("Employee not found")
            ? "Employee not found - please check the employee ID"
            : err.response.data
        }
      }
      showToast("Order failed", errorMessage, "destructive")
      console.error("Order submission failed:", err)
    } finally {
      setLoading(false)
    }
  }

  // Clear order
  const clearOrder = () => {
    setOrderItems([])
    setRemarks("")
    showToast("Cleared", "Order cleared")
  }

  // Debounce utility
  function debounce(func, wait) {
    let timeout
    return function (...args) {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all ${
            toast.variant === "destructive"
              ? "bg-red-50 border border-red-200 text-red-900"
              : "bg-green-50 border border-green-200 text-green-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.variant === "destructive" ? (
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Zap className="h-8 w-8 text-blue-600" />
            Fast Ordering System
          </h1>
          <p className="text-gray-600 mt-1">Company Canteen - Quick Order Processing</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Employee Search Section */}
          <div className="lg:col-span-3">
            <div className="h-[400px] overflow-y-auto bg-white rounded-lg shadow-md p-6">

              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Customer Selection</h2>
              </div>

              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  ref={employeeSearchRef}
                  value={employeeSearch}
                  onChange={handleEmployeeSearch}
                  placeholder="Search employee ID, name..."
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onFocus={() => setShowEmployeeSuggestions(true)}
                />
                {searchLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />}
              </div>

              {/* Search Results */}
              {showEmployeeSuggestions && employeeResults.length > 0 && (
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg">
                  <div className="max-h-48 overflow-y-auto">
                    {employeeResults.map((emp) => (
                      <div
                        key={emp.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:border-blue-500"
                        onClick={() => selectEmployee(emp)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{emp.employeeId}</div>
                            <div className="text-sm">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{emp.department}</div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            emp.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {emp.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Customers */}
              {recentCustomers.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Recent Customers</span>
                  </div>
                  <div className="space-y-2">
                    {recentCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="p-3 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                        onClick={() => selectEmployee(customer)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{customer.employeeId}</div>
                            <div className="text-xs text-gray-500">
                              {customer.firstName} {customer.lastName}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu Section */}
          <div className="lg:col-span-5">
            <div className="h-[calc(100vh-160px)] overflow-y-auto bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">
                    {searchMode ? "All Menu Items" : `Today's Menu (${todayDay})`}
                  </h2>
                </div>
                {searchMode && (
                  <button
                    onClick={() => {
                      setMenuSearch("")
                      setSearchMode(false)
                      setFilteredItems([])
                      setActiveCategory(null)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Back to Today's Menu
                  </button>
                )}
              </div>

              {/* Menu Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  ref={menuSearchRef}
                  value={menuSearch}
                  onChange={handleMenuSearch}
                  placeholder={searchMode ? "Search all menu items..." : "Search today's menu..."}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />}
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && !searchMode && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <History className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(search)}
                        className="text-xs px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Buttons */}
              {!searchMode && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((category) => {
                    const itemsInCategory = categoryItems[category.value] || []
                    const availableCount = itemsInCategory.filter((item) => item.availableStatus).length

                    return (
                      <button
                        key={category.value}
                        onClick={() => toggleCategory(category.value)}
                        disabled={itemsInCategory.length === 0}
                        className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                          activeCategory === category.value
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        } ${itemsInCategory.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                          {availableCount}/{itemsInCategory.length}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Menu Items */}
              <div className="h-[calc(100%-150px)] overflow-y-auto">
                {/* Active Category Items */}
                {activeCategory && !searchMode && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between sticky top-0 bg-white py-2 border-b">
                      <h4 className="font-medium flex items-center gap-2">
                        <span>{categories.find((c) => c.value === activeCategory)?.icon}</span>
                        {categories.find((c) => c.value === activeCategory)?.label} Items
                      </h4>
                      <button
                        onClick={() => addAllFromCategory(activeCategory)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                      >
                        <Plus className="h-3 w-3" />
                        Add All Available
                      </button>
                    </div>
                    <div className="grid gap-3">
                      {(categoryItems[activeCategory] || []).map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] ${
                            !item.availableStatus
                              ? "opacity-60 cursor-not-allowed bg-gray-50"
                              : "hover:border-blue-300"
                          }`}
                          onClick={() => addToOrder(item)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="font-semibold text-green-600">₹{item.price}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  item.availableStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}>
                                  {item.availableStatus ? "Available" : "Sold Out"}
                                </span>
                              </div>
                            </div>
                            <button
                              disabled={!item.availableStatus}
                              onClick={(e) => {
                                e.stopPropagation()
                                addToOrder(item)
                              }}
                              className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {searchMode && (
                  <div className="space-y-4">
                    <h4 className="font-medium sticky top-0 bg-white py-2 border-b">
                      Search Results ({filteredItems.length} items)
                    </h4>
                    {filteredItems.length > 0 ? (
                      <div className="grid gap-3">
                        {filteredItems.map((item) => (
                          <div
                            key={item.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] ${
                              !item.availableStatus
                                ? "opacity-60 cursor-not-allowed bg-gray-50"
                                : "hover:border-blue-300"
                            }`}
                            onClick={() => addToOrder(item)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{item.name}</h4>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    categories.find((c) => c.value === item.mealCategory)?.color
                                  }`}>
                                    {categories.find((c) => c.value === item.mealCategory)?.label}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">{item.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="font-semibold text-green-600">₹{item.price}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    item.availableStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`}>
                                    {item.availableStatus ? "Available" : "Sold Out"}
                                  </span>
                                </div>
                              </div>
                              <button
                                disabled={!item.availableStatus}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  addToOrder(item)
                                }}
                                className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No items found matching your search.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Default View */}
                {!activeCategory && !searchMode && (
                  <div className="text-center py-12 text-gray-500">
                    <Filter className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Select a category or search for items</h3>
                    <p className="text-sm">Choose from the categories above to browse today's menu</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-4">
           <div className="bg-white rounded-lg shadow-md h-[calc(100vh-160px)] flex flex-col">
    <div className="flex-1 overflow-y-auto p-6">
    <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Order</h2> </div>
                {orderItems.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {orderItems.length}
                  </span>
                )}
              </div>

              {/* Employee Details in Order Summary */}
             {selectedEmployee ? (
  <div className="bg-blue-50 rounded-lg border border-blue-100 p-5 text-base leading-relaxed space-y-3 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold text-blue-800">Selected Customer</h3>
      <button
        onClick={() => setSelectedEmployee(null)}
        className="text-blue-600 hover:text-blue-800 text-sm"
      >
        Change
      </button>
    </div>
    <div className="space-y-2">
      <div className="text-lg font-semibold">
        {selectedEmployee.firstName} {selectedEmployee.lastName}
      </div>
      <div className="text-sm text-gray-700">Employee ID: {selectedEmployee.employeeId}</div>
      <div className="text-sm text-gray-700">Department: {selectedEmployee.department}</div>
      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
        selectedEmployee.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
      }`}>
        {selectedEmployee.isActive ? "Active" : "Inactive"}
      </span>
    </div>
  </div>
) : (
  <div className="text-sm text-gray-500">  No customer selected    </div>
)}

              {/* Remarks */}
              <textarea
                placeholder="Add remarks (optional)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4 transition-all duration-200 hover:shadow-md"
              />

              <div className="border-t border-gray-200 my-4"></div>

              {/* Order Items */}
              {orderItems.length > 0 ? (
                <>
                  <div className="+h-[calc(100%-300px)] overflow-y-auto">
                    <div className="space-y-3 pr-2">
                      {orderItems.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <p className="text-xs text-gray-500">₹{item.price} each</p>
                            </div>
                            <button
                              onClick={() => updateQuantity(index, -item.quantity)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(index, -1)}
                                className="h-8 w-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(index, 1)}
                                className="h-8 w-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="font-semibold text-green-600">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 my-4"></div>

                  {/* Total */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-green-600">
                        ₹{orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={submitOrder}
                        disabled={loading || !selectedEmployee}
                        className={`w-full py-2 px-4 rounded-md font-medium flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                          loading || !selectedEmployee
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Place Order (Delivered)
                          </>
                        )}
                      </button>
                      <button
                        onClick={clearOrder}
                        disabled={loading}
                        className="w-full py-2 px-4 rounded-md font-medium border border-gray-300 bg-transparent hover:bg-gray-50 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex items-center justify-center"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear Order
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No items in order</h3>
                    <p className="text-sm">Add items from the menu to create an order</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FastOrdering