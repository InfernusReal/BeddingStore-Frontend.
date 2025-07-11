// Utility to handle API URLs and image URLs for different environments
const IS_PRODUCTION = import.meta.env.MODE === 'production';
const PRODUCTION_API_URL = import.meta.env.VITE_API_URL || 'https://bnsbackend-d76688301766.herokuapp.com';

// Get API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  if (IS_PRODUCTION) {
    return `${PRODUCTION_API_URL}${cleanEndpoint}`;
  } else {
    // In development, use relative paths (will be proxied by Vite)
    return cleanEndpoint;
  }
};

// Create a simple placeholder SVG to avoid 404s
const createPlaceholderSVG = (width = 240, height = 240) => {
  return `data:image/svg+xml;charset=UTF-8,%3Csvg width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E`;
};

// Get image URL (for images served by backend)
export const getImageUrl = (imagePath) => {
  console.log('🖼️ Processing image path:', imagePath);
  
  if (!imagePath) {
    console.log('🖼️ No image path, returning placeholder');
    return createPlaceholderSVG();
  }
  
  // If it's already a full URL (like Cloudinary), return as-is
  if (imagePath.startsWith('http')) {
    console.log('🖼️ Cloudinary URL detected, returning:', imagePath);
    return imagePath;
  }
  
  // For local images, construct full URL
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  if (IS_PRODUCTION) {
    const fullUrl = `${PRODUCTION_API_URL}${cleanPath}`;
    console.log('🖼️ Production local image URL:', fullUrl);
    return fullUrl;
  } else {
    // In development, images need to go directly to localhost:5000
    const devUrl = `http://localhost:5000${cleanPath}`;
    console.log('🖼️ Development local image URL:', devUrl);
    return devUrl;
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
