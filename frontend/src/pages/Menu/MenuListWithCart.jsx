import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HeaderSection from './HeaderSection';
import MenuGrid from './MenuGrid';
import CartDrawer from './CartDrawer';
import InvoiceModal from './InvoiceModal';

const useMenuFilter = (menus, searchQuery, minPrice, maxPrice, selectedCategory) => {
  return useMemo(
    () =>
      menus
        .map((menu) => ({
          ...menu,
          items: menu.items.filter(
            (item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
              (minPrice === '' || item.price >= parseFloat(minPrice)) &&
              (maxPrice === '' || item.price <= parseFloat(maxPrice)) &&
              (!selectedCategory || menu.category === selectedCategory)
          ),
        }))
        .filter((menu) => menu.items.length > 0),
    [menus, searchQuery, minPrice, maxPrice, selectedCategory]
  );
};

const MenuListWithCart = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentSlug, setCurrentSlug] = useState(slug || null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;


  // Catégories dynamiques
  const categories = useMemo(() => {
    const cats = new Set(menus.map((menu) => menu.category || 'Autres'));
    return ['Tous', ...cats];
  }, [menus]);

  // Charger panier localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart'));
    if (savedCart) setCart(savedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Charger infos du lien court
  useEffect(() => {
    const fetchShortLinkInfo = async () => {
      if (!slug) {
        setMessage('Aucun lien court fourni.');
        setTimeout(() => setMessage(''), 3000);
        navigate('/pagepublic');
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/qr/${slug}/info`);
        setSelectedEvent(response.data.eventId);
        setSelectedTable(response.data.tableId);
        setCurrentSlug(slug);
      } catch (error) {
        console.error('Erreur lors de la récupération des infos du lien:', error);
        setMessage('Impossible de récupérer les informations du lien.');
        setTimeout(() => setMessage(''), 3000);
        navigate('/pagepublic');
      }
    };

    fetchShortLinkInfo();
  }, [slug, navigate]);

  // Charger menus
  useEffect(() => {
    const fetchMenus = async () => {
      if (!selectedEvent) return;

      try {
        setIsLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/menus/event/${selectedEvent}`);

        const formattedMenus = res.data.map((menu) => ({
          ...menu,
          items: menu.items.map((item) => ({
            ...item,
            category: menu.category || 'Autres',
            price: parseFloat(item.price),
          })),
        }));

        setMenus(formattedMenus);
      } catch (error) {
        console.error('Erreur lors du chargement des menus:', error);
        setMessage('Oups, impossible de charger les menus.');
        setTimeout(() => setMessage(''), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenus();
  }, [selectedEvent]);

  // Panier
  const clearCart = useCallback(() => {
    const updatedMenus = menus.map((menu) => ({
      ...menu,
      items: menu.items.map((item) => {
        const cartItem = cart.find((ci) => ci.id === item.id);
        return cartItem ? { ...item, stock: item.stock + cartItem.quantity } : item;
      }),
    }));
    setMenus(updatedMenus);
    setCart([]);
    toast.success('Commande validée et panier vidé !', { autoClose: 2000 });
  }, [cart, menus]);

  const addToCart = useCallback(
    (item) => {
      if (item.stock <= 0) {
        toast.error(`Stock épuisé pour "${item.name}".`, { autoClose: 2000 });
        return;
      }

      const updatedMenus = menus.map((menu) => ({
        ...menu,
        items: menu.items.map((i) =>
          i.id === item.id ? { ...i, stock: i.stock - 1 } : i
        ),
      }));
      setMenus(updatedMenus);

      const existing = cart.find((ci) => ci.id === item.id);
      if (existing) {
        setCart(
          cart.map((ci) =>
            ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
          )
        );
      } else {
        setCart([...cart, { ...item, quantity: 1 }]);
      }

      toast.success('Article ajouté au panier !', { autoClose: 2000 });
    },
    [cart, menus]
  );

  const updateQuantity = useCallback(
    (itemId, delta) => {
      const cartItem = cart.find((ci) => ci.id === itemId);
      if (!cartItem) return;

      let currentStock = 0;
      menus.forEach((menu) => {
        const menuItem = menu.items.find((item) => item.id === itemId);
        if (menuItem) currentStock = menuItem.stock;
      });

      if (delta > 0 && currentStock <= 0) {
        toast.warn(`Quantité maximale atteinte pour "${cartItem.name}".`, { autoClose: 2000 });
        return;
      }

      const updatedMenus = menus.map((menu) => ({
        ...menu,
        items: menu.items.map((item) =>
          item.id === itemId
            ? { ...item, stock: item.stock + (delta < 0 ? 1 : -1) }
            : item
        ),
      }));
      setMenus(updatedMenus);

      setCart(
        cart.map((ci) =>
          ci.id === itemId
            ? { ...ci, quantity: Math.max(1, ci.quantity + delta) }
            : ci
        )
      );
    },
    [cart, menus]
  );

  const removeFromCart = useCallback(
    (itemId) => {
      const itemInCart = cart.find((ci) => ci.id === itemId);
      if (itemInCart) {
        const updatedMenus = menus.map((menu) => ({
          ...menu,
          items: menu.items.map((item) =>
            item.id === itemId
              ? { ...item, stock: item.stock + itemInCart.quantity }
              : item
          ),
        }));
        setMenus(updatedMenus);
      }

      setCart(cart.filter((ci) => ci.id !== itemId));
      toast.info('Article retiré du panier.', { autoClose: 2000 });
    },
    [cart, menus]
  );

  const totalPrice = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );

  const formatPrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // Filtres & pagination
  const filteredMenus = useMenuFilter(menus, searchQuery, minPrice, maxPrice, selectedCategory);

  const paginatedMenus = useMemo(
    () =>
      filteredMenus.map((menu) => ({
        ...menu,
        items: menu.items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
      })),
    [filteredMenus, currentPage]
  );

  const totalItems = useMemo(
    () => filteredMenus.reduce((acc, menu) => acc + menu.items.length, 0),
    [filteredMenus]
  );
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleValidateOrder = () => {
    setIsCartOpen(false);
    if (cart.length > 0) {
      setIsInvoiceOpen(true);
    } else {
      toast.warn('Votre panier est vide.', { autoClose: 2000 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-50 to-white px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        toastClassName="rounded-lg shadow-lg bg-white text-gray-800"
      />

      {/* Header */}
      <HeaderSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartLength={cart.length}
        onCartOpen={() => setIsCartOpen(true)}
      />

      {/* Filtres */}
      <motion.div
        className="sticky top-0 z-10 bg-white/90 backdrop-blur-md rounded-xl shadow-md p-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Prix */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              placeholder="Min €"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-28 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max €"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-28 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          {/* Catégories */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat === 'Tous' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-teal-500 text-white px-4 py-2 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          role="alert"
        >
          {message}
        </motion.div>
      )}

      {/* Loader */}
      {isLoading || !selectedEvent ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow animate-pulse p-6 h-40" />
          ))}
        </motion.div>
      ) : filteredMenus.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-xl p-8 shadow-md">
            <svg className="w-16 h-16 mx-auto mb-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-teal-600 font-semibold text-base">Aucun menu disponible</p>
            <p className="text-gray-600 text-sm mt-2">Aucun menu ne correspond à vos critères.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
            Menu pour l'événement {selectedEvent}
          </h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <MenuGrid menus={paginatedMenus} addToCart={addToCart} formatPrice={formatPrice} />
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-full transition ${
                    currentPage === i + 1
                      ? 'bg-teal-600 text-white shadow'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Drawer Panier */}
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

      {/* Modal Facture */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        cart={cart}
        totalPrice={totalPrice}
        formatPrice={formatPrice}
        selectedEvent={selectedEvent}
        selectedTable={selectedTable}
        currentSlug={currentSlug}
        onValidateSuccess={clearCart}
      />
    </div>
  );
};

MenuListWithCart.propTypes = {};

export default MenuListWithCart;
