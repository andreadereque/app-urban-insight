import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';

const NeighborhoodMap = () => {
  const { neighborhood } = useParams();
  const [restaurants, setRestaurants] = useState([]);
  const [locals, setLocals] = useState([]);
  
  // Check for the neighborhood in localStorage if not passed through URL
  const selectedNeighborhood = neighborhood || localStorage.getItem('lastNeighborhood');
  
  useEffect(() => {
    // Fetch data if a neighborhood is available
    if (selectedNeighborhood) {
      // Save the last neighborhood to localStorage
      localStorage.setItem('lastNeighborhood', selectedNeighborhood);
      
      const fetchNeighborhoodData = async () => {
        try {
          const resRestaurants = await axios.get(`http://127.0.0.1:5000/api/restaurants_by_neighborhood/${selectedNeighborhood}`);
          setRestaurants(resRestaurants.data);
          
          const resLocals = await axios.get(`http://127.0.0.1:5000/api/empty_locals_by_neighborhood/${selectedNeighborhood}`);
          setLocals(resLocals.data);
        } catch (error) {
          console.error('Error fetching neighborhood data:', error);
        }
      };
      
      fetchNeighborhoodData();
    }
  }, [selectedNeighborhood]);

  const renderMarkers = (locations) => {
    return locations.map((location, index) => {
        const { Coordinates } = location;
        // Check if coordinates are defined and valid
        if (!Coordinates || Coordinates.length !== 2 || typeof Coordinates[0] !== 'number' || typeof Coordinates[1] !== 'number') {
            console.warn(`Invalid coordinates for location ${location.Nombre}:`, Coordinates);
            return null; // Skip rendering if invalid coordinates
        }
        
        return (
            <Marker key={index} position={[Coordinates[1], Coordinates[0]]}>
                <Popup>
                    <b>{location.Nombre}</b><br />
                    {location.Dirección}
                </Popup>
            </Marker>
        );
    });
};

return (
    <MapContainer center={[41.3851, 2.1734]} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {renderMarkers(restaurants)} {/* Render restaurants */}
        {renderMarkers(locals)} {/* Render empty locals */}
    </MapContainer>
);
}

export default NeighborhoodMap;
