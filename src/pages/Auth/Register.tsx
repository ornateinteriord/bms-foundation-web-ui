import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Card,
  CardContent,
  InputAdornment,
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import WcIcon from "@mui/icons-material/Wc";
import BMSLogo from "../../assets/bms_logo.png"; // Import the logo
import "./Register.scss";
import { useGetSponserRef, useSignupMutation } from "../../api/Auth";
import { LoadingComponent } from "../../App";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref") || "";
  const [formData, setFormData] = useState<Record<string, string>>({
    Sponsor_code: "",
    Sponsor_name: "",
    gender: "",
    Name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileno: "",
    pincode: "",
  });

  const [isChecked, setIsChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [genderError, setGenderError] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState<{ memberId: string; password: string; email: string }>({
    memberId: '',
    password: '',
    email: ''
  });

  const {
    data: sponsorData,
    isLoading,
    isError,
    error,
    refetch
  } = useGetSponserRef(formData.Sponsor_code);

  // Auto-populate sponsor code from URL when component mounts
  useEffect(() => {
    if (refCode) {
      setFormData(prev => ({
        ...prev,
        Sponsor_code: refCode
      }));
    }
  }, [refCode]);

  // Fetch sponsor details when sponsor code changes
  useEffect(() => {
    if (formData.Sponsor_code && formData.Sponsor_code.length >= 5) {
      refetch();
    }
  }, [formData.Sponsor_code, refetch]);

  // Update sponsor name when sponsor data is fetched
  useEffect(() => {
    if (sponsorData && sponsorData.name) {
      setFormData(prev => ({
        ...prev,
        Sponsor_name: sponsorData.name
      }));
    } else if (isError) {
      // Clear sponsor name if there's an error
      setFormData(prev => ({
        ...prev,
        Sponsor_name: ""
      }));
    }
  }, [sponsorData, isError]);

  const sponsorError = isError && error instanceof Error ? error.message : "";

  const handleSponsorCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSponsorCode = e.target.value;
    setFormData(prev => ({
      ...prev,
      Sponsor_code: newSponsorCode,
      Sponsor_name: "" // Clear sponsor name when code changes
    }));
  };

  const handleSponsorCodeBlur = () => {
    if (formData.Sponsor_code && formData.Sponsor_code.length >= 5) {
      refetch();
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    setErrorMessage("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({
      ...prevData,
      gender: e.target.value,
    }));
    setGenderError(false);
  };

  const { mutate, isPending } = useSignupMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.gender) {
      setGenderError(true);
      return;
    }

    if (!formData.password || formData.password.length <= 5) {
      setErrorMessage("Password must be at least 6 characters*");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (!formData.Sponsor_code || formData.Sponsor_code.length < 5) {
      setErrorMessage("Valid sponsor code is required");
      return;
    }

    if (!formData.Sponsor_name) {
      setErrorMessage("Please enter a valid sponsor code");
      return;
    }

    try {
      // Create the final data object with the required structure
      const finalData = {
        sponsor_id: formData.Sponsor_code,  // Using Sponsor_code as sponsor_id
        Sponsor_code: formData.Sponsor_code,
        Sponsor_name: formData.Sponsor_name,
        ...formData // Spread all other form data
      };

      mutate(finalData, {
        onSuccess: (response) => {
          if (response.success) {
            setRegistrationData({
              memberId: response.user.Member_id,
              password: formData.password,
              email: formData.email
            });
            setSuccessDialogOpen(true);
          }
        },
        onError: (error) => {
          setErrorMessage(error.response?.data?.message || "Registration failed");
        }
      });

    } catch (error) {
      console.error("Registration failed:", error);
      setErrorMessage("Registration failed. Please try again.");
    }
  };

  const handleCloseDialog = () => {
    setSuccessDialogOpen(false);
    // Navigate to login after closing dialog
    navigate("/login");
  };

  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mt: 8,
        // backgroundColor: "#ffff", // consistent with Login
        paddingTop: "10px",
        paddingBottom: "10px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Card
          sx={{
            width: "100%",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
            backgroundColor: "rgba(30, 30, 30, 0.95)", // Dark semi-transparent background
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <CardContent sx={{ padding: "2rem" }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <img
                src={BMSLogo}
                alt="BMS Logo"
                style={{ maxWidth: "150px", height: "auto" }}
              />
            </Box>
            <Typography
              component="h1"
              variant="h5"
              sx={{ color: "#fff", mb: 1, textAlign: "center", fontWeight: "bold" }}
            >
              Create Account
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
              <Grid container spacing={2}>
                {/* Sponsor Code */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="Sponsor_code"
                    placeholder="Sponsor code"
                    value={formData.Sponsor_code}
                    onChange={handleSponsorCodeChange}
                    onBlur={handleSponsorCodeBlur}
                    error={(formData.Sponsor_code.length > 0 && formData.Sponsor_code.length < 5) || (formData.Sponsor_code.length >= 5 && !!sponsorError)}
                    helperText={
                      formData.Sponsor_code.length > 0 && formData.Sponsor_code.length < 5
                        ? "Sponsor code must be at least 5 characters."
                        : formData.Sponsor_code.length >= 5 && sponsorError
                          ? sponsorError
                          : ""
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#000831" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#e5e5e5",
                        borderRadius: "4px",
                        "& fieldset": { border: "none" },
                      },
                      "& .MuiInputLabel-root": { color: "#9ca3af" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
                    }}
                  />
                </Grid>

                {/* Sponsor Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="Sponsor_name"
                    placeholder="Sponsor Name"
                    value={formData.Sponsor_name}
                    onChange={handleChange}
                    disabled={true}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: "#000831" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#e5e5e5",
                        borderRadius: "4px",
                        "& fieldset": { border: "none" },
                      },
                      "& .MuiInputLabel-root": { color: "#9ca3af" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
                    }}
                  />
                </Grid>

                {/* Full Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="Name"
                    name="Name"
                    autoComplete="Name"
                    placeholder="Enter your full name"
                    value={formData.Name}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: "#000831" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#e5e5e5",
                        borderRadius: "4px",
                        "& fieldset": { border: "none" },
                      },
                      "& .MuiInputLabel-root": { color: "#9ca3af" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
                    }}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    name="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: "#000831" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#e5e5e5",
                        borderRadius: "4px",
                        "& fieldset": { border: "none" },
                      },
                      "& .MuiInputLabel-root": { color: "#9ca3af" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
                    }}
                  />
                </Grid>

                {/* Password */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#000831" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#e5e5e5",
                        borderRadius: "4px",
                        "& fieldset": { border: "none" },
                      },
                      "& .MuiInputLabel-root": { color: "#9ca3af" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
                    }}
                  />
                </Grid>

                {/* Confirm Password */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errorMessage}
                    helperText={errorMessage}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#000831" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#e5e5e5",
                        borderRadius: "4px",
                        "& fieldset": { border: "none" },
                      },
                      "& .MuiInputLabel-root": { color: "#9ca3af" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
                    }}
                  />
                </Grid>

                {/* Mobile Number */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="mobileno"
                    type="tel"
                    autoComplete="mobileno"
                    placeholder="Enter your number"
                    value={formData.mobileno}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: "#000831" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#e5e5e5",
                        borderRadius: "4px",
                        "& fieldset": { border: "none" },
                      },
                      "& .MuiInputLabel-root": { color: "#9ca3af" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
                    }}
                  />
                </Grid>

                {/* Pin Code */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="pincode"
                    autoComplete="pincode"
                    placeholder="Enter your pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon sx={{ color: "#000831" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#e5e5e5",
                        borderRadius: "4px",
                        "& fieldset": { border: "none" },
                      },
                      "& .MuiInputLabel-root": { color: "#9ca3af" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
                    }}
                  />
                </Grid>

                {/* Gender */}
                <Grid item xs={12}>
                  <FormControl
                    error={!!genderError}
                    component="fieldset"
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                      ml: 1
                    }}
                  >
                    <FormLabel component="legend" sx={{ color: "#fff !important", display: 'flex', alignItems: 'center' }}>
                      <WcIcon sx={{ mr: 1, color: "#fff" }} />
                      Gender:
                    </FormLabel>
                    <RadioGroup
                      row
                      name="gender"
                      value={formData.gender}
                      onChange={handleRadioChange}
                    >
                      <FormControlLabel
                        value="Male"
                        control={<Radio sx={{ color: "#bbb", "&.Mui-checked": { color: "#fff" } }} />}
                        label={<span style={{ color: "#fff" }}>Male</span>}
                      />
                      <FormControlLabel
                        value="Female"
                        control={<Radio sx={{ color: "#bbb", "&.Mui-checked": { color: "#fff" } }} />}
                        label={<span style={{ color: "#fff" }}>Female</span>}
                      />
                    </RadioGroup>
                  </FormControl>
                  {genderError && (
                    <FormHelperText sx={{ color: "#d32f2f", ml: 1 }}>
                      Please select your gender*
                    </FormHelperText>
                  )}
                </Grid>

                {/* Terms and Checkbox */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                        sx={{ color: "#bbb", "&.Mui-checked": { color: "#fff" } }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: "#fff" }}>
                        I accept the Terms and Conditions
                      </Typography>
                    }
                  />
                </Grid>

                {/* Register Button */}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={!isChecked || isPending}
                    sx={{
                      background: "linear-gradient(90deg, #3d5a88ff 0%, #d4af37 100%)",
                      color: "white",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      maxWidth: "300px",
                      py: 1.5,
                      "&:hover": {
                        opacity: 0.9,
                      },
                    }}
                  >
                    {isPending ? "Registering..." : "Register"}
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Typography variant="body2" sx={{ textAlign: "center", mt: 1, color: "#fff" }}>
              Have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#22c55e",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Login
              </Link>
            </Typography>

            <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
              <Link
                to="/recover-password"
                style={{
                  color: "#5e81f4",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Recover Password
              </Link>
            </Typography>
          </CardContent>
        </Card>

        {/* Success Dialog */}
        <Dialog
          open={successDialogOpen}
          onClose={handleCloseDialog}
          aria-labelledby="registration-success-dialog"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            id="registration-success-dialog"
            sx={{
              backgroundColor: '#000831',
              color: 'white',
              textAlign: 'center'
            }}
          >
            Registration Successful!
          </DialogTitle>
          <DialogContent sx={{ padding: '2rem' }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
              New Member Created Successfully
            </Typography>
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Member ID:</strong> {registrationData.memberId}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Email:</strong> {registrationData.email}
              </Typography>
              <Typography variant="body1">
                <strong>Password:</strong> {registrationData.password}
              </Typography>
            </div>
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: '#64748b'
              }}
            >
              Please save these credentials securely. The member ID will be used for login.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ padding: '1rem 2rem 2rem' }}>
            <Button
              onClick={handleCloseDialog}
              variant="contained"
              sx={{
                textTransform: "capitalize",
                backgroundColor: '#000831',
                '&:hover': {
                  backgroundColor: '#000831'
                }
              }}
            >
              Login
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {(isLoading || isPending) && <LoadingComponent />}
    </Container>
  );
};

export default Register;