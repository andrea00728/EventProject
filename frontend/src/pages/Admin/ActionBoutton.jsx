import React from 'react';

const ActionButton = ({ icon, label, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-white font-semibold transition-colors duration-300 ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default ActionButton;