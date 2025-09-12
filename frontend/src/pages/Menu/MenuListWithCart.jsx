import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

import HeaderSection from './HeaderSection';
import MenuGrid from './MenuGrid';
import CartDrawer from './CartDrawer';
import InvoiceModal from './InvoiceModal';

const useMenuFilter = (menus, searchQuery, selectedCategory) => {
  return useMemo(() => {
    const filtered = menus
      .map((menu) => ({
        ...menu,
        items: menu.items.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (!selectedCategory || menu.category === selectedCategory)
        ),
      }))
      .filter((menu) => menu.items.length > 0);
    return filtered;
  }, [menus, searchQuery, selectedCategory]);
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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentSlug, setCurrentSlug] = useState(slug || null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  // Dynamic categories
  const categories = useMemo(() => {
    const cats = new Set(menus.map((menu) => menu.category).filter(Boolean));
    return Array.from(cats);
  }, [menus]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart'));
    if (savedCart) setCart(savedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch short link info
  useEffect(() => {
    const fetchShortLinkInfo = async () => {
      if (!slug) {
        setMessage('Aucun lien court fourni.');
        setTimeout(() => setMessage(''), 3000);
        navigate('/');
        return;
      }
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/qr/${slug}/info`);
        setSelectedEvent(response.data.eventId);
        setSelectedTable(response.data.tableId);
        setCurrentSlug(slug);
      } catch (error) {
        console.error('Erreur récupération lien:', error);
        setMessage('Impossible de récupérer les informations du lien.');
        setTimeout(() => setMessage(''), 3000);
        navigate('/');
      }
    };
    fetchShortLinkInfo();
  }, [slug, navigate]);

  // Fetch menus
  const fetchMenus = useCallback(async () => {
    if (!selectedEvent) return;
    try {
      setIsLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/menus/event/${selectedEvent.nom}`);
      const formattedMenus = res.data.map((menu) => ({
        ...menu,
        items: menu.items.map((item) => ({
          ...item,
          category: menu.category,
          price: parseFloat(item.price),
        })),
      }));
      setMenus(formattedMenus);
    } catch (error) {
      console.error('Erreur chargement menus:', error);
      setMessage('Oups, impossible de charger les menus.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEvent]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // Cart management
  const clearCart = useCallback(() => {
    setCart([]);
    fetchMenus();
    toast.success('Commande validée avec succès !', { autoClose: 2000 });
  }, [fetchMenus]);

  const addToCart = useCallback((item) => {
    if (item.stock <= 0) {
      toast.error(`Stock épuisé pour "${item.name}".`, { autoClose: 2000 });
      return;
    }
    const updatedMenus = menus.map((menu) => ({
      ...menu,
      items: menu.items.map((i) => (i.id === item.id ? { ...i, stock: i.stock - 1 } : i)),
    }));
    setMenus(updatedMenus);

    const existing = cart.find((ci) => ci.id === item.id);
    if (existing) {
      setCart(cart.map((ci) => (ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci)));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }

    toast.dismiss();
    setMessage('');
  }, [cart, menus]);

  const updateQuantity = useCallback((itemId, delta) => {
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
        item.id === itemId ? { ...item, stock: item.stock + (delta < 0 ? 1 : -1) } : item
      ),
    }));
    setMenus(updatedMenus);

    setCart(cart.map((ci) => (ci.id === itemId ? { ...ci, quantity: Math.max(1, ci.quantity + delta) } : ci)));
  }, [cart, menus]);

  const removeFromCart = useCallback((itemId) => {
    const itemInCart = cart.find((ci) => ci.id === itemId);
    if (itemInCart) {
      const updatedMenus = menus.map((menu) => ({
        ...menu,
        items: menu.items.map((item) =>
          item.id === itemId ? { ...item, stock: item.stock + itemInCart.quantity } : item
        ),
      }));
      setMenus(updatedMenus);
    }
    setCart(cart.filter((ci) => ci.id !== itemId));
    toast.info('Article retiré du panier.', { autoClose: 2000 });
  }, [cart, menus]);

  const totalPrice = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);

  const formatPrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // Filters & Pagination
  const filteredMenus = useMenuFilter(menus, searchQuery, selectedCategory);

  const paginatedMenus = useMemo(
    () => filteredMenus.map((menu) => ({
      ...menu,
      items: menu.items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    })),
    [filteredMenus, currentPage]
  );

  const totalItems = useMemo(() => filteredMenus.reduce((acc, menu) => acc + menu.items.length, 0), [filteredMenus]);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleValidateOrder = () => {
    setIsCartOpen(false);
    if (cart.length > 0) setIsInvoiceOpen(true);
    else toast.warn('Votre panier est vide.', { autoClose: 2000 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        closeButton={({ closeToast }) => (
          <button onClick={closeToast} className="p-1 text-gray-600 hover:text-gray-800 transition">
            <X size={16} />
          </button>
        )}
        toastClassName="rounded-xl shadow-lg bg-white text-gray-800 border border-gray-200"
        bodyClassName="flex items-center p-4"
      />

      <HeaderSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartLength={cart.length}
        onCartOpen={() => setIsCartOpen(true)}
      />

      {/* Category Filter */}
      <motion.div
        className="sticky top-0 z-10 bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="flex gap-2 overflow-x-auto w-full py-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-teal-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Loader or Empty */}
      {isLoading || !selectedEvent ? (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md animate-pulse p-6 h-40 border border-gray-100" />
          ))}
        </motion.div>
      ) : filteredMenus.length === 0 ? (
        <motion.div className="text-center py-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
            <p className="text-teal-600 font-semibold text-base">Aucun menu disponible</p>
            <p className="text-gray-600 text-sm mt-2">Aucun menu ne correspond à vos critères.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
            Menu pour l'événement {selectedEvent}
          </h2>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <MenuGrid menus={paginatedMenus} addToCart={addToCart} formatPrice={formatPrice} />
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2 items-center">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="p-2 rounded-full bg-gray-100 hover:bg-teal-100 transition" disabled={currentPage === 1}>
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-full transition-all duration-200 ${
                    currentPage === i + 1 ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-teal-100 hover:text-teal-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="p-2 rounded-full bg-gray-100 hover:bg-teal-100 transition" disabled={currentPage === totalPages}>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Cart Drawer */}
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

      {/* Invoice Modal */}
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

export default MenuListWithCart;
