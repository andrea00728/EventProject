import { Edit, Plus, RefreshCcw, User } from "lucide-react";
import { useState, useRef } from "react";

const TABLE_TYPES = [
  { value: "ronde", label: "Table ronde", width: 80, height: 80 },
  { value: "rectangle", label: "Table rectangulaire", width: 112, height: 64 },
  { value: "ovale", label: "Table ovale", width: 112, height: 64 },
  { value: "carree", label: "Table carrée", width: 80, height: 80 },
];

function snapToGrid(value, gridSize = 40) {
  return Math.round(value / gridSize) * gridSize;
}

function getChairPositions(type, capacity, tableWidth, tableHeight) {
  const positions = [];
  const chairSize = 30; // Taille approximative d'une chaise
  const minDistanceFromTable = 0; // Distance minimale entre la chaise et la table

  if (type === "ronde" || type === "ovale") {
    // Pour les tables rondes/ovales
    const centerX = tableWidth / 2;
    const centerY = tableHeight / 2;

    // Calculer le rayon en fonction de la forme
    const tableRadius = type === "ronde"
      ? Math.min(tableWidth, tableHeight) / 2
      : Math.max(tableWidth, tableHeight) / 2;

    const radius = tableRadius + minDistanceFromTable + chairSize / 2;

    for (let i = 0; i < capacity; i++) {
      // Commencer à -π/2 pour que la première chaise soit en haut
      const angle = (2 * Math.PI * i) / capacity - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle) - chairSize / 2;
      const y = centerY + radius * Math.sin(angle) - chairSize / 2;
      positions.push({ left: `${x}px`, top: `${y}px` });
    }
  } else {
    // Pour les tables rectangulaires/carrées
    const perimetre = 2 * (tableWidth + tableHeight);
    const spacingBetweenChairs = perimetre / capacity;

    // Calculer combien de chaises par côté en fonction de l'espacement uniforme
    const topChairs = Math.round((tableWidth / spacingBetweenChairs));
    const rightChairs = Math.round((tableHeight / spacingBetweenChairs));
    const bottomChairs = Math.round((tableWidth / spacingBetweenChairs));
    const leftChairs = capacity - topChairs - rightChairs - bottomChairs;

    let count = 0;

    // Côté du haut
    if (topChairs > 0) {
      const spacing = tableWidth / (topChairs + 1);
      for (let i = 0; i < topChairs && count < capacity; i++, count++) {
        positions.push({
          left: `${(i + 1) * spacing - chairSize / 2}px`,
          top: `${-minDistanceFromTable - chairSize}px`
        });
      }
    }

    // Côté droit
    if (rightChairs > 0) {
      const spacing = tableHeight / (rightChairs + 1);
      for (let i = 0; i < rightChairs && count < capacity; i++, count++) {
        positions.push({
          left: `${tableWidth + minDistanceFromTable}px`,
          top: `${(i + 1) * spacing - chairSize / 2}px`,
        });
      }
    }

    // Côté du bas
    if (bottomChairs > 0) {
      const spacing = tableWidth / (bottomChairs + 1);
      for (let i = 0; i < bottomChairs && count < capacity; i++, count++) {
        positions.push({
          left: `${tableWidth - (i + 1) * spacing - chairSize / 2}px`,
          top: `${tableHeight + minDistanceFromTable}px`,
        });
      }
    }

    // Côté gauche
    if (leftChairs > 0) {
      const spacing = tableHeight / (leftChairs + 1);
      for (let i = 0; i < leftChairs && count < capacity; i++, count++) {
        positions.push({
          left: `${-minDistanceFromTable - chairSize}px`,
          top: `${tableHeight - (i + 1) * spacing - chairSize / 2}px`,
        });
      }
    }
  }

  return positions;
}

function Chair({ number, style, isOccupied, guestName, onClick, isSelected, isMoving }) {
  return (
    <div
      className={`w-5 h-5 rounded-full absolute border border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-white cursor-pointer transition-all duration-200 ${isOccupied
          ? "bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600"
          : "bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600"
        } ${isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''} ${isMoving ? 'ring-2 ring-yellow-400 ring-offset-1 animate-pulse' : ''
        }`}
      style={style}
      title={isOccupied ? `Place ${number} - ${guestName}` : `Place ${number} - Libre`}
      onClick={onClick}
    >
      {number}
    </div>
  );
}

export default function Demo() {
  const [tables, setTables] = useState([]);
  const [guests, setGuests] = useState([]); // {id, name, tableId, chairIndex}
  const [form, setForm] = useState({ nom: "", capacite: "", nombre: "" });
  const [guestForm, setGuestForm] = useState({ name: "", tableId: "" });
  const [selectedType, setSelectedType] = useState(TABLE_TYPES[0].value);
  const [showDragZone, setShowDragZone] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [ajoutTable, setAjoutTable] = useState(false);
  const [ajoutGuest, setAjoutGuest] = useState(false);
  const [movingGuest, setMovingGuest] = useState(null); // {guestId, sourceTableId, sourceChairIndex}

  // Refs pour le drag tactile
  const dragAreaRef = useRef(null);
  const touchDataRef = useRef({});

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleGuestFormChange = (e) =>
    setGuestForm({ ...guestForm, [e.target.name]: e.target.value });

  const handleAddTable = (e) => {
    e.preventDefault();
    const newTables = [];
    const nombre = Number(form.nombre);
    if (nombre <= 0) return;

    for (let i = 0; i < nombre; i++) {
      const typeInfo = TABLE_TYPES.find((t) => t.value === selectedType);
      newTables.push({
        id: Date.now() + i,
        nom: form.nom ? `${form.nom} ${i + 1}` : `Table ${i + 1}`,
        capacite: Number(form.capacite) || 4,
        type: selectedType,
        pos: { left: 100 + i * 20, top: 100 + i * 20 },
        dragging: false,
        width: typeInfo.width,
        height: typeInfo.height,
      });
    }
    setTables([...tables, ...newTables]);
    setForm({ nom: "", capacite: "", nombre: "" });
    setShowDragZone(true);
    setAjoutTable(false);
  };

  const handleAddGuest = (e) => {
    e.preventDefault();
    const table = tables.find(t => t.id === Number(guestForm.tableId));
    if (!table) return;

    // Trouver la première chaise libre
    const occupiedChairs = guests.filter(g => g.tableId === table.id).map(g => g.chairIndex);
    let freeChairIndex = -1;

    for (let i = 0; i < table.capacite; i++) {
      if (!occupiedChairs.includes(i)) {
        freeChairIndex = i;
        break;
      }
    }

    if (freeChairIndex === -1) {
      alert("Aucune place libre sur cette table!");
      return;
    }

    const newGuest = {
      id: Date.now(),
      name: guestForm.name,
      tableId: table.id,
      chairIndex: freeChairIndex
    };

    setGuests([...guests, newGuest]);
    setGuestForm({ name: "", tableId: "" });
    setAjoutGuest(false);
  };

  const handleChairClick = (tableId, chairIndex) => {
    if (movingGuest) {
      // Mode déplacement - déplacer l'invité vers cette chaise
      const targetGuest = guests.find(g => g.tableId === tableId && g.chairIndex === chairIndex);

      if (targetGuest) {
        alert("Cette chaise est déjà occupée!");
        return;
      }

      setGuests(prev =>
        prev.map(g =>
          g.id === movingGuest.guestId
            ? { ...g, tableId, chairIndex }
            : g
        )
      );
      setMovingGuest(null);
    } else {
      // Mode sélection - sélectionner un invité à déplacer
      const guest = guests.find(g => g.tableId === tableId && g.chairIndex === chairIndex);
      if (guest) {
        setMovingGuest({
          guestId: guest.id,
          sourceTableId: tableId,
          sourceChairIndex: chairIndex
        });
      }
    }
  };

  const cancelMove = () => {
    setMovingGuest(null);
  };

  const isChairOccupied = (tableId, chairIndex) => {
    return guests.some(g => g.tableId === tableId && g.chairIndex === chairIndex);
  };

  const getGuestForChair = (tableId, chairIndex) => {
    return guests.find(g => g.tableId === tableId && g.chairIndex === chairIndex);
  };

  const handleDragStart = (id, e) => {
    const img = new Image();
    img.src = "";
    e.dataTransfer.setDragImage(img, 0, 0);
    setTables((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, dragging: true } : { ...t, dragging: false }
      )
    );
  };

  const handleDragEnd = (id, e) => {
    const table = tables.find((t) => t.id === id);
    if (!table) return;
    const parentRect = e.target.parentNode.getBoundingClientRect();
    const x = snapToGrid(e.clientX - parentRect.left - table.width / 2);
    const y = snapToGrid(e.clientY - parentRect.top - table.height / 2);
    const maxX = 800 - table.width;
    const maxY = 500 - table.height;
    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(0, Math.min(y, maxY));

    setTables((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, pos: { left: boundedX, top: boundedY }, dragging: false }
          : t
      )
    );
  };

  const handleOpenEdit = (table) => setEditingTable(table);
  const handleCloseEdit = () => setEditingTable(null);

  const handleTableChange = (id, field, value) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updatedTable = { ...t, [field]: value };
          if (field === "type") {
            const typeInfo = TABLE_TYPES.find((type) => type.value === value);
            updatedTable.width = typeInfo.width;
            updatedTable.height = typeInfo.height;
          }
          if (field === "capacite") {
            updatedTable.capacite = Number(value) || 1;
            // Supprimer les invités dont les chaises n'existent plus
            setGuests(prev =>
              prev.filter(g => g.tableId !== id || g.chairIndex < updatedTable.capacite)
            );
          }
          return updatedTable;
        }
        return t;
      })
    );
  };

  // Fonctions pour le drag tactile améliorées
  const handleTouchStart = (id, e) => {
    e.preventDefault();

    const touch = e.touches[0];
    const table = tables.find((t) => t.id === id);
    if (!table) return;

    // Calculer l'offset du toucher par rapport à la position de la table
    const tableElement = e.currentTarget;
    const tableRect = tableElement.getBoundingClientRect();
    const dragAreaRect = dragAreaRef.current.getBoundingClientRect();

    touchDataRef.current[id] = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialLeft: table.pos.left,
      initialTop: table.pos.top,
      offsetX: touch.clientX - tableRect.left,
      offsetY: touch.clientY - tableRect.top,
      dragAreaLeft: dragAreaRect.left,
      dragAreaTop: dragAreaRect.top
    };

    setTables((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, dragging: true } : { ...t, dragging: false }
      )
    );
  };

  const handleTouchMove = (id, e) => {
    e.preventDefault();

    const touch = e.touches[0];
    const table = tables.find((t) => t.id === id);
    const touchData = touchDataRef.current[id];

    if (!table || !touchData) return;

    // Calculer la nouvelle position basée sur le mouvement du doigt
    const newX = touch.clientX - touchData.dragAreaLeft - touchData.offsetX;
    const newY = touch.clientY - touchData.dragAreaTop - touchData.offsetY;

    // Appliquer le snap et les limites
    const maxX = 800 - table.width;
    const maxY = 500 - table.height;
    const boundedX = Math.max(0, Math.min(snapToGrid(newX), maxX));
    const boundedY = Math.max(0, Math.min(snapToGrid(newY), maxY));

    setTables((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, pos: { left: boundedX, top: boundedY } } : t
      )
    );
  };

  const handleTouchEnd = (id) => {
    delete touchDataRef.current[id];

    setTables((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, dragging: false } : t
      )
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 p-4 lg:p-8 gap-4 lg:gap-8 overflow-auto">
      {/* Formulaire */}
      {!showDragZone && (
        <div className="w-full max-w-md lg:w-[400px] mx-auto">
          <form
            onSubmit={handleAddTable}
            className="p-6 bg-white shadow-lg rounded-xl border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Créer une Table
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <input
                name="nom"
                value={form.nom}
                onChange={handleFormChange}
                placeholder="Nom table"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                name="capacite"
                type="number"
                value={form.capacite}
                onChange={handleFormChange}
                required
                min="1"
                placeholder="Capacité"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                name="nombre"
                type="number"
                value={form.nombre}
                onChange={handleFormChange}
                required
                min="1"
                placeholder="Nombre de tables"
                className="w-full border rounded-lg px-3 py-2"
              />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {TABLE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full mt-6 bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 cursor-pointer"
            >
              Ajouter
            </button>
          </form>
        </div>
      )}

      {/* Zone Drag & Drop */}
      {showDragZone && (
        <>
          {/* Modal Ajouter Invité */}
          {ajoutGuest && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
                <h2 className="text-xl font-semibold mb-4">
                  Ajouter un Invité
                </h2>
                <form onSubmit={handleAddGuest}>
                  <input
                    name="name"
                    value={guestForm.name}
                    onChange={handleGuestFormChange}
                    placeholder="Nom de l'invité"
                    required
                    className="w-full border rounded-lg px-3 py-2 mb-4"
                  />
                  <select
                    name="tableId"
                    value={guestForm.tableId}
                    onChange={handleGuestFormChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 mb-4"
                  >
                    <option value="">Sélectionner une table</option>
                    {tables.map((table) => {
                      const occupiedSeats = guests.filter(g => g.tableId === table.id).length;
                      const freeSeats = table.capacite - occupiedSeats;
                      return (
                        <option key={table.id} value={table.id} disabled={freeSeats === 0}>
                          {table.nom} ({freeSeats} place{freeSeats !== 1 ? 's' : ''} libre{freeSeats !== 1 ? 's' : ''})
                        </option>
                      );
                    })}
                  </select>
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 cursor-pointer"
                  >
                    Ajouter
                  </button>
                </form>
                <button
                  onClick={() => setAjoutGuest(false)}
                  className="mt-4 w-full bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

          {/* Modal ajout table */}
          {ajoutTable && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
                <h2 className="text-xl font-semibold mb-4">
                  Ajouter des Tables
                </h2>
                <form onSubmit={handleAddTable}>
                  <input
                    name="nom"
                    value={form.nom}
                    onChange={handleFormChange}
                    placeholder="Nom de la table"
                    required
                    className="w-full border rounded-lg px-3 py-2 mb-4"
                  />
                  <input
                    name="capacite"
                    type="number"
                    value={form.capacite}
                    onChange={handleFormChange}
                    placeholder="Capacité"
                    required
                    min="1"
                    className="w-full border rounded-lg px-3 py-2 mb-4"
                  />
                  <input
                    name="nombre"
                    type="number"
                    value={form.nombre}
                    onChange={handleFormChange}
                    placeholder="Nombre de tables"
                    required
                    min="1"
                    className="w-full border rounded-lg px-3 py-2 mb-4"
                  />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mb-4"
                  >
                    {TABLE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 cursor-pointer"
                  >
                    Ajouter
                  </button>
                </form>
                <button
                  onClick={() => setAjoutTable(false)}
                  className="mt-4 w-full bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

          {/* Boutons fixes flottants */}
          <div className="fixed bottom-4 left-4 flex flex-col gap-2 z-50">
            {/* Bouton Ajouter invité */}
            <button
              onClick={() => setAjoutGuest(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow flex items-center cursor-pointer justify-center sm:justify-start gap-2 transition"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Ajouter invité</span>
            </button>

            {/* Bouton Ajouter des tables */}
            <button
              onClick={() => setAjoutTable(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow flex items-center cursor-pointer justify-center sm:justify-start gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Ajouter des tables</span>
            </button>

            {/* Bouton Réinitialiser */}
            <button
              onClick={() => {
                setTables([]);
                setGuests([]);
                setMovingGuest(null);
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer shadow flex items-center justify-center sm:justify-start gap-2 transition"
            >
              <RefreshCcw className="w-5 h-5" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>

            {/* Bouton Annuler déplacement */}
            {movingGuest && (
              <button
                onClick={cancelMove}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg cursor-pointer shadow flex items-center justify-center sm:justify-start gap-2 transition"
              >
                <span className="hidden sm:inline">Annuler déplacement</span>
                <span className="sm:hidden">✕</span>
              </button>
            )}
          </div>

          {/* Zone tables */}
          <div className="flex-1 flex items-center justify-center relative">
            <div
              ref={dragAreaRef}
              className="relative w-full h-[60vh] lg:w-[800px] lg:h-[500px] bg-white border overflow-hidden border-gray-300 rounded-2xl shadow-2xl"
              style={{ touchAction: 'none' }} // Important pour désactiver le scroll pendant le drag
            >
              {movingGuest && (
                <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg z-40">
                  Mode déplacement: Cliquez sur une chaise libre pour déplacer l'invité
                </div>
              )}
              {tables.map((table) => (
                <div
                  key={table.id}
                  draggable
                  onDragStart={(e) => handleDragStart(table.id, e)}
                  onDragEnd={(e) => handleDragEnd(table.id, e)}
                  onTouchStart={(e) => handleTouchStart(table.id, e)}
                  onTouchMove={(e) => handleTouchMove(table.id, e)}
                  onTouchEnd={() => handleTouchEnd(table.id)}
                  className={`absolute select-none ${table.dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  style={{
                    left: table.pos.left,
                    top: table.pos.top,
                    width: table.width,
                    height: table.height,
                    zIndex: table.dragging ? 50 : 10,
                    touchAction: 'none', // Désactive le scroll pendant le drag
                  }}
                  onDoubleClick={() => handleOpenEdit(table)}
                >
                  <div
                    className={`border-4 border-indigo-400 shadow-md flex items-center justify-center ${table.type === "ronde" || table.type === "ovale"
                      ? "rounded-full"
                      : "rounded-md"
                      } w-full h-full bg-pink-200 relative transition-shadow duration-200 ${table.dragging ? 'shadow-2xl scale-105' : 'shadow-md'
                      }`}
                  >
                    {/* Bouton d'édition pour mobile */}
                    <button
                      onClick={(e) => handleOpenEdit(table)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-indigo-700 z-30 md:hidden"
                      title="Modifier la table"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-indigo-700 select-none pointer-events-none">
                      {table.nom}
                    </span>
                    {getChairPositions(
                      table.type,
                      table.capacite,
                      table.width,
                      table.height
                    ).map((pos, i) => {
                      const isOccupied = isChairOccupied(table.id, i);
                      const guest = getGuestForChair(table.id, i);
                      const isSelected = movingGuest?.sourceTableId === table.id && movingGuest?.sourceChairIndex === i;
                      const isMovingTarget = movingGuest && movingGuest.guestId !== guest?.id;

                      return (
                        <Chair
                          key={i}
                          number={i + 1}
                          style={pos}
                          isOccupied={isOccupied}
                          guestName={guest?.name}
                          onClick={() => handleChairClick(table.id, i)}
                          isSelected={isSelected}
                          isMoving={isMovingTarget}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal Modification */}
      {editingTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">
              Modifier {editingTable.nom}
            </h2>
            <input
              defaultValue={editingTable.nom}
              onChange={(e) =>
                handleTableChange(editingTable.id, "nom", e.target.value)
              }
              className="w-full border rounded px-2 py-1 mb-2"
            />
            <input
              type="number"
              defaultValue={editingTable.capacite}
              onChange={(e) =>
                handleTableChange(editingTable.id, "capacite", e.target.value)
              }
              min="1"
              className="w-full border rounded px-2 py-1 mb-2"
            />
            <select
              defaultValue={editingTable.type}
              onChange={(e) =>
                handleTableChange(editingTable.id, "type", e.target.value)
              }
              className="w-full border rounded px-2 py-1 mb-2"
            >
              {TABLE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
                onClick={handleCloseEdit}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
                onClick={handleCloseEdit}
              >
                OK
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                onClick={() => {
                  // Supprimer aussi tous les invités de cette table
                  setGuests(prev => prev.filter(g => g.tableId !== editingTable.id));
                  setTables((prev) =>
                    prev.filter((t) => t.id !== editingTable.id)
                  );
                  handleCloseEdit();
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="max-w-full sm:max-w-xl w-full mx-auto p-3 sm:p-6 animate-fade-in animate-slide-up">
        <h2 className="text-base sm:text-2xl font-extrabold text-indigo-700 mb-3 sm:mb-4 tracking-wide drop-shadow-sm">
          Instructions
        </h2>

        <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 prose prose-sm sm:prose">
          <li>Ajoutez une table via le formulaire. Une fois créée, vous pouvez la déplacer librement dans la zone.</li>
          <li>Pour modifier une table : double-cliquez dessus sur desktop ou utilisez le bouton "Edit" sur mobile pour changer son nom, sa capacité ou sa forme.</li>
          <li>Les chaises se positionnent automatiquement autour de la table selon sa forme et sa capacité.</li>
          <li>Tables rondes/ovales → chaises en cercle. Tables carrées/rectangulaires → chaises sur les côtés.</li>
          <li>Une fois la table créée, vous pouvez ajouter des invités à chaque table.</li>
          <li>Ajoutez plusieurs tables en répétant l’opération depuis le formulaire.</li>
          <li>Faites glisser les tables pour réorganiser votre plan et optimiser l’espace.</li>
        </ul>

        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 italic">
          Astuce : <br />
          <li>cliquez-glissez pour déplacer tables.</li>
          <li>cliquez sur une chaise occupée pour sélectionner l'invité, puis cliquez sur une chaise libre pour le déplacer.</li>
        </p>
      </div>

    </div>
  );
}