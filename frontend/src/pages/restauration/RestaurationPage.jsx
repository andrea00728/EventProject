import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Utensils,
  LayoutDashboard,
} from "lucide-react";
import {
  Box,
  useTheme,
  useMediaQuery,
  Typography
} from "@mui/material";
import { RxCaretRight, RxCaretLeft } from "react-icons/rx";

export default function RestaurationPage() {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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

  const handleLinkClick = () => {
    if (isMobile) {
      setIsMenuOpen(false); // Ferme le menu après la navigation sur mobile
    }
  };

  return (
    <Box
      className="relative flex h-screen bg-slate-100"
      sx={{
        width: "100vw",
        minHeight: "100vh",
        position: "relative",
        boxSizing: 'border-box'
      }}
    >
      {/* Bouton de menu pour les petits écrans */}
      <div className={`
        absolute top-4 z-40 lg:hidden
        transform transition-transform duration-300
        ${isMenuOpen ? 'left-64' : 'left-2'}
      `}>
        <button
          onClick={toggleMenu}
          className="p-3 bg-white/70 backdrop-blur-sm shadow-lg border border-gray-200 transition-all hover:scale-105 transform hover:rotate-12"
        >
          {isMenuOpen ? (
            <RxCaretLeft className="w-6 h-6 text-gray-700" />
          ) : (
            <RxCaretRight className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Sidebar : cachée par défaut, s'anime pour apparaître, visible sur les grands écrans */}
      <Box
        component="aside"
        className={`
          fixed h-screen w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200 shadow-xl flex flex-col z-30
          transform transition-transform duration-300
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <Box sx={{ p: 3 }} className="h-full flex flex-col">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
            <LayoutDashboard className="w-6 h-6 text-[#2c3e50]" />
            <Typography variant="h6" fontWeight="bold" color="#2c3e50">
              Restauration
            </Typography>
          </Box>
          <Box sx={{ spaceY: 2 }}>
            {choixItems.map(({ path, name, icon }) => (
              <Link key={path} to={path} className={linkClass(path)} onClick={handleLinkClick}>
                {icon}
                {name}
              </Link>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flex: 1,
          p: 4,
          overflow: "auto",
          boxSizing: 'border-box'
        }}
        className="flex-1 flex flex-col overflow-hidden lg:ml-64"
      >
        <Box sx={{ p: 4, bgcolor: "white", borderRadius: 1, boxShadow: "0 2px 4px rgba(0,0,0,0.1)", border: "1px solid #e0e0e0" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};