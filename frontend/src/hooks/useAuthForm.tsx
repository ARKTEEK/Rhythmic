import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthData } from "../models/User.ts";
import { loginUser, registerUser } from "../services/AuthService.ts";
import { useAuth } from "./useAuth.tsx";
import { useMutation } from "@tanstack/react-query";

interface UseAuthFormProps {
  isSignUp: boolean;
}

const useAuthForm = ({ isSignUp }: UseAuthFormProps) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const authMutation = useMutation({
    mutationFn: async () => {
      const authData: AuthData = {
        email,
        password,
        username: isSignUp ? username : undefined,
      };

      const service = isSignUp ? registerUser : loginUser;
      return await service(authData);
    },
    onSuccess: ({ token }) => {
      login(token);
      navigate('/');
    },
    onError: () => {
      setError('Authentication failed. Please try again.');
    },
  });

  const handleAuthSubmit = () => {
    setError(null);
    authMutation.mutate();
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    loading: authMutation.isPending,
    error,
    setError,
    handleAuthSubmit,
  };
};


export default useAuthForm;