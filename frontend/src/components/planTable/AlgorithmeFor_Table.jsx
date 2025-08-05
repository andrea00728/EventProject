/**
 * Returns an array of positions for seating around a table based on its shape and capacity.
 *
 * @param {string} type - The type of table (e.g., "ronde", "ovale", "rectangle").
 * @param {number} capacity - The number of seats available around the table.
 * @returns {Array} - An array of position objects, each containing 'left', 'top', and optionally 'transform' properties.
 *                    The positions are calculated according to the table's shape and capacity.
 */

export default function getPlacePositions(type, capacity) {
  const positions = [];

  if (type === "ronde" || type === "ovale") {
    const radius = 45;
    for (let i = 0; i < capacity; i++) {
      const angle = (2 * Math.PI * i) / capacity;
      const x = 40 + radius * Math.cos(angle);
      const y = 40 + radius * Math.sin(angle);
      positions.push({
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
      });
    }

  } else if (type === "rectangle") {
    const spacing = 20;
    let count = 0;
    if (count < capacity) {
      positions.push({ top: "30px", left: "-25px" });
      count++;
    }
    if (count < capacity) {
      positions.push({ top: "30px", left: "85px" });
      count++;
    }
    const remaining = capacity - count;
    const half = Math.ceil(remaining / 2);

    for (let i = 0; i < half && count < capacity; i++, count++) {
      positions.push({ top: "-5px", left: `${ i * spacing}px` });
    }

    for (let i = 0; i < remaining - half && count < capacity; i++, count++) {
      positions.push({ top: "65px", left: `${60 - i * spacing}px` });
    }

  } else {
  const spacing = 20;
let count = 0;

// Déterminer combien de places par côté
const basePerSide = Math.floor(capacity / 4);
const extraSeats = capacity % 4; // reste à répartir
// Tableau contenant le nombre de places par côté
const sides = [basePerSide, basePerSide, basePerSide, basePerSide];
for (let i = 0; i < extraSeats; i++) {
  sides[i]++; // répartir le reste équitablement sur les premiers côtés
}
// Positions pour les 4 côtés (haut, droite, bas, gauche)
const startLeft = 20;
const startTop = 20;

// Haut (gauche → droite)
for (let i = 0; i < sides[0]; i++, count++) {
  positions.push({ top: "-10px", left: `${startLeft + i * spacing}px` });
}

// Droite (haut → bas)
for (let i = 0; i < sides[1]; i++, count++) {
  positions.push({ top: `${startTop + i * spacing}px`, left: "70px" });
}

// Bas (droite → gauche)
for (let i = 0; i < sides[2]; i++, count++) {
  positions.push({ top: "70px", left: `${37 - i * spacing}px` });
}

// Gauche (bas → haut)
for (let i = 0; i < sides[3]; i++, count++) {
  positions.push({ top: `${40 - i * spacing}px`, left: "-10px" });
}

  }
  return positions;
}




