import React, { useState } from 'react';
import InformationPanel from './InformationPanel';  // Import the InformationPanel
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const ComparePanel = ({ neighborhoodsData }) => {
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([{ id: 1, value: '' }]); // Inicialmente un selector vacío


   // Maneja el cambio en cada selector de barrio
   const handleSelectChange = (index, event) => {
    const newNeighborhoods = [...selectedNeighborhoods];
    newNeighborhoods[index].value = event.target.value;
    setSelectedNeighborhoods(newNeighborhoods);
  };

  // Añadir un nuevo selector
  const addNeighborhood = () => {
    if (selectedNeighborhoods.length < 4) { // Limitar a un máximo de 4 selectores
      setSelectedNeighborhoods([
        ...selectedNeighborhoods,
        { id: selectedNeighborhoods.length + 1, value: '' },
      ]);
    }
  };

  // Eliminar un selector
  const removeNeighborhood = (id) => {
    const updatedNeighborhoods = selectedNeighborhoods.filter((neighborhood) => neighborhood.id !== id);
    setSelectedNeighborhoods(updatedNeighborhoods);
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', width: '100%' }}>
      <h3>Compare Neighborhoods</h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {selectedNeighborhoods.map((neighborhood, index) => (
          <div key={neighborhood.id} style={{ display: 'flex', alignItems: 'center' }}>
            <select
              value={neighborhood.value}
              onChange={(event) => handleSelectChange(index, event)}
            >
              <option value="">--Select Neighborhood--</option>
              {neighborhoodsData.map((n) => (
                <option key={n.Nombre} value={n.Nombre}>
                  {n.Nombre}
                </option>
              ))}
            </select>
            {selectedNeighborhoods.length > 1 && (
              <button
                style={{ marginLeft: '10px', cursor: 'pointer' }}
                onClick={() => removeNeighborhood(neighborhood.id)}
              >
                ❌
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        style={{ marginTop: '10px', cursor: 'pointer' }}
        onClick={addNeighborhood}
        disabled={selectedNeighborhoods.length >= 4} // Deshabilitar si ya hay 4 selectores
      >
        Add Neighborhood
      </button>

      {/* Mostrar paneles de información para los barrios seleccionados */}
      <div style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '20px', marginTop: '20px' }}>
        {selectedNeighborhoods
          .filter((neighborhood) => neighborhood.value !== '')
          .map((neighborhood) => {
            const selectedData = neighborhoodsData.find((n) => n.Nombre === neighborhood.value);
            return (
              <div key={neighborhood.id} style={{ flex: '0 0 23%', minWidth: '250px', border: '1px solid #ddd', padding: '10px', position: 'relative' }}>
                <button
                  style={{ position: 'absolute', top: '5px', right: '5px', cursor: 'pointer' }}
                  onClick={() => removeNeighborhood(neighborhood.id)}
                >
                  ❌
                </button>
                anel selectedNeighborhood={selectedData} />
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ComparePanel;