# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


************************************************autre explication

📄 pages/
Contient toutes les pages principales de l'application.
Chaque fichier représente une vue ou une section entière (par exemple : page de connexion, tableau de bord, gestion des invités, etc.).

➡ Utilisé pour gérer le rendu par route.

⚙️ services/
Contient les fonctions métiers côté frontend, souvent liées aux appels d’API.
Par exemple, tableService.ts ou eventService.ts contient les fonctions pour récupérer, créer, mettre à jour ou supprimer des tables ou des événements.

➡ Permet de centraliser la logique de communication avec le backend.

🌐 api/
Contient la configuration de l'instance Axios ou Fetch utilisée pour effectuer les requêtes HTTP.
Cela permet de définir l'URL de base (baseURL), les en-têtes communs (authentification, JSON, etc.), ou les intercepteurs.

🔁 context/
Contient les contextes globaux React pour gérer les états partagés dans l'application (ex: utilisateur connecté, événement courant, thème, etc.).
Utilisé avec React.createContext() et useContext() pour éviter le prop-drilling.

🧩 components/
Contient tous les composants réutilisables de l’interface utilisateur, comme :

Boutons, modales, formulaires, cartes, etc.

Éléments d’affichage 3D avec Three.js ou CesiumJS si utilisé

➡ Favorise la réutilisation de code et un design cohérent.

🧭 router/
Contient la configuration de React Router.
Permet de définir les routes (chemins) de l'application, leurs composants associés, la gestion de la navigation, et parfois les routes privées (authentifiées).

🧠 utils/
Contient des fonctions utilitaires (helpers) génériques réutilisables dans tout le projet, comme :

Formatage de date

Générateurs aléatoires

Fonctions mathématiques ou de calcul

🧱 layout/
Contient les modèles de mise en page globaux réutilisables.
Par exemple, une structure Sidebar + Header + Contenu, utilisée dans plusieurs pages.

🔐 .env
Fichier qui contient les variables d’environnement, comme :

L’URL de l’API backend

Les clés publiques (jamais de clés secrètes ici)

Les ports personnalisés