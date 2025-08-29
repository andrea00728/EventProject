// frontend/src/api/axios-client.jsx
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true, // ⬅️ IMPORTANT pour envoyer les cookies
});

export default axiosClient;
