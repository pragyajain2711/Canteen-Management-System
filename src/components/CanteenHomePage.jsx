
import { useState, useEffect, useRef } from "react"
import { employeeMenuApi } from "./api"
import { ChevronLeft, ChevronRight, Utensils, ChefHat, Coffee, Sparkles, Star } from "lucide-react"

const topItems = [
  {
    id: 1,
    name: "Special Biryani",
    image:
      "https://images.unsplash.com/photo-1642821373181-696a54913e93?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnJpeWFuaXxlbnwwfHwwfHx8MA%3D%3D",
    price: "₹120",
    description: "Aromatic basmati rice with indian spices",
  },
  {
    id: 2,
    name: "Bhel",
    image:
      "https://images.unsplash.com/photo-1643892548578-d0a056dd2ee5?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmhlbHxlbnwwfHwwfHx8MA%3D%3D",
    price: "₹25",
    description: "puffed rice as its base, combined with a variety of vegies",
  },
  {
    id: 3,
    name: "Masala Dosa",
    image:
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9zYXxlbnwwfHwwfHx8MA%3D%3D",
    price: "₹80",
    description: "Crispy dosa with spiced potato filling",
  },
  {
    id: 4,
    name: "Chai",
    image:
      "https://images.unsplash.com/photo-1630748662359-40a2105640c7?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hhaXxlbnwwfHwwfHx8MA%3D%3D",
    price: "₹10",
    description: "Made with milk and chai patti powder",
  },
]

export default function CanteenHomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [todayMenuSlide, setTodayMenuSlide] = useState(0)
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = useState(false)
  const [todayMenu, setTodayMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [scrollY, setScrollY] = useState(0)

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
            name: item.name,
            price: item.price,
            available: item.isActive,
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

  const getCurrentDay = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[currentTime.getDay()]
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % topItems.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + topItems.length) % topItems.length)
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
              left:` ${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration:` ${3 + Math.random() * 2}s`,
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

          <p className="text-xl md:text-2xl text-blue-100 mb-8 animate-fade-in-up animation-delay-2000">
            Serving fresh, delicious meals every day
          </p>

          {/* Animated CTA Button */}
          <button className="group relative px-8 py-4 bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-bounce-in animation-delay-3000">
            <span className="relative z-10">Explore Menu</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur opacity-30 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
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

      {/* Top Items Slider with Flip Animation */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 animate-fade-in-up">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Top Items
              </span>
            </h3>
            <p className="text-xl text-slate-600 animate-fade-in-up animation-delay-500">
              Our most popular and delicious dishes
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full animate-scale-in animation-delay-1000"></div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {topItems.map((item, index) => (
                  <div key={item.id} className="w-full flex-shrink-0">
                    <div className="grid md:grid-cols-2 gap-0 h-[600px]">
                      {/* Image with Flip Animation */}
                      <div className="relative group h-full perspective-1000">
                        <div className="relative w-full h-full transform-style-preserve-3d transition-transform duration-700 group-hover:rotate-y-180">
                          {/* Front */}
                          <div className="absolute inset-0 backface-hidden">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-l-2xl"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-l-2xl"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                              <div className="flex items-center space-x-2">
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">Popular Choice</span>
                              </div>
                            </div>
                          </div>

                          {/* Back */}
                          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-blue-500 to-purple-600 rounded-l-2xl flex items-center justify-center">
                            <div className="text-center text-white p-8">
                              <ChefHat className="w-16 h-16 mx-auto mb-4 animate-bounce" />
                              <h4 className="text-2xl font-bold mb-2">Chef's Special</h4>
                              <p className="text-blue-100">Prepared with love and finest ingredients</p>
                              <div className="mt-4 flex justify-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 text-yellow-300 fill-current" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content with Enhanced Animation */}
                      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 p-12 flex flex-col justify-center rounded-r-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-orange-200 to-red-200 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>

                        <div className="relative z-10 space-y-6">
                          <h4 className="text-3xl md:text-4xl font-bold text-slate-800 animate-slide-in-right">
                            {item.name}
                          </h4>
                          <p className="text-lg text-slate-600 leading-relaxed animate-slide-in-right animation-delay-300">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between pt-6 animate-slide-in-right animation-delay-600">
                            <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {item.price}
                            </span>
                            <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                              <span className="relative z-10 flex items-center space-x-2">
                                <span>Order Now</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 p-4 rounded-full z-10 group"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors duration-300" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 p-4 rounded-full z-10 group"
            >
              <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors duration-300" />
            </button>

            {/* Enhanced Dots Indicator */}
            <div className="flex justify-center space-x-3 mt-8">
              {topItems.map((_, index) => (
                <button
                  key={index}
                  className={`relative transition-all duration-300 ${
                    index === currentSlide
                      ? "w-12 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      : "w-3 h-3 bg-slate-300 hover:bg-slate-400 rounded-full hover:scale-125"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                >
                  {index === currentSlide && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
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
                                        <button className="opacity-0 group-hover/item:opacity-100 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300">
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