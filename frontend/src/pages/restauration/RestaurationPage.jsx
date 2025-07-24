import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Utensils,
  LayoutDashboard,
  Menu as MenuIcon
} from "lucide-react";
import {
  Box,
  Drawer,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery
} from "@mui/material";

const drawerWidth = 256;

const RestaurationPage = () => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const choixItems = [
    { path: "", name: "Gestion des Menus", icon: <Utensils size={18} /> },
  ];

  const linkClass = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
      pathname === `/evenement/restauration/${path}` ||
      (path === "" && pathname === "/evenement/restauration")
        ? "bg-[#6b48ff] font-bold text-white shadow-md"
        : "hover:bg-[#e6ebfc] text-gray-700"
    }`;

  const drawerContent = (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
        <LayoutDashboard size={22} />
        <Typography variant="h6" fontWeight="bold" color="#2c3e50">
          Restauration
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {choixItems.map(({ path, name, icon }) => (
          <Link
            key={path}
            to={`/evenement/restauration/${path}`}
            className={linkClass(path)}
            onClick={() => isMobile && setMobileOpen(false)}
          >
            {icon}
            {name}
          </Link>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        minHeight: "100vh",
        position: "fixed",
        height: "100%", // Ensure full height inheritance
      }}
    >
      {/* AppBar mobile */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2 }}>
              Restauration
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar desktop */}
      {!isMobile && (
        <Box
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            height: "100vh",
            borderRight: "1px solid #e0e0e0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {drawerContent}
        </Box>
      )}

      {/* Drawer mobile */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Contenu principal */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh", // Full viewport height
          mt: isMobile ? "64px" : 0, // Space for AppBar mobile
        }}
      >
        {/* Partie scrollable (Outlet content) */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto", // Scroll only here
            p: 4,
            boxSizing: "border-box",
            bgcolor: "white",
            borderRadius: 1,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #e0e0e0",
            maxHeight: "calc(100vh - 64px)", // Adjust for AppBar if mobile
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default RestaurationPage;