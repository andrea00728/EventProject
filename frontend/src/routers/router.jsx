import { createBrowserRouter, Navigate } from "react-router-dom";
import DefaultLayout from "../layouts/DefaultLayout";
import GuestLayout from "../layouts/GuestLayout";
import Accueil from "../pages/Accueil";
import Notfound from "../pages/Notofoundpage";
import Pagepublic from "../pages/Pagepublic";
import Connexionorganisateur from "../pages/Connexionorganisateur";
import Inscription from "../pages/Inscription";
import Connnexiongoogle from "../services/connexiongoogl";
import Evenemenpage from "../pages/Evenementpage";
import Apropos from "../pages/apropos";

// import Table3DScene from "../components/table3D";
import ChoixModeInvite from "../layouts/ChoixModeInvite";
import ImportGuestsCSV from "../pages/choixModInvite/importation";
import AffichageInvite from "../pages/choixModInvite/affichageInvite";
import InviteformWithId from "../pages/choixModInvite/InviteFormparId";
import TableLayout from "../layouts/TableLayout.jsx";
import EventLayout from "../layouts/eventLayout.jsx";
import Tablecreation from "../pages/TableOrganisation/Tablecreation";
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
import Dashboard from   "../pages/Admin/DashBoard.jsx";
import EvenementAd from "../pages/Admin/Evenement.jsx";
import Organisateur from "../pages/Admin/Organisateur.jsx";
import Parametre from "../pages/Admin/Parametre.jsx";
import LocationSalle from "../pages/Admin/LocationSalle.jsx";

const router = createBrowserRouter([
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
        element: <Navigate to="/accueil" />,
      },
      {
        path: "/accueil",
        element: <Accueil />,
      },
      {
        path: "/evenement",
        element: <Evenemenpage />,
      },
      {
        path: "/apropos",
        element: <Apropos />,
      },
      {
        path: "/evenement/invites",
        element: <ChoixModeInvite />,
        children: [
          {
            path: "creationInv",
            element: <InviteformWithId />,
          },
          {
            path: "importerInv",
            element: <ImportGuestsCSV />,
          },
          {
            path: "affichageInv",
            element: <AffichageInvite />,
          },
        ],
      },
      {
        path: "/evenement/tables",
        element: <TableLayout />,
        children: [
          {
            path: "creationTable",
            element: <Tablecreation />,
          },
          {
            path: "affichageTable",
            element: <Listetable />,
          },
          {
            path: "3Dtable",
            element: <Affichage3dTable />,
          },
        ],
      },
      {
        path: "/evenement/evenement",
        element: <EventLayout />,
        children: [
          {
            path: "eventpadding",
            element: <EventPending />,
          },
          {
            path: "eventAccept",
            element: <EventAccept />,
          },
        ],
      },
      {
        path: "/evenement/personnel",
        element: <OrganisationPersonnelLayout />,
        children: [
          {
            path: "createPersonnel",
            element: <CreationPersonnel />,
          },
          {
            path: "dashboard_personnel",
            element: <DashboardPersonnel />,
          },
        ],
      },
      {
        path: "/paypal-success",
        element: <PaypalSuccess />,
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
          <ProtectedRoute allowedRoles={["accueil", "caissier", "cuisinier"]}>
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
            allowedRoles={["caissier", "organisateur", "accueil"]}
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
            allowedRoles={["cuisinier", "organisateur", "accueil"]}
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
  /************************* Page pour les cuisiniers ************** */
  {
    path: "/Cuisine",
    element: <DashboardpersCuisine />,
  },
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
        element: <Pagepublic />,
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
    ],
  },
  {
    path: "*",
    element: <Notfound />,
  },
]);

export default router;
