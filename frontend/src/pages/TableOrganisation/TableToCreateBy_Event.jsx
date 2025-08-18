import { useState } from "react";
import { createTable } from "../../services/tableService";
import Tablecreation from "./Tablecreation";
import { useStateContext } from "../../context/ContextProvider";

export default function TableToCreateBy_Event() {
    const [tables,setTables]=useState([]);
    const{token}=useStateContext();
    const handleCreateTable =async (formDataArray) =>{
        try{
            const tables=[];
            for(const formData of formDataArray){
                const table =await createTable({...formData},token);
                tables.push(table);
            }
            setTables((prev)=>[...prev,...tables]);
        }catch(err){
            console.log(err);
        }
    }
    return (
        <>
        <Tablecreation onSubmitTable={handleCreateTable}/>
        </>
    );
}