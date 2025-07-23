"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Bell, CheckCircle, AlertCircle, Info, Trash2 } from "lucide-react"
import { useAuth } from "./AuthContext"

export default function NotificationsPage({ onBack }) {
  const { employee, admin, isAdmin } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    // Mock notifications data
    setNotifications([
      {
        id: 1,
        type: "success",
        title: "Order Delivered",
        message: "Your order #1234 has been delivered successfully.",
        time: new Date().toISOString(),
        read: false,
      },
      {
        id: 2,
        type: "info",
        title: "New Menu Items",
        message: "Check out our new special dishes available today!",
        time: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
      {
        id: 3,
        type: "warning",
        title: "Order Delayed",
        message: "Your order #1233 is delayed by 15 minutes due to high demand.",
        time: new Date(Date.now() - 7200000).toISOString(),
        read: true,
      },
      {
        id: 4,
        type: "success",
        title: "Payment Successful",
        message: "Your wallet has been topped up with ₹500.",
        time: new Date(Date.now() - 86400000).toISOString(),
        read: true,
      },
    ])
  }, [])

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case "warning":
        return <AlertCircle className="w-6 h-6 text-yellow-600" />
      case "info":
        return <Info className="w-6 h-6 text-blue-600" />
      default:
        return <Bell className="w-6 h-6 text-gray-600" />
    }
  }

  const getNotificationBg = (type, read) => {
    const baseClasses = read ? "bg-gray-50" : "bg-white border-l-4"
    switch (type) {
      case "success":
        return `${baseClasses} ${!read ? "border-green-500" : ""}`
      case "warning":
        return `${baseClasses} ${!read ? "border-yellow-500" : ""}`
      case "info":
        return `${baseClasses} ${!read ? "border-blue-500" : ""}`
      default:
        return baseClasses
    }
  }

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read
    if (filter === "read") return notif.read
    return true
  })

  const unreadCount = notifications.filter((notif) => !notif.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-4 p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex space-x-4">
            {["all", "unread", "read"].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === filterType ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                {filterType === "unread" && unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {filter === "unread"
                  ? "You're all caught up! No unread notifications."
                  : filter === "read"
                    ? "No read notifications found."
                    : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl shadow-lg p-6 transition-all hover:shadow-xl ${getNotificationBg(notification.type, notification.read)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${notification.read ? "text-gray-600" : "text-gray-900"}`}>
                        {notification.title}
                      </h3>
                      <p className={`mt-1 ${notification.read ? "text-gray-500" : "text-gray-700"}`}>
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {new Date(notification.time).toLocaleDateString()} at{" "}
                        {new Date(notification.time).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
