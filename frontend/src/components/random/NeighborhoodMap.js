import { useParams } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';  // Asegúrate de importar useRef
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';  // Asegúrate de importar Popup
import axios from 'axios';
import '../restaurants/Icons/RestaurantMarkers';
import RestaurantIcon from '../restaurants/Icons/RestaurantIcon';
import EmptyLocalMarker from './EmptyLocalMarker';
import proj4 from 'proj4';
import L from 'leaflet';
import InformationPanel from '../demographic_map/InformationPanel';
import '../../styles/NeighborMap.css'

const NeighborhoodMap = () => {
  const { neighborhood } = useParams();
  const [restaurants, setRestaurants] = useState([]);
  const [locals, setLocals] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedNeighborhoodInfo, setSelectedNeighborhoodInfo] = useState([]);

  const mapRef = useRef(null);  // Para almacenar la referencia del mapa

  const utmZone = "+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs"; // Proyección UTM para Barcelona

  const selectedNeighborhoodName = neighborhood || localStorage.getItem('lastNeighborhood');

  useEffect(() => {
    if (selectedNeighborhoodName) {
      localStorage.setItem('lastNeighborhood', selectedNeighborhoodName);

      const fetchNeighborhoodData = async () => {
        try {
          const resRestaurants = await axios.get(`http://127.0.0.1:5000/api/restaurants_by_neighborhood/${selectedNeighborhoodName}`);
          setRestaurants(resRestaurants.data);

          const resLocals = await axios.get(`http://127.0.0.1:5000/api/empty_locals_by_neighborhood/${selectedNeighborhoodName}`);
          setLocals(resLocals.data);

          const resNeighborhoods = await axios.get('http://127.0.0.1:5000/api/neighborhoods');
          setNeighborhoods(resNeighborhoods.data);
          try {
            // Call the demographics endpoint with the specific neighborhood name
            const response = await axios.get(`http://127.0.0.1:5000/api/demographics_by_name?barrio=${encodeURIComponent(selectedNeighborhoodName)}`);
            
            if (response.data) {
              setSelectedNeighborhoodInfo(response.data); // Set the retrieved neighborhood data in the state
            } else {
              console.error(`No data found for neighborhood: ${selectedNeighborhoodName}`);
            }
          } catch (error) {
            console.error('Error fetching neighborhood data:', error);
          }

          // Ajustar el mapa para que muestre todos los barrios
          if (mapRef.current && resNeighborhoods.data.length > 0) {
            const allCoordinates = resNeighborhoods.data.flatMap(neighborhood =>
              neighborhood.Geometry.coordinates[0].map(coord => {
                const [easting, northing] = coord;
                const latLng = proj4(utmZone, "WGS84", [easting, northing]);
                return [latLng[1], latLng[0]];  // Leaflet usa formato [lat, lng]
              })
            );
            const bounds = L.latLngBounds(allCoordinates);
            mapRef.current.fitBounds(bounds);  // Ajustar el mapa para mostrar todos los límites
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchNeighborhoodData();
    }
  }, [selectedNeighborhoodName]);

  const convertUTMtoLatLng = (utmCoordinates) => {
    return utmCoordinates.map(coord => {
      const [easting, northing] = coord;
      const latLng = proj4(utmZone, "WGS84", [easting, northing]);
      return [latLng[1], latLng[0]];  // Leaflet usa formato [lat, lng]
    });
  };

  const renderPolygons = () => {
    return neighborhoods.map((neighborhood, index) => {
      if (neighborhood.Geometry && neighborhood.Geometry.coordinates.length > 0) {
        const coordinates = convertUTMtoLatLng(neighborhood.Geometry.coordinates[0]);

        const fillColor = neighborhood.Nombre === selectedNeighborhoodName ? '#0000FF' : 'purple';

        return (
          <Polygon
            key={index}
            positions={coordinates}
            color={fillColor}
            fillOpacity={0.5}
            eventHandlers={{
              mouseover: (e) => {
                const layer = e.target;
                layer.openPopup();  // Abrir el popup cuando el ratón esté encima
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.closePopup();  // Cerrar el popup cuando el ratón salga
              }
            }}
          >
            <Popup>  {/* Popup importado correctamente */}
              <b>{neighborhood.Nombre}</b>
            </Popup>
          </Polygon>
        );
      }
      return null;
    });
  };

  const renderMarkers = (locations, type) => {
    return locations.map((location, index) => {
      const coordinates = location.Geometry?.coordinates;

      if (!coordinates || coordinates.length !== 2 || typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
        console.warn(`Invalid coordinates for location ${location.Nombre}:`, coordinates);
        return null;
      }

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
    <div>
      <br />
      <h1>Información del barri: {neighborhood}</h1>
      <br />
      <div className="map-info-container">
        <MapContainer
          center={[41.3851, 2.1734]}  // Centro de Barcelona
          zoom={12}
          style={{ height: '650px', width: '400%' }}  // Reduce el ancho del mapa
          whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}  // Guardar la referencia del mapa
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
          />
          {renderMarkers(restaurants, 'restaurant')}
          {renderMarkers(locals, 'emptyLocal')}
          {renderPolygons()}  {/* Aquí se muestran los polígonos */}
        </MapContainer>
  
        <div className="information-panel">
          <InformationPanel selectedNeighborhood={selectedNeighborhoodInfo} barcelonaData={selectedNeighborhoodInfo} />
        </div>
      </div>
    </div>
  );
}  
export default NeighborhoodMap;
