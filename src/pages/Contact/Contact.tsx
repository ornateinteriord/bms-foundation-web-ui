import { Container, Typography, Box, Paper, TextField, Button, Grid } from "@mui/material";
import { Phone, Mail, MapPin, Clock, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Contact = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log("Form submitted:", formData);
        // Reset form
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    };

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Button
                startIcon={<ArrowLeft size={20} />}
                onClick={() => navigate("/")}
                sx={{
                    mt: 3,
                    mb: 3,
                    color: "#6b21a8",
                    "&:hover": {
                        backgroundColor: "rgba(107, 33, 168, 0.1)",
                    },
                }}
            >
                Back to Home
            </Button>
            <Box sx={{ textAlign: "center", mb: 6 }}>
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: "bold",
                        mb: 2,
                        background: "linear-gradient(135deg, #6b21a8 0%, #a855f7 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Contact Us
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    We're here to help. Get in touch with us.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Contact Information */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={3} sx={{ p: 4, height: "100%", background: "linear-gradient(135deg, #6b21a8 0%, #a855f7 100%)", color: "white" }}>
                        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 4 }}>
                            Contact Information
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}>
                                <MapPin size={24} />
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                                        Address
                                    </Typography>
                                    <Typography variant="body2">
                                        Shop No. G6, Asha Chandra Trade Centre,<br />
                                        Udupi, Karnataka
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}>
                                <Phone size={24} />
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                                        Phone
                                    </Typography>
                                    <Typography variant="body2">
                                        +91 9004478100<br />
                                        0820-7966887
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}>
                                <Mail size={24} />
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                                        Email
                                    </Typography>
                                    <Typography variant="body2">
                                        support@bmsfoundation.biz
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                                <Clock size={24} />
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                                        Office Hours
                                    </Typography>
                                    <Typography variant="body2">
                                        Monday - Saturday: 10:00 AM - 5:00 PM<br />
                                        Sunday & Bank Holidays: Closed
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Contact Form */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3, color: "#6b21a8" }}>
                            Send us a Message
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Your Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Message"
                                        name="message"
                                        multiline
                                        rows={6}
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            background: "linear-gradient(135deg, #6b21a8 0%, #a855f7 100%)",
                                            "&:hover": {
                                                background: "linear-gradient(135deg, #581c87 0%, #9333ea 100%)",
                                            },
                                        }}
                                    >
                                        Send Message
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Contact;
