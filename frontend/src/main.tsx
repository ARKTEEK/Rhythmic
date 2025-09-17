import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from "./context/AuthProvider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TopNavActionsProvider } from "./hooks/useTopNavActions.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={ queryClient }>
      <AuthProvider>
        <TopNavActionsProvider>
          <App/>
        </TopNavActionsProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
