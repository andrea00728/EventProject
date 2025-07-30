import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

const InvoiceModal = ({
  isOpen,
  onClose,
  cart,
  totalPrice,
  formatPrice,
  selectedEvent,
  selectedTable,
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
        `http://localhost:3000/guests/check/${eventId}?email=${encodeURIComponent(email)}`,
          // { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.exists) {
        setInviteExists(true);
        setSuccess('Invité existant pour cet événement.');
      } else {
        // Création de l'invité si non trouvé
        await axios.post(
          `http://localhost:3000/guests/${eventId}`,
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
        'http://localhost:3000/orders',
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

    if (selectedEvent?.nom) {
      doc.text(`Événement : ${selectedEvent.nom}`, margin, y);
      y += 8;
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

    doc.save(`facture-${Date.now()}.pdf`);
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

        <div className="space-y-2 mb-4">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.name} x{item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)} €</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between font-bold text-lg border-t pt-4">
          <span>Total</span>
          <span>{formatPrice(totalPrice)} €</span>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting || !isEmailChecked}
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
            disabled={isSubmitting}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
