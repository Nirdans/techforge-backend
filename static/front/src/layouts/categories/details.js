/**
 * Page des transactions d'une catégorie
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Services
import { getCategoryTransactions } from "services";

function CategoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategoryTransactions();
  }, [id]);

  const fetchCategoryTransactions = async () => {
    try {
      setLoading(true);
      const response = await getCategoryTransactions(id);
      setData(response);
    } catch (err) {
      console.error("Erreur lors du chargement des transactions:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDTypography variant="h6" textAlign="center">
            Chargement des transactions...
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDTypography variant="h6" color="error" textAlign="center">
            {error || "Catégorie non trouvée"}
          </MDTypography>
          <MDBox textAlign="center" mt={2}>
            <MDButton onClick={() => navigate("/categories")}>Retour aux catégories</MDButton>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  const { category, transactions, total_amount, transaction_count } = data;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* En-tête */}
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDBox>
            <MDButton
              onClick={() => navigate("/categories")}
              startIcon={<Icon>arrow_back</Icon>}
              variant="text"
              color="info"
            >
              Retour
            </MDButton>
            <MDTypography variant="h4" gutterBottom>
              {category.name}
            </MDTypography>
            <MDTypography
              variant="body2"
              color={category.type === "income" ? "success" : "error"}
              textTransform="uppercase"
              fontWeight="bold"
            >
              {category.type === "income" ? "Revenus" : "Dépenses"}
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Statistiques */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color={category.type === "income" ? "success" : "error"}>
                  {category.type === "income" ? "trending_up" : "trending_down"}
                </Icon>
                <MDTypography variant="h3" fontWeight="bold" mt={1}>
                  {total_amount ? `${total_amount} XOF` : "0 XOF"}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Montant total
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color="info">
                  receipt
                </Icon>
                <MDTypography variant="h3" fontWeight="bold" mt={1}>
                  {transaction_count}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Transactions
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Liste des transactions */}
        <Card>
          <MDBox pt={3} px={3}>
            <MDTypography variant="h6" fontWeight="medium">
              Transactions
            </MDTypography>
          </MDBox>
          <MDBox p={3}>
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <MDBox
                  key={transaction.id}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  py={2}
                  borderBottom="1px solid #f0f0f0"
                >
                  <MDBox display="flex" alignItems="center">
                    <Icon
                      color={transaction.type === "income" ? "success" : "error"}
                      sx={{ mr: 2 }}
                    >
                      {transaction.type === "income" ? "arrow_upward" : "arrow_downward"}
                    </Icon>
                    <MDBox>
                      <MDTypography variant="button" fontWeight="medium">
                        {transaction.description}
                      </MDTypography>
                      <MDTypography variant="caption" color="text" display="block">
                        {new Date(transaction.date).toLocaleDateString()} - {transaction.user_name}
                      </MDTypography>
                      {transaction.is_group_transaction && transaction.group_name && (
                        <MDTypography variant="caption" color="info" display="block">
                          Groupe: {transaction.group_name}
                        </MDTypography>
                      )}
                    </MDBox>
                  </MDBox>
                  <MDTypography
                    variant="button"
                    color={transaction.type === "income" ? "success" : "error"}
                    fontWeight="medium"
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {transaction.amount} XOF
                  </MDTypography>
                </MDBox>
              ))
            ) : (
              <MDTypography variant="body2" color="text" textAlign="center">
                Aucune transaction dans cette catégorie
              </MDTypography>
            )}
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CategoryDetails;
