import { useState } from "react"
import { ShoppingCart, X, Trash2, CheckCircle, Package, ChefHat, Coffee, Utensils, Cookie, Wine } from "lucide-react"
import EmployeeMenu from "./EmployeeMenu"
export default function CartPreview() {
  const [showCart, setShowCart] = useState(true)
  const [cartItems] = useState([]) // Empty cart - will be populated by employee actions

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

  // Get cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.totalPrice || 0), 0)
  }

  const handleCancelOrder = (orderId) => {
    // This will be connected to your actual cancel API
    console.log(`Cancel order ${orderId}`)
  }

  if (!showCart) return null

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const totalAmount = getCartTotal()

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Cart Preview */}
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="flex flex-col h-[600px]">
            {/* Cart Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <ShoppingCart className="w-6 h-6 mr-2 text-blue-500" />
                  Your Cart
                </h3>
                {totalItems > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {totalItems} items • ₹{totalAmount.toFixed(2)}
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

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                // Empty Cart State
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h4>
                  <p className="text-gray-500">Add some delicious items to get started!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Admin Context Info - Will show when admin is ordering */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm text-blue-800 font-medium">Your cart</span>
                    </div>
                  </div>

                  {/* Cart Items Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900">Order Details</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Price
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="relative px-4 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {cartItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 mr-3">{getCategoryIcon(item.category)}</div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                                    {item.remarks && (
                                      <div className="text-xs text-gray-500 mt-1">Note: {item.remarks}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ₹{(item.priceAtOrder || 0).toFixed(2)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {item.quantity || 0}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                ₹{(item.totalPrice || 0).toFixed(2)}
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
                                          : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {(item.status || "pending").toLowerCase()}
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
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Cart Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2 text-blue-600" />
                      Order Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Items:</span>
                        <span className="font-medium">{totalItems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of Orders:</span>
                        <span className="font-medium">{cartItems.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-blue-200 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-900">Total Amount:</span>
                          <span className="font-bold text-xl text-blue-600">₹{totalAmount.toFixed(2)}</span>
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

            {/* Cart Footer - Only shows when cart has items */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-lg font-semibold text-gray-700">Grand Total:</span>
                    <div className="text-sm text-gray-500">
                      {totalItems} items • {cartItems.length} orders
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">₹{totalAmount.toFixed(2)}</span>
                </div>

                <div className="space-y-3">
                  <button
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-all flex items-center justify-center"
                    onClick={() => console.log(`Proceeding to checkout with ₹${totalAmount.toFixed(2)}`)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Proceed to Checkout (₹{totalAmount.toFixed(2)})
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

        {/* Info Message */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Ready for Employee Orders:</strong> Cart is empty and ready to receive items when employees add
                them from the menu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}