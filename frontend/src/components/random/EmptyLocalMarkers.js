import React from 'react';
import EmptyLocalMarker from './EmptyLocalMarker';

const EmptyLocalMarkers = ({ filteredLocals, icon, onPopupOpen, onMarkerClick }) => (
  <>
    {filteredLocals.map((local, index) => (
      <EmptyLocalMarker key={index} local={local} icon={icon} onPopupOpen={onPopupOpen} onMarkerClick={onMarkerClick} />
    ))}
  </>
);

export default EmptyLocalMarkers;