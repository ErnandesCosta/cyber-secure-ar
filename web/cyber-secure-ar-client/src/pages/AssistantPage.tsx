import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QueryInterface } from "../components/QueryInterface";
import { useAuth } from "../hooks/useAuth";

export const AssistantPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate            = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return <QueryInterface />;
};