import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/', 
  headers: {
    'Content-Type': 'application/json',
  },
});




export const orderApi = {
  // Basic CRUD
  placeOrder: (data) => api.post('/api/orders', data),
  getEmployeeOrders: (employeeId, status) => 
    api.get(`/api/orders/employee/${employeeId}`, { params: { status } }),
  getAllOrders: (filters) => api.get('/api/orders', { params: filters }),
  updateStatus: (orderId, status, remarks) => 
    api.patch(`/api/orders/${orderId}/status`, null, { params: { status, remarks } }),
  cancelOrder: (orderId) => api.delete(`/api/orders/${orderId}`),
  
  // Enhanced features
  searchOrders: (term, employeeId, menuId, status) => 
    api.get('/api/orders/search', { params: { term, employeeId, menuId, status } }),
  getOrderDetails: (orderId) => api.get(`/api/orders/${orderId}`),
  getOrderEmployeeDetails: (orderId) => 
    api.get(`/api/orders/${orderId}/employee-details`),
  getOrderMenuItemDetails: (orderId) => 
    api.get(`/api/orders/${orderId}/menu-item-details`),
  getOrderPriceHistory: (orderId) => 
    api.get(`/api/orders/${orderId}/price-history`),
  getOrderHistory: (startDate, endDate, department, category) =>
    api.get('/api/orders/history', { params: { startDate, endDate, department, category } })
};


// Add this to your existing api.js
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

export const menuApi = {
  getItems: (params) => api.get('api/menu/items', { params }),
  getActiveItems: (date,category) => api.get('api/menu/items/active', { params: { date , category} }),
  getFilteredItems: (filters) => api.get('api/menu/items/filter', { params: filters }),
  getPriceHistory: (name) => api.get('api/menu/items/price-history', { params: { name } }),
  createItem: (data) => api.post('api/menu/items', data),
  updateItem: (id, data) => api.put(`api/menu/items/${id}`, data),
  deleteItem: (id) => api.delete(`api/menu/items/${id}`),
};


export const weeklyMenuApi = {
  create: (data) => api.post('api/menu/weekly', data),
  getByDay: (date, dayOfWeek, category) => 
    api.get('api/menu/weekly/day', { params: { date, dayOfWeek, category } }),
  getByDateRange: (startDate, endDate) => 
    api.get('api/menu/weekly/range', { params: { startDate, endDate } }),
  delete: (id) => api.delete(`api/menu/weekly/${id}`),
};

/*api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});*/

/* 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-User'] = localStorage.getItem('username') || 'admin';
  return config;
}, (error) => {
  return Promise.reject(error);
});
*/
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Making request to:', config.url); // Log the endpoint
  console.log('Using token:', token ? 'Present' : 'Missing'); // Token status
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const username = localStorage.getItem('username') || 'admin';
  console.log('Setting X-User:', username); // Log the user
  config.headers['X-User'] = username;
  
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Add response interceptor to catch 500 errors
api.interceptors.response.use(response => response, error => {
  if (error.response) {
    console.error('API Error Response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers,
      config: error.config
    });
  }
  return Promise.reject(error);
});
export default api;