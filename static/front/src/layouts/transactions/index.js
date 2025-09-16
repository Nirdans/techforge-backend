/**
 * Page de gestion des transactions
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Services
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
  getTransactionsByCategory,
  getCategories,
} from "services";

function Transactions() {
  const navigate = useNavigate();

  // États principaux
  const [transactions, setTransactions] = useState([]);
  const [transactionStats, setTransactionStats] = useState({});
  const [transactionsByCategory, setTransactionsByCategory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filteredCategories, setFilteredCategories] = useState([]);

  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().slice(0, 16), // Format datetime-local
    description: "",
    type: "expense",
    category: "",
    preuve: null,
  });

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [currentPage]);

  // Filtrer les catégories selon le type sélectionné
  useEffect(() => {
    const filtered = categories.filter((cat) => cat.type === formData.type);
    setFilteredCategories(filtered);
    // Réinitialiser la catégorie si elle n'est plus valide
    if (formData.category && !filtered.find((cat) => cat.id === formData.category)) {
      setFormData((prev) => ({ ...prev, category: "" }));
    }
  }, [formData.type, categories]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsData, statsData, byCategoryData] = await Promise.all([
        getTransactions(currentPage),
        getTransactionStats(),
        getTransactionsByCategory(),
      ]);

      setTransactions(transactionsData.results || []);
      setTotalCount(transactionsData.count || 0);
      setTotalPages(transactionsData.total_pages || 1);
      setCurrentPage(transactionsData.current_page || 1);
      setPageSize(transactionsData.page_size || 10);
      setNextPage(transactionsData.next);
      setPreviousPage(transactionsData.previous);

      setTransactionStats(statsData || {});
      setTransactionsByCategory(byCategoryData || []);
    } catch (err) {
      console.error("Erreur lors du chargement des transactions:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData.results || []);
    } catch (err) {
      console.error("Erreur lors du chargement des catégories:", err);
    }
  };

  const handleOpenDialog = (transaction = null) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction?.amount || "",
      date: transaction?.date
        ? new Date(transaction.date).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      description: transaction?.description || "",
      type: transaction?.type || "expense",
      category: transaction?.category || "",
      preuve: null, // Ne pas pré-remplir le fichier
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
    setFormData({
      amount: "",
      date: new Date().toISOString().slice(0, 16),
      description: "",
      type: "expense",
      category: "",
      preuve: null,
    });
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async () => {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, formData);
        setSuccessMessage("Transaction modifiée avec succès");
      } else {
        await createTransaction(formData);
        setSuccessMessage("Transaction créée avec succès");
      }
      await fetchData();
      handleCloseDialog();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) {
      try {
        await deleteTransaction(id);
        await fetchData();
        setSuccessMessage("Transaction supprimée avec succès");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        setError("Erreur lors de la suppression");
      }
    }
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData({ ...formData, preuve: file });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDTypography variant="h3" textAlign="center">
            Chargement...
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h3" fontWeight="medium">
            Gestion des Transactions
          </MDTypography>
          <MDButton
            variant="gradient"
            color="success"
            startIcon={<Icon>add</Icon>}
            onClick={() => handleOpenDialog()}
          >
            Nouvelle Transaction
          </MDButton>
        </MDBox>
        {error && (
          <MDBox mb={2}>
            <Alert severity="error">{error}</Alert>
          </MDBox>
        )}

        {successMessage && (
          <MDBox mb={2}>
            <Alert severity="success">{successMessage}</Alert>
          </MDBox>
        )}

        {/* Statistiques globales */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="trending_up"
                title="Total Revenus"
                count={`${transactionStats?.total_income || "0.00"} XOF`}
                percentage={{
                  color: "success",
                  amount: `${transactionStats?.income_count || 0}`,
                  label: "transactions",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="error"
                icon="trending_down"
                title="Total Dépenses"
                count={`${transactionStats?.total_expenses || "0.00"} XOF`}
                percentage={{
                  color: "error",
                  amount: `${transactionStats?.expense_count || 0}`,
                  label: "transactions",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="info"
                icon="account_balance"
                title="Balance"
                count={`${transactionStats?.balance || "0.00"} XOF`}
                percentage={{
                  color: "info",
                  amount: `${transactionStats?.transaction_count || 0}`,
                  label: "transactions totales",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="calculate"
                title="Moyenne par Transaction"
                count={`${transactionStats?.average_transaction || "0.00"} XOF`}
                percentage={{
                  color: "dark",
                  amount: "",
                  label: "Transaction moyenne",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* Liste des transactions */}
        <Card>
          <MDBox
            mx={2}
            mt={-3}
            py={3}
            px={2}
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
          >
            <MDTypography variant="h6" color="white">
              Liste des Transactions ({totalCount})
            </MDTypography>
          </MDBox>
          <MDBox pt={3} pb={2} px={2}>
            {transactions.length > 0 ? (
              <>
                {transactions.map((transaction) => (
                  <MDBox
                    key={transaction.id}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py={2}
                    px={2}
                    mb={1}
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      "&:hover": { backgroundColor: "#f5f5f5" },
                    }}
                  >
                    <MDBox display="flex" alignItems="center" flex={1}>
                      <Icon
                        color={transaction.type === "income" ? "success" : "error"}
                        sx={{ mr: 2, fontSize: "2rem" }}
                      >
                        {transaction.type === "income" ? "trending_up" : "trending_down"}
                      </Icon>
                      <MDBox>
                        <MDTypography variant="button" fontWeight="medium">
                          {transaction.description}
                        </MDTypography>
                        <MDTypography variant="caption" color="text" display="block">
                          {transaction.category_name} • {formatDate(transaction.date)}
                        </MDTypography>
                        {transaction.is_group_transaction && (
                          <Chip label="Groupe" size="small" color="info" sx={{ mt: 0.5 }} />
                        )}
                      </MDBox>
                    </MDBox>

                    <MDBox display="flex" alignItems="center" gap={2}>
                      <MDTypography
                        variant="button"
                        color={transaction.type === "income" ? "success" : "error"}
                        fontWeight="bold"
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {transaction.amount} XOF
                      </MDTypography>

                      <MDBox display="flex" gap={1}>
                        <IconButton
                          onClick={() => navigate(`/transactions/${transaction.id}`)}
                          size="small"
                          color="info"
                        >
                          <Icon>visibility</Icon>
                        </IconButton>
                        <IconButton onClick={() => handleOpenDialog(transaction)} size="small">
                          <Icon>edit</Icon>
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(transaction.id)}
                          size="small"
                          color="error"
                        >
                          <Icon>delete</Icon>
                        </IconButton>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                ))}

                {/* Information de pagination pour l'utilisateur */}
                {totalCount > 0 && (
                  <MDBox display="flex" justifyContent="center" alignItems="center" mt={2} mb={1}>
                    <MDTypography variant="caption" color="text">
                      Affichage de {(currentPage - 1) * pageSize + 1} à{" "}
                      {Math.min(currentPage * pageSize, totalCount)} sur {totalCount} transactions
                    </MDTypography>
                  </MDBox>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <MDBox display="flex" justifyContent="center" mt={1}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="info"
                    />
                  </MDBox>
                )}
              </>
            ) : (
              <MDTypography variant="body2" color="text" textAlign="center" py={4}>
                Aucune transaction trouvée
              </MDTypography>
            )}
          </MDBox>
        </Card>

        {/* Dialog de création/édition */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <MDTypography variant="h4" fontWeight="medium">
              {editingTransaction ? "Modifier la Transaction" : "Nouvelle Transaction"}
            </MDTypography>
          </DialogTitle>
          <DialogContent>
            <MDBox component="form" role="form" mt={2}>
              {/* Montant */}
              <MDBox mb={2}>
                <MDInput
                  type="number"
                  label="Montant"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  fullWidth
                  required
                  inputProps={{ step: "0.01", min: "0" }}
                />
              </MDBox>

              {/* Date */}
              <MDBox mb={2}>
                <TextField
                  type="datetime-local"
                  label="Date et heure"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </MDBox>

              {/* Description */}
              <MDBox mb={2}>
                <MDInput
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  fullWidth
                  required
                  multiline
                  rows={3}
                />
              </MDBox>

              {/* Type */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Type de transaction</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Type de transaction"
                  size="medium"
                  sx={{ minHeight: 56 }}
                >
                  <MenuItem value="income" sx={{ py: 1.5 }}>
                    <MDBox display="flex" alignItems="center">
                      <Icon color="success" sx={{ mr: 1 }}>
                        trending_up
                      </Icon>
                      <MDTypography variant="button" color="text">
                        Revenus
                      </MDTypography>
                    </MDBox>
                  </MenuItem>
                  <MenuItem value="expense" sx={{ py: 1.5 }}>
                    <MDBox display="flex" alignItems="center">
                      <Icon color="error" sx={{ mr: 1 }}>
                        trending_down
                      </Icon>
                      <MDTypography variant="button" color="text">
                        Dépenses
                      </MDTypography>
                    </MDBox>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Catégorie (dépendante du type) */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Catégorie"
                  required
                  disabled={filteredCategories.length === 0}
                  size="medium"
                  sx={{ minHeight: 56 }}
                >
                  {filteredCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id} sx={{ py: 1.5 }}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {filteredCategories.length === 0 && (
                  <MDTypography variant="caption" color="text" sx={{ mt: 1 }}>
                    Aucune catégorie disponible pour ce type. Créez d&apos;abord une catégorie.
                  </MDTypography>
                )}
              </FormControl>

              {/* Upload de preuve */}
              <MDBox mb={2}>
                <MDTypography
                  variant="caption"
                  color="text"
                  fontWeight="bold"
                  mb={1}
                  display="block"
                >
                  Preuve de transaction (optionnel)
                </MDTypography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Icon>attach_file</Icon>}
                  fullWidth
                  sx={{
                    minHeight: 56,
                    textTransform: "none",
                    borderStyle: "dashed",
                    fontSize: "1rem",
                  }}
                >
                  {formData.preuve ? (
                    <MDBox textAlign="center">
                      <MDTypography variant="body2" fontWeight="medium">
                        {formData.preuve.name}
                      </MDTypography>
                      <MDTypography variant="caption" color="success">
                        Fichier sélectionné
                      </MDTypography>
                    </MDBox>
                  ) : (
                    <MDBox textAlign="center">
                      <MDTypography variant="body2" fontWeight="medium">
                        Cliquez pour joindre un fichier
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        Images, PDF, documents acceptés
                      </MDTypography>
                    </MDBox>
                  )}
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </Button>
              </MDBox>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleCloseDialog}>Annuler</MDButton>
            <MDButton
              variant="gradient"
              color="info"
              onClick={handleSubmit}
              disabled={!formData.amount || !formData.description || !formData.category}
            >
              {editingTransaction ? "Modifier" : "Créer"}
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Transactions;
