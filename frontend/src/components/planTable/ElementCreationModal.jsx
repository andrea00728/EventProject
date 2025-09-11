import { useState } from "react";
import { createElement } from "../../services/elementService";
import { ELEMENT_TYPES } from "./constant";
import toast from "react-hot-toast";



// Modal pour créer des objets
function ElementCreationModal({ isOpen, onClose, onAddElements, events, eventId }) {
  const [form, setForm] = useState({
    type: "porte_entree",
    customTypeName: "",
    customWidth: "",
    customHeight: "",
    nombre: "",
    noms: [],
    eventId: eventId || 0,
    color: "#d1d5db",
    shape: "rectangle", // Nouvelle propriété pour la forme (défaut: rectangle)
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState(null);

  const handleNombreChange = (e) => {
    const nb = Number(e.target.value);
    setForm((prev) => ({
      ...prev,
      nombre: nb,
      noms: Array(nb).fill(""),
    }));
  };

  const handleNomChange = (index, value) => {
    const updatedNoms = [...form.noms];
    updatedNoms[index] = value;
    setForm((prev) => ({ ...prev, noms: updatedNoms }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newForm = { ...form, [name]: value };
    setError(null);

    // Logique pour "carre" et "rond" : forcer height = width
    if (name === "shape" && (value === "carre" || value === "rond")) {
      newForm.customHeight = newForm.customWidth || "100"; // Si width vide, default à 100
    } else if (name === "customWidth" && (form.shape === "carre" || form.shape === "rond")) {
      newForm.customHeight = value; // Synchroniser height avec width
    }

    setForm(newForm);
  };

  const selectEvent = (event) => {
    setSelectedEvent(event);
    setForm((prev) => ({ ...prev, eventId: event.id }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.eventId) {
      setError("Veuillez sélectionner un événement");
      toast.error("Veuillez sélectionner un événement");
      return;
    }

    if (form.type === "custom") {
      if (!form.customTypeName || form.customTypeName.trim() === "") {
        setError("Veuillez entrer un nom pour le type personnalisé");
        toast.error("Veuillez entrer un nom pour le type personnalisé");
        return;
      }
      const width = Number(form.customWidth);
      if (form.customWidth === "" || isNaN(width) || width < 20) {
        setError("La largeur doit être un nombre d'au moins 20px.");
        toast.error("La largeur doit être un nombre d'au moins 20px.");
        return;
      }
      const height = Number(form.customHeight);
      if (form.customHeight === "" || isNaN(height) || height < 20) {
        setError("La hauteur doit être un nombre d'au moins 20px.");
        toast.error("La hauteur doit être un nombre d'au moins 20px.");
        return;
      }
      if (!form.shape) {
        setError("Veuillez sélectionner une forme pour l'objets personnalisé.");
        toast.error("Veuillez sélectionner une forme pour l'objets personnalisé.");
        return;
      }
      // Forcer height = width pour "rond" si pas déjà fait
      if (form.shape === "rond" && form.customWidth !== form.customHeight) {
        setError("Pour un objets rond, la largeur et la hauteur doivent être égales.");
        toast.error("Pour un objets rond, la largeur et la hauteur doivent être égales.");
        return;
      }
    }

    try {
      const nomsFinal = form.noms.map((nom, index) =>
        nom && nom.trim() !== "" ? nom : `${form.type === "custom" ? form.customTypeName : form.type} ${index + 1}`
      );

      const formDataArray = nomsFinal.map((nom, index) => {
        const isCustom = form.type === "custom";
        const typeInfo = isCustom
          ? { width: Number(form.customWidth), height: Number(form.customHeight) }
          : ELEMENT_TYPES.find((t) => t.value === form.type) || ELEMENT_TYPES[0];

        return {
          nom,
          type: isCustom ? form.customTypeName : form.type,
          eventId: Number(form.eventId),
          position: {
            left: 100 + index * 20,
            top: 100 + index * 20,
          },
          width: typeInfo.width,
          height: typeInfo.height,
          rotation: 0,
          color: form.color,
          shape: isCustom ? form.shape : null, // Ajout de shape seulement pour custom
        };
      });

      const response = await Promise.all(formDataArray.map((el) => createElement(el)));
      console.log("Réponse de createElement:", response);
      const newElements = response.flat();

      const formattedElements = newElements.map((element) => ({
        id: element.id || element.elementId,
        nom: element.nom || element.name,
        type: element.type,
        eventId: Number(element.eventId),
        position: element.position || { left: 100, top: 100 },
        width: element.width || (form.type === "custom" ? Number(form.customWidth) : ELEMENT_TYPES.find((t) => t.value === element.type)?.width || 100),
        height: element.height || (form.type === "custom" ? Number(form.customHeight) : ELEMENT_TYPES.find((t) => t.value === element.type)?.height || 100),
        rotation: element.rotation || 0,
        color: element.color || "#d1d5db",
        shape: element.shape || (form.type === "custom" ? form.shape : null), // Propagation de shape
      }));

      setForm({
        type: "porte_entree",
        customTypeName: "",
        customWidth: "",
        customHeight: "",
        nombre: "",
        noms: [],
        eventId: eventId || 0,
        color: "#d1d5db",
        shape: "rectangle", // Réinitialisation
      });
      setSelectedEvent(null);

      onAddElements(formattedElements);
      onClose();

      toast.success(
        `${nomsFinal.length} objets${nomsFinal.length > 1 ? "s" : ""} créé${nomsFinal.length > 1 ? "s" : ""} avec succès !`
      );
    } catch (err) {
      console.error("Erreur création objets:", err);
      setError(err.response?.data?.message || "Erreur lors de la création des objets");
      toast.error(err.response?.data?.message || "Erreur lors de la création des objets");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Créer des objets</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Type d'objets</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              >
                {[...ELEMENT_TYPES, { value: "custom", label: "Personnalisé" }].map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {form.type === "custom" && (
              <>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">Nom du type personnalisé</label>
                  <input
                    name="customTypeName"
                    type="text"
                    value={form.customTypeName}
                    onChange={handleChange}
                    placeholder="Ex: Mur décoratif"
                    required
                    className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">Largeur (px)</label>
                  <input
                    name="customWidth"
                    type="number"
                    value={form.customWidth}
                    onChange={handleChange}
                    placeholder="Ex: 100"
                    min="20"
                    required
                    className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">Hauteur (px)</label>
                  <input
                    name="customHeight"
                    type="number"
                    value={form.customHeight}
                    onChange={handleChange}
                    placeholder="Ex: 100"
                    min="20"
                    required
                    className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
                    disabled={form.shape === "carre" || form.shape === "rond"} // Désactivé pour carré et rond
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">Forme</label>
                  <select
                    name="shape"
                    value={form.shape}
                    onChange={handleChange}
                    required
                    className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
                  >
                    <option value="rond">Rond</option>
                    <option value="carre">Carré</option>
                    <option value="rectangle">Rectangle</option>
                    <option value="triangle">Triangle</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Nombre d'objet</label>
              <input
                name="nombre"
                type="number"
                value={form.nombre}
                onChange={handleNombreChange}
                placeholder="Ex: 1, 2, 3"
                required
                min="1"
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Événement</label>
              <select
                value={form.eventId}
                onChange={(e) => {
                  const eventId = Number(e.target.value);
                  const event = events.find((ev) => ev.id === eventId);
                  if (event) selectEvent(event);
                }}
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              >
                <option value="">Sélectionner un événement</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.nom} ({new Date(event.date).toLocaleDateString("fr-FR")})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Couleur</label>
              <input
                name="color"
                type="color"
                value={form.color}
                onChange={handleChange}
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 h-12"
              />
            </div>
          </div>

          {form.noms.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Noms des objets</h3>
              {form.noms.map((nom, index) => (
                <div key={index} className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">
                    Nom objets {index + 1}
                  </label>
                  <input
                    value={nom}
                    onChange={(e) => handleNomChange(index, e.target.value)}
                    placeholder={`${form.type === "custom" ? form.customTypeName : form.type} ${index + 1}`}
                    className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
                  />
                </div>
              ))}
            </div>
          )}

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
              Créer les objets
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ElementCreationModal