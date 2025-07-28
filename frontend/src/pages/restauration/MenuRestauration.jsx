import React, { useEffect, useState } from "react";
import axios from "axios";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
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
  Typography,
  Paper,
  Divider,
  Menu,
  MenuItem,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { CloudUploadIcon, FileWarningIcon } from "lucide-react";

const MenuRestauration = () => {
  const { token } = useStateContext();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [allMenus, setAllMenus] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState("all");
  const [menuItems, setMenuItems] = useState([]);
  const [deleteMenuConfirmOpen, setDeleteMenuConfirmOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [menuFormOpen, setMenuFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
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
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuToDelete, setMenuToDelete] = useState(null);

  // Configuration de l'URL de base pour axios
  axios.defaults.baseURL = "http://localhost:3000";

  // Palette de couleurs moderne
  const theme = {
    primary: "#4f46e5", // Indigo
    primaryHover: "#4338ca",
    secondary: "#10b981", // Émeraude
    secondaryHover: "#059669",
    danger: "#ef4444", // Rouge
    dangerHover: "#dc2626",
    neutral: "#f1f5f9", // Gris clair
    text: "#1f2937", // Gris foncé
  };

  // Chargement des événements
  useEffect(() => {
    if (!token) return;
    getMyEvents(token).then((data) => {
      if (Array.isArray(data)) setEvents(data);
    });
  }, [token]);

  // Chargement des menus
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

  // Gestion des formulaires
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
    setMenuForm({ name: menu ? menu.name : "" });
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
      if (val !== null && val !== "") {
        if (key === "photo" && val instanceof File) {
          formData.append(key, val, val.name);
        } else {
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

  const handleDelete = async (itemId) => {
    try {
      await axios.delete(`/menus/items/${itemId}`);
      await reloadMenus();
      handleCloseDeleteConfirm();
    } catch (err) {
      console.error("Erreur lors de la suppression de l'élément :", err);
      alert("Erreur lors de la suppression.");
    }
  };

  const handleDeleteMenu = () => {
    setDeleteMenuConfirmOpen(true);
  };

  const handleCloseDeleteMenuConfirm = () => {
    setDeleteMenuConfirmOpen(false);
    setMenuToDelete(null);
  };

  const handleConfirmDeleteMenu = async () => {
    if (!selectedMenuId) return;
    try {
      await axios.delete(`/menus/${selectedMenuId}`);
      await reloadMenus();
      setSelectedMenuId("all");
      handleCloseDeleteMenuConfirm();
    } catch (err) {
      console.error("Erreur lors de la suppression du menu :", err);
      alert("Erreur lors de la suppression.");
    }
  };

  // Menu contextuel
  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEditMenu = () => {
    const menu = allMenus.find(m => m.id === selectedMenuId);
    if (menu) handleOpenMenuForm(menu);
    handleMenuClose();
  };

  const handleDeleteMenuClick = () => {
    setMenuToDelete(allMenus.find(m => m.id === selectedMenuId));
    setDeleteMenuConfirmOpen(true);
    handleMenuClose();
  };

  const columns = [
    { field: "name", headerName: "Nom", flex: 1, minWidth: 150 },
    { field: "description", headerName: "Description", flex: 2, minWidth: 200 },
    { field: "price", headerName: "Prix (€)", flex: 1, minWidth: 100 },
    { field: "category", headerName: "Catégorie", flex: 1, minWidth: 120 },
    { field: "stock", headerName: "Stock", flex: 1, minWidth: 100 },
    { field: "menuName", headerName: "Menu", flex: 1, minWidth: 120 },
    {
      field: "photo",
      headerName: "Image",
      renderCell: (params) =>
        params.row.photo ? (
          <img
            src={`http://localhost:3000${params.row.photo}`}
            alt="menu"
            style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          <Typography color="textSecondary">Aucune image</Typography>
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
          sx={{ color: theme.primary }}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Supprimer"
          onClick={() => handleOpenDeleteConfirm(params.row)}
          sx={{ color: theme.danger }}
        />,
      ],
      width: 120,
    },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: theme.neutral, minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: theme.text, mb: 4 }}>
        Gestion des Menus
      </Typography>

      {/* Sélection des événements */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: "medium", color: theme.text, mb: 2 }}>
          Sélectionner un événement
        </Typography>
        {events.length === 0 ? (
          <Typography sx={{ color: theme.text, opacity: 0.7 }}>
            Aucun événement trouvé. Veuillez créer un événement d'abord.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {events.map((event) => (
              <Button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                variant={selectedEvent?.id === event.id ? "contained" : "outlined"}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "medium",
                  px: 3,
                  py: 1,
                  bgcolor: selectedEvent?.id === event.id ? theme.primary : "transparent",
                  color: selectedEvent?.id === event.id ? "#fff" : theme.text,
                  borderColor: theme.primary,
                  "&:hover": {
                    bgcolor: selectedEvent?.id === event.id ? theme.primaryHover : theme.neutral,
                  },
                }}
              >
                {event.nom}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      {selectedEvent && (
        <>
          {/* Sélection des menus */}
          {allMenus.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "medium", color: theme.text, mb: 2 }}>
                Filtrer par Menu
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                <Button
                  onClick={() => setSelectedMenuId("all")}
                  variant={selectedMenuId === "all" ? "contained" : "outlined"}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "medium",
                    px: 3,
                    py: 1,
                    bgcolor: selectedMenuId === "all" ? theme.primary : "transparent",
                    color: selectedMenuId === "all" ? "#fff" : theme.text,
                    borderColor: theme.primary,
                    "&:hover": {
                      bgcolor: selectedMenuId === "all" ? theme.primaryHover : theme.neutral,
                    },
                  }}
                >
                  Tous
                </Button>
                {allMenus.map((menu) => (
                  <Button
                    key={menu.id}
                    onClick={() => setSelectedMenuId(menu.id)}
                    variant={selectedMenuId === menu.id ? "contained" : "outlined"}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: "medium",
                      px: 3,
                      py: 1,
                      bgcolor: selectedMenuId === menu.id ? theme.primary : "transparent",
                      color: selectedMenuId === menu.id ? "#fff" : theme.text,
                      borderColor: theme.primary,
                      "&:hover": {
                        bgcolor: selectedMenuId === menu.id ? theme.primaryHover : theme.neutral,
                      },
                    }}
                  >
                    {menu.name}
                  </Button>
                ))}
                <Button
                  onClick={() => handleOpenMenuForm()}
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "medium",
                    px: 3,
                    py: 1,
                    bgcolor: theme.secondary,
                    color: "#fff",
                    "&:hover": { bgcolor: theme.secondaryHover },
                  }}
                >
                  Nouveau Menu
                </Button>
              </Box>
            </Box>
          )}

          {allMenus.length === 0 && (
            <Box sx={{ mb: 4 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenMenuForm()}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "medium",
                  px: 3,
                  py: 1,
                  borderColor: theme.secondary,
                  color: theme.secondary,
                  "&:hover": { borderColor: theme.secondaryHover, bgcolor: theme.neutral },
                }}
              >
                Créer un Menu
              </Button>
            </Box>
          )}

          {selectedMenuId !== "all" && (
            <Box sx={{
              my: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2
            }}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 600,
                color: "text.secondary"
              }}>
                Gestion du menu: <span style={{ color: "primary.main" }}>
                  {allMenus.find((m) => m.id === selectedMenuId)?.name || "Menu"}
                </span>
              </Typography>

              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenForm()}
                  sx={{
                    borderRadius: '12px',
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    bgcolor: "primary.main",
                    color: "#fff",
                    "&:hover": {
                      bgcolor: "primary.dark",
                      boxShadow: 2
                    },
                    boxShadow: '0 2px 8px rgba(100, 80, 255, 0.2)'
                  }}
                >
                  Ajouter un {allMenus.find((m) => m.id === selectedMenuId)?.name}
                </Button>

                <IconButton
                  onClick={handleMenuClick}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      bgcolor: "action.hover",
                      color: "primary.main"
                    },
                    transition: 'all 0.2s ease',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '12px',
                    p: 1.5
                  }}
                >
                  <MoreVertIcon />
                </IconButton>

                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    elevation: 4,
                    sx: {
                      minWidth: 180,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      overflow: 'hidden',
                      mt: 1
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem
                    onClick={handleEditMenu}
                    sx={{
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'primary.main'
                      }
                    }}
                  >
                    <EditIcon fontSize="small" sx={{ mr: 1.5, color: "primary.main" }} />
                    <Typography variant="body2">Modifier le menu</Typography>
                  </MenuItem>
                  <Divider sx={{ my: 0 }} />
                  <MenuItem
                    onClick={handleDeleteMenuClick}
                    sx={{
                      py: 1.5,
                      color: "error.main",
                      '&:hover': {
                        bgcolor: 'error.light'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
                    <Typography variant="body2">Supprimer le menu</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          )}

          {/* Grille des éléments */}
          <DataGrid
            rows={filteredItems}
            columns={columns}
            autoHeight
            getRowId={(row) => row.id}
            pageSizeOptions={[5, 10, 25]}
            sx={{
              bgcolor: "#fff",
              borderRadius: 2,
              boxShadow: 3,
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: theme.neutral,
                color: theme.text,
                fontWeight: "bold",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: `1px solid ${theme.neutral}`,
                color: theme.text,
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: theme.neutral,
              },
            }}
          />
        </>
      )}

      {/* Formulaire d'élément - Version Pro Tailwind */}
      <Dialog
        open={formOpen}
        onClose={handleCloseForm}
        PaperProps={{
          className: "rounded-xl p-6 min-w-[90vw] md:min-w-[500px] lg:min-w-[600px] shadow-2xl border border-gray-100"
        }}
      >
        <DialogTitle className="font-bold text-gray-800 text-xl md:text-2xl flex items-center gap-2 py-4 border-b border-gray-100">
          {editingItem ? (
            <>
              <EditIcon className="text-blue-500" />
              <span>Modifier l'élément</span>
            </>
          ) : (
            <>
              <AddIcon className="text-blue-500" />
              <span>Ajouter un nouvel {allMenus.find((m) => m.id === selectedMenuId)?.name}</span>
            </>
          )}
        </DialogTitle>

        <DialogContent className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["name", "description", "price", "category", "stock"].map((field) => (
              <TextField
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                value={form[field] || ""}
                type={field === "price" || field === "stock" ? "number" : "text"}
                fullWidth
                variant="outlined"
                className="mb-4"
                InputProps={{
                  className: "rounded-lg hover:border-blue-500 focus:border-blue-500"
                }}
                InputLabelProps={{
                  className: "text-gray-500"
                }}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                  <CloudUploadIcon className="text-gray-400 text-3xl" />
                  <p className="text-sm text-gray-500">
                    Cliquez pour télécharger ou glissez-déposez
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
                />
              </label>
            </div>
          </div>
        </DialogContent>

        <DialogActions className="px-6 py-4 border-t border-gray-100">
          <Button
            onClick={handleCloseForm}
            className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-colors"
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Formulaire de menu - Version Pro Tailwind */}
      <Dialog
        open={menuFormOpen}
        onClose={handleCloseMenuForm}
        PaperProps={{
          className: "rounded-xl p-6 min-w-[90vw] md:min-w-[400px] shadow-2xl border border-gray-100"
        }}
      >
        <DialogTitle className="font-bold text-gray-800 text-xl flex items-center gap-2 py-4 border-b border-gray-100 ">
          {editingMenu ? (
            <>
              <EditIcon className="text-blue-500" />
              <span>Modifier le menu</span>
            </>
          ) : (
            <>
              <AddIcon className="text-blue-500" />
              <span>Créer un nouveau menu</span>
            </>
          )}
        </DialogTitle>

        <DialogContent className="py-6">
          <TextField
            label="Nom du menu"
            value={menuForm.name}
            fullWidth
            variant="outlined"
            InputProps={{
              className: " rounded-lg hover:border-blue-500 focus:border-blue-500   "
            }}
            InputLabelProps={{
              className: "text-gray-500"
            }}
            onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
          />
        </DialogContent>

        <DialogActions className="px-6 py-4 border-t border-gray-100">
          <Button
            onClick={handleCloseMenuForm}
            className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveMenu}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-colors"
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation de suppression - Version Pro Tailwind */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        PaperProps={{
          className: "rounded-xl p-6 min-w-[90vw] md:min-w-[400px] shadow-2xl border border-gray-100"
        }}
      >
        <DialogTitle className="font-bold text-gray-800 text-xl flex items-center gap-2 py-4">
          <FileWarningIcon className="text-red-500" />
          <span>Confirmer la suppression</span>
        </DialogTitle>

        <DialogContent className="py-4">
          <p className="text-gray-600">
            Voulez-vous vraiment supprimer cet élément ? Cette action est irréversible.
          </p>
        </DialogContent>

        <DialogActions className="px-6 py-4 border-t border-gray-100">
          <Button
            onClick={handleCloseDeleteConfirm}
            className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={() => handleDelete(itemToDelete?.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-colors"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation de suppression de menu */}
      <Dialog
        open={deleteMenuConfirmOpen}
        onClose={handleCloseDeleteMenuConfirm}
        PaperProps={{ sx: { borderRadius: 2, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: theme.text }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.text }}>
            Voulez-vous vraiment supprimer ce menu ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteMenuConfirm}
            sx={{ color: theme.text, textTransform: "none" }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDeleteMenu}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              bgcolor: theme.danger,
              color: "#fff",
              "&:hover": { bgcolor: theme.dangerHover },
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuRestauration;