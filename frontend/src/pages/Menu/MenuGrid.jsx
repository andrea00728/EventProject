import React, { useMemo } from 'react';

const formatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR'
});

const MenuGrid = ({
  menus,
  addToCart,
  formatPrice = (val) => formatter.format(val),
  searchQuery = '',
  currentPage = 1,
  setCurrentPage = () => {},
  sortOption = 'name',
  setSortOption = () => {},
  stockFilter = 'all',
  setStockFilter = () => {},
  itemsPerPage = 8
}) => {
  const filteredMenus = useMemo(() => {
    return menus.map((menu) => {
      let items = [...(menu.items || [])];

      if (searchQuery) {
        items = items.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (stockFilter === 'in-stock') {
        items = items.filter((item) => item.stock > 0);
      } else if (stockFilter === 'out-of-stock') {
        items = items.filter((item) => item.stock === 0);
      }

      items.sort((a, b) => {
        if (sortOption === 'price') return a.price - b.price;
        if (sortOption === 'stock') return a.stock - b.stock;
        return a.name.localeCompare(b.name);
      });

      return { ...menu, items };
    });
  }, [menus, searchQuery, stockFilter, sortOption]);

  const allItems = filteredMenus.flatMap((m) => m.items || []);
  const totalPages = Math.ceil(allItems.length / itemsPerPage);

  const paginatedItems = allItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      {/* Barre de filtres et tri */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex gap-2 items-center">
          <label htmlFor="sort" className="font-medium text-gray-600">Trier par :</label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5"
          >
            <option value="name">Nom</option>
            <option value="price">Prix</option>
            <option value="stock">Stock</option>
          </select>
        </div>
      </div>

      {/* Grille des plats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {paginatedItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
          >
            <div className="flex gap-4">
              {item.photo ? (
                <img
                  src={`http://localhost:3000${item.photo}`}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-xl shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm font-medium">
                  Pas d'image
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-800">{item.name}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                <p className="text-lg font-bold text-green-600 mt-2">
                  {formatPrice(item.price)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Stock : {item.stock}
                </p>
                <button
                  onClick={() => addToCart(item)}
                  disabled={item.stock <= 0}
                  className={`mt-2 text-sm font-semibold px-4 py-2 rounded-full ${
                    item.stock <= 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {item.stock <= 0 ? 'Indisponible' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            ← Précédent
          </button>
          <span className="text-gray-700 font-medium">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Suivant →
          </button>
        </div>
      )}

      {/* Aucun résultat */}
      {paginatedItems.length === 0 && (
        <p className="text-center text-gray-500 italic mt-6">
          Aucun résultat ne correspond à votre recherche.
        </p>
      )}
    </div>
  );
};

export default MenuGrid;