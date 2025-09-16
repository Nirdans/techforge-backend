// react-router-dom components
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Services
import { register } from "services";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

function Cover() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field) => (e) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = "Le prénom est requis";
    } else if (formData.first_name.length > 150) {
      newErrors.first_name = "Le prénom ne peut pas dépasser 150 caractères";
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Le nom est requis";
    } else if (formData.last_name.length > 150) {
      newErrors.last_name = "Le nom ne peut pas dépasser 150 caractères";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (formData.email.length > 254) {
      newErrors.email = "L'email ne peut pas dépasser 254 caractères";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    }

    // Password confirmation validation
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "La confirmation du mot de passe est requise";
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !agreed) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      if (response) {
        // Rediriger vers le dashboard après inscription réussie
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);

      // Gérer les erreurs de validation du serveur
      if (error.message && error.message.includes("400")) {
        setErrors({
          general: "Données de formulaire invalides. Veuillez vérifier vos informations.",
        });
      } else if (error.message && error.message.includes("409")) {
        setErrors({ email: "Cette adresse email est déjà utilisée." });
      } else {
        setErrors({
          general: "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            {errors.general && (
              <MDBox mb={2}>
                <MDTypography variant="caption" color="error" fontSize="0.75rem">
                  {errors.general}
                </MDTypography>
              </MDBox>
            )}

            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Prénom *"
                variant="standard"
                fullWidth
                value={formData.first_name}
                onChange={handleInputChange("first_name")}
                error={!!errors.first_name}
                inputProps={{ maxLength: 150 }}
              />
              {errors.first_name && (
                <MDTypography variant="caption" color="error" fontSize="0.75rem">
                  {errors.first_name}
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Nom *"
                variant="standard"
                fullWidth
                value={formData.last_name}
                onChange={handleInputChange("last_name")}
                error={!!errors.last_name}
                inputProps={{ maxLength: 150 }}
              />
              {errors.last_name && (
                <MDTypography variant="caption" color="error" fontSize="0.75rem">
                  {errors.last_name}
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Adresse email *"
                variant="standard"
                fullWidth
                value={formData.email}
                onChange={handleInputChange("email")}
                error={!!errors.email}
                inputProps={{ maxLength: 254 }}
              />
              {errors.email && (
                <MDTypography variant="caption" color="error" fontSize="0.75rem">
                  {errors.email}
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Mot de passe *"
                variant="standard"
                fullWidth
                value={formData.password}
                onChange={handleInputChange("password")}
                error={!!errors.password}
              />
              {errors.password && (
                <MDTypography variant="caption" color="error" fontSize="0.75rem">
                  {errors.password}
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Confirmation du mot de passe *"
                variant="standard"
                fullWidth
                value={formData.password_confirmation}
                onChange={handleInputChange("password_confirmation")}
                error={!!errors.password_confirmation}
              />
              {errors.password_confirmation && (
                <MDTypography variant="caption" color="error" fontSize="0.75rem">
                  {errors.password_confirmation}
                </MDTypography>
              )}
            </MDBox>

            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;J&apos;accepte les&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Termes et Conditions
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={!agreed || isLoading}
              >
                {isLoading ? "Inscription en cours..." : "S'inscrire"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Vous avez déjà un compte?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Se connecter
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;
