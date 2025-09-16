/**
 * Page de profil utilisateur complète
 */

import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Services
import { getCurrentUser, updateProfile, changePassword } from "services/authService";

function ProfilePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", color: "success" });

  // Données du profil
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    solde: "",
    is_active: true,
  });

  // Données pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  // Charger les données du profil au montage du composant
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await getCurrentUser();
      setProfileData({
        first_name: response.first_name || "",
        last_name: response.last_name || "",
        email: response.email || "",
        solde: response.solde || "0.00",
        is_active: response.is_active || true,
      });
    } catch (error) {
      showNotification("Erreur lors du chargement du profil", "error");
    }
  };

  const handleProfileChange = (event) => {
    const { name, value, type, checked } = event.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const showNotification = (message, color = "success") => {
    setNotification({ open: true, message, color });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await updateProfile(profileData);
      showNotification("Profil mis à jour avec succès", "success");
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Erreur lors de la mise à jour du profil",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      showNotification("Les nouveaux mots de passe ne correspondent pas", "error");
      setLoading(false);
      return;
    }

    try {
      await changePassword(passwordData);
      showNotification("Mot de passe modifié avec succès", "success");
      setPasswordData({
        old_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Erreur lors du changement de mot de passe",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDBox mb={3}>
                  <MDTypography variant="h4" fontWeight="medium">
                    Mon Profil
                  </MDTypography>
                </MDBox>

                {/* Tabs */}
                <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                  <Tab label="Informations personnelles" />
                  <Tab label="Changer le mot de passe" />
                </Tabs>

                {/* Onglet Informations personnelles */}
                {activeTab === 0 && (
                  <MDBox component="form" onSubmit={handleProfileSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <MDInput
                          type="text"
                          label="Prénom"
                          name="first_name"
                          value={profileData.first_name}
                          onChange={handleProfileChange}
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDInput
                          type="text"
                          label="Nom"
                          name="last_name"
                          value={profileData.last_name}
                          onChange={handleProfileChange}
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDInput
                          type="email"
                          label="Adresse email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDInput
                          type="text"
                          label="Solde"
                          name="solde"
                          value={profileData.solde}
                          onChange={handleProfileChange}
                          fullWidth
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={profileData.is_active}
                              onChange={handleProfileChange}
                              name="is_active"
                              color="primary"
                            />
                          }
                          label="Compte actif"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <MDButton variant="gradient" color="dark" type="submit" disabled={loading}>
                          {loading ? "Mise à jour..." : "Mettre à jour le profil"}
                        </MDButton>
                      </Grid>
                    </Grid>
                  </MDBox>
                )}

                {/* Onglet Changement de mot de passe */}
                {activeTab === 1 && (
                  <MDBox component="form" onSubmit={handlePasswordSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <MDInput
                          type="password"
                          label="Mot de passe actuel"
                          name="old_password"
                          value={passwordData.old_password}
                          onChange={handlePasswordChange}
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDInput
                          type="password"
                          label="Nouveau mot de passe"
                          name="new_password"
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDInput
                          type="password"
                          label="Confirmer le nouveau mot de passe"
                          name="new_password_confirmation"
                          value={passwordData.new_password_confirmation}
                          onChange={handlePasswordChange}
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <MDBox mt={2}>
                          <MDTypography variant="caption" color="text">
                            Le mot de passe doit contenir au moins 8 caractères avec 1 minuscule, 1
                            majuscule, 1 chiffre et 1 caractère spécial (@$&!%?*)
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12}>
                        <MDButton variant="gradient" color="dark" type="submit" disabled={loading}>
                          {loading ? "Modification..." : "Changer le mot de passe"}
                        </MDButton>
                      </Grid>
                    </Grid>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Notification */}
      <MDSnackbar
        color={notification.color}
        icon={notification.color === "success" ? "check" : "warning"}
        title={notification.color === "success" ? "Succès" : "Erreur"}
        content={notification.message}
        open={notification.open}
        onClose={closeNotification}
        close={closeNotification}
        bgWhite
      />
    </DashboardLayout>
  );
}

export default ProfilePage;
