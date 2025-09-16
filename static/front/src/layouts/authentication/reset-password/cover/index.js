/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

// Services
import { requestPasswordReset } from "services/authService";

// Images
import bgImage from "assets/images/bg-reset-cover.jpeg";

function Cover() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await requestPasswordReset(email);
      // Rediriger vers la page de validation du code
      navigate("/authentication/reset-password/validate-code", {
        state: { email },
      });
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'envoi du code");
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
            Mot de passe oublié ?
          </MDTypography>
          <MDTypography display="block" variant="caption" color="white" my={1}>
            Entrez votre email pour recevoir un code de réinitialisation
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            {error && (
              <MDBox mb={2}>
                <MuiAlert severity="error">{error}</MuiAlert>
              </MDBox>
            )}

            <MDBox mb={4}>
              <MDInput
                type="email"
                label="Email"
                variant="standard"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </MDBox>
            <MDBox mt={6} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={loading || !email}
              >
                {loading ? "Envoi en cours..." : "Envoyer le code"}
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

export default Cover;
