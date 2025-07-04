import React from "react";
import { createBrowserRouter, Navigate, Router } from "react-router-dom";
import DefaultLayout from "../layouts/DefaultLayout";
import GuestLayout from "../layouts/GuestLayout";
import Accueil from "../pages/Accueil";
import Evenement from "../pages/Evenement";
import Notfound from "../pages/Notofoundpage";
import AdminLayout from "../layouts/AdminLayout";
import Pagepublic from "../pages/Pagepublic";
import Connexionorganisateur from "../pages/Connexionorganisateur";
import Inscription from "../pages/Inscription";
import Connnexiongoogle from "../services/connexiongoogl";
import Evenemenpage from "../pages/Evenementpage";
import Apropos from "../pages/apropos";

// import Table3DScene from "../components/table3D";
import ChoixModeInvite from "../layouts/ChoixModeInvite";
import Inviteform from "../pages/choixModInvite/inviteForm";
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
const router=createBrowserRouter([
   
    {
        path:"/",
        element:<DefaultLayout/>,
        children:[
            {
                path:"/",
                element:<Navigate to="/accueil"/>
            },
            {
                path:"/accueil",
                element:<Accueil/>
            },
            {
                path:"/evenement",
                element:<Evenemenpage/>
            },
            {
                path:"/apropos",
                element:<Apropos/>
            },
             {
                path: "/evenement/invites",
                element: <ChoixModeInvite />,
                children: [
                    
                    {
                       
                        path: "creationInv",
                        element:<InviteformWithId/>
                    },
                    {
            
                        path: "importerInv",
                        element: <ImportGuestsCSV />
                    },
                     {
            
                        path: "affichageInv",
                        element: <AffichageInvite/>,
                    },
                    
                ]
            },
             {
                path:"/evenement/tables",
                element:<TableLayout/>,
                children:[
                    {
                        path:"creationTable",
                        element:<Tablecreation/>
                    },
                    {
                        path:"affichageTable",
                        element:<Listetable/>
                    },
                    {
                        path:"3Dtable",
                        element:<Affichage3dTable/>
                    },
                ]

            },
             {
                path:"/evenement/evenement",
                element:<EventLayout/>,
                children:[
                    {
                        path:"eventpadding",
                        element:<EventPending/>
                    },
                    {
                        path:"eventAccept",
                        element:<EventAccept/>
                    },
                ]

            },
        ]
    },
    //  {
    //     path:"/",
    //     element:<AdminLayout/>,
    //     children:[
    //         // {
    //         //     path:"/",
    //         //     element:<Navigate to="/AdminAccueil"/>
    //         // },{
    //         //     path:"/AdminAccueil",
    //         //     element:<Adminaccueil/>
    //         // },
    //     ]
    // },
    {
        path:"/",
        element:<GuestLayout/>,
        children:[
            {
                path:"/",
                element:<Navigate to="/pagepublic"/>
            },
            {
                path:"/pagepublic",
                element:<Pagepublic/>
            },
            {
                path:"/connexion",
                element:<Connexionorganisateur/>
            },
            {
                path:"/callback",
                element:<Connnexiongoogle/>
            },
            {
                path:"/inscription",
                element:<Inscription/>
            }
        ]
    },
    {
        path:"*",
        element:<Notfound/>
    }
    
]);

export default router;