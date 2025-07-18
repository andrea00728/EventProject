import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Utensils,
  Users,
  LayoutDashboard
} from "lucide-react";

const RestaurationPage = () => {
  const { pathname } = useLocation();

  // Liste des sous-routes relatives à "/evenement/restauration"
  const choixItems = [
    { path: "", name: "Dashboard Personnel", icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: "createPersonnel", name: "Créer un Personnel", icon: <Users className="w-5 h-5" /> },
    { path: "menu", name: "Gestion des Menus", icon: <Utensils className="w-5 h-5" /> }
  ];

  // Fonction pour définir le style actif
  const linkClass = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
      pathname === `/evenement/restauration/${path}` ||
      (path === "" && pathname === "/evenement/restauration")
        ? "bg-blue-200 font-bold text-blue-800"
        : "hover:bg-blue-100 text-gray-700"
    }`;

  return (
    <div className="flex fixed w-[90%] bg-[#ffffff] h-145">
      <aside className="w-64 bg-white shadow h-screen p-4 border-r border-gray-200">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6" />
          Restauration
        </h2>
        <nav className="space-y-2">
          {choixItems.map(({ path, name, icon }) => (
            <Link key={path} to={path} className={linkClass(path)}>
              {icon}
              {name}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8 bg-[#ffffff] overflow-auto">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RestaurationPage;
