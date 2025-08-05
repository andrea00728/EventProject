import React, { useEffect, useState, useRef } from "react";
import { createEvent, getLocations, getSallesByLocation } from "../services/evenementServ";
import { textControll } from "../services/controll_champs/controll_champs";

const EVENT_TYPES = [
  { value: "mariage", label: "Mariage", color: "bg-[#6B46C1]/5 text-[#6B46C1]" },
  { value: "reunion", label: "Réunion", color: "bg-indigo-600/5 text-indigo-600" },
  { value: "anniversaire", label: "Anniversaire", color: "bg-[#6B46C1]/5 text-[#6B46C1]" },
  { value: "engagement", label: "Engagement", color: "bg-indigo-600/5 text-indigo-600" },
  { value: "autre", label: "Autre", color: "bg-gray-50 text-gray-600" },
];

function LocationAutocomplete({ locations, form, setForm }) {
  const [inputValue, setInputValue] = useState("");
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const loc = locations.find((l) => l.id === form.locationId);
    setInputValue(loc ? loc.nom : "");
  }, [form.locationId, locations]);

  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredLocations([]);
      return;
    }
    const filtered = locations.filter((loc) =>
      loc.nom.toLowerCase().startsWith(inputValue.toLowerCase())
    );
    setFilteredLocations(filtered);
  }, [inputValue, locations]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (loc) => {
    setInputValue(loc.nom);
    setForm({ ...form, locationId: loc.id, salleId: "" });
    setShowSuggestions(false);
  };

  return (
    <div className="relative flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-sm font-semibold text-gray-800">Lieu</label>
      <input
        type="text"
        className="border border-gray-200 rounded-xl px-4 py-3.5 bg-white focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow focus:shadow-md placeholder:text-gray-400"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowSuggestions(true);
          setForm({ ...form, locationId: "", salleId: "" });
        }}
        onFocus={() => inputValue && setShowSuggestions(true)}
        placeholder="Commencez à taper un lieu..."
        autoComplete="off"
        required
      />
      {showSuggestions && filteredLocations.length > 0 && (
        <ul className="absolute z-30 top-full mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {filteredLocations.map((loc) => (
            <li
              key={loc.id}
              className="px-4 py-3 text-gray-800 hover:bg-[#6B46C1]/5 hover:text-[#6B46C1] cursor-pointer transition-colors duration-150"
              onMouseDown={() => handleSelect(loc)}
            >
              {loc.nom}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Evenementform({ onNext }) {
  const [form, setForm] = useState({
    nom: "",
    type: "",
    theme: "",
    date: "",
    date_fin: "",
    locationId: "",
    salleId: "",
    isPublic: false,
  });

  const [locations, setLocations] = useState([]);
  const [salles, setSalles] = useState([]);
  const [modalSalleOpen, setModalSalleOpen] = useState(false);
  const [modalTypeOpen, setModalTypeOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLocations()
      .then((data) => setLocations(Array.isArray(data) ? data : []))
      .catch(() => setLocations([]));
  }, []);

  useEffect(() => {
    if (form.locationId) {
      getSallesByLocation(form.locationId)
        .then(setSalles)
        .catch(() => setSalles([]));
    } else {
      setSalles([]);
      setForm((prev) => ({ ...prev, salleId: "" }));
    }
  }, [form.locationId]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (new Date(form.date) >= new Date(form.date_fin)) {
      setError("La date de fin doit être après la date de début.");
      return;
    }

    try {
      const event = await createEvent({ ...form, isPublic: form.isPublic });
      onNext && onNext({ eventId: event.id });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Erreur lors de la création de l'événement.";
      setError(errorMessage);
    }
  };

  const selectedSalleName = () => salles.find((s) => s.id === form.salleId)?.nom || "";

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4 sm:px-8">
      <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-100/50">
        <h2 className="text-2xl font-bold text-center mb-3 text-[#6B46C1] tracking-tight">
          Créer un événement
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm font-medium">
          Organisez votre événement en quelques étapes simples.
        </p>

        {error && (
          <p className="text-red-500 text-center mb-6 bg-red-50/50 py-2.5 px-4 rounded-xl text-sm font-medium">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Nom de l'événement</label>
            <input
              name="nom"
              value={form.nom}
              onChange={(e) => {
                setForm({ ...form, nom: textControll(e.target.value) });
              }}
              placeholder="Ex: Mariage de Sarah & Paul"
              required
              className="border border-gray-200 rounded-xl px-4 py-3.5 bg-white focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow focus:shadow-md placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Type d'événement</label>
            <input
              name="type"
              value={EVENT_TYPES.find((t) => t.value === form.type)?.label || "Type d'événement"}
              readOnly
              onClick={() => setModalTypeOpen(true)}
              placeholder="Type d'événement"
              required
              className="border border-gray-200 rounded-xl px-4 py-3.5 bg-white cursor-pointer focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow focus:shadow-md placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Thème</label>
            <input
              name="theme"
              value={form.theme}
              onChange={handleChange}
              placeholder="Ex: Chic, Bohème, Classique..."
              required
              className="border border-gray-200 rounded-xl px-4 py-3.5 bg-white focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow focus:shadow-md placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Date de début</label>
            <input
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="border border-gray-200 rounded-xl px-4 py-3.5 bg-white focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow focus:shadow-md"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Date de fin</label>
            <input
              type="datetime-local"
              name="date_fin"
              value={form.date_fin}
              onChange={handleChange}
              required
              className="border border-gray-200 rounded-xl px-4 py-3.5 bg-white focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow focus:shadow-md"
            />
          </div>

          <LocationAutocomplete locations={locations} form={form} setForm={setForm} />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Salle</label>
            <input
              type="text"
              value={selectedSalleName()}
              readOnly
              disabled={!form.locationId}
              onClick={() => form.locationId && setModalSalleOpen(true)}
              placeholder="Salle"
              className={`border border-gray-200 rounded-xl px-4 py-3.5 ${
                form.locationId ? "cursor-pointer bg-white" : "bg-gray-50"
              } focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow focus:shadow-md placeholder:text-gray-400`}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isPublic"
              checked={form.isPublic}
              onChange={handleChange}
              className="h-5 w-5 text-[#6B46C1] border-gray-200 rounded focus:ring-[#6B46C1] transition-all duration-200"
            />
            <label className="text-sm font-semibold text-gray-800">Événement public</label>
          </div>

          <div className="col-span-1 md:col-span-2 mt-4">
            <button
              type="submit"
              className="w-full bg-[#6B46C1] text-white font-semibold py-3.5 rounded-xl shadow-md hover:bg-[#5a3aa6] focus:ring-2 focus:ring-[#6B46C1]/50 transition-all duration-200"
            >
              Créer l'événement
            </button>
          </div>
        </form>
      </div>

      {modalSalleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white shadow-lg rounded-2xl p-6">
            <button
              className="absolute top-3 right-3 text-xl font-semibold text-gray-500 hover:text-red-500 transition-colors duration-150"
              onClick={() => setModalSalleOpen(false)}
            >
              ×
            </button>
            <h3 className="text-lg font-semibold text-center mb-5 text-[#6B46C1]">Choisissez une salle</h3>
            <div className="grid grid-cols-2 gap-3">
              {salles.map((salle) => (
                <div
                  key={salle.id}
                  onClick={() => {
                    setForm({ ...form, salleId: salle.id });
                    setModalSalleOpen(false);
                  }}
                  className="border border-[#6B46C1]/10 rounded-xl px-3 py-2.5 text-center bg-[#6B46C1]/5 text-[#6B46C1] cursor-pointer hover:bg-[#6B46C1]/10 hover:border-[#6B46C1]/50 font-medium transition-all duration-150"
                >
                  {salle.nom}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {modalTypeOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-center mb-5 text-[#6B46C1]">
              Choisissez le type d'événement
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`flex flex-col items-center justify-center rounded-xl p-4 border border-transparent hover:border-[#6B46C1]/50 transition-all duration-150 ${type.color} shadow-sm hover:shadow-md ${
                    form.type === type.value ? "ring-2 ring-[#6B46C1]/50" : ""
                  }`}
                  onClick={() => {
                    setForm({ ...form, type: type.value });
                    setModalTypeOpen(false);
                  }}
                >
                  <span className="text-sm font-medium mb-1">{type.label}</span>
                  <span className="text-xs uppercase tracking-wide">{type.value}</span>
                </button>
              ))}
            </div>
            <button
              className="mt-5 w-full py-2.5 rounded-xl bg-gray-50 text-gray-600 font-medium hover:bg-gray-100 transition-all duration-150"
              onClick={() => setModalTypeOpen(false)}
              type="button"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}