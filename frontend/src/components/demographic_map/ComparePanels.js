import React, { useState } from 'react';
import InformationPanel from './InformationPanel';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const ComparePanel = ({ neighborhoodsData }) => {
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([{ id: 1, value: '' }]);

  const handleSelectChange = (index, event) => {
    const newNeighborhoods = [...selectedNeighborhoods];
    newNeighborhoods[index].value = event.target.value;
    setSelectedNeighborhoods(newNeighborhoods);
  };

  const addNeighborhood = () => {
    if (selectedNeighborhoods.length < 4) {
      setSelectedNeighborhoods([...selectedNeighborhoods, { id: selectedNeighborhoods.length + 1, value: '' }]);
    }
  };

  const removeNeighborhood = (id) => {
    const updatedNeighborhoods = selectedNeighborhoods.filter((neighborhood) => neighborhood.id !== id);
    setSelectedNeighborhoods(updatedNeighborhoods);
  };

  return (
    <div style={{ backgroundColor: '#F5F7FA', padding: '20px', width: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
      <h3 style={{ color: '#2A3A67', fontWeight: 'bold' }}>Comparar Barrios</h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '15px' }}>
        {selectedNeighborhoods.map((neighborhood, index) => (
          <div key={neighborhood.id} style={{ display: 'flex', alignItems: 'center' }}>
            <select
              value={neighborhood.value}
              onChange={(event) => handleSelectChange(index, event)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ADD8E6',
                color: '#4B4B4B',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <option value="">--Seleccionar Barrio--</option>
              {neighborhoodsData.map((n) => (
                <option key={n.Nombre} value={n.Nombre}>
                  {n.Nombre}
                </option>
              ))}
            </select>
            {selectedNeighborhoods.length > 1 && (
              <button
                style={{
                  marginLeft: '8px',
                  cursor: 'pointer',
                  color: '#FF6F61', // Coral Suave para la "X"
                  fontSize: '18px',
                  border: 'none',
                  background: 'none',
                }}
                onClick={() => removeNeighborhood(neighborhood.id)}
              >
                 <b>
                 X</b>
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        style={{
          marginTop: '15px',
          backgroundColor: '#FFC914', // Mostaza Suave para el botón de añadir
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '6px',
          padding: '10px 15px',
          fontSize: '14px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
        onClick={addNeighborhood}
        disabled={selectedNeighborhoods.length >= 4}
      >
        Añadir Barrio
      </button>

      <div style={{ display: 'flex', overflowX: 'auto', gap: '20px', marginTop: '20px' }}>
        {selectedNeighborhoods
          .filter((neighborhood) => neighborhood.value !== '')
          .map((neighborhood) => {
            const selectedData = neighborhoodsData.find((n) => n.Nombre === neighborhood.value);
            return (
              <div key={neighborhood.id} style={{ minWidth: '250px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)', backgroundColor: '#FFFFFF', padding: '15px', position: 'relative' }}>
                <button
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    cursor: 'pointer',
                    color: '#2A3A67', // Coral Suave para la "X"
                    fontSize: '18px',
                    border: 'none',
                    background: 'none',
                  }}
                  onClick={() => removeNeighborhood(neighborhood.id)}
                ><b>
                  X</b>
                </button>
                <InformationPanel selectedNeighborhood={selectedData} />
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ComparePanel;
