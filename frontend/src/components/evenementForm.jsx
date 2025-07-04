import React, { useEffect, useState } from "react";
import { createEvent, getLocations, getSallesByLocation } from "../services/evenementServ";

export default function Evenementform({ onNext }) {
  const [form, setForm] = useState({
    nom: "",
    type: "",
    theme: "",
    date: "",
    date_fin: "", // <-- Ajouté
    locationId: "",
    salleId: "",
  });

  const [locations, setLocations] = useState([]);
  const [salles, setSalles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSalleOpen, setModalSalleOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLocations()
      .then(data => setLocations(Array.isArray(data) ? data : []))
      .catch(() => setLocations([]));
  }, []);

  useEffect(() => {
    if (form.locationId) {
      getSallesByLocation(form.locationId)
        .then(setSalles)
        .catch(() => setSalles([]));
    }
  }, [form.locationId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (new Date(form.date) >= new Date(form.date_fin)) {
      setError("La date de fin doit être après la date de début.");
      return;
    }

    try {
      const event = await createEvent(form);
      onNext && onNext({ eventId: event.id });
    } catch {
      setError("Erreur lors de la création de l'événement.");
    }
  };

  const selectedLocationName = () => locations.find(l => l.id === form.locationId)?.nom || "";
  const selectedSalleName = () => salles.find(s => s.id === form.salleId)?.nom || "";

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 px-6">
      <h2 className="text-3xl font-bold text-center mb-2">Quel est votre événement ?</h2>
      <p className="text-center text-gray-500 mb-4">Prêt à le créer maintenant ?</p><br />

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 py-4">
        <input name="nom" value={form.nom} onChange={handleChange} placeholder="Événement" required
          className="border border-gray-300  rounded-[15px] px-5 py-3 bg-[#f5f5f5] w-[8cm]" />
        <input name="type" value={form.type} onChange={handleChange} placeholder="Type" required
          className="border border-gray-300 rounded-[15px] px-5 py-3 bg-[#f5f5f5] w-[8cm]" />
        <input name="theme" value={form.theme} onChange={handleChange} placeholder="Thème" required
          className="border border-gray-300 rounded-[15px] px-5 py-3 bg-[#f5f5f5] w-[8cm]" />
        
        {/* Date de début */}
        <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required
          className="border border-gray-300 rounded-[15px] px-5 py-3 bg-[#f5f5f5] w-[8cm]" />

        {/* Date de fin */}
        <input type="datetime-local" name="date_fin" value={form.date_fin} onChange={handleChange} required
          className="border border-gray-300 rounded-[15px] px-5 py-3 bg-[#f5f5f5] w-[8cm]" />

        <input type="text" value={selectedLocationName()} readOnly onClick={() => setModalOpen(true)}
          placeholder="Où se déroulera l’événement ?" className="border border-gray-300 rounded-[15px] px-5 py-3 bg-[#f5f5f5] w-[8cm] cursor-pointer" />
        <input type="text" value={selectedSalleName()} readOnly disabled={!form.locationId}
          onClick={() => form.locationId && setModalSalleOpen(true)} placeholder="Salle"
          className={`border border-gray-300 rounded-[15px] px-5 py-3 ${form.locationId ? "cursor-pointer bg-[#f5f5f5]" : "bg-gray-200"} w-[8cm]`} />

        <div className="col-span-1 md:col-span-2 mt-4">
          <button type="submit" className="w-full bg-[#1C1B2E] text-white font-semibold cursor-pointer py-3 rounded-[15px] hover:bg-[#2e2d44] ">
            LOCALISATION
          </button>
        </div>
      </form>

      {/* Modal lieux */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#ffffff] opacity-90 flex items-center justify-center z-50">
          <div className="relative w-[50%] h-[400px] bg-[#333446] shadow-lg rounded-lg p-6 overflow-y-auto">
            <button className="absolute top-2 right-4 text-2xl font-bold text-[#ffffff] hover:text-red-600"
              onClick={() => setModalOpen(false)}>×</button>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {locations.map(loc => (
                <div key={loc.id} onClick={() => {
                  setForm({ ...form, locationId: loc.id, salleId: "" });
                  setModalOpen(false);
                }}
                  className="border rounded-xl px-4 py-3 text-center bg-[#333446] text-[#ffffff]  cursor-pointer transition">
                  {loc.nom}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal salles */}
      {modalSalleOpen && (
        <div className="fixed inset-0 bg-[#ffffff] opacity-90 flex items-center justify-center z-50">
          <div className="relative w-[50%] h-[400px] bg-[#333446] shadow-lg rounded-lg p-6 overflow-y-auto">
            <button className="absolute top-2 right-4 text-2xl font-bold text-[#ffffff] hover:text-red-600"
              onClick={() => setModalSalleOpen(false)}>×</button>
            <div className="grid grid-cols-2 md:grid-cols-3 text-[#ffffff] gap-4 mt-6">
              {salles.map(salle => (
                <div key={salle.id} onClick={() => {
                  setForm({ ...form, salleId: salle.id });
                  setModalSalleOpen(false);
                }}
                  className="border rounded-xl px-4 py-3 text-center bg-[#333446]  cursor-pointer transition">
                  {salle.nom}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
