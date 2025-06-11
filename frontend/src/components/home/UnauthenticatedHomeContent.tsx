import { FaSignInAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const UnauthenticatedHomeContent = () => {
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center">
      <h1 className="text-5xl font-extrabold text-red-400">
        Welcome to ListPort
      </h1>
      <p className="text-gray-300 mt-2 text-lg">
        Your gateway to seamless playlist management
      </p>
      <Link
        to="/auth"
        className="mt-6 flex items-center space-x-3 bg-red-600 px-8 py-3 rounded-full shadow-lg hover:bg-red-500 transition text-white font-medium text-lg"
      >
        <FaSignInAlt className="text-2xl" />
        <span>Sign in to Continue</span>
      </Link>
      <p className="text-sm text-gray-400 mt-4">
        By signing in, you agree to our{" "}
        <Link to="/terms" className="text-red-400 hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link to="/policy" className="text-red-400 hover:underline">
          Privacy Policy
        </Link>
      </p>
      <Link to="/" className="mt-6 text-gray-400 hover:text-gray-300 text-sm">
        Need Help? Contact Support &rarr;
      </Link>
    </div>
  );
};

export default UnauthenticatedHomeContent;
