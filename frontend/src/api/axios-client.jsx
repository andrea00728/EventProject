// import axios from "axios";
// import { Navigate } from "react-router-dom";


// const axiosClient=axios.create({
//     baseURL:`${import.meta.env.VITE_API_BASE_URL}`,
//     withCredentials: true,
// })

// axiosClient.interceptors.request.use((config)=>{
//      const token=localStorage.getItem("ACCESS_TOKEN")
//     config.headers.Authorization=`Bearer ${token}`
//     return config;
// })

// axiosClient.interceptors.response.use((response)=>{
     
//     return response;
// },(error)=>{
// const {response}=error;
// if(response.status===401){
//     localStorage.removeItem("ACCESS_TOKEN")
// }

// throw error;
// })
// export default axiosClient;



import axios from "axios";

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Vérifie si l'erreur est un 401 ET que ce n'est PAS la route de rafraîchissement
    if (
      error.response?.status === 401 &&
      originalRequest.url !== '/auth/refresh' && 
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("REFRESH_TOKEN");
      
      if (refreshToken) {
        try {
          const res = await axiosClient.post("/auth/refresh", { refresh_token: refreshToken });
          const { access_token, refresh_token } = res.data;

          localStorage.setItem("ACCESS_TOKEN", access_token);
          localStorage.setItem("REFRESH_TOKEN", refresh_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          // Si le rafraîchissement échoue, on déconnecte l'utilisateur
          localStorage.removeItem("ACCESS_TOKEN");
          localStorage.removeItem("REFRESH_TOKEN");
          localStorage.removeItem("USER");
          window.location.href = '/pagepublic';
          return Promise.reject(refreshError);
        }
      } else {
        // Pas de refresh token, on déconnecte l'utilisateur
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        localStorage.removeItem("USER");
        window.location.href = '/pagepublic';
      }
    }

    // Gère le cas où la requête de rafraîchissement elle-même échoue
    if (error.response?.status === 401 && originalRequest.url === '/auth/refresh') {
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("REFRESH_TOKEN");
      localStorage.removeItem("USER");
      window.location.href = '/pagepublic';
    }

    return Promise.reject(error);
  }
);

export default axiosClient;