/**
 * Utilitaires pour la gestion des devises
 */

/**
 * Formate un montant en XOF (Franc CFA)
 * @param {number|string} amount - Le montant à formater
 * @returns {string} Le montant formaté avec la devise XOF
 */
export const formatXOF = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return `${numAmount.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} XOF`;
};

/**
 * Formate un montant avec séparateurs de milliers
 * @param {number|string} amount - Le montant à formater
 * @returns {string} Le montant formaté sans devise
 */
export const formatAmount = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return numAmount.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

/**
 * Alias pour formatXOF pour compatibilité
 */
export const formatCurrency = formatXOF;
