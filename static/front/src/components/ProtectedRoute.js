/**
 * Composant pour protéger les routes qui nécessitent une authentification
 */

import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "services";

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // Rediriger vers la page de connexion si non authentifié
    return <Navigate to="/authentication/sign-in" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
