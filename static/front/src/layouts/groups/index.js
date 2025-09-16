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

function Groups() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
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
                  Groups
                </MDTypography>
              </MDBox>
              <MDBox pt={3} pb={3}>
                <MDBox
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  minHeight="400px"
                  textAlign="center"
                >
                  <MDBox mb={3}>
                    <Icon
                      sx={{
                        fontSize: "4rem",
                        color: "info.main",
                      }}
                    >
                      groups
                    </Icon>
                  </MDBox>
                  <MDTypography variant="h4" fontWeight="medium" color="text" mb={2}>
                    Fonctionnalité à venir
                  </MDTypography>
                  <MDTypography variant="body1" color="text" textAlign="center" px={3} mb={2}>
                    La gestion des groupes sera bientôt disponible. Cette fonctionnalité vous
                    permettra de créer et gérer des groupes pour partager des dépenses et revenus
                    entre plusieurs utilisateurs.
                  </MDTypography>
                  <MDTypography variant="body2" color="text" fontStyle="italic">
                    Restez connecté pour plus de mises à jour !
                  </MDTypography>
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

export default Groups;
