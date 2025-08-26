import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center text-white overflow-hidden">
      <div className="relative z-10 flex flex-col items-center ">
        <h1 className="text-5xl font-extrabold text-red-400">Not Found!</h1>
        <p className="text-lg text-gray-300 mt-2">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 flex items-center space-x-3 bg-red-600 px-8 py-3 rounded-full shadow-lg
          hover:bg-red-500 transition text-white font-medium text-lg">
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
