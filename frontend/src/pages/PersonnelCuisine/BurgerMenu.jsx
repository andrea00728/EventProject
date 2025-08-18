import React from "react";
import { MdMenu, MdClose } from "react-icons/md";

const BurgerMenu = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="text-gray-800 focus:outline-none"
    >
      {sidebarOpen ? (
        <MdClose className="text-3xl" />
      ) : (
        <MdMenu className="text-3xl" />
      )}
    </button>
  );
};

export default BurgerMenu;