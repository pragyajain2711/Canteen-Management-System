"use client"

import { useContext, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "./AuthContext"
import { useNotifications } from "./NotificationContext"
import { Clock, Calendar, ChefHat, Menu, X, Settings, Bell, CreditCard, MessageSquare } from "lucide-react"
import NotificationDialog from "./NotificationDialog"

function Navbar() {
  const { isAuthenticated, employee, logout, isAdmin } = useContext(AuthContext)
  const { notifications } = useNotifications()
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getCurrentDay = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[currentTime.getDay()]
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors relative"
              onClick={() => setHamburgerMenuOpen(!hamburgerMenuOpen)}
            >
              {hamburgerMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <ChefHat className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Office Canteen</h1>
                <p className="text-sm text-slate-500">Fresh & Delicious</p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
              Home
            </Link>
            <Link to="/menu" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
              Menu
            </Link>
            {isAuthenticated && (
              <Link to="/order" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Order
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{getCurrentDay()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowNotificationDialog(true)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  <span className="text-slate-700">Hi, {employee?.fullName}</span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/sign_in"
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-transparent border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign_up"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {hamburgerMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setHamburgerMenuOpen(false)} />

          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <ChefHat className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Menu</h2>
                    <p className="text-sm text-slate-500">Quick Access</p>
                  </div>
                </div>
                <button
                  onClick={() => setHamburgerMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div
                    className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 hover:bg-yellow-100 transition-colors cursor-pointer"
                    onClick={() => {
                      setHamburgerMenuOpen(false)
                      setShowNotificationDialog(true)
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <Bell className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        <p className="text-sm text-gray-600">
                          {notifications.length === 0
                            ? "No new notifications"
                            : `${notifications.length} new notifications`}
                        </p>
                      </div>
                      {notifications.length > 0 && (
                        <div className="ml-auto">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {notifications.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isAuthenticated && (
                    <Link to="/suggestions" className="block">
                      <div
                        className="bg-purple-50 rounded-lg p-4 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
                        onClick={() => setHamburgerMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">Suggestions & Complaints</h3>
                            <p className="text-sm text-gray-600">Share your feedback</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}

                  {isAuthenticated && (
                    <Link to="/bills" className="block">
                      <div
                        className="bg-green-50 rounded-lg p-4 border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
                        onClick={() => setHamburgerMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <CreditCard className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">My Bills & Payments</h3>
                            <p className="text-sm text-gray-600">View and pay your canteen bills</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}

                  <div
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      setHamburgerMenuOpen(false)
                      console.log("Navigate to settings")
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <Settings className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Settings</h3>
                        <p className="text-sm text-gray-600">Manage preferences</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Office Canteen v2.0</p>
                  <p className="text-xs text-gray-400 mt-1">Fresh & Delicious</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <NotificationDialog 
        open={showNotificationDialog} 
        onClose={() => setShowNotificationDialog(false)}
      />
    </>
  )
}

export default Navbar