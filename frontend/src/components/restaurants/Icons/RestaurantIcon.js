import restIconPath from '../../../assets/icons/rest_icon.png';
import L from 'leaflet';

const RestaurantIcon = new L.Icon({
    iconUrl: restIconPath,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
export default RestaurantIcon;


