import {
  ChevronDown,
  Lock,
  LogOutIcon,
  Settings,
  User,
} from "lucide-react";
import "./navbar.scss";
import {
  AppBar,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/use-auth";
import TokenService from "../../api/token/tokenService";
import { deepOrange } from "@mui/material/colors";
import { useState } from "react";
import { useGetMemberDetails } from "../../api/Memeber";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Get logged-in userId from TokenService
  const userId = TokenService.getMemberId();

  // Fetch member details
  const { data: memberDetails } = useGetMemberDetails(userId);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    navigate("/");
    TokenService.removeToken();
    window.dispatchEvent(new Event("storage"));
    setAnchorEl(null);
  };

  const isHomePage = location.pathname === "/";

  return (
    <>
      <AppBar
        position="fixed"
        className="navbar"
        style={{
          background: "#5f259f", // PhonePe Purple for consistency
        }}
      >
        <Toolbar className="navbar-toolbar">
          <Typography
            variant="h4"
            className="navbar-title"
            style={{ fontWeight: 900, cursor: "pointer", fontSize: '1.5rem', letterSpacing: '1px' }}
            onClick={() => navigate("/")}
          >
            BMS
          </Typography>

          <div style={{ marginLeft: "auto", display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isLoggedIn ? (
              <div className="admin-panel-container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                {!isHomePage && (
                  <div className="admin-panel-content" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleMenuOpen}>
                    <Avatar
                      className="user-avatar"
                      alt="User Avatar"
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        background: '#FFC000', 
                        color: '#5f259f',
                        fontWeight: 900,
                        fontSize: '0.8rem',
                        border: '2px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      {memberDetails?.Full_name
                        ? memberDetails.Full_name.charAt(0).toUpperCase()
                        : "U"}
                    </Avatar>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      <Typography variant="body2" sx={{ color: "white", fontWeight: 700, lineHeight: 1 }}>
                        {memberDetails?.Full_name || "Member"}
                      </Typography>
                      {memberDetails?.Member_id && (
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontSize: '0.65rem' }}>
                          ID: {memberDetails.Member_id}
                        </Typography>
                      )}
                    </Box>
                    <ChevronDown
                      color="white"
                      size={18}
                      style={{
                        transform: anchorEl ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </Toolbar>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            className: Boolean(anchorEl) ? "custom-menu open" : "custom-menu",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "10px 0",
            }}
          >
            <Avatar
              alt="Admin"
              sx={{
                width: 64,
                height: 64,
                marginBottom: "8px",
                background: deepOrange[500],
              }}
            >
              {memberDetails?.name
                ? memberDetails.name.charAt(0).toUpperCase()
                : ""}
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {memberDetails?.name || "Member"}
            </Typography>
          </div>

          <Divider />

          <MenuItem onClick={handleMenuClose}>
            <User size={18} style={{ marginRight: "8px" }} />
            My Profile
          </MenuItem>

          <MenuItem
            onClick={() => {
              navigate("/admin/update-password");
              setAnchorEl(null);
            }}
          >
            <Settings size={18} style={{ marginRight: "8px" }} />
            Account Settings
          </MenuItem>

          <Divider />

          <div className="admin-panel-menuitems">
            <MenuItem onClick={handleMenuClose} sx={{ display: "flex" }}>
              <Lock size={17} style={{ marginRight: "4px", color: "#007bff" }} />
              Lock
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ display: "flex" }}>
              <LogOutIcon
                size={18}
                style={{ marginRight: "4px", color: "red" }}
              />
              Logout
            </MenuItem>
          </div>
        </Menu>
      </AppBar >
    </>
  );
};

export default Navbar;
