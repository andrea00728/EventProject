import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ContextProvider } from './context/ContextProvider.jsx'
import { RouterProvider } from 'react-router-dom'
import router from './routers/router.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContextProvider>
      <RouterProvider router={router}/>
    </ContextProvider>
  </StrictMode>,
)
