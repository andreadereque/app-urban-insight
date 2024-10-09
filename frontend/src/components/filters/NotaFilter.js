import React from 'react';

const NotaFilter = ({ selectedNota, setSelectedNota }) => (
  <div className="col-md-4">
    <label className="form-label">Nota:</label>
    <select
      className="form-select"
      value={selectedNota}
      onChange={(e) => setSelectedNota(e.target.value)}
    >
      <option value="">Todas</option>
      <option value="1-2">1 - 2 estrellas</option>
      <option value="2-3">2 - 3 estrellas</option>
      <option value="3-4">3 - 4 estrellas</option>
      <option value="4-5">4 - 5 estrellas</option>
    </select>
  </div>
);

export default NotaFilter;
