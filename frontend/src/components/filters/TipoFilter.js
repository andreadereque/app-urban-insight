import React from 'react';

const TipoFilter = ({ selectedTipo, setSelectedTipo, tipos }) => (
  <div className="col-md-4">
    <label className="form-label">Tipo:</label>
    <select className="form-select" value={selectedTipo} onChange={e => setSelectedTipo(e.target.value)}>
      <option value=''>Todos</option>
      {tipos.map(tipo => (
        <option key={tipo} value={tipo}>{tipo}</option>
      ))}
    </select>
  </div>
);

export default TipoFilter;