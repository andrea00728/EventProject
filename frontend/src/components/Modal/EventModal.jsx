import { motion, AnimatePresence } from 'framer-motion';
import { Table, User, Users, X } from 'lucide-react';
import React from 'react';

const EventModal = ({ isOpen, onClose, event }) => {
  if (!isOpen || !event) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-4xl"
        >
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 relative">
              <h2 className="text-2xl font-bold text-white">
                Détails de l'événement: {event?.nom}
              </h2>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors p-1 rounded-full"
                aria-label="Fermer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              {/* Tables Section */}
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Table className="text-pink-500" size={20} />
                  <h3 className="text-xl font-semibold text-gray-800">Tables</h3>
                  <span className="ml-auto bg-pink-100 text-pink-800 text-sm font-medium px-3 py-1 rounded-full">
                    {event?.tables?.length || 0} table(s)
                  </span>
                </div>

                {event?.tables?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {event.tables.map((table) => (
                      <motion.div
                        key={table.id}
                        whileHover={{ y: -2 }}
                        className="border border-gray-100 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                              <span className="w-6 h-6 flex items-center justify-center bg-pink-500 text-white rounded-full text-sm">
                                {table.numero}
                              </span>
                              Table {table.numero}
                            </h4>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p className="flex items-center gap-2">
                                <span className="font-medium">Type:</span> {table.type}
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="font-medium">Capacité:</span> 
                                <span className="font-bold text-pink-600">{table.capacite}</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="font-medium">Réservations:</span>
                                <span className={`font-bold ${
                                  table.placeReserve === table.capacite 
                                    ? 'text-red-500' 
                                    : 'text-green-500'
                                }`}>
                                  {table.placeReserve}/{table.capacite}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className={`px-2 py-1 text-xs font-bold rounded-full ${
                            table.placeReserve === table.capacite 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {table.placeReserve === table.capacite ? 'Complet' : 'Disponible'}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Table className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-500">Aucune table assignée à cet événement</p>
                  </div>
                )}
              </section>

              {/* Guests Section */}
              {event?.invites?.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="text-purple-500" size={20} />
                    <h3 className="text-xl font-semibold text-gray-800">Invités</h3>
                    <span className="ml-auto bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                      {event.invites.length} invité(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {event.invites.map((invite) => (
                      <motion.div
                        key={invite.id}
                        whileHover={{ y: -2 }}
                        className="border border-gray-100 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            invite.sex === 'M' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-pink-100 text-pink-600'
                          }`}>
                            <User size={18} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800">
                              {invite.prenom} {invite.nom}
                            </h4>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p className="truncate">{invite.email}</p>
                              <div className="flex justify-between">
                                <span className="capitalize">
                                  {invite.sex === 'M' ? 'Homme' : 'Femme'}
                                </span>
                                <span className="font-medium text-pink-600">
                                  Place: {invite.place}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EventModal;