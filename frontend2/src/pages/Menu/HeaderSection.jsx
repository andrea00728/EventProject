import React from 'react';

const HeaderSection = ({ searchQuery, setSearchQuery, cartLength, onCartOpen }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-12">
      <div className="text-center sm:text-left">
        <h2
          className="text-3xl sm:text-4xl font-extrabold text-gray-900 italic tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-600"
          tabIndex={0}
          aria-label="Découvrez Nos Menus"
        >
          Découvrez Nos Menus !
        </h2>
        <p
          className="mt-1 text-gray-600 text-base sm:text-lg font-medium"
          tabIndex={0}
          aria-label="Des plats savoureux, préparés avec soin."
        >
          Des plats savoureux, préparés avec soin.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un plat..."
            className="w-48 sm:w-64 px-4 py-2 pr-10 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            aria-label="Rechercher un plat"
            autoComplete="off"
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          >
            🔍
          </span>
        </div>
        <button
          onClick={onCartOpen}
          className="bg-blue-600 text-white p-2.5 rounded-lg shadow-sm hover:bg-blue-500 transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          aria-label={`Ouvrir le panier, ${cartLength} article${cartLength > 1 ? 's' : ''}`}
          aria-haspopup="dialog"
        >
          <span className="text-lg" aria-hidden="true">🛒</span>
          {cartLength > 0 && (
            <span
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center"
              aria-live="polite"
              aria-atomic="true"
            >
              {cartLength}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default HeaderSection;
