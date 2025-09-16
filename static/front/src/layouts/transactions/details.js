/**
 * Page de détails d'une transaction
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Services
import { getTransactionById } from "services";

function TransactionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      const data = await getTransactionById(id);
      setTransaction(data);
    } catch (err) {
      console.error("Erreur lors du chargement des détails:", err);
      setError("Erreur lors du chargement des détails de la transaction");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownloadProof = () => {
    if (transaction?.preuve) {
      window.open(transaction.preuve, "_blank");
    }
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

  if (error || !transaction) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox mb={2}>
            <Alert severity="error">{error || "Transaction non trouvée"}</Alert>
          </MDBox>
          <MDButton variant="gradient" color="info" onClick={() => navigate("/transactions")}>
            Retour aux transactions
          </MDButton>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h3" fontWeight="medium">
            Détails de la Transaction
          </MDTypography>
          <MDButton variant="gradient" color="info" onClick={() => navigate("/transactions")}>
            Retour aux transactions
          </MDButton>
        </MDBox>

        <Grid container spacing={3}>
          {/* Informations principales */}
          <Grid item xs={12} md={8}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor={transaction.type === "income" ? "success" : "error"}
                borderRadius="lg"
                coloredShadow={transaction.type === "income" ? "success" : "error"}
              >
                <MDBox display="flex" alignItems="center">
                  <Icon color="white" sx={{ mr: 2, fontSize: "2.5rem" }}>
                    {transaction.type === "income" ? "trending_up" : "trending_down"}
                  </Icon>
                  <MDBox>
                    <MDTypography variant="h4" color="white" fontWeight="medium">
                      {transaction.description}
                    </MDTypography>
                    <MDTypography variant="body2" color="white" opacity={0.8}>
                      {transaction.type === "income" ? "Revenu" : "Dépense"}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </MDBox>

              <MDBox p={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <MDBox mb={2}>
                      <MDTypography variant="caption" color="text" fontWeight="bold">
                        Montant
                      </MDTypography>
                      <MDTypography
                        variant="h4"
                        color={transaction.type === "income" ? "success" : "error"}
                        fontWeight="bold"
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {transaction.amount} XOF
                      </MDTypography>
                    </MDBox>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <MDBox mb={2}>
                      <MDTypography variant="caption" color="text" fontWeight="bold">
                        Date
                      </MDTypography>
                      <MDTypography variant="h6" fontWeight="medium">
                        {formatDate(transaction.date)}
                      </MDTypography>
                    </MDBox>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <MDBox mb={2}>
                      <MDTypography variant="caption" color="text" fontWeight="bold">
                        Catégorie
                      </MDTypography>
                      <MDTypography variant="h6" fontWeight="medium">
                        {transaction.category_name}
                      </MDTypography>
                    </MDBox>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <MDBox mb={2}>
                      <MDTypography variant="caption" color="text" fontWeight="bold">
                        Utilisateur
                      </MDTypography>
                      <MDTypography variant="h6" fontWeight="medium">
                        {transaction.user_name}
                      </MDTypography>
                    </MDBox>
                  </Grid>

                  <Grid item xs={12}>
                    <MDBox mb={2}>
                      <MDTypography variant="caption" color="text" fontWeight="bold">
                        Description
                      </MDTypography>
                      <MDTypography variant="body1">{transaction.description}</MDTypography>
                    </MDBox>
                  </Grid>

                  {/* Statut groupe */}
                  <Grid item xs={12}>
                    <MDBox mb={2}>
                      <MDTypography variant="caption" color="text" fontWeight="bold">
                        Type de transaction
                      </MDTypography>
                      <MDBox mt={1}>
                        {transaction.is_group_transaction ? (
                          <Chip
                            label="Transaction de groupe"
                            color="info"
                            icon={<Icon>group</Icon>}
                          />
                        ) : (
                          <Chip
                            label="Transaction personnelle"
                            color="default"
                            icon={<Icon>person</Icon>}
                          />
                        )}
                      </MDBox>
                    </MDBox>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>

          {/* Informations complémentaires */}
          <Grid item xs={12} md={4}>
            {/* Preuve */}
            <Card sx={{ mb: 2 }}>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Preuve de transaction
                </MDTypography>
                {transaction.preuve ? (
                  <MDBox>
                    <MDTypography variant="body2" color="success" mb={2}>
                      ✓ Preuve disponible
                    </MDTypography>
                    <Button
                      variant="outlined"
                      color="info"
                      startIcon={<Icon>download</Icon>}
                      onClick={handleDownloadProof}
                      fullWidth
                    >
                      Télécharger la preuve
                    </Button>
                  </MDBox>
                ) : (
                  <MDTypography variant="body2" color="text">
                    Aucune preuve jointe à cette transaction
                  </MDTypography>
                )}
              </MDBox>
            </Card>

            {/* Métadonnées */}
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Informations système
                </MDTypography>
                <MDBox mb={2}>
                  <MDTypography variant="caption" color="text" fontWeight="bold">
                    ID Transaction
                  </MDTypography>
                  <MDTypography variant="body2">#{transaction.id}</MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="caption" color="text" fontWeight="bold">
                    Créée le
                  </MDTypography>
                  <MDTypography variant="body2">{formatDate(transaction.created_at)}</MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="caption" color="text" fontWeight="bold">
                    Dernière modification
                  </MDTypography>
                  <MDTypography variant="body2">{formatDate(transaction.updated_at)}</MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TransactionDetails;
