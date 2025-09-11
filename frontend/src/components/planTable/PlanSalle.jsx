import React, { useState, useRef, useEffect } from "react";
import { Plus, RefreshCcw, User, Box, AlertTriangle, CheckCircle } from "lucide-react";
import { useStateContext } from "../../context/ContextProvider";
import {
  updateTablePosition,
  updateRotation,
  deleteTable,
  reassignGuestToTable,
  updateTable,
} from "../../services/tableService";
import { getMyEvents } from "../../services/evenementServ";
import {
  getElementsByEventId,
  updateElementPosition,
  updateElementRotation,
  updateElement,
  deleteElement,
} from "../../services/elementService";
import toast, { Toaster } from "react-hot-toast";
import ElementCreationModal from "./ElementCreationModal";
import TableCreationModal from "./TableCreationModal";
import GuestCreationModal from "./GuestCreationModal";
import { CANVAS_SIZES, ELEMENT_TYPES, TABLE_TYPES } from "./constant";
import TableManipule from "./TableManipule";
import { Element } from "./Element";
import CanvasSizeModal from "./CanvaSizeModal";

// Nouveau composant : Modal de confirmation professionnel
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = "delete" }) => {
  if (!isOpen) return null;

  const icon = type === "delete" ? AlertTriangle : CheckCircle;
  const bgColor = type === "delete" ? "from-red-50 to-rose-50" : "from-emerald-50 to-green-50";
  const textColor = type === "delete" ? "text-red-800" : "text-emerald-800";
  const borderColor = type === "delete" ? "border-red-200" : "border-emerald-200";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border ${borderColor}`}>
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className={`p-3 rounded-full bg-gradient-to-br ${bgColor} border`}>
              <icon className={`w-6 h-6 ${textColor}`} />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center mb-2">{title}</h2>
          <p className="text-gray-600 text-center mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-xl"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-xl transition-all hover:scale-105 shadow-md bg-gradient-to-r ${type === "delete" ? "from-red-500 to-red-600" : "from-emerald-500 to-emerald-600"}`}
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal : PlanSalle
export default function PlanSalle({ event, tables, setTables, onAddTable, onAddGuest }) {
  const { isAuthenticated } = useStateContext();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [editingElement, setEditingElement] = useState(null);
  const [movingGuest, setMovingGuest] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showElementModal, setShowElementModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showCanvasSizeModal, setShowCanvasSizeModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({ title: "", message: "", onConfirm: null, type: "delete" });
  const [events, setEvents] = useState([]);
  const [elements, setElements] = useState([]);
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZES[0]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && event?.id) {
      getMyEvents()
        .then((response) => {
          console.log("Événements chargés:", response);
          setEvents(response);
        })
        .catch((err) => {
          console.error("Erreur chargement événements:", err);
          toast.error("Erreur lors du chargement des événements");
        });

      getElementsByEventId(event.id)
        .then((response) => {
          console.log("Objets chargés:", response);
          setElements(response);
        })
        .catch((err) => {
          console.error("Erreur chargement objets:", err);
          toast.error("Erreur lors du chargement des objets");
        });
    }
  }, [isAuthenticated, event?.id]);

  useEffect(() => {
    console.log("État tables mis à jour:", tables);
  }, [tables]);

  const showConfirmation = (title, message, onConfirm, type = "delete") => {
    setConfirmationConfig({ title, message, onConfirm, type });
    setShowConfirmationModal(true);
  };

  const handleZoom = (direction) => {
    setZoomLevel((prev) => {
      const newZoom = direction === "in" ? prev + 0.05 : prev - 0.05;
      const boundedZoom = Math.max(0.5, Math.min(newZoom, 2));
      toast.success(`Zoom : ${(boundedZoom * 100).toFixed(0)}%`);
      return boundedZoom;
    });
  };

  const handleApplyCanvasSize = (newSize) => {
    setCanvasSize(newSize);
  };

  const handlePlaceClick = (table, placeNumber) => {
    const guestAtPlace = table.guests?.find((g) => g.place === placeNumber);

    if (movingGuest) {
      const targetGuest = table.guests?.find(g => g.place === placeNumber);

      if (targetGuest) {
        toast.error("Cette chaise est déjà occupée !");
        return;
      }

      reassignGuestToTable(movingGuest.guestId, table.id, placeNumber)
        .then(() => {
          setTables((prevTables) =>
            prevTables.map((t) => {
              if (t.id === movingGuest.sourceTableId && t.id === table.id) {
                return {
                  ...t,
                  guests: t.guests.map((g) =>
                    g.id === movingGuest.guestId ? { ...g, place: placeNumber } : g
                  ),
                };
              } else if (t.id === movingGuest.sourceTableId) {
                return {
                  ...t,
                  guests: t.guests.filter((g) => g.id !== movingGuest.guestId),
                };
              } else if (t.id === table.id) {
                return {
                  ...t,
                  guests: [
                    ...t.guests.filter((g) => g.id !== movingGuest.guestId),
                    { id: movingGuest.guestId, nom: movingGuest.guestName, place: placeNumber },
                  ],
                };
              }
              return t;
            })
          );
          setMovingGuest(null);
          setSelectedPlace(null);
          toast.success(`Invité ${movingGuest.guestName} déplacé avec succès !`);
        })
        .catch((err) => {
          console.error("Erreur déplacement invité:", err);
          toast.error("Erreur lors du déplacement de l'invité");
        });
    } else {
      if (guestAtPlace) {
        setMovingGuest({
          guestId: guestAtPlace.id,
          guestName: guestAtPlace.nom,
          sourceTableId: table.id,
          sourceChairIndex: placeNumber
        });
        setSelectedPlace({
          tableId: table.id,
          placeNumber,
          guestId: guestAtPlace.id,
          guestName: guestAtPlace.nom,
        });
      }
    }
  };

  const cancelMove = () => {
    setMovingGuest(null);
    setSelectedPlace(null);
  };

  const handleTableMove = async (tableId, position) => {
    try {
      await updateTablePosition(tableId, position);
      setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, position } : t)));
      toast.success("Position de la table mise à jour !");
    } catch (error) {
      console.error("Erreur mise à jour position:", error);
      toast.error("Erreur lors de la mise à jour de la position de la table");
    }
  };

  const handleTableRotate = async (tableId, rotation) => {
    try {
      await updateRotation(tableId, rotation);
      setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, rotation } : t)));
      toast.success("Rotation de la table mise à jour !");
    } catch (error) {
      console.error("Erreur rotation:", error);
      toast.error("Erreur lors de la rotation de la table");
    }
  };

  const handleElementMove = async (elementId, position) => {
    try {
      await updateElementPosition(elementId, position);
      setElements((prev) => prev.map((el) => (el.id === elementId ? { ...el, position } : el)));
      toast.success("Position de l'objet mise à jour !");
    } catch (error) {
      console.error("Erreur mise à jour position objet:", error);
      toast.error("Erreur lors de la mise à jour de la position de l'objet");
    }
  };

  const handleElementRotate = async (elementId, rotation) => {
    try {
      await updateElementRotation(elementId, rotation);
      setElements((prev) => prev.map((el) => (el.id === elementId ? { ...el, rotation } : el)));
      toast.success("Rotation de l'objet mise à jour !");
    } catch (error) {
      console.error("Erreur rotation objet:", error);
      toast.error("Erreur lors de la rotation de l'objet");
    }
  };

  const handleTableDelete = async (tableId) => {
    showConfirmation(
      "Supprimer la table ?",
      "Êtes-vous sûr de vouloir supprimer cette table ? Tous les invités assignés seront également supprimés.",
      async () => {
        try {
          await deleteTable(tableId);
          setTables((prev) => prev.filter((t) => t.id !== tableId));
          if (selectedPlace?.tableId === tableId) {
            setSelectedPlace(null);
            setMovingGuest(null);
          }
          toast.success("Table supprimée avec succès !");
        } catch (error) {
          console.error("Erreur suppression table:", error);
          toast.error("Erreur lors de la suppression de la table");
        }
        setShowConfirmationModal(false);
      }
    );
  };

  const handleElementDelete = async (elementId) => {
    showConfirmation(
      "Supprimer l'objet ?",
      "Êtes-vous sûr de vouloir supprimer cet objet ?",
      async () => {
        try {
          await deleteElement(elementId);
          setElements((prev) => prev.filter((el) => el.id !== elementId));
          toast.success("Objet supprimé avec succès !");
        } catch (error) {
          console.error("Erreur suppression objet:", error);
          toast.error("Erreur lors de la suppression de l'objet");
        }
        setShowConfirmationModal(false);
      }
    );
  };

  const handleResetPlan = () => {
    showConfirmation(
      "Réinitialiser le plan ?",
      "Êtes-vous sûr de vouloir supprimer toutes les tables et objets ? Cette action est irréversible.",
      () => {
        setTables([]);
        setElements([]);
        setMovingGuest(null);
        setSelectedPlace(null);
        toast.success("Plan réinitialisé avec succès !");
        setShowConfirmationModal(false);
      },
      "reset" // Type personnalisé pour un style différent si besoin
    );
  };

  const handleOpenTableEdit = (table) => setEditingTable(table);
  const handleCloseTableEdit = () => setEditingTable(null);

  const handleOpenElementEdit = (element) => setEditingElement(element);
  const handleCloseElementEdit = () => setEditingElement(null);

  const handleTableChange = async (id, field, value) => {
    try {
      const updatedData = { [field]: value };

      if (field === "type") {
        const typeInfo = TABLE_TYPES.find((type) => type.value === value);
        updatedData.width = typeInfo.width;
        updatedData.height = typeInfo.height;
      }

      if (field === "capacite") {
        updatedData.capacite = Number(value) || 1;
      }

      await updateTable(id, updatedData);

      setTables((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const updatedTable = { ...t, ...updatedData };
            if (field === "capacite" && updatedTable.guests) {
              updatedTable.guests = updatedTable.guests.filter(g => g.place <= updatedTable.capacite);
            }
            return updatedTable;
          }
          return t;
        })
      );
      toast.success("Table mise à jour avec succès !");
    } catch (error) {
      console.error("Erreur mise à jour table:", error);
      toast.error("Erreur lors de la modification de la table");
    }
  };

  const handleElementChange = async (id, field, value) => {
    try {
      const updatedData = { [field]: value };

      if (field === "type") {
        const typeInfo = ELEMENT_TYPES.find((type) => type.value === value);
        updatedData.width = typeInfo.width;
        updatedData.height = typeInfo.height;
      }

      await updateElement(id, updatedData);
      setElements((prev) =>
        prev.map((el) => {
          if (el.id === id) {
            const updatedElement = { ...el, ...updatedData };
            return updatedElement;
          }
          return el;
        })
      );
      toast.success("Objet mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur mise à jour objet:", error);
      toast.error("Erreur lors de la modification de l'objet");
    }
  };

  const addNewTables = (newTables) => {
    console.log("Ajout de nouvelles tables dans addNewTables:", newTables);
    setTables(prev => {
      const updatedTables = [...prev, ...newTables];
      console.log("État tables après mise à jour:", updatedTables);
      return updatedTables;
    });
    if (onAddTable) {
      console.log("Appel de onAddTable avec:", newTables);
      onAddTable(newTables);
    }
  };

  const addNewElements = (newElements) => {
    setElements(prev => [...prev, ...newElements]);
  };

  const addNewGuest = (newGuest) => {
    console.log("Ajout d'un nouvel invité dans addNewGuest:", newGuest);
    if (newGuest.tableId && newGuest.place) {
      setTables(prevTables =>
        prevTables.map(t => {
          if (t.id === newGuest.tableId) {
            const updatedTable = {
              ...t,
              guests: [
                ...(t.guests || []),
                {
                  id: newGuest.id,
                  nom: newGuest.nom,
                  place: newGuest.place
                }
              ]
            };
            console.log("Table mise à jour avec nouvel invité:", updatedTable);
            return updatedTable;
          }
          return t;
        })
      );
    }
    if (onAddGuest) {
      console.log("Appel de onAddGuest avec:", newGuest);
      onAddGuest(newGuest);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center p-4">
      <Toaster position="top-right" />

      <div className="fixed bottom-4 flex flex-row gap-2 z-50 lg:flex-col lg:left-4 lg:transform-none lg:gap-3 overflow-x-auto snap-x snap-mandatory max-w-[90vw] lg:max-w-none lg:overflow-x-visible px-2 lg:px-0 scrollbar-hidden">
        {/* Ajouter invité */}
        <button
          onClick={() => setShowGuestModal(true)}
          className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-3 py-2 lg:px-4 lg:py-3 rounded-2xl shadow-xl flex items-center justify-center lg:justify-start gap-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20 backdrop-blur-sm snap-center flex-shrink-0"
          title="Ajouter un invité"
        >
          <User className="w-5 h-5" />
          <span className="hidden lg:inline text-sm font-medium">Ajouter invité</span>
        </button>

        {/* Ajouter tables */}
        <button
          onClick={() => setShowTableModal(true)}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-3 py-2 lg:px-4 lg:py-3 rounded-2xl shadow-xl flex items-center justify-center lg:justify-start gap-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20 backdrop-blur-sm snap-center flex-shrink-0"
          title="Ajouter des tables"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden lg:inline text-sm font-medium">Ajouter des tables</span>
        </button>

        {/* Ajouter objets */}
        <button
          onClick={() => setShowElementModal(true)}
          className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white px-3 py-2 lg:px-4 lg:py-3 rounded-2xl shadow-xl flex items-center justify-center lg:justify-start gap-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20 backdrop-blur-sm snap-center flex-shrink-0"
          title="Ajouter des objets"
        >
          <Box className="w-5 h-5" />
          <span className="hidden lg:inline text-sm font-medium">Ajouter des objets</span>
        </button>

        {/* Réinitialiser */}
        <button
          onClick={handleResetPlan}
          className="bg-gradient-to-br from-red-500 to-rose-600 text-white px-3 py-2 lg:px-4 lg:py-3 rounded-2xl shadow-xl flex items-center justify-center lg:justify-start gap-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20 backdrop-blur-sm snap-center flex-shrink-0"
          title="Réinitialiser"
        >
          <RefreshCcw className="w-5 h-5" />
          <span className="hidden lg:inline text-sm font-medium">Réinitialiser</span>
        </button>

        {/* Annuler déplacement */}
        {movingGuest && (
          <button
            onClick={cancelMove}
            className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white px-3 py-2 lg:px-4 lg:py-3 rounded-2xl shadow-xl flex items-center justify-center lg:justify-start gap-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-pulse border border-white/20 backdrop-blur-sm snap-center flex-shrink-0"
            title="Annuler déplacement"
          >
            <span className="sm:hidden">✕</span>
            <span className="hidden lg:inline text-sm font-medium">Annuler déplacement</span>
          </button>
        )}

        {/* Sélecteur taille canvas */}
        <div className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-indigo-600 backdrop-blur-xl rounded-2xl shadow-xl p-2 border border-white/30 snap-center flex-shrink-0 transition-all duration-300 hover:scale-105">
          <select
            value={canvasSize.label}
            onChange={(e) => {
              if (e.target.value === "Personnalisé") {
                setShowCanvasSizeModal(true);
              } else {
                const selectedSize = CANVAS_SIZES.find(size => size.label === e.target.value);
                setCanvasSize(selectedSize);
                toast.success(`Taille du canvas : ${selectedSize.label}`);
              }
            }}
            className=" text-white px-3 py-2 lg:px-4 lg:py-2 rounded-2xl cursor-pointer transition hover:scale-105 hover:shadow-2xl backdrop-blur-sm text-sm"
            title="Sélectionner la taille du canvas"
          >
            {[...CANVAS_SIZES, { label: "Personnalisé", width: 0, height: 0 }].map(size => (
              <option key={size.label} value={size.label} className="text-gray-800">
                Taille : {size.label}
              </option>
            ))}
          </select>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-2 border border-white/30 snap-center flex-shrink-0">
          <button
            onClick={() => handleZoom("out")}
            disabled={zoomLevel <= 0.5}
            className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 rounded-xl flex items-center justify-center hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-200 hover:scale-105"
            title="Zoom arrière"
          >
            -
          </button>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-2 py-1 rounded-lg">
            <span className="text-sm font-bold text-indigo-700 min-w-[3rem] text-center">
              {(zoomLevel * 100).toFixed(0)}%
            </span>
          </div>
          <button
            onClick={() => handleZoom("in")}
            disabled={zoomLevel >= 2}
            className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 rounded-xl flex items-center justify-center hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-200 hover:scale-105"
            title="Zoom avant"
          >
            +
          </button>
        </div>

        {/* Style pour masquer la barre de défilement tout en permettant le scroll */}
        <style>{`
      .scrollbar-hidden::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hidden {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `}</style>
      </div>

      <div
        ref={canvasRef}
        className="relative border-2 border-gray-200/60 rounded-3xl shadow-2xl max-w-full max-h-[80vh] overflow-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50"
        style={{ width: canvasSize.width, height: canvasSize.height }}
      >
        <div
          className="relative"
          style={{
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center',
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-100/15 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-50/10 to-indigo-50/10 rounded-full blur-3xl"></div>
          {movingGuest && (
            <div className="absolute top-4 left-4 right-4 z-40 animate-slide-down">
              <div className="relative bg-gradient-to-r from-amber-50 to-yellow-50/80 border border-amber-200/60 rounded-2xl p-4 shadow-xl overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 to-yellow-100/20 animate-pulse"></div>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-yellow-500"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center animate-bounce">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-amber-800 font-medium">
                      <span className="text-sm">Mode déplacement activé</span>
                      <div className="mt-1">
                        <span className="font-bold text-amber-900 bg-amber-200/50 px-2 py-1 rounded-lg">
                          {movingGuest.guestName}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-amber-700 mt-1">Cliquez sur une chaise libre pour déplacer l'invité</p>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
            <div className="relative text-center">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"></div>
              <div className="relative px-6 py-3">
                <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-800 bg-clip-text text-transparent tracking-wide drop-shadow-sm">
                  Plan des Tables - {event?.nom || "Événement"}
                </h1>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(129,140,248,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(129,140,248,0.04)_1px,transparent_1px)] bg-[size:20px_20px]" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-200/30 to-transparent"></div>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-200/30 to-transparent"></div>
          </div>

          <div className="relative z-20 w-full h-full">
            {tables.map((table) => (
              <TableManipule
                key={table.id}
                table={table}
                onMove={handleTableMove}
                onRotate={handleTableRotate}
                onDelete={handleTableDelete}
                onPlaceClick={handlePlaceClick}
                selectedPlace={selectedPlace}
                onEdit={handleOpenTableEdit}
                movingGuest={movingGuest}
                zoomLevel={zoomLevel}
              />
            ))}
            {elements.map((element) => (
              <Element
                key={element.id}
                element={element}
                onMove={handleElementMove}
                onRotate={handleElementRotate}
                onDelete={handleElementDelete}
                onEdit={handleOpenElementEdit}
                zoomLevel={zoomLevel}
              />
            ))}
          </div>

          {tables.length === 0 && elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center space-y-6 max-w-md mx-auto px-6">
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl animate-pulse"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl flex items-center justify-center shadow-lg">
                    <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent">
                    Canvas vide
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-600 leading-relaxed">
                      Aucune table ou objet créé pour le moment
                    </p>
                    <p className="text-sm text-gray-500 bg-gray-50/80 px-4 py-2 rounded-xl border border-gray-200/50">
                      💡 Astuce : Ajoutez des tables ou objets depuis les boutons en bas à gauche pour commencer l'organisation de votre événement
                    </p>
                  </div>
                </div>
                <div className="flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <div className="relative">
                  <div className="absolute -bottom-12 -left-16 transform rotate-12 animate-bounce text-indigo-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-indigo-200/50 rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-indigo-200/50 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-indigo-200/50 rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-indigo-200/50 rounded-br-lg"></div>
        </div>

        <style>{`
            @keyframes slide-down {
              from { 
                opacity: 0; 
                transform: translateY(-20px); 
              }
              to { 
                opacity: 1; 
                transform: translateY(0); 
              }
            }
            .animate-slide-down {
              animation: slide-down 0.5s ease-out;
            }
            .triangle {
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  }
          `}</style>
      </div>

      <TableCreationModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onAddTables={addNewTables}
        events={events}
        tables={tables}
        eventId={event?.id}
      />

      <ElementCreationModal
        isOpen={showElementModal}
        onClose={() => setShowElementModal(false)}
        onAddElements={addNewElements}
        events={events}
        eventId={event?.id}
      />

      <GuestCreationModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onAddGuest={addNewGuest}
        tables={tables}
        events={events}
      />

      <CanvasSizeModal
        isOpen={showCanvasSizeModal}
        onClose={() => setShowCanvasSizeModal(false)}
        onApplySize={handleApplyCanvasSize}
      />

      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={confirmationConfig.onConfirm}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        type={confirmationConfig.type}
      />

      {editingTable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              Modification de {editingTable.nom}
            </h2>
            <div className="space-y-4">
              <p className="text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                🚧 <strong>Fonctionnalité en maintenance</strong> 🚧<br />
                La modification des tables est temporairement désactivée. Veuillez réessayer plus tard.
              </p>
              <div>
                <label className="text-gray-700 font-medium mb-2 text-sm">Nom</label>
                <input
                  value={editingTable.nom}
                  disabled
                  placeholder="Nom de la table"
                  className="w-full border rounded-xl px-3 py-2 bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-gray-700 font-medium mb-2 text-sm">Capacité</label>
                <input
                  type="number"
                  value={editingTable.capacite}
                  disabled
                  min="1"
                  placeholder="Capacité"
                  className="w-full border rounded-xl px-3 py-2 bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-gray-700 font-medium mb-2 text-sm">Type</label>
                <select
                  value={editingTable.type}
                  disabled
                  className="w-full border rounded-xl px-3 py-2 bg-gray-100 cursor-not-allowed"
                >
                  {TABLE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 transition-colors"
                onClick={handleCloseTableEdit}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                onClick={() => {
                  handleTableDelete(editingTable.id);
                  handleCloseTableEdit();
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {editingElement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              Modification de {editingElement.nom}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 font-medium mb-2 text-sm">Nom</label>
                <input
                  value={editingElement.nom}
                  onChange={(e) => handleElementChange(editingElement.id, "nom", e.target.value)}
                  placeholder="Nom de l'objet"
                  className="w-full border rounded-xl px-3 py-2"
                />
              </div>
              <div>
                <label className="text-gray-700 font-medium mb-2 text-sm">Type</label>
                <select
                  value={editingElement.type}
                  onChange={(e) => handleElementChange(editingElement.id, "type", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2"
                >
                  {ELEMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 font-medium mb-2 text-sm">Couleur</label>
                <input
                  type="color"
                  value={editingElement.color || '#d1d5db'}
                  onChange={(e) => handleElementChange(editingElement.id, "color", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 h-12"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 transition-colors"
                onClick={handleCloseElementEdit}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                onClick={() => {
                  handleElementDelete(editingElement.id);
                  handleCloseElementEdit();
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}