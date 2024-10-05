import React, { useState } from 'react';
import InformationPanel from './InformationPanel';  // Import the InformationPanel
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const ComparePanel = ({ neighborhoodsData }) => {
  const [firstNeighborhood, setFirstNeighborhood] = useState(null);
  const [secondNeighborhood, setSecondNeighborhood] = useState(null);

  const handleFirstSelect = (e) => {
    const selectedNeighborhood = neighborhoodsData.find(n => n.Nombre === e.target.value);
    setFirstNeighborhood(selectedNeighborhood);
  };

  const handleSecondSelect = (e) => {
    const selectedNeighborhood = neighborhoodsData.find(n => n.Nombre === e.target.value);
    setSecondNeighborhood(selectedNeighborhood);
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', width: '100%' }}>
      <h3>Compare Two Neighborhoods</h3>

      <div>
        <label>Select First Neighborhood:</label>
        <select onChange={handleFirstSelect}>
          <option value="">--Select--</option>
          {neighborhoodsData.map((neighborhood) => (
            <option key={neighborhood.Nombre} value={neighborhood.Nombre}>
              {neighborhood.Nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Select Second Neighborhood:</label>
        <select onChange={handleSecondSelect}>
          <option value="">--Select--</option>
          {neighborhoodsData.map((neighborhood) => (
            <option key={neighborhood.Nombre} value={neighborhood.Nombre}>
              {neighborhood.Nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Display InformationPanels for both neighborhoods if both are selected */}
      {firstNeighborhood && secondNeighborhood && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <div style={{ width: '45%' }}>
            <h4>{firstNeighborhood.Nombre}</h4>
            <InformationPanel selectedNeighborhood={firstNeighborhood} />
          </div>
          <div style={{ width: '45%' }}>
            <h4>{secondNeighborhood.Nombre}</h4>
            <InformationPanel selectedNeighborhood={secondNeighborhood} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePanel;
