import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "./AuthContext"
import { useTheme } from "../ThemeContext"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts"
import {
  Calendar,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Award,
  Clock,
  Target,
  ChefHat,
  Coffee,
  Utensils,
  Cookie,
  Wine,
  Package,
  ArrowUp,
  Activity,
  Users,
  Star,
  Eye as Preview // Added Preview icon
} from "lucide-react"
import api from "./api"

function Dashboard() {
  const navigate = useNavigate()
  const { employee } = useContext(AuthContext)
  const { theme } = useTheme()

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalSpent: 0,
    monthlySpent: 0,
    averageOrderValue: 0,
    favoriteCategory: "",
    mostOrderedItem: "",
    ordersThisMonth: 0,
    ordersThisWeek: 0,
  })

  const [chartData, setChartData] = useState({
    categoryData: [],
    monthlyData: [],
    weeklyData: [],
    topItems: [],
  })

  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("month") // month, quarter, year

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "breakfast":
        return <Coffee className="w-5 h-5 text-orange-600" />
      case "lunch":
        return <Utensils className="w-5 h-5 text-green-600" />
      case "thali":
        return <ChefHat className="w-5 h-5 text-purple-600" />
      case "snacks":
        return <Cookie className="w-5 h-5 text-yellow-600" />
      case "beverages":
        return <Wine className="w-5 h-5 text-blue-600" />
      default:
        return <Package className="w-5 h-5 text-gray-600" />
    }
  }

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch all orders for the employee
      const response = await api.get(`/api/orders/employee/${employee.employeeId}`)
      const orders = response.data || []

      // Process the data
      const processedData = processOrderData(orders)
      setDashboardData(processedData.summary)
      setChartData(processedData.charts)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Process order data for analytics
  const processOrderData = (orders) => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Filter orders by different periods
    const thisMonthOrders = orders.filter((order) => {
      const orderDate = new Date(order.expectedDeliveryDate)
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
    })

    const thisWeekOrders = orders.filter((order) => {
      const orderDate = new Date(order.expectedDeliveryDate)
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return orderDate >= weekAgo
    })

    // Calculate totals
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
    const monthlySpent = thisMonthOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
    const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0

    // Category analysis
    const categoryStats = {}
    orders.forEach((order) => {
      const category = order.category || "Other"
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, amount: 0 }
      }
      categoryStats[category].count += 1
      categoryStats[category].amount += order.totalPrice || 0
    })

    const categoryData = Object.entries(categoryStats).map(([category, stats]) => ({
      name: category,
      value: stats.count,
      amount: stats.amount,
    }))

    // Find favorite category and most ordered item
    const favoriteCategory =
      categoryData.reduce((max, cat) => (cat.value > (max.value || 0) ? cat : max), {}).name || "None"

    // Item analysis
    const itemStats = {}
    orders.forEach((order) => {
      const itemName = order.itemName || "Unknown"
      if (!itemStats[itemName]) {
        itemStats[itemName] = { count: 0, amount: 0 }
      }
      itemStats[itemName].count += order.quantity || 1
      itemStats[itemName].amount += order.totalPrice || 0
    })

    const topItems = Object.entries(itemStats)
      .map(([item, stats]) => ({
        name: item,
        orders: stats.count,
        amount: stats.amount,
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5)

    const mostOrderedItem = topItems[0]?.name || "None"

    // Monthly data for the last 6 months
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const monthOrders = orders.filter((order) => {
        const orderDate = new Date(order.expectedDeliveryDate)
        return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear()
      })

      monthlyData.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        orders: monthOrders.length,
        amount: monthOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
      })
    }

    // Weekly data for the last 4 weeks
    const weeklyData = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 + 7) * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)

      const weekOrders = orders.filter((order) => {
        const orderDate = new Date(order.expectedDeliveryDate)
        return orderDate >= weekStart && orderDate < weekEnd
      })

      weeklyData.push({
        week: `Week ${4 - i}`,
        orders: weekOrders.length,
        amount: weekOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
      })
    }

    return {
      summary: {
        totalOrders: orders.length,
        totalSpent,
        monthlySpent,
        averageOrderValue,
        favoriteCategory,
        mostOrderedItem,
        ordersThisMonth: thisMonthOrders.length,
        ordersThisWeek: thisWeekOrders.length,
      },
      charts: {
        categoryData,
        monthlyData,
        weeklyData,
        topItems,
      },
    }
  }

  useEffect(() => {
    if (employee?.employeeId) {
      fetchDashboardData()
    }
  }, [employee])

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  const containerStyle = {
    backgroundColor: theme === "light" ? "#f8f9fa" : "#1a1a1a",
    color: theme === "light" ? "#000" : "#fff",
    minHeight: "100vh",
  }

  const cardStyle = {
    backgroundColor: theme === "light" ? "white" : "#2d2d2d",
    color: theme === "light" ? "#000" : "#fff",
  }

  return (
    <div style={containerStyle} className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {employee.fullName}! 👋</h1>
              <p className="text-gray-600">Here's your food ordering analytics and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                style={cardStyle}
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading your analytics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="rounded-lg p-6 shadow-lg" style={cardStyle}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold">{dashboardData.totalOrders}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">{dashboardData.ordersThisMonth} this month</span>
                </div>
              </div>

              <div className="rounded-lg p-6 shadow-lg" style={cardStyle}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold">₹{dashboardData.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <IndianRupee className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">₹{dashboardData.monthlySpent.toFixed(2)} this month</span>
                </div>
              </div>

              <div className="rounded-lg p-6 shadow-lg" style={cardStyle}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold">₹{dashboardData.averageOrderValue.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Activity className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-500">Per order average</span>
                </div>
              </div>

              <div className="rounded-lg p-6 shadow-lg" style={cardStyle}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Favorite Category</p>
                    <p className="text-2xl font-bold">{dashboardData.favoriteCategory}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-500">Most ordered</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Category Distribution Pie Chart */}
              <div className="rounded-lg p-6 shadow-lg" style={cardStyle}>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Distribution by Category
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Spending Trend */}
              <div className="rounded-lg p-6 shadow-lg" style={cardStyle}>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Monthly Spending Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Top Ordered Items */}
              <div className="rounded-lg p-6 shadow-lg" style={cardStyle}>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Your Top 5 Favorite Items
                </h3>
                <div className="space-y-4">
                  {chartData.topItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      style={{ backgroundColor: theme === "light" ? "#f8f9fa" : "#3d3d3d" }}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{item.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">total spent</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Activity */}
              <div className="rounded-lg p-6 shadow-lg" style={cardStyle}>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Weekly Activity
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg p-6 shadow-lg" style={cardStyle}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate("/menu")}
                  className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <ChefHat className="w-5 h-5 mr-2" />
                  Browse Menu
                </button>
                <button
                  onClick={() => navigate("/cart")}
                  className="flex items-center justify-center p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  View Cart
                </button>
                <button
                  onClick={() => navigate("/orders")}
                  className="flex items-center justify-center p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Order History
                </button>
              </div>
            </div>

            {/* Employee Info Card */}
            <div className="mt-8 rounded-lg p-6 shadow-lg" style={cardStyle}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Your Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-semibold">{employee.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-semibold">{employee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Most Ordered Item</p>
                  <p className="font-semibold">{dashboardData.mostOrderedItem}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Orders This Week</p>
                  <p className="font-semibold">{dashboardData.ordersThisWeek}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard