import axios from "axios";
import { BASE_URL } from "./ApiPath.js";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // ✅ send cookies (httpOnly JWT)
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized - redirect to login");
      // Optionally trigger logout here
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
