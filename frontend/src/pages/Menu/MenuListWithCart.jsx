import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderSection from './HeaderSection';
import MenuGrid from './MenuGrid';
import CartDrawer from './CartDrawer';
import InvoiceModal from './InvoiceModal';

const MenuListWithCart = () => {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const token = localStorage.getItem('token');

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:3000/menus', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formattedMenus = res.data.map(menu => ({
        ...menu,
        items: menu.items.map(item => ({
          ...item,
          price: parseFloat(item.price) || 0,
        })),
      }));
      setMenus(formattedMenus);
    } catch (error) {
      console.error(error);
      setMessage('Oups, impossible de charger les menus.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
    const event = JSON.parse(localStorage.getItem('selectedEvent'));
    const table = JSON.parse(localStorage.getItem('selectedTable'));
    if (event) setSelectedEvent(event);
    if (table) setSelectedTable(table);
  }, []);

  const addToCart = (item) => {
    const existing = cart.find((ci) => ci.id === item.id);
    const quantityInCart = existing ? existing.quantity : 0;

    if (item.stock <= 0) return;

    const updatedMenus = menus.map(menu => ({
      ...menu,
      items: menu.items.map(i =>
        i.id === item.id ? { ...i, stock: i.stock - 1 } : i
      ),
    }));
    setMenus(updatedMenus);

    if (existing) {
      setCart(cart.map((ci) =>
        ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }

    setMessage('Article ajouté au panier !');
    setTimeout(() => setMessage(''), 3000);

    if (item.stock - 1 === 0) {
      setMessage(`Quantité maximale atteinte pour "${item.name}" (stock : 0).`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateQuantity = (itemId, delta) => {
    const cartItem = cart.find((ci) => ci.id === itemId);
    if (!cartItem) return;

    let currentStock = 0;
    menus.forEach(menu => {
      const menuItem = menu.items.find(item => item.id === itemId);
      if (menuItem) currentStock = menuItem.stock;
    });

    if (delta > 0 && currentStock <= 0) {
      setMessage(`Quantité maximale atteinte pour "${cartItem.name}" (stock : 0).`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const updatedMenus = menus.map(menu => ({
      ...menu,
      items: menu.items.map(item =>
        item.id === itemId
          ? { ...item, stock: item.stock + (delta < 0 ? 1 : -1) }
          : item
      ),
    }));
    setMenus(updatedMenus);

    setCart(cart.map((ci) =>
      ci.id === itemId
        ? { ...ci, quantity: Math.max(1, ci.quantity + delta) }
        : ci
    ));

    if (delta > 0 && currentStock - 1 === 0) {
      setMessage(`Quantité maximale atteinte pour "${cartItem.name}" (stock : 0).`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const removeFromCart = (itemId) => {
    const itemInCart = cart.find(ci => ci.id === itemId);
    if (itemInCart) {
      const updatedMenus = menus.map(menu => ({
        ...menu,
        items: menu.items.map(item =>
          item.id === itemId
            ? { ...item, stock: item.stock + itemInCart.quantity }
            : item
        ),
      }));
      setMenus(updatedMenus);
    }

    setCart(cart.filter((ci) => ci.id !== itemId));
    setMessage('Article retiré du panier.');
    setTimeout(() => setMessage(''), 3000);
  };

  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const formatPrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const filteredMenus = menus.map(menu => ({
    ...menu,
    items: menu.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (minPrice === '' || item.price >= parseFloat(minPrice)) &&
      (maxPrice === '' || item.price <= parseFloat(maxPrice))
    ),
  })).filter(menu => menu.items.length > 0);

  const paginatedMenus = filteredMenus.map(menu => ({
    ...menu,
    items: menu.items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  }));

  const totalItems = filteredMenus.reduce((acc, menu) => acc + menu.items.length, 0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleValidateOrder = () => {
    setIsCartOpen(false);
    if (cart.length > 0) {
      setIsInvoiceOpen(true);
    } else {
      setMessage('Votre panier est vide.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-16 py-8 font-sans">
      <HeaderSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartLength={cart.length}
        onCartOpen={() => setIsCartOpen(true)}
      />

      {/* 🎛️ Filtres avancés */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <input
          type="number"
          placeholder="Prix min"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="px-2 py-1 border rounded-md shadow-sm"
        />
        <input
          type="number"
          placeholder="Prix max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="px-2 py-1 border rounded-md shadow-sm"
        />
      </div>

      {message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in">
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
        </div>
      ) : (
        <>
          <MenuGrid menus={paginatedMenus} addToCart={addToCart} formatPrice={formatPrice} />

          {/* 🔁 Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        formatPrice={formatPrice}
        totalPrice={totalPrice}
        onValidateOrder={handleValidateOrder}
      />

      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        cart={cart}
        totalPrice={totalPrice}
        formatPrice={formatPrice}
        selectedEvent={selectedEvent}
        selectedTable={selectedTable}
      />
    </div>
  );
};

export default MenuListWithCart;
