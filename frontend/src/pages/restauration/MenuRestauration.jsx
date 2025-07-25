import React, { useEffect, useState } from "react";
import axios from "axios";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";
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
  IconButton
} from "@mui/material";

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
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', stock: '', photo: null });
  const [menuForm, setMenuForm] = useState({ name: '' });
  const [editingItem, setEditingItem] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);
  const [hoveredMenuId, setHoveredMenuId] = useState(null);

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
    try {
      const res = await axios.get(`/menus/event/${selectedEvent.id}`);
      setAllMenus(res.data);
      const items = res.data.flatMap(menu =>
        Array.isArray(menu.items) ? menu.items.map(item => ({ ...item, menuId: menu.id, menuName: menu.name })) : []
      );
      setMenuItems(items);
    } catch (err) {
      console.error("Erreur lors du chargement des menus :", err);
    }
  };

  const filteredItems = selectedMenuId === "all"
    ? menuItems
    : menuItems.filter(item => item.menuId === selectedMenuId);

  const handleOpenForm = (item = null) => {
    setEditingItem(item);
    if (item) {
      setForm({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        category: item.category || '',
        stock: item.stock || '',
        photo: item.photo || null
      });
    } else {
      setForm({ name: '', description: '', price: '', category: '', stock: '', photo: null });
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
    else setMenuForm({ name: '' });
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
        if (key === 'photo' && val instanceof File) {
          formData.append(key, val, val.name);
        } else if (val !== '') {
          formData.append(key, val);
        }
      }
    });

    try {
      if (editingItem && editingItem.id) {
        console.log("Patching item with ID:", editingItem.id, formData); // Debug log
        await axios.patch(`/menus/items/${editingItem.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post(`/menus/${menuId}/items`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
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
        await axios.post('/menus', { name: menuForm.name, eventId: selectedEvent.id });
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
      console.log("Deleting menu with ID:", selectedMenuId); // Debug log
      await axios.delete(`/menus/${selectedMenuId}`);
      await reloadMenus();
      setSelectedMenuId("all");
      handleCloseDeleteMenuConfirm();
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
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleOpenForm(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
        />
      ]
    }
  ];

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Sélectionner un événement</h1>

        {events.length === 0 ? (
          <p className="text-gray-600">Aucun événement trouvé. Créez un événement d’abord.</p>
        ) : (
          <div className="flex gap-4 flex-wrap mb-6">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`py-2 px-4 rounded ${selectedEvent?.id === event.id ? "bg-purple-600 text-white" : "bg-gray-200 cursor-pointer text-gray-700"}`}
              >
                {event.nom}
              </button>
            ))}
          </div>
        )}

        {selectedEvent && (
          <>
            {allMenus.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700">Filtrer par Menu</label>
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => setSelectedMenuId("all")}
                    className={`py-2 px-4 rounded ${
                      selectedMenuId === "all" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Tous
                  </button>
                  {allMenus.map((menu) => (
                    <div key={menu.id} className="relative inline-block">
                      <div
                        onMouseEnter={() => setHoveredMenuId(menu.id)}
                        onMouseLeave={() => setHoveredMenuId(null)}
                        className="relative"
                      >
                        {hoveredMenuId === menu.id && (
                          <div className="absolute -top-6 left-0 flex gap-1">
                            <IconButton
                              onClick={() => {
                                const menuToEdit = allMenus.find(m => m.id === menu.id);
                                if (menuToEdit) {
                                  setEditingMenu(menuToEdit);
                                  setMenuForm({ name: menuToEdit.name });
                                  setMenuFormOpen(true);
                                }
                              }}
                              sx={{ color: '#6b48ff' }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                setSelectedMenuId(menu.id);
                                handleDeleteMenu();
                              }}
                              sx={{ color: '#e74c3c' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        )}
                        <button
                          onClick={() => setSelectedMenuId(menu.id)}
                          className={`py-2 px-4 rounded ${
                            selectedMenuId === menu.id ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {menu.name}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => handleOpenMenuForm()}
                    className="py-2 px-4 rounded bg-green-500 text-white hover:bg-green-600"
                  >
                    + Nouveau Menu...
                  </button>
                </div>
              </div>
            )}

            {allMenus.length === 0 && (
              <Box className="mb-4">
                <Button variant="outlined" startIcon={<AddIcon />} sx={{ borderColor: '#e67e22', color: '#e67e22' }} onClick={() => handleOpenMenuForm()}>Nouveau Menu</Button>
              </Box>
            )}

            {selectedMenuId !== "all" && (
              <Box className="my-4 text-right">
                <Button variant="contained" startIcon={<AddIcon />} sx={{ backgroundColor: '#6b48ff', color: 'white', '&:hover': { backgroundColor: '#5a38dd' } }} onClick={() => handleOpenForm()}>{`Ajouter un ${allMenus.find(m => m.id === selectedMenuId)?.name || 'élément'}`}</Button>
              </Box>
            )}

            <DataGrid
              rows={filteredItems}
              columns={columns}
              autoHeight
              getRowId={(row) => row.id}
              pageSize={5}
              rowsPerPageOptions={[5, 10]}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': { borderBottom: 'none', border: 'none' },
                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f0f4f8', border: 'none' },
                '& .MuiDataGrid-root': { border: 'none' }
              }}
            />
          </>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={formOpen} onClose={handleCloseForm} PaperProps={{ sx: { borderRadius: 2 } }}>
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
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          ))}
          <TextField
            key={field}
            label={field === 'name' ? 'Nom' : field === 'description' ? 'Description' : field === 'price' ? 'Prix' : field === 'category' ? 'Catégorie' : 'Stock'}
            value={form[field] || ''}
            type={field === 'price' || field === 'stock' ? 'number' : 'text'}
            fullWidth
            margin="dense"
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
            onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} sx={{ color: '#34495e' }}>Annuler</Button>
          <Button variant="contained" onClick={handleSave} sx={{ backgroundColor: '#6b48ff', color: 'white', '&:hover': { backgroundColor: '#5a38dd' } }}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={menuFormOpen} onClose={handleCloseMenuForm} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>{editingMenu ? 'Modifier' : 'Ajouter'} un Menu</DialogTitle>
        <DialogContent>
          <TextField
            label="Nom du menu"
            value={menuForm.name}
            fullWidth
            margin="dense"
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
            onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMenuForm} sx={{ color: '#34495e' }}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveMenu} sx={{ backgroundColor: '#6b48ff', color: 'white', '&:hover': { backgroundColor: '#5a38dd' } }}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}