import L from 'leaflet';
import transportIconUrl from '../../assets/icons/transport.png';

const TransportIcon = L.icon({
  iconUrl: transportIconUrl,
  iconSize: [25, 25], // Ajusta el tamaño del ícono
  iconAnchor: [12, 25], // Punto de anclaje del ícono
  popupAnchor: [0, -25] // Punto donde el popup aparece
});

export default TransportIcon;