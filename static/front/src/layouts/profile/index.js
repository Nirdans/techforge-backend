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

import { useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";

// Overview page components
import Header from "layouts/profile/components/Header";
import PlatformSettings from "layouts/profile/components/PlatformSettings";

function Overview() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header onTabChange={handleTabChange}>
        <MDBox mt={5} mb={3}>
          <Grid container spacing={1}>
            {activeTab === 0 && (
              <Grid item xs={12}>
                <ProfileInfoCard
                  title="informations de l'entreprise"
                  description="Informations d'enregistrement et détails de contact de votre entreprise. Ces informations sont utilisées pour l'identification fiscale et commerciale."
                  info={{
                    email: "entreprise@example.com",
                    ifu: "123456789012345",
                    rccm: "TG-LOM-01-2024-A12-00001",
                    adresse: "123 Avenue de l'Indépendance, Lomé, Togo",
                  }}
                  social={[]}
                  action={{ route: "", tooltip: "Modifier le Profil" }}
                  shadow={false}
                />
              </Grid>
            )}
            {activeTab === 1 && (
              <Grid item xs={12}>
                <PlatformSettings />
              </Grid>
            )}
          </Grid>
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
