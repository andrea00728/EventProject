import React from "react";

export default function Walls() {
  const wallHeight = 3;
  const wallThickness = 0.1;
  const roomSize = 30;

  return (
    <group>
      {/* Mur avant */}
      <mesh position={[0, wallHeight / 2, -roomSize / 2]}>
        <boxGeometry args={[roomSize, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      {/* Mur arrière */}
      <mesh position={[0, wallHeight / 2, roomSize / 2]}>
        <boxGeometry args={[roomSize, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      {/* Mur gauche */}
      <mesh position={[-roomSize / 2, wallHeight / 2, 0]}>
        <boxGeometry args={[wallThickness, wallHeight, roomSize]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      {/* Mur droit */}
      <mesh position={[roomSize / 2, wallHeight / 2, 0]}>
        <boxGeometry args={[wallThickness, wallHeight, roomSize]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial color="#aaa" />
      </mesh>
    </group>
  );
}
