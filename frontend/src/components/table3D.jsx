import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TableModel from "./TableModel";

export default function Table3DScene({ tables, eventId }) {
  if (!eventId) {
    return <p>Aucun événement fourni.</p>;
  }

  // 🔄 Calcul des positions avec 3 rangées
  const rows = 3;
  const spacingX = 8; // Espace horizontal entre colonnes
  const spacingZ = 6; // Espace vertical entre rangées
  const cols = Math.ceil(tables.length / rows);

  const tablePositions = tables.map((_, i) => {
    const row = i % rows; // 0, 1, 2
    const col = Math.floor(i / rows);
    const x = col * spacingX - ((cols - 1) * spacingX) / 2; // Centrer horizontalement
    const z = row * spacingZ - ((rows - 1) * spacingZ) / 2; // Centrer verticalement
    return [x, 0, z];
  });

  const sceneWidth = cols * spacingX + spacingX;
  const sceneDepth = rows * spacingZ + spacingZ;
  const wallHeight = 5; 

  return (
    <>
      <h2>Tables pour l'événement {eventId}</h2>
      <div className="w-[35cm] h-[500px]">
        <Canvas camera={{ position: [0, 5, 15], fov: 20 }}> 
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} />
          <OrbitControls
          
           enableRotate={false}
    enablePan={false}
    enableZoom={true}
          />

          {/* Floor */}
          <mesh rotation={[-Math.PI / 2,0,0]} position={[2, -0.1, 0]}>
            <planeGeometry args={[sceneWidth, sceneDepth]} />
            <meshStandardMaterial color="#FFE3BB" /> {/* Light beige/cream floor */}
          </mesh>

          {/* Back Wall */}
          <mesh position={[0, wallHeight / 1, -sceneDepth / 1]}>
            <boxGeometry args={[sceneWidth, wallHeight, 0.5]} />
            <meshStandardMaterial color="#EAA64D" /> {/* Darker wall color for contrast */}
          </mesh>

          {/* Left Wall */}
          <mesh position={[-sceneWidth / 1, wallHeight / 1, 0]}>
            <boxGeometry args={[0, wallHeight, sceneDepth]} />
            <meshStandardMaterial color="#303030" />
          </mesh>

          {/* Right Wall */}
          <mesh position={[sceneWidth / 1, wallHeight / 1, 0]}>
            <boxGeometry args={[0.0, wallHeight, sceneDepth]} />
            <meshStandardMaterial color="#303030" />
          </mesh>

          {tables.map((table, i) => (
            <TableModel
              key={table.id}
              position={tablePositions[i]}
              capacite={table.capacite}
              reserved={table.capacite - table.available}
              numero={table.numero}
            />
          ))}
        </Canvas>
      </div>
    </>
  );
}