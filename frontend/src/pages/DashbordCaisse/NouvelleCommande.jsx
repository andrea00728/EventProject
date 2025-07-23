import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LucidePlus, 
  LucideMinus, 
  LucideTrash2, 
  LucideCheck, 
  LucideArrowLeft,
  LucideUtensilsCrossed
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NouvelleCommande = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [clientInfo, setClientInfo] = useState({
    nom: '',
    email: ''
  });
  const [table, setTable] = useState(null);
  const [event, setEvent] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
  
        const menusResponse = await axios.get('/api/menus');
        setMenus(menusResponse.data);
        

        if (tableId) {
          const tableResponse = await axios.get(`/api/tables/${tableId}`);
          setTable(tableResponse.data);
          
        
          if (tableResponse.data.eventId) {
            const eventResponse = await axios.get(`/api/events/${tableResponse.data.eventId}`);
            setEvent(eventResponse.data);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur de chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableId]);

  const addToCart = (menuItem) => {
    if (menuItem.stock <= 0) return;
    
    const existingItem = cart.find(item => item.menuItem.id === menuItem.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.menuItem.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { menuItem, quantity: 1 }]);
    }

    setMenus(menus.map(menu => ({
      ...menu,
      items: menu.items.map(item =>
        item.id === menuItem.id
          ? { ...item, stock: item.stock - 1 }
          : item
      )
    })));
  };

  const updateQuantity = (menuItemId, delta) => {
    const cartItem = cart.find(item => item.menuItem.id === menuItemId);
    if (!cartItem) return;
    
    const newQuantity = cartItem.quantity + delta;
    
    if (newQuantity < 1) {
      removeFromCart(menuItemId);
      return;
    }

    const menuItem = menus.flatMap(menu => menu.items).find(item => item.id === menuItemId);
    const currentStock = menuItem?.stock || 0;
    
    if (delta > 0 && currentStock <= 0) {
      return;
    }
    
    setCart(cart.map(item =>
      item.menuItem.id === menuItemId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  
    setMenus(menus.map(menu => ({
      ...menu,
      items: menu.items.map(item =>
        item.id === menuItemId
          ? { ...item, stock: item.stock - delta }
          : item
      )
    })));
  };

  const removeFromCart = (menuItemId) => {
    const cartItem = cart.find(item => item.menuItem.id === menuItemId);
    if (!cartItem) return;
    
    setCart(cart.filter(item => item.menuItem.id !== menuItemId));

    setMenus(menus.map(menu => ({
      ...menu,
      items: menu.items.map(item =>
        item.id === menuItemId
          ? { ...item, stock: item.stock + cartItem.quantity }
          : item
      )
    })));
  };

  const total = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  const submitOrder = async () => {
    try {
      const orderData = {
        tableId: table?.id || null,
        items: cart.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity
        })),
        nom: clientInfo.nom || null,
        email: clientInfo.email || null
      };
      
      await axios.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      navigate(tableId ? `/gestion-commandes/table/${tableId}` : '/gestion-commandes');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la commande');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
      <p className="font-bold">Erreur</p>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <LucideArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {table ? `Nouvelle commande - Table ${table.name}` : 'Nouvelle commande'}
          </h1>
          <div></div> {/* Empty div for spacing */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Menu</h2>
            
            {menus.map(menu => (
              <div key={menu.id} className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">{menu.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {menu.items.map(item => (
                    <div 
                      key={item.id} 
                      className={`border rounded-lg p-4 ${item.stock <= 0 ? 'opacity-50' : 'hover:shadow-md cursor-pointer'}`}
                      onClick={() => item.stock > 0 && addToCart(item)}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{item.name}</h4>
                        <span className="font-medium">{item.price.toFixed(2)} €</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.stock > 5 ? 'bg-green-100 text-green-800' : 
                          item.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          Stock: {item.stock}
                        </span>
                        {item.stock > 0 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <LucidePlus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart and Client Info */}
          <div className="space-y-6">
            {/* Client Info */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Informations client</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={clientInfo.nom}
                    onChange={(e) => setClientInfo({...clientInfo, nom: e.target.value})}
                    placeholder="Optionnel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                    placeholder="Optionnel"
                  />
                </div>
                {table && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
                    <p className="px-3 py-2 bg-gray-100 rounded-md">{table.name}</p>
                  </div>
                )}
                {event && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Événement</label>
                    <p className="px-3 py-2 bg-gray-100 rounded-md">{event.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Commande en cours</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <LucideUtensilsCrossed className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p>Votre panier est vide</p>
                  <p className="text-sm">Cliquez sur les articles pour les ajouter</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-200">
                    {cart.map(item => (
                      <div key={item.menuItem.id} className="py-3">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">{item.menuItem.name}</h4>
                            <p className="text-sm text-gray-500">{item.menuItem.price.toFixed(2)} €</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => updateQuantity(item.menuItem.id, -1)}
                              className="text-gray-500 hover:text-red-600"
                            >
                              <LucideMinus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.menuItem.id, 1)}
                              className="text-gray-500 hover:text-green-600"
                              disabled={item.menuItem.stock <= 0}
                            >
                              <LucidePlus className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => removeFromCart(item.menuItem.id)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              <LucideTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">Sous-total</span>
                          <span className="font-medium">{(item.menuItem.price * item.quantity).toFixed(2)} €</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="flex justify-between py-2">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-lg">{total.toFixed(2)} €</span>
                    </div>
                    
                    <button
                      onClick={submitOrder}
                      disabled={cart.length === 0}
                      className={`w-full mt-4 py-2 px-4 rounded-md flex items-center justify-center ${
                        cart.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      <LucideCheck className="w-5 h-5 mr-2" />
                      Valider la commande
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NouvelleCommande;