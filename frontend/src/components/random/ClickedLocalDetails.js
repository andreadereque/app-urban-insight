import React from 'react';
import '../../styles/ClickedLocalDetails.css'; // Asegúrate de crear este archivo CSS si no lo tienes

const ClickedLocalDetails = ({ title }) => {
  if (!title) return null; // No mostrar nada si no hay título

  return (
    <div className="clicked-local-details">
      <h2>Local seleccionado: {title}</h2>
    </div>
  );
};

export default ClickedLocalDetails;
