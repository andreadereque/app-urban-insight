import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import '../restaurants/Icons/RestaurantMarkers'
import RestaurantIcon from '../restaurants/Icons/RestaurantIcon';
import EmptyLocalMarker from './EmptyLocalMarker';

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
          console.log(resRestaurants);
          
          const resLocals = await axios.get(`http://127.0.0.1:5000/api/empty_locals_by_neighborhood/${selectedNeighborhood}`);
          setLocals(resLocals.data);
          console.log(resLocals);
        } catch (error) {
          console.error('Error fetching neighborhood data:', error);
        }
      };
      
      fetchNeighborhoodData();
    }
  }, [selectedNeighborhood]);

  const renderMarkers = (locations, type) => {
    return locations.map((location, index) => {
      const coordinates = location.Geometry?.coordinates; // Access the coordinates
  
      // Check if coordinates are valid
      if (!coordinates || coordinates.length !== 2 || typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
        console.warn(`Invalid coordinates for location ${location.Nombre}:`, coordinates);
        return null;
      }
  
      // Determine the marker icon based on the type
      const markerIcon = type === 'restaurant' ? RestaurantIcon : EmptyLocalMarker;
  
      return (
        <Marker key={index} position={[coordinates[1], coordinates[0]]} icon={markerIcon}>
          <Popup>
            <b>{location.Nombre}</b><br />
            {location.Dirección}
          </Popup>
        </Marker>
      );
    });
  };
  
  
  return (
    <MapContainer center={[41.3851, 2.1734]} zoom={14} style={{ height: '500px', width: '100%' }}>
      <TileLayer
      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
    />
      {renderMarkers(restaurants, 'restaurant')} {/* Pass 'restaurant' type */}
      {renderMarkers(locals, 'emptyLocal')} {/* Pass 'emptyLocal' type */}
    </MapContainer>
  );
  
};

export default NeighborhoodMap;
