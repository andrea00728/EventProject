import { useState } from "react";
import { textControll } from "../../services/controll_champs/controll_champs";
import { createInviteForSpecificEvent } from "../../services/inviteService";

// Modal pour ajouter un invité
function GuestCreationModal({ isOpen, onClose, onAddGuest, tables, events }) {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    sex: "",
    eventId: null,
    tableId: null,
    place: null
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "nom" || name === "prenom") {
      setForm({ ...form, [name]: textControll(value) });
    } else if (name === "tableId") {
      setForm({ ...form, [name]: value ? Number(value) : null, place: null });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const selectedTable = tables.find(t => t.id === form.tableId);
  const occupiedPlaces = selectedTable?.guests?.map(g => g.place) || [];
  const availablePlaces = selectedTable ?
    Array.from({ length: selectedTable.capacite }, (_, i) => i + 1)
      .filter(place => !occupiedPlaces.includes(place)) : [];

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!form.eventId) {
      setError("Veuillez sélectionner un événement");
      toast.error("Veuillez sélectionner un événement");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await createInviteForSpecificEvent(form);
      const newGuest = {
        id: response.id || response.guestId,
        nom: `${form.nom} ${form.prenom}`,
        prenom: form.prenom,
        email: form.email,
        sex: form.sex,
        eventId: Number(form.eventId),
        tableId: form.tableId ? Number(form.tableId) : null,
        place: form.place ? Number(form.place) : null
      };

      setForm({ nom: "", prenom: "", email: "", sex: "", eventId: null, tableId: null, place: null });

      onAddGuest(newGuest);
      onClose();

      toast.success(`Invité ${form.nom} ${form.prenom} ajouté avec succès !`);
    } catch (err) {
      console.error("Erreur création invité:", err);
      setError(err.response?.data?.message || "Erreur lors de la création de l'invité");
      toast.error(err.response?.data?.message || "Erreur lors de la création de l'invité");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Ajouter un Invité</h2>
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
              <label className="text-gray-700 font-medium mb-2 text-sm">Nom</label>
              <input
                name="nom"
                type="text"
                value={form.nom}
                onChange={handleChange}
                placeholder="Nom de l'invité"
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Prénom</label>
              <input
                name="prenom"
                type="text"
                value={form.prenom}
                onChange={handleChange}
                placeholder="Prénom de l'invité"
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email de l'invité"
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Sexe</label>
              <select
                name="sex"
                value={form.sex}
                onChange={handleChange}
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              >
                <option value="">-- Sélectionnez --</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Événement</label>
              <select
                name="eventId"
                value={form.eventId || ""}
                onChange={handleChange}
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
              <label className="text-gray-700 font-medium mb-2 text-sm">Table (Optionnel)</label>
              <select
                name="tableId"
                value={form.tableId || ""}
                onChange={handleChange}
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              >
                <option value="">Assigner plus tard</option>
                {tables
                  .filter(table => {
                    const occupiedSeats = table.guests?.length || 0;
                    return occupiedSeats < table.capacite;
                  })
                  .map((table) => {
                    const occupiedSeats = table.guests?.length || 0;
                    const freeSeats = table.capacite - occupiedSeats;
                    return (
                      <option key={table.id} value={table.id}>
                        {table.nom} ({freeSeats} place{freeSeats !== 1 ? 's' : ''} libre{freeSeats !== 1 ? 's' : ''})
                      </option>
                    );
                  })
                }
              </select>
            </div>

            {form.tableId && availablePlaces.length > 0 && (
              <div className="flex flex-col md:col-span-2">
                <label className="text-gray-700 font-medium mb-2 text-sm">Place (Optionnel)</label>
                <select
                  name="place"
                  value={form.place || ""}
                  onChange={handleChange}
                  className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
                >
                  <option value="">Attribution automatique</option>
                  {availablePlaces.map((place) => (
                    <option key={place} value={place}>
                      Place {place}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              disabled={isSubmitting}
              className={`px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isSubmitting ? 'Création...' : 'Ajouter l\'Invité'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GuestCreationModal