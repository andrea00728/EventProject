import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Pagepublic from './pages/Pagepublic';
import PublicEvents from './pages/PublicEvents';
import NotFound from './pages/NotFound';
import './App.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Pagepublic />} />
        <Route path="/evenements-publics" element={<PublicEvents />} />
        {/* Exemple : route pour un événement spécifique */}
        { <Route path="/evenement/:id" element={<EventDetail />} /> }
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
