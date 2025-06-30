import { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  X,
  Users,
  Briefcase,
  UserCheck,
  UserX,
  Phone,
  Building2,
  Badge,
  Activity,
  ChevronUp,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { DateRange } from 'react-date-range';
import { format, subDays, subMonths, subYears, formatDistanceToNow } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import api from "../api";

export default function CustomerManagement() {
  // State declarations
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    active: "all",
    customerType: "all",
    dateRange: "all",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
 
  const handleDateRangeChange = (rangeType) => {
  setFilters(prev => ({ ...prev, dateRange: rangeType }));
  
  if (rangeType === 'custom') {
    setShowDatePicker(true);
  } else {
    fetchCustomers(searchTerm, filters, { rangeType });
  }
};

const handleCustomDateApply = () => {
  setShowDatePicker(false);
  if (dateRange[0].startDate && dateRange[0].endDate) {
    fetchCustomers(searchTerm, filters, { 
      rangeType: 'custom',
      startDate: dateRange[0].startDate,
      endDate: dateRange[0].endDate
    });
  }
};
/*
const handleCustomDateApply = () => {
  setShowDatePicker(false);
  if (dateRange[0].startDate && dateRange[0].endDate) {
    fetchCustomersByDateRange(
      'custom', 
      dateRange[0].startDate, 
      dateRange[0].endDate
    );
  }
};*/
  // Date range state
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  const dateRanges = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
    { value: "custom", label: "Custom Range" },
  ];

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    department: "",
    mobileNumber: "",
    customerType: "Employee",
    isActive: true,
    password: "",
    confirmPassword: "",
  });

  const departments = ["Finance", "LPG", "IS", "HR", "Sales", "Reception", "Engineer", "Law"];
  const customerTypes = ["Intern", "Employee", "Trainee", "Helper"];

  useEffect(() => {
    fetchCustomers();
  }, []);

  

 /* const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/customers");
      const filteredCustomers = response.data.filter(
        (customer) => customer.employeeId !== "superadmin"
      );

      setCustomers(filteredCustomers);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setError("Failed to fetch customers");
      setLoading(false);
    }
  };*/

  const fetchCustomers = async (searchTerm = '', filters = {}, dateRangeParams = {}) => {
  try {
    setLoading(true);
    const params = new URLSearchParams();
    
    // Add search term if provided
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    // Add status filter if not 'all'
    if (filters.active && filters.active !== 'all') {
      params.append('isActive', filters.active === 'active');
    }
    
    // Add customer type filter if not 'all'
    if (filters.customerType && filters.customerType !== 'all') {
      params.append('customerType', filters.customerType);
    }
    
    // Handle date range filtering
    if (dateRangeParams.rangeType) {
      params.append('rangeType', dateRangeParams.rangeType);
      
      if (dateRangeParams.rangeType === 'custom' && dateRangeParams.startDate && dateRangeParams.endDate) {
        params.append('startDate', dateRangeParams.startDate.toISOString());
        params.append('endDate', dateRangeParams.endDate.toISOString());
      }
    }
    
    const response = await api.get(`/api/admin/customers/filter?${params.toString()}`);
    setCustomers(response.data);
    setLoading(false);
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    setLoading(false);
  }
};



 const handleSearchChange = (e) => {
  const term = e.target.value;
  setSearchTerm(term);
  fetchCustomers(term, filters);
};

 const handleFilterChange = (filterName, value) => {
  const newFilters = {
    ...filters,
    [filterName]: value
  };
  setFilters(newFilters);
  fetchCustomers(searchTerm, newFilters);
};

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      employeeId: "",
      department: "",
      mobileNumber: "",
      customerType: "Employee",
      isActive: true,
      password: "",
      confirmPassword: "",
    });
    setCurrentCustomer(null);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (currentCustomer) {
        const updatedCustomer = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          department: formData.department,
          mobileNumber: formData.mobileNumber,
          customerType: formData.customerType,
          isActive: formData.isActive,
        };
        await api.put(`/api/admin/customers/${currentCustomer.id}`, updatedCustomer);
      } else {
        await api.post("/api/admin/customers", formData);
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      console.error("Error saving customer:", error);
      setError("Failed to save customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCustomerStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/api/admin/customers/${id}/status?active=${!currentStatus}`);
      fetchCustomers();
      setError(null);
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update status");
    }
  };

  const openEditModal = (customer) => {
    setCurrentCustomer(customer);
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      employeeId: customer.employeeId,
      department: customer.department,
      mobileNumber: customer.mobileNumber,
      customerType: customer.customerType,
      isActive: customer.isActive,
      password: "",
      confirmPassword: "",
    });
    setIsEditModalOpen(true);
  };


  const sortedAndFilteredCustomers = customers.filter((customer) => {
    // Filter out superadmins
    //if (customer.isSuperAdmin) return false;
if (customer.employeeId === "superadmin") return false;

    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      customer.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerType?.toLowerCase().includes(searchTerm.toLowerCase());

    // Active/inactive filter
    const matchesActive =
      filters.active === "all" ||
      (filters.active === "active" && customer.isActive) ||
      (filters.active === "inactive" && !customer.isActive);

    // Customer type filter
    const matchesCustomerType =
      filters.customerType === "all" || customer.customerType === filters.customerType;
    
    return matchesSearch && matchesActive && matchesCustomerType;
  });




  const getCustomerTypeColor = (type) => {
    const colors = {
      Employee: "bg-blue-100 text-blue-800 border-blue-200",
      Trainee: "bg-green-100 text-green-800 border-green-200",
      Intern: "bg-purple-100 text-purple-800 border-purple-200",
      Helper: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                Customer Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage and organize your customer database</p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <UserPlus className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Add New Customer
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-green-600">
                  {customers.filter((c) => c.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Customers</p>
                <p className="text-2xl font-bold text-red-600">
                  {customers.filter((c) => !c.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-purple-600">{departments.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Customers
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, ID, department..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-500" />
                Status Filter
              </label>
              <select
                value={filters.active}
                onChange={(e) => handleFilterChange("active", e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Customer Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Badge className="h-4 w-4 text-gray-500" />
                Customer Type
              </label>
              <select
                value={filters.customerType}
                onChange={(e) => handleFilterChange("customerType", e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                <option value="all">All Types</option>
                {customerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter *
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>*/}
        {/* Date Range Filter */}
<div className="relative">
  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
    <Calendar className="h-4 w-4 text-gray-500" />
    Date Range
  </label>
  <div className="flex gap-2">
    <select
      value={filters.dateRange}
      onChange={(e) => handleDateRangeChange(e.target.value)}
      className="border border-gray-200 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
    >
      {dateRanges.map((range) => (
        <option key={range.value} value={range.value}>
          {range.label}
        </option>
      ))}
    </select>
    
    {filters.dateRange === 'custom' && (
      <button 
        onClick={() => setShowDatePicker(!showDatePicker)}
        className="border border-gray-200 rounded-xl px-4 py-3 whitespace-nowrap"
      >
        {dateRange[0].startDate ? 
          `${format(dateRange[0].startDate, 'MMM dd, yyyy')} - ${format(dateRange[0].endDate, 'MMM dd, yyyy')}` :
          'Select dates'}
      </button>
    )}
  </div>
  
  {showDatePicker && (
    <div className="absolute z-50 mt-1 bg-white shadow-lg rounded-lg p-2">
      <DateRange
        editableDateInputs={true}
        onChange={item => setDateRange([item.selection])}
        moveRangeOnFirstSelection={false}
        ranges={dateRange}
      />
      <div className="flex justify-end gap-2 mt-2">
        <button 
          onClick={() => {
            setDateRange([{
              startDate: new Date(),
              endDate: new Date(),
              key: 'selection'
            }]);
            setShowDatePicker(false);
          }}
          className="px-3 py-1 text-sm text-gray-600"
        >
          Clear
        </button>
        <button 
          onClick={handleCustomDateApply}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
        >
          Apply
        </button>
      </div>
    </div>
  )}

</div>
</div>
</div>
        {/* Customers Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center gap-3 text-gray-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-lg font-medium">Loading customers...</span>
              </div>
            </div>
          ) : sortedAndFilteredCustomers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or add a new customer.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Customer ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("created_at")}
                    >
                     <div className="flex items-center gap-1">
                        Created At
                        {sortConfig.key === "created_at" && (
                          <span>
                            {sortConfig.direction === "asc" ? (
                              <ChevronUp className="h-4 w-4 inline" />
                            ) : (
                              <ChevronDown className="h-4 w-4 inline" />
                            )}
                          </span>
                        )}
                      </div>
                      </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedAndFilteredCustomers.map((customer) => (
                    <tr key={customer.employeeId} className="hover:bg-blue-50/50 transition-colors duration-200">
                       <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {customer.employeeId.slice(-2)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{customer.employeeId}</div>
                          </div>
                        </div>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                            {customer.firstName[0]}
                            {customer.lastName[0]}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.mobileNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Briefcase className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{customer.department}</span>
                        </div>
                      </td>
                     
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getCustomerTypeColor(
                            customer.customerType
                          )}`}
                        >
                          {customer.customerType}
                        </span>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.createdAt ? (
                          <div className="relative group">
                            <div className="text-sm text-gray-500 cursor-help">
                              {format(new Date(customer.createdAt), "MMM dd, yyyy")}
                              <br />
                              <span className="text-xs">
                                {format(new Date(customer.createdAt), "hh:mm a")}
                              </span>
                            </div>
                             <div className="absolute hidden group-hover:block z-10 bg-gray-800 text-white text-xs p-2 rounded shadow-lg mt-1 w-64">
                              <div className="font-medium">
                                {format(new Date(customer.createdAt), "PPPPpp")}
                              </div>
                              <div className="text-gray-300 mt-1">
                                {formatDistanceToNow(new Date(customer.createdAt), {
                                  addSuffix: true,
                                })}
                              </div>
                            </div>
                          </div>
                           ) : (
                          <span className="text-gray-400 text-sm">Not recorded</span>
                        )}
                      </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={'px-3 py-1 text-xs font-semibold rounded-full border ${getCustomerTypeColor(customer.customerType)}'}
                        >
                          {customer.customerType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleCustomerStatus(customer.id, customer.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${
                            customer.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200 border border-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200 border border-red-200"
                          }`}
                        >
                          {customer.isActive ? (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              Active
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(customer)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                            title="Edit Customer"
                          >
                            <Edit className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                            title="Delete Customer"
                          >
                            <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
  {/* Add Customer Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserPlus className="h-6 w-6 text-blue-600" />
                    </div>
                    Add New Customer
                  </h3>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employee ID</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                      placeholder="Enter employee ID"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Type</label>
                      <select
                        name="customerType"
                        value={formData.customerType}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        {customerTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter mobile number"
                    />
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 block text-sm font-medium text-gray-700">Active Customer</label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                        placeholder="Enter password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        "Save Customer"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Edit className="h-6 w-6 text-blue-600" />
                    </div>
                    Edit Customer
                  </h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employee ID</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                      required
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Employee ID cannot be changed</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Type</label>
                      <select
                        name="customerType"
                        value={formData.customerType}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        {customerTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 block text-sm font-medium text-gray-700">Active Customer</label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Leave blank to keep current password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        "Update Customer"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
//Helper function for customer type colors
function getCustomerTypeColor(type) {
  const colors = {
    Employee: "bg-blue-100 text-blue-800 border-blue-200",
    Trainee: "bg-green-100 text-green-800 border-green-200",
    Intern: "bg-purple-100 text-purple-800 border-purple-200",
    Helper: "bg-orange-100 text-orange-800 border-orange-200",
  };
  return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
}