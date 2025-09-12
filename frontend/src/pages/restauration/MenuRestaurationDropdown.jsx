import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useMemo } from "react";

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
    primary: "#4763ed",
    primaryHover: "#3b5fe0",
    primaryLight: "#e5e9fe",
    primaryBorder: "#d0d7fd",
    danger: "#ef4444",
    dangerHover: "#dc2626",
    neutral: "#f8fafc",
    neutralDark: "#e2e8f0",
    text: "#1e293b",
    textLight: "#64748b",
    background: "#ffffff",
    gradient: "linear-gradient(135deg, #4763ed 0%, #3b5fe0 100%)",
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
              ? "bg-gradient-to-r from-[#f3f4ff] to-[#e8ebff] border-[#d0d7fd] shadow-lg scale-[1.02]"
              : "bg-white hover:bg-gradient-to-r hover:from-[#f3f4ff] hover:to-[#e8ebff] border-transparent hover:border-[#d0d7fd] hover:shadow-md"
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
              <div className="w-3 h-3 bg-[#4763ed] rounded-full"></div>
              <span className="font-semibold text-base text-gray-900">
                {item.name}
              </span>
            </div>
            <div className="flex items-center justify-between sm:space-x-4">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  item.stock > 0
                    ? "bg-[#e5e9fe] text-[#4763ed] border border-[#d0d7fd]"
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
    <div className="space-y-6 w-full mx-auto px-0 sm:px-6">
      {/* LISTE DES MENUS */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#4763ed] to-[#3b5fe0] px-6 py-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Nos Menus
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {renderedMenus.map((menu) => (
            <React.Fragment key={menu.id}>
              <div
                className="hover:bg-gradient-to-r hover:from-[#f3f4ff] hover:to-[#e8ebff] cursor-pointer transition-all duration-300 ease-in-out hover:shadow-sm"
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
                  <h3 className="font-bold text-lg text-[#4763ed] uppercase tracking-wider">
                    {menu.name}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {menu.items?.length || 0} plats
                    </span>
                    <motion.div
                      animate={{ rotate: expandedMenu === menu.id ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="text-[#4763ed]"
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
                {expandedMenu === menu.id && menu.items?.length > 0 && (
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
              <div className="bg-gradient-to-r from-[#4763ed] to-[#3b5fe0] px-6 py-5 flex justify-between items-center">
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
                    <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-[#f3f4ff] to-[#e8ebff] rounded-xl flex items-center justify-center text-[#4763ed] text-sm font-medium shadow-inner">
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
                      <span className="text-lg font-semibold text-[#4763ed]">
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
                            ? "bg-[#e5e9fe] text-[#4763ed] border border-[#d0d7fd]"
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
                      className="flex-1 font-semibold px-5 py-3 rounded-xl bg-gradient-to-r from-[#4763ed] to-[#3b5fe0] text-white hover:from-[#3a53d6] hover:to-[#3246b8] hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        onClickDelete(selectedItem);
                        setSelectedItem(null);
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
    </div>
  );
};

export default MenuRestaurationDropdown;
