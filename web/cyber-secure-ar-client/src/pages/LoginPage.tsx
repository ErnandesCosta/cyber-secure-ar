import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";
import { useAuth } from "../hooks/useAuth";

export const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate            = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/assistant");
    }
  }, [isAuthenticated, navigate]);

  return <LoginForm />;
};