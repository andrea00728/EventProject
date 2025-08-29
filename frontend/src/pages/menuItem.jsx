import React, { useState } from 'react';
import axios from 'axios';
import OrderForm from './commande';

const MenuItemForm = ({ menuId,  }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [itemCreated, setItemCreated] = useState(false); 

  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    if (!name.trim() || !description.trim() || !price || !category.trim() || !stock) {
      setMessage('Veuillez remplir tous les champs obligatoires.');
      setIsLoading(false);
      return;
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      setMessage('Le prix doit être un nombre valide supérieur ou égal à 0.');
      setIsLoading(false);
      return;
    }

    if (isNaN(parseInt(stock, 10)) || parseInt(stock, 10) < 0) {
      setMessage('Le stock doit être un nombre entier valide supérieur ou égal à 0.');
      setIsLoading(false);
      return;
    }

    if (photo && !['image/jpeg', 'image/png'].includes(photo.type)) {
      setMessage('Seuls les fichiers JPEG et PNG sont autorisés.');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', parseFloat(price));
      formData.append('category', category.trim());
      formData.append('stock', parseInt(stock, 10));
      if (photo) {
        formData.append('photo', photo);
      }

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/menus/${menuId}/items`, formData);

      setMessage('Item créé avec succès !');
      setItemCreated(true);
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setStock('');
      setPhoto(null);
    } catch (error) {
      if (error.response?.status === 403) {
        setMessage('Accès refusé : vous devez être organisateur.');
      } else if (error.response?.status === 400) {
        setMessage('Erreur dans les données fournies.');
      } else {
        setMessage('Erreur lors de la création de l\'item.');
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-900 rounded-md shadow-md mt-10">
      {itemCreated ? (
        <div className="text-center">
          <p className="text-green-600 mb-4">{message}</p>
          <button
            onClick={() => setItemCreated(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ajouter un autre item
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-600 dark:text-blue-400">
            Ajouter un Item au Menu
          </h2>
          {message && (
            <p className={`text-center mb-4 ${message.includes('Erreur') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Nom de l'item
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Entrez le nom de l'item"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Entrez une description"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Prix (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Entrez le prix"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Catégorie
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Entrez la catégorie (ex: Entrées, Plats)"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Stock
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Entrez le stock disponible"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Photo (optionnel)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-md text-white font-semibold transition ${
                isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Ajout en cours...' : 'Ajouter l\'Item'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default MenuItemForm;
