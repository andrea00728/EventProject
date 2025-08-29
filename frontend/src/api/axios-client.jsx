// frontend/src/api/axios-client.jsx
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true, // ⬅️ IMPORTANT pour envoyer les cookies
});

// Intercepteur de requête : Ajouter le token JWT
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt") || document.cookie.match(/jwt=([^;]+)/)?.[1];
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
      // Ajout : Log pour déboguer l'en-tête
      console.log(`Requête à ${config.url} avec Authorization: Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse existant (inchangé)
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

// Deuxième intercepteur de réponse existant (inchangé)
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
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;