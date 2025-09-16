/**
 * Composant pour gérer la redirection par défaut
 */

import { Navigate } from "react-router-dom";
import { isAuthenticated } from "services";

const DefaultRedirect = () => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/authentication/sign-in" replace />;
};

export default DefaultRedirect;
