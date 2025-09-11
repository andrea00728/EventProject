import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Button,
  Box,
} from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuRestaurationGrid from "./MenuRestaurationGrid";

const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const MenuRestaurationDropdown = ({
  menus,
  onClickModified,
  onClickDelete,
}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState(null);

  // États pour les dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [selectedMenuId, setSelectedMenuId] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
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

  const handleCloseForm = () => {
    setFormOpen(false);
    setForm({});
    setEditingItem(null);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  // On prépare la structure des menus + items
  const renderedMenus = useMemo(() => {
    return menus.map((menu) => ({
      ...menu,
      renderedItems: menu.items?.map((item) => (
        <motion.div
          key={item.id}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`p-4 sm:p-6 rounded-xl cursor-pointer border-2 transition-all duration-300 ease-in-out ${
            selectedItem?.id === item.id
              ? "bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 shadow-lg scale-[1.02]"
              : "bg-white hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 border-transparent hover:border-teal-200 hover:shadow-md"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItem(item);
          }}
          onKeyDown={(e) => e.key === "Enter" && setSelectedItem(item)}
          tabIndex={0}
          role="button"
          aria-label={`Sélectionner ${item.name}`}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span className="font-semibold text-base text-gray-900">
                {item.name}
              </span>
            </div>
            <div className="flex items-center justify-between sm:space-x-4">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  item.stock > 0
                    ? "bg-teal-100 text-teal-700 border border-teal-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
                aria-label={`Stock : ${item.stock}`}
              >
                {item.stock > 0 ? `${item.stock} en stock` : "Rupture"}
              </span>
            </div>
          </div>
        </motion.div>
      )),
    }));
  }, [menus, selectedItem]);

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* LISTE DES MENUS */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Nos Menus
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {renderedMenus.map((menu) => (
            <React.Fragment key={menu.id}>
              <div
                className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-sm"
                onClick={() =>
                  setExpandedMenu(expandedMenu === menu.id ? null : menu.id)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  setExpandedMenu(expandedMenu === menu.id ? null : menu.id)
                }
                tabIndex={0}
                role="button"
                aria-expanded={expandedMenu === menu.id}
                aria-label={`Afficher les plats du menu ${menu.name}`}
              >
                <div className="px-6 py-5 flex items-center justify-between">
                  <h3 className="font-bold text-lg text-teal-700 uppercase tracking-wider">
                    {menu.name}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {menu.items?.length || 0} plats
                    </span>
                    <motion.div
                      animate={{ rotate: expandedMenu === menu.id ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="text-teal-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedMenu === menu.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 py-6 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {menu.renderedItems}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* MODAL DETAILS ITEM */}
      {selectedItem && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 p-4"
            onClick={() => setSelectedItem(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md sm:max-w-lg overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  {selectedItem.name}
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-white/90 hover:text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* CONTENT */}
              <div className="p-6 flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  {selectedItem.photo ? (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${selectedItem.photo}`}
                      alt={selectedItem.name}
                      className="w-32 h-32 sm:w-45 sm:h-46 object-cover rounded-xl shadow-md border border-gray-100"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl flex items-center justify-center text-teal-500 text-sm font-medium shadow-inner">
                      <svg
                        className="w-8 h-8 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Pas d'image
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <p className="text-base text-gray-700 leading-relaxed">
                    {selectedItem.description ||
                      "Aucune description disponible."}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Prix
                      </span>
                      <span className="text-lg font-semibold text-teal-700">
                        {formatter.format(selectedItem.price)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Disponibilité
                      </span>
                      <span
                        className={`px-4 py-2 text-sm font-medium rounded-full ${
                          selectedItem.stock > 0
                            ? "bg-teal-100 text-teal-700 border border-teal-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {selectedItem.stock > 0
                          ? `${selectedItem.stock} en stock`
                          : "Rupture de stock"}
                      </span>
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => {
                        setSelectedItem(null);
                        onClickModified(selectedItem);
                      }}
                      className="flex-1 font-semibold px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete(selectedItem);
                        setDeleteConfirmOpen(true);
                      }}
                      className="flex-1 font-semibold px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* AUCUN MENU DISPONIBLE */}
      {menus.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border border-gray-100 shadow-md">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-teal-600 font-semibold text-base">
              Aucun menu disponible
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Les menus seront bientôt disponibles
            </p>
          </div>
        </motion.div>
      )}

      {/* DIALOG FORM */}
      <Dialog
        open={formOpen}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.neutral} 100%)`,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: theme.gradientCard,
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 2,
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        >
          <RestaurantIcon />
          {editingItem
            ? `Modifier ${menus.find((m) => m.id === selectedMenuId)?.name || "menu"}`
            : `Ajouter un(e) ${menus.find((m) => m.id === selectedMenuId)?.name || ""}`}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: "grid", gap: 3, mt: 2 }}>
            {[
              { field: "name", label: "Nom", type: "text" },
              {
                field: "description",
                label: "Description",
                type: "text",
                multiline: true,
              },
              { field: "price", label: "Prix (€)", type: "number" },
              { field: "category", label: "Catégorie", type: "text" },
              { field: "stock", label: "Stock", type: "number" },
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
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    "&:hover fieldset": { borderColor: theme.primary },
                    "&.Mui-focused fieldset": { borderColor: theme.primary },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: theme.primary },
                }}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
            ))}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  color: theme.textLight,
                  fontWeight: "medium",
                }}
              >
                Image
              </Typography>
              <TextField
                type="file"
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    "&:hover fieldset": { borderColor: theme.primary },
                    "&.Mui-focused fieldset": { borderColor: theme.primary },
                  },
                }}
                onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseForm}
            variant="outlined"
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              borderColor: theme.textLight,
              color: theme.textLight,
            }}
          >
            Annuler
          </Button>
          {/* <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              background: theme.gradientCard,
              fontWeight: "bold",
              "&:hover": {
                background: theme.gradientCard,
                opacity: 0.9,
              },
            }}
          >
            Enregistrer
          </Button> */}
        </DialogActions>
      </Dialog>

      {/* DIALOG SUPPRESSION */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle
          sx={{
            color: theme.danger,
            display: "flex",
            alignItems: "center",
            gap: 2,
            fontWeight: "bold",
          }}
        >
          <DeleteIcon />
          Confirmer la suppression
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1">
            Êtes-vous sûr de vouloir supprimer le plat{" "}
            <strong>"{itemToDelete?.name}"</strong> ?
          </Typography>
          <Typography variant="body2" sx={{ color: theme.textLight, mt: 1 }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseDeleteConfirm}
            variant="outlined"
            sx={{ borderRadius: 3, px: 3, py: 1.5 }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onClickDelete(itemToDelete);
              setSelectedItem(null);
              handleCloseDeleteConfirm();
            }}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              bgcolor: theme.danger,
              fontWeight: "bold",
              "&:hover": {
                bgcolor: theme.dangerHover,
                transform: "translateY(-1px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default MenuRestaurationDropdown;
