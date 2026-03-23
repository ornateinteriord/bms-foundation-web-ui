import React, { useContext, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  InputAdornment,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Autocomplete,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WcIcon from '@mui/icons-material/Wc';
import LockIcon from '@mui/icons-material/Lock';
// import LocationOnIcon from '@mui/icons-material/LocationOn';
import UserContext from '../../../context/user/userContext';
import { useSignupMutation } from '../../../api/Auth';
import { LoadingComponent } from '../../../App';
import { toast } from 'react-toastify';

const NewResgister: React.FC = () => {
  const { user } = useContext(UserContext)
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [genderError, setGenderError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState<{ memberId: string; password: string }>({
    memberId: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      gender: e.target.value,
    }));
  };

  const { mutate, isPending } = useSignupMutation();

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!formData.gender) {
      setGenderError(true);
      return;
    }
    if (formData.password && formData.password.length <= 5) {
      setErrorMessage("Password must be at least 6 characters*");
      return;
    }
    try {
      mutate({
        sponsor_id: user.Member_id,
        Sponsor_code: user.Member_id,
        Sponsor_name: user.Name,
        spackage: 'BMS Plan',
        ...(formData.packageAmount ? { package_value: Number(formData.packageAmount) } : {}),
        ...formData
      }, {
        onSuccess: (response) => {
          if (response.success) {
            // toast.success("Registration successful");
            setRegistrationData({
              memberId: response.user.Member_id,
              password: formData.password
            });
            setSuccessDialogOpen(true);
            toast.success("Registration successful");
          }
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Registration failed");
        }
      });

    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      // Don't clear form immediately, wait for success
    }
  };

  const handleCloseDialog = () => {
    setSuccessDialogOpen(false);
    // Optionally clear form after successful registration
    setFormData({});
  };

  return (
    <>
      <Card sx={{ margin: '2rem', mt: 10, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <CardContent>
          {/* First Accordion - Joining Details */}
          <Accordion
            defaultExpanded
            sx={{
              boxShadow: 'none',
              '&.MuiAccordion-root': {
                backgroundColor: '#fff'
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: '#0a2558',
                color: '#fff',
                '& .MuiSvgIcon-root': { color: '#fff' }
              }}
            >
              Joining Details
            </AccordionSummary>
            <AccordionDetails sx={{ padding: '2rem' }}>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <TextField
                  label="Sponsor Code"
                  name="sponsorCode"
                  value={user?.Member_id}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#0a2558' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#0a2558',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0a2558',
                      }
                    }
                  }}
                />
                <TextField
                  label="Sponsor Name"
                  name="sponsorName"
                  value={user?.Name}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#0a2558' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#0a2558',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0a2558',
                      }
                    }
                  }}
                />
              </form>
            </AccordionDetails>
          </Accordion>

          {/* Second Accordion - New Member Details */}
          <Accordion
            defaultExpanded
            sx={{
              mt: 2,
              boxShadow: 'none',
              '&.MuiAccordion-root': {
                backgroundColor: '#fff'
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: '#0a2558',
                color: '#fff',
                '& .MuiSvgIcon-root': { color: '#fff' }
              }}
            >
              New Member Details
            </AccordionSummary>
            <AccordionDetails sx={{ padding: '2rem' }}>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <TextField
                  label="Name"
                  name="Name"
                  value={formData.Name || ''}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#0a2558' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#0a2558',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0a2558',
                      }
                    }
                  }}
                />
                <FormControl error={!!genderError}>
                  <FormLabel sx={{ color: '#0a2558', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <WcIcon sx={{ color: '#0a2558' }} />
                    Gender
                  </FormLabel>
                  <RadioGroup
                    row
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleRadioChange}
                  >
                    <FormControlLabel
                      value="Male"
                      control={<Radio sx={{
                        '&.Mui-checked': {
                          color: '#0a2558',
                        }
                      }} />}
                      label="Male"
                    />
                    <FormControlLabel
                      value="Female"
                      control={<Radio sx={{
                        '&.Mui-checked': {
                          color: '#0a2558',
                        }
                      }} />}
                      label="Female"
                    />
                  </RadioGroup>
                </FormControl>
                {genderError && (
                  <FormHelperText sx={{ color: "#d32f2f", marginTop: "-20px" }}>Please select your gender*</FormHelperText>
                )}
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#0a2558' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#0a2558',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0a2558',
                      }
                    }
                  }}
                />
                <TextField
                  label="Mobile"
                  name="mobileno"
                  type="tel"
                  value={formData.mobileno || ''}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your mobile number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: '#0a2558' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#0a2558',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0a2558',
                      }
                    }
                  }}
                />

                <Autocomplete
                  freeSolo
                  options={["1000", "2000", "5000", "10000", "25000", "50000", "100000", "250000", "500000", "1000000", "2500000"]}
                  value={formData.packageAmount || ''}
                  onChange={(_, newValue) => setFormData(prev => ({ ...prev, packageAmount: newValue || '' }))}
                  onInputChange={(_, newInputValue) => setFormData(prev => ({ ...prev, packageAmount: newInputValue }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Package Amount"
                      variant="outlined"
                      placeholder="e.g. 15000"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#0a2558' },
                          '&.Mui-focused fieldset': { borderColor: '#0a2558' }
                        }
                      }}
                    />
                  )}
                />
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password || ''}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your password"
                  error={!!errorMessage}
                  helperText={errorMessage}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#0a2558' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#0a2558',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0a2558',
                      }
                    }
                  }}
                />
              </form>
            </AccordionDetails>
          </Accordion>

          {/* Register Button */}
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isPending}
            sx={{
              textTransform: "capitalize",
              backgroundColor: '#0a2558',
              margin: '1rem',
              float: 'right',
              '&:hover': {
                backgroundColor: '#581c87'
              },
              '&:disabled': {
                backgroundColor: '#cccccc'
              }
            }}
          >
            {isPending ? 'Registering...' : 'Register'}
          </Button>
        </CardContent>
        {isPending && <LoadingComponent />}
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
            backgroundColor: '#0a2558',
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
              backgroundColor: '#0a2558',
              '&:hover': {
                backgroundColor: '#581c87'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewResgister;