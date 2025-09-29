import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { AppRoutes } from "./data/AppRoutes.tsx";
import PrivateRoute from "./components/route/PrivateRoute.tsx";
import PublicRoute from "./components/route/PublicRoute.tsx";
import NotFound from "./pages/public/NotFound.tsx";
import Layout from "./components/common/Layout.tsx";
import OAuthAccessProvider from "./context/OAuthAccessProvider.tsx";

const LayoutWrapper = () => {
  return (
    <Layout>
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
