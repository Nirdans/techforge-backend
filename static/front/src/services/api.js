/**
 * Configuration de base pour les appels API
 * Base URL: 127.0.0.1:8000/api/v1
 */

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

/**
 * Configuration par défaut pour les requêtes
 */
const defaultConfig = {
  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * Gestion des tokens d'authentification
 */

/**
 * Obtient le token d'accès depuis le localStorage
 */
const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

/**
 * Obtient le token de rafraîchissement depuis le localStorage
 */
const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};

/**
 * Sauvegarde les tokens d'authentification dans le localStorage
 */
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
};

/**
 * Sauvegarde les informations utilisateur dans le localStorage
 */
const setUserData = (user) => {
  localStorage.setItem("user_data", JSON.stringify(user));
};

/**
 * Obtient les informations utilisateur depuis le localStorage
 */
const getUserData = () => {
  const userData = localStorage.getItem("user_data");
  return userData ? JSON.parse(userData) : null;
};

/**
 * Sauvegarde uniquement le token d'accès (pour le refresh)
 */
const setAccessToken = (token) => {
  localStorage.setItem("access_token", token);
};

/**
 * Supprime tous les tokens d'authentification du localStorage
 */
const removeTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_data");
};

/**
 * Vérifie si l'utilisateur est authentifié
 */
const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * Ajoute le token d'accès aux headers si disponible
 */
const getAuthHeaders = () => {
  const token = getAccessToken();
  if (token) {
    return {
      ...defaultConfig.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return defaultConfig.headers;
};

/**
 * Rafraîchit le token d'accès en utilisant le refresh token
 */
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Aucun refresh token disponible");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Impossible de rafraîchir le token");
    }

    const data = await response.json();
    setAccessToken(data.access);
    return data.access;
  } catch (error) {
    // Si le refresh échoue, déconnecter l'utilisateur
    removeTokens();
    window.location.href = "/authentication/sign-in";
    throw error;
  }
};

/**
 * Fonction générique pour faire des requêtes API
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...defaultConfig,
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Si le token a expiré, essayer de le rafraîchir
    if (response.status === 401 && getRefreshToken()) {
      try {
        await refreshAccessToken();
        // Réessayer la requête avec le nouveau token
        const newConfig = {
          ...config,
          headers: {
            ...getAuthHeaders(),
            ...options.headers,
          },
        };
        const retryResponse = await fetch(url, newConfig);

        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          const error = new Error(
            errorData.message || errorData.detail || `Erreur HTTP: ${retryResponse.status}`
          );
          error.response = {
            status: retryResponse.status,
            data: errorData,
          };
          throw error;
        }

        return await retryResponse.json();
      } catch (refreshError) {
        console.error("Erreur lors du rafraîchissement du token:", refreshError);
        removeTokens();
        window.location.href = "/authentication/sign-in";
        return null;
      }
    }

    // Si c'est une autre erreur 401 ou si pas de refresh token
    if (response.status === 401) {
      removeTokens();
      window.location.href = "/authentication/sign-in";
      return null;
    }

    // Vérifier si la réponse est OK
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.message || errorData.detail || `Erreur HTTP: ${response.status}`
      );
      error.response = {
        status: response.status,
        data: errorData,
      };
      throw error;
    }

    // Retourner les données JSON
    return await response.json();
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
};

/**
 * Méthodes HTTP spécifiques
 */
const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: "GET" }),

  post: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: "DELETE" }),
};

export {
  API_BASE_URL,
  api,
  getAccessToken,
  getRefreshToken,
  setTokens,
  setAccessToken,
  setUserData,
  getUserData,
  removeTokens,
  isAuthenticated,
  getAuthHeaders,
  refreshAccessToken,
};

export default api;
