import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const formatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

const MenuGrid = ({ menus, addToCart, formatPrice = (val) => formatter.format(val) }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState(null);

  const handleAddToCart = (item) => {
    if (item.stock <= 0) {
      return;
    }
    addToCart(item);
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight" aria-label="Nos Menus">
            Nos Menus
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {menus.map((menu) => {
            const renderedItems = useMemo(
              () =>
                menu.items?.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className={`p-4 sm:p-6 rounded-xl cursor-pointer border-2 transition-all duration-300 ease-in-out ${
                      selectedItem?.id === item.id
                        ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 shadow-lg scale-[1.02]'
                        : 'bg-white hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 border-transparent hover:border-teal-200 hover:shadow-md'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedItem(item)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Sélectionner ${item.name}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                        <span className="font-semibold text-base text-gray-900">{item.name}</span>
                      </div>
                      <div className="flex items-center justify-between sm:space-x-4">
                        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                          {formatPrice(item.price)}
                        </span>
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${
                            item.stock > 0
                              ? 'bg-teal-100 text-teal-700 border border-teal-200'
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}
                          aria-label={`Stock : ${item.stock}`}
                        >
                          {item.stock > 0 ? `${item.stock} en stock` : 'Rupture'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )),
              [menu.items, selectedItem]
            );

            return (
              <React.Fragment key={menu.id}>
                <div
                  className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-sm"
                  onClick={() => setExpandedMenu(expandedMenu === menu.id ? null : menu.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setExpandedMenu(expandedMenu === menu.id ? null : menu.id)}
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
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="text-teal-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedMenu === menu.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 py-6 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {renderedItems}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {selectedItem && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 p-4"
            onClick={() => setSelectedItem(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-label={`Détails de ${selectedItem.name}`}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md sm:max-w-lg overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">{selectedItem.name}</h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-white/90 hover:text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200"
                    aria-label="Fermer la fenêtre des détails"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    {selectedItem.photo ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${selectedItem.photo}`}
                        alt={selectedItem.name}
                        className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-xl shadow-md border border-gray-100"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl flex items-center justify-center text-teal-500 text-sm font-medium shadow-inner">
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Pas d'image
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <p className="text-base text-gray-700 leading-relaxed">{selectedItem.description || 'Aucune description disponible.'}</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Prix</span>
                        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                          {formatPrice(selectedItem.price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Disponibilité</span>
                        <span
                          className={`px-4 py-2 text-sm font-medium rounded-full ${
                            selectedItem.stock > 0
                              ? 'bg-teal-100 text-teal-700 border border-teal-200'
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}
                        >
                          {selectedItem.stock > 0 ? `${selectedItem.stock} en stock` : 'Rupture de stock'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(selectedItem)}
                      disabled={selectedItem.stock <= 0}
                      className={`w-full mt-6 font-semibold px-6 py-3 rounded-xl transition-all duration-300 ${
                        selectedItem.stock <= 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 hover:shadow-lg hover:scale-[1.02]'
                      }`}
                      aria-label={selectedItem.stock <= 0 ? 'Indisponible' : `Ajouter ${selectedItem.name} au panier`}
                    >
                      {selectedItem.stock <= 0 ? 'Indisponible' : 'Ajouter au panier'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {menus.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border border-gray-100 shadow-md">
            <svg className="w-16 h-16 mx-auto mb-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-teal-600 font-semibold text-base">Aucun menu disponible</p>
            <p className="text-gray-600 text-sm mt-2">Les menus seront bientôt disponibles</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

MenuGrid.propTypes = {
  menus: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
          price: PropTypes.number.isRequired,
          stock: PropTypes.number.isRequired,
          photo: PropTypes.string,
          description: PropTypes.string,
        })
      ),
    })
  ).isRequired,
  addToCart: PropTypes.func.isRequired,
  formatPrice: PropTypes.func,
};

export default MenuGrid;