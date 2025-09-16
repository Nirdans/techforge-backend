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
import { validateResetCode, requestPasswordReset } from "services";

function ValidateCodeCover() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes en secondes

  // Rediriger si pas d'email
  useEffect(() => {
    if (!email) {
      navigate("/authentication/reset-password/cover");
      return;
    }
  }, [email, navigate]);

  // Décompte
  useEffect(() => {
    if (timeLeft <= 0) {
      navigate("/authentication/reset-password/cover");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  // Formater le temps
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (code.length !== 6) {
      setError("Le code doit contenir 6 caractères");
      setLoading(false);
      return;
    }

    try {
      await validateResetCode(email, code);
      // Rediriger vers la page de confirmation avec les données
      navigate("/authentication/reset-password/confirm", {
        state: { email, code },
      });
    } catch (err) {
      setError(err.response?.data?.error || "Code invalide ou expiré");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      // Relancer la demande de code
      navigate("/authentication/reset-password/cover");
    } catch (err) {
      setError("Erreur lors du renvoi du code");
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
            Code de vérification
          </MDTypography>
          <MDTypography display="block" variant="caption" color="white" my={1}>
            Saisissez le code reçu par email
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            {error && (
              <MDBox mb={2}>
                <MuiAlert severity="error">{error}</MuiAlert>
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

            {/* Code */}
            <MDBox mb={3}>
              <MDInput
                type="text"
                label="Code de vérification (6 caractères)"
                variant="standard"
                fullWidth
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
                  if (value.length <= 6) {
                    setCode(value);
                  }
                }}
                inputProps={{
                  maxLength: 6,
                  style: { textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem" },
                }}
              />
            </MDBox>

            {/* Décompte */}
            <MDBox mb={3} textAlign="center">
              <MDTypography variant="body2" color={timeLeft <= 60 ? "error" : "text"}>
                Temps restant : {formatTime(timeLeft)}
              </MDTypography>
            </MDBox>

            <MDBox mt={6} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={loading || code.length !== 6}
              >
                {loading ? "Vérification..." : "Valider le code"}
              </MDButton>
            </MDBox>

            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Vous n&apos;avez pas reçu le code ?{" "}
                <MDTypography
                  component="button"
                  type="button"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                  onClick={handleResendCode}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  Renvoyer
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default ValidateCodeCover;
