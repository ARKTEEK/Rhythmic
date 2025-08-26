import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Layout from "./components/common/Layout.tsx";
import { AppRoutes } from "./components/route/AppRoutes.tsx";
import PrivateRoute from "./components/route/PrivateRoute.tsx";
import PublicRoute from "./components/route/PublicRoute.tsx";
import NotFound from "./pages/public/NotFound.tsx";
import { useAuth } from "./hooks/useAuth.tsx";
import { OAuthAccessProvider } from "./context/OAuthFlowContext.tsx";

const LayoutWrapper = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout showProfile={ isAuthenticated }>
      <Outlet/>
    </Layout>
  );
};

const App = () => {
  return (
    <OAuthAccessProvider>
      <BrowserRouter>
        <Routes>
          <Route element={ <LayoutWrapper/> }>
            { AppRoutes.map(({ path, element, private: isPriv, publicOnly }) => {
              const wrapped = isPriv
                ? <PrivateRoute>{ element }</PrivateRoute>
                : publicOnly
                  ? <PublicRoute>{ element }</PublicRoute>
                  : element;

              return <Route
                key={ path }
                path={ path }
                element={ wrapped }/>;
            }) }

            <Route
              path="*"
              element={ <NotFound/> }/>
          </Route>
        </Routes>
      </BrowserRouter>
    </OAuthAccessProvider>
  );
};

export default App;
