// Utility to handle API URLs and image URLs for different environments
const IS_PRODUCTION = import.meta.env.MODE === 'production';
const PRODUCTION_API_URL = import.meta.env.VITE_API_URL || 'https://bnsbackend-d76688301766.herokuapp.com';

// Get API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  if (IS_PRODUCTION) {
    const url = `${PRODUCTION_API_URL}${cleanEndpoint}`;
    console.log('🌐 Production API call:', url); // Debug log
    return url;
  } else {
    // In development, use relative paths (will be proxied by Vite)
    return cleanEndpoint;
  }
};

// Get image URL (for images served by backend)
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.png';
  
  // If it's already a full URL (like Cloudinary), return as-is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // For images, we always need the full URL since they're not proxied
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  if (IS_PRODUCTION) {
    return `${PRODUCTION_API_URL}${cleanPath}`;
  } else {
    // In development, images need to go directly to localhost:5000
    return `http://localhost:5000${cleanPath}`;
  }
};

// Base URL for direct access (replaces const BASE_URL = 'http://localhost:5000')
export const BASE_URL = IS_PRODUCTION ? PRODUCTION_API_URL : 'http://localhost:5000';

// API call helper
export const apiCall = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  // If body is FormData, don't set Content-Type
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
