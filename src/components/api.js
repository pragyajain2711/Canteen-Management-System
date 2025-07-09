import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.29.120:8080/', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Transaction API endpoints
export const transactionApi = {
  // Get all transactions
  getTransactions: () => api.get('api/transactions'),
  
  // Get transaction by ID
  getTransactionById: (id) => api.get(`api/transactions/${id}`),
  
  // Get transactions by menu ID
  getTransactionsByMenuId: (menuId) => api.get(`api/transactions/menu/${menuId}`),
  
  // Get transactions by employee ID
  getTransactionsByEmployeeId: (employeeId) => api.get(`api/transactions/employee/${employeeId}`),
  
  // Add remark to transaction
  addRemark: (transactionId, remark) => 
    api.post('api/transactions/remark', null, { 
      params: { transactionId, remark } 
    }),
  
  // Add response to transaction
  addResponse: (transactionId, response) => 
    api.post('api/transactions/response', null, { 
      params: { transactionId, response } 
    }),
  
  // Update transaction status
  updateStatus: (transactionId, status) => 
    api.post('api/transactions/status', null, { 
      params: { transactionId, status } 
    }),
  
  // Generate bill
  generateBill: (data) => api.post('api/transactions/generate-bill', data),
  
  // Get all employees with transactions
  getEmployeesWithTransactions: () => api.get('api/transactions/employees'),
  
  // Create transactions from orders
  createTransactions: () => api.post('api/transactions/create-transactions'),
  
  // Get billable transactions (for preview)
  getBillableTransactions: (employeeId, month, year) => 
    api.get('api/transactions/billable', { 
      params: { employeeId, month, year } 
    }),

    checkBillGenerated: (params) =>
  api.get('api/transactions/bill-status', { params }),
  
   getGeneratedBill: (data) =>
  api.post('api/transactions/generate-bill', data),



};

// api.js
export const feedbackApi = {
  // Notifications
  getMyNotifications: () => api.get('api/feedback/notifications/my'),
  createNotification: (data) => api.post('api/feedback/notifications', data),
  markAsRead: (id) => api.patch(`/api/feedback/notifications/${id}/read`),
  clearAllNotifications: () => api.delete('api/feedback/notifications'),

  // Suggestions
  createSuggestion: (content) => api.post('api/feedback/suggestions', { content }),
  getMySuggestions: () => api.get('api/feedback/suggestions/my'),
  respondToSuggestion: (id, response) => api.post(`api/feedback/suggestions/${id}/respond`, response),
  
  // Admin only
  getAllSuggestions: (filters) => api.get('api/feedback/suggestions', { params: filters }),

    getAllCustomers: () => api.get('/api/admin/customers'),

};


export const employeeApi = {
  getAllCustomers: () => api.get('/api/admin/customers'),
  // not written employee endpoints yet...
};

// Order API endpoints (existing)
export const orderApi = {
  placeOrder: (data) => api.post('api/orders', data),
  getEmployeeOrders: (employeeId, status) => 
    api.get(`api/orders/employee/${employeeId}`, { params: { status } }),
  getAllOrders: (filters) => api.get('api/orders', { params: filters }),
  updateStatus: (orderId, status, remarks) => 
    api.patch(`api/orders/${orderId}/status`, null, { params: { status, remarks } }),
  cancelOrder: (orderId) => api.delete(`api/orders/${orderId}`),
  searchOrders: (term, employeeId, menuId, status) => 
    api.get('api/orders/search', { params: { term, employeeId, menuId, status } }),
  getOrderDetails: (orderId) => api.get(`api/orders/${orderId}`),
  getOrderEmployeeDetails: (orderId) => api.get(`api/orders/${orderId}/employee-details`),
  getOrderMenuItemDetails: (orderId) => api.get(`api/orders/${orderId}/menu-item-details`),
  getOrderPriceHistory: (orderId) => api.get(`api/orders/${orderId}/price-history`),
  getOrderHistory: (startDate, endDate, department, category) =>
    api.get('api/orders/history', { params: { startDate, endDate, department, category } })
};

// Menu API endpoints (existing)
export const menuApi = {
  getItems: (params) => api.get('api/menu/items', { params }),
  getActiveItems: (date, category) => api.get('api/menu/items/active', { params: { date, category } }),
  getFilteredItems: (filters) => api.get('api/menu/items/filter', { params: filters }),
  getPriceHistory: (name, category, dateRange) => api.get('api/menu/items/price-history', { 
    params: { 
      name,
      category: category || undefined,
      startDate: dateRange?.from?.toISOString(),
      endDate: dateRange?.to?.toISOString()
    } 
  }),
  createItem: (data) => api.post('api/menu/items', data),
  updateItem: (id, data) => api.put(`api/menu/items/${id}`, data),
  deleteItem: (id) => api.delete(`api/menu/items/${id}`),
  updateAvailability: (id, availableStatus) => 
    api.patch(`api/menu/items/${id}/availability`, { availableStatus })
};

// Weekly Menu API endpoints (existing)
export const weeklyMenuApi = {
  create: (data) => api.post('api/menu/weekly', data),
  getByDay: (date, dayOfWeek, category) => 
    api.get('api/menu/weekly/day', { params: { date, dayOfWeek, category } }),
  getByDateRange: (startDate, endDate) => 
    api.get('api/menu/weekly/range', { params: { startDate, endDate } }),
  delete: (id) => api.delete(`api/menu/weekly/${id}`),
  copyFromPreviousWeek: (currentWeekStart) =>
    api.post('api/menu/weekly/copy-previous', null, {
      params: { currentWeekStart: currentWeekStart.split("T")[0] }
    })
};

// Add this to your api.js (keep all existing code and add this section)
export const employeeMenuApi = {
  // Search menu items by name
  searchItems: (name) => api.get('api/menu/items', { 
    params: { name } 
  }),

  // Get active items for current date
  getActiveItems: (category = 'all') => {
    const now = new Date().toISOString();
    return api.get('api/menu/items/active', { 
      params: { 
        date: now,
        category: category === 'all' ? undefined : category
      } 
    });
  },

  // Get weekly menu for selected day
  getWeeklyMenu: (day, category = 'all') => {
    const now = new Date();
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayIndex = days.indexOf(day);
    const targetDate = new Date(now.setDate(now.getDate() - now.getDay() + dayIndex));
    
    return api.get('api/menu/weekly/day', { 
      params: { 
        date: targetDate.toISOString(),
        dayOfWeek: day,
        category: category === 'all' ? '' : category
      } 
    });
  }
};


// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Making request to:', config.url);
  console.log('Using token:', token ? 'Present' : 'Missing');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const username = localStorage.getItem('username') || 'admin';
  console.log('Setting X-User:', username);
  config.headers['X-User'] = username;
  
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  response => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    if (error.response) {
      console.error('API Error:', {
        url: error.config.url,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

