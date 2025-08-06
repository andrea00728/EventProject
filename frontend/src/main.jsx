import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { ContextProvider } from './context/ContextProvider.jsx'
import { DarkModeProvider } from './context/DarkModeContext.jsx'

import router from './routers/router.jsx'
import './App.css'

// Point d'entrée de l'application React
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DarkModeProvider>
      <ContextProvider>
        <RouterProvider router={router} />
      </ContextProvider>
    </DarkModeProvider>
  </StrictMode>
)
