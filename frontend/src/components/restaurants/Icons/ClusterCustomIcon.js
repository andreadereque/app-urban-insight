
import L from 'leaflet';





const ClusterCustomIcon = (cluster) => {
    const count = cluster.getChildCount();
    return L.divIcon({
      html: `<div style="
              background-color: rgba(255, 182, 193, 0.8);
              color: #fff;
              border-radius: 50%;
              padding: 5px;
              border: 1px solid #ff69b4;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
              font-weight: bold;
              font-size: 12px;">
              ${count}
            </div>`,
      className: 'custom-cluster-icon',
      iconSize: L.point(30, 30, true),
    });
  };
  export default ClusterCustomIcon;