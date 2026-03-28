// /src/api/api.js
import axios from "axios";

// Use relative URL to leverage the proxy in package.json
const API_BASE_URL = "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // Important for CORS with credentials
});

// attach token from sessionStorage to every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// auth helpers
export const authApi = {
  login: (payload) => api.post("/login", payload),
  register: (payload) => api.post("/register", payload),
  logout: () => api.post("/logout"),         
};

export default api;