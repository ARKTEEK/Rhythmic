import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthProvider from "./context/AuthProvider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TopNavActionsProvider } from "./hooks/useTopNavActions.tsx";
import { ToastContainer } from "react-toastify";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={ queryClient }>
      <AuthProvider>
        <TopNavActionsProvider>
          <App/>
          <ToastContainer
            position="top-right"
            autoClose={ 3000 }
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            closeButton={ false }
          />
        </TopNavActionsProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
