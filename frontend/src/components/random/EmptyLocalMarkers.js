// EmptyLocalMarkers.js
import React from 'react';
import EmptyLocalMarker from './EmptyLocalMarker';

const EmptyLocalMarkers = ({ filteredLocals, icon }) => (
  <>
    {filteredLocals.map((local, index) => (
      <EmptyLocalMarker key={index} local={local} icon={icon} />
    ))}
  </>
);

export default EmptyLocalMarkers;
