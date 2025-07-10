import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

const MenuListWithCart = () => {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [guestInfo, setGuestInfo] = useState(null);

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

  const fetchGuestInfo = async () => {
    try {
      const email = localStorage.getItem('guestEmail');  
      const eventId = localStorage.getItem('eventId');   
      if (!email || !eventId) {
        setMessage("Email ou événement manquant. Veuillez vous reconnecter.");
        return;
      }

      const res = await axios.post(
        'http://localhost:3000/verify-email',
        { email, eventId: Number(eventId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGuestInfo(res.data);
    } catch (error) {
      console.error("Erreur récupération invité:", error);
      setMessage("Invité non reconnu. Veuillez contacter l'organisateur.");
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchGuestInfo();
  }, []);

  const addToCart = (item) => {
    const existing = cart.find((ci) => ci.id === item.id);
    if (item.stock <= 0) return;

    const updatedMenus = menus.map(menu => ({
      ...menu,
      items: menu.items.map(i =>
        i.id === item.id ? { ...i, stock: i.stock - 1 } : i
      ),
    }));
    setMenus(updatedMenus);

    if (existing) {
      setCart(cart.map(ci =>
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
    const cartItem = cart.find(ci => ci.id === itemId);
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

    setCart(cart.map(ci =>
      ci.id === itemId ? { ...ci, quantity: Math.max(1, ci.quantity + delta) } : ci
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

    setCart(cart.filter(ci => ci.id !== itemId));
    setMessage('Article retiré du panier.');
    setTimeout(() => setMessage(''), 3000);
  };

  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const filteredMenus = menus.map(menu => ({
    ...menu,
    items: menu.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(menu => menu.items.length > 0);

  const handleValidateOrder = () => {
    setIsCartOpen(false);
    if (cart.length > 0) {
      setIsInvoiceOpen(true);
    } else {
      setMessage('Votre panier est vide.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Facture', 105, y, { align: 'center' });

    if (guestInfo) {
      y += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nom invité : ${guestInfo.prenom} ${guestInfo.nom}`, margin, y);
      y += 7;
      doc.text(`Événement : ${guestInfo.eventName}`, margin, y);
      y += 7;
      doc.text(`Table : ${guestInfo.table || 'Non attribuée'}`, margin, y);
    }

    y += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Date : ${new Date().toLocaleDateString()}`, margin, y);

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(33, 37, 41);
    doc.text('Détails de la commande :', margin, y);

    y += 8;

    doc.setDrawColor(230);
    doc.setLineWidth(0.1);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Article', margin, y);
    doc.text('Quantité x Prix', 140, y, { align: 'right' });
    doc.text('Total', 180, y, { align: 'right' });
    y += 6;

    cart.forEach((item, index) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
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

    doc.save('facture.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-16 py-8 font-sans">
      {/* Header + recherche + panier */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-12">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 italic tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-600">
            Découvrez Nos Menus !
          </h2>
          <p className="mt-1 text-gray-600 text-base sm:text-lg font-medium">
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
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-blue-600 text-white p-2.5 rounded-lg shadow-sm hover:bg-blue-500 transition-all duration-200 relative"
            aria-label="Ouvrir le panier"
          >
            <span className="text-lg">🛒</span>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notification */}
      {message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in">
          {message}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMenus
              .filter(menu => menu.items && menu.items.length > 0)
              .map(menu => (
                <div
                  key={menu.id}
                  className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    {menu.name}
                  </h3>
                  <div className="space-y-6">
                    {menu.items.map(item => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center gap-4 group"
                      >
                        <div className="flex-1 flex gap-4 items-center">
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
                            <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.description}</p>
                            <p className="text-lg font-bold text-green-600 mt-2">
                              {formatPrice(item.price)} €
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium text-gray-700">Stock :</span> {item.stock}
                              {item.stock === 0 && (
                                <span className="text-red-500 font-semibold ml-2">Épuisé</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          disabled={item.stock <= 0}
                          className={`text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 ${
                            item.stock <= 0
                              ? 'bg-gray-200 cursor-not-allowed text-gray-500'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md'
                          }`}
                        >
                          {item.stock <= 0 ? 'Indisponible' : 'Ajouter'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* No Menu */}
          {filteredMenus.every(menu => !menu.items || menu.items.length === 0) && (
            <p className="text-center text-gray-600 italic py-6 text-lg">
              Aucun menu disponible pour le moment ou aucun résultat pour votre recherche.
            </p>
          )}
        </>
      )}

      {/* Cart */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Panier"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-purple-600">🛒</span> Votre Panier
              {cart.length > 0 && (
                <span className="ml-2 bg-purple-100 text-purple-600 text-sm px-2 py-1 rounded-full">
                  {cart.length}
                </span>
              )}
            </h3>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-600 hover:text-gray-800 text-2xl transition-colors duration-200"
              aria-label="Fermer le panier"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {cart.length === 0 ? (
              <p className="text-gray-500 italic text-center py-6 text-lg">
                Votre panier est vide. Ajoutez des plats pour commencer !
              </p>
            ) : (
              <div className="space-y-6">
                {cart.map(ci => (
                  <div
                    key={ci.id}
                    className="flex justify-between items-center border-b border-gray-200 pb-4"
                  >
                    <div className="flex-1 flex gap-4 items-center">
                      {ci.photo ? (
                        <img
                          src={`http://localhost:3000${ci.photo}`}
                          alt={ci.name}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                          Pas d'image
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-800">{ci.name}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <button
                            onClick={() => updateQuantity(ci.id, -1)}
                            disabled={ci.quantity <= 1}
                            className="w-7 h-7 rounded-full bg-gray-300 text-gray-600 font-bold hover:bg-gray-400 transition-colors duration-200"
                            aria-label={`Réduire la quantité de ${ci.name}`}
                          >
                            −
                          </button>
                          <span>{ci.quantity}</span>
                          <button
                            onClick={() => updateQuantity(ci.id, 1)}
                            disabled={ci.stock <= 0}
                            className={`w-7 h-7 rounded-full text-white font-bold ${
                              ci.stock > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
                            } transition-colors duration-200`}
                            aria-label={`Augmenter la quantité de ${ci.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(ci.id)}
                      className="text-red-600 font-bold hover:text-red-800 text-xl transition-colors duration-200"
                      aria-label={`Retirer ${ci.name} du panier`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-6 border-t border-gray-200 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-gray-900">Total :</span>
              <span className="text-xl font-semibold text-green-600">{formatPrice(totalPrice)} €</span>
            </div>
            <button
              onClick={handleValidateOrder}
              disabled={cart.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors duration-300"
              aria-label="Valider la commande"
            >
              Valider la commande
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {isInvoiceOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invoice-title"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
            <h2 id="invoice-title" className="text-3xl font-bold mb-4 text-center">
              Facture
            </h2>
            {guestInfo ? (
              <div className="mb-4 text-gray-700">
                <p>
                  <strong>Nom invité :</strong> {guestInfo.prenom} {guestInfo.nom}
                </p>
                <p>
                  <strong>Événement :</strong> {guestInfo.eventName}
                </p>
                <p>
                  <strong>Table :</strong> {guestInfo.table || 'Non attribuée'}
                </p>
              </div>
            ) : (
              <p className="text-red-600 font-semibold mb-4">Informations invité non disponibles.</p>
            )}

            <div className="space-y-3 max-h-64 overflow-y-auto mb-4 border rounded p-2 bg-gray-50">
              {cart.length === 0 ? (
                <p className="text-center text-gray-600 italic">Votre panier est vide.</p>
              ) : (
                cart.map(item => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b border-gray-300 last:border-0 pb-2"
                  >
                    <span>{item.name}</span>
                    <span>
                      {item.quantity} x {formatPrice(item.price)} €
                    </span>
                    <span>{formatPrice(item.price * item.quantity)} €</span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between font-bold text-lg text-green-700 mb-4">
              <span>Total :</span>
              <span>{formatPrice(totalPrice)} €</span>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setIsInvoiceOpen(false)}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors duration-200"
                aria-label="Fermer la facture"
              >
                Fermer
              </button>
              <button
                onClick={generatePDF}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                aria-label="Télécharger la facture au format PDF"
              >
                Télécharger PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuListWithCart;
