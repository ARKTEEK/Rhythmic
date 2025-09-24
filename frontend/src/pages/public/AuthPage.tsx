import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import useAuthForm from "../../hooks/useAuthForm.tsx";
import { Button } from "../../components/common/button/Button.tsx";
import { Card } from "../../components/home/Card.tsx";
import { Logo } from "../../components/common/Logo.tsx";

const AuthPage = () => {
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
    await handleAuthSubmit();
  };

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-[#ffe8dc] to-[#ffd6c7]
                 flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center relative z-10">
        <Card>
          <div className="mb-8">
            <Logo
              text={ isSignUp ? "Create Account" : "Welcome Back" }
              size="md"
              underline={ false }
            />
            <p className="text-base text-neutralGray/70 mt-2">
              { isSignUp
                ? "Join RHYTHMIC to start creating and sharing playlists."
                : "Sign in to continue managing your playlists." }
            </p>
          </div>

          { error && (
            <div className="text-red-500 font-semibold mb-4">{ error }</div>
          ) }

          <form
            onSubmit={ handleSubmit }
            className="space-y-4 w-full">
            { isSignUp && (
              <input
                type="text"
                placeholder="Username"
                value={ username }
                onChange={ (e) => setUsername(e.target.value) }
                className="w-full px-6 py-3 bg-white/70 border-2 border-gray-300 rounded-full
                           text-neutralGray placeholder-gray-400 focus:outline-none focus:border-accent"/>
            ) }

            <input
              type="email"
              placeholder="Email"
              value={ email }
              onChange={ (e) => setEmail(e.target.value) }
              className="w-full px-6 py-3 bg-white/70 border-2 border-gray-300 rounded-full
                         text-neutralGray placeholder-gray-400 focus:outline-none focus:border-accent"/>

            <div className="relative w-full">
              <input
                type={ showPassword ? "text" : "password" }
                placeholder="Password"
                value={ password }
                onChange={ (e) => setPassword(e.target.value) }
                className="w-full px-6 py-3 bg-white/70 border-2 border-gray-300 rounded-full
                           text-neutralGray placeholder-gray-400 focus:outline-none focus:border-accent"/>
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-accent"
                onClick={ () => setShowPassword(!showPassword) }>
                { showPassword ? <FaEyeSlash/> : <FaEye/> }
              </button>
            </div>

            <Button
              type="submit"
              variant="active"
              size="medium"
              label={ isSignUp ? "Sign Up" : "Sign In" }
            />
          </form>

          <p className="mt-6 text-sm text-neutralGray">
            { isSignUp ? "Already have an account?" : "Don’t have an account?" }{ " " }
            <button
              className="text-[#FF7A5A] font-extrabold hover:underline hover:cursor-pointer
                         transition-colors duration-200"
              onClick={ handleTypeChange }>
              { isSignUp ? "SIGN IN" : "SIGN UP" }
            </button>
          </p>

          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-sm font-medium text-neutralGray/70
                         hover:text-accent transition-colors">
              <span className="text-lg">&larr;</span> Return to Home
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default AuthPage;