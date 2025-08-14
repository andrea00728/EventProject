import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  PlusCircle,
  BarChart2,
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
  useMediaQuery,
  CircularProgress
} from "@mui/material";

const drawerWidth = 256;

export default function TableLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize selectedPath based on current location, default to "" for root path
    const currentPath = location.pathname.split("/evenement/tables/")[1] || "";
    setSelectedPath(currentPath || ""); // Default to "" if no specific path
  }, [location.pathname]);

  const choixItems = [
    { path: "", name: "Tables Enregistrées", icon: <Table size={18} /> },
    { path: "creationTable", name: "Nouveau Table", icon: <PlusCircle size={18} /> },
    { path: "3Dtable", name: "Graphique", icon: <BarChart2 size={18} /> },
  ];

  const linkClass = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
      selectedPath === path
        ? "bg-[#6b48ff] font-bold text-white shadow-md"
        : "hover:bg-[#e6ebfc] text-gray-700"
    }`;

  const handleNavigation = (path) => {  
    setSelectedPath(path);
    navigate(`/evenement/tables/${path}`, { replace: true });
    if (isMobile) setMobileOpen(false);
    // Remove artificial delay, rely on child component loading
    // setTimeout(() => setIsLoading(false), 100);
  };

  const drawerContent = (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
        <Table size={22} />
        <Typography variant="h6" fontWeight="bold" color="#2c3e50">
          Gérer les Tables
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {choixItems.map(({ path, name, icon }) => (
          <div key={path}>
            <Link
              to={`/evenement/tables/${path}`}
              className={linkClass(path)}
              onClick={() => handleNavigation(path)}
            >
              {icon}
              {name}
            </Link>
            {isLoading && selectedPath === path && (
              <CircularProgress size={20} sx={{ ml: 2, color: '#6b48ff' }} />
            )}
          </div>
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
        height: "100%",
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
              Gérer les Tables
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
        ModalProps={{ keepMounted: true}}
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
          height: "100vh",
          mt: isMobile ? "64px" : 0,
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: 4,
            boxSizing: "border-box",
            bgcolor: "white",
            borderRadius: 1,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #e0e0e0",
            maxHeight: "calc(100vh - 64px)",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}