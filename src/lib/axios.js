import axios from 'axios'

const API_BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"
  : "/api";

export const SOCKET_BASE_URL = import.meta.env.DEV
  ? API_BASE_URL.replace(/\/api\/?$/, "")
  : "https://lechat-backend.onrender.com";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
