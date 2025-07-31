import React, { useEffect, useState } from "react";
import axios from "axios";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Restaurant as RestaurantIcon,
  Event as EventIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  Euro as EuroIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Typography,
  Menu,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Fade,
  Zoom,
  Paper,
  Divider,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";

export default function MenuRestauration() {
  const { token } = useStateContext();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [allMenus, setAllMenus] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState("all");
  const [menuItems, setMenuItems] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [menuFormOpen, setMenuFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteMenuConfirmOpen, setDeleteMenuConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    photo: null,
  });
  const [menuForm, setMenuForm] = useState({ name: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewMode, setViewMode] = useState("card");

  // Palette de couleurs moderne indigo/bleu
  const theme = {
    primary: "#4f46e5",
    primaryHover: "#3730a3",
    primaryLight: "#a5b4fc",
    secondary: "#3b82f6",
    secondaryHover: "#1d4ed8",
    accent: "#06b6d4",
    success: "#10b981",
    danger: "#ef4444",
    dangerHover: "#dc2626",
    warning: "#f59e0b",
    neutral: "#f8fafc",
    neutralDark: "#e2e8f0",
    text: "#1e293b",
    textLight: "#64748b",
    background: "#ffffff",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    gradientCard: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
  };

  axios.defaults.baseURL = "http://localhost:3000";

  // Fonction pour regrouper les éléments par catégorie
  const groupByCategory = (items) => {
    return items.reduce((acc, item) => {
      const category = item.category || "Sans catégorie";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  };

  // Colonnes pour la vue en liste (DataGrid)
  const columns = [
    { 
      field: "name", 
      headerName: "Nom", 
      flex: 1, 
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RestaurantIcon sx={{ color: theme.primary, fontSize: 18 }} />
          <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
        </Box>
      )
    },
    { field: "description", headerName: "Description", flex: 2, minWidth: 200 },
    {
      field: "price",
      headerName: "Prix",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          icon={<EuroIcon sx={{ fontSize: 16 }} />}
          label={params.value ? `${params.value} €` : "N/A"}
          size="small"
          sx={{
            bgcolor: theme.success,
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      ),
    },
    { 
      field: "category", 
      headerName: "Catégorie", 
      flex: 1, 
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          icon={<CategoryIcon sx={{ fontSize: 16 }} />}
          label={params.value || "N/A"}
          size="small"
          variant="outlined"
          sx={{ borderColor: theme.accent, color: theme.accent }}
        />
      )
    },
    { 
      field: "stock", 
      headerName: "Stock", 
      flex: 1, 
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          icon={<InventoryIcon sx={{ fontSize: 16 }} />}
          label={params.value || "N/A"}
          size="small"
          sx={{
            bgcolor: params.value > 0 ? theme.success : theme.danger,
            color: 'white'
          }}
        />
      )
    },
    { field: "menuName", headerName: "Menu", flex: 1, minWidth: 120 },
    {
      field: "photo",
      headerName: "Image",
      renderCell: (params) =>
        params.row.photo ? (
          <Box
            component="img"
            src={`http://localhost:3000${params.row.photo}`}
            alt={params.row.name}
            sx={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 2,
              border: `2px solid ${theme.primaryLight}`,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)'
              }
            }}
          />
        ) : (
          <Box
            sx={{
              width: 60,
              height: 60,
              bgcolor: theme.neutral,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px dashed ${theme.neutralDark}`
            }}
          >
            <Typography variant="caption" color="textSecondary">
              Aucune
            </Typography>
          </Box>
        ),
      width: 100,
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Modifier"
          onClick={() => handleOpenForm(params.row)}
          sx={{ 
            color: theme.primary,
            '&:hover': {
              bgcolor: theme.neutral,
              transform: 'scale(1.1)'
            }
          }}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Supprimer"
          onClick={() => handleOpenDeleteConfirm(params.row)}
          sx={{ 
            color: theme.danger,
            '&:hover': {
              bgcolor: '#fef2f2',
              transform: 'scale(1.1)'
            }
          }}
        />,
      ],
      width: 120,
    },
  ];

  useEffect(() => {
    if (!token) return;
    getMyEvents(token).then((data) => {
      if (Array.isArray(data)) setEvents(data);
    });
  }, [token]);

  useEffect(() => {
    if (!selectedEvent?.id) return;
    reloadMenus();
  }, [selectedEvent]);

  const reloadMenus = async () => {
    try {
      const res = await axios.get(`/menus/event/${selectedEvent.id}`);
      setAllMenus(res.data);
      const items = res.data.flatMap((menu) =>
        Array.isArray(menu.items)
          ? menu.items.map((item) => ({ ...item, menuId: menu.id, menuName: menu.name }))
          : []
      );
      setMenuItems(items);
    } catch (err) {
      console.error("Erreur lors du chargement des menus :", err);
    }
  };

  const filteredItems = selectedMenuId === "all"
    ? menuItems
    : menuItems.filter((item) => item.menuId === selectedMenuId);

  const handleOpenForm = (item = null) => {
    setEditingItem(item);
    if (item) {
      setForm({
        name: item.name || "",
        description: item.description || "",
        price: item.price || "",
        category: item.category || "",
        stock: item.stock || "",
        photo: item.photo || null,
      });
    } else {
      setForm({ name: "", description: "", price: "", category: "", stock: "", photo: null });
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleOpenMenuForm = (menu = null) => {
    setEditingMenu(menu);
    if (menu) setMenuForm({ name: menu.name });
    else setMenuForm({ name: "" });
    setMenuFormOpen(true);
  };

  const handleCloseMenuForm = () => {
    setEditingMenu(null);
    setMenuFormOpen(false);
  };

  const handleSave = async () => {
    const menuId = selectedMenuId !== "all" ? selectedMenuId : allMenus[0]?.id;
    if (!menuId || !selectedEvent?.id) return;

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val !== null) {
        if (key === "photo" && val instanceof File) {
          formData.append(key, val, val.name);
        } else if (val !== "") {
          formData.append(key, val);
        }
      }
    });

    try {
      if (editingItem && editingItem.id) {
        await axios.patch(`/menus/items/${editingItem.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`/menus/${menuId}/items`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      handleCloseForm();
      await reloadMenus();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de l'élément :", err);
      alert("Erreur lors de l'enregistrement de l'élément.");
    }
  };

  const handleSaveMenu = async () => {
    if (!selectedEvent?.id || !menuForm.name) return;
    try {
      if (editingMenu) {
        await axios.patch(`/menus/${editingMenu.id}`, { name: menuForm.name });
      } else {
        await axios.post("/menus", { name: menuForm.name, eventId: selectedEvent.id });
      }
      handleCloseMenuForm();
      await reloadMenus();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du menu :", err);
      alert("Erreur lors de l'enregistrement du menu.");
    }
  };

  const handleOpenDeleteConfirm = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await axios.delete(`/menus/items/${itemToDelete.id}`);
      setMenuItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      handleCloseDeleteConfirm();
    } catch (err) {
      console.error("Erreur lors de la suppression de l'élément :", err);
      alert("Erreur lors de la suppression de l'élément.");
    }
  };

  const handleOpenDeleteMenuConfirm = (menuId) => {
    setMenuToDelete(menuId);
    setDeleteMenuConfirmOpen(true);
  };

  const handleCloseDeleteMenuConfirm = () => {
    setDeleteMenuConfirmOpen(false);
    setMenuToDelete(null);
  };

  const handleConfirmDeleteMenu = async () => {
    if (!menuToDelete) return;
    try {
      await axios.delete(`/menus/${menuToDelete}`);
      await reloadMenus();
      setSelectedMenuId("all");
      handleCloseDeleteMenuConfirm();
    } catch (err) {
      console.error("Erreur suppression menu :", err);
      alert("Erreur lors de la suppression.");
    }
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.neutral} 0%, #e0e7ff 100%)`,
      p: 3
    }}>
      {/* Header avec gradient */}
      {/* <Paper
        elevation={0}
        sx={{
          background: theme.gradientCard,
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            transform: 'translate(50%, -50%)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
          <RestaurantIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
              Gestion des Menus
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Créez et gérez vos menus de restauration
            </Typography>
          </Box>
        </Box>
      </Paper> */}

      {/* Sélection d'événement */}
      <Paper elevation={2} sx={{ borderRadius: 3, mb: 4, overflow: 'hidden' }}>
        <Box sx={{ 
          background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
          p: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon sx={{ color: 'white' }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'medium' }}>
              Sélectionner un événement
            </Typography>
          </Box>
        </Box>

        {events.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <EventIcon sx={{ fontSize: 60, color: theme.textLight, mb: 2 }} />
            <Typography color="textSecondary" variant="h6">
              Aucun événement trouvé
            </Typography>
            <Typography color="textSecondary" variant="body2">
              Créez un événement d'abord pour commencer
            </Typography>
          </Box>
        ) : (
          <Tabs
            value={selectedEvent ? events.findIndex((event) => event.id === selectedEvent.id) : false}
            onChange={(e, newValue) => setSelectedEvent(events[newValue])}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '1rem',
                fontWeight: 'medium',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: theme.neutral,
                  transform: 'translateY(-2px)'
                },
                '&.Mui-selected': {
                  bgcolor: theme.neutral,
                  color: theme.primary,
                  fontWeight: 'bold'
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                background: theme.gradientCard,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            {events.map((event) => (
              <Tab
                key={event.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon sx={{ fontSize: 18 }} />
                    {event.nom}
                  </Box>
                }
              />
            ))}
          </Tabs>
        )}
      </Paper>

      {selectedEvent && (
        <Fade in={Boolean(selectedEvent)} timeout={600}>
          <Box>
            {/* Filtres de menu */}
            {allMenus.length > 0 && (
              <Paper elevation={2} sx={{ borderRadius: 3, p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, color: theme.text, fontWeight: 'bold' }}>
                  Filtrer par Menu
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Zoom in timeout={300}>
                    <Button
                      onClick={() => setSelectedMenuId("all")}
                      variant={selectedMenuId === "all" ? "contained" : "outlined"}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 'medium',
                        ...(selectedMenuId === "all" ? {
                          background: theme.gradientCard,
                          '&:hover': { background: theme.gradientCard, opacity: 0.9 }
                        } : {
                          borderColor: theme.primary,
                          color: theme.primary,
                          '&:hover': { bgcolor: theme.neutral, borderColor: theme.primaryHover }
                        })
                      }}
                    >
                      Tous les menus
                    </Button>
                  </Zoom>
                  
                  {allMenus.map((menu, index) => (
                    <Zoom in timeout={300 + index * 100} key={menu.id}>
                      <Button
                        onClick={() => setSelectedMenuId(menu.id)}
                        variant={selectedMenuId === menu.id ? "contained" : "outlined"}
                        sx={{
                          borderRadius: 3,
                          px: 3,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 'medium',
                          ...(selectedMenuId === menu.id ? {
                            background: theme.gradientCard,
                            '&:hover': { background: theme.gradientCard, opacity: 0.9 }
                          } : {
                            borderColor: theme.secondary,
                            color: theme.secondary,
                            '&:hover': { bgcolor: theme.neutral, borderColor: theme.secondaryHover }
                          })
                        }}
                      >
                        {menu.name}
                      </Button>
                    </Zoom>
                  ))}
                  
                  <Zoom in timeout={300 + allMenus.length * 100}>
                    <Button
                      onClick={() => handleOpenMenuForm()}
                      variant="contained"
                      startIcon={<AddIcon />}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 'medium',
                        bgcolor: theme.success,
                        '&:hover': { bgcolor: '#059669', transform: 'translateY(-2px)' },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Nouveau Menu
                    </Button>
                  </Zoom>
                </Box>
              </Paper>
            )}

            {/* Bouton pour créer le premier menu */}
            {allMenus.length === 0 && (
              <Paper elevation={2} sx={{ borderRadius: 3, p: 4, mb: 4, textAlign: 'center' }}>
                <RestaurantIcon sx={{ fontSize: 60, color: theme.textLight, mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: theme.text }}>
                  Aucun menu disponible
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenMenuForm()}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    background: theme.gradientCard,
                    '&:hover': { 
                      background: theme.gradientCard, 
                      opacity: 0.9,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Créer votre premier menu
                </Button>
              </Paper>
            )}

            {/* Barre d'actions */}
            {selectedMenuId !== "all" && (
              <Paper elevation={2} sx={{ borderRadius: 3, p: 3, mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6" sx={{ color: theme.text, fontWeight: 'bold' }}>
                    {allMenus.find((m) => m.id === selectedMenuId)?.name || "Menu"}
                  </Typography>
                  
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenForm()}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        textTransform: "none",
                        fontWeight: "medium",
                        background: theme.gradientCard,
                        '&:hover': { 
                          background: theme.gradientCard, 
                          opacity: 0.9,
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Ajouter un plat
                    </Button>
                    
                    <IconButton
                      onClick={handleOpenMenu}
                      sx={{ 
                        bgcolor: theme.neutral,
                        '&:hover': { bgcolor: theme.neutralDark, transform: 'scale(1.1)' },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    
                    <Divider orientation="vertical" flexItem />
                    
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        onClick={() => setViewMode("card")}
                        sx={{
                          color: viewMode === "card" ? theme.primary : theme.textLight,
                          bgcolor: viewMode === "card" ? theme.neutral : 'transparent',
                          '&:hover': { bgcolor: theme.neutral, transform: 'scale(1.1)' },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <ViewModuleIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => setViewMode("list")}
                        sx={{
                          color: viewMode === "list" ? theme.primary : theme.textLight,
                          bgcolor: viewMode === "list" ? theme.neutral : 'transparent',
                          '&:hover': { bgcolor: theme.neutral, transform: 'scale(1.1)' },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <ViewListIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  PaperProps={{
                    sx: { 
                      borderRadius: 3, 
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      border: `1px solid ${theme.neutralDark}`,
                      mt: 1
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      const menuToEdit = allMenus.find((m) => m.id === selectedMenuId);
                      if (menuToEdit) {
                        setEditingMenu(menuToEdit);
                        setMenuForm({ name: menuToEdit.name });
                        setMenuFormOpen(true);
                        handleCloseMenu();
                      }
                    }}
                    sx={{ 
                      py: 1.5,
                      px: 3,
                      '&:hover': { bgcolor: theme.neutral }
                    }}
                  >
                    <EditIcon sx={{ mr: 2, color: theme.primary }} />
                    <Typography variant="body2">Modifier le menu</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleOpenDeleteMenuConfirm(selectedMenuId);
                      handleCloseMenu();
                    }}
                    sx={{ 
                      py: 1.5,
                      px: 3,
                      '&:hover': { bgcolor: '#fef2f2' }
                    }}
                  >
                    <DeleteIcon sx={{ mr: 2, color: theme.danger }} />
                    <Typography variant="body2">Supprimer le menu</Typography>
                  </MenuItem>
                </Menu>
              </Paper>
            )}

            {/* Contenu principal */}
            {viewMode === "card" ? (
              <Box sx={{ space: 6 }}>
                {Object.keys(groupByCategory(filteredItems))
                  .sort()
                  .map((category, categoryIndex) => (
                    <Fade in timeout={400 + categoryIndex * 200} key={category}>
                      <Paper elevation={2} sx={{ borderRadius: 3, p: 4, mb: 4 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          mb: 3,
                          pb: 2,
                          borderBottom: `3px solid ${theme.primary}`
                        }}>
                          <CategoryIcon sx={{ color: theme.primary, fontSize: 30 }} />
                          <Typography variant="h4" sx={{ 
                            fontWeight: 'bold', 
                            color: theme.text,
                            background: theme.gradientCard,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                            {category}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                          gap: 3 
                        }}>
                          {groupByCategory(filteredItems)[category].map((item, itemIndex) => (
                            <Zoom in timeout={200 + itemIndex * 100} key={item.id}>
                              <Card
                                sx={{
                                  borderRadius: 4,
                                  overflow: 'hidden',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer',
                                  border: `2px solid transparent`,
                                  '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                    border: `2px solid ${theme.primaryLight}`,
                                  }
                                }}
                              >
                                {item.photo && (
                                  <CardMedia
                                    component="img"
                                    height="200"
                                    image={`http://localhost:3000${item.photo}`}
                                    alt={item.name}
                                    sx={{
                                      transition: 'transform 0.3s ease',
                                      '&:hover': { transform: 'scale(1.05)' }
                                    }}
                                  />
                                )}
                                
                                <CardContent sx={{ p: 3 }}>
                                  <Typography variant="h6" sx={{ 
                                    fontWeight: 'bold', 
                                    color: theme.text, 
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}>
                                    <RestaurantIcon sx={{ color: theme.primary, fontSize: 20 }} />
                                    {item.name}
                                  </Typography>
                                  
                                  <Typography variant="body2" sx={{ color: theme.textLight, mb: 3, lineHeight: 1.6 }}>
                                    {item.description || "Aucune description disponible"}
                                  </Typography>
                                  
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                    <Chip
                                      icon={<EuroIcon sx={{ fontSize: 16 }} />}
                                      label={item.price ? `${item.price} €` : "Prix non défini"}
                                      size="small"
                                      sx={{
                                        bgcolor: theme.success,
                                        color: 'white',
                                        fontWeight: 'bold'
                                      }}
                                    />
                                    <Chip
                                      icon={<InventoryIcon sx={{ fontSize: 16 }} />}
                                      label={`Stock: ${item.stock || 0}`}
                                      size="small"
                                      sx={{
                                        bgcolor: (item.stock || 0) > 0 ? theme.accent : theme.danger,
                                        color: 'white',
                                        fontWeight: 'medium'
                                      }}
                                    />
                                    <Chip
                                      label={item.menuName || "N/A"}
                                      size="small"
                                      variant="outlined"
                                      sx={{ 
                                        borderColor: theme.secondary,
                                        color: theme.secondary,
                                        fontWeight: 'medium'
                                      }}
                                    />
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 'auto' }}>
                                    <IconButton 
                                      onClick={() => handleOpenForm(item)}
                                      sx={{ 
                                        bgcolor: theme.neutral,
                                        color: theme.primary,
                                        '&:hover': { 
                                          bgcolor: theme.primary,
                                          color: 'white',
                                          transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.3s ease'
                                      }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                      onClick={() => handleOpenDeleteConfirm(item)}
                                      sx={{ 
                                        bgcolor: theme.neutral,
                                        color: theme.danger,
                                        '&:hover': { 
                                          bgcolor: theme.danger,
                                          color: 'white',
                                          transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.3s ease'
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Zoom>
                          ))}
                        </Box>
                      </Paper>
                    </Fade>
                  ))}
                
                {filteredItems.length === 0 && (
                  <Fade in timeout={600}>
                    <Paper elevation={2} sx={{ borderRadius: 3, p: 6, textAlign: 'center' }}>
                      <RestaurantIcon sx={{ fontSize: 80, color: theme.textLight, mb: 3 }} />
                      <Typography variant="h5" sx={{ color: theme.text, mb: 2, fontWeight: 'bold' }}>
                        Aucun plat disponible
                      </Typography>
                      <Typography variant="body1" sx={{ color: theme.textLight }}>
                        Commencez par ajouter des plats à votre menu
                      </Typography>
                    </Paper>
                  </Fade>
                )}
              </Box>
            ) : (
              <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <DataGrid
                  rows={filteredItems}
                  columns={columns}
                  autoHeight
                  getRowId={(row) => row.id}
                  pageSizeOptions={[5, 10, 25]}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                      background: theme.gradientCard,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      '& .MuiDataGrid-columnHeader': {
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.1)'
                        }
                      }
                    },
                    '& .MuiDataGrid-cell': {
                      borderBottom: `1px solid ${theme.neutralDark}`,
                      color: theme.text,
                      fontSize: '0.95rem',
                      py: 1
                    },
                    '& .MuiDataGrid-row': {
                      '&:hover': {
                        bgcolor: theme.neutral,
                        transform: 'scale(1.005)',
                        transition: 'all 0.2s ease'
                      },
                      '&:nth-of-type(even)': {
                        bgcolor: '#f8fafc'
                      }
                    },
                    '& .MuiDataGrid-footerContainer': {
                      borderTop: `2px solid ${theme.neutralDark}`,
                      bgcolor: theme.neutral
                    }
                  }}
                />
              </Paper>
            )}
          </Box>
        </Fade>
      )}

      {/* Dialog d'ajout/modification d'item */}
      <Dialog 
        open={formOpen} 
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.neutral} 100%)`
          } 
        }}
      >
        <DialogTitle sx={{
          background: theme.gradientCard,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          fontWeight: 'bold',
          fontSize: '1.5rem'
        }}>
          <RestaurantIcon />
          {editingItem
            ? `Modifier - ${allMenus.find((m) => m.id === selectedMenuId)?.name || ""}`
            : `Ajouter un plat - ${allMenus.find((m) => m.id === selectedMenuId)?.name || ""}`}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'grid', gap: 3, mt: 2 }}>
            {[
              { field: "name", label: "Nom du plat", type: "text" },
              { field: "description", label: "Description", type: "text", multiline: true },
              { field: "price", label: "Prix (€)", type: "number" },
              { field: "category", label: "Catégorie", type: "text" },
              { field: "stock", label: "Stock", type: "number" }
            ].map(({ field, label, type, multiline }) => (
              <TextField
                key={field}
                label={label}
                value={form[field] || ""}
                type={type}
                fullWidth
                multiline={multiline}
                rows={multiline ? 3 : 1}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&:hover fieldset': { borderColor: theme.primary },
                    '&.Mui-focused fieldset': { borderColor: theme.primary }
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: theme.primary }
                }}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
            ))}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: theme.textLight, fontWeight: 'medium' }}>
                Image du plat
              </Typography>
              <TextField
                type="file"
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&:hover fieldset': { borderColor: theme.primary },
                    '&.Mui-focused fieldset': { borderColor: theme.primary }
                  }
                }}
                onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseMenuForm}
            variant="outlined"
            sx={{ 
              borderRadius: 3,
              px: 3,
              py: 1.5,
              borderColor: theme.textLight,
              color: theme.textLight
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveMenu}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              background: theme.gradientCard,
              fontWeight: 'bold',
              '&:hover': { 
                background: theme.gradientCard,
                opacity: 0.9
              }
            }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression d'item */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={handleCloseDeleteConfirm}
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{
          color: theme.danger,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          fontWeight: 'bold'
        }}>
          <DeleteIcon />
          Confirmer la suppression
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1">
            Êtes-vous sûr de vouloir supprimer le plat <strong>"{itemToDelete?.name}"</strong> ?
          </Typography>
          <Typography variant="body2" sx={{ color: theme.textLight, mt: 1 }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseDeleteConfirm}
            variant="outlined"
            sx={{ 
              borderRadius: 3,
              px: 3,
              py: 1.5
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              bgcolor: theme.danger,
              fontWeight: 'bold',
              '&:hover': { 
                bgcolor: theme.dangerHover,
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression de menu */}
      <Dialog 
        open={deleteMenuConfirmOpen} 
        onClose={handleCloseDeleteMenuConfirm}
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{
          color: theme.danger,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          fontWeight: 'bold'
        }}>
          <DeleteIcon />
          Confirmer la suppression du menu
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1">
            Êtes-vous sûr de vouloir supprimer le menu <strong>"{allMenus.find((m) => m.id === menuToDelete)?.name}"</strong> ?
          </Typography>
          <Typography variant="body2" sx={{ color: theme.textLight, mt: 1 }}>
            Tous les plats associés à ce menu seront également supprimés. Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseDeleteMenuConfirm}
            variant="outlined"
            sx={{ 
              borderRadius: 3,
              px: 3,
              py: 1.5
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDeleteMenu}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              bgcolor: theme.danger,
              fontWeight: 'bold',
              '&:hover': { 
                bgcolor: theme.dangerHover,
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Supprimer le menu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}