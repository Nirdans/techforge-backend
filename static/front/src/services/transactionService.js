/**
 * Services pour la gestion des transactions
 */

import api from "./api";

/**
 * Récupérer toutes les transactions avec pagination
 */
export const getTransactions = async (page = 1) => {
  try {
    const response = await api.get(`/transactions/?page=${page}`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupérer une transaction par son ID
 */
export const getTransactionById = async (id) => {
  try {
    const response = await api.get(`/transactions/${id}/`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Créer une nouvelle transaction
 */
export const createTransaction = async (transactionData) => {
  try {
    // Si on a une preuve (fichier), utiliser FormData
    if (transactionData.preuve && transactionData.preuve instanceof File) {
      const formData = new FormData();
      Object.keys(transactionData).forEach((key) => {
        if (transactionData[key] !== null && transactionData[key] !== undefined) {
          formData.append(key, transactionData[key]);
        }
      });

      const response = await api.post("/transactions/", formData, {
        headers: {
          // Laisser le navigateur définir le Content-Type pour FormData
          "Content-Type": undefined,
        },
      });
      return response;
    } else {
      // Sinon, utiliser JSON normal
      const response = await api.post("/transactions/", transactionData);
      return response;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Mettre à jour une transaction
 */
export const updateTransaction = async (id, transactionData) => {
  try {
    // Si on a une preuve (fichier), utiliser FormData
    if (transactionData.preuve && transactionData.preuve instanceof File) {
      const formData = new FormData();
      Object.keys(transactionData).forEach((key) => {
        if (transactionData[key] !== null && transactionData[key] !== undefined) {
          formData.append(key, transactionData[key]);
        }
      });

      const response = await api.patch(`/transactions/${id}/`, formData, {
        headers: {
          "Content-Type": undefined,
        },
      });
      return response;
    } else {
      const response = await api.patch(`/transactions/${id}/`, transactionData);
      return response;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Supprimer une transaction
 */
export const deleteTransaction = async (id) => {
  try {
    const response = await api.delete(`/transactions/${id}/`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupérer les statistiques des transactions
 */
export const getTransactionStats = async () => {
  try {
    const response = await api.get("/transactions/stats/");
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupérer les transactions groupées par catégorie
 */
export const getTransactionsByCategory = async () => {
  try {
    const response = await api.get("/transactions/by_category/");
    return response;
  } catch (error) {
    throw error;
  }
};
