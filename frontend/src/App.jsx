import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Pagepublic from './pages/Pagepublic';
import PublicEvents from './pages/PublicEvents';
import NotFound from './pages/NotFound';

import Public_Accueil from "./pages/Public_Accueil";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Pagepublic />} />
        <Route path="/evenements-publics" element={<PublicEvents />} />
        {/* Exemple : route pour un événement spécifique */}
        { <Route path="/evenement/:id" element={<EventDetail />} /> }
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Public_Accueil />} />
        <Route path="/accueil" element={<Public_Accueil />} />
      </Routes>
    </Router>
  );
}

export default App;
