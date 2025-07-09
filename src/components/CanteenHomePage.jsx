"use client"

import { useState, useEffect, useRef } from "react"
import { employeeMenuApi } from "./api"
import api from "./api"
import { useAuth } from "./AuthContext"
import ViewCart from "./ViewCart"
import {
  ChevronLeft,
  ChevronRight,
  Utensils,
  ChefHat,
  Coffee,
  Star,
  CheckCircle,
  X,
  Minus,
  Plus,
  Loader,
  ShoppingCart,
  Sparkles,
} from "lucide-react"

export default function ModernCanteenHomepage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [todayMenuSlide, setTodayMenuSlide] = useState(0)
  const [todayMenu, setTodayMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [scrollY, setScrollY] = useState(0)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  // Cart and ordering functionality
  const [cartItems, setCartItems] = useState([])
  const [pendingCartItems, setPendingCartItems] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [orderRemarks, setOrderRemarks] = useState("")
  const [orderingItem, setOrderingItem] = useState(null)
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)
  const [orderSuccessData, setOrderSuccessData] = useState(null)

  // Authentication context
  const { employee, isAdmin, admin } = useAuth()

  // Track the current day to prevent unnecessary refetches
  const currentDayRef = useRef(null)

  // Handle scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Load cart items
  const loadCartItems = async () => {
    try {
      setCartLoading(true)
      const employeeId = employee?.employeeId || (isAdmin ? admin?.employeeId : null)

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

  // Load cart items on mount
  useEffect(() => {
    loadCartItems()
  }, [])

  useEffect(() => {
    const fetchTodayMenu = async () => {
      try {
        const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
        const today = days[new Date().getDay()]

        // Only fetch if day has changed
        if (today === currentDayRef.current) return

        currentDayRef.current = today
        setLoading(true)
        setError(null)

        const response = await employeeMenuApi.getWeeklyMenu(today)

        // Transform API response
        const menuItems = response.data.map((item) => item.menuItem)

        // Group by category
        const groupedByCategory = menuItems.reduce((acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = []
          }
          acc[item.category].push({
            id: item.id,
            menuId: item.menuId,
            name: item.name,
            price: item.price,
            // FIXED: Use availableStatus instead of isActive for availability
            available: item.availableStatus && isItemActive(item.startDate, item.endDate),
            category: item.category,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
          })
          return acc
        }, {})

        // Convert to expected format
        const formattedMenu = Object.keys(groupedByCategory).map((category) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
          icon: getCategoryIcon(category),
          items: groupedByCategory[category],
        }))

        setTodayMenu(formattedMenu)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load today's menu")
        console.error("API Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTodayMenu()
  }, [])

  // Helper function to check if item is active based on date range
  const isItemActive = (startDate, endDate) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    return today >= startDay && today <= endDay
  }

  const getCurrentDay = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[currentTime.getDay()]
  }

  const nextTodayMenuSlide = () => {
    setTodayMenuSlide((prev) => (prev + 1) % Math.ceil(todayMenu.length / 2))
  }

  const prevTodayMenuSlide = () => {
    setTodayMenuSlide((prev) => (prev - 1 + Math.ceil(todayMenu.length / 2)) % Math.ceil(todayMenu.length / 2))
  }

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "breakfast":
        return <Coffee className="w-5 h-5" />
      case "lunch":
      case "thali":
        return <Utensils className="w-5 h-5" />
      case "snacks":
      case "beverages":
      default:
        return <Coffee className="w-5 h-5" />
    }
  }

  const openImageModal = (item) => {
    setSelectedImage(item)
    setIsImageModalOpen(true)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
    setIsImageModalOpen(false)
  }

  // Handle opening order dialog
  const handleOpenOrderDialog = (item) => {
    if (!item.available) return
    setSelectedItem(item)
    setOrderQuantity(1)
    setOrderRemarks("")
    setShowOrderDialog(true)
  }

  // Handle adding item to cart
  const handleAddToCart = async () => {
    if (!selectedItem) return

    try {
      setOrderingItem(selectedItem.id)

      const employeeId = employee?.employeeId || (isAdmin ? admin?.employeeId : null)

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
        remarks: orderRemarks,
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
      })

      setShowOrderSuccess(true)
      setShowOrderDialog(false)
    } catch (err) {
      alert(`Failed to add to cart: ${err.message}`)
    } finally {
      setOrderingItem(null)
    }
  }

  // Handle direct order now for top items
  const handleOrderNow = async (item) => {
    try {
      setOrderingItem(item.id)
      const employeeId = employee?.employeeId || (isAdmin ? admin?.employeeId : null)

      if (!employeeId) {
        alert("Please log in to place an order")
        return
      }

      // Find matching menu item from today's menu
      const menuItem = todayMenu.flatMap((category) => category.items).find((menuItem) => menuItem.name === item.name)

      if (!menuItem || !menuItem.available) {
        alert("This item is currently unavailable")
        return
      }

      // Create cart item for top items
      const cartItem = {
        id: Date.now(),
        menuId: menuItem.menuId || 1,
        itemName: item.name,
        category: menuItem.category || "special",
        priceAtOrder: Number.parseFloat(item.price.replace("₹", "")),
        quantity: 1,
        totalPrice: Number.parseFloat(item.price.replace("₹", "")),
        remarks: `Quick order from homepage - ${item.name}`,
        employeeId,
        status: "CART",
        expectedDeliveryDate: new Date().toISOString().split("T")[0],
      }

      setPendingCartItems((prev) => [...prev, cartItem])

      setOrderSuccessData({
        itemName: item.name,
        orderId: `CART-${Date.now()}`,
        quantity: 1,
        price: Number.parseFloat(item.price.replace("₹", "")),
        totalPrice: Number.parseFloat(item.price.replace("₹", "")),
      })

      setShowOrderSuccess(true)
    } catch (err) {
      console.error("Order error:", err)
      alert(`Failed to add to cart: ${err.message}`)
    } finally {
      setOrderingItem(null)
    }
  }

  // Place all cart items as orders
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

  // Remove items from pending cart
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

  // Get cart notification text
  const getCartNotificationText = () => {
    const totalCount = pendingCartItems.length + cartItems.length
    if (totalCount === 0) return "View Cart"
    if (totalCount === 1) return "1 item in cart"
    return `${totalCount} items in cart`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
          style={{ transform: `translateY(${-scrollY * 0.1}px)` }}
        ></div>
        <div
          className="absolute top-40 left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
          style={{ transform: `translateY(${scrollY * 0.05}px)` }}
        ></div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <Sparkles className="w-4 h-4 text-blue-300 opacity-60" />
          </div>
        ))}
      </div>

      {/* Hero Section with Text Masking */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Header with Cart Button */}
          <div className="flex justify-between items-center mb-8">
            <div></div>
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white/30 transition-all shadow-lg hover:shadow-xl"
            >
              <ShoppingCart className="w-5 h-5" />
              {getCartNotificationText()}
              {pendingCartItems.length + cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {pendingCartItems.length + cartItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Animated Welcome Text with Gradient Mask */}
          <div className="relative mb-6">
            <h2 className="text-6xl md:text-7xl font-bold mb-4 relative">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-gradient-x">
                Welcome to
              </span>
            </h2>
            <h1 className="text-7xl md:text-8xl font-black relative">
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent animate-gradient-x animation-delay-1000">
                Office Canteen
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 rounded-lg blur opacity-20 animate-pulse"></div>
            </h1>
          </div>
        </div>

        {/* Animated Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
              className="fill-white animate-wave"
            ></path>
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
              className="fill-white animate-wave animation-delay-1000"
            ></path>
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              className="fill-white animate-wave animation-delay-2000"
            ></path>
          </svg>
        </div>
      </section>

      {/* Daily Menu with Enhanced Hover Cards */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 animate-fade-in-up">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Today's Menu - {getCurrentDay()}
              </span>
            </h3>
            <p className="text-xl text-slate-600 animate-fade-in-up animation-delay-500">Fresh items available today</p>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto mt-4 rounded-full animate-scale-in animation-delay-1000"></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center animate-shake">
              <div className="flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-red-600 mr-3 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin animation-delay-150"></div>
              </div>
              <span className="ml-4 text-xl text-gray-700 animate-pulse">Loading today's menu...</span>
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-hidden rounded-2xl">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${todayMenuSlide * 50}%)` }}
                >
                  {Array.from({ length: Math.ceil(todayMenu.length / 2) }, (_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0 px-4">
                      <div className="grid md:grid-cols-2 gap-8">
                        {todayMenu.slice(slideIndex * 2, slideIndex * 2 + 2).map((category, index) => (
                          <div
                            key={index}
                            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden"
                          >
                            {/* Enhanced Header */}
                            <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 px-8 py-6 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
                              <div className="flex items-center justify-center space-x-3 text-slate-800 relative z-10">
                                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                                  {category.icon}
                                </div>
                                <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors duration-300">
                                  {category.category}
                                </h3>
                              </div>
                            </div>

                            {/* Enhanced Content */}
                            <div className="p-8 relative">
                              <div className="space-y-4">
                                {category.items.map((item, itemIndex) => (
                                  <div
                                    key={itemIndex}
                                    className="group/item flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                                  >
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-slate-800 group-hover/item:text-blue-600 transition-colors duration-300">
                                        {item.name}
                                      </h5>
                                      <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        ₹{item.price}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span
                                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full transition-all duration-300 ${
                                          item.available
                                            ? "bg-green-100 text-green-800 group-hover/item:bg-green-200 group-hover/item:scale-110"
                                            : "bg-red-100 text-red-800 group-hover/item:bg-red-200"
                                        }`}
                                      >
                                        {item.available ? "Available" : "Sold Out"}
                                      </span>
                                      {item.available && (
                                        <button
                                          onClick={() => handleOpenOrderDialog(item)}
                                          className="opacity-0 group-hover/item:opacity-100 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                        >
                                          Add
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-blue-400/0 group-hover:from-blue-400/10 group-hover:via-purple-400/10 group-hover:to-blue-400/10 rounded-2xl transition-all duration-500 pointer-events-none"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Navigation */}
              {todayMenu.length > 2 && (
                <>
                  <button
                    onClick={prevTodayMenuSlide}
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 p-4 rounded-full z-10 group"
                  >
                    <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:text-green-600 transition-colors duration-300" />
                  </button>
                  <button
                    onClick={nextTodayMenuSlide}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 p-4 rounded-full z-10 group"
                  >
                    <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-green-600 transition-colors duration-300" />
                  </button>
                </>
              )}

              {/* Enhanced Dots */}
              {todayMenu.length > 2 && (
                <div className="flex justify-center space-x-3 mt-8">
                  {Array.from({ length: Math.ceil(todayMenu.length / 2) }, (_, index) => (
                    <button
                      key={index}
                      className={`relative transition-all duration-300 ${
                        index === todayMenuSlide
                          ? "w-12 h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                          : "w-3 h-3 bg-slate-300 hover:bg-slate-400 rounded-full hover:scale-125"
                      }`}
                      onClick={() => setTodayMenuSlide(index)}
                    >
                      {index === todayMenuSlide && (
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Image Modal with Cover Opening Effect */}
      {isImageModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-5xl max-h-[95vh] w-full">
            <button
              onClick={closeImageModal}
              className="absolute -top-16 right-0 text-white hover:text-red-400 transition-colors duration-300 z-10 bg-white/10 rounded-full p-2 backdrop-blur-sm"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl overflow-hidden shadow-2xl transform animate-modal-open border-4 border-white/20">
              <div className="relative">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={selectedImage.image || "/placeholder.svg"}
                    alt={selectedImage.name}
                    className="w-full h-full object-cover transform animate-zoom-in"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="text-sm font-bold text-gray-800">Premium Dish</span>
                    </div>
                  </div>
                </div>
                <div className="p-8 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -translate-y-16 translate-x-16"></div>
                  <h3 className="text-4xl font-bold text-slate-800 mb-4 animate-slide-in-right">
                    {selectedImage.name}
                  </h3>
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed animate-slide-in-right animation-delay-300">
                    {selectedImage.description}
                  </p>
                  <div className="flex items-center justify-between animate-slide-in-right animation-delay-600">
                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {selectedImage.price}
                    </span>
                    <button
                      onClick={() => handleOrderNow(selectedImage)}
                      disabled={orderingItem === selectedImage?.id}
                      className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="relative z-10 flex items-center space-x-3">
                        <span>{orderingItem === selectedImage?.id ? "Adding..." : "Add to Cart"}</span>
                        <ChefHat className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

      {/* ViewCart Component */}
      {showCart && (
        <ViewCart
          cartItems={cartItems}
          pendingCartItems={pendingCartItems}
          onRemoveFromCart={handleRemoveFromCart}
          onPlaceAllOrders={handlePlaceAllOrders}
          onCancelOrder={handleCancelOrder}
          cartLoading={cartLoading}
          onClose={() => setShowCart(false)}
        />
      )}

      {/* Order Success Modal */}
      {showOrderSuccess && orderSuccessData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Added to Cart!</h3>
            <div className="text-gray-600 mb-4">
              <p className="mb-2">
                {orderSuccessData.quantity}x {orderSuccessData.itemName}
              </p>
              <p className="text-lg font-semibold text-blue-600">Total: ₹{orderSuccessData.totalPrice?.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">Cart ID: #{orderSuccessData.orderId}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowOrderSuccess(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
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

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes wave {
          0% { transform: translateX(0); }
          50% { transform: translateX(-25%); }
          100% { transform: translateX(-50%); }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes scale-in {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modal-open {
          0% {
            opacity: 0;
            transform: scale(0.8) rotateY(-15deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotateY(0deg);
          }
        }

        @keyframes zoom-in {
          0% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-wave {
          animation: wave 10s linear infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-modal-open {
          animation: modal-open 0.6s ease-out;
        }

        .animate-zoom-in {
          animation: zoom-in 0.8s ease-out;
        }

        .animation-delay-150 {
          animation-delay: 150ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-500 {
          animation-delay: 500ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }

        .animation-delay-1000 {
          animation-delay: 1000ms;
        }

        .animation-delay-2000 {
          animation-delay: 2000ms;
        }

        .animation-delay-3000 {
          animation-delay: 3000ms;
        }

        .animation-delay-4000 {
          animation-delay: 4000ms;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }

        .backface-hidden {
          backface-visibility: hidden;
        }

        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}