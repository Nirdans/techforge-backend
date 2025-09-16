/**
 * Services pour la gestion des catégories
 */

import api from "./api";

/**
 * Récupérer toutes les catégories
 */
export const getCategories = async () => {
  try {
    const response = await api.get("/categories/");
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Créer une nouvelle catégorie
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await api.post("/categories/", categoryData);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupérer les statistiques des catégories
 */
export const getCategoryStats = async () => {
  try {
    const response = await api.get("/categories/stats/");
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Mettre à jour une catégorie
 */
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.patch(`/categories/${id}/`, categoryData);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Supprimer une catégorie
 */
export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}/`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupérer les transactions d'une catégorie
 */
export const getCategoryTransactions = async (id) => {
  try {
    const response = await api.get(`/categories/${id}/transactions/`);
    return response;
  } catch (error) {
    throw error;
  }
};
