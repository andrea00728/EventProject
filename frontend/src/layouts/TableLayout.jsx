import { Link, Outlet } from "react-router-dom";

export default function TableLayout() {
    const choixItems = [
        { path: "creationTable", name: "nouveaux table" },
        { path: "affichageTable", name: "Tale enregistre" },
        { path: "3Dtable", name: "Graphique" },
    ];

    return (
        <div className="flex fixed w-[90%] bg-[#ffffff] h-145"> 
            <aside className="w-64 bg-white text-gray-800 h-145 p-6 flex flex-col shadow-md border-r  border-gray-200">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 border-b border-gray-300 pb-4">
                    Gérer les Tables
                </h2>
                <nav>
                    <ul className="space-y-2"> 
                        {choixItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className="
                                        flex items-center px-4 py-2 text-md rounded-md
                                        text-gray-700 hover:bg-gray-100 hover:text-blue-600
                                        transition-colors duration-200 ease-in-out
                                    "
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main className="flex-1 p-8 bg-[#ffffff] overflow-auto">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}