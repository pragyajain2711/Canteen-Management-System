"use client"

import { Package, ChefHat, Coffee, Utensils, Cookie, Wine, X, ShoppingCart, Trash2 } from "lucide-react"

export default function ViewCart({
  cartItems = [],
  pendingCartItems = [],
  onRemoveFromCart,
  onPlaceAllOrders,
  onCancelOrder,
  cartLoading = false,
  onClose, // Add onClose prop
}) {
  // Get icon for category
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "breakfast":
        return <Coffee className="w-4 h-4 text-orange-600" />
      case "lunch":
        return <Utensils className="w-4 h-4 text-green-600" />
      case "thali":
        return <ChefHat className="w-4 h-4 text-purple-600" />
      case "snacks":
        return <Cookie className="w-4 h-4 text-yellow-600" />
      case "beverages":
        return <Wine className="w-4 h-4 text-blue-600" />
      default:
        return <Package className="w-4 h-4 text-gray-600" />
    }
  }

  const allCartItems = [...pendingCartItems, ...cartItems]
  const totalItems = allCartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const totalAmount = allCartItems.reduce((total, item) => {
    const itemPrice = item.priceAtOrder || item.price || 0
    const itemQuantity = item.quantity || 1
    return total + itemPrice * itemQuantity
  }, 0)

  const handleCancelOrder = (orderId) => {
    if (onCancelOrder) {
      onCancelOrder(orderId)
    }
  }

  const handleRemoveFromCart = (itemId) => {
    if (onRemoveFromCart) {
      onRemoveFromCart(itemId)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Your Cart</h2>
            {totalItems > 0 && (
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-300 transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full max-h-[calc(90vh-140px)]">
          {allCartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some delicious items from our menu!</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Continue Ordering
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {allCartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.itemName || item.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          <span>₹{item.priceAtOrder || item.price || 0} each</span>
                          
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ₹{((item.priceAtOrder || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (item.status === "CART") {
                            handleRemoveFromCart(item.id)
                          } else {
                            handleCancelOrder(item.id)
                          }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title={item.status === "CART" ? "Remove from cart" : "Cancel order"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t bg-gray-50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">₹{totalAmount.toFixed(2)}</span>
                </div>

                {pendingCartItems.length > 0 && (
                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Continue Ordering
                    </button>
                    <button
                      onClick={onPlaceAllOrders}
                      disabled={cartLoading}
                      className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {cartLoading ? (
                        <>
                          <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                          Placing Orders...
                        </>
                      ) : (
                        `Place All Orders (${pendingCartItems.length})`
                      )}
                    </button>
                  </div>
                )}

                {pendingCartItems.length === 0 && cartItems.length > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">All items are already ordered</p>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                      Continue Ordering 
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}