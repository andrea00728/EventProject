
import { createBrowserRouter, Navigate, Router } from "react-router-dom";
import GuestLayout from "../layouts/GuestLayout";
import Notfound from "../pages/Notofoundpage";
import Connexionorganisateur from "../pages/Connexionorganisateur";
import Inscription from "../pages/Inscription";
import Connnexiongoogle from "../services/connexiongoogl.jsx";
import Evenemenpage from "../pages/Evenementpage.jsx"; 
import Apropos from "../pages/apropos";
import PublicEvents from "../pages/PublicEvents"; // adapte le chemin si besoin
import PageEvenementDetail from "../pages/PageEvenementDetail";
import ChoixModeInvite from "../layouts/ChoixModeInvite";
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
import MenuListWithCart from "../pages/Menu/MenuListWithCart.jsx";
import MenuForm from "../pages/menu.jsx";
import MenuItemForm from "../pages/menuItem.jsx";
import InvitePage from "../layouts/InvitePage.jsx";
import ForfaitSuccess from "../pages/forfaitpage/forfaitSucces.jsx";
import ForfaitActive from "../pages/forfaitpage/forfaitActive.jsx";
import QrScannerComponent from "../util/QrCode_personnel_Accueil/QrCodeValidation.jsx";
import Envoy from "../pages/PersonnelAccueil/EvoyerVerRout.jsx";
import PersonnelOrganigrammeDashboard from "../pages/oranisation_personnel/Organigramme.jsx";
import InvitationLayout from "../layouts/InvitationLayout.jsx";
import RestaurationPage from "../pages/restauration/RestaurationPage.jsx";
import MenuRestauration from "../pages/restauration/MenuRestauration.jsx";
import RoleSelector from "../pages/RoleSelector.jsx";
import Caisse from "../pages/DashbordCaisse/DashboardCaisse.jsx";
import GestionCommandesPage from "../pages/DashbordCaisse/GestionCommandes.jsx";
import PaiementPage from "../pages/DashbordCaisse/PaiementPage.jsx";
import DashboardCard from "../pages/DashbordCaisse/DashboardCaisse.jsx";
import StockPage from "../pages/DashbordCaisse/StockPage.jsx";
import StatistiquesPage from "../pages/DashbordCaisse/StatistiquesPage.jsx";
import RevenuPage from "../pages/DashbordCaisse/RevenuPage.jsx";
import ActivityHistory from "../pages/Admin/Historique.jsx";
import Statique from "../pages/Admin/statistique.jsx";
import TableToCreateBy_Event from "../pages/TableOrganisation/TableToCreateBy_Event.jsx";
import LoginPage from "../pages/Admin/LoginPage.jsx";
// import UserStats from "../pages/Admin/cards.jsx";
import Tablecreation from "../pages/TableOrganisation/Tablecreation.jsx";
import Publicacc from "../pages/Merge.jsx";
import PublicLayout from "../layouts/PublicLayout.jsx";
import EventProtectLayout from "../layouts/eventProtectLayout.jsx";
import AdminManagementPage from "../pages/Admin/AdminManagmentTable.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      // {
      //   path: "/",
      //   element: <Navigate to="/pagepublic" />,
      // },
      {
        path: "/",
        element: <Publicacc />,
      },
      // {
      //   path: "/accueil",
      //   element: <Accueil />,
      // },
      {
        path: "/apropos",
        element: <Apropos />,
      },
      {
        path: "/evenement",
        element: (
          <ProtectedRoute allowedRoles={["organisateur"]}>
            <EventProtectLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "",
            element: <Evenemenpage />,
          },
          {
            path: "personnel",
            element: <OrganisationPersonnelLayout />,
            children: [
              {
                path: "createPersonnel",
                element: <CreationPersonnel />,
              },
              {
                path: "",
                element: <DashboardPersonnel />,
              },
            ],
          },
          {
            path: "restauration",
            element: <MenuForm />,
            // children: [
            //   {
            //     path: "createPersonnel",
            //     element: <CreationPersonnel />,
            //   },
            //   {
            //     path: "",
            //     element: <DashboardPersonnel />,
            //   },
            // ],
          },
          {
            path: "tables",
            element: <TableLayout />,
            children: [
              {
                path: "creationTable",
                element: <Tablecreation />,
              },
              {
                path: "",
                element: <Listetable />,
              },
              {
                path: "3Dtable",
                element: <Affichage3dTable />,
              },
            ],
          },
          {
            path: "invites",
            element: <ChoixModeInvite />,
            children: [
              {
                path: "creationInv",
                element: <InviteformWithId />,
              },
              {
                path: "",
                element: <ImportGuestsCSV />,
              },
              {
                path: "affichageInv",
                element: <AffichageInvite />,
              },
            ],
          },
          {
            path: "invitation",
            element: <InvitationLayout />,
          },
          {
            path: "tables",
            element: <TableLayout />,
            children: [
              {
                path: "creationTable",
                element: <TableToCreateBy_Event />,
              },
              {
                path: "",
                element: <Listetable />,
              },
              {
                path: "3Dtable",
                element: <Affichage3dTable />,
              },
            ],
          },
          {
            path: "evenement",
            element: <EventLayout />,
            children: [
              {
                path: "eventpadding",
                element: <EventPending />,
              },
              {
                path: "",
                element: <EventAccept />,
              },
            ],
          },
          {
            path: "restauration",
            element: <RestaurationPage />,
            children: [
              {
                path: "",
                element: <MenuRestauration />,
              },
              {
                path: "menuItem",
                element: <MenuItemForm />,
              },
            ],
          },
          {
            path: "personnel",
            element: <OrganisationPersonnelLayout />,
            children: [
              {
                path: "createPersonnel",
                element: <CreationPersonnel />,
              },
              {
                path: "",
                element: <DashboardPersonnel />,
              },
              {
                path: "organigramme",
                element: <PersonnelOrganigrammeDashboard />,
              },
              {
                path: "dashboardCaisse",
                element: <DashboardCard />,
              },
            ],
          },
        ],
      },
      {
        path: "/forfait/success",
        element: <ForfaitSuccess />,
      },
       {
        path: "/forfait/cancel",
        element: <Navigate to="/" />,
      },
      {
        path: "/forfait/cancel",
        element: <Navigate to="/" />,
      },
      {
        path: "/forfaits",
        element: <ForfaitActive />,
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
  // route caissier
  {
    path: "/",
    children: [
      {
        path: "/caisse",
        element: <Caisse />,
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
        path: "/revenu",
        element: <RevenuPage />,
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
      },
      {
        path: "/paypal-success",
        element: <PaypalSuccess />,
      },
      
      {
        path: "/forfait/success",
        element: <ForfaitSuccess />,
      },
      {
        path: "/forfaits",
        element: <ForfaitActive />,
      },
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
        element: <Navigate to="/personnelAccueil" />,
      },
      {
        path: "/personnelAccueil",
        element: (
          <ProtectedRoute
            allowedRoles={["accueil", "caissier", "cuisinier", "organisateur"]}
          >
            <Envoy />
          </ProtectedRoute>
        ),
      },
      {
        path: "/scan",
        element: (
          <ProtectedRoute
            allowedRoles={["accueil", "caissier", "cuisinier", "organisateur"]}
          >
            <QrScannerComponent />
          </ProtectedRoute>
        ),
      },
    ],
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
        element: <Navigate to="/personnelCaisse" />,
      },
      {
        path: "/personnelCaisse",
        element: (
          <ProtectedRoute
            allowedRoles={["caissier", "organisateur", "accueil", "cuisinier"]}
          >
            <DashboardCard />
          </ProtectedRoute>
        ),
      },
    ],
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

  //personnel cuisine
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
    // element: <UserStats />,
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
        path: "/AdminHistorique",
        element: <ActivityHistory />,
      },
      {
        path: "/AdminStats",
        element: <Statique />,
      },
      {
        path: "/AdminManagement",
        element: <AdminManagementPage />,
      },

      {
        path: "/LocationSalle",
        element: <LocationSalle />,
      },
    ],
  },
  {
    path: "/choix-role",
    element: <RoleSelector />,
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
  {
    path: "/systemprompt",
  },

  {
    path: "/menulist/:slug",
    element: <MenuListWithCart />,
  },
  {
    path: "/menutitemform",
    element: <MenuItemForm />,
  },
  {
    path: "/login-site/super/admin",
    element: <LoginPage />,
  },
  {
    path: "/Merge",
    element: <Publicacc />,
  },
]);

export default router;