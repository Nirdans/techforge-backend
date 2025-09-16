/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Services
import { getDashboardData } from "services";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error("Erreur lors du chargement du dashboard:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDTypography variant="h6" textAlign="center">
            Chargement des données...
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDTypography variant="h6" color="error" textAlign="center">
            {error}
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  const { user, statistics, recent_transactions, active_groups } = dashboardData || {};

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Bienvenue */}
        <MDBox mb={3}>
          <MDTypography variant="h4" gutterBottom>
            Bienvenue, {user?.first_name} {user?.last_name}
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Voici un aperçu de vos finances
          </MDTypography>
        </MDBox>

        {/* Statistiques principales */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="account_balance_wallet"
                title="Solde Total"
                count={`${statistics?.total_balance || "0.00"} XOF`}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Solde actuel",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="receipt"
                title="Transactions"
                count={statistics?.total_transactions || 0}
                percentage={{
                  color: "info",
                  amount: "",
                  label: "Total des transactions",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="groups"
                title="Groupes"
                count={statistics?.total_groups || 0}
                percentage={{
                  color: "primary",
                  amount: "",
                  label: "Groupes actifs",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="person"
                title="Solde Personnel"
                count={`${user?.solde || "0.00"} XOF`}
                percentage={{
                  color: "dark",
                  amount: "",
                  label: "Votre solde",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* Transactions récentes et groupes */}
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            {/* Transactions récentes */}
            <Grid item xs={12} lg={6}>
              <Card>
                <MDBox pt={3} px={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Transactions Récentes
                  </MDTypography>
                </MDBox>
                <MDBox p={3}>
                  {recent_transactions && recent_transactions.length > 0 ? (
                    recent_transactions.map((transaction) => (
                      <MDBox
                        key={transaction.id}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        py={1}
                        borderBottom="1px solid #f0f0f0"
                      >
                        <MDBox display="flex" alignItems="center">
                          <Icon
                            color={transaction.type === "income" ? "success" : "error"}
                            sx={{ mr: 1 }}
                          >
                            {transaction.type === "income" ? "arrow_upward" : "arrow_downward"}
                          </Icon>
                          <MDBox>
                            <MDTypography variant="button" fontWeight="medium">
                              {transaction.description}
                            </MDTypography>
                            <MDTypography variant="caption" color="text" display="block">
                              {new Date(transaction.date).toLocaleDateString()}
                            </MDTypography>
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
                    <MDTypography variant="body2" color="text">
                      Aucune transaction récente
                    </MDTypography>
                  )}
                </MDBox>
              </Card>
            </Grid>

            {/* Groupes actifs */}
            <Grid item xs={12} lg={6}>
              <Card>
                <MDBox pt={3} px={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Groupes Actifs
                  </MDTypography>
                </MDBox>
                <MDBox p={3}>
                  {active_groups && active_groups.length > 0 ? (
                    active_groups.map((group) => (
                      <MDBox
                        key={group.id}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        py={1}
                        borderBottom="1px solid #f0f0f0"
                      >
                        <MDBox>
                          <MDTypography variant="button" fontWeight="medium">
                            {group.name}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block">
                            Rôle: {group.role}
                          </MDTypography>
                        </MDBox>
                        <MDTypography variant="button" fontWeight="medium" color="info">
                          {group.amount} XOF
                        </MDTypography>
                      </MDBox>
                    ))
                  ) : (
                    <MDTypography variant="body2" color="text">
                      Aucun groupe actif
                    </MDTypography>
                  )}
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
