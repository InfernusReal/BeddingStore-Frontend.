// API configuration for different environments
const API_CONFIG = {
  // For local development: use relative paths (will be proxied by Vite)
  // For production: use your actual Hobby Dyno URL
  BASE_URL: import.meta.env.MODE === 'production' 
    ? import.meta.env.VITE_API_URL || 'https://your-hobby-dyno-url.herokuapp.com'
    : '',
  
  // API endpoints
  ENDPOINTS: {
    // Products
    PRODUCTS: '/api/products',
    PRODUCT_BY_ID: (id) => `/api/products/${id}`,
    
    // Collections
    COLLECTIONS: '/api/collections',
    COLLECTION_BY_ID: (id) => `/api/collections/${id}`,
    
    // Orders
    ORDERS: '/api/orders',
    ORDER_BY_ID: (id) => `/api/orders/${id}`,
    CONFIRM_ORDER: (id) => `/api/orders/${id}/confirm`,
    
    // Reviews
    REVIEWS: '/api/reviews',
    PRODUCT_REVIEWS: (productId) => `/api/reviews/product/${productId}`,
    
    // Upload
    UPLOAD: '/api/upload',
    
    // Admin
    ADMIN_LOGIN: '/api/admin/login',
    ADMIN_CHANGE_PASSWORD: '/api/admin/change-password',
    ADMIN_ACCESS_LOGS: '/api/admin/access-logs',
    
    // Announcements
    ANNOUNCEMENTS: '/api/announcements',
    
    // Contact
    CONTACT: '/api/contact',
    
    // Email
    EMAIL: '/api/email'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function for making API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  // If body is FormData, don't set Content-Type (let browser set it)
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }
  
  const response = await fetch(url, {
    ...defaultOptions,
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response;
};

export default API_CONFIG;
