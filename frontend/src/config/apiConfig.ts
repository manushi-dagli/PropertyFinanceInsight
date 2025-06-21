import axios, { AxiosInstance } from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const axiosConfig = {
  baseURL: baseUrl,
  timeout: 60000, // 60 seconds
};

const axiosInstance: AxiosInstance = axios.create(axiosConfig);

export default axiosInstance;