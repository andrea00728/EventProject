import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';

const formatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR'
});

const MenuGrid = ({ menus, addToCart, formatPrice = (val) => formatter.format(val) }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState(null);

  return (
    <div className="space-y-8 w-1/2">
      {/* Tableau des menus avec design moderne */}
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-indigo-100">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Nos Menus</h2>
        </div>
        
        <div className="divide-y divide-indigo-100">
          {menus.map((menu) => (
            <React.Fragment key={menu.id}>
              <div
                className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.01]"
                onClick={() => setExpandedMenu(expandedMenu === menu.id ? null : menu.id)}
              >
                <div className="px-8 py-6 flex items-center justify-between">
                  <h3 className="font-bold text-lg text-indigo-700 uppercase tracking-wide">
                    {menu.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {menu.items?.length || 0} plats
                    </span>
                    <motion.div
                      animate={{ rotate: expandedMenu === menu.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-indigo-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Ligne des items dépliés avec animation */}
              <AnimatePresence>
                {expandedMenu === menu.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 py-6 bg-gradient-to-r from-indigo-25 to-blue-25 bg-gray-50">
                      <div className="grid gap-4">
                        {menu.items?.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-300 ${
                              selectedItem?.id === item.id 
                                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-indigo-300 shadow-lg transform scale-[1.02]' 
                                : 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-transparent hover:border-indigo-200 hover:shadow-md'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                <span className="font-semibold text-gray-800">{item.name}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                  {formatPrice(item.price)} €
                                </span>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  item.stock > 0 
                                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                                    : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200'
                                }`}>
                                  {item.stock} en stock
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Modal détaillée de l'item sélectionné avec design premium */}
      {selectedItem && (
        <AnimatePresence>
          <motion.div 
            className='fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50' 
            onClick={() => setSelectedItem(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-white rounded-3xl shadow-2xl border border-indigo-100 w-[32rem] max-w-[90vw] overflow-hidden"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header avec gradient */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-white">{selectedItem.name}</h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenu principal */}
              <div className="p-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    {selectedItem.photo ? (
                      <img
                        src={`http://api.mastertable.site${selectedItem.photo}`}
                        alt={selectedItem.name}
                        className="w-36 h-36 object-cover rounded-2xl shadow-lg border-2 border-indigo-100"
                      />
                    ) : (
                      <div className="w-36 h-36 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center text-indigo-400 text-sm font-medium shadow-inner">
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
                    <p className="text-gray-600 leading-relaxed">{selectedItem.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Prix</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {formatPrice(selectedItem.price)} €
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Disponibilité</span>
                        <span className={`px-4 py-2 text-sm font-medium rounded-full ${
                          selectedItem.stock > 0 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                            : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200'
                        }`}>
                          {selectedItem.stock > 0 ? `${selectedItem.stock} en stock` : 'Rupture de stock'}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => addToCart(selectedItem)}
                      disabled={selectedItem.stock <= 0}
                      className={`w-full mt-6 font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform ${
                        selectedItem.stock <= 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                      }`}
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
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100">
            <svg className="w-16 h-16 mx-auto mb-4 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-indigo-600 font-medium">Aucun menu disponible</p>
            <p className="text-gray-500 text-sm mt-2">Les menus seront bientôt disponibles</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MenuGrid;