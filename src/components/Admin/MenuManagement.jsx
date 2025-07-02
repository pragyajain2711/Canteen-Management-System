import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { menuApi } from "../api"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  History,
  CalendarIcon,
  Coffee,
  UtensilsCrossed,
  ChefHat,
  Cookie,
  Wine,
  TrendingUp,
  Clock,
  User,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const categories = [
  {
    value: "breakfast",
    label: "Breakfast",
    icon: Coffee,
    color: "bg-orange-100 text-orange-800",
    iconColor: "text-orange-600",
  },
  {
    value: "lunch",
    label: "Lunch",
    icon: UtensilsCrossed,
    color: "bg-green-100 text-green-800",
    iconColor: "text-green-600",
  },
  {
    value: "thali",
    label: "Thali",
    icon: ChefHat,
    color: "bg-purple-100 text-purple-800",
    iconColor: "text-purple-600",
  },
  {
    value: "snacks",
    label: "Snacks",
    icon: Cookie,
    color: "bg-yellow-100 text-yellow-800",
    iconColor: "text-yellow-600",
  },
  {
    value: "beverages",
    label: "Beverages",
    icon: Wine,
    color: "bg-blue-100 text-blue-800",
    iconColor: "text-blue-600",
  },
]

const units = ["piece", "plate", "bowl", "cup", "glass", "kg", "gram", "liter", "ml"]

const isItemActive = (startDate, endDate) => {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  return today >= startDay && today <= endDay
}

function Calendar({ selected, onSelect, onClose, minDate }) {
  const [viewDate, setViewDate] = useState(selected || new Date())

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const days = []

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    const isSelected = selected && date.getDate() === selected.getDate() && 
      date.getMonth() === selected.getMonth() && date.getFullYear() === selected.getFullYear()
    const isDisabled = minDate && date < minDate

    days.push(
      <button
        key={day}
        onClick={() => {
          if (!isDisabled) {
            onSelect(date)
            onClose()
          }
        }}
        className={`h-8 w-8 text-sm rounded-md flex items-center justify-center ${
          isDisabled ? "text-gray-400 cursor-not-allowed" : 
          isSelected ? "bg-blue-500 text-white hover:bg-blue-600" : 
          "text-gray-700 hover:bg-blue-100"
        }`}
        disabled={isDisabled}
      >
        {day}
      </button>
    )
  }

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  return (
    <div className="bg-white border rounded-lg shadow-lg p-4 absolute z-50 mt-1 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <select
            value={viewDate.getMonth()}
            onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), Number.parseInt(e.target.value), 1))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            {monthNames.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>
          <select
            value={viewDate.getFullYear()}
            onChange={(e) => setViewDate(new Date(Number.parseInt(e.target.value), viewDate.getMonth(), 1))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="h-6 flex items-center justify-center">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  )
}

function DateRangePicker({
  startDate,
  endDate,
  onStartDateSelect,
  onEndDateSelect,
  placeholder = "Select date range",
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectingStart, setSelectingStart] = useState(true)

  const handleDateSelect = (date) => {
    if (selectingStart) {
      onStartDateSelect(date)
      setSelectingStart(false)
    } else {
      onEndDateSelect(date)
      setIsOpen(false)
      setSelectingStart(true)
    }
  }

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`
    } else if (startDate) {
      return `${format(startDate, "MMM dd, yyyy")} - Select end date`
    }
    return placeholder
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal border border-gray-300 rounded-md p-2 flex items-center hover:border-blue-400"
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
        <span className={startDate || endDate ? "text-gray-900" : "text-gray-500"}>{formatDateRange()}</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="bg-white border rounded-lg shadow-lg p-4 absolute z-50 mt-1 min-w-[280px]">
            <div className="mb-3 text-sm text-gray-600">{selectingStart ? "Select start date" : "Select end date"}</div>
            <Calendar 
              selected={selectingStart ? startDate : endDate} 
              onSelect={handleDateSelect} 
              onClose={() => {}}
              minDate={selectingStart ? new Date() : startDate}
            />
            {startDate && (
              <div className="mt-3 pt-3 border-t">
                <button
                  onClick={() => {
                    onStartDateSelect(null)
                    onEndDateSelect(null)
                    setSelectingStart(true)
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear dates
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function DatePicker({ selected, onSelect, placeholder = "Select date", minDate }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal border border-gray-300 rounded-md p-2 flex items-center hover:border-blue-400"
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
        <span className={selected ? "text-gray-900" : "text-gray-500"}>
          {selected ? format(selected, "PPP") : placeholder}
        </span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <Calendar selected={selected} onSelect={onSelect} onClose={() => setIsOpen(false)} minDate={minDate} />
        </>
      )}
    </div>
  )
}

function Tooltip({ children, content }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap z-50">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}

export default function MenuManagement() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPriceHistoryDialogOpen, setIsPriceHistoryDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [priceHistorySearch, setPriceHistorySearch] = useState("")
  const [priceHistoryDateRange, setPriceHistoryDateRange] = useState({ from: undefined, to: undefined })
  const [originalPrice, setOriginalPrice] = useState(0)
const [priceHistoryCategory, setPriceHistoryCategory] = useState("");
//const [isSearchingPriceHistory, setIsSearchingPriceHistory] = useState(false);
const [showAllCategories, setShowAllCategories] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 1,
    unit: "",
    price: 0,
    startDate: new Date(),
    endDate: new Date(),
    categories: [],
    availableStatus: true,
  })

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ["menuItems"],
    queryFn: () => menuApi.getItems({}).then((res) => res.data),
  })

  const handleDeleteItem = async (id) => {
  if (window.confirm("Are you sure you want to delete this menu item?")) {
    await deleteMutation.mutateAsync(id)
  }
}
  /*const { data: priceHistoryResults = [], isLoading: isSearchingPriceHistory } = useQuery({
    queryKey: ["priceHistory", priceHistorySearch, priceHistoryDateRange],
    queryFn: async () => {
      if (!priceHistorySearch) return []

      const matchingItems = menuItems.filter((item) =>
        item.name.toLowerCase().includes(priceHistorySearch.toLowerCase())
      )

      const uniqueHistories = new Map()
      const processedItems = new Set()

      for (const item of matchingItems) {
        try {
          const historyResponse = await menuApi.getPriceHistory(item.name, {
            startDate: priceHistoryDateRange.from ? priceHistoryDateRange.from.toISOString() : undefined,
            endDate: priceHistoryDateRange.to ? priceHistoryDateRange.to.toISOString() : undefined,
          })

          historyResponse.data.forEach((history) => {
            const uniqueKey = `${item.menuId}-${history.price}`
            if (!uniqueHistories.has(uniqueKey)) {
              uniqueHistories.set(uniqueKey, {
                ...history,
                menuId: item.menuId,
                name: item.name,
                description: item.description,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit,
                createdAt: item.createdAt,
                createdBy: item.createdBy,
                updatedAt: history.updatedAt || item.updatedAt,
                updatedBy: history.updatedBy || item.updatedBy,
                isActive: isItemActive(history.startDate, history.endDate),
              })
            }
          })

          processedItems.add(item.menuId)
        } catch (error) {
          if (!processedItems.has(item.menuId)) {
            console.warn(`No price history found for ${item.name}, showing current item`)
            const uniqueKey = `${item.menuId}-${item.price}`
            if (!uniqueHistories.has(uniqueKey)) {
              uniqueHistories.set(uniqueKey, {
                menuId: item.menuId,
                name: item.name,
                description: item.description,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit,
                price: item.price,
                startDate: item.startDate,
                endDate: item.endDate,
                createdAt: item.createdAt,
                createdBy: item.createdBy,
                updatedAt: item.updatedAt,
                updatedBy: item.updatedBy,
                isActive: isItemActive(item.startDate, item.endDate),
              })
            }
            processedItems.add(item.menuId)
          }
        }
      }

      return Array.from(uniqueHistories.values()).sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    },
    enabled: !!priceHistorySearch && menuItems.length > 0,
  })
*/

// Replace the price history query with this simplified version
{/*const { data: priceHistoryResults = [], isLoading: isSearchingPriceHistory } = useQuery({
    queryKey: ["priceHistory", priceHistorySearch, priceHistoryDateRange],
    queryFn: async () => {
        if (!priceHistorySearch) return [];
        
        try {
            const response = await menuApi.getPriceHistory(priceHistorySearch, {
                startDate: priceHistoryDateRange.from ? priceHistoryDateRange.from.toISOString() : undefined,
                endDate: priceHistoryDateRange.to ? priceHistoryDateRange.to.toISOString() : undefined,
            });
            
            // Process the response to ensure no duplicates
            const uniqueEntries = [];
            const seenPrices = new Set();
            
            response.data.forEach((entry) => {
                // Use price + start date as unique key
                const entryKey = `${entry.price}-${new Date(entry.startDate).getTime()}`;
                
                if (!seenPrices.has(entryKey)) {
                    seenPrices.add(entryKey);
                    uniqueEntries.push({
                        ...entry,
                        isActive: isItemActive(entry.startDate, entry.endDate),
                    });
                }
            });
            
            return uniqueEntries;
        } catch (error) {
            console.error("Error fetching price history:", error);
            return [];
        }
    },
    enabled: !!priceHistorySearch,
});
*/}

const { 
  data: priceHistoryResults = [], 
  isLoading: isSearchingPriceHistory,
  error: priceHistoryError 
} = useQuery({
  queryKey: ["priceHistory", priceHistorySearch, showAllCategories ? null : priceHistoryCategory, priceHistoryDateRange],
  queryFn: async () => {
    if (!priceHistorySearch) return [];
    const response = await menuApi.getPriceHistory(
      priceHistorySearch, 
      showAllCategories ? undefined : priceHistoryCategory,
      priceHistoryDateRange
    );
    return response.data;
  },
  enabled: !!priceHistorySearch,
});

// In the price history query section:
/*const { 
  data: priceHistoryResults = [], 
  isLoading: isSearchingPriceHistory,
  error: priceHistoryError 
} = useQuery({
  queryKey: ["priceHistory", priceHistorySearch, priceHistoryCategory, priceHistoryDateRange],
  queryFn: async () => {
    if (!priceHistorySearch) return [];
    const response = await menuApi.getPriceHistory(
      priceHistorySearch, 
      priceHistoryCategory,
      priceHistoryDateRange
    );
    return response.data.map(item => ({
      ...item,
      isActive: isItemActive(item.startDate, item.endDate)
    }));
  },
  enabled: !!priceHistorySearch,
});*/


  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = searchTerm === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const itemIsActive = isItemActive(item.startDate, item.endDate)
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? itemIsActive : !itemIsActive)
    const matchesDate = !dateRange.from || !dateRange.to ||
      (new Date(item.startDate) <= dateRange.to && new Date(item.endDate) >= dateRange.from)

    return matchesSearch && matchesCategory && matchesStatus && matchesDate
  })

  const createMutation = useMutation({
    mutationFn: (data) => menuApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["menuItems"])
      setIsCreateDialogOpen(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => menuApi.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["menuItems"])
      setIsEditDialogOpen(false)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => menuApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["menuItems"])
    },
  })

  const handleCreateItem = async () => {
    await createMutation.mutateAsync({
      ...formData,
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString(),
    })
  }

  const getCategoryStyle = (categoryValue) => {
  const category = categories.find(cat => cat.value === categoryValue) || categories[0];
  return `${category.color} ${category.iconColor}`;
};
  const handleUpdateItem = async () => {
    if (!selectedItem) return

    const priceChanged = formData.price !== originalPrice
    const updateData = {
      ...formData,
      startDate: priceChanged ? new Date().toISOString() : formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString(),
    }

    await updateMutation.mutateAsync({
      id: selectedItem.id,
      data: updateData,
    })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      quantity: 1,
      unit: "",
      price: 0,
      startDate: new Date(),
      endDate: new Date(),
      categories: [],
      availableStatus: true,
    })
    setSelectedItem(null)
    setOriginalPrice(0)
  }

  const openEditDialog = (item) => {
    setSelectedItem(item)
    setOriginalPrice(item.price)
    setFormData({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      startDate: new Date(item.startDate),
      endDate: new Date(item.endDate),
      categories: [item.category],
      availableStatus: item.availableStatus,
    })
    setIsEditDialogOpen(true)
  }

/*const openPriceHistoryDialog = (item) => {
  setSelectedItem(item)
  setPriceHistorySearch(item.name)
  setIsPriceHistoryDialogOpen(true)
}*/

const openPriceHistoryDialog = (item) => {
  setSelectedItem(item);
  setPriceHistorySearch(item.name);
  setPriceHistoryCategory(item.category); // Add this state
  setIsPriceHistoryDialogOpen(true);
}

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm")
  }

  const formatFullDateTime = (dateString) => {
    return format(new Date(dateString), "EEEE, MMMM dd, yyyy 'at' HH:mm:ss")
  }

  const getCategoryData = (categoryValue) => {
    return categories.find((cat) => cat.value === categoryValue) || categories[0]
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
 <div className="bg-white rounded-lg border border-gray-200 p-6">
  {/* Filter Controls - All in one line */}
  <div className="flex flex-wrap items-end gap-4 mb-4">
    {/* Search Input */}
    <div className="flex-1 min-w-[200px]">
      <label htmlFor="price-search" className="text-sm font-medium text-gray-700 block mb-1">
        Search Items
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          id="price-search"
          placeholder="Enter item name..."
          value={priceHistorySearch}
          onChange={(e) => setPriceHistorySearch(e.target.value)}
          className="pl-10 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md w-full p-2"
        />
      </div>
    </div>

    {/* Category Filter */}
    {!showAllCategories && (
      <div className="flex-1 min-w-[180px]">
        <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
        <select
          value={priceHistoryCategory}
          onChange={(e) => setPriceHistoryCategory(e.target.value)}
          className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md p-2"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>
    )}

    {/* Date Range */}
    <div className="flex-1 min-w-[250px]">
      <label className="text-sm font-medium text-gray-700 block mb-1">Date Range</label>
      <DateRangePicker
        startDate={priceHistoryDateRange.from}
        endDate={priceHistoryDateRange.to}
        onStartDateSelect={(date) => setPriceHistoryDateRange({ ...priceHistoryDateRange, from: date })}
        onEndDateSelect={(date) => setPriceHistoryDateRange({ ...priceHistoryDateRange, to: date })}
        placeholder="Select date range"
      />
    </div>

    {/* Show All Toggle */}
    <div className="flex items-center gap-2 mb-1">
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={showAllCategories}
          onChange={() => setShowAllCategories(!showAllCategories)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Show all categories
      </label>
    </div>

    {/* Search Button */}
    <button
      disabled={isSearchingPriceHistory || !priceHistorySearch.trim()}
      className={`bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 h-[42px] flex items-center justify-center ${
        isSearchingPriceHistory || !priceHistorySearch.trim() ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isSearchingPriceHistory ? (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Searching...
        </>
      ) : (
        <>
          <Search className="w-4 h-4 mr-2" />
          Search
        </>
      )}
    </button>
  </div>

  {/* Status Message */}
  {priceHistoryResults.length > 0 && (
    <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
      <span>Showing {priceHistoryResults.length} results for "{priceHistorySearch}"</span>
      {!showAllCategories && priceHistoryCategory !== 'all' && (
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
          in {categories.find(c => c.value === priceHistoryCategory)?.label || 'selected'} category
        </span>
      )}
      {priceHistoryDateRange.from && priceHistoryDateRange.to && (
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
          from {format(priceHistoryDateRange.from, "MMM dd, yyyy")} to {format(priceHistoryDateRange.to, "MMM dd, yyyy")}
        </span>
      )}
    </div>
  )}

  {/* Results Table - remains the same */}
  {priceHistoryResults.length > 0 && (
    <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg">
<thead>
  <tr className="border-b bg-gray-50">
    <th className="text-left p-3 font-medium text-gray-700">Menu ID</th>
    <th className="text-left p-3 font-medium text-gray-700">Name</th>
    <th className="text-left p-3 font-medium text-gray-700">Price</th>
    <th className="text-left p-3 font-medium text-gray-700">Category</th>
    <th className="text-left p-3 font-medium text-gray-700">Valid Period</th>
    <th className="text-left p-3 font-medium text-gray-700">Status</th>
    <th className="text-left p-3 font-medium text-gray-700">Availability</th>
    <th className="text-left p-3 font-medium text-gray-700">Created</th>
  </tr>
</thead>
<tbody>
  {priceHistoryResults.map((history) => {
    const categoryData = getCategoryData(history.category);
    const CategoryIcon = categoryData.icon;
    
    return (
      <tr key={`${history.menuId}-${history.startDate}`} className="hover:bg-gray-50 border-b">
        <td className="p-3">
          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
            {history.menuId}
          </span>
        </td>
        <td className="p-3 font-medium">{history.name}</td>
        <td className="p-3">
          <span className="font-semibold text-green-700">₹{history.price}</span>
        </td>
        <td className="p-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${categoryData.color}`}>
            <CategoryIcon className={`w-3 h-3 ${categoryData.iconColor}`} />
            {categoryData.label}
          </span>
        </td>
        <td className="p-3">
          <Tooltip content={`${formatFullDateTime(history.startDate)} to ${formatFullDateTime(history.endDate)}`}>
            <div className="text-xs cursor-help">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="whitespace-nowrap">
                  {format(new Date(history.startDate), "MMM dd")} -{" "}
                  {format(new Date(history.endDate), "MMM dd")}
                </span>
              </span>
            </div>
          </Tooltip>
        </td>
        <td className="p-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            history.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            <div className={`w-2 h-2 rounded-full ${history.isActive ? "bg-green-500" : "bg-red-500"}`} />
            {history.isActive ? "Active" : "Expired"}
          </span>
        </td>
        <td className="p-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            history.availableStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            <div className={`w-2 h-2 rounded-full ${history.availableStatus ? "bg-green-500" : "bg-red-500"}`} />
            {history.availableStatus ? "Available" : "Sold Out"}
          </span>
        </td>
        <td className="p-3">
          <Tooltip content={`Created on ${formatFullDateTime(history.createdAt)} by ${history.createdBy}`}>
            <div className="text-xs cursor-help">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-500" />
                {format(new Date(history.createdAt), "MMM dd")}
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <User className="w-3 h-3" />
                {history.createdBy}
              </div>
            </div>
          </Tooltip>
        </td>
      </tr>
    );
  })}
</tbody>
                </table>
              
            </div>
          )}
        </div>
     

      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Search Menu Items</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md w-full p-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Category Filter</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md p-2"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md p-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Date Filter</label>
            <DatePicker
              selected={dateRange.from}
              onSelect={(date) => setDateRange({ ...dateRange, from: date })}
              placeholder="Select Date"
            />
          </div>
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl flex items-center gap-2 font-bold text-gray-900">
                <ChefHat className="w-5 h-5 text-gray-700" />
                Menu Items ({filteredItems.length})
              </h2>
              <p className="text-gray-600">Manage your menu items with price history and validity periods</p>
            </div>
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Menu Item
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="font-semibold p-4 text-left text-gray-700 min-w-[120px]">Menu ID</th>
                <th className="font-semibold p-4 text-left text-gray-700 min-w-[150px]">Name</th>
                <th className="font-semibold p-4 text-left text-gray-700 min-w-[200px]">Description</th>
                <th className="font-semibold p-4 text-left text-gray-700">Qty/Unit</th>
                <th className="font-semibold p-4 text-left text-gray-700">Price</th>
                <th className="font-semibold p-4 text-left text-gray-700">Category</th>
                <th className="font-semibold p-4 text-left text-gray-700">Valid Period</th>
                <th className="font-semibold p-4 text-left text-gray-700">Status</th>
                <th className="font-semibold p-4 text-left text-gray-700">Available</th>
                <th className="font-semibold p-4 text-left text-gray-700">Created</th>
                <th className="font-semibold p-4 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading menu items...
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Search className="w-8 h-8" />
                      No menu items found
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const categoryData = getCategoryData(item.category)
                  const CategoryIcon = categoryData.icon
                  const itemIsActive = isItemActive(item.startDate, item.endDate)

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 border-b">
                      <td className="font-mono text-xs bg-gray-50 p-4 min-w-[120px]">{item.menuId}</td>
                      <td className="font-medium p-4 min-w-[150px]">{item.name}</td>
                      <td className="p-4 min-w-[200px]">
                        <div className="max-w-xs">
                          <Tooltip content={item.description}>
                            <div className="truncate cursor-help">{item.description}</div>
                          </Tooltip>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{item.quantity}</span>
                          <span className="text-gray-500">{item.unit}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-green-700">₹{item.price}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${categoryData.color}`}
                        >
                          <CategoryIcon className={`w-3 h-3 ${categoryData.iconColor}`} />
                          {categoryData.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <Tooltip
                          content={`${formatFullDateTime(item.startDate)} to ${formatFullDateTime(item.endDate)}`}
                        >
                          <div className="text-xs cursor-help">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="whitespace-nowrap">
                                {format(new Date(item.startDate), "MMM dd")} -{" "}
                                {format(new Date(item.endDate), "MMM dd")}
                              </span>
                            </span>
                          </div>
                        </Tooltip>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            itemIsActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${itemIsActive ? "bg-green-500" : "bg-red-500"}`} />
                          {itemIsActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                     {/*} <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            item.availableStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${item.availableStatus ? "bg-green-500" : "bg-red-500"}`} />
                          {item.availableStatus ? "Available" : "Sold Out"}
                        </span>
                      </td>*/}

                      
{/*<td className="p-4">
  <span
    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
      item.availableStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }`}
  >
    <div className={`w-2 h-2 rounded-full ${item.availableStatus ? "bg-green-500" : "bg-red-500"}`} />
    {item.availableStatus ? "Available" : "Sold Out"}
  </span>
</td>*/}

<td className="p-4">
  <button
    onClick={async (e) => {
      e.stopPropagation(); // Prevent row click
      const newStatus = !item.availableStatus;
      try {
        await menuApi.updateAvailability(item.id, newStatus);
        queryClient.invalidateQueries(['menuItems']); // Refresh data
      } catch (error) {
        console.error("Failed to update availability:", error);
        // Add error notification here if needed
      }
    }}
    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs cursor-pointer ${
      item.availableStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }`}
  >
    <div className={`w-2 h-2 rounded-full ${
      item.availableStatus ? "bg-green-500" : "bg-red-500"
    }`} />
    {item.availableStatus ? "Available" : "Sold Out"}
  </button>
</td>

                      <td className="p-4">
                        <div className="text-xs">
                          <Tooltip content={`Created on ${formatFullDateTime(item.createdAt)} by ${item.createdBy}`}>
                            <div className="cursor-help">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-500" />
                                {format(new Date(item.createdAt), "MMM dd")}
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <User className="w-3 h-3" />
                                {item.createdBy}
                              </div>
                            </div>
                          </Tooltip>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Tooltip content="View Price History">
                            <button
                              onClick={() => openPriceHistoryDialog(item)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          </Tooltip>

                          <Tooltip content="Edit Item">
                            <button
                              onClick={() => openEditDialog(item)}
                              className="text-orange-600 hover:text-orange-800 hover:bg-orange-50 p-1 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </Tooltip>

                          <Tooltip content="Delete Item">
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Dialog */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Add New Menu Item
              </h3>
              <button onClick={() => setIsCreateDialogOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">Create a new menu item with pricing and validity period</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter item name"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Available Status</label>
                <div className="flex items-center">
                  <span className="mr-2 text-sm font-medium">
                    {formData.availableStatus ? 'Available' : 'Sold Out'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, availableStatus: !formData.availableStatus})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full 
                      ${formData.availableStatus ? 'bg-green-600' : 'bg-gray-200'}`}
                  >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition 
                      ${formData.availableStatus ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter item description"
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  placeholder="Enter quantity"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select unit</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (₹)
                </label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="Enter price"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Categories</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <div key={category.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category.value}`}
                        checked={formData.categories?.includes(category.value) || false}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...(formData.categories || []), category.value]
                            : (formData.categories || []).filter(c => c !== category.value);
                          setFormData({...formData, categories: newCategories});
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`category-${category.value}`} className="ml-2 text-sm text-gray-700">
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Valid From</label>
                <DatePicker
                  selected={formData.startDate}
                  onSelect={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (date < today) {
                      alert("Start date cannot be in the past");
                      return;
                    }
                    setFormData({...formData, startDate: date});
                  }}
                  minDate={new Date()}
                  placeholder="Pick a date"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Valid Until</label>
                <DatePicker
                  selected={formData.endDate}
                  onSelect={(date) => {
                    if (date < formData.startDate) {
                      alert("End date cannot be before start date");
                      return;
                    }
                    setFormData({...formData, endDate: date});
                  }}
                  minDate={formData.startDate}
                  placeholder="Pick a date"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsCreateDialogOpen(false)}
                className="border border-gray-300 rounded-md px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateItem}
                disabled={createMutation.isLoading || !formData.name || !formData.categories?.length}
                className={`bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 ${
                  createMutation.isLoading || !formData.name || !formData.categories?.length ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {createMutation.isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Item"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Edit className="w-5 h-5 text-orange-600" />
                Edit Menu Item
              </h3>
              <button onClick={() => setIsEditDialogOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">
                Update menu item details. Changing the price will automatically set the start date to today.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter item name"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

          {/*}    <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Available Status</label>
                <div className="flex items-center">
                  <span className="mr-2 text-sm font-medium">
                    {formData.availableStatus ? 'Available' : 'Sold Out'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, availableStatus: !formData.availableStatus})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full 
                      ${formData.availableStatus ? 'bg-green-600' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition 
                      ${formData.availableStatus ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>*/}


              <div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Available Status</label>
  <div className="flex items-center">
    <span className="mr-2 text-sm font-medium">
      {formData.availableStatus ? 'Available' : 'Sold Out'}
    </span>
    <button
      type="button"
      onClick={() => setFormData({...formData, availableStatus: !formData.availableStatus})}
      className={`relative inline-flex h-6 w-11 items-center rounded-full 
        ${formData.availableStatus ? 'bg-green-600' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition 
        ${formData.availableStatus ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  </div>
</div>

              <div className="md:col-span-2 space-y-2">
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter item description"
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  id="edit-quantity"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  placeholder="Enter quantity"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-unit" className="block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select unit</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">
                  Price (₹)
                </label>
                <input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => {
                    const newPrice = Number(e.target.value);
                    setFormData({
                      ...formData,
                      price: newPrice,
                      startDate: newPrice !== originalPrice ? new Date() : formData.startDate
                    });
                  }}
                  placeholder="Enter price"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Categories</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <div key={category.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`edit-category-${category.value}`}
                        checked={formData.categories?.includes(category.value) || false}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...(formData.categories || []), category.value]
                            : (formData.categories || []).filter(c => c !== category.value);
                          setFormData({...formData, categories: newCategories});
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`edit-category-${category.value}`} className="ml-2 text-sm text-gray-700">
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Valid From</label>
                <DatePicker
                  selected={formData.startDate}
                  onSelect={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (date < today) {
                      alert("Start date cannot be in the past for price changes");
                      return;
                    }
                    setFormData({...formData, startDate: date});
                  }}
                  minDate={formData.price !== originalPrice ? new Date() : null}
                  placeholder="Pick a date"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Valid Until</label>
                <DatePicker
                  selected={formData.endDate}
                  onSelect={(date) => {
                    if (date < formData.startDate) {
                      alert("End date cannot be before start date");
                      return;
                    }
                    setFormData({...formData, endDate: date});
                  }}
                  minDate={formData.startDate}
                  placeholder="Pick a date"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="border border-gray-300 rounded-md px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateItem}
                disabled={updateMutation.isLoading || !formData.name || !formData.categories?.length}
                className={`bg-orange-600 hover:bg-orange-700 text-white rounded-md px-4 py-2 ${
                  updateMutation.isLoading || !formData.name || !formData.categories?.length ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {updateMutation.isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Item"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price History Dialog */}
      {isPriceHistoryDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Price History - {selectedItem?.name}
              </h3>
              <button onClick={() => setIsPriceHistoryDialogOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">View the complete price history for this menu item</p>

            <div className="space-y-4">
              <table className="w-full">
               {/*} <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="font-semibold p-3 text-left">Price</th>
                    <th className="font-semibold p-3 text-left">Valid From</th>
                    <th className="font-semibold p-3 text-left">Valid Until</th>
                    <th className="font-semibold p-3 text-left">Status</th>
                    <th className="font-semibold p-3 text-left">Created By</th>
                    <th className="font-semibold p-3 text-left">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistoryResults
                    .filter((history) => history.name === selectedItem?.name)
                    .map((history, index) => (
                      <tr key={`${history.menuId}-${index}`} className="hover:bg-gray-50 border-b">
                        <td className="p-3">
                          <span className="font-semibold text-green-700">₹{history.price}</span>
                        </td>
                        <td className="p-3">
                          <Tooltip content={formatFullDateTime(history.startDate)}>
                            <div className="flex items-center gap-2 cursor-help">
                              <Clock className="w-4 h-4 text-gray-500" />
                              {formatDateTime(history.startDate)}
                            </div>
                          </Tooltip>
                        </td>
                        <td className="p-3">
                          <Tooltip content={formatFullDateTime(history.endDate)}>
                            <div className="flex items-center gap-2 cursor-help">
                              <Clock className="w-4 h-4 text-gray-500" />
                              {formatDateTime(history.endDate)}
                            </div>
                          </Tooltip>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              history.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${history.isActive ? "bg-green-500" : "bg-red-500"}`}
                            />
                            {history.isActive ? "Active" : "Expired"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-700 font-medium">{history.createdBy || "System"}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Tooltip content={formatFullDateTime(history.createdAt)}>
                            <div className="text-sm text-gray-600 cursor-help">
                              {formatDateTime(history.createdAt)}
                            </div>
                          </Tooltip>
                        </td>
                      </tr>
                    ))}
                </tbody>*/}

<thead>
    <tr className="border-b bg-gray-50">
        <th className="font-semibold p-3 text-left">Price</th>
            <th className="text-left p-3 font-medium text-gray-700">Category</th>
        <th className="font-semibold p-3 text-left">Valid From</th>
        <th className="font-semibold p-3 text-left">Valid Until</th>
        <th className="font-semibold p-3 text-left">Status</th>
        <th className="font-semibold p-3 text-left">Created By</th>
        <th className="font-semibold p-3 text-left">Created At</th>
    </tr>
</thead>
<tbody>
    {priceHistoryResults.map((history, index) => (
        <tr key={`${history.price}-${history.startDate}`} className="hover:bg-gray-50 border-b">
            <td className="p-3">
                <span className="font-semibold text-green-700">₹{history.price}</span>
            </td>
            <td>
        <span className={`badge ${getCategoryStyle(history.category)}`}>
          {history.category}
        </span>
      </td>
            <td className="p-3">
                <Tooltip content={formatFullDateTime(history.startDate)}>
                    <div className="flex items-center gap-2 cursor-help">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {formatDateTime(history.startDate)}
                    </div>
                </Tooltip>
            </td>
            <td className="p-3">
                <Tooltip content={formatFullDateTime(history.endDate)}>
                    <div className="flex items-center gap-2 cursor-help">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {formatDateTime(history.endDate)}
                    </div>
                </Tooltip>
            </td>
            <td className="p-3">
                <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        history.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                >
                    <div
                        className={`w-2 h-2 rounded-full ${history.isActive ? "bg-green-500" : "bg-red-500"}`}
                    />
                    {history.isActive ? "Active" : "Expired"}
                </span>
            </td>
            <td className="p-3">
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">{history.createdBy || "System"}</span>
                </div>
            </td>
            <td className="p-3">
                <Tooltip content={formatFullDateTime(history.createdAt)}>
                    <div className="text-sm text-gray-600 cursor-help">
                        {formatDateTime(history.createdAt)}
                    </div>
                </Tooltip>
            </td>
        </tr>
    ))}
</tbody>

              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsPriceHistoryDialogOpen(false)}
                className="border border-gray-300 rounded-md px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}