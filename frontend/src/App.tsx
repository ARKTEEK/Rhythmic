import { FaSignInAlt } from "react-icons/fa";
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AuthPage from "./AuthPage.tsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div
            className="bg-black min-h-screen flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-red-500 opacity-20 blur-3xl rounded-full"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center text-white p-6">
              <h1 className="text-5xl font-extrabold text-red-400">Welcome to ListPort</h1>
              <p className="text-gray-300 mt-2 text-lg">Your gateway to seamless playlist
                management</p>

              <Link
                to="/auth/signin"
                className="mt-6 flex items-center space-x-3 bg-red-600 px-8 py-3 rounded-full shadow-lg hover:bg-red-500 transition text-white font-medium text-lg"
              >
                <FaSignInAlt className="text-2xl"/>
                <span>Sign in to Continue</span>
              </Link>

              <p className="text-sm text-gray-400 mt-4">
                By signing in, you agree to our
                <a href="/terms" className="text-red-400 hover:underline"> Terms</a> and <a
                href="/policy" className="text-red-400 hover:underline">Privacy Policy</a>
              </p>

              <Link to="/" className="mt-6 text-gray-400 hover:text-gray-300 text-sm">
                Need Help? Contact Support &rarr;
              </Link>
            </div>
          </div>
        }/>

        <Route path="/auth/:action" element={ <AuthPage/> }/>
      </Routes>
    </Router>
  );
};

export default App;
