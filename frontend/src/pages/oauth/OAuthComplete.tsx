import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const OAuthComplete = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/");
    }, 5000);
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6">
      <div className="relative z-10 w-full max-w-lg text-white text-center">
        <h1 className="text-4xl font-extrabold text-red-400 mb-2">
          Your Account was Linked!
        </h1>
        <p className="text-gray-300 mb-6">
          Your account has been successfully connected.
        </p>
        <Link
          to="/"
          className="bg-red-600 px-8 py-3 rounded-full shadow-lg hover:bg-red-500 transition
          text-white font-medium text-lg">
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default OAuthComplete;
