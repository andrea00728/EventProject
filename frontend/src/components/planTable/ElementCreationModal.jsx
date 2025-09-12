import { useEffect, useState } from "react";
import { createElement } from "../../services/elementService";
import { ELEMENT_TYPES } from "./constant";
import toast from "react-hot-toast";
import { getUserForfait } from "../../services/forfaitService";

function ElementCreationModal({ isOpen, onClose, onAddElements, events, eventId, elements }) {
  const [form, setForm] = useState({
    type: "porte_entree",
    customTypeName: "",
    customWidth: "",
    customHeight: "",
    nombre: 1,
    noms: [],
    eventId: eventId || 0,
    color: "#d1d5db",
    shape: "rectangle",
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nomForfait, setNomForfait] = useState("");
  const [maxElements, setMaxElements] = useState(null);
  const [formError, setFormError] = useState("");

  // Récupération du forfait
  useEffect(() => {
    const fetchForfait = async () => {
      try {
        const userForfait = await getUserForfait();
        const nom = userForfait.forfait?.nom?.toLowerCase() || "";
        setNomForfait(nom);

        switch (nom) {
          case "freemium": setMaxElements(0); break;
          case "starter": setMaxElements(5); break;
          case "pro": setMaxElements(15); break;
          case "premium": setMaxElements(30); break;
          case "gold": setMaxElements(null); break;
          default: setMaxElements(1000);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du forfait :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchForfait();
  }, []);

  // Initialiser l'événement sélectionné si eventId est fourni
  useEffect(() => {
    if (eventId && events.length > 0 && !selectedEvent) {
      const event = events.find(e => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
        setForm(prev => ({ ...prev, eventId: event.id }));
      }
    }
  }, [eventId, events, selectedEvent]);

  // Compteur dynamique basé sur l'événement sélectionné ou eventId par défaut
  const getElementsCountForEvent = (targetEventId) => {
    return elements.filter(el => el.eventId === targetEventId).length;
  };

  const currentElementsCount = selectedEvent
    ? getElementsCountForEvent(selectedEvent.id)
    : (eventId ? getElementsCountForEvent(eventId) : 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };

    // Gestion carré/rond
    if (name === "shape" && (value === "carre" || value === "rond")) {
      newForm.customHeight = newForm.customWidth || "100";
    } else if (name === "customWidth" && (form.shape === "carre" || form.shape === "rond")) {
      newForm.customHeight = value;
    }

    setForm(newForm);
    setFormError("");
  };

  const handleNombreChange = (e) => {
    let nb = Number(e.target.value);

    // Limiter le nombre selon le forfait
    if (maxElements !== null) {
      const remaining = maxElements - currentElementsCount;
      if (nb > remaining) {
        nb = remaining;
        toast.error(`Vous ne pouvez créer que ${remaining} objets supplémentaires pour cet événement.`);
      }
    }

    setForm(prev => ({ ...prev, nombre: nb, noms: Array(nb).fill("") }));
  };

  const handleNomChange = (index, value) => {
    const updatedNoms = [...form.noms];
    updatedNoms[index] = value;
    setForm(prev => ({ ...prev, noms: updatedNoms }));
  };

  const selectEvent = (event) => {
    setSelectedEvent(event);
    setForm(prev => ({ ...prev, eventId: event.id, nombre: 1, noms: [""] }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const targetEventId = form.eventId || eventId;

    if (!targetEventId) {
      setFormError("Veuillez sélectionner un événement");
      return;
    }

    const targetElementsCount = getElementsCountForEvent(targetEventId);

    if (maxElements !== null && targetElementsCount + Number(form.nombre) > maxElements) {
      setFormError(`Votre forfait ${nomForfait} autorise au maximum ${maxElements} éléments. Vous avez déjà ${targetElementsCount} éléments pour cet événement.`);
      return;
    }

    try {
      const nomsFinal = form.noms.map((nom, index) =>
        nom && nom.trim() !== "" ? nom : `${form.type === "custom" ? form.customTypeName : form.type} ${index + 1}`
      );

      const formDataArray = nomsFinal.map((nom, index) => {
        const isCustom = form.type === "custom";
        const typeInfo = isCustom
          ? { width: Number(form.customWidth), height: Number(form.customHeight) }
          : ELEMENT_TYPES.find(t => t.value === form.type) || ELEMENT_TYPES[0];

        return {
          nom,
          type: isCustom ? form.customTypeName : form.type,
          eventId: Number(targetEventId),
          position: { left: 100 + index * 20, top: 100 + index * 20 },
          width: typeInfo.width,
          height: typeInfo.height,
          rotation: 0,
          color: form.color,
          shape: isCustom ? form.shape : null,
          nombre: 1,
        };
      });

      const response = await Promise.all(formDataArray.map(el => createElement(el)));
      const newElements = response.flat();

      onAddElements(newElements);
      onClose();
      toast.success(`${nomsFinal.length} objets créés avec succès !`);

      // Reset du formulaire
      setForm({
        type: "porte_entree",
        customTypeName: "",
        customWidth: "",
        customHeight: "",
        nombre: 1,
        noms: [],
        eventId: eventId || 0,
        color: "#d1d5db",
        shape: "rectangle",
      });

    } catch (err) {
      console.error("Erreur création objets:", err);
      setFormError(err.response?.data?.message || "Erreur lors de la création des objets");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Créer des objets</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-4 shadow-md">
          {loading ? (
            <p className="text-gray-500 italic">Chargement du forfait…</p>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                Informations sur votre forfait
              </h3>

              <div className="space-y-1">
                <p className="text-gray-800">
                  <span className="font-medium">Forfait&nbsp;:</span>{" "}
                  {nomForfait ? (
                    <span className="capitalize">{nomForfait}</span>
                  ) : (
                    "—"
                  )}
                </p>

                <p className="text-gray-800">
                  <span className="font-medium">Limite&nbsp;:</span>{" "}
                  {maxElements === null ? (
                    <span className="text-green-700 font-semibold">illimité</span>
                  ) : (
                    <span className="text-blue-700 font-semibold">
                      {maxElements} éléments
                    </span>
                  )}
                </p>
              </div>
            </>
          )}
        </div>


        <form onSubmit={onSubmit}>
          {formError && <p className="text-red-600 font-medium mt-2">{formError}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type d'objet */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Type d'objets</label>
              <select name="type" value={form.type} onChange={handleChange} required className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3">
                {[...ELEMENT_TYPES, { value: "custom", label: "Personnalisé" }].map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {form.type === "custom" && (
              <>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">Nom du type personnalisé</label>
                  <input name="customTypeName" type="text" value={form.customTypeName} onChange={handleChange} placeholder="Ex: Mur décoratif" required className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3" />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">Largeur (px)</label>
                  <input name="customWidth" type="number" value={form.customWidth} onChange={handleChange} placeholder="Ex: 100" min="20" required className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3" />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">Hauteur (px)</label>
                  <input name="customHeight" type="number" value={form.customHeight} onChange={handleChange} placeholder="Ex: 100" min="20" required className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3" disabled={form.shape === "carre" || form.shape === "rond"} />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">Forme</label>
                  <select name="shape" value={form.shape} onChange={handleChange} required className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3">
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
              <input name="nombre" type="number" value={form.nombre} onChange={handleNombreChange} placeholder="Ex: 1, 2, 3" required min="1" className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3" />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Événement</label>
              <select
                value={form.eventId}
                onChange={e => {
                  const evt = events.find(ev => ev.id === Number(e.target.value));
                  if (evt) selectEvent(evt);
                }}
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              >
                <option value="">Sélectionner un événement</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.nom} ({new Date(ev.date).toLocaleDateString("fr-FR")})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Couleur</label>
              <input name="color" type="color" value={form.color} onChange={handleChange} className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 h-12" />
            </div>
          </div>

          {form.noms.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Noms des objets</h3>
              {form.noms.map((nom, index) => (
                <div key={index} className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">Nom objet {index + 1}</label>
                  <input value={nom} onChange={e => handleNomChange(index, e.target.value)} placeholder={`${form.type === "custom" ? form.customTypeName : form.type} ${index + 1}`} className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3" />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Annuler</button>
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Créer les objets</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ElementCreationModal;