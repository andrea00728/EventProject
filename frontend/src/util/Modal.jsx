import React from 'react';

const Modal = ({ isOpen, onClose, children, title, icon }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full h-[90vh] mx-4 relative">
        {/* En-tête du modal */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">{icon} {title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Contenu du modal */}
        <div className="py-4 max-h-96 overflow-y-auto"> {/* max-h-96 et overflow-y-auto pour le scroll */}
          {children}
        </div>

        {/* Pied de page du modal (optionnel) */}
        <div className="pt-10 border-t border-gray-200 flex justify-end items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;