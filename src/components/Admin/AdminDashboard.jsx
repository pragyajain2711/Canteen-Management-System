
import { useState, useEffect } from "react"
import {
  X,
  ClipboardList,
  Utensils,
  Users,
  BarChart3,
  ChevronDown,
  Calendar,
  BookOpen,
  Receipt,
  CreditCard,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  Filter,
  ChefHat,
  Package,
  IndianRupee,
} from "lucide-react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"

// Import your existing APIs
import { orderApi } from "../api"
import api from "../api"
import { menuApi } from "../api"
// Add any other API imports you need

// Enhanced Analytics Dashboard Component (integrated)
function AnalyticsDashboard({ orders = [], customers = [], menuItems = [], transactions = [] }) {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [activeChart, setActiveChart] = useState("overview")

  // Calculate comprehensive admin metrics from real data
  const totalCustomers = customers.length
  const activeCustomers = customers.filter((c) => c.isActive).length
  const totalMenuItems = menuItems.length
  const availableMenuItems = menuItems.filter((item) => item.availableStatus !== false).length

  const totalOrders = orders.length
  const completedOrders = orders.filter((o) => o.status === "DELIVERED").length
  const pendingOrders = orders.filter((o) => ["PENDING", "PREPARING", "READY"].includes(o.status)).length
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED").length

  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, order) => sum + (order.totalPrice || 0), 0)

  const totalTransactions = transactions.length
  const successfulTransactions = transactions.filter((t) => t.status === "SUCCESS" || t.status === "DELIVERED").length

  // Top selling items from real order data
  const itemSales = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((acc, order) => {
      const itemName = order.menuItemName || order.menuItem?.name || "Unknown Item"
      acc[itemName] = (acc[itemName] || 0) + (order.quantity || 1)
      return acc
    }, {})

  const topItems = Object.entries(itemSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Department wise orders for admin insights
  const departmentOrders = orders.reduce((acc, order) => {
    const dept = order.employeeDepartment || order.employee?.department || "Unknown"
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {})

  // Customer type distribution from real customer data
  const customerTypes = customers.reduce((acc, customer) => {
    const type = customer.customerType || "Employee"
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  // Menu category distribution from real menu data
  const menuCategories = menuItems.reduce((acc, item) => {
    const category = item.category || "Other"
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  // Payment method analysis from transactions
  const paymentMethods = transactions.reduce((acc, transaction) => {
    const method = transaction.paymentMethod || "Unknown"
    acc[method] = (acc[method] || 0) + 1
    return acc
  }, {})

  // Recent activity from orders
  const recentActivity = orders
    .sort((a, b) => new Date(b.orderTime || b.createdAt) - new Date(a.orderTime || a.createdAt))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Admin Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Admin Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminMetricCard
          title="Menu Items"
          value={totalMenuItems}
          change={availableMenuItems}
          changeLabel="available now"
          icon={ChefHat}
          color="blue"
          trend="up"
        />
        <AdminMetricCard
          title="Total Customers"
          value={totalCustomers}
          change={activeCustomers}
          changeLabel="active users"
          icon={Users}
          color="green"
          trend="up"
        />
        <AdminMetricCard
          title="Orders Processed"
          value={totalOrders}
          change={completedOrders}
          changeLabel="completed"
          icon={ShoppingCart}
          color="purple"
          trend="up"
        />
        <AdminMetricCard
          title="Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          change={Math.round(totalRevenue / (totalOrders || 1))}
          changeLabel="avg per order"
          icon={IndianRupee}
          color="orange"
          trend="up"
        />
      </div>

      {/* Admin Management Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setActiveChart("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === "overview"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Management Overview
          </button>
          <button
            onClick={() => setActiveChart("customers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === "customers"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users className="w-4 h-4" />
            Customer Management
          </button>
          <button
            onClick={() => setActiveChart("menu")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === "menu"
                ? "bg-purple-100 text-purple-700 border border-purple-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Utensils className="w-4 h-4" />
            Menu Management
          </button>
          <button
            onClick={() => setActiveChart("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === "orders"
                ? "bg-orange-100 text-orange-700 border border-orange-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Package className="w-4 h-4" />
            Order Analytics
          </button>
        </div>

        {/* Chart Content */}
        <div className="min-h-[400px]">
          {activeChart === "overview" && (
            <AdminOverview
              orders={orders}
              customers={customers}
              menuItems={menuItems}
              transactions={transactions}
              departmentOrders={departmentOrders}
              totalRevenue={totalRevenue}
              recentActivity={recentActivity}
            />
          )}
          {activeChart === "customers" && (
            <CustomerManagementAnalytics
              customers={customers}
              customerTypes={customerTypes}
              activeCustomers={activeCustomers}
              totalCustomers={totalCustomers}
            />
          )}
          {activeChart === "menu" && (
            <MenuManagementAnalytics
              menuItems={menuItems}
              topItems={topItems}
              orders={orders}
              totalMenuItems={totalMenuItems}
              availableMenuItems={availableMenuItems}
              menuCategories={menuCategories}
            />
          )}
          {activeChart === "orders" && (
            <OrderAnalytics
              orders={orders}
              departmentOrders={departmentOrders}
              completedOrders={completedOrders}
              pendingOrders={pendingOrders}
              cancelledOrders={cancelledOrders}
              totalRevenue={totalRevenue}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Admin Metric Card Component
function AdminMetricCard({ title, value, change, changeLabel, icon: Icon, color, trend }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend === "up" ? (
          <ArrowUp className="w-4 h-4 text-green-500" />
        ) : (
          <ArrowDown className="w-4 h-4 text-red-500" />
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-xs text-gray-500 mt-2">
          <span className="font-medium">{change}</span> {changeLabel}
        </p>
      </div>
    </div>
  )
}

// Admin Overview Component
function AdminOverview({ orders, customers, menuItems, transactions, departmentOrders, totalRevenue, recentActivity }) {
  const maxOrders = Math.max(...Object.values(departmentOrders), 1)

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Complete Management Overview</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Orders Distribution */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4">Orders by Department</h4>
          <div className="space-y-3">
            {Object.entries(departmentOrders).map(([dept, count]) => (
              <div key={dept} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{dept}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width:` ${(count / maxOrders) * 100}% `}}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4">Performance Summary</h4>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium">Total Revenue Generated</p>
              <p className="text-2xl font-bold text-green-700">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Active Menu Items</p>
              <p className="text-2xl font-bold text-blue-700">
                {menuItems.filter((item) => item.availableStatus !== false).length}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600 font-medium">Active Customers</p>
              <p className="text-2xl font-bold text-purple-700">{customers.filter((c) => c.isActive).length}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-600 font-medium">Successful Orders</p>
              <p className="text-2xl font-bold text-orange-700">
                {orders.filter((o) => o.status === "DELIVERED").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Recent Activity</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={activity.id || index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.status === "DELIVERED"
                      ? "bg-green-500"
                      : activity.status === "PENDING"
                        ? "bg-yellow-500"
                        : activity.status === "PREPARING"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Order #{activity.id} - {activity.menuItemName || activity.menuItem?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.employeeName || activity.employee?.name} •{" "}
                    {new Date(activity.orderTime || activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">₹{activity.totalPrice}</p>
                  <p
                    className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === "DELIVERED"
                        ? "bg-green-100 text-green-700"
                        : activity.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : activity.status === "PREPARING"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {activity.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Customer Management Analytics Component
function CustomerManagementAnalytics({ customers, customerTypes, activeCustomers, totalCustomers }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Customer Management Analytics</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Status Distribution */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4">Customer Status Distribution</h4>
          <div className="relative h-64 flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="10"
                  strokeDasharray={`${((totalCustomers - activeCustomers) / totalCustomers) * 251.2} 251.2`}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="10"
                  strokeDasharray={`${(activeCustomers / totalCustomers) * 251.2} 251.2`}
                  strokeDashoffset={`-${((totalCustomers - activeCustomers) / totalCustomers) * 251.2}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{activeCustomers}</p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Active ({activeCustomers})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Inactive ({totalCustomers - activeCustomers})</span>
            </div>
          </div>
        </div>

        {/* Customer Types Management */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4">Customer Types Management</h4>
          <div className="space-y-3">
            {Object.entries(customerTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium text-gray-900">{type}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                  <p className="text-xs text-gray-500">{Math.round((count / totalCustomers) * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Menu Management Analytics Component
function MenuManagementAnalytics({ menuItems, topItems, orders, totalMenuItems, availableMenuItems, menuCategories }) {
  const maxSales = Math.max(...topItems.map(([, sales]) => sales), 1)

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Menu Management Analytics</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Top Performing Menu Items</h4>
          <div className="space-y-3">
            {topItems.map(([item, sales], index) => (
              <div key={item} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width:` ${(sales / maxSales) * 100}% `}}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{sales}</p>
                  <p className="text-xs text-gray-500">units sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4">Menu Management Summary</h4>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Total Menu Items</p>
              <p className="text-2xl font-bold text-blue-700">{totalMenuItems}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium">Available Items</p>
              <p className="text-2xl font-bold text-green-700">{availableMenuItems}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-600 font-medium">Categories</p>
              <p className="text-2xl font-bold text-orange-700">{Object.keys(menuCategories).length}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600 font-medium">Availability Rate</p>
              <p className="text-2xl font-bold text-purple-700">
                {Math.round((availableMenuItems / totalMenuItems) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Categories Breakdown */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Menu Categories</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(menuCategories).map(([category, count]) => (
            <div key={category} className="p-4 bg-white border border-gray-200 rounded-lg text-center">
              <p className="text-sm text-gray-600 capitalize">{category}</p>
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">items</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Order Analytics Component
function OrderAnalytics({ orders, departmentOrders, completedOrders, pendingOrders, cancelledOrders, totalRevenue }) {
  const maxOrders = Math.max(...Object.values(departmentOrders), 1)
  const totalOrders = orders.length

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Order Analytics & Management</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Status Overview */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4">Order Status Overview</h4>
          <div className="relative h-64 flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="10"
                  strokeDasharray={`${(completedOrders / totalOrders) * 251.2} 251.2`}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="10"
                  strokeDasharray={`${(pendingOrders / totalOrders) * 251.2} 251.2`}
                  strokeDashoffset={`-${(completedOrders / totalOrders) * 251.2}`}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="10"
                  strokeDasharray={`${(cancelledOrders / totalOrders) * 251.2} 251.2`}
                  strokeDashoffset={`-${((completedOrders + pendingOrders) / totalOrders) * 251.2}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Completed ({completedOrders})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Pending ({pendingOrders})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Cancelled ({cancelledOrders})</span>
            </div>
          </div>
        </div>

        {/* Department Orders */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4">Orders by Department</h4>
          <div className="space-y-3">
            {Object.entries(departmentOrders).map(([dept, count]) => (
              <div key={dept} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{dept}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width:` ${(count / maxOrders) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 font-medium">Completion Rate</p>
          <p className="text-2xl font-bold text-green-700">{Math.round((completedOrders / totalOrders) * 100)}%</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Average Order Value</p>
          <p className="text-2xl font-bold text-blue-700">₹{Math.round(totalRevenue / totalOrders)}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600 font-medium">Pending Orders</p>
          <p className="text-2xl font-bold text-yellow-700">{pendingOrders}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-600 font-medium">Cancellation Rate</p>
          <p className="text-2xl font-bold text-red-700">{Math.round((cancelledOrders / totalOrders) * 100)}%</p>
        </div>
      </div>
    </div>
  )
}

// Data fetching hook that connects to your existing APIs
function useAnalyticsData() {
  const [data, setData] = useState({
    orders: [],
    customers: [],
    menuItems: [],
    transactions: [],
    loading: true,
  })

  // Fetch orders data using your existing orderApi
  const { data: ordersData } = useQuery({
    queryKey: ["allOrders"],
    queryFn: async () => {
      const response = await orderApi.getAllOrders()
      return response.data
    },
  })

  // Fetch customers data using your existing api
  const { data: customersData } = useQuery({
    queryKey: ["allCustomers"],
    queryFn: async () => {
      const response = await api.get("/api/admin/customers")
      return response.data.filter((customer) => customer.employeeId !== "superadmin")
    },
  })

  // Fetch menu items using your existing menuApi
  const { data: menuItemsData } = useQuery({
    queryKey: ["allMenuItems"],
    queryFn: async () => {
      const response = await menuApi.getItems({})
      return response.data
    },
  })

  // Fetch order history for transactions data
  const { data: transactionsData } = useQuery({
    queryKey: ["orderHistory"],
    queryFn: async () => {
      const endDate = new Date().toISOString().split("T")[0]
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      const response = await orderApi.getOrderHistory(startDate, endDate)
      return response.data
    },
  })

  useEffect(() => {
    if (ordersData && customersData && menuItemsData) {
      setData({
        orders: ordersData || [],
        customers: customersData || [],
        menuItems: menuItemsData || [],
        transactions: transactionsData || [],
        loading: false,
      })
    }
  }, [ordersData, customersData, menuItemsData, transactionsData])

  return data
}

// Main Admin Dashboard Component
export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [menuManagementOpen, setMenuManagementOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const analyticsData = useAnalyticsData()

  // Get active section from pathname
  const getActiveSection = () => {
    const path = location.pathname
    if (path.includes("/menu/items")) return "menu-items";
    if (path.includes("/menu/weekly")) return "weekly-menu";
    if (path.includes("/orders/history")) return "orders-history";
    if (path.includes("/orders")) return "orders";
    if (path.includes("/transactions")) return "transactions";
    if (path.includes("/payments")) return "payments";
    if (path.includes("/customers")) return "customers";
     if (path.includes('/fastordering')) return 'fast-ordering';
    return "dashboard"
  }

  const activeSection = getActiveSection()

  const handleNavigation = (path) => {
    navigate(path)
    setSidebarOpen(false)
  }

  const navItems = [
    {
      icon: <BarChart3 size={20} />,
      label: "Dashboard Overview",
      path: "/admin-dashboard",
      section: "dashboard",
    },
    {
      icon: <Utensils size={20} />,
      label: "Menu Management",
      path: "/admin-dashboard/menu/items",
      section: "menu-parent",
      hasSubmenu: true,
      submenu: [
        {
          icon: <BookOpen size={18} />,
          label: "Menu Items",
          path: "/admin-dashboard/menu/items",
          section: "menu-items",
        },
        {
          icon: <Calendar size={18} />,
          label: "Weekly Menu",
          path: "/admin-dashboard/menu/weekly",
          section: "weekly-menu",
        },
      ],
    },
    {
      icon: <ClipboardList size={20} />,
      label: "Order Management",
      path: "/admin-dashboard/orders",
      section: "orders",
    },
    {
      icon: <ClipboardList size={20} />,
      label: "Order History",
      path: "/admin-dashboard/orders/history",
      section: "orders-history",
    },
    {
      icon: <ClipboardList size={20} />,
      label: "Counter Ordering",
      path: "/admin-dashboard/fastordering",
      section: "fast-ordering",
      
        
    },
    {
      icon: <Receipt size={20} />,
      label: "Transaction Management",
      path: "/admin-dashboard/transactions",
      section: "transactions",
    },
    {
      icon: <CreditCard size={20} />,
      label: "Payment Management",
      path: "/admin-dashboard/payments",
      section: "payments",
    },
    {
      icon: <Users size={20} />,
      label: "Customer Management",
      path: "/admin-dashboard/customers",
      section: "customers",
    },
  ]

  const isMainDashboard = activeSection === "dashboard"

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed z-20 w-64 bg-blue-800 text-white transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-0`}
      >
        <div className="p-4 flex items-center justify-between border-b border-blue-700">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden hover:bg-blue-700 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item, index) => (
            <div key={index}>
              {item.hasSubmenu ? (
                <div>
                  <button
                    onClick={() => setMenuManagementOpen(!menuManagementOpen)}
                    className={`w-full flex items-center justify-between space-x-2 p-2 rounded transition-colors hover:bg-blue-700 ${
                      activeSection.startsWith("menu") ? "bg-blue-700 text-white" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${menuManagementOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {menuManagementOpen && (
                    <div className="mt-2 ml-4 space-y-1">
                      {item.submenu?.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => handleNavigation(subItem.path)}
                          className={`w-full flex items-center space-x-2 p-2 rounded transition-colors text-sm hover:bg-blue-700 ${
                            activeSection === subItem.section ? "bg-blue-600 text-white" : ""
                          }`}
                        >
                          {subItem.icon}
                          <span>{subItem.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-2 p-2 rounded transition-colors hover:bg-blue-700 ${
                    activeSection === item.section ? "bg-blue-700 text-white" : ""
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-0">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <button
            className="p-2 rounded-md hover:bg-gray-200 transition-colors lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <div
              className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
                sidebarOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            ></div>
            <div
              className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${sidebarOpen ? "opacity-0" : ""}`}
            ></div>
            <div
              className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
                sidebarOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            ></div>
          </button>

          <h2 className="text-xl font-semibold">
            {activeSection === "dashboard" && "Admin Dashboard Overview"}
            {activeSection === "menu-items" && "Menu Items Management"}
            {activeSection === "weekly-menu" && "Weekly Menu Management"}
            {activeSection === "orders" && "Order Management"}
            {activeSection === "orders-history" && "Order History"}
            {activeSection === "transactions" && "Transaction Management"}
            {activeSection === "payments" && "Payment Management"}
            {activeSection === "customers" && "Customer Management"}
          </h2>
          <div className="flex items-center space-x-4"></div>
        </header>

        {/* Content based on active section */}
        <div className={activeSection === "customers" ? "" : "p-6"}>
          {isMainDashboard ? <AdminDashboardOverview analyticsData={analyticsData} /> : <Outlet />}
        </div>
      </div>
    </div>
  )
}

// Admin Dashboard Overview Component
function AdminDashboardOverview({ analyticsData }) {
  const { orders, customers, menuItems, transactions, loading } = analyticsData

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading admin analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Admin Management Dashboard</h3>
        <p className="text-gray-600">Complete overview and analytics for all management operations</p>
      </div>

      {/* Enhanced Analytics Dashboard with Real Data */}
      <AnalyticsDashboard orders={orders} customers={customers} menuItems={menuItems} transactions={transactions} />
    </>
  )
}