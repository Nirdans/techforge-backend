/**
 * Page de gestion des catégories
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
import IconButton from "@mui/material/IconButton";

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
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
} from "services";

function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "income",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, statsData] = await Promise.all([getCategories(), getCategoryStats()]);
      setCategories(categoriesData.results || []);
      setCategoryStats(statsData || []);
    } catch (err) {
      console.error("Erreur lors du chargement des catégories:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    setEditingCategory(category);
    setFormData({
      name: category?.name || "",
      type: category?.type || "income",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({ name: "", type: "income" });
    setError(""); // Effacer les messages d'erreur
    setSuccessMessage(""); // Effacer les messages de succès
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        setSuccessMessage("Catégorie modifiée avec succès");
      } else {
        await createCategory(formData);
        setSuccessMessage("Catégorie créée avec succès");
      }
      await fetchData();
      handleCloseDialog();
      // Effacer le message après 3 secondes
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      try {
        await deleteCategory(id);
        await fetchData();
        setSuccessMessage("Catégorie supprimée avec succès");
        // Effacer le message après 3 secondes
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        setError("Erreur lors de la suppression");
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDTypography variant="h6" textAlign="center">
            Chargement des catégories...
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
        {/* Titre et description */}
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="flex-start">
          <MDBox>
            <MDTypography variant="h4" gutterBottom>
              Catégories
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Voici un aperçu de vos catégories et transactions
            </MDTypography>
          </MDBox>
          <MDButton
            variant="gradient"
            color="info"
            startIcon={<Icon>add</Icon>}
            onClick={() => handleOpenDialog()}
          >
            Nouvelle Catégorie
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
                color="dark"
                icon="category"
                title="Total Catégories"
                count={categories.length}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Catégories créées",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="trending_up"
                title="Total Revenus"
                count={`${categoryStats
                  .filter((stat) => stat.type === "income")
                  .reduce((total, stat) => total + parseFloat(stat.total_amount || 0), 0)
                  .toFixed(2)} XOF`}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Revenus totaux",
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
                count={`${categoryStats
                  .filter((stat) => stat.type === "expense")
                  .reduce((total, stat) => total + parseFloat(stat.total_amount || 0), 0)
                  .toFixed(2)} XOF`}
                percentage={{
                  color: "error",
                  amount: "",
                  label: "Dépenses totales",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="receipt"
                title="Total Transactions"
                count={categoryStats.reduce(
                  (total, stat) => total + (stat.transaction_count || 0),
                  0
                )}
                percentage={{
                  color: "info",
                  amount: "",
                  label: "Toutes transactions",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* Liste des catégories sous forme de grille */}
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            {/* Catégories avec leurs détails */}
            <Grid item xs={12} lg={8}>
              <Card>
                <MDBox pt={3} px={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Toutes les Catégories
                  </MDTypography>
                </MDBox>
                <MDBox p={3}>
                  {categories.length > 0 ? (
                    categories.map((category) => {
                      // Trouver les stats correspondantes pour cette catégorie
                      const stat = categoryStats.find((s) => s.id === category.id);
                      return (
                        <MDBox
                          key={category.id}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          py={2}
                          borderBottom="1px solid #f0f0f0"
                        >
                          <MDBox display="flex" alignItems="center" flex={1}>
                            <Icon
                              color={category.type === "income" ? "success" : "error"}
                              sx={{ mr: 2 }}
                            >
                              {category.type === "income" ? "arrow_upward" : "arrow_downward"}
                            </Icon>
                            <MDBox flex={1}>
                              <MDTypography variant="button" fontWeight="medium">
                                {category.name}
                              </MDTypography>
                              <MDTypography variant="caption" color="text" display="block">
                                {category.type === "income" ? "Revenus" : "Dépenses"}
                              </MDTypography>
                            </MDBox>
                          </MDBox>

                          {/* Statistiques rapides */}
                          <MDBox display="flex" alignItems="center" mr={2}>
                            <MDBox textAlign="right" mr={2}>
                              <MDTypography variant="button" fontWeight="medium">
                                {stat?.total_amount ? `${stat.total_amount} XOF` : "0.00 XOF"}
                              </MDTypography>
                              <MDTypography variant="caption" color="text" display="block">
                                {stat?.transaction_count || 0} transaction(s)
                              </MDTypography>
                            </MDBox>
                          </MDBox>

                          <MDBox display="flex" alignItems="center">
                            <IconButton
                              onClick={() => navigate(`/categories/${category.id}`)}
                              size="small"
                              color="info"
                            >
                              <Icon>visibility</Icon>
                            </IconButton>
                            <IconButton onClick={() => handleOpenDialog(category)} size="small">
                              <Icon>edit</Icon>
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(category.id)}
                              size="small"
                              color="error"
                            >
                              <Icon>delete</Icon>
                            </IconButton>
                          </MDBox>
                        </MDBox>
                      );
                    })
                  ) : (
                    <MDTypography variant="body2" color="text" textAlign="center">
                      Aucune catégorie trouvée
                    </MDTypography>
                  )}
                </MDBox>
              </Card>
            </Grid>

            {/* Actions rapides */}
            <Grid item xs={12} lg={4}>
              <Card>
                <MDBox pt={3} px={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Actions Rapides
                  </MDTypography>
                </MDBox>
                <MDBox p={3}>
                  <MDButton
                    variant="gradient"
                    color="info"
                    fullWidth
                    startIcon={<Icon>add</Icon>}
                    onClick={() => handleOpenDialog()}
                    sx={{ mb: 2 }}
                  >
                    Nouvelle Catégorie
                  </MDButton>

                  <MDBox mt={3}>
                    <MDTypography variant="button" fontWeight="medium" color="text">
                      Statistiques
                    </MDTypography>
                    <MDBox mt={1}>
                      <MDBox display="flex" justifyContent="space-between" py={1}>
                        <MDTypography variant="caption" color="text">
                          Catégories de revenus:
                        </MDTypography>
                        <MDTypography variant="caption" fontWeight="medium">
                          {categories.filter((c) => c.type === "income").length}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" py={1}>
                        <MDTypography variant="caption" color="text">
                          Catégories de dépenses:
                        </MDTypography>
                        <MDTypography variant="caption" fontWeight="medium">
                          {categories.filter((c) => c.type === "expense").length}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" py={1}>
                        <MDTypography variant="caption" color="text">
                          Transactions totales:
                        </MDTypography>
                        <MDTypography variant="caption" fontWeight="medium">
                          {categoryStats.reduce(
                            (total, stat) => total + (stat.transaction_count || 0),
                            0
                          )}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        {/* Dialog pour créer/éditer une catégorie */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </DialogTitle>
          <DialogContent>
            <MDBox pt={2}>
              <MDBox mb={3}>
                <MDInput
                  label="Nom de la catégorie"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                />
              </MDBox>
              <FormControl fullWidth sx={{ mt: 2, mb: 1 }}>
                <InputLabel>Type de catégorie</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Type de catégorie"
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
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleCloseDialog}>Annuler</MDButton>
            <MDButton
              variant="gradient"
              color="info"
              onClick={handleSubmit}
              disabled={!formData.name.trim()}
            >
              {editingCategory ? "Modifier" : "Créer"}
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Categories;
