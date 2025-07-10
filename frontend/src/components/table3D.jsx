// import React from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, Loader } from "@react-three/drei";
// import TableModel from "../components/tableModel";

// export default function Table3DScene({ tables, eventId }) {
//   if (!eventId) return <p className="text-red-600 text-center font-medium">Aucun événement fourni.</p>;

//   const rows = 4;
//   const spacingX = 7;
//   const spacingZ = 8;
//   const cols = Math.ceil(tables.length / rows);

//   const tablePositions = tables.map((_, i) => {
//     const row = i % rows;
//     const col = Math.floor(i / rows);
//     const x = col * spacingX - ((cols - 0) * spacingX) / 2;
//     const z = row * spacingZ - ((rows - 1) * spacingZ) / 2;
//     return [x, 1, z];
//   });

//   const sceneWidth = cols * spacingX + spacingX;
//   const sceneDepth = rows * spacingZ + spacingZ;
//   const wallHeight = 1;

//   return (
//     <div className="w-[20cm] max-w-6xl mx-auto my-8">
//       {/* <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center shadow-sm bg-gray-50 p-4 rounded-lg">
//         Tables pour l'événement {eventId}
//       </h2> */}
//       <div className="w-full h-[600px] bg-gray-100 rounded-xl overflow-hidden shadow-lg border border-gray-200">
//         <Canvas camera={{ position: [100, 90, 300], fov: 40 }}>
//           {/* Lumières améliorées */}
//           <ambientLight intensity={0.8} />
//           <directionalLight position={[10, 50, 20]} intensity={1.5} castShadow />
//           <pointLight position={[0, 10, 0]} intensity={0.5} />

//           {/* Contrôles caméra optimisés */}
//           <OrbitControls
//             enableRotate={true}
//             enablePan={true}
//             enableZoom={true}
//             minDistance={20}
//             maxDistance={100}
//           />

//           {/* Sol avec texture */}
//           <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
//             <planeGeometry args={[sceneWidth, sceneDepth]} />
//             <meshStandardMaterial color="#D4A373" roughness={0.7} />
//           </mesh>

//           {/* Mur arrière */}
//           <mesh position={[0, wallHeight / 2, -sceneDepth / 2]} castShadow receiveShadow>
//             <boxGeometry args={[sceneWidth, wallHeight, 0.5]} />
//             <meshStandardMaterial color="#EAA64D" roughness={0.5} />
//           </mesh>

//           {/* Mur gauche */}
//           <mesh position={[-sceneWidth / 2, wallHeight / 2, 0]} castShadow receiveShadow>
//             <boxGeometry args={[0.5, wallHeight, sceneDepth]} />
//             <meshStandardMaterial color="#EAA64D" roughness={0.5} />
//           </mesh>

//           {/* Mur droit */}
//           <mesh position={[sceneWidth / 2, wallHeight / 2, 0]} castShadow receiveShadow>
//             <boxGeometry args={[0.5, wallHeight, sceneDepth]} />
//             <meshStandardMaterial color="#EAA64D" roughness={0.5} />
//           </mesh>

//           {/* Tables */}
//           {tables.map((table, i) => (
//             <TableModel
//               key={table.id}
//               position={tablePositions[i]}
//               capacite={table.capacite}
//               reserved={table.capacite - table.available}
//               numero={table.numero}
//               type={table.type}
//             />
//           ))}
//         </Canvas>
//         <Loader />
//       </div>
//     </div>
//   );
// }