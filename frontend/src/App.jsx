import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Pagepublic from './pages/Pagepublic';
import PublicEvents from './pages/PublicEvents';
import NotFound from './pages/NotFound';
import Evenementform from "../components/Evenementform"; // Le formulaire privé complet

function App() {
  return (
    <Router>
       <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Pagepublic />} />
        <Route path="/evenements-publics" element={<PublicEvents />} />
        {/* Exemple : route pour un événement spécifique */}
        { <Route path="/evenement/:id" element={<EventDetail />} /> }
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<EvenementForm />} />
        <Route path="/creer-evenement-prive" element={<Evenementform />} />
      </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
