import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Table, PlusCircle, BarChart2 } from "lucide-react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { RxCaretRight, RxCaretLeft } from "react-icons/rx";

export default function TableLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState("");

  useEffect(() => {
    const currentPath = location.pathname.split("/evenement/tables/")[1] || "";
    setSelectedPath(currentPath || "");
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const choixItems = [
    { path: "", name: "Tables Enregistrées", icon: <Table size={18} /> },
    {
      path: "creationTable",
      name: "Nouveau Table",
      icon: <PlusCircle size={18} />,
    },
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
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const drawerContent = (
    <Box sx={{ p: 3 }} className="h-full flex flex-col">
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
        <Table size={22} />
        <Typography variant="h6" fontWeight="bold" color="#2c3e50">
          Gérer les Tables
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {choixItems.map(({ path, name, icon }) => (
          <Link
            key={path}
            to={`/evenement/tables/${path}`}
            className={linkClass(path)}
            onClick={() => handleNavigation(path)}
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
      className="relative flex bg-gray-100"
      sx={{
        width: "100%",
        minHeight: "100vh",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {/* Bouton de menu pour les petits écrans */}
      <div
        className={`
          absolute top-4 z-40 lg:hidden
          transform transition-transform duration-300
          ${isMenuOpen ? "left-64" : "left-2"}
        `}
      >
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

      {/* Sidebar */}
      <Box
        component="aside"
        className={`
          fixed h-screen w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200 shadow-xl flex flex-col z-30
          transform transition-transform duration-300
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {drawerContent}
      </Box>

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          boxSizing: "border-box",
          bgcolor: "#f4f6f9",
          borderRadius: 1,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          minHeight: "100vh",
          overflowX: "hidden",
          width: "100%",
        }}
        className="flex-1 flex flex-col lg:ml-64"
      >
        <div className="flex-1 w-full">
          <Outlet />
        </div>
      </Box>
    </Box>
  );
}