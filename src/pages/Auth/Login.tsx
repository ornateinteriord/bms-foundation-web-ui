import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
} from "@mui/material";
import BMSLogo from "../../assets/bms_logo.png"; // Import the logo
import LogBg from "../../assets/log_bg.jpg";
import { LoadingComponent } from "../../App";
import { useLoginMutation } from "../../api/Auth";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loginMutation = useLoginMutation()
  const { mutate, isPending } = loginMutation

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <Box
      sx={{
        minHeight: "95vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffff", // distinct plain dark color
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            mt: { xs: 3, md: 5 }
          }}
        >
          <Card
            sx={{
              width: "100%",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
              backgroundImage: `url(${LogBg})`, // Dark semi-transparent background
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <CardContent sx={{ padding: "1rem" }}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <img
                  src={BMSLogo}
                  alt="BMS Logo"
                  style={{ maxWidth: "180px", height: "80px" }}
                />
              </Box>
              <Typography
                component="h1"
                variant="h5"
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  textAlign: "center",
                  mb: 1,
                }}
              >
                Sign Into Your Account
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#ffff", textAlign: "center", mb: 3 }}
              >
                Enter your credentials to access your account
              </Typography>

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#ffff", mb: 0.5, display: "block" }}
                  >
                    User ID
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    id="username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    placeholder="User ID"
                    value={formData.username}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#e5e5e5", // Light gray input background
                        borderRadius: "4px",
                        "& fieldset": { border: "none" },
                      },
                      "& input": {
                        padding: "10px 14px",
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#ffff", mb: 0.5, display: "block" }}
                  >
                    Password
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#e5e5e5", // Light gray input background
                        borderRadius: "4px",
                        "& fieldset": { border: "none" },
                      },
                      "& input": {
                        padding: "10px 14px",
                      },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{
                          color: "#666",
                          "&.Mui-checked": {
                            color: "#666",
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: "#ffff" }}>
                        Remember me
                      </Typography>
                    }
                  />
                  <MuiLink
                    href="#"
                    underline="hover"
                    sx={{ color: "#5e81f4", fontSize: "0.875rem" }}
                  >
                    Forgot password?
                  </MuiLink>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isPending}
                  sx={{
                    background:
                      "linear-gradient(90deg, #374151 0%, #d4af37 100%)", // Gradient
                    color: "white",
                    fontWeight: "bold",
                    padding: "10px",
                    textTransform: "uppercase",
                    "&:hover": {
                      opacity: 0.9,
                    },
                  }}
                >
                  LOG IN
                </Button>

                <Typography
                  variant="body2"
                  sx={{ textAlign: "center", mt: 2, color: "#ffff" }}
                >
                  New user? Register here{" "}
                  <Link
                    to="/register"
                    style={{
                      color: "#22c55e",
                      textDecoration: "none",
                      fontWeight: "normal",
                    }}
                  >
                    Register Now
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
      {isPending && <LoadingComponent />}
    </Box>
  );
};

export default Login;
