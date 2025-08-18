import { useState } from "react";

const TABLE_TYPES = [
  {
    value: "ronde",
    label: "Table ronde",
    width: 80,
    height: 80,
  },
  {
    value: "rectangle",
    label: "Table rectangulaire",
    width: 112,
    height: 64,
  },
  {
    value: "ovale",
    label: "Table ovale",
    width: 112,
    height: 64,
  },
  {
    value: "carree",
    label: "Table carrée",
    width: 80,
    height: 80,
  },
];

function snapToGrid(value, gridSize = 40) {
  return Math.round(value / gridSize) * gridSize;
}

// Positionne les chaises autour de la table
function getChairPositions(type, capacity, tableWidth, tableHeight) {
  const positions = [];

  if (type === "ronde" || type === "ovale") {
    const radius = Math.max(tableWidth, tableHeight) / 2 + 15;
    for (let i = 0; i < capacity; i++) {
      const angle = (2 * Math.PI * i) / capacity - Math.PI / 2;
      const x = tableWidth / 2 + radius * Math.cos(angle);
      const y = tableHeight / 2 + radius * Math.sin(angle);
      positions.push({ left: `${x}px`, top: `${y}px` });
    }
  } else {
    const perSide = Math.ceil(capacity / 4);
    let count = 0;
    const spacingX = tableWidth / (perSide + 1);
    const spacingY = tableHeight / (perSide + 1);

    // Haut
    for (let i = 0; i < perSide && count < capacity; i++, count++) {
      positions.push({ left: `${(i + 1) * spacingX}px`, top: "-10px" });
    }
    // Droite
    for (let i = 0; i < perSide && count < capacity; i++, count++) {
      positions.push({ left: `${tableWidth + 10}px`, top: `${(i + 1) * spacingY}px` });
    }
    // Bas
    for (let i = 0; i < perSide && count < capacity; i++, count++) {
      positions.push({ left: `${tableWidth - (i + 1) * spacingX}px`, top: `${tableHeight + 10}px` });
    }
    // Gauche
    for (let i = 0; i < perSide && count < capacity; i++, count++) {
      positions.push({ left: "-10px", top: `${tableHeight - (i + 1) * spacingY}px` });
    }
  }

  return positions;
}

function Chair({ number, style }) {
  return (
    <div
      className="w-5 h-5 rounded-full bg-green-400 absolute border border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-white"
      style={style}
      title={`Place ${number}`}
    >
      {number}
    </div>
  );
}

export default function Demo() {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ nom: "", capacite: "", nombre: "" });
  const [selectedType, setSelectedType] = useState(TABLE_TYPES[0].value);
  const [showDragZone, setShowDragZone] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddTable = (e) => {
    e.preventDefault();
    const newTables = [];
    const nombre = Number(form.nombre);
    if (nombre <= 0) return; // Empêche l'ajout si nombre est invalide

    for (let i = 0; i < nombre; i++) {
      const typeInfo = TABLE_TYPES.find((t) => t.value === selectedType);
      newTables.push({
        id: Date.now() + i,
        nom: form.nom ? `${form.nom} ${i + 1}` : `Table ${i + 1}`, // Nom par défaut si vide
        capacite: Number(form.capacite) || 4, // Capacité par défaut si vide
        type: selectedType,
        pos: { left: 100 + i * 20, top: 100 + i * 20 }, // Décalage pour éviter chevauchements
        dragging: false,
        width: typeInfo.width,
        height: typeInfo.height,
      });
    }
    setTables([...tables, ...newTables]);
    setForm({ nom: "", capacite: "", nombre: "" });
    setShowDragZone(true);
  };

  const handleDragStart = (id, e) => {
    const table = tables.find((t) => t.id === id);
    if (!table) return;

    const img = new Image();
    img.src = "";
    e.dataTransfer.setDragImage(img, 0, 0);

    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dragging: true } : { ...t, dragging: false }))
    );
  };

  const handleDragEnd = (id, e) => {
    const table = tables.find((t) => t.id === id);
    if (!table) return;

    const parentRect = e.target.parentNode.getBoundingClientRect();
    const x = snapToGrid(e.clientX - parentRect.left - table.width / 2);
    const y = snapToGrid(e.clientY - parentRect.top - table.height / 2);

    // Limiter les positions pour rester dans la zone
    const maxX = 800 - table.width;
    const maxY = 500 - table.height;
    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(0, Math.min(y, maxY));

    setTables((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, pos: { left: boundedX, top: boundedY }, dragging: false } : t
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
            // Mettre à jour les dimensions si le type change
            const typeInfo = TABLE_TYPES.find((type) => type.value === value);
            updatedTable.width = typeInfo.width;
            updatedTable.height = typeInfo.height;
          }
          if (field === "capacite") {
            updatedTable.capacite = Number(value) || 1; // Éviter capacité nulle
          }
          return updatedTable;
        }
        return t;
      })
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100 p-8 gap-8">
      {/* Formulaire */}
      {!showDragZone && (
        <div className="w-[400px]">
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
              className="w-full mt-6 bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700"
            >
              Ajouter
            </button>
          </form>
        </div>
      )}

      {/* Zone Drag & Drop */}
      {showDragZone && (
        <div className="flex-1 flex items-center justify-center relative">
          <div className="relative w-[800px] h-[500px] bg-white border border-gray-300 rounded-2xl shadow-2xl overflow-hidden">
            {tables.map((table) => (
              <div
                key={table.id}
                draggable
                onDragStart={(e) => handleDragStart(table.id, e)}
                onDragEnd={(e) => handleDragEnd(table.id, e)}
                className="absolute cursor-grab active:cursor-grabbing"
                style={{
                  left: table.pos.left,
                  top: table.pos.top,
                  width: table.width,
                  height: table.height,
                  zIndex: table.dragging ? 50 : 10,
                }}
                onDoubleClick={() => handleOpenEdit(table)}
              >
                <div
                  className={`border-4 border-indigo-400 shadow-md flex items-center justify-center ${
                    table.type === "ronde" || table.type === "ovale" ? "rounded-full" : "rounded-md"
                  } w-full h-full bg-pink-200 relative`}
                >
                  <span className="font-bold text-indigo-700">{table.nom}</span>
                  {getChairPositions(table.type, table.capacite, table.width, table.height).map(
                    (pos, i) => (
                      <Chair key={i} number={i + 1} style={pos} />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Modification */}
      {editingTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Modifier {editingTable.nom}</h2>
            <input
              value={editingTable.nom}
              onChange={(e) => handleTableChange(editingTable.id, "nom", e.target.value)}
              className="w-full border rounded px-2 py-1 mb-2"
            />
            <input
              type="number"
              value={editingTable.capacite}
              onChange={(e) => handleTableChange(editingTable.id, "capacite", e.target.value)}
              min="1"
              className="w-full border rounded px-2 py-1 mb-2"
            />
            <select
              value={editingTable.type}
              onChange={(e) => handleTableChange(editingTable.id, "type", e.target.value)}
              className="w-full border rounded px-2 py-1 mb-2"
            >
              {TABLE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={handleCloseEdit}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={handleCloseEdit}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto p-6 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 animate-fade-in animate-slide-up">
        <h2 className="text-2xl font-extrabold text-indigo-700 mb-4 tracking-wide drop-shadow-sm">
          Instructions
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 prose prose-sm">
          <li>Remplissez le formulaire à gauche pour ajouter une table. Une fois créée, vous pouvez la faire glisser dans la zone de droite.</li>
          <li>Double-cliquez sur une table pour modifier son nom, sa capacité ou son type.</li>
          <li>Les chaises sont automatiquement positionnées autour de la table selon sa forme et sa capacité.</li>
          <li>Les tables rondes et ovales ont des chaises disposées en cercle, tandis que les tables rectangulaires et carrées ont des chaises sur les côtés.</li>
          <li>Vous pouvez ajouter plusieurs tables en remplissant le formulaire plusieurs fois.</li>
          <li>Les tables sont initialement positionnées pour éviter les chevauchements, mais vous pouvez les déplacer manuellement si nécessaire.</li>
        </ul>
        <p className="mt-4 text-sm text-gray-500 italic">
          Astuce : utilisez le drag & drop pour ajuster la position des tables et obtenir un plan parfait !
        </p>
      </div>
    </div>
  );
}