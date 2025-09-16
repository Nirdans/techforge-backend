/**
 * Services d'authentification
 * Gestion des appels API pour l'authentification
 */

import api, { setTokens, setUserData, removeTokens, getRefreshToken } from "./api";

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register/", userData);

    // Si l'inscription réussit et que des tokens sont retournés
    if (response.access && response.refresh) {
      setTokens(response.access, response.refresh);

      // Sauvegarder les informations utilisateur si disponibles
      if (response.user) {
        setUserData(response.user);
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Connexion d'un utilisateur
 */
export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login/", credentials);

    // Sauvegarder les tokens d'accès et de rafraîchissement
    if (response.access && response.refresh) {
      setTokens(response.access, response.refresh);

      // Sauvegarder les informations utilisateur
      if (response.user) {
        setUserData(response.user);
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Déconnexion d'un utilisateur
 */
export const logout = async () => {
  try {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      // Appeler l'API de déconnexion avec le refresh token
      await api.post("/auth/logout/", { refresh_token: refreshToken });
    }

    // Supprimer tous les tokens et données utilisateur du localStorage
    removeTokens();

    return { success: true };
  } catch (error) {
    // Même en cas d'erreur, on supprime les tokens locaux
    removeTokens();
    throw error;
  }
};

/**
 * Demande de réinitialisation de mot de passe
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post("/auth/password-reset/request/", { email });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Validation du code de réinitialisation
 */
export const validateResetCode = async (email, code) => {
  try {
    const response = await api.post("/auth/password-reset/validate-code/", {
      email,
      code,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Confirmation de la réinitialisation du mot de passe
 */
export const confirmPasswordReset = async (resetData) => {
  try {
    const response = await api.post("/auth/password-reset/confirm/", resetData);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtenir les informations de l'utilisateur connecté
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/profile/");
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Rafraîchir le token d'accès
 */
export const refreshToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("Aucun refresh token disponible");
    }

    const response = await api.post("/auth/token/refresh/", {
      refresh: refreshToken,
    });

    if (response.access) {
      setTokens(response.access, refreshToken);
    }

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Valider le code de réinitialisation de mot de passe
 */
export const validatePasswordResetCode = async (data) => {
  try {
    const response = await api.post("/auth/password-reset/validate-code/", data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Mettre à jour le profil utilisateur
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/auth/profile/", profileData);

    // Mettre à jour les données utilisateur en local
    if (response.user) {
      setUserData(response.user);
    }

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Changer le mot de passe
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await api.post("/auth/change-password/", passwordData);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupérer les données du dashboard
 */
export const getDashboardData = async () => {
  try {
    const response = await api.get("/auth/dashboard/");
    return response;
  } catch (error) {
    throw error;
  }
};
