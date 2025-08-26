import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { ContextProvider } from './context/ContextProvider.jsx'
import { DarkModeProvider } from './context/DarkModeContext.jsx'

import router from './routers/router.jsx'
import './App.css'
import 'leaflet/dist/leaflet.css'
import "react-toastify/dist/ReactToastify.css"; // 👈 styles toastify
import { ToastContainer } from "react-toastify"; // 👈 importer le container
// import 'antd/dist/reset.css';


import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

// Point d'entrée de l'application React
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DarkModeProvider>
      <ContextProvider>
        <RouterProvider router={router} />
        <ToastContainer  // 👈 placé ici, global à toute l'app
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
        />
      </ContextProvider>
    </DarkModeProvider>
  </StrictMode>
)
