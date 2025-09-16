/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import MuiAlert from "@mui/material/Alert";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-reset-cover.jpeg";

// Services
import { confirmPasswordReset } from "services";

function ConfirmResetCover() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const code = location.state?.code || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Rediriger si pas d'email ou de code
  useEffect(() => {
    if (!email || !code) {
      navigate("/authentication/reset-password/cover");
      return;
    }
  }, [email, code, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setLoading(false);
      return;
    }

    try {
      await confirmPasswordReset({
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccess("Mot de passe réinitialisé avec succès !");

      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate("/authentication/sign-in");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Erreur lors de la réinitialisation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          py={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Nouveau mot de passe
          </MDTypography>
          <MDTypography display="block" variant="caption" color="white" my={1}>
            Saisissez votre nouveau mot de passe
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            {error && (
              <MDBox mb={2}>
                <MuiAlert severity="error">{error}</MuiAlert>
              </MDBox>
            )}

            {success && (
              <MDBox mb={2}>
                <MuiAlert severity="success">{success}</MuiAlert>
              </MDBox>
            )}

            {/* Email (lecture seule) */}
            <MDBox mb={3}>
              <MDInput
                type="email"
                label="Email"
                variant="standard"
                fullWidth
                value={email}
                disabled
              />
            </MDBox>

            {/* Code caché */}
            <input type="hidden" value={code} />

            {/* Nouveau mot de passe */}
            <MDBox mb={3}>
              <MDInput
                type="password"
                label="Nouveau mot de passe"
                variant="standard"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <MDTypography variant="caption" color="text" fontSize="0.75rem">
                Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
              </MDTypography>
            </MDBox>

            {/* Confirmation mot de passe */}
            <MDBox mb={3}>
              <MDInput
                type="password"
                label="Confirmer le mot de passe"
                variant="standard"
                fullWidth
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
            </MDBox>

            <MDBox mt={6} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={loading || !password || !passwordConfirmation}
              >
                {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              </MDButton>
            </MDBox>

            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Retour à la{" "}
                <MDTypography
                  component="a"
                  href="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  connexion
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default ConfirmResetCover;
