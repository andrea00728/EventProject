import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ContextProvider } from './context/ContextProvider.jsx'

import { RouterProvider } from 'react-router-dom'
import router from './routers/router.jsx'
import './App.css'
import { DarkModeProvider } from './context/DarkModeContext'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContextProvider>
      <DarkModeProvider>
        <RouterProvider router={router}/>
      </DarkModeProvider>
    </ContextProvider>
  </StrictMode>,
)
