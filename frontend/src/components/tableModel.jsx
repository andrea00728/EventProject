// import React from "react";
// import { Text } from "@react-three/drei"; // Prérequis : installer drei via npm/yarn

// export default function TableModel({ position, capacite, reserved, numero }) {
//   const isCircular = capacite <= 5;

//   const tableLegHeight = 0.6;
//   const tableLegRadius = 0.07;
//   const chairLegHeight = 0.3;
//   const chairLegRadius = 0.03;

//   return (
//     <group position={position}>
//       {/* Numéro de la table au-dessus */}
//       <Text
//         position={[0, 1, 0]}
//         fontSize={0.5}
//         color="black"
//         anchorX="center"
//         anchorY="middle"
//         outlineWidth={0.01}
//         outlineColor="black"
//       >
//         Table {numero}
//       </Text>

//       {/* Table */}
//       <mesh position={[0, 0.15, 0]}>
//         {isCircular ? (
//           <cylinderGeometry args={[1.2, 1.2, 0.3, 64]} />
//         ) : (
//           <boxGeometry args={[2.5, 0.3, 1.2]} />
//         )}
//         <meshStandardMaterial color="#8b5cf6" />
//       </mesh>

//       {/* Pieds de la table */}
//       {isCircular ? (
//         [...Array(4)].map((_, i) => {
//           const angle = (i / 4) * Math.PI * 2;
//           const x = Math.cos(angle) * 0.9;
//           const z = Math.sin(angle) * 0.9;
//           return (
//             <mesh key={i} position={[x, -tableLegHeight / 2, z]}>
//               <cylinderGeometry args={[tableLegRadius, tableLegRadius, tableLegHeight, 16]} />
//               <meshStandardMaterial color="#333" />
//             </mesh>
//           );
//         })
//       ) : (
//         [[1.1, -tableLegHeight / 2, 0.5], [1.1, -tableLegHeight / 2, -0.5], [-1.1, -tableLegHeight / 2, 0.5], [-1.1, -tableLegHeight / 2, -0.5]].map(
//           (pos, i) => (
//             <mesh key={i} position={pos}>
//               <cylinderGeometry args={[tableLegRadius, tableLegRadius, tableLegHeight, 16]} />
//               <meshStandardMaterial color="#333" />
//             </mesh>
//           )
//         )
//       )}

//       {/* Chaises */}
//       {[...Array(capacite)].map((_, i) => {
//         const angle = (i / capacite) * Math.PI * 2;
//         const radius = isCircular ? 1.8 : 2.5;
//         const x = Math.cos(angle) * radius;
//         const z = Math.sin(angle) * radius;

//         // Position du texte devant la chaise (décalage vers l'extérieur)
//         const textX = Math.cos(angle) * (radius + 0.4);
//         const textZ = Math.sin(angle) * (radius + 0.4);

//         return (
//           <group key={i} position={[x, 0.15, z]}>
//             {/* Assise de la chaise */}
//             <mesh>
//               <cylinderGeometry args={[0.25, 0.25, 0.35, 32]} />
//               <meshStandardMaterial color={i < reserved ? "red" : "green"} />
//             </mesh>

//             {/* Pieds de la chaise */}
//             {[[-0.15, -chairLegHeight / 2, -0.15], [0.15, -chairLegHeight / 2, -0.15], [-0.15, -chairLegHeight / 2, 0.15], [0.15, -chairLegHeight / 2, 0.15]].map(
//               (pos, idx) => (
//                 <mesh key={idx} position={pos}>
//                   <cylinderGeometry args={[chairLegRadius, chairLegRadius, chairLegHeight, 12]} />
//                   <meshStandardMaterial color="#333" />
//                 </mesh>
//               )
//             )}

//             {/* Numéro de la place */}
//             <Text
//               position={[textX - x, 0.6, textZ - z]} // position relative au groupe
//               fontSize={0.3}
//               color="black"
//               anchorX="center"
//               anchorY="middle"
//               outlineWidth={0.005}
//               outlineColor="white"
//             >
//               {i + 1}
//             </Text>
//           </group>
//         );
//       })}
//     </group>
//   );
// }


import React from "react";
import { Text } from "@react-three/drei";

export default function TableModel({ position, capacite, reserved, numero, type }) {
  const tableLegHeight = 0.6;
  const tableLegRadius = 0.07;
  const chairLegHeight = 0.3;
  const chairLegRadius = 0.03;

  const renderTableGeometry = () => {
    switch (type) {
      case "ronde":
        return <cylinderGeometry args={[1.2, 1.2, 0.3, 64]} />;
      case "carree":
        return <boxGeometry args={[1.8, 0.3, 1.8]} />;
      case "rectangle":
        return <boxGeometry args={[2.5, 0.3, 1.2]} />;
      case "ovale":
        return <cylinderGeometry args={[2, 1.2, 0.3, 64]} />;
      default:
        return <boxGeometry args={[2.5, 0.3, 1.2]} />;
    }
  };

  const renderTableLegs = () => {
    if (type === "ronde" || type === "ovale") {
      return [...Array(4)].map((_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * 0.9;
        const z = Math.sin(angle) * 0.9;
        return (
          <mesh key={i} position={[x, -tableLegHeight / 2, z]}>
            <cylinderGeometry args={[tableLegRadius, tableLegRadius, tableLegHeight, 16]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        );
      });
    } else {
      const legPositions = [
        [1.1, -tableLegHeight / 2, 0.5],
        [1.1, -tableLegHeight / 2, -0.5],
        [-1.1, -tableLegHeight / 2, 0.5],
        [-1.1, -tableLegHeight / 2, -0.5]
      ];
      return legPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[tableLegRadius, tableLegRadius, tableLegHeight, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ));
    }
  };

  const chairRadius = type === "ronde" || type === "ovale" ? 1.8 : 2.5;

  return (
    <group position={position}>
      {/* Numéro de table */}
      <Text
        position={[0, 1, 0]}
        fontSize={0.5}
        color="black"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="black"
      >
        Table {numero}
      </Text>

      {/* Plateau de la table */}
      <mesh position={[0, 0.15, 0]}>
        {renderTableGeometry()}
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>

      {/* Pieds de la table */}
      {renderTableLegs()}

      {/* Chaises */}
      {[...Array(capacite)].map((_, i) => {
        const angle = (i / capacite) * Math.PI * 2;
        const x = Math.cos(angle) * chairRadius;
        const z = Math.sin(angle) * chairRadius;

        const textX = Math.cos(angle) * (chairRadius + 0.4);
        const textZ = Math.sin(angle) * (chairRadius + 0.4);

        return (
          <group key={i} position={[x, 0.15, z]}>
            {/* Assise */}
            <mesh>
              <cylinderGeometry args={[0.25, 0.25, 0.35, 32]} />
              <meshStandardMaterial color={i < reserved ? "red" : "green"} />
            </mesh>

            {/* Pieds */}
            {[[-0.15, -chairLegHeight / 2, -0.15], [0.15, -chairLegHeight / 2, -0.15], [-0.15, -chairLegHeight / 2, 0.15], [0.15, -chairLegHeight / 2, 0.15]].map(
              (pos, idx) => (
                <mesh key={idx} position={pos}>
                  <cylinderGeometry args={[chairLegRadius, chairLegRadius, chairLegHeight, 12]} />
                  <meshStandardMaterial color="#333" />
                </mesh>
              )
            )}

            {/* Numéro de la chaise */}
            <Text
              position={[textX - x, 0.6, textZ - z]}
              fontSize={0.3}
              color="black"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.005}
              outlineColor="white"
            >
              {i + 1}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
