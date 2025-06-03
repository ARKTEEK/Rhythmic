import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const OAuthError = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/");
    }, 5000);
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-red-500 opacity-20 blur-3xl rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg text-white text-center">
        <h1 className="text-4xl font-extrabold text-red-400 mb-2">
          Failed to Link Account!
        </h1>
        <p className="text-gray-300 mb-6">Try again in a few minutes...</p>
        <Link
          to="/"
          className="bg-red-600 px-8 py-3 rounded-full shadow-lg hover:bg-red-500 transition text-white font-medium text-lg"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};
export default OAuthError;
