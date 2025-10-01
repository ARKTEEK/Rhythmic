import React, { useState } from "react";
import { FaArrowLeft, FaExclamationTriangle, FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import useAuthForm from "../../hooks/useAuthForm.tsx";
import Window from "../../components/ui/Window.tsx";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    error,
    setError,
    handleAuthSubmit,
  } = useAuthForm({ isSignUp });

  const handleTypeChange = () => {
    setPassword("");
    setUsername("");
    setEmail("");
    setIsSignUp(!isSignUp);
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    handleAuthSubmit();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full flex flex-col items-center text-center relative z-10 max-w-7xl mx-auto">
        <Window
          containerClassName="w-[380px] h-auto"
          ribbonClassName="bg-violet-200"
          windowClassName="bg-violet-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-violet-400 p-3 box-style-md">
                <FaUser className="text-white text-2xl"/>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  { isSignUp ? "Create Account" : "Welcome Back" }
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    { isSignUp ? "Join RHYTHMIC today" : "Login to continue" }
                  </span>
                </div>
              </div>
            </div>
          </div>

          { error && (
            <div
              className="box-style-md flex items-center justify-between p-3 border-2
                         border-red-800 bg-red-100 mb-4">
              <div className="flex items-center space-x-3">
                <FaExclamationTriangle className="text-red-600"/>
                <span className="font-medium text-red-900">{ error }</span>
              </div>
            </div>
          ) }

          <form
            onSubmit={ handleSubmit }
            className="space-y-4 w-full mb-4">
            { isSignUp && (
              <div className="box-style-md border-2 border-brown-800 bg-white p-2">
                <input
                  type="text"
                  placeholder="Username"
                  value={ username }
                  onChange={ (e) => setUsername(e.target.value) }
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400
                             focus:outline-none"
                />
              </div>
            ) }

            <div className="box-style-md border-2 border-brown-800 bg-white p-2">
              <input
                type="email"
                placeholder="Email"
                value={ email }
                onChange={ (e) => setEmail(e.target.value) }
                className="w-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>

            <div className="box-style-md border-2 border-brown-800 bg-white p-2 relative">
              <input
                type={ showPassword ? "text" : "password" }
                placeholder="Password"
                value={ password }
                onChange={ (e) => setPassword(e.target.value) }
                className="w-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brown-700 hover:text-brown-900"
                onClick={ () => setShowPassword(!showPassword) }>
                { showPassword ? <FaEyeSlash/> : <FaEye/> }
              </button>
            </div>

            <button
              type="submit"
              className="box-style-md w-full py-3 border-2 border-brown-800 bg-violet-200
                         transition-all duration-200 font-bold text-brown-900 hover:opacity-80
                         hover:cursor-pointer">
              <div className="flex items-center justify-center space-x-2">
                <span>{ isSignUp ? "Create Account" : "Sign In" }</span>
              </div>
            </button>
          </form>

          <button
            onClick={ handleTypeChange }
            className="box-style-md w-full py-3 border-2 border-brown-800 bg-brown-200
                       transition-all duration-200 group font-bold text-brown-900
                       hover:opacity-80 hover:cursor-pointer">
            <div className="flex items-center justify-center space-x-2">
              <span>
                { isSignUp ? "Already have an account?" : "Don't have an account?" }
              </span>
            </div>
          </button>

          <div className="mt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-sm font-medium text-brown-700
                         hover:text-brown-900 transition-colors">
              <FaArrowLeft className="text-sm"/>
              <span>Return to Home</span>
            </Link>
          </div>
        </Window>
      </div>
    </div>
  );
}
