import { useStateContext } from "../../context/ContextProvider";
import { Link, Navigate, Outlet } from "react-router-dom";
import Sidebar from "../../pages/PersonnelAccueil/Dashboard";
import Profil_Accueil from "../../util/profilAccueil";
import LogoutButton from "../../util/DeconnexionGoogle";

export default function PersonnelAccueil() {
  const { isAuthenticated, role } = useStateContext();
  if (!isAuthenticated) {
    return <Navigate to="/pagepublic" replace />;
  }

  switch (role) {
    case "accueil":
      // Reste sur cette page
      break;
    case "organisateur":
      return <Navigate to="/accueil" replace />;
    case "caissier":
      return <Navigate to="/personnelCaisse" replace />;
    case "cuisinier":
      return <Navigate to="/personnelCuisine" replace />;
    default:
      return <Navigate to="/pagepublic" replace />;
  }
  const dashboard=[
    {path:'/personnelAccueil',name:'Dashboard'}
  ];

  const navItems=[
    {path:'/scan' ,name:'Scan QrCode'},
    {path:'historique',name:'Historique'}
  ];


  return (
    <>
     <div className="flex">
        <aside className="ml-[-100%] fixed z-10 top-0 pb-3 px-6 w-full flex flex-col justify-between h-screen border-r bg-white transition duration-300 md:w-4/12 lg:ml-0 lg:w-[25%] xl:w-[20%] 2xl:w-[15%]">
      <div>
        <div className="-mx-6 px-6 py-4">
          <a href="#" title="home">
            <img
              src="https://tailus.io/sources/blocks/stats-cards/preview/images/logo.svg"
              className="w-32"
              alt="tailus logo"
            />
          </a>
        </div>

        <Profil_Accueil/>
        <nav className="space-y-2 tracking-wide mt-8">
            {dashboard.map((items)=>(
                <Link key={items.path} to={items.path}
              href="#"
              aria-label="dashboard"
              className="relative px-4 py-3 flex items-center space-x-4 rounded-xl text-white bg-gradient-to-r from-sky-600 to-cyan-400"
            >
              <svg className="-ml-1 h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                  className="fill-current text-cyan-400 dark:fill-slate-600"
                />
                <path
                  d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                  className="fill-current text-cyan-200 group-hover:text-cyan-300"
                />
                <path
                  d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                  className="fill-current group-hover:text-sky-300"
                />
              </svg>
              <span className="-mr-1 font-medium">{items.name}</span>
            </Link>
            ))}
        </nav>
        <nav>
          {navItems.map((items)=>(
              <Link key={items.path} to={items.path} className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group">
              <span className="group-hover:text-gray-700">{items.name}</span>
            </Link>
          ))}
          </nav>
      </div>

      <div className="px-6 -mx-6 pt-4 flex justify-between items-center border-t">
        <LogoutButton/>
      </div>
    </aside>
      <div className="ml-auto mb-6 lg:w-[75%] xl:w-[80%] 2xl:w-[85%]">
        {/* <Header /> */}
        <div className="px-6 pt-6 2xl:container">
          <div >
            <div >
              <Outlet/>
            </div>
           
          </div>
        </div>
      </div>
    </div>
    </>
  );
};