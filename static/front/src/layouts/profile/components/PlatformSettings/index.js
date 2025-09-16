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
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

function PlatformSettings() {
  const [email, setEmail] = useState("entreprise@example.com");
  const [ifu, setIfu] = useState("123456789012345");
  const [rccm, setRccm] = useState("TG-LOM-01-2024-A12-00001");
  const [adresse, setAdresse] = useState("123 Avenue de l'Indépendance, Lomé, Togo");

  const handleSave = () => {
    // Ici vous pouvez ajouter la logique pour sauvegarder les modifications
    console.log("Profil mis à jour:", { email, ifu, rccm, adresse });
  };

  return (
    <Card sx={{ boxShadow: "none" }}>
      <MDBox p={2}>
        <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
          Modifier le profil
        </MDTypography>
      </MDBox>
      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="form" role="form">
          <MDBox mb={2}>
            <MDInput
              type="email"
              label="Email"
              variant="standard"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="text"
              label="IFU"
              variant="standard"
              fullWidth
              value={ifu}
              onChange={(e) => setIfu(e.target.value)}
            />
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="text"
              label="RCCM"
              variant="standard"
              fullWidth
              value={rccm}
              onChange={(e) => setRccm(e.target.value)}
            />
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="text"
              label="Adresse"
              variant="standard"
              fullWidth
              multiline
              rows={3}
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
            />
          </MDBox>
          <MDBox mt={3}>
            <MDButton variant="gradient" color="info" fullWidth onClick={handleSave}>
              Sauvegarder les modifications
            </MDButton>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default PlatformSettings;
