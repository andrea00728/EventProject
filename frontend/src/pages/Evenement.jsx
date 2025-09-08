import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export default function Evenement() {
  // État pour la section "Organiser l'événement"
  const [eventDetails, setEventDetails] = useState({
    nom: "",
    lieu: "",
    type: "",
    theme: "",
    date: "",
    statut: "",
  });

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Liste des espaces disponibles
  const rooms = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // État et fonctions pour la section "Invités"
  const [guests, setGuests] = useState([]);
  const [newGuest, setNewGuest] = useState({
    nom: "",
    prenom: "",
    sex: "Homme",
    email: "",
  });

  const handleGuestChange = (e) => {
    const { name, value } = e.target;
    setNewGuest((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddGuest = () => {
    if (newGuest.nom && newGuest.prenom && newGuest.email) {
      setGuests((prev) => [...prev, newGuest]);
      setNewGuest({ nom: "", prenom: "", sex: "Homme", email: "" });
    } else {
      openModal(
        "Champs requis",
        "Veuillez remplir tous les champs (Nom, Prénom, Email) pour ajouter un invité."
      );
    }
  };

  const handleImportGuests = () => {
    openModal(
      "Importation d'invités",
      "Fonctionnalité d'importation non implémentée dans cet exemple."
    );
  };

  /************** Gestion du Modal ****************/
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const openModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  return (
    <div className="min-h-screen pb-8">
      <main className="container mx-auto px-4">
        {/********************* Section: Organise l'événement ******************************/}
        <section className="bg-white pb-6 mt-4 mx-auto max-w-5xl rounded-lg">
          <div className="flex justify-between items-center mb-6 bg-gray-100 p-6 rounded-t-xl">
            <span></span>
            <h2 className="text-2xl font-normal text-center text-gray-800">
              ORGANISE L'EVENEMENT
            </h2>
            <button className="bg-[#333446] text-white px-6 py-2 rounded-xl hover:bg-gray-700">
              liste
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                nom
              </label>
              <input
                type="text"
                name="nom"
                value={eventDetails.nom}
                onChange={handleEventChange}
                className="w-full p-2 border bg-[#D9D9D9] rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                lieu
              </label>
              <input
                type="text"
                name="lieu"
                value={eventDetails.lieu}
                onChange={handleEventChange}
                className="w-full p-2 border bg-[#D9D9D9] rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                type
              </label>
              <input
                type="text"
                name="type"
                value={eventDetails.type}
                onChange={handleEventChange}
                className="w-full p-2 border bg-[#D9D9D9] rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theme
              </label>
              <input
                type="text"
                name="theme"
                value={eventDetails.theme}
                onChange={handleEventChange}
                className="w-full p-2 border bg-[#D9D9D9] rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                date
              </label>
              <input
                type="date"
                name="date"
                value={eventDetails.date}
                onChange={handleEventChange}
                className="w-full p-2 border bg-[#D9D9D9] rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                statut
              </label>
              <input
                type="text"
                name="statut"
                value={eventDetails.statut}
                onChange={handleEventChange}
                className="w-full p-2 border bg-[#D9D9D9] rounded-md"
              />
            </div>
          </div>
        </section>

        {/********************* Section: Salle Disponible *********************************/}
        <section className="bg-white pb-6 mt-4 mx-auto max-w-5xl rounded-lg ">
          <h2 className="text-2xl font-normal p-6 text-gray-800 mb-6 text-center bg-gray-100">
            SALLE DISPONIBLE
          </h2>
          <div className="grid grid-cols-3 gap-4 p-6">
            {rooms.map((room) => (
              <button
                key={room}
                className="bg-[#D9D9D9] text-gray-700 px-4 py-3 rounded-md hover:bg-gray-300 text-lg font-medium"
              >
                espace {room}
              </button>
            ))}
          </div>
        </section>

        {/*********************** Section: Invités *****************************/}
        <section className="bg-white pb-6 mt-4 mx-auto max-w-5xl rounded-lg">
          <h2 className="text-2xl font-normal p-6 text-gray-800 mb-6 text-center bg-gray-100">
            INVITE
          </h2>
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 pr-0 md:pr-6 mb-6 md:mb-0">
              <div className="flex space-x-2 my-4">
                <button
                  onClick={handleAddGuest}
                  className="bg-[#333445] text-white px-4 py-2 rounded-md hover:bg-gray-600 flex-1 transition"
                >
                  ajouter
                </button>
                <button
                  onClick={handleImportGuests}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 flex-1 transition"
                >
                  importer
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  name="nom"
                  placeholder="nom"
                  value={newGuest.nom}
                  onChange={handleGuestChange}
                  className="w-full p-2 border rounded-md"
                />
                <input
                  type="text"
                  name="prenom"
                  placeholder="prenom"
                  value={newGuest.prenom}
                  onChange={handleGuestChange}
                  className="w-full p-2 border rounded-md"
                />
                <select
                  name="sex"
                  value={newGuest.sex}
                  onChange={handleGuestChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                </select>
                <input
                  type="email"
                  name="email"
                  placeholder="email"
                  value={newGuest.email}
                  onChange={handleGuestChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <button className="w-full bg-[#333445] text-white px-6 py-2 rounded-md hover:bg-gray-600 mt-4 transition">
                enregistrer
              </button>
            </div>

            <div className="w-full md:w-5/6 md:pl-6">
              <div className="p-4 rounded-md h-96 overflow-auto">
                {guests.length === 0 ? (
                  <p className="text-gray-500 text-center mt-10">
                    Aucun invité ajouté pour le moment.
                  </p>
                ) : (
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-center font-normal text-gray-500">
                          nom
                        </th>
                        <th className="px-6 py-3 text-center font-normal text-gray-500">
                          prénom
                        </th>
                        <th className="px-6 py-3 text-center font-normal text-gray-500">
                          sexe
                        </th>
                        <th className="px-6 py-3 text-center font-normal text-gray-500">
                          email
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-100 divide-y divide-gray-200 text-center mt-6">
                      {guests.map((guest, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {guest.nom}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {guest.prenom}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {guest.sex}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {guest.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/*********************** Modal de notification **********************/}
      <Dialog open={modalOpen} onClose={closeModal}>
        <DialogTitle>{modalTitle}</DialogTitle>
        <DialogContent>
          <Typography>{modalMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
