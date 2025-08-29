import axios from "axios";

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
  withCredentials: true,
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




export default axiosClient;



