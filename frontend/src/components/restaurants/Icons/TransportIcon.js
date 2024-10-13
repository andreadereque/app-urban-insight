import busIconPath from '../../../assets/icons/bus.png';
import L from 'leaflet';

const TransportIcon = new L.Icon({
    iconUrl: busIconPath,  
    iconSize: [30, 30],  
    iconAnchor: [15, 30],  
    popupAnchor: [0, -30],  
});

export default TransportIcon;
