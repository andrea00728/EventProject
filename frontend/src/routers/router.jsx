import React from "react";
import DefaultLayout from "../layouts/DefaultLayout";
import { createBrowserRouter, Navigate, Router } from "react-router-dom";
import GuestLayout from "../layouts/GuestLayout";
import Accueil from "../pages/Accueil";
import Evenement from "../pages/Evenement";
import Notfound from "../pages/Notofoundpage";
import Pagepublic from "../pages/Pagepublic";
import Connexionorganisateur from "../pages/Connexionorganisateur";
import Inscription from "../pages/Inscription";
import Connnexiongoogle from "../services/connexiongoogl.jsx";
import Evenemenpage from "../pages/Evenementpage";
import Apropos from "../pages/apropos";
import PublicEvents from "../pages/PublicEvents"; // adapte le chemin si besoin
// import PagePublic from "../pages/PagePublic";
import PageEvenementDetail from "../pages/PageEvenementDetail";

// import Table3DScene from "../components/table3D";
import ChoixModeInvite from "../layouts/ChoixModeInvite";
import Inviteform from "../pages/choixModInvite/inviteForm";
import ImportGuestsCSV from "../pages/choixModInvite/importation";
import AffichageInvite from "../pages/choixModInvite/affichageInvite";
import InviteformWithId from "../pages/choixModInvite/InviteFormparId";
import TableLayout from "../layouts/TableLayout.jsx";
import EventLayout from "../layouts/eventLayout.jsx";
import Listetable from "../pages/TableOrganisation/ListeTable";
import Affichage3dTable from "../pages/TableOrganisation/Affichage3dTable";
import EventPending from "../pages/dashboardEvenement/Eventpadding.jsx";
import EventAccept from "../pages/dashboardEvenement/EventAccepted.jsx";
import PaypalSuccess from "../pages/choixModInvite/PaypalSucces.jsx";
import PersonnelAccueil from "../layouts/personnel/PersonnelAccueil.jsx";
import DashboardpersAccueil from "../pages/PersonnelAccueil/Dashboard.jsx";
import PersonnelCaisse from "../layouts/personnel/Personnelcaissie.jsx";
import DashboardpersCaisse from "../pages/PersonnelCaisse/Dashboard.jsx";
import PersonnelCuisine from "../layouts/personnel/Personnalcuisine.jsx";
import DashboardpersCuisine from "../pages/PersonnelCuisine/Dashboard.jsx";
import ProtectedRoute from "./ProtectedRouter.jsx";
import OrganisationPersonnelLayout from "../layouts/OrganisationPersonnelLayout.jsx";
import CreationPersonnel from "../pages/oranisation_personnel/creation_personnel.jsx";
import DashboardPersonnel from "../pages/oranisation_personnel/Dashboard_personnel.jsx";
import Optionpersonnel from "../pages/oranisation_personnel/confirmationRefus.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import Dashboard from "../pages/Admin/DashBoard.jsx";
import EvenementAd from "../pages/Admin/Evenement.jsx";
import Organisateur from "../pages/Admin/Organisateur.jsx";
import Parametre from "../pages/Admin/Parametre.jsx";
import LocationSalle from "../pages/Admin/LocationSalle.jsx";
 import MyComponent from "../pages/PersonnelCuisine/OrderGateway.jsx";
import MenuListWithCart from "../pages/Menu/MenuListWithCart.jsx";
import SystemPromptManager from "../pages/Admin/SystemPromptManager.jsx";
import MenuForm from "../pages/menu.jsx";
import MenuItemForm from "../pages/menuItem.jsx";
import InvitePage from "../layouts/InvitePage.jsx";
import ForfaitSuccess from "../pages/forfaitpage/forfaitSucces.jsx";
import ForfaitActive from "../pages/forfaitpage/forfaitActive.jsx";
import QrScannerComponent from "../util/QrCode_personnel_Accueil/QrCodeValidation.jsx";
import Envoy from "../pages/PersonnelAccueil/EvoyerVerRout.jsx";
import OrganisationChart from "../pages/oranisation_personnel/OrganisationChart.jsx";
import PersonnelOrganigrammeDashboard from "../pages/oranisation_personnel/Organigramme.jsx";
import InvitationLayout from "../layouts/InvitationLayout.jsx";
import RestaurationPage from "../pages/restauration/RestaurationPage.jsx";
import MenuRestauration from "../pages/restauration/MenuRestauration.jsx";
import RoleSelector from "../pages/RoleSelector.jsx";
import Public_Accueil from "../pages/public_Accueil.jsx";
import Caisse from "../pages/DashbordCaisse/DashboardCaisse.jsx";
import GestionCommandesPage from "../pages/DashbordCaisse/GestionCommandes.jsx";
import PaiementPage from "../pages/DashbordCaisse/PaiementPage.jsx";
import DashboardCard from "../pages/DashbordCaisse/DashboardCaisse.jsx"
import StockPage from "../pages/DashbordCaisse/StockPage.jsx";
import StatistiquesPage from "../pages/DashbordCaisse/StatistiquesPage.jsx";
import RevenuPage from "../pages/DashbordCaisse/RevenuPage.jsx";
import TableToCreateBy_Event from "../pages/TableOrganisation/TableToCreateBy_Event.jsx";


const router=createBrowserRouter([
   
  {
  path: "/",
  element: (
    <ProtectedRoute allowedRoles={["organisateur", "caissier", "cuisinier"]}>
      <DefaultLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: "/",
      element: <Navigate to="/accueil" />
    },
    {
      path: "/accueil",
      element: <Accueil />
    },
    {
      path: "/evenement",
      element: <Evenemenpage />
    },
    {
      path: "/apropos",
      element: <Apropos />
    },
    {
      path: "/evenement/invites",
      element: <ChoixModeInvite />,
      children: [
        {
          path: "creationInv",
          element: <InviteformWithId />
        },
        {
          path: "",
          element: <ImportGuestsCSV />
        },
        {
          path: "affichageInv",
          element: <AffichageInvite />
        }
      ]
    },
    {
      path: "/evenement/invitation",
      element: <InvitationLayout/>,
    },
    
    {
      path: "/evenement/tables",
      element: <TableLayout />,
      children: [
        {
          path: "creationTable",
          element: <TableToCreateBy_Event/>
        },
        {
          path: "",
          element: <Listetable />
        },
        {
          path: "3Dtable",
          element: <Affichage3dTable />
        }
      ]
    },
    {
      path: "/evenement/evenement",
      element: <EventLayout />,
      children: [
        {
          path: "eventpadding",
          element: <EventPending />
        },
        {
          path: "",
          element: <EventAccept />
        }
      ]
    },
    {
      path: "/evenement/personnel",
      element:<OrganisationPersonnelLayout />,
      children: [ 
        {
          path: "createPersonnel",
          element:<CreationPersonnel />
        },
        {
          path: "",
          element: <DashboardPersonnel />
        },
         {
          path: "organigramme",
          element: <PersonnelOrganigrammeDashboard/>
        },
        {
          path:"dashboardCaisse",
          element:<DashboardCard />
        },
      ]
    },
    {
      path:"/evenement/restauration",
      element:<RestaurationPage/>,
      children:[
        {
          path:"",
          element:<MenuRestauration/>
        },
        {
          path:"menuItem",
          element:<MenuItemForm/>
        }
      ]
    },

   
     {
      path:'/forfait/success',
      element:<ForfaitSuccess/>
    },
    {
      path:'/forfaits',
      element:<ForfaitActive/>
    },
  ]
},
// route caissier
{
    path: "/",
    children: [
      {
        path: "/caisse",
        element: < Caisse/>,
      },
      {
        path: "/gestion-commandes",
        element: <GestionCommandesPage />,
      },
      {
        path: "/paiement",
        element: <PaiementPage />,
      },
      {
        path: "/stock",
        element: <StockPage />,
      },
      {
        path: "/statistiques",
        element: <StatistiquesPage />,
      },
      {
          path: "/revenu",
          element: <RevenuPage />,
      }

    ],
  },


    /**
     * rout personnel accueil
     * route pour tout les fonctionalite du personnel accueil
     */
   {
  path: "/",
  element: <PersonnelAccueil />,
  children: [
    {
      path: "/",
      element: <Navigate to="/personnelAccueil" />
    },
    {
      path: "/personnelAccueil",
      element: (
        <ProtectedRoute allowedRoles={["accueil", "caissier", "cuisinier","organisateur"]}>
          <Envoy/>
        </ProtectedRoute>
      )
    },
      {
      path: "/scan",
      element: (
        <ProtectedRoute allowedRoles={["accueil", "caissier", "cuisinier","organisateur"]}>
          <QrScannerComponent />
        </ProtectedRoute>
      )
    }
  ]
},

/**
 * 
 * 
 * Rout pour tout les fonctionnalite du personnel de la caisse
 * 
 * 
 * 
 */
   {
  path: "/",
  element: <PersonnelCaisse />,
  children: [
    {
      path: "/",
      element: <Navigate to="/personnelCaisse" />
    },
    {
      path: "/personnelCaisse",
      element: (
        <ProtectedRoute allowedRoles={["caissier", "organisateur", "accueil","cuisinier"]}>
          <DashboardCard />
        </ProtectedRoute>
      )
    }
  ]
},


/***
 * 
 * 
 * Rout pour tout les fonctionnalite du personnel de la cuisine
 * 
 * 
 * 
 */
  {
    path: "/",
    element: <InvitePage />,
    children: [
      {
        path: "/",
        element: <Navigate to="/invitePage" />,
      },
      {
        path: "/invitePage",
        element: <MenuListWithCart />,
      },
    ],
  },

  /**
   * rout personnel accueil
   */
  {
    path: "/",
    element: <PersonnelAccueil />,
    children: [
      {
        path: "/",
        element: <Navigate to="/personnelAccueil" />,
      },
      {
        path: "/personnelAccueil",
        element: (
          <ProtectedRoute
            allowedRoles={["accueil", "caissier", "cuisinier", "organisateur"]}
          >
            <DashboardpersAccueil />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/",
    element: <PersonnelCaisse />,
    children: [
      {
        path: "/",
        element: <Navigate to="/personnelCaisse" />,
      },
      {
        path: "/personnelCaisse",
        element: (
          <ProtectedRoute
            allowedRoles={["caissier", "organisateur", "accueil", "cuisinier"]}
          >
            <DashboardpersCaisse />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/",
    element: <PersonnelCuisine />,
    children: [
      {
        path: "/",
        element: <Navigate to="/personnelCuisine" />,
      },
      {
        path: "/personnelCuisine",
        element: (
          <ProtectedRoute
            allowedRoles={["cuisinier", "organisateur", "accueil", "caissier"]}
          >
            <DashboardpersCuisine />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/personnel/response",
    element: <Optionpersonnel />,
  },
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/AdminAccueil" />,
      },
      {
        path: "/AdminAccueil",
        element: <Dashboard />,
      },
      {
        path: "/AdminEvenement",
        element: <EvenementAd />,
      },
      {
        path: "/AdminOrganisateur",
        element: <Organisateur />,
      },
      {
        path: "/AdminParametre",
        element: <Parametre />,
      },

      {
        path: "/LocationSalle",
        element: <LocationSalle />,
      },
    ],
  },
  ,
  /************************* Page pour les cuisiniers (poue le test) ************** */
  {
    path: "/Cuisine",
    element: <DashboardpersCuisine />,
  },
  {
    path: "/exemple",
    element: <MyComponent />,
  },
  /*********************************************************** */
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/pagepublic" />,
      },
      {
        path: "/pagepublic",
        // element: <Pagepublic />,
        element:<Public_Accueil/>
      },
      {
        path: "/connexion",
        element: <Connexionorganisateur />,
      },
      {
        path: "/callback",
        element: <Connnexiongoogle />,
      },
      {
        path: "/inscription",
        element: <Inscription />,
      },
      {
      path: "/evenements-publics",
      element: <PublicEvents />,
      },
      {
        path: "/evenement/:slug",
        element: <PageEvenementDetail />,
      },

    ],
  },
  {
    path:"/choix-role",
    element:<RoleSelector/>
  },
  {
    path: "*",
    element: <Notfound />,
  },
  {
    path: "/menuform",
    element: <MenuForm />,
  },
  {
    path: "/menutitemform",
    element: <MenuItemForm />,
  },
  ,
  {
    path: "/systemprompt",
    element: <SystemPromptManager />,
  },
  {
    path: "/menuform",
    element: <MenuForm />,
  },
  {
    path: "/menulist/:slug",
    element: <MenuListWithCart />,
  },
  {
    path: "/menutitemform",
    element: <MenuItemForm />,
  },
]);

export default router;
