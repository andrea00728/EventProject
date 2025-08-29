// import { useState } from "react";
// import { createTable } from "../../services/tableService";
// import Tablecreation from "./Tablecreation";
// import { useStateContext } from "../../context/ContextProvider";

// export default function TableToCreateBy_Event() {
//     const [tables,setTables]=useState([]);
//     const{isAuthenticated}=useStateContext();
//     const handleCreateTable =async (formDataArray) =>{
//         try{
//             const tables=[];
//             for(const formData of formDataArray){
//                 const table =await createTable({...formData},isAuthenticated);
//                 tables.push(table);
//             }
//             setTables((prev)=>[...prev,...tables]);
//         }catch(err){
//             console.log(err);
//         }
//     }
//     return (
//         <>
//         <Tablecreation onSubmitTable={handleCreateTable}/>
//         </>
//     );
// }

import { useState } from "react";
import { createTable } from "../../services/tableService";
import Tablecreation from "./Tablecreation";
import { useStateContext } from "../../context/ContextProvider";

export default function TableToCreateBy_Event() {
    const [tables, setTables] = useState([]);
    const { isAuthenticated } = useStateContext();

    const handleCreateTable = async (formDataArray) => {
        try {
            // Créer un tableau de promesses pour la création de chaque table
            const creationPromises = formDataArray.map(formData => 
                createTable({ ...formData }, isAuthenticated)
            );

            // Attendre que toutes les promesses soient résolues
            const newTables = await Promise.all(creationPromises);
            
            // Mettre à jour l'état du composant une seule fois
            setTables(prev => [...prev, ...newTables]);

        } catch (err) {
            console.error("Erreur lors de la création des tables:", err); 
        }
    };

    return (
        <>
            <Tablecreation onSubmitTable={handleCreateTable} />
        </>
    );
}