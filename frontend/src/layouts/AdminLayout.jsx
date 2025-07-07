import React from "react";
import { Outlet, Link } from "react-router-dom";
import { FaGears, FaUsers, FaUser } from "react-icons/fa6";
import {
  MdDashboard,
  MdCalendarToday,
  MdOutlineCalendarMonth,
  MdOutlineCalendarToday,
  MdVerifiedUser,
  MdAttachMoney,
  MdSearch,
} from "react-icons/md";

export default function AdminLayout() {
  const choixItems = [
    { path: "/AdminAccueil", name: "Tableau de bord", icon: <MdDashboard /> },
    { path: "/AdminEvenement", name: "Evénements", icon: <MdCalendarToday /> },
    { path: "/AdminOrganisateur", name: "Organisateurs", icon: <FaUsers /> },
    { path: "/AdminParametre", name: "Paramètres", icon: <FaGears /> },
  ];
  return (
    <>
      <div className="flex justify-between">
        <header className=" text-white bg-indigo-600 w-[20%] h-screen items-start p-6 fixed left-0">
          <h1
            className="text-2xl text-center"
            style={{ fontFamily: "cursive", fontStyle: "italic" }}
          >
            Master Table
          </h1>
          <nav>
            <ul>
              {choixItems.map((value, key) => (
                <li key={key}>
                  <Link
                    to={value.path}
                    className="flex justify-start text-[15px] font-semibold items-center gap-3  text-start mt-6 hover:underline cursor-pointer transition-colors duration-400"
                  >
                    <span>{value.icon}</span> {value.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <div className="w-[80%] px-2 absolute right-0">
          <Outlet />
        </div>
      </div>
    </>
  );
}
