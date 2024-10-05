import React from 'react';
import BarrioFilter from './BarrioFilter.js';
import TipoFilter from './TipoFilter';

const Filters = ({ selectedBarrio, setSelectedBarrio, selectedTipo, setSelectedTipo, barrios, tipos }) => (
  <div className="row mb-4">
    <BarrioFilter selectedBarrio={selectedBarrio} setSelectedBarrio={setSelectedBarrio} barrios={barrios} />
    <TipoFilter selectedTipo={selectedTipo} setSelectedTipo={setSelectedTipo} tipos={tipos} />
  </div>
);

export default Filters;