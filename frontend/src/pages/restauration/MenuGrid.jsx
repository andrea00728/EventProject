import React, { useEffect, useState } from "react";
import axios from "axios";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";
import {
  DataGrid,
  GridActionsCellItem
} from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from "@mui/material";

const MenuGridRestau = () => {
  const { token } = useStateContext();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [allMenus, setAllMenus] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState("all");
  const [menuItems, setMenuItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [menuFormOpen, setMenuFormOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', stock: '', photo: null });
  const [menuForm, setMenuForm] = useState({ name: '' });
  const [editingItem, setEditingItem] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);

  axios.defaults.baseURL = "http://localhost:3000";

  useEffect(() => {
    if (!token) return;
    getMyEvents(token).then(data => {
      if (Array.isArray(data)) setEvents(data);
    });
  }, [token]);

  useEffect(() => {
    if (!selectedEvent?.id) return;
    reloadMenus();
  }, [selectedEvent]);

  const reloadMenus = async () => {
    const res = await axios.get(`/menus/event/${selectedEvent.id}`);
    setAllMenus(res.data);
    const items = res.data.flatMap(menu =>
      Array.isArray(menu.items) ? menu.items.map(item => ({ ...item, menuId: menu.id, menuName: menu.name })) : []
    );
    setMenuItems(items);
  };

  const filteredItems = selectedMenuId === "all"
    ? menuItems
    : menuItems.filter(item => item.menuId === selectedMenuId);

  const handleOpenForm = (item = null) => {
    setEditingItem(item);
    if (item) setForm(item);
    else setForm({ name: '', description: '', price: '', category: '', stock: '', photo: null });
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleOpenMenuForm = (menu = null) => {
    setEditingMenu(menu);
    if (menu) setMenuForm({ name: menu.name });
    else setMenuForm({ name: '' });
    setMenuFormOpen(true);
  };

  const handleCloseMenuForm = () => {
    setEditingMenu(null);
    setMenuFormOpen(false);
  };

  const handleSave = async () => {
    const menuId = selectedMenuId !== "all" ? selectedMenuId : allMenus[0]?.id;
    if (!menuId) return;

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val !== null) formData.append(key, val);
    });

    if (editingItem) {
      await axios.patch(`/menus/items/${editingItem.id}`, formData);
    } else {
      await axios.post(`/menus/${menuId}/items`, formData);
    }
    handleCloseForm();
    await reloadMenus();
  };

  const handleSaveMenu = async () => {
    if (!selectedEvent?.id || !menuForm.name) return;
    try {
      if (editingMenu) {
        await axios.patch(`/menus/${editingMenu.id}`, { name: menuForm.name });
      } else {
        await axios.post('/menus', { name: menuForm.name, eventId: selectedEvent.id });
      }
      handleCloseMenuForm();
      await reloadMenus();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du menu :", err);
      alert("Erreur lors de l'enregistrement du menu.");
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`/menus/items/${id}`);
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const handleDeleteMenu = async () => {
    if (!selectedMenuId || selectedMenuId === "all") return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce menu ?")) return;
    try {
      await axios.delete(`/menus/${selectedMenuId}`);
      await reloadMenus();
      setSelectedMenuId("all");
    } catch (err) {
      console.error("Erreur suppression menu :", err);
      alert("Erreur lors de la suppression.");
    }
  };

  const columns = [
    { field: "name", headerName: "Nom", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    { field: "price", headerName: "Prix", flex: 1 },
    { field: "category", headerName: "Catégorie", flex: 1 },
    { field: "stock", headerName: "Stock", flex: 1 },
    { field: "menuName", headerName: "Menu", flex: 1 },
    {
      field: "photo",
      headerName: "Image",
      renderCell: (params) => params.row.photo ? <img src={`http://localhost:3000${params.row.photo}`} width={60} alt="menu" /> : "",
      width: 100
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => handleOpenForm(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => handleDelete(params.row.id)} />
      ]
    }
  ];

  return (
    <Box p={4}>
      <h2 className="text-2xl font-bold text-center mb-6">Menus</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Sélectionner un événement</label>
        <button onClick={() => setModalOpen(true)} className="border px-4 py-2 rounded-md">
          {selectedEvent ? `${selectedEvent.nom} (${new Date(selectedEvent.date).toLocaleDateString()})` : "Choisir un événement"}
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-3xl">
            <h3 className="text-lg font-bold mb-4">Sélectionner un événement</h3>
            <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
              {events.map(event => (
                <div key={event.id} className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100" onClick={() => { setSelectedEvent(event); setModalOpen(false); }}>
                  <strong>{event.nom}</strong><br />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <>
          {allMenus.length > 0 && (
            <FormControl fullWidth className="mb-4">
              <InputLabel>Filtrer par Menu</InputLabel>
              <Select
                value={selectedMenuId}
                label="Filtrer par Menu"
                onChange={(e) => {
                  if (e.target.value === 'new') handleOpenMenuForm();
                  else setSelectedMenuId(e.target.value);
                }}
              >
                <MenuItem value="all">Tous</MenuItem>
                {allMenus.map(menu => (
                  <MenuItem key={menu.id} value={menu.id}>{menu.name}</MenuItem>
                ))}
                <MenuItem value="new" sx={{ fontStyle: 'italic', color: 'primary.main' }}>+ Nouveau Menu...</MenuItem>
              </Select>
            </FormControl>
          )}

          {selectedMenuId !== "all" && selectedMenuId !== "new" && (
            <div className="flex justify-end gap-2 mb-4">
              <Button variant="outlined" startIcon={<EditIcon />} onClick={() => {
                const menu = allMenus.find(m => m.id === selectedMenuId);
                if (menu) {
                  setEditingMenu(menu);
                  setMenuForm({ name: menu.name });
                  setMenuFormOpen(true);
                }
              }}>Modifier ce menu</Button>
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteMenu}>Supprimer ce menu</Button>
            </div>
          )}

          {allMenus.length === 0 && (
            <Box className="mb-4">
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenMenuForm()}>Nouveau Menu</Button>
            </Box>
          )}

          {selectedMenuId !== "all" && (
            <Box className="my-4 text-right">
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>{`Ajouter un ${allMenus.find(m => m.id === selectedMenuId)?.name || 'element'}`}</Button>
            </Box>
          )}

          <DataGrid
            rows={filteredItems}
            columns={columns}
            autoHeight
            getRowId={(row) => row.id}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
          />
        </>
      )}

      {/* Formulaire d'ajout/modification d'item */}
      <Dialog open={formOpen} onClose={handleCloseForm}>
        <DialogTitle>{editingItem ? `Modifier un élément de ${allMenus.find(m => m.id === selectedMenuId)?.name || ''}` : `Ajouter un ${allMenus.find(m => m.id === selectedMenuId)?.name || ''}`}</DialogTitle>
        <DialogContent>
          {['name', 'description', 'price', 'category', 'stock'].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field] || ''}
              type={field === 'price' || field === 'stock' ? 'number' : 'text'}
              fullWidth
              margin="dense"
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          ))}
          <TextField
            type="file"
            fullWidth
            margin="dense"
            onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* Formulaire d'ajout/modification de menu */}
      <Dialog open={menuFormOpen} onClose={handleCloseMenuForm}>
        <DialogTitle>{editingMenu ? 'Modifier' : 'Ajouter'} un Menu</DialogTitle>
        <DialogContent>
          <TextField
            label="Nom du menu"
            value={menuForm.name}
            fullWidth
            margin="dense"
            onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMenuForm}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveMenu}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuGridRestau;