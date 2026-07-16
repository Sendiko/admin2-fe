import axios from "axios";

const api = axios.create({
  baseURL: process.env.API_URL || "http://192.168.18.10:8003/api",
});

// Request interceptor to attach bearer token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle errors and map them to standard formats
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it is a network error (server offline/no response)
    if (!error.response) {
      return Promise.reject(new Error("Failed to fetch"));
    }
    
    // Extract the error message from the API response if available
    const apiMessage = error.response.data?.message;
    if (apiMessage) {
      return Promise.reject(new Error(apiMessage));
    }
    
    return Promise.reject(error);
  }
);

export default api;
