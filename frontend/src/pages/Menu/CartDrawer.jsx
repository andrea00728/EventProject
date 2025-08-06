import React from 'react';

const CartDrawer = ({
  isOpen,
  cart,
  onClose,
  updateQuantity,
  removeFromCart,
  formatPrice,
  totalPrice,
  onValidateOrder
}) => {
  return (
    <>
      {/* Drawer Panier */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Panier"
        aria-modal={isOpen ? 'true' : 'false'}
        tabIndex={isOpen ? 0 : -1}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-purple-600" aria-hidden="true">🛒</span> Votre Panier
              {cart.length > 0 && (
                <span
                  className="ml-2 bg-purple-100 text-purple-600 text-sm px-2 py-1 rounded-full"
                  aria-live="polite"
                >
                  {cart.length}
                </span>
              )}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 text-2xl transition-colors duration-200"
              aria-label="Fermer le panier"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50" tabIndex={0}>
            {cart.length === 0 ? (
              <p className="text-gray-500 italic text-center py-6 text-lg" role="alert">
                Votre panier est vide. Ajoutez des plats pour commencer !
              </p>
            ) : (
              <div className="space-y-6">
                {cart.map((ci) => (
                  <div
                    key={ci.id}
                    className="flex justify-between items-center border-b border-gray-200 pb-4"
                  >
                    <div className="flex-1 flex gap-4 items-center">
                      {ci.photo ? (
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}${ci.photo}`}
                          alt={ci.name}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs" aria-label="Pas d'image disponible">
                          Pas d'image
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-800">{ci.name}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(ci.id, -1)}
                              className="text-gray-500 hover:text-gray-700 w-5 h-5 flex items-center justify-center bg-gray-200 rounded-full"
                              aria-label={`Réduire la quantité de ${ci.name}`}
                              disabled={ci.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="text-gray-600 font-medium" aria-live="polite">{ci.quantity}</span>
                            <button
                              onClick={() => updateQuantity(ci.id, 1)}
                              className="text-gray-500 hover:text-gray-700 w-5 h-5 flex items-center justify-center bg-gray-200 rounded-full"
                              aria-label={`Augmenter la quantité de ${ci.name}`}
                              disabled={ci.stock <= 0}
                            >
                              +
                            </button>
                          </div>
                          <p className="text-green-600 font-semibold" aria-label={`Prix total ${formatPrice(ci.price * ci.quantity)} euros`}>
                            {formatPrice(ci.price * ci.quantity)} €
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(ci.id)}
                      className="text-red-500 hover:text-red-600 font-semibold transition-colors duration-200"
                      aria-label={`Retirer ${ci.name} du panier`}
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-white">
              <div className="flex justify-between items-center text-xl font-semibold text-gray-900 mb-4" aria-live="polite">
                <span>Total :</span>
                <span className="text-green-600" aria-label={`Total du panier ${formatPrice(totalPrice)} euros`}>{formatPrice(totalPrice)} €</span>
              </div>
              <button
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                onClick={onValidateOrder}
                aria-disabled={cart.length === 0}
              >
                Valider la commande
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay foncé quand le panier est ouvert */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
          aria-hidden="true"
          tabIndex={-1}
        ></div>
      )}
    </>
  );
};

export default CartDrawer;
