import React, { useState } from 'react';
import FiltersInteractiveMaps from './FiltersInteractiveMaps';
import InteractiveMaps from './InteractiveMaps';
import ComparePanel from './ComparePanel';  // Create and import this component
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const Dashboard = () => {
  const [filters, setFilters] = useState({});
  const [showComparePanel, setShowComparePanel] = useState(false);  // State to show/hide the compare panel

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);  // Update the filters and pass to InteractiveMaps
  };

  const toggleComparePanel = () => {
    setShowComparePanel(!showComparePanel);  // Toggle the visibility of the compare panel
  };

  return (
    <div>
      <FiltersInteractiveMaps onFilterChange={handleFilterChange} />
      <InteractiveMaps filters={filters} />
      
      {/* Button to toggle the compare panel */}
      <button onClick={toggleComparePanel}>
        {showComparePanel ? 'Hide Compare Panel' : 'Compare Two Neighborhoods'}
      </button>

      {/* Conditionally render the compare panel */}
      {showComparePanel && <ComparePanel />}
    </div>
  );
};

export default Dashboard;
