import { useState, useEffect, useRef } from "react";
import { employeeMenuApi } from "./api";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Utensils,
  Calendar,
  ChefHat,
  Coffee,
  Menu,
  X,
  Settings,
  Bell,
  History,
  CreditCard,
  Link,
} from "lucide-react";

const topItems = [
  {
    id: 1,
    name: "Special Biryani",
    image: "https://images.unsplash.com/photo-1642821373181-696a54913e93?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnJpeWFuaXxlbnwwfHwwfHx8MA%3D%3D",
    price: "₹120",
    description: "Aromatic basmati rice with indian spices",
  },
  {
    id: 2,
    name: "Bhel",
    image: "https://images.unsplash.com/photo-1643892548578-d0a056dd2ee5?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmhlbHxlbnwwfHwwfHx8MA%3D%3D",
    price: "₹25",
    description: "puffed rice as its base, combined with a variety of vegies",
  },
  {
    id: 3,
    name: "Masala Dosa",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9zYXxlbnwwfHwwfHx8MA%3D%3D",
    price: "₹80",
    description: "Crispy dosa with spiced potato filling",
  },
  {
    id: 4,
    name: "Chai",
    image: "https://images.unsplash.com/photo-1630748662359-40a2105640c7?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hhaXxlbnwwfHwwfHx8MA%3D%3D",
    price: "₹10",
    description: "Made with milk and chai patti powder",
  },
];

export default function CanteenHomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [todayMenuSlide, setTodayMenuSlide] = useState(0);
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = useState(false);
  const [todayMenu, setTodayMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track the current day to prevent unnecessary refetches
  const currentDayRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchTodayMenu = async () => {
      try {
        const days = [
          "SUNDAY",
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY"
        ];
        const today = days[new Date().getDay()];

        // Only fetch if day has changed
        if (today === currentDayRef.current) return;

        currentDayRef.current = today;
        setLoading(true);
        setError(null);

        const response = await employeeMenuApi.getWeeklyMenu(today);

        // Transform API response
        const menuItems = response.data.map((item) => item.menuItem);

        // Group by category
        const groupedByCategory = menuItems.reduce((acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = [];
          }
          acc[item.category].push({
            name: item.name,
            price: item.price,
            available: item.isActive,
          });
          return acc;
        }, {});

        // Convert to expected format
        const formattedMenu = Object.keys(groupedByCategory).map(
          (category) => ({
            category:
              category.charAt(0).toUpperCase() +
              category.slice(1).toLowerCase(),
            icon: getCategoryIcon(category),
            items: groupedByCategory[category],
          })
        );

        setTodayMenu(formattedMenu);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load today's menu");
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayMenu();
  }, []);

  const getCurrentDay = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[currentTime.getDay()];
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % topItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + topItems.length) % topItems.length);
  };

  const nextTodayMenuSlide = () => {
    setTodayMenuSlide((prev) => (prev + 1) % Math.ceil(todayMenu.length / 2));
  };

  const prevTodayMenuSlide = () => {
    setTodayMenuSlide(
      (prev) =>
        (prev - 1 + Math.ceil(todayMenu.length / 2)) %
        Math.ceil(todayMenu.length / 2)
    );
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "breakfast":
        return <Coffee className="w-5 h-5" />;
      case "lunch":
      case "thali":
        return <Utensils className="w-5 h-5" />;
      case "snacks":
      case "beverages":
      default:
        return <Coffee className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to Office Canteen</h2>
          <p className="text-xl text-blue-100 mb-8">
            Serving fresh, delicious meals every day
          </p>
        </div>
      </section>
{/* Top Items Slider */}
<section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <h3 className="text-3xl font-bold text-slate-800 mb-4">Top Items</h3>
      <p className="text-slate-600">Our most popular and delicious dishes</p>
    </div>

    <div className="relative">
      <div className="overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%) ` }}
        >
          {topItems.map((item) => (
            <div key={item.id} className="w-full flex-shrink-0">
              <div className="grid md:grid-cols-2 gap-0 h-[500px]"> {/* Changed gap and added fixed height */}
                <div className="relative group h-full">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-l-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-l-xl"></div>
                </div>
                <div className="space-y-4 bg-gradient-to-r from-slate-50 to-blue-50 p-8 flex flex-col justify-center rounded-r-xl">
                  <h4 className="text-2xl font-bold text-slate-800">
                    {item.name}
                  </h4>
                  <p className="text-slate-600">{item.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-3xl font-bold text-blue-600">
                      {item.price}
                    </span>
                    <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-slate-50 shadow-lg hover:shadow-xl hover:-translate-y-1/2 hover:scale-110 transition-all duration-300 p-2 rounded-full z-10"
      >
        <ChevronLeft className="w-6 h-6 text-slate-600" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-slate-50 shadow-lg hover:shadow-xl hover:-translate-y-1/2 hover:scale-110 transition-all duration-300 p-2 rounded-full z-10"
      >
        <ChevronRight className="w-6 h-6 text-slate-600" />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center space-x-2 mt-6">
        {topItems.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              index === currentSlide ? "bg-blue-600" : "bg-slate-300"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  </div>
</section>

      {/* Daily Menu */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">
              {"Today's Menu - " + getCurrentDay()}
            </h3>
            <p className="text-slate-600">Fresh items available today</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
              <div className="flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-red-600 mr-2"
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
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg
                className="animate-spin h-8 w-8 text-blue-600 mr-3"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-gray-700">Loading today's menu...</span>
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-hidden rounded-xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${todayMenuSlide * 50}%)` }}
                >
                  {Array.from(
                    { length: Math.ceil(todayMenu.length / 2) },
                    (_, slideIndex) => (
                      <div
                        key={slideIndex}
                        className="w-full flex-shrink-0 px-4"
                      >
                        <div className="grid md:grid-cols-2 gap-8">
                          {todayMenu
                            .slice(slideIndex * 2, slideIndex * 2 + 2)
                            .map((category, index) => (
                              <div
                                key={index}
                                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                              >
                                <div className="bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-4 rounded-t-lg">
                                  <div className="flex items-center justify-center space-x-2 text-slate-800">
                                    {category.icon}
                                    <h3 className="text-lg font-semibold">
                                      {category.category}
                                    </h3>
                                  </div>
                                </div>
                                <div className="p-6">
                                  <div className="space-y-4">
                                    {category.items.map((item, itemIndex) => (
                                      <div
                                        key={itemIndex}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                                      >
                                        <div className="flex-1">
                                          <h5 className="font-medium text-slate-800">
                                            {item.name}
                                          </h5>
                                          <p className="text-blue-600 font-semibold">
                                            ₹{item.price}
                                          </p>
                                        </div>
<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
  item.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
}`}>
  {item.available ? "Available" : "Sold Out"}
</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Navigation Arrows */}
              {todayMenu.length > 2 && (
                <>
                  <button
                    onClick={prevTodayMenuSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-slate-50 shadow-lg hover:shadow-xl hover:-translate-y-1/2 hover:scale-110 transition-all duration-300 p-2 rounded-full z-10"
                  >
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                  </button>
                  <button
                    onClick={nextTodayMenuSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-slate-50 shadow-lg hover:shadow-xl hover:-translate-y-1/2 hover:scale-110 transition-all duration-300 p-2 rounded-full z-10"
                  >
                    <ChevronRight className="w-6 h-6 text-slate-600" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {todayMenu.length > 2 && (
                <div className="flex justify-center space-x-2 mt-6">
                  {Array.from(
                    { length: Math.ceil(todayMenu.length / 2) },
                    (_, index) => (
                      <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                          index === todayMenuSlide
                            ? "bg-blue-600"
                            : "bg-slate-300"
                        }`}
                        onClick={() => setTodayMenuSlide(index)}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}