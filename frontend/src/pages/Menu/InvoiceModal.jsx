import React from 'react';
import jsPDF from 'jspdf';

const InvoiceModal = ({
  isOpen,
  onClose,
  cart,
  totalPrice,
  formatPrice,
  selectedEvent,
  selectedTable
}) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Facture', 105, y, { align: 'center' });

    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);

    
    const dateStr = new Date().toLocaleDateString(navigator.language || 'fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Date : ${dateStr}`, margin, y);

    if (selectedEvent) {
      y += 8;
      doc.text(`Événement : ${selectedEvent.nom}`, margin, y);
    }
    if (selectedTable) {
      y += 8;
      doc.text(`Table : ${selectedTable.nom || selectedTable}`, margin, y);
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

    doc.save('facture.pdf');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-title"
      tabIndex={-1}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-fade-in" role="document">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h3
            id="invoice-title"
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"
            tabIndex={0}
          >
            🧾 Facture
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
            aria-label="Fermer la facture"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start border-b border-dashed border-gray-200 pb-3"
            >
              <div>
                <h4 className="font-medium text-gray-800" tabIndex={0}>{item.name}</h4>
                <p className="text-sm text-gray-500" tabIndex={0}>
                  {item.quantity} × {formatPrice(item.price)} €
                </p>
              </div>
              <p className="text-right font-semibold text-green-600" tabIndex={0}>
                {formatPrice(item.price * item.quantity)} €
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center text-xl font-bold text-gray-800" tabIndex={0}>
          <span>Total :</span>
          <span className="text-green-600">{formatPrice(totalPrice)} €</span>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-md hover:from-blue-700 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
            onClick={generatePDF}
            aria-label="Télécharger la facture en PDF"
          >
            📄 Télécharger PDF
          </button>
          <button
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
