import React from 'react';

const BarrioFilter = ({ selectedBarrio, setSelectedBarrio, barrios }) => (
  <div className="col-md-4">
    <label className="form-label">Barrio:</label>
    <select className="form-select" value={selectedBarrio} onChange={e => setSelectedBarrio(e.target.value)}>
      <option value=''>Todos</option>
      {barrios.map(barrio => (
        <option key={barrio} value={barrio}>{barrio}</option>
      ))}
    </select>
  </div>
);

export default BarrioFilter;