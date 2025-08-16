import axios from 'axios'
 export const axiosInstance = axios.create({
    baseURL: "https://lechat-backend.onrender.com/api",
    withCredentials:true,
 })
