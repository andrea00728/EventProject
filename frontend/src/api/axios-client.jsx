// frontend/src/api/axios-client.jsx
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true, // ⬅️ IMPORTANT pour envoyer les cookies
});

// Intercepteur de requête : ne fait plus rien avec le token
axiosClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;
    if (response?.status === 401 && !config._retry) {
      config._retry = true;
    } else if (!response) {
      console.error("Erreur réseau ou serveur indisponible :", error);
    }
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axiosClient.post('/auth/refresh', {}, { withCredentials: true });
        console.log('Token rafraîchi:', response.data);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error('Échec du rafraîchissement:', refreshError);
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/login'; // Redirigez vers la page de connexion
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

