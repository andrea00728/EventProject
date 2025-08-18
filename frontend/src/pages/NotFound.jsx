import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h1>404 - Page non trouvée</h1>
      <p>Oups, la page que vous cherchez n'existe pas.</p>
      <Link to="/">Retour à l'accueil</Link>
    </div>
  );
};

export default NotFound;
