// import React from 'react'

// export default function Evenementform() {
//   return (
//     <div>
//         evenementForm
//     </div>
//   )
// }


import React, { useState } from 'react';

export default function Evenementform  ({ onNext }){
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: '',
    theme: '',
    date: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.eventName && formData.eventType && formData.theme && formData.date) {
      onNext(formData);
    } else {
      alert('Veuillez remplir tous les champs.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Quel est votre événement ?</h2>
      <input
        type="text"
        name="eventName"
        placeholder="Événement"
        value={formData.eventName}
        onChange={handleChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="text"
        name="eventType"
        placeholder="Type"
        value={formData.eventType}
        onChange={handleChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="text"
        name="theme"
        placeholder="Thème"
        value={formData.theme}
        onChange={handleChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <button
        type="submit"
        className="w-full bg-blue-900 text-white p-2 rounded hover:bg-blue-700"
      >
        Passer à la localisation
      </button>
    </form>
  );
};

