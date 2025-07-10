import React, { useState } from 'react';
import axios from 'axios';
import OrderForm from './commande';

const MenuItemForm = ({ menuId, token }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [photo, setPhoto] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [itemCreated, setItemCreated] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!category.trim()) {
      setMessage('La catégorie est obligatoire.');
      return;
    }
    setLoading(true);
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

      await axios.post(`http://localhost:3000/menus/${menuId}/items`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Item créé avec succès !');
      setItemCreated(true); c
    } catch (error) {
      setMessage('Erreur lors de la création de l’item.');
    } finally {
      setLoading(false);
    }
  };

  if (itemCreated) {
    return <OrderForm />; 
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md" encType="multipart/form-data">
      <h3 className="text-xl font-semibold mb-6 text-center text-green-600">Ajouter un Item au Menu</h3>
      <div className="space-y-4">
        <input
          type="text"
          required
          placeholder="Nom"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <textarea
          required
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-4 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
          rows={3}
        />
        <input
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="Prix"
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          type="text"
          required
          placeholder="Catégorie (ex: main, starter, dessert, drink)"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          type="number"
          min="0"
          required
          placeholder="Stock"
          value={stock}
          onChange={e => setStock(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        {/* Champ upload image */}
        <input
          type="file"
          accept="image/*"
          onChange={e => setPhoto(e.target.files[0])}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-semibold
                     file:bg-green-50 file:text-green-700
                     hover:file:bg-green-100
                     cursor-pointer"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold transition ${
            loading ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'Chargement...' : 'Créer l’item'}
        </button>
        {message && <p className="mt-3 text-center text-sm text-red-600">{message}</p>}
      </div>
    </form>
  );
};

export default MenuItemForm;
