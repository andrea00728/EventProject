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
import { Box } from "@mui/material";

const RestaurationPage = () => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const choixItems = [
    { path: "", name: "Gestion des Menus", icon: <Utensils className="w-5 h-5" /> },
  ];

  const linkClass = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
      pathname === `/evenement/restauration/${path}` ||
      (path === "" && pathname === "/evenement/restauration")
        ? "bg-[#6b48ff] font-bold text-white shadow-md"
        : "hover:bg-[#e6ebfc] text-gray-700"
    }`;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Box
        sx={{
          width: 256,
          backgroundColor: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          height: "100vh",
          p: 3,
          borderRight: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
          <LayoutDashboard className="w-6 h-6" />
          <h2 className="text-xl font-bold text-[#2c3e50]">Restauration</h2>
        </Box>
        <Box sx={{ spaceY: 2 }}>
          {choixItems.map(({ path, name, icon }) => (
            <Link key={path} to={path} className={linkClass(path)}>
              {icon}
              {name}
            </Link>
          ))}
        </Box>
      </Box>

      <Box sx={{ flex: 1, p: 4, overflow: "auto" }}>
        <Box sx={{ p: 4, bgcolor: "white", borderRadius: 1, boxShadow: "0 2px 4px rgba(0,0,0,0.1)", border: "1px solid #e0e0e0" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default RestaurationPage;