import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { ChevronLeft, ChevronRight, Clock, Utensils, Calendar, ChefHat, Coffee, Menu, X, Settings, Bell, History, CreditCard } from "lucide-react";

function Navbar() {
  const { isAuthenticated, employee, logout } = useContext(AuthContext);
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentDay = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[currentTime.getDay()];
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Hamburger Menu Button */}
          <button
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors relative"
            onClick={() => setHamburgerMenuOpen(!hamburgerMenuOpen)}
          >
            {hamburgerMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Hamburger Menu Dropdown */}
          {hamburgerMenuOpen && (
            <div className="absolute top-16 left-4 bg-white rounded-lg shadow-lg border border-slate-200 py-2 w-64 z-50">
              <div className="px-4 py-2 border-b border-slate-200">
                <p className="text-sm font-medium text-slate-800">Menu Options</p>
              </div>
              <nav className="py-2">
                <Link
                  to="/notifications"
                  className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Bell className="w-5 h-5 mr-3 text-slate-500" />
                  Notifications
                </Link>
                <Link
                  to="/history"
                  className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <History className="w-5 h-5 mr-3 text-slate-500" />
                  Order History
                </Link>
                <Link
                  to="/payments"
                  className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <CreditCard className="w-5 h-5 mr-3 text-slate-500" />
                  Payment History
                </Link>
                <div className="border-t border-slate-200 my-2"></div>
                <Link
                  to="/settings"
                  className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-5 h-5 mr-3 text-slate-500" />
                  Settings
                </Link>
              </nav>
              <div className="border-t border-slate-200 pt-2 md:hidden">
                <div className="px-4 py-2">
                  <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{currentTime.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{getCurrentDay()}</span>
                    </div>
                  </div>
                  {!isAuthenticated && (
                    <div className="flex items-center space-x-3">
                      <Link
                        to="/sign_in"
                        className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 bg-transparent border border-slate-300 rounded-md hover:bg-slate-50 transition-colors text-center"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/sign_up"
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors text-center"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ChefHat className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Office Canteen</h1>
              <p className="text-sm text-slate-500">Fresh & Delicious</p>
            </div>
          </div>

          {/* Desktop Navigation */}
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

          {/* Right side - Time/Date and Auth buttons */}
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
      </div>
    </header>
  );
}

export default Navbar;