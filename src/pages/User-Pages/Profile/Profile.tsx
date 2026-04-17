import React, { useState, useEffect, useContext } from "react";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WcIcon from "@mui/icons-material/Wc";
import UserContext from "../../../context/user/userContext";
import { useUpdateMember, useImageKitUpload } from "../../../api/Memeber";
import { LoadingComponent } from "../../../App";
import { toast } from "react-toastify";

const Profile: React.FC = () => {
  const { user } = useContext(UserContext);
  // Initialize state once user data is available
  const [formData, setFormData] = useState({
    Name: "",
    gender: "",
    email: "",
    mobileno: "",
    profile_image: null as string | null,
    profile_image_name: "",
    dob: "",
    Father_name: "",
    Nominee_name: "",
    Nominee_Relation: "",
  });
  const [loading, setLoading] = useState(false);

  const imageKit = useImageKitUpload(user?.Member_id)

  // Update state when user data is fetched
  useEffect(() => {
    if (user) {
      setFormData({
        Name: user.Name ?? "",
        gender: user.gender ?? "",
        email: user.email ?? "",
        mobileno: user.mobileno ?? "",
        profile_image: user.profile_image,
        profile_image_name: "",
        dob: user.dob ?? "",
        Father_name: user.Father_name ?? "",
        Nominee_name: user.Nominee_name ?? "",
        Nominee_Relation: user.Nominee_Relation ?? "",
      });
    }
  }, [user]);

  const updateMember = useUpdateMember();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setLoading(true)
    try {
      // Pass the file as a parameter to the mutate function
      imageKit.mutate(file, {
        onSuccess: (data) => {
          if (data.url) {
            setFormData((prev) => ({
              ...prev,
              profile_image: data.url,
              profile_image_name: file.name,
            }));
            toast.success("Image uploaded Successfully");
          } else {
            toast.error("Failed to get image URL");
          }
        },
        onError: (err) => {
          toast.error("Failed to upload image");
          console.error(err);
        },
      });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false)
    }

  };

  const handleSubmit = () => {
    updateMember.mutate(formData);
  };

  return (
    <Card
      sx={{
        margin: "2rem",
        mt: 10,
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      }}
    >
      <CardContent>
        <Accordion defaultExpanded sx={{ boxShadow: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "#0a2558",
              color: "#fff",
            }}
          >
            Basic Details
          </AccordionSummary>
          <AccordionDetails sx={{ padding: "2rem" }}>
            <form style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <TextField
                label="Name"
                name="Name"
                value={formData.Name}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Enter your name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#0a2558" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl>
                <FormLabel sx={{ color: "#0a2558" }}>
                  <WcIcon sx={{ color: "#0a2558" }} />
                  Gender
                </FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={formData.gender}
                  onChange={handleRadioChange}
                >
                  <FormControlLabel
                    value="Male"
                    control={<Radio sx={{ "&.Mui-checked": { color: "#0a2558" } }} />}
                    label="Male"
                  />
                  <FormControlLabel
                    value="Female"
                    control={<Radio sx={{ "&.Mui-checked": { color: "#0a2558" } }} />}
                    label="Female"
                  />
                </RadioGroup>
              </FormControl>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Enter your email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "#0a2558" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Mobile No"
                name="mobileno"
                type="tel"
                value={formData.mobileno}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Enter your mobile number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: "#0a2558" }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Bond Certificate Required Fields */}
              <TextField
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#0a2558" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Father's Name"
                name="Father_name"
                value={formData.Father_name}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Enter father's name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#0a2558" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Nominee Name"
                name="Nominee_name"
                value={formData.Nominee_name}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Enter nominee's name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#0a2558" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Nominee Relation"
                name="Nominee_Relation"
                value={formData.Nominee_Relation}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="e.g. Mother, Father, Spouse"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#0a2558" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl>
                <FormLabel sx={{ color: "#0a2558" }}>Profile Image</FormLabel>
                <Button variant="outlined" component="label" disabled={loading}>
                  Choose File
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
                <span>{formData.profile_image ? formData.profile_image_name : "No file chosen"}</span>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={updateMember.isPending}
                sx={{
                  backgroundColor: "#0a2558",
                  alignSelf: "flex-end",
                  "&:hover": { backgroundColor: "#581c87" },
                }}
              >
                Update
              </Button>
            </form>
          </AccordionDetails>
        </Accordion>
      </CardContent>
      {(updateMember.isPending || loading || imageKit.isPending) && <LoadingComponent />}
    </Card>
  );
};

export default Profile;
