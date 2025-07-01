import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TableModel from "./TableModel";

export default function Table3DScene({ tables, eventId }) {
  if (!eventId) return <p>Aucun événement fourni.</p>;

 
  const rows = 4;
  const spacingX = 7;
  const spacingZ = 8;
  const cols = Math.ceil(tables.length / rows);

  const tablePositions = tables.map((_, i) => {
    const row = i % rows;
    const col = Math.floor(i / rows);
    const x = col * spacingX - ((cols - 0) * spacingX) / 2;
    const z = row * spacingZ - ((rows - 1) * spacingZ) / 2;
    return [x, 1, z];
  });

  const sceneWidth = cols * spacingX + spacingX; 
  const sceneDepth = rows * spacingZ + spacingZ; 
  const wallHeight = 1;

  return (
    <>
      <h2>Tables pour l'événement {eventId}</h2>
      <div className="w-[35cm] h-[500px] ">
        <Canvas camera={{ position: [80, 40, 1], fov: 20 }}>
          {/* Lumières */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 40, 50]} />

          {/* Contrôles caméra */}
          <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

          {/* Sol */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <planeGeometry args={[sceneWidth, sceneDepth]} />
            <meshStandardMaterial color="#FFE3BB" />
          </mesh>

          {/* /* Mur arrière */}
          <mesh position={[0, wallHeight / 2, -sceneDepth / 2]}>
            <boxGeometry args={[sceneWidth, wallHeight, 0.5]} />
            <meshStandardMaterial color="#EAA64D" />
          </mesh> 

          {/* {/* Mur gauche */}
          <mesh position={[-sceneWidth / 2, wallHeight / 2, 0]}>
            <boxGeometry args={[0.5, wallHeight, sceneDepth]} />
            <meshStandardMaterial color="#EAA64D" />
          </mesh> 

          {/* Mur droit */}
          <mesh position={[sceneWidth / 2, wallHeight / 2, 0]}>
            <boxGeometry args={[0.5, wallHeight, sceneDepth]} />
            <meshStandardMaterial color="#EAA64D" />
          </mesh>

          {/* Tables */}
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
