import React from "react";
import { createBrowserRouter, Navigate, Router } from "react-router-dom";
import DefaultLayout from "../layouts/DefaultLayout";
import GuestLayout from "../layouts/GuestLayout";
import Accueil from "../pages/Accueil";
import Evenement from "../pages/Evenement";
// import Apropos from "../pages/Apropos";
import Notfound from "../pages/Notofoundpage";
import AdminLayout from "../layouts/AdminLayout";
import Pagepublic from "../pages/Pagepublic";
import Connexionorganisateur from "../pages/Connexionorganisateur";
import Inscription from "../pages/Inscription";
import Test from "../layouts/test";
import Connnexiongoogle from "../services/connexiongoogl";
import Evenemenpage from "../pages/Evenementpage";
const router=createBrowserRouter([
     {
        path:"/",
        element:<Test/>,
        children:[
           
            // {
            //     path:"/",
            //     element:<Navigate to="/accueil"/>
            // },
            // {
            //     path:"/accueil",
            //     element:<Accueil/>
            // },
            // {
            //     path:"/evenement",
            //     element:<Evenement/>
            // },
            // {
            //     path:"/apropos",
            //     element:<Apropos/>
            // }
        ]
    },
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
            // {
            //     path:"/apropos",
            //     element:<Apropos/>
            // }
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
    // {
    //     path:"/",
    //     element:<GuestLayout/>,
    //     children:[
    //         {
    //             path:"/",
    //             element:<Navigate to="/pagepublic"/>
    //         },
    //         {
    //             path:"/pagepublic",
    //             element:<Pagepublic/>
    //         },
    //         {
    //             path:"/connexion",
    //             element:<Connexionorganisateur/>
    //         },
    //         {
    //             path:"/callback",
    //             element:<Connnexiongoogle/>
    //         },
    //         {
    //             path:"/inscription",
    //             element:<Inscription/>
    //         }
    //     ]
    // },
    {
        path:"*",
        element:<Notfound/>
    }
    
]);

export default router;