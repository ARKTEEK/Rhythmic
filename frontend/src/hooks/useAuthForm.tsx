import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthData } from "../models/User.ts";
import { loginUser, registerUser } from "../services/AuthService.ts";
import { useAuth } from "./useAuth.tsx";

interface UseAuthFormProps {
  isSignUp: boolean;
}

const useAuthForm = ({ isSignUp }: UseAuthFormProps) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const authData: AuthData = {
        email,
        password,
        username: isSignUp ? username : undefined,
      };

      const service = isSignUp ? registerUser : loginUser;

      const { token } = await service(authData);
      login(token);
      navigate('/');
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    loading,
    error,
    setError,
    handleAuthSubmit,
  };
};

export default useAuthForm;