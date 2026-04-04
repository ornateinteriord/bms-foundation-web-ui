import { Box, Container, Typography, Grid, IconButton, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { label: "About Us", path: "/about" },
        { label: "Contact Us", path: "/contact" },
        { label: "Privacy Policy", path: "/privacy-policy" },
        { label: "Terms & Conditions", path: "/terms" },
        { label: "Refund Policy", path: "/refund-policy" },
    ];

    const services = [
        "Savings Accounts",
        "Fixed Deposits",
        "Recurring Deposits",
        "Personal Loans",
        "Gold Loans",
    ];

    return (
        <Box
            component="footer"
            sx={{
                background: "linear-gradient(135deg, #0a2558 0%, #3d5a88ff 50%, #6b21a8 100%)",
                color: "white",
                pt: 6,
                pb: 3,
                mt: { xs: 7, md: 0 }
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Company Info */}
                    <Grid item xs={12} md={4}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: "bold",
                                mb: 2,
                                background: "linear-gradient(to right, #ffffff, #a855f7)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            BMS Foundation ltd
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, opacity: 0.9, lineHeight: 1.8 }}>
                            A trusted cooperative society providing comprehensive financial services
                            to our members since establishment.
                        </Typography>
                        <Typography variant="caption" sx={{ display: "block", opacity: 0.7 }}>
                            Reg. No: DRP | 6112 | 21-22
                        </Typography>

                        {/* Contact Info */}
                        <Box sx={{ mt: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                                <MapPin size={16} />
                                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.8rem" }}>
                                    Shop No. G6, Asha Chandra Trade Centre, Udupi, Karnataka
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                                <Phone size={16} />
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    +91 9004478100, 0820-7966887
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Mail size={16} />
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    mscsociety100@gmail.com
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Quick Links */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                            Quick Links
                        </Typography>
                        {quickLinks.map((link, index) => (
                            <Link
                                key={index}
                                to={link.path}
                                style={{
                                    color: "white",
                                    textDecoration: "none",
                                    display: "block",
                                    marginBottom: "12px",
                                    opacity: 0.9,
                                    fontSize: "0.875rem",
                                    transition: "opacity 0.2s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.9")}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </Grid>

                    {/* Services */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                            Our Services
                        </Typography>
                        {services.map((service, index) => (
                            <Typography
                                key={index}
                                variant="body2"
                                sx={{ mb: 1.5, opacity: 0.9 }}
                            >
                                {service}
                            </Typography>
                        ))}
                    </Grid>

                    {/* Office Hours & Social */}
                    <Grid item xs={12} md={3}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                            Office Hours
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                            Monday - Saturday
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                            10:00 AM - 5:00 PM
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
                            Sunday & Bank Holidays: Closed
                        </Typography>

                        {/* Social Links */}
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1.5 }}>
                            Follow Us
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                                size="small"
                                sx={{
                                    color: "white",
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                                }}
                            >
                                <Facebook size={18} />
                            </IconButton>
                            <IconButton
                                size="small"
                                sx={{
                                    color: "white",
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                                }}
                            >
                                <Twitter size={18} />
                            </IconButton>
                            <IconButton
                                size="small"
                                sx={{
                                    color: "white",
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                                }}
                            >
                                <Instagram size={18} />
                            </IconButton>
                            <IconButton
                                size="small"
                                sx={{
                                    color: "white",
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                                }}
                            >
                                <Linkedin size={18} />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.1)" }} />

                {/* Bottom Bar */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <Typography variant="body2" sx={{ opacity: 0.7, textAlign: { xs: "center", md: "left" } }}>
                        © {currentYear} BMS Foundation ltd. All rights reserved.
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 3,
                            flexWrap: "wrap",
                            justifyContent: "center",
                        }}
                    >
                        <Link
                            to="/privacy-policy"
                            style={{
                                color: "white",
                                textDecoration: "none",
                                fontSize: "0.75rem",
                                opacity: 0.7,
                            }}
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/terms"
                            style={{
                                color: "white",
                                textDecoration: "none",
                                fontSize: "0.75rem",
                                opacity: 0.7,
                            }}
                        >
                            Terms & Conditions
                        </Link>
                        <Link
                            to="/refund-policy"
                            style={{
                                color: "white",
                                textDecoration: "none",
                                fontSize: "0.75rem",
                                opacity: 0.7,
                            }}
                        >
                            Refund Policy
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;

