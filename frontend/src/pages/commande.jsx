import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const MenuListWithCart = () => {
  const { id } = useParams();
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isConfirmOrderModalOpen, setIsConfirmOrderModalOpen] = useState(false);
  const token = localStorage.getItem('token');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  const [itemToRemove, setItemToRemove] = useState(null); 
  const [orderHistory, setOrderHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [ratings, setRatings] = useState({}); 
  const [comments, setComments] = useState({}); 
  const [favorites, setFavorites] = useState([]); 
  const [categories, setCategories] = useState(['all', 'Entrées', 'Plats', 'Desserts', 'Boissons']);
  const [error, setError] = useState('');

  // Extraire eventId et tableId de l'URL
  const extractIdsFromUrl = () => {
    const match = location.pathname.match(/event\/(\d+)\/table\/(\d+)/);
    if (!match) {
      setError('URL invalide : événement ou table non trouvé.');
      return { eventId: null, tableId: null };
    }
    return {
      eventId: parseInt(match[1]),
      tableId: parseInt(match[2]),
    };
  };

  const fetchMenus = async (id) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`http://localhost:3000/menus/event/${id}`);
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
      setMessage('Erreur lors du chargement des menus.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:3000/menus/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(['all', ...res.data]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await axios.get('http://localhost:3000/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(res.data.map(item => item.id));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const res = await axios.get('http://localhost:3000/orders/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrderHistory(res.data);
    } catch (error) {
      console.error(error);
      setMessage('Erreur lors du chargement de l\'historique.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  useEffect(() => {
    fetchMenus(id);
    fetchCategories();
    fetchFavorites();
    const event = JSON.parse(localStorage.getItem('selectedEvent'));
    const table = JSON.parse(localStorage.getItem('selectedTable'));
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const savedDarkMode = JSON.parse(localStorage.getItem('darkMode')) || false;
    if (event) setSelectedEvent(event);
    if (table) setSelectedTable(table);
    setCart(savedCart);
    setIsDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [cart, isDarkMode, favorites]);

  const addToCart = (item) => {
    const existing = cart.find((ci) => ci.id === item.id);
    const quantityInCart = existing ? existing.quantity : 0;

    if (item.stock <= 0) {
      setMessage(`Stock épuisé pour "${item.name}".`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

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
      setMessage(`Stock épuisé pour "${item.name}".`);
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
      setMessage(`Stock épuisé pour "${cartItem.name}".`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (delta > 0) {
      const updatedMenus = menus.map(menu => ({
        ...menu,
        items: menu.items.map(item =>
          item.id === itemId ? { ...item, stock: item.stock - 1 } : item
        ),
      }));
      setMenus(updatedMenus);
    } else if (delta < 0 && cartItem.quantity > 1) {
      const updatedMenus = menus.map(menu => ({
        ...menu,
        items: menu.items.map(item =>
          item.id === itemId ? { ...item, stock: item.stock + 1 } : item
        ),
      }));
      setMenus(updatedMenus);
    }

    setCart(cart.map((ci) =>
      ci.id === itemId ? { ...ci, quantity: Math.max(1, ci.quantity + delta) } : ci
    ));

    if (delta > 0 && currentStock - 1 === 0) {
      setMessage(`Stock épuisé pour "${cartItem.name}".`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const confirmRemoveFromCart = (itemId) => {
    setItemToRemove(itemId);
    setShowConfirmModal(true);
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

  const handleConfirmRemove = () => {
    removeFromCart(itemToRemove);
    setShowConfirmModal(false);
    setItemToRemove(null);
  };

  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const filteredMenus = menus
    .map(menu => ({
      ...menu,
      items: menu.items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategory === 'all' || item.category === selectedCategory)
      ),
    }))
    .filter(menu => menu.items.length > 0);

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const sendNotification = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const handleValidateOrder = () => {
    if (cart.length === 0) {
      setMessage('Votre panier est vide.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsCartOpen(false);
    setIsConfirmOrderModalOpen(true);
  };

  const confirmOrder = async () => {
    if (!guestName || !guestFirstName || !guestEmail) {
      setMessage('Veuillez remplir tous les champs (nom, prénom, email).');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const items = cart.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
      }));

      await axios.post(
        'http://localhost:3000/orders',
        {
          tableId: selectedTable.id,
          nom: guestName,
          prenom: guestFirstName,
          email: guestEmail,
          items
        },

       
        // { headers: { Authorization: `Bearer ${token}` } }
      );
      if (await requestNotificationPermission()) {
        sendNotification(
          'Commande validée',
          `Votre commande de ${formatPrice(totalPrice)} € a été confirmée !`
        );
      }
      setCart([]); // Clear the cart after successful order
      localStorage.setItem('cart', JSON.stringify([]));
      setIsConfirmOrderModalOpen(false);
      setIsInvoiceOpen(true);
    } catch (error) {
      console.error(error);
      setMessage('Erreur lors de la validation de la commande.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    const invoiceNumber = `FAC-${Date.now()}`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Facture', 105, y, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90);
    doc.text(`N° : ${invoiceNumber}`, 190 - margin, y, { align: 'right' });

    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Date : ${new Date().toLocaleDateString()}`, margin, y);

    y += 8;
    doc.text(`Nom : ${guestName}`, margin, y);
    y += 8;
    doc.text(`Prénom : ${guestFirstName}`, margin, y);
    y += 8;
    doc.text(`Email : ${guestEmail}`, margin, y);

    if (selectedEvent) {
      y += 8;
      doc.text(`Événement : ${selectedEvent.nom}`, margin, y);
    }
    if (selectedTable) {
      y += 8;
      doc.text(`Table : ${selectedTable.nom || selectedTable.numero}`, margin, y);
    }

    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(33, 37, 41);
    doc.text('Détails de la commande :', margin, y);

    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text('Article', margin, y);
    doc.text('Qté x Prix', 140, y, { align: 'right' });
    doc.text('Total', 180, y, { align: 'right' });

    y += 6;
    cart.forEach((item, index) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60);
      doc.text(`${index + 1}. ${item.name}`, margin, y);
      doc.text(`${item.quantity} x ${formatPrice(item.price)} €`, 140, y, { align: 'right' });
      doc.text(`${formatPrice(item.price * item.quantity)} €`, 180, y, { align: 'right' });
      y += 8;
      doc.setDrawColor(235);
      doc.line(margin, y - 5, 190, y - 5);
    });

    y += 5;
    doc.setDrawColor(180);
    doc.line(margin, y, 190, y);

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 128, 0);
    doc.text('Total :', 140, y, { align: 'right' });
    doc.text(`${formatPrice(totalPrice)} €`, 180, y, { align: 'right' });

    doc.save(`${invoiceNumber}.pdf`);
  };

  const toggleFavorite = async (itemId) => {
    try {
      if (favorites.includes(itemId)) {
        await axios.delete(`http://localhost:3000/favorites/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(favorites.filter(id => id !== itemId));
        setMessage('Retiré des favoris.');
      } else {
        await axios.post(`http://localhost:3000/favorites/${itemId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites([...favorites, itemId]);
        setMessage('Ajouté aux favoris.');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Erreur lors de la gestion des favoris.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const submitRating = async (itemId, rating, comment) => {
    try {
      await axios.post(
        `http://localhost:3000/menus/items/${itemId}/ratings`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Évaluation enregistrée !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Erreur lors de l\'enregistrement de l\'évaluation.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-800 text-white' : 'bg-gray-50 text-gray-800'} px-4 sm:px-6 lg:px-8 py-10 font-sans`}>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Découvrez Nos Menus
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Plats savoureux, préparés avec soin pour votre plaisir.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un plat..."
              className="w-64 sm:w-72 px-4 py-2.5 rounded-full border border-gray-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              aria-label="Rechercher un plat"
            />
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100"
              aria-label="Réinitialiser la recherche"
            >
              {searchQuery ? '✕' : '🔍'}
            </button>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-full border border-gray-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Filtrer par catégorie"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label={isDarkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => {
              fetchOrderHistory();
              setIsHistoryOpen(true);
            }}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Voir l'historique des commandes"
          >
            📜
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-indigo-600 text-white p-2.5 rounded-full shadow-md hover:bg-indigo-700 transition-all duration-200"
            aria-label="Ouvrir le panier"
          >
            <span className="text-lg">🛒</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notification */}
      {message && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300">
          {message}
        </div>
      )}

      {/* Skeleton Loader */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-5">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4 animate-pulse"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Grille des menus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMenus.map((menu) => (
              <div
                key={menu.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-5 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                  {menu.name}
                </h3>
                <div className="space-y-5">
                  {menu.items.map((item) => (
                    <div key={item.id} className="flex flex-col gap-4 group">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {item.photo ? (
                            <img
                              src={`http://localhost:3000${item.photo}`}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-300 text-xs">
                              Pas d'image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => toggleFavorite(item.id)}
                              className={`p-2 rounded-full ${favorites.includes(item.id) ? 'text-red-500' : 'text-gray-400 dark:text-gray-300'} hover:text-red-600 dark:hover:text-red-400`}
                              aria-label={favorites.includes(item.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                            >
                              ♥
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
                          <p className="text-base font-semibold text-green-600 dark:text-green-400 mt-1">
                            {formatPrice(item.price)} €
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Stock : {item.stock}
                            {item.stock === 0 && (
                              <span className="text-red-500 dark:text-red-400 font-medium ml-2">Épuisé</span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          disabled={item.stock <= 0}
                          className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                            item.stock <= 0
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-300 cursor-not-allowed'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {item.stock <= 0 ? 'Indisponible' : 'Ajouter'}
                        </button>
                      </div>
                      {/* Formulaire d'évaluation */}
                      <div className="mt-4">
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => setRatings({ ...ratings, [item.id]: star })}
                              className={`text-2xl ${ratings[item.id] >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'}`}
                              aria-label={`Noter ${star} étoile(s)`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={comments[item.id] || ''}
                          onChange={(e) => setComments({ ...comments, [item.id]: e.target.value })}
                          placeholder="Votre commentaire..."
                          className="w-full mt-2 p-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows="3"
                          aria-label="Commentaire sur le plat"
                        />
                        <button
                          onClick={() => submitRating(item.id, ratings[item.id], comments[item.id])}
                          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                        >
                          Envoyer l'évaluation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Aucun menu trouvé */}
          {filteredMenus.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 text-base py-8">
              Aucun plat trouvé pour votre recherche.
            </p>
          )}

          {/* Section des favoris */}
          {favorites.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold mb-4">Vos favoris</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {menus
                  .flatMap(menu => menu.items)
                  .filter(item => favorites.includes(item.id))
                  .map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-5">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{item.name}</h4>
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
                          aria-label="Retirer des favoris"
                        >
                          ♥
                        </button>
                      </div>
                      <p className="text-green-600 dark:text-green-400">{formatPrice(item.price)} €</p>
                      <button
                        onClick={() => addToCart(item)}
                        disabled={item.stock <= 0}
                        className={`mt-2 px-4 py-2 text-sm font-medium rounded-full ${
                          item.stock <= 0
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-300 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {item.stock <= 0 ? 'Indisponible' : 'Ajouter'}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Panier */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Panier"
        aria-expanded={isCartOpen}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
            <h3 className="text-xl font-semibold">
              Votre Panier
              {cart.length > 0 && (
                <span className="ml-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs px-2 py-1 rounded-full">
                  {cart.length}
                </span>
              )}
            </h3>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 text-xl"
              aria-label="Fermer le panier"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {cart.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                Votre panier est vide.
              </p>
            ) : (
              <div className="space-y-4">
                {cart.map((ci) => (
                  <div
                    key={ci.id}
                    className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4"
                  >
                    <div className="flex-shrink-0">
                      {ci.photo ? (
                        <img
                          src={`http://localhost:3000${ci.photo}`}
                          alt={ci.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-300 text-xs">
                          Pas d'image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{ci.name}</h4>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(ci.id, -1)}
                            className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            aria-label="Réduire la quantité"
                          >
                            -
                          </button>
                          <span className="text-gray-600 dark:text-gray-300">{ci.quantity}</span>
                          <button
                            onClick={() => updateQuantity(ci.id, 1)}
                            className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            aria-label="Augmenter la quantité"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-green-600 dark:text-green-400 font-medium">
                          {formatPrice(ci.price * ci.quantity)} €
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => confirmRemoveFromCart(ci.id)}
                      className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-sm"
                      aria-label="Retirer l'article"
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex justify-between items-center text-lg font-semibold mb-4">
                <span>Total :</span>
                <span className="text-green-600 dark:text-green-400">{formatPrice(totalPrice)} €</span>
              </div>
              <button
                className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-all duration-200"
                onClick={handleValidateOrder}
              >
                Valider la commande
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Voulez-vous vraiment retirer cet article du panier ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmRemove}
                className="flex-1 py-2 bg-red-600 text-white font-medium rounded-full hover:bg-red-700"
              >
                Supprimer
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de commande */}
      {isConfirmOrderModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Confirmer votre commande</h3>
              <button
                onClick={() => setIsConfirmOrderModalOpen(false)}
                className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 text-lg"
                aria-label="Fermer la confirmation"
              >
                ✕
              </button>
            </div>
            <div className="mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Entrez votre nom"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Nom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  value={guestFirstName}
                  onChange={(e) => setGuestFirstName(e.target.value)}
                  placeholder="Entrez votre prénom"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Prénom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="Entrez votre email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Email"
                />
              </div>
              {selectedEvent && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Événement :</span> {selectedEvent.nom}
                </p>
              )}
              {selectedTable && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Table :</span> {selectedTable.nom || selectedTable.numero}
                </p>
              )}
            </div>
            <h4 className="text-lg font-semibold mb-3">Articles commandés :</h4>
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 py-2"
                >
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.quantity} × {formatPrice(item.price)} €
                    </p>
                  </div>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    {formatPrice(item.price * item.quantity)} €
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between text-lg font-semibold">
              <span>Total :</span>
              <span className="text-green-600 dark:text-green-400">{formatPrice(totalPrice)} €</span>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 py-2 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-all duration-200"
                onClick={confirmOrder}
              >
                Confirmer la commande
              </button>
              <button
                className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => setIsConfirmOrderModalOpen(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de facture */}
      {isInvoiceOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Facture</h3>
              <button
                onClick={() => setIsInvoiceOpen(false)}
                className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 text-lg"
                aria-label="Fermer la facture"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span className="font-medium">Nom :</span> {guestName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span className="font-medium">Prénom :</span> {guestFirstName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span className="font-medium">Email :</span> {guestEmail}
            </p>
            {selectedEvent && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-medium">Événement :</span> {selectedEvent.nom}
              </p>
            )}
            {selectedTable && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-medium">Table :</span> {selectedTable.nom || selectedTable.numero}
              </p>
            )}
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 py-2"
                >
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.quantity} × {formatPrice(item.price)} €
                    </p>
                  </div>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    {formatPrice(item.price * item.quantity)} €
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between text-lg font-semibold">
              <span>Total :</span>
              <span className="text-green-600 dark:text-green-400">{formatPrice(totalPrice)} €</span>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 py-2 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-all duration-200"
                onClick={generatePDF}
              >
                Télécharger PDF
              </button>
              <button
                className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => setIsInvoiceOpen(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'historique des commandes */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Historique des commandes</h3>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 text-lg"
                aria-label="Fermer l'historique"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              {orderHistory.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center">Aucune commande passée.</p>
              ) : (
                orderHistory.map(order => (
                  <div key={order.id} className="border-b border-gray-200 dark:border-gray-700 py-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Commande #{order.id} - {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      Total : {formatPrice(order.total)} €
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Statut : {order.status}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay du panier */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsCartOpen(false)}
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default MenuListWithCart;