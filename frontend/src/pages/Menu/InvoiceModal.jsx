import React, { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import PropTypes from 'prop-types';
import FocusTrap from 'focus-trap-react';
import { useStateContext } from '../../context/ContextProvider';
import axiosClient from '../../api/axios-client';

const InvoiceModal = ({
  isOpen,
  onClose,
  cart,
  totalPrice,
  formatPrice,
  selectedEvent,
  selectedTable,
  currentSlug,
  onValidateSuccess,
}) => {
  const { isAuthenticated } = useStateContext();
  const [email, setEmail] = useState('');
  const [inviteExists, setInviteExists] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const eventId = selectedEvent || 33;
  const tableId = selectedTable || 57;

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setInviteExists(null);
      setIsEmailChecked(false);
      setError(null);
      setSuccess(null);
      setIsLoading(false); // Assure que isLoading est réinitialisé à false
    }
  }, [isOpen]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailCheck = useCallback(async () => {
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
      const res = await axiosClient.get(
        `/guests/check/${eventId}?email=${encodeURIComponent(email)}`
      );

      if (res.data.exists) {
        setInviteExists(true);
        setSuccess('Invité existant pour cet événement.');
      } else {
        await axiosClient.post(
          `/guests/${eventId}`,
          {
            nom: 'Client invité',
            prenom: 'Automatique',
            email,
            sex: 'M',
          }
        );
        setInviteExists(false);
        setSuccess('Nouvel invité enregistré avec succès.');
      }

      setIsEmailChecked(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la vérification ou création de l\'invité.';
      setError(errorMessage);
      setIsEmailChecked(false);
    } finally {
      setIsLoading(false);
    }
  }, [email, eventId]);

  const handleSubmit = useCallback(async () => {
    if (!eventId || !tableId || !email) {
      setError('Événement, table ou email manquant.');
      return;
    }
    if (!isEmailChecked) {
      setError('Veuillez vérifier l’email avant de valider.');
      return;
    }

    if (!window.confirm('Voulez-vous valider cette commande ?')) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await axiosClient.post(
        `/orders`,
        {
          tableId,
          items: cart.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
          nom: 'Client invité',
          email,
          slug: crypto.randomUUID(),
        }
      );

      setSuccess('Commande validée avec succès !');
      if (onValidateSuccess) onValidateSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la validation de la commande.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [eventId, tableId, email, isEmailChecked, cart, onValidateSuccess, onClose]);

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

    doc.text(`Événement : ${eventId}`, margin, y);
    y += 8;

    doc.text(`Table : ${tableId}`, margin, y);
    y += 8;

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

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <FocusTrap active={isOpen}>
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto relative modal-content">
          <h2 className="text-xl font-semibold mb-4">Facture</h2>

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

          <label className="block mb-1 text-sm font-medium" htmlFor="email-input">
            Votre email :
          </label>
          <div className="flex gap-2 mb-4">
            <input
              id="email-input"
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
              aria-label="Adresse email"
            />
            <button
              onClick={handleEmailCheck}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={!validateEmail(email) || isLoading}
              aria-label={isLoading ? 'Vérification en cours' : 'Vérifier l’email'}
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
              aria-label={isSubmitting ? 'Validation en cours' : 'Valider la commande'}
            >
              {isSubmitting ? 'Validation...' : 'Valider'}
            </button>
            <button
              className="flex-1 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={generatePDF}
              disabled={!cart.length}
              aria-label="Télécharger la facture en PDF"
            >
              Télécharger PDF
            </button>
            <button
              className="flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Fermer la fenêtre"
            >
              Fermer
            </button>
          </div>

          {isSubmitting && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>
    </FocusTrap>
  );
};

InvoiceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cart: PropTypes.array.isRequired,
  totalPrice: PropTypes.number.isRequired,
  formatPrice: PropTypes.func.isRequired,
  selectedEvent: PropTypes.number,
  selectedTable: PropTypes.number,
  currentSlug: PropTypes.string,
  onValidateSuccess: PropTypes.func,
};

export default InvoiceModal;