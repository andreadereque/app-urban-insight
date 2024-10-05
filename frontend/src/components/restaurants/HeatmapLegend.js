import React from 'react';

const HeatmapLegend = () => (
  <div style={{
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
  }}>
    <h4>Leyenda del Heatmap</h4>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
      <span style={{ backgroundColor: '#800026', width: '20px', height: '20px', display: 'inline-block', marginRight: '5px' }}></span> &gt; 150
    </div>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
      <span style={{ backgroundColor: '#BD0026', width: '20px', height: '20px', display: 'inline-block', marginRight: '5px' }}></span> 121 - 150
    </div>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
      <span style={{ backgroundColor: '#E31A1C', width: '20px', height: '20px', display: 'inline-block', marginRight: '5px' }}></span> 91 - 120
    </div>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
      <span style={{ backgroundColor: '#FC4E2A', width: '20px', height: '20px', display: 'inline-block', marginRight: '5px' }}></span> 61 - 90
    </div>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
      <span style={{ backgroundColor: '#FD8D3C', width: '20px', height: '20px', display: 'inline-block', marginRight: '5px' }}></span> 31 - 60
    </div>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
      <span style={{ backgroundColor: '#FEB24C', width: '20px', height: '20px', display: 'inline-block', marginRight: '5px' }}></span> 15 - 30
    </div>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ backgroundColor: '#FFEDA0', width: '20px', height: '20px', display: 'inline-block', marginRight: '5px' }}></span> 0 - 14
    </div>
  </div>
);

export default HeatmapLegend;