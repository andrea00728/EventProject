import React, { useEffect } from "react";
import { useStateContext } from "../context/ContextProvider";
import { changeStatusService } from "../services/userService";

export default function ChangeStatus() {
  const { token, role } = useStateContext();
  useEffect(() => {
    const changeStatus = async () => {
        const response = await changeStatusService(token);
        console.log("Status changed:", response);
    }

    if (token && role === "organisateur") {
        changeStatus();
    }
  }, [token, role]);

  return null;
}
