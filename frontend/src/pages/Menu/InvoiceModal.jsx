<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import axios from 'axios';
=======
import React, { useState } from 'react';
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
import jsPDF from 'jspdf';
import axios from 'axios';

const InvoiceModal = ({
  isOpen,
  onClose,
  cart,
  totalPrice,
  formatPrice,
  selectedEvent,
  selectedTable,
<<<<<<< HEAD
}) => {
  const token = localStorage.getItem('token');
  const [email, setEmail] = useState('');
  const [inviteExists, setInviteExists] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const eventId =  selectedEvent || 33;
  const tableId = selectedTable || 57 ;

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setInviteExists(null);
      setIsEmailChecked(false);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailCheck = async () => {
    if (!validateEmail(email)) {
      setError('Veuillez saisir un email valide.');
      return;
    }

    if (!eventId) {
      setError('Aucun événement sélectionné.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/guests/check/${eventId}?email=${encodeURIComponent(email)}`,
          // { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.exists) {
        setInviteExists(true);
        setSuccess('Invité existant pour cet événement.');
      } else {
        // Création de l'invité si non trouvé
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/guests/${eventId}`,
          {
            nom: 'Client invité',
            prenom: 'Automatique',
            email,
            sex: 'M',
          },
          // { headers: { Authorization: `Bearer ${token}` } }
        );
        setInviteExists(false);
        setSuccess('Nouvel invité enregistré avec succès.');
      }

      setIsEmailChecked(true);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la vérification ou création de l\'invité.');
      setIsEmailChecked(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    console.log('Email . ',email)
    if (!eventId || !tableId || !email) {
      setError('Événement, table ou email manquant.');
      return;
    }

    if (!isEmailChecked) {
      setError('Veuillez vérifier l’email avant de valider.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/orders`,
        {
          tableId,
          items: cart.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
          nom: 'Client invité',
          email,
          slug: crypto.randomUUID(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Commande validée avec succès !');
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la validation de la commande.');
    } finally {
      setIsSubmitting(false);
    }
  };
=======
  currentSlug,
}) => {
  const [message, setMessage] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Facture', 105, y, { align: 'center' });
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, margin, y);
    y += 8;

<<<<<<< HEAD
    if (selectedEvent?.nom) {
      doc.text(`Événement : ${selectedEvent.nom}`, margin, y);
      y += 8;
=======
    const dateStr = new Date().toLocaleDateString(navigator.language || 'fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Date : ${dateStr}`, margin, y);

    if (selectedEvent) {
      y += 8;
      doc.text(`Événement ID : ${selectedEvent}`, margin, y);
    }
    if (selectedTable) {
      y += 8;
      doc.text(`Table ID : ${selectedTable}`, margin, y);
    }
    if (nom) {
      y += 8;
      doc.text(`Nom : ${nom}`, margin, y);
    }
    if (email) {
      y += 8;
      doc.text(`Email : ${email}`, margin, y);
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
    }

    if (selectedTable?.nom) {
      doc.text(`Table : ${selectedTable.nom}`, margin, y);
      y += 8;
    }

    doc.text(`Client : ${email}`, margin, y);
    y += 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Détails de la commande :', margin, y);
    y += 8;

    doc.setFontSize(11);
    cart.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.name}`, margin, y);
      doc.text(`${item.quantity} x ${formatPrice(item.price)}`, 140, y, { align: 'right' });
      doc.text(`${formatPrice(item.quantity * item.price)}`, 180, y, { align: 'right' });
      y += 8;
    });

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Total :', 140, y, { align: 'right' });
    doc.text(`${formatPrice(totalPrice)}`, 180, y, { align: 'right' });

<<<<<<< HEAD
    doc.save(`facture-${Date.now()}.pdf`);
=======
    doc.save(`facture_table_${selectedTable}.pdf`);
  };

  const submitOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const items = cart.map((item) => ({
        menuItemId: item.id, // Assurez-vous que item.id correspond à menuItemId
        quantity: item.quantity,
      }));

      const response = await axios.post(
        'http://localhost:3000/orders',
        {
          tableId: selectedTable,
          items,
          nom: nom || undefined,
          email: email || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMessage('Commande validée avec succès !');
      setTimeout(() => {
        setMessage('');
        onClose(); // Fermer la modale après succès
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la validation de la commande:', error);
      setMessage(error.response?.data?.message || 'Erreur lors de la validation de la commande.');
      setTimeout(() => setMessage(''), 3000);
    }
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Facture</h2>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

        <label className="block mb-1 text-sm font-medium">Votre email :</label>
        <div className="flex gap-2 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setIsEmailChecked(false);
              setError(null);
              setSuccess(null);
            }}
            placeholder="client@example.com"
            className="w-full px-3 py-2 border rounded-md"
            disabled={isSubmitting}
          />
          <button
            onClick={handleEmailCheck}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={!validateEmail(email) || isLoading}
          >
            {isLoading ? '...' : 'Vérifier'}
          </button>
        </div>

<<<<<<< HEAD
        <div className="space-y-2 mb-4">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.name} x{item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)} €</span>
=======
        {message && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-lg text-center">
            {message}
          </div>
        )}

        {/* Formulaire pour nom et email */}
        <div className="mb-6 space-y-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
              Nom (optionnel)
            </label>
            <input
              id="nom"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email (optionnel)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Votre email"
            />
          </div>
        </div>

        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start border-b border-dashed border-gray-200 pb-3"
            >
              <div>
                <h4 className="font-medium text-gray-800" tabIndex={0}>
                  {item.name}
                </h4>
                <p className="text-sm text-gray-500" tabIndex={0}>
                  {item.quantity} × {formatPrice(item.price)} €
                </p>
              </div>
              <p className="text-right font-semibold text-green-600" tabIndex={0}>
                {formatPrice(item.price * item.quantity)} €
              </p>
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
            </div>
          ))}
        </div>

<<<<<<< HEAD
        <div className="flex justify-between font-bold text-lg border-t pt-4">
          <span>Total</span>
          <span>{formatPrice(totalPrice)} €</span>
=======
        <div
          className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center text-xl font-bold text-gray-800"
          tabIndex={0}
        >
          <span>Total :</span>
          <span className="text-green-600">{formatPrice(totalPrice)} €</span>
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
<<<<<<< HEAD
            className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting || !isEmailChecked}
=======
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-md hover:from-blue-700 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
            onClick={submitOrder}
            aria-label="Valider la commande"
          >
            ✅ Valider la commande
          </button>
          <button
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-md hover:from-blue-700 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
            onClick={generatePDF}
            aria-label="Télécharger la facture en PDF"
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
          >
            {isSubmitting ? 'Validation...' : 'Valider'}
          </button>
          <button
            className="flex-1 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={generatePDF}
            disabled={!cart.length}
          >
            Télécharger PDF
          </button>
          <button
            className="flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            onClick={onClose}
<<<<<<< HEAD
            disabled={isSubmitting}
=======
            aria-label="Fermer la modale"
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;