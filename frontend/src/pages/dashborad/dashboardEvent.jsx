import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Calendar } from "lucide-react";
import { Box, useTheme, useMediaQuery, Typography } from "@mui/material";
import { RxCaretRight, RxCaretLeft } from "react-icons/rx";

export default function DashboardPage() {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const choixItems = [
    { path: "vueDash", name: "Vue d'ensemble", icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: "eventsDash", name: "Événements", icon: <Calendar className="w-5 h-5" /> },
  ];

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
      pathname === `/evenement/dashboard/${path}` || (path === "" && pathname === "/evenement/dashboard")
        ? "bg-[#6b48ff] text-white font-semibold shadow-md"
        : "text-gray-700 hover:bg-[#f0f2ff] hover:text-[#4b4bff]"
    }`;

  const handleLinkClick = () => {
    if (isMobile) setIsMenuOpen(false);
  };

  return (
    <Box className="flex h-screen bg-slate-100">
      {/* Bouton menu mobile */}
      <div
        className={`
          absolute top-4 z-50 lg:hidden
          transition-all duration-300
          ${isMenuOpen ? "left-64" : "left-2"}
        `}
      >
        <button
          onClick={toggleMenu}
          className="p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          {isMenuOpen ? (
            <RxCaretLeft className="w-6 h-6 text-gray-700" />
          ) : (
            <RxCaretRight className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <Box
        component="aside"
        className={`
          fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-md border-r border-gray-200 shadow-lg flex flex-col z-40
          transform transition-transform duration-300
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <Box sx={{ p: 4 }} className="flex flex-col h-full justify-between">
          <Box>
            <Box className="flex items-center gap-2 mb-6">
              <LayoutDashboard className="w-6 h-6 text-[#2c3e50]" />
              <Typography variant="h6" fontWeight="bold" color="#2c3e50">
                Tableau de Bord
              </Typography>
            </Box>
            <Box className="flex flex-col gap-2">
              {choixItems.map(({ path, name, icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={linkClass(path)}
                  onClick={handleLinkClick}
                >
                  {icon}
                  <span className="truncate">{name}</span>
                </Link>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Contenu principal */}
      <Box className="flex-1 p-6 lg:ml-64 overflow-auto">
        <Box className="bg-white rounded-lg shadow-md border border-gray-200 p-6 min-h-[calc(100vh-2rem)]">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
