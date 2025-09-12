import { useState } from "react";
import toast from "react-hot-toast";

// Modal pour définir une taille de canvas personnalisée
function CanvasSizeModal({ isOpen, onClose, onApplySize }) {
  const [customSize, setCustomSize] = useState({ width: 900, height: 650 });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericValue = Number(value);
    if (numericValue < 400) {
      setError("La largeur et la hauteur doivent être d'au moins 400px.");
      return;
    }
    setError(null);
    setCustomSize((prev) => ({ ...prev, [name]: numericValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (customSize.width < 400 || customSize.height < 400) {
      setError("La largeur et la hauteur doivent être d'au moins 400px.");
      return;
    }
    onApplySize({ label: "Personnalisé", width: customSize.width, height: customSize.height });
    onClose();
    toast.success(`Taille personnalisée appliquée : ${customSize.width}x${customSize.height}px`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Taille du Canvas</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Largeur (px)</label>
              <input
                name="width"
                type="number"
                value={customSize.width}
                onChange={handleChange}
                placeholder="Ex: 900"
                min="400"
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Hauteur (px)</label>
              <input
                name="height"
                type="number"
                value={customSize.height}
                onChange={handleChange}
                placeholder="Ex: 650"
                min="400"
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>
          </div>

          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Appliquer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CanvasSizeModal