import React from 'react';
import EmptyLocalMarker from './EmptyLocalMarker';

const EmptyLocalMarkers = ({ filteredLocals, icon, onPopupOpen }) => (
  <>
    {filteredLocals.map((local, index) => (
      <EmptyLocalMarker key={index} local={local} icon={icon} onPopupOpen={onPopupOpen} />
    ))}
  </>
);

export default EmptyLocalMarkers;
