import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Layout from "./components/common/Layout.tsx";
import { AppRoutes } from "./components/route/AppRoutes.tsx";
import PrivateRoute from "./components/route/PrivateRoute.tsx";
import PublicRoute from "./components/route/PublicRoute.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useAuth } from "./hooks/useAuth.tsx";

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
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutWrapper />}>
          {AppRoutes.map(({ path, element, private: isPriv, publicOnly }) => {
            const wrapped = isPriv ? (
              <PrivateRoute>{element}</PrivateRoute>
            ) : publicOnly ? (
              <PublicRoute>{element}</PublicRoute>
            ) : (
              element
            );

            return <Route key={path} path={path} element={wrapped} />;
          })}

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
