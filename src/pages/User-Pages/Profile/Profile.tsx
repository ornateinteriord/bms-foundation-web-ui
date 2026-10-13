import React, { useState, useEffect, useContext, useRef } from "react";
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
  Box,
  InputAdornment,
  Avatar,
  Typography,
  Grid,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WcIcon from "@mui/icons-material/Wc";
import BadgeIcon from "@mui/icons-material/Badge";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import HomeIcon from "@mui/icons-material/Home";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import UserContext from "../../../context/user/userContext";
import { useUpdateMember, useImageKitUpload, useUploadKYCDocument } from "../../../api/Memeber";
import { LoadingComponent } from "../../../App";
import { toast } from "react-toastify";

const Profile: React.FC = () => {
  const { user } = useContext(UserContext);

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
    Pan_no: "",
    aadharcard_no: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  // Identity document images
  const [panImage, setPanImage] = useState<string | null>(null);
  const [aadhaarImage, setAadhaarImage] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const isInitializedRef = useRef(false);
  const isDirtyRef = useRef(false);
  const currentMemberIdRef = useRef<string | null>(null);

  const getDraftKey = (memberId?: string) => `bms_profile_draft_${memberId || currentMemberIdRef.current || 'temp'}`;

  const saveDraft = (data: typeof formData, currentPanImg: string | null, currentAadhaarImg: string | null) => {
    try {
      const key = getDraftKey(user?.Member_id);
      localStorage.setItem(
        key,
        JSON.stringify({
          formData: data,
          panImage: currentPanImg,
          aadhaarImage: currentAadhaarImg,
        })
      );
    } catch (err) {
      console.warn("Failed to save profile draft to localStorage:", err);
    }
  };

  const clearDraft = (memberId?: string) => {
    try {
      const key = getDraftKey(memberId || user?.Member_id);
      localStorage.removeItem(key);
    } catch (err) {
      console.warn("Failed to clear profile draft:", err);
    }
  };

  const uploadPanImage = useUploadKYCDocument(user?.Member_id || '', 'pan');
  const uploadAadhaarImage = useUploadKYCDocument(user?.Member_id || '', 'aadhaar');

  const imageKit = useImageKitUpload(user?.Member_id);

  // Initialize or update state when user data is fetched
  useEffect(() => {
    if (!user) return;

    const memberId = user.Member_id;
    const isDifferentMember = currentMemberIdRef.current !== memberId;

    if (isDifferentMember) {
      currentMemberIdRef.current = memberId;
      isInitializedRef.current = false;
      isDirtyRef.current = false;
    }

    // Attempt to load saved draft from localStorage
    let savedDraft: any = null;
    try {
      const rawDraft = localStorage.getItem(getDraftKey(memberId));
      if (rawDraft) {
        savedDraft = JSON.parse(rawDraft);
      }
    } catch (err) {
      console.warn("Failed to load profile draft:", err);
    }

    const formattedDob = user.dob
      ? (typeof user.dob === "string" && user.dob.includes("T") ? user.dob.split("T")[0] : user.dob)
      : "";

    const serverData = {
      Name: user.Name ?? "",
      gender: user.gender ?? "",
      email: user.email ?? "",
      mobileno: user.mobileno ?? "",
      profile_image: user.profile_image ?? null,
      profile_image_name: "",
      dob: formattedDob,
      Father_name: user.Father_name ?? "",
      Nominee_name: user.Nominee_name ?? "",
      Nominee_Relation: user.Nominee_Relation ?? "",
      Pan_no: user.Pan_no || (user as any).pan_no || "",
      aadharcard_no: user.aadharcard_no || (user as any).aadhar_no || "",
      address: user.address ?? "",
    };

    if (!isInitializedRef.current) {
      if (savedDraft && savedDraft.formData) {
        // Restore user's unsaved draft (e.g. after switching apps or mobile tab reload)
        setFormData({
          ...serverData,
          ...savedDraft.formData,
        });
        setPanImage(savedDraft.panImage !== undefined ? savedDraft.panImage : (user.panImage || null));
        setAadhaarImage(savedDraft.aadhaarImage !== undefined ? savedDraft.aadhaarImage : (user.aadhaarImage || null));
        isDirtyRef.current = true;
      } else {
        setFormData(serverData);
        setPanImage(user.panImage || null);
        setAadhaarImage(user.aadhaarImage || null);
      }
      isInitializedRef.current = true;
    } else {
      // If already initialized and user has modified inputs, DO NOT overwrite with background refetch data!
      if (!isDirtyRef.current) {
        setFormData(serverData);
        setPanImage(user.panImage || null);
        setAadhaarImage(user.aadhaarImage || null);
      }
    }
  }, [user]);

  const updateMember = useUpdateMember();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let { name, value } = e.target;
    // Format PAN number (uppercase, max 10 chars)
    if (name === "Pan_no") {
      value = value.toUpperCase().slice(0, 10);
    }
    // Format Aadhaar number (numeric digits only, max 12 digits)
    else if (name === "aadharcard_no") {
      value = value.replace(/\D/g, "").slice(0, 12);
    }

    isDirtyRef.current = true;
    setFormData((prevData) => {
      const nextData = {
        ...prevData,
        [name]: value,
      };
      saveDraft(nextData, panImage, aadhaarImage);
      return nextData;
    });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    isDirtyRef.current = true;
    setFormData((prevData) => {
      const nextData = {
        ...prevData,
        gender: val,
      };
      saveDraft(nextData, panImage, aadhaarImage);
      return nextData;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setLoading(true);
    try {
      imageKit.mutate(file, {
        onSuccess: (data) => {
          if (data.url) {
            isDirtyRef.current = true;
            setFormData((prev) => {
              const next = {
                ...prev,
                profile_image: data.url,
                profile_image_name: file.name,
              };
              saveDraft(next, panImage, aadhaarImage);
              return next;
            });
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
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    updateMember.mutate(
      {
        ...formData,
        pan_no: formData.Pan_no, // Sync pan_no and Pan_no for backend schema compatibility
        panImage,
        aadhaarImage,
      },
      {
        onSuccess: () => {
          isDirtyRef.current = false;
          clearDraft(user?.Member_id);
        },
      }
    );
  };

  // ── Document image upload handlers ──────────────────────────
  const handleDocImageUpload = async (type: 'pan' | 'aadhaar', file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return; }
    setUploadingDoc(type);
    try {
      const uploader = type === 'pan' ? uploadPanImage : uploadAadhaarImage;
      const result = await uploader.mutateAsync(file);
      isDirtyRef.current = true;
      if (type === 'pan') {
        setPanImage(result.url);
        saveDraft(formData, result.url, aadhaarImage);
      } else {
        setAadhaarImage(result.url);
        saveDraft(formData, panImage, result.url);
      }
      toast.success(`${type === 'pan' ? 'PAN' : 'Aadhaar'} image uploaded!`);
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleRemovePanImage = () => {
    isDirtyRef.current = true;
    setPanImage(null);
    saveDraft(formData, null, aadhaarImage);
  };

  const handleRemoveAadhaarImage = () => {
    isDirtyRef.current = true;
    setAadhaarImage(null);
    saveDraft(formData, panImage, null);
  };

  return (
    <Card
      sx={{
        margin: "1rem", // Reduced margin
        mt: 2, // Signficantly reduced top margin
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
              <TextField
                label="PAN Number"
                name="Pan_no"
                value={formData.Pan_no}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Enter PAN number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon sx={{ color: "#0a2558" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Aadhaar Number"
                name="aadharcard_no"
                value={formData.aadharcard_no}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Enter Aadhaar number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FingerprintIcon sx={{ color: "#0a2558" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                placeholder="Enter your full address"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon sx={{ color: "#0a2558" }} />
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

              {/* ── Identity Document Image Uploads ───────────────── */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0a2558', mb: 1.5 }}>
                  Identity Document Images
                </Typography>
                <Grid container spacing={2}>
                  {/* PAN Image */}
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1.5}>
                          <BadgeIcon sx={{ color: '#0a2558', mr: 1 }} />
                          <Typography variant="subtitle2" fontWeight="bold">PAN Card Image</Typography>
                        </Box>
                        {panImage ? (
                          <Box>
                            <Box
                              component="img"
                              src={panImage}
                              alt="PAN Card"
                              sx={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 1, mb: 1 }}
                            />
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Button size="small" variant="outlined" onClick={() => window.open(panImage, '_blank')} sx={{ flex: 1, mr: 1 }}>View</Button>
                              <IconButton color="error" size="small" onClick={handleRemovePanImage} disabled={uploadingDoc === 'pan'}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        ) : (
                          <Box>
                            <input accept="image/*" id="upload-pan" type="file" style={{ display: 'none' }}
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDocImageUpload('pan', f); }}
                              disabled={uploadingDoc === 'pan'}
                            />
                            <label htmlFor="upload-pan">
                              <Button variant="outlined" component="span" fullWidth disabled={uploadingDoc === 'pan'}
                                startIcon={uploadingDoc === 'pan' ? <CircularProgress size={18} /> : <CloudUploadIcon />}
                                sx={{ height: 140, borderStyle: 'dashed', borderWidth: 2, '&:hover': { borderColor: '#0a2558', bgcolor: 'rgba(10,37,88,0.04)' } }}
                              >
                                {uploadingDoc === 'pan' ? 'Uploading...' : 'Upload PAN Image'}
                              </Button>
                            </label>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Aadhaar Image */}
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1.5}>
                          <FingerprintIcon sx={{ color: '#0a2558', mr: 1 }} />
                          <Typography variant="subtitle2" fontWeight="bold">Aadhaar Card Image</Typography>
                        </Box>
                        {aadhaarImage ? (
                          <Box>
                            <Box
                              component="img"
                              src={aadhaarImage}
                              alt="Aadhaar Card"
                              sx={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 1, mb: 1 }}
                            />
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Button size="small" variant="outlined" onClick={() => window.open(aadhaarImage, '_blank')} sx={{ flex: 1, mr: 1 }}>View</Button>
                              <IconButton color="error" size="small" onClick={handleRemoveAadhaarImage} disabled={uploadingDoc === 'aadhaar'}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        ) : (
                          <Box>
                            <input accept="image/*" id="upload-aadhaar" type="file" style={{ display: 'none' }}
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDocImageUpload('aadhaar', f); }}
                              disabled={uploadingDoc === 'aadhaar'}
                            />
                            <label htmlFor="upload-aadhaar">
                              <Button variant="outlined" component="span" fullWidth disabled={uploadingDoc === 'aadhaar'}
                                startIcon={uploadingDoc === 'aadhaar' ? <CircularProgress size={18} /> : <CloudUploadIcon />}
                                sx={{ height: 140, borderStyle: 'dashed', borderWidth: 2, '&:hover': { borderColor: '#0a2558', bgcolor: 'rgba(10,37,88,0.04)' } }}
                              >
                                {uploadingDoc === 'aadhaar' ? 'Uploading...' : 'Upload Aadhaar Image'}
                              </Button>
                            </label>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              <FormControl>
                <FormLabel sx={{ color: "#0a2558", mb: 1, fontWeight: 'bold' }}>Profile Image</FormLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={formData.profile_image || ""}
                    sx={{
                      width: 80,
                      height: 80,
                      border: '2px solid #0a2558',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    {!formData.profile_image && formData.Name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      disabled={loading}
                      fullWidth
                      sx={{
                        borderColor: "#0a2558",
                        color: "#0a2558",
                        textTransform: 'none',
                        fontWeight: 'bold',
                        "&:hover": { borderColor: "#0a2558", bgcolor: "rgba(10, 37, 88, 0.05)" }
                      }}
                    >
                      {formData.profile_image ? "Change Photo" : "Choose Photo"}
                      <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                    </Button>
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: '#64748b' }}>
                      {formData.profile_image ? formData.profile_image_name || "Image uploaded" : "No file chosen"}
                    </Typography>
                  </Box>
                </Box>
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
