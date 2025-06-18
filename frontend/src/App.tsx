import {
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import HomePageContent from "./components/home/HomePageContent.tsx";
import Layout from "./components/Layout.tsx";
import PlaylistPage from "./pages/PlaylistPage.tsx";
import PublicRoute from "./components/route/PublicRoute.tsx";
import { useAuth } from "./context/AuthContext.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import GoogleOAuthCallback from "./pages/oauth/GoogleOAuthCallback.tsx";
import OAuthComplete from "./pages/oauth/OAuthComplete.tsx";
import OAuthError from "./pages/oauth/OAuthError.tsx";

const LayoutWrapper = () => {
  const { isAuthenticated } = useAuth();

  const showProfile = isAuthenticated;

  return (
    <Layout showProfile={showProfile}>
      <Outlet />
    </Layout>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LayoutWrapper />}>
          <Route index element={<HomePageContent />} />
          <Route
            path="auth"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />
          <Route
            path="api/oauth/google/callback"
            element={<GoogleOAuthCallback />}
          />
          <Route path="/playlists" element={<PlaylistPage />} />
          <Route path="oauth/complete" element={<OAuthComplete />} />
          <Route path="api/oauth/error" element={<OAuthError />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
