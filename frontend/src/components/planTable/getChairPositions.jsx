// Calcule les positions des chaises autour de la table en fonction de son type et de sa capacité
function getChairPositions(type, capacity, tableWidth, tableHeight, rotation, zoomLevel) {
  const positions = [];
  const chairSize = 30;
  const minDistanceFromTable = 0;

  if (type === "triangle") {
    // Centre de la table
    const centerX = tableWidth / 2;
    const centerY = tableHeight / 2;
    // Points d'un triangle équilatéral (orienté vers le haut)
    const trianglePoints = [
      { x: centerX, y: centerY - (tableHeight / 2) * 0.866 }, // Sommet haut
      { x: centerX - tableWidth / 2, y: centerY + (tableHeight / 2) * 0.866 }, // Coin bas gauche
      { x: centerX + tableWidth / 2, y: centerY + (tableHeight / 2) * 0.866 }, // Coin bas droit
    ];
    // Répartir les chaises sur les 3 côtés
    const chairsPerSide = Math.ceil(capacity / 3);
    let chairIndex = 0;
    for (let side = 0; side < 3 && chairIndex < capacity; side++) {
      const point1 = trianglePoints[side];
      const point2 = trianglePoints[(side + 1) % 3];
      const chairsOnThisSide = Math.min(chairsPerSide, capacity - chairIndex);
      for (let i = 0; i < chairsOnThisSide; i++) {
        const ratio = (i + 1) / (chairsOnThisSide + 1);
        let x = point1.x + (point2.x - point1.x) * ratio;
        let y = point1.y + (point2.y - point1.y) * ratio;
        // Calculer la normale vers l'extérieur
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const normalX = -dy;
        const normalY = dx;
        const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
        const offsetDistance = chairSize / 2 + minDistanceFromTable + 10;
        const offsetX = (normalX / normalLength) * offsetDistance;
        const offsetY = (normalY / normalLength) * offsetDistance;
        // Appliquer la rotation de la table
        const angleRad = (rotation * Math.PI) / 180;
        const rotatedX = centerX + (x - centerX) * Math.cos(angleRad) - (y - centerY) * Math.sin(angleRad);
        const rotatedY = centerY + (x - centerX) * Math.sin(angleRad) + (y - centerY) * Math.cos(angleRad);
        positions.push({
          left: `calc(${rotatedX + offsetX - chairSize / 2}px * ${zoomLevel})`,
          top: `calc(${rotatedY + offsetY - chairSize / 2}px * ${zoomLevel})`,
          rotation: rotation, // Rotation de la chaise alignée avec la table
        });
        chairIndex++;
      }
    }
  } else {
    // Logique pour les autres formes (non modifiée)
    if (type === "ronde" || type === "ovale") {
      const centerX = tableWidth / 2;
      const centerY = tableHeight / 2;
      const tableRadius = type === "ronde"
        ? Math.min(tableWidth, tableHeight) / 2
        : Math.max(tableWidth, tableHeight) / 2;
      const radius = tableRadius + minDistanceFromTable + chairSize / 2;
      for (let i = 0; i < capacity; i++) {
        const angle = (2 * Math.PI * i) / capacity - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle) - chairSize / 2;
        const y = centerY + radius * Math.sin(angle) - chairSize / 2;
        positions.push({ left: `${x}px`, top: `${y}px` });
      }
    } else {
      const perimetre = 2 * (tableWidth + tableHeight);
      const spacingBetweenChairs = perimetre / capacity;
      const topChairs = Math.round((tableWidth / spacingBetweenChairs));
      const rightChairs = Math.round((tableHeight / spacingBetweenChairs));
      const bottomChairs = Math.round((tableWidth / spacingBetweenChairs));
      const leftChairs = capacity - topChairs - rightChairs - bottomChairs;
      let count = 0;
      if (topChairs > 0) {
        const spacing = tableWidth / (topChairs + 1);
        for (let i = 0; i < topChairs && count < capacity; i++, count++) {
          positions.push({
            left: `${(i + 1) * spacing - chairSize / 2}px`,
            top: `${-minDistanceFromTable - chairSize}px`
          });
        }
      }
      if (rightChairs > 0) {
        const spacing = tableHeight / (rightChairs + 1);
        for (let i = 0; i < rightChairs && count < capacity; i++, count++) {
          positions.push({
            left: `${tableWidth + minDistanceFromTable}px`,
            top: `${(i + 1) * spacing - chairSize / 2}px`,
          });
        }
      }
      if (bottomChairs > 0) {
        const spacing = tableWidth / (bottomChairs + 1);
        for (let i = 0; i < bottomChairs && count < capacity; i++, count++) {
          positions.push({
            left: `${tableWidth - (i + 1) * spacing - chairSize / 2}px`,
            top: `${tableHeight + minDistanceFromTable}px`,
          });
        }
      }
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
  }
  return positions;
}

export default getChairPositions