import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass, Maximize2, Minimize2, Locate, MapPin, Flag, Mountain, Layers, Crosshair } from 'lucide-react';
import { Waypoint, CrewMember } from '../types';

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export type MapStyleType = 'outdoors' | 'dark' | 'satellite';

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  height?: string;
  className?: string;
  showCrew?: boolean;
  crewMembers?: CrewMember[];
  waypoints?: Waypoint[];
  routePath?: [number, number][];
  summitAltitude?: string;
  placeName?: string;
  routeNote?: string;
  onWaypointClick?: (wp: Waypoint) => void;
  enableRealGps?: boolean;
  onGpsUpdate?: (lat: number, lng: number, accuracy: number) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center = [12.0945, 108.6472],
  zoom = 14,
  interactive = true,
  height = '240px',
  className = '',
  showCrew = false,
  crewMembers = [],
  waypoints = [],
  routePath = [],
  summitAltitude = '2,287m',
  placeName = 'Bidoup Núi Bà',
  routeNote = 'Offline map available',
  onWaypointClick,
  enableRealGps = false,
  onGpsUpdate
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyleType>('outdoors');
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [realPosition, setRealPosition] = useState<[number, number] | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsActive, setGpsActive] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Mapbox Style Tile URL resolver with OSM fallback
  const getTileUrl = (style: MapStyleType) => {
    if (!MAPBOX_TOKEN) {
      if (style === 'dark') {
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      }
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
    let mapboxStyleId = 'mapbox/outdoors-v12';
    if (style === 'dark') mapboxStyleId = 'mapbox/dark-v11';
    if (style === 'satellite') mapboxStyleId = 'mapbox/satellite-streets-v12';

    return `https://api.mapbox.com/styles/v1/${mapboxStyleId}/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`;
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive
      });

      // Add High-DPI Mapbox TileLayer
      const tileLayer = L.tileLayer(getTileUrl(mapStyle), {
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 19,
        attribution: '© Mapbox © OpenStreetMap'
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // Markers LayerGroup
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when style changes
  const switchMapStyle = (newStyle: MapStyleType) => {
    setMapStyle(newStyle);
    setShowStyleMenu(false);
    if (tileLayerRef.current && mapInstanceRef.current) {
      tileLayerRef.current.setUrl(getTileUrl(newStyle));
    }
  };

  // Handle Real GPS Tracking
  const locateUserGps = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ Geolocation GPS');
      return;
    }

    setGpsActive(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const newPos: [number, number] = [latitude, longitude];
        setRealPosition(newPos);
        setGpsAccuracy(Math.round(accuracy));
        if (onGpsUpdate) onGpsUpdate(latitude, longitude, accuracy);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(newPos, 16, { animate: true, duration: 1.2 });
        }
      },
      (err) => {
        console.warn('GPS location error:', err.message);
        alert(`Không thể lấy GPS thực tế (${err.message}). Đang dùng vị trí mặc định.`);
        setGpsActive(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  // Fly back to Trail view
  const focusTrail = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(center, zoom, { animate: true, duration: 1.2 });
    }
  };

  // Watch GPS if enabled
  useEffect(() => {
    if (!enableRealGps || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const coords: [number, number] = [latitude, longitude];
        setRealPosition(coords);
        setGpsAccuracy(Math.round(accuracy));
        if (onGpsUpdate) onGpsUpdate(latitude, longitude, accuracy);
      },
      (err) => console.warn('Watch GPS error:', err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enableRealGps]);

  // Update Layers & Overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Draw Route Polyline
    const defaultRoute: [number, number][] = [
      [12.0820, 108.6380],
      [12.0860, 108.6410],
      [12.0900, 108.6440],
      [12.0945, 108.6472],
      [12.0980, 108.6505],
      [12.1030, 108.6540],
      [12.1060, 108.6560]
    ];
    const activeRoute: L.LatLngExpression[] = (routePath.length > 0 ? routePath : defaultRoute) as unknown as L.LatLngExpression[];

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
    }

    // Outer glow + Inner sharp trail line
    L.polyline(activeRoute, {
      color: '#38764B',
      weight: 7,
      opacity: 0.45,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(layer);

    const mainLine = L.polyline(activeRoute, {
      color: '#4ADE80',
      weight: 3.5,
      opacity: 0.95,
      dashArray: '5, 8',
      lineCap: 'round'
    }).addTo(layer);
    routeLayerRef.current = mainLine;

    // 2. Summit Marker (e.g. Bidoup 2,287m)
    const lastCoord = activeRoute[activeRoute.length - 1];
    const summitCoords: L.LatLngExpression = lastCoord || ([12.1060, 108.6560] as unknown as L.LatLngExpression);
    const summitIcon = L.divIcon({
      className: 'custom-summit-icon',
      html: `
        <div style="display:flex; align-items:center; gap:5px; background: rgba(18,22,19,0.92); border: 1.5px solid #F2B832; padding: 3px 10px; border-radius: 999px; box-shadow: 0 4px 15px rgba(0,0,0,0.6); transform: translate(-50%, -100%); backdrop-filter: blur(4px);">
          <span style="color:#F2B832; font-size:12px; font-weight:bold;">▲</span>
          <span style="color:#FFFFFF; font-size:11px; font-weight:700; white-space:nowrap; letter-spacing:0.5px;">${summitAltitude}</span>
        </div>
      `,
      iconSize: [85, 26],
      iconAnchor: [42, 26]
    });
    L.marker(summitCoords, { icon: summitIcon }).addTo(layer);

    // 3. Waypoints
    waypoints.forEach((wp) => {
      let iconHtml = '📍';
      let bgColor = '#38764B';
      if (wp.type === 'water') {
        iconHtml = '💧';
        bgColor = '#2563EB';
      } else if (wp.type === 'camp') {
        iconHtml = '⛺';
        bgColor = '#D97706';
      } else if (wp.type === 'photo') {
        iconHtml = '📸';
        bgColor = '#059669';
      } else if (wp.type === 'alert') {
        iconHtml = '⚠️';
        bgColor = '#DC2626';
      }

      const wpIcon = L.divIcon({
        className: 'custom-wp-icon',
        html: `
          <div style="width:28px; height:28px; background:${bgColor}; border:2px solid #FFFFFF; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; box-shadow:0 3px 10px rgba(0,0,0,0.6); cursor:pointer; transform: scale(1); transition: transform 0.2s;">
            ${iconHtml}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const m = L.marker([wp.lat, wp.lng], { icon: wpIcon }).addTo(layer);
      m.bindPopup(`
        <div style="font-family:inherit; min-width:150px; padding:4px;">
          <div style="font-weight:bold; color:#FFFFFF; font-size:13px;">${wp.name}</div>
          <div style="font-size:11px; color:#A5B4A8; margin-top:2px;">Loại: <span style="color:#4ADE80; font-weight:600;">${wp.type.toUpperCase()}</span> ${wp.dist ? `· ${wp.dist}` : ''}</div>
          ${wp.note ? `<div style="font-size:11px; color:#F2B832; margin-top:4px;">${wp.note}</div>` : ''}
        </div>
      `);
      if (onWaypointClick) {
        m.on('click', () => onWaypointClick(wp));
      }
    });

    // 4. Crew Members (ML, TT, AN, QH)
    if (showCrew && crewMembers.length > 0) {
      crewMembers.forEach((member) => {
        const isMe = member.id === 'tt';
        const memberIcon = L.divIcon({
          className: 'custom-crew-icon',
          html: `
            <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
              <div style="width:30px; height:30px; border-radius:50%; background:${isMe ? '#F2B832' : '#38764B'}; border:2.5px solid #FFFFFF; display:flex; align-items:center; justify-content:center; color:#FFFFFF; font-size:11px; font-weight:bold; box-shadow: 0 4px 12px rgba(0,0,0,0.7);">
                ${member.initials}
              </div>
              <div style="background: rgba(18,22,19,0.9); color:#FFFFFF; font-size:9px; font-weight:600; padding:1.5px 5px; border-radius:4px; margin-top:3px; white-space:nowrap; border:1px solid #2E3B32;">
                ${member.name}
              </div>
            </div>
          `,
          iconSize: [40, 44],
          iconAnchor: [20, 22]
        });

        const crewMarker = L.marker([member.lat, member.lng], { icon: memberIcon }).addTo(layer);
        crewMarker.bindPopup(`
          <div style="font-size:12px; color:#FFFFFF;">
            <div style="font-weight:bold; font-size:13px; color:#4ADE80;">${member.name}</div>
            <div style="color:#A5B4A8; font-size:11px; margin-top:2px;">Trạng thái: ${member.status}</div>
            <div style="color:#A5B4A8; font-size:11px;">Độ cao: ${member.altitude}m · Tốc độ: ${member.speed}</div>
            <div style="color:#A5B4A8; font-size:11px;">Mức pin balo: ${member.battery}</div>
            <div style="color:#F2B832; font-size:11px; margin-top:4px; font-weight:600;">Khoảng cách tới bạn: ${member.distanceToMe}</div>
          </div>
        `);
      });
    }

    // 5. User Position Beacon & Accuracy circle
    const userTarget = realPosition || center;
    const userBeaconIcon = L.divIcon({
      className: 'user-beacon',
      html: `
        <div style="position:relative; width:22px; height:22px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:34px; height:34px; border-radius:50%; background:rgba(59,130,246,0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width:16px; height:16px; border-radius:50%; background:#2563EB; border:3px solid #FFFFFF; box-shadow:0 0 12px rgba(37,99,235,0.9); z-index:2;"></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userTarget);
    } else {
      userMarkerRef.current = L.marker(userTarget, { icon: userBeaconIcon, zIndexOffset: 1000 }).addTo(layer);
    }

    // Draw accuracy circle if real GPS is present
    if (realPosition && gpsAccuracy) {
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng(realPosition).setRadius(gpsAccuracy);
      } else {
        accuracyCircleRef.current = L.circle(realPosition, {
          radius: gpsAccuracy,
          color: '#3B82F6',
          weight: 1,
          opacity: 0.6,
          fillColor: '#3B82F6',
          fillOpacity: 0.12
        }).addTo(layer);
      }
    }
  }, [center, waypoints, routePath, showCrew, crewMembers, realPosition, summitAltitude, gpsAccuracy]);

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-[#2E3B32] bg-[#121613] shadow-xl isolate z-0 ${className} ${
      isFullscreen ? 'fixed inset-3 z-[8000] h-auto max-h-none' : ''
    }`} style={{ height: isFullscreen ? 'auto' : height }}>
      {/* Map Context Bar */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 bg-[#1B221D]/92 backdrop-blur-md border border-[#2E3B32] px-3.5 py-1.5 rounded-full shadow-lg">
        <MapPin size={13} className="text-[#4ADE80]" />
        <div>
          <span className="text-xs font-bold text-white mr-1.5">{placeName}</span>
          <span className="text-[10px] text-[#A5B4A8]">
            {realPosition ? `GPS Live ±${gpsAccuracy || 5}m` : 'Mapbox Outdoors · Demo'}
          </span>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-2">
        {/* Layer Style Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            title="Đổi kiểu bản đồ Mapbox"
            className="p-2 rounded-full bg-[#1B221D]/90 hover:bg-[#252F28] border border-[#2E3B32] text-white shadow-lg transition-all"
          >
            <Layers size={14} className={mapStyle === 'outdoors' ? 'text-[#4ADE80]' : mapStyle === 'satellite' ? 'text-[#F2B832]' : 'text-blue-400'} />
          </button>

          {/* Style Dropdown Menu */}
          {showStyleMenu && (
            <div className="absolute right-0 top-10 w-44 bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-1.5 shadow-2xl space-y-1 text-xs z-[500] animate-in fade-in">
              <div className="text-[10px] font-bold text-[#A5B4A8] px-2 py-1 uppercase tracking-wider">
                Kiểu bản đồ Mapbox
              </div>
              <button
                onClick={() => switchMapStyle('outdoors')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                  mapStyle === 'outdoors' ? 'bg-[#38764B] text-white font-bold' : 'text-[#A5B4A8] hover:text-white hover:bg-[#252F28]'
                }`}
              >
                <span>🏔️ Địa hình Outdoors</span>
                {mapStyle === 'outdoors' && <span className="text-[10px]">✓</span>}
              </button>
              <button
                onClick={() => switchMapStyle('dark')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                  mapStyle === 'dark' ? 'bg-[#38764B] text-white font-bold' : 'text-[#A5B4A8] hover:text-white hover:bg-[#252F28]'
                }`}
              >
                <span>🌙 Ban đêm Dark</span>
                {mapStyle === 'dark' && <span className="text-[10px]">✓</span>}
              </button>
              <button
                onClick={() => switchMapStyle('satellite')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                  mapStyle === 'satellite' ? 'bg-[#38764B] text-white font-bold' : 'text-[#A5B4A8] hover:text-white hover:bg-[#252F28]'
                }`}
              >
                <span>🛰️ Vệ tinh thực địa</span>
                {mapStyle === 'satellite' && <span className="text-[10px]">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Locate User Real GPS */}
        <button
          onClick={locateUserGps}
          title="Bắt GPS vị trí thực tế của bạn"
          className={`p-2 rounded-full border border-[#2E3B32] shadow-lg transition-all ${
            gpsActive ? 'bg-[#2563EB] text-white ring-2 ring-blue-400' : 'bg-[#1B221D]/90 text-[#A5B4A8] hover:text-white'
          }`}
        >
          <Locate size={14} className={gpsActive ? 'animate-pulse' : ''} />
        </button>

        {/* Focus Trail Button */}
        <button
          onClick={focusTrail}
          title="Xem cung trek Bidoup"
          className="p-2 rounded-full bg-[#1B221D]/90 border border-[#2E3B32] text-[#A5B4A8] hover:text-white shadow-lg"
        >
          <Crosshair size={14} />
        </button>

        {/* Compass N */}
        <div
          onClick={focusTrail}
          className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full bg-[#1B221D]/90 border border-[#2E3B32] text-xs font-bold text-white shadow-lg hover:border-[#38764B]"
          title="Hướng Bắc (Chạm để đặt lại góc nhìn)"
        >
          <span className="text-[#E04838]">N</span>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => {
            setIsFullscreen(!isFullscreen);
            setTimeout(() => {
              if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
            }, 300);
          }}
          className="p-2 rounded-full bg-[#1B221D]/90 border border-[#2E3B32] text-[#A5B4A8] hover:text-white shadow-lg"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Footer Note & Scale */}
      <div className="absolute bottom-2.5 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 bg-[#121613]/90 backdrop-blur-md border border-[#2E3B32] px-3 py-1 rounded-full text-[11px] text-[#A5B4A8] pointer-events-auto shadow-md">
          <Flag size={12} className="text-[#4ADE80]" />
          <span>{routeNote}</span>
        </div>
        <div className="text-[10px] font-mono text-[#A5B4A8] bg-[#121613]/90 backdrop-blur-md border border-[#2E3B32] px-2.5 py-0.5 rounded-full shadow-md">
          Mapbox Outdoors · 500m ━
        </div>
      </div>
    </div>
  );
};
