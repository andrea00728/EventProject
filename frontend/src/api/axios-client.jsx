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

// Intercepteur de requête : ne fait plus rien avec le token
axiosClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Intercepteur de réponse
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