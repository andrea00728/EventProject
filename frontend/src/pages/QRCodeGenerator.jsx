import React from 'react';
import QRCode from 'react-qr-code';

const Home = () => {
  const qrValue = 'http://localhost:5173/access-form';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Bienvenue à la fête !</h1>
      <p className="mb-4">Scannez ce QR code pour accéder au menu.</p>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <QRCode value={qrValue} size={200} />
      </div>
    </div>
  );
};

export default Home;
