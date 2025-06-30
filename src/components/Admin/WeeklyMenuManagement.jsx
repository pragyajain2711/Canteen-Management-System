import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus,
  CalendarIcon,
  ChefHat,
  Coffee,
  UtensilsCrossed,
  Cookie,
  Wine,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import { format, startOfWeek, endOfWeek, addDays } from "date-fns"
import { weeklyMenuApi, menuApi } from "../api"

// Constants
const daysOfWeek = [
  { value: "MONDAY", label: "Monday", short: "Mon" },
  { value: "TUESDAY", label: "Tuesday", short: "Tue" },
  { value: "WEDNESDAY", label: "Wednesday", short: "Wed" },
  { value: "THURSDAY", label: "Thursday", short: "Thu" },
  { value: "FRIDAY", label: "Friday", short: "Fri" },
  { value: "SATURDAY", label: "Saturday", short: "Sat" },
  { value: "SUNDAY", label: "Sunday", short: "Sun" },
]

const mealCategories = [
  {
    value: "breakfast",
    label: "Breakfast",
    icon: Coffee,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    iconColor: "text-orange-600",
  },
  {
    value: "lunch",
    label: "Lunch",
    icon: UtensilsCrossed,
    color: "bg-green-100 text-green-700 border-green-200",
    iconColor: "text-green-600",
  },
  {
    value: "thali",
    label: "Thali",
    icon: ChefHat,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    iconColor: "text-purple-600",
  },
  {
    value: "snacks",
    label: "Snacks",
    icon: Cookie,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    iconColor: "text-yellow-600",
  },
  {
    value: "beverages",
    label: "Beverages",
    icon: Wine,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    iconColor: "text-blue-600",
  },
]

export default  function WeeklyMenuManagement() {
  const queryClient = useQueryClient()
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState("")
  const [selectedMealCategory, setSelectedMealCategory] = useState("")
  const [selectedMenuItem, setSelectedMenuItem] = useState("")
  const [viewMode, setViewMode] = useState("double")
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [selectedMealFilter, setSelectedMealFilter] = useState("all")

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 })

  // Fetch weekly menus
  const { data: weeklyMenus = [], isLoading } = useQuery({
    queryKey: ["weeklyMenus", weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: () => 
      weeklyMenuApi.getByDateRange(weekStart.toISOString(), weekEnd.toISOString())
        .then(res => res.data),
  })

  const filteredMenuItems =
    selectedMealFilter === "all" ? weeklyMenus : weeklyMenus.filter((item) => item.mealCategory === selectedMealFilter)

  

  // Fetch available menu items
 /* const { data: availableMenuItems = [] } = useQuery({
    queryKey: ["availableMenuItems", selectedMealCategory],
    queryFn: () => 
      menuApi.getActiveItems(new Date().toISOString())
        .then(res => res.data),
  })*/
 const { data: availableMenuItems = [] } = useQuery({
  queryKey: ["availableMenuItems", selectedMealCategory],
  queryFn: () => 
    menuApi.getActiveItems(new Date().toISOString())
      .then(res => res.data.filter(item => 
        !selectedMealCategory || item.category === selectedMealCategory
      )),
});

  // Mutations
  const addMutation = useMutation({
    mutationFn: (data) => weeklyMenuApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weeklyMenus"] })
      setIsAddDialogOpen(false)
      resetAddForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => weeklyMenuApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weeklyMenus"] })
    },
  })

  console.log("Selected Menu Item:", selectedMenuItem);

  const handleAddWeeklyMenuItem = async () => {
    await addMutation.mutateAsync({
      weekStartDate: weekStart.toISOString(),
      weekEndDate: weekEnd.toISOString(),
      dayOfWeek: selectedDay,
      mealCategory: selectedMealCategory,
      //menuItemId: selectedMenuItem,
      menuItem: {  // Send as object with menuId
      menuId: selectedMenuItem.menuId  // Assuming selectedMenuItem is the full object
    }
    })
  }

  const handleDeleteWeeklyMenuItem = async (id) => {
    await deleteMutation.mutateAsync(id)
  }

  const resetAddForm = () => {
    setSelectedDay("")
    setSelectedMealCategory("")
    setSelectedMenuItem("")
  }

  const getMenuItemsForDayAndCategory = (day, category) => {
    return weeklyMenus.filter((item) => item.dayOfWeek === day && item.mealCategory === category)
  }

  const getVisibleDays = () => {
    if (viewMode === "single") {
      return [daysOfWeek[currentDayIndex]]
    } else {
      const startIndex = Math.floor(currentDayIndex / 2) * 2
      return daysOfWeek.slice(startIndex, startIndex + 2)
    }
  }

  const canNavigatePrev = () => {
    return currentDayIndex > 0
  }

  const canNavigateNext = () => {
    if (viewMode === "single") {
      return currentDayIndex < daysOfWeek.length - 1
    } else {
      return currentDayIndex < daysOfWeek.length - 2
    }
  }

  const navigatePrev = () => {
    if (canNavigatePrev()) {
      setCurrentDayIndex((prev) => (viewMode === "single" ? prev - 1 : Math.max(0, prev - 2)))
    }
  }

  const navigateNext = () => {
    if (canNavigateNext()) {
      setCurrentDayIndex((prev) => (viewMode === "single" ? prev + 1 : Math.min(daysOfWeek.length - 2, prev + 2)))
    }
  }

 /* const filteredMenuItems =
    selectedMealFilter === "all" ? weeklyMenus : weeklyMenus.filter((item) => item.mealCategory === selectedMealFilter)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading weekly menu...</p>
        </div>
      </div>
    )
  }*/

    if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading weekly menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weekly Menu Planning</h1>
            <p className="text-gray-600 mt-1">
              Week of {format(weekStart, "MMM dd")} - {format(weekEnd, "MMM dd, yyyy")}
            </p>
          </div>

          <div className="flex gap-3">
            {/* Calendar Button */}
            <div className="relative">
              <button
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <CalendarIcon className="w-4 h-4" />
                Select Week
              </button>

              {isCalendarOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                  <input
                    type="date"
                    value={format(selectedWeek, "yyyy-MM-dd")}
                    onChange={(e) => {
                      setSelectedWeek(new Date(e.target.value))
                      setIsCalendarOpen(false)
                    }}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Add Menu Item Button */}
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4" />
              Add Menu Item
            </button>
          </div>
        </div>

        {/* Meal Category Filter Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedMealFilter("all")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMealFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Categories
            </button>
            {mealCategories.map((category) => {
              const CategoryIcon = category.icon
              const itemCount = filteredMenuItems.filter((item) => item.mealCategory === category.value).length

              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedMealFilter(category.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMealFilter === category.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <CategoryIcon className="w-4 h-4" />
                  {category.label}
                  {itemCount > 0 && (
                    <span className="bg-white text-gray-700 text-xs px-2 py-1 rounded-full">{itemCount}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Day Navigation Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("single")}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    viewMode === "single"
                      ? "bg-blue-50 border border-blue-200 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Single Day
                </button>
                <button
                  onClick={() => setViewMode("double")}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    viewMode === "double"
                      ? "bg-blue-50 border border-blue-200 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Two Days
                </button>
              </div>

              <div className="h-6 w-px bg-gray-300" />

              <div className="flex items-center gap-2">
                <button
                  onClick={navigatePrev}
                  disabled={!canNavigatePrev()}
                  className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 min-w-[200px] justify-center">
                  {getVisibleDays().map((day, index) => {
                    const dayDate = addDays(
                      weekStart,
                      daysOfWeek.findIndex((d) => d.value === day.value),
                    )
                    const dayMenuCount = weeklyMenus.filter((item) => item.dayOfWeek === day.value).length

                    return (
                      <div key={day.value} className="flex items-center">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{day.short}</div>
                          <div className="text-xs text-gray-500">{format(dayDate, "dd")}</div>
                          {dayMenuCount > 0 && <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>}
                        </div>
                        {index < getVisibleDays().length - 1 && <div className="mx-4 text-gray-300">|</div>}
                      </div>
                    )
                  })}
                </div>

                <button
                  onClick={navigateNext}
                  disabled={!canNavigateNext()}
                  className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              {
                weeklyMenus.filter(
                  (item) =>
                    getVisibleDays().some((day) => day.value === item.dayOfWeek) &&
                    (selectedMealFilter === "all" || item.mealCategory === selectedMealFilter),
                ).length
              }{" "}
              items scheduled
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Menu Grid */}
      <div className={`grid gap-6 ${viewMode === "single" ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
        {getVisibleDays().map((day) => {
          const dayDate = addDays(
            weekStart,
            daysOfWeek.findIndex((d) => d.value === day.value),
          )
          const visibleCategories =
            selectedMealFilter === "all"
              ? mealCategories
              : mealCategories.filter((cat) => cat.value === selectedMealFilter)

          return (
            <div key={day.value} className="bg-white border border-gray-200 rounded-lg shadow-lg min-h-[600px]">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-t-lg border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">{day.label}</h3>
                  <span className="bg-white px-3 py-1 rounded-full text-sm border border-gray-200">
                    {format(dayDate, "MMM dd")}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {weeklyMenus.filter((item) => item.dayOfWeek === day.value).length} items scheduled
                </p>
              </div>

              <div className="p-6 space-y-4">
                {visibleCategories.map((category) => {
                  const CategoryIcon = category.icon
                  const menuItems = getMenuItemsForDayAndCategory(day.value, category.value)

                  return (
                    <div key={category.value} className="space-y-3">
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 border-dashed ${category.color}`}
                      >
                        <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white shadow-sm">
                          <CategoryIcon className={`w-5 h-5 ${category.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{category.label}</div>
                          <div className="text-sm opacity-75">
                            {menuItems.length} item{menuItems.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>

{/* Add button moved here */}
        <button
          onClick={() => {
            setSelectedDay(day.value);
            setSelectedMealCategory(category.value);
            setIsAddDialogOpen(true);
          }}
          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
          title={`Add ${category.label} item`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>



                      <div className="space-y-2 min-h-[100px] bg-gray-50 rounded-lg p-4">
                        {menuItems.length === 0 ? (
                          <div className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-white">
                            <div className="text-gray-500">No items assigned</div>
                            <div className="text-xs mt-1 text-gray-400">Click "Add Menu Item" to assign items</div>
                          </div>
                        ) : (
                          menuItems.map((item) => (
                            <div
                              key={item.id}
                              className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-all duration-200 hover:border-blue-200"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-900 truncate">{item.menuItem.name}</div>
                                  <div className="text-sm text-gray-600 truncate mt-1">{item.menuItem.description}</div>
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                                      ₹{item.menuItem.price}
                                    </span>
                                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border">
                                      {item.menuItem.quantity} {item.menuItem.unit}
                                    </span>
                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                                      {item.menuItem.category}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteWeeklyMenuItem(item.id)}
                                  className="ml-2 h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {mealCategories.map((category) => {
          const CategoryIcon = category.icon
          const totalItems = weeklyMenus.filter((item) => item.mealCategory === category.value).length
          const totalRevenue = weeklyMenus
            .filter((item) => item.mealCategory === category.value)
            .reduce((sum, item) => sum + item.menuItem.price, 0)

          return (
            <div
              key={category.value}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${category.color}`}>
                  <CategoryIcon className={`w-6 h-6 ${category.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">{category.label}</div>
                  <div className="text-sm text-gray-600">{totalItems} items</div>
                  <div className="text-xs text-gray-500 font-medium">₹{totalRevenue.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Menu Item Modal */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Menu Item to Weekly Plan</h2>
              <button onClick={() => setIsAddDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              Assign a menu item to a specific day and meal category for this week.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Category</label>
                <select
                  value={selectedMealCategory}
                  onChange={(e) => setSelectedMealCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select meal category</option>
                  {mealCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Menu Item</label>
             {/*  <select
                  value={selectedMenuItem}
                  onChange={(e) => setSelectedMenuItem(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select menu item</option>
                  {availableMenuItems
                    .filter((item) => !selectedMealCategory || item.category === selectedMealCategory)
                    .map((item) => (
                      <option key={item.id.toString()} value={item.id.toString()}>
                        {item.name} - ₹{item.price}
                      </option>
                    ))}
                </select>

                <select
  value={selectedMenuItem}
  onChange={(e) => setSelectedMenuItem(e.target.value)}
  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <option value="">Select menu item</option>
  {availableMenuItems.map((item) => (
    <option key={item.id} value={item.id}>
      {item.name} - ₹{item.price}
    </option>
  ))}
</select>*/}
{/*onChange={(e) => setSelectedMenuItem(e.target.value)}
<select
    value={selectedMenuItem}
    onChange={(e) => setSelectedMenuItem(e.target.value)}
    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    disabled={ !selectedMealCategory}
  >
    <option value="">Select menu item</option>
    {availableMenuItems.map((item) => (
      <option key={item.id} value={item.id}>
        {item.name} - ₹{item.price}
      </option>
    ))}
  </select>*/}

  <select
  value={selectedMenuItem?.menuId || ""}
  onChange={(e) => {
    const id = e.target.value;
    const item = availableMenuItems.find(i => i.menuId == id);
    setSelectedMenuItem(item);
  }}
>
  <option value="">Select menu item</option>
  {availableMenuItems.map(item => (
    <option key={item.menuId} value={item.menuId}>
      {item.name} - ₹{item.price}
    </option>
  ))}
</select>

   {/* Optional debug/info message */}
  { availableMenuItems.length === 0 && selectedMealCategory && (
    <p className="text-sm text-red-500 mt-2">
      No items available for "{selectedMealCategory}"
    </p>
  )}



              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWeeklyMenuItem}
                disabled={!selectedDay || !selectedMealCategory || !selectedMenuItem}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}