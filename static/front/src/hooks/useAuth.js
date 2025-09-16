/**
 * Hook personnalisé pour la gestion de l'authentification
 */

import { useState, useEffect } from "react";
import { isAuthenticated, removeTokens } from "../services";

export const useAuth = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setAuthenticated(authStatus);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    removeTokens();
    setAuthenticated(false);
    window.location.href = "/authentication/sign-in";
  };

  return {
    authenticated,
    loading,
    logout,
  };
};
