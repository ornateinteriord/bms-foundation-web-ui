import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  InputAdornment,
  IconButton
} from "@mui/material";
import { Visibility, VisibilityOff, PersonOutline, LockOutlined } from "@mui/icons-material";
import BMSLogo from "../../assets/bms_logo.png"; // Import the logo
import { LoadingComponent } from "../../App";
import { useLoginMutation } from "../../api/Auth";
import ForgotPasswordForm from "./components/ForgotPasswordForm";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("rememberedUser");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Validate the structure of the saved data
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.username && parsedUser.password) {
          setFormData({
            username: parsedUser.username,
            password: parsedUser.password,
          });
          setRememberMe(true);
        } else {
          // If data is invalid formatted, remove it to prevent future errors
          localStorage.removeItem("rememberedUser");
        }
      } catch (error) {
        // If saved data is not valid JSON (e.g. was stored as plain text), remove it
        localStorage.removeItem("rememberedUser");
        console.error("Failed to parse rememberedUser data:", error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loginMutation = useLoginMutation();
  const { mutate, isPending } = loginMutation;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Handle Remember Me logic
    if (rememberMe) {
      localStorage.setItem("rememberedUser", JSON.stringify(formData));
    } else {
      localStorage.removeItem("rememberedUser");
    }

    mutate(formData);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#020617",
      }}
    >
      {/* Left side: Branding & Design */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #ea580c 0%, #020617 100%)",
          position: "relative",
          overflow: "hidden",
          p: 6,
        }}
      >
        <Box sx={{ position: "absolute", top: "10%", left: "10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, transparent 70%)", filter: "blur(60px)", borderRadius: "50%" }} />
        <Box sx={{ position: "absolute", bottom: "10%", right: "10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)", filter: "blur(80px)", borderRadius: "50%" }} />
        
        <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <img src={BMSLogo} alt="BMS Finance" style={{ maxWidth: "320px", marginBottom: "2rem", filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.5))" }} />
          <Typography variant="h3" sx={{ color: "white", fontWeight: 900, mb: 2, letterSpacing: "-1px", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
            Welcome to the Future.
          </Typography>
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 500, maxWidth: "500px", margin: "0 auto", lineHeight: 1.6 }}>
            Secure, scalable, and seamless micro-financial services built for your continuous growth.
          </Typography>
        </Box>
      </Box>

      {/* Right side: Login Form */}
      <Box
        sx={{
          flex: { xs: 1, md: 0.6, lg: 0.5 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f172a",
          p: { xs: 3, sm: 6 },
          borderLeft: { md: "1px solid rgba(249, 115, 22, 0.2)" },
          boxShadow: { md: "-20px 0 50px rgba(0,0,0,0.6)" },
          zIndex: 2,
        }}
      >
        <Container component="main" maxWidth="xs" sx={{ p: 0 }}>
          {/* Mobile Logo */}
          <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 4 }}>
            <img src={BMSLogo} alt="BMS" style={{ maxWidth: "200px" }} />
          </Box>
          
          <Box sx={{ mb: 4, textAlign: "left", width: "100%" }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "white", mb: 1 }}>Sign In</Typography>
            <Typography variant="body1" sx={{ color: "#94a3b8" }}>Please enter your credentials to continue.</Typography>
          </Box>

          {isResetMode ? (
            <ForgotPasswordForm onBackToLogin={() => setIsResetMode(false)} />
          ) : (
            <>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2.5 }}
              >
                <TextField
                  required
                  fullWidth
                  id="username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  label="User ID"
                  placeholder="Enter your registered ID"
                  value={formData.username}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputBase-input": { color: "#f8fafc" },
                    "& .MuiInputLabel-root": { color: "#94a3b8" },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                      "&.Mui-focused fieldset": { borderColor: "#f97316", borderWidth: "2px" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#f97316" }
                  }}
                />

                <TextField
                  required
                  fullWidth
                  name="password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  label="Password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          sx={{ color: "#94a3b8" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    "& .MuiInputBase-input": { color: "#f8fafc" },
                    "& .MuiInputLabel-root": { color: "#94a3b8" },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                      "&.Mui-focused fieldset": { borderColor: "#f97316", borderWidth: "2px" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#f97316" }
                  }}
                />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: -0.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{
                          color: "#94a3b8",
                          "&.Mui-checked": { color: "#f97316" },
                        }}
                      />
                    }
                    label={<Typography variant="body2" sx={{ color: "#cbd5e1", fontWeight: 500 }}>Remember me</Typography>}
                  />
                  <MuiLink
                    component="button"
                    type="button"
                    onClick={() => setIsResetMode(true)}
                    underline="hover"
                    sx={{ color: "#f97316", fontSize: "0.875rem", fontWeight: 700 }}
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
                    mt: 2,
                    mb: 2,
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    padding: "14px",
                    borderRadius: "12px",
                    textTransform: "none",
                    boxShadow: "0 8px 20px rgba(249, 115, 22, 0.35)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 25px rgba(249, 115, 22, 0.5)",
                    },
                    "&:disabled": {
                      background: "#334155",
                      color: "#94a3b8",
                      boxShadow: "none",
                    }
                  }}
                >
                  Secure Login
                </Button>

                <Typography variant="body2" sx={{ textAlign: "center", mt: 2, color: "#94a3b8", fontWeight: 500 }}>
                  Ready to start your journey?{" "}
                  <Link
                    to="/register"
                    style={{
                      color: "#34d399",
                      textDecoration: "none",
                      fontWeight: 800,
                      transition: "color 0.2s ease",
                      borderBottom: "1px solid transparent"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderBottom = "1px solid #34d399"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderBottom = "1px solid transparent"; }}
                  >
                    Open an Account
                  </Link>
                </Typography>
              </Box>
            </>
          )}
        </Container>
      </Box>
      {isPending && <LoadingComponent />}
    </Box>
  );
};

export default Login;
