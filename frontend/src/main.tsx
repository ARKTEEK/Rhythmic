import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from "react-toastify";
import App from './App.tsx';
import AuthProvider from "./context/AuthProvider.tsx";
import { TopNavActionsProvider } from "./hooks/useTopNavActions.tsx";
import './index.css';

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
