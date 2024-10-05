import React from 'react';

const Filters = ({ selectedBarrio, setSelectedBarrio, selectedNota, setSelectedNota, selectedTipo, setSelectedTipo, barrios, tipos }) => {
  return (
    <div className="row mb-4">
      <div className="col-md-4">
        <label className="form-label">Barrio:</label>
        <select className="form-select" value={selectedBarrio} onChange={e => setSelectedBarrio(e.target.value)}>
          <option value=''>Todos</option>
          {barrios.map(barrio => (
            <option key={barrio} value={barrio}>{barrio}</option>
          ))}
        </select>
      </div>

  

      <div className="col-md-4">
        <label className="form-label">Tipo:</label>
        <select className="form-select" value={selectedTipo} onChange={e => setSelectedTipo(e.target.value)}>
          <option value=''>Todos</option>
          {tipos.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Filters;
