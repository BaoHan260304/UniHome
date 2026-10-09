import { useEffect, useRef, useState } from 'react';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  address?: string;
  preferredArea?: string;
}

interface LocationPickerProps {
  latitude?: number | string | null;
  longitude?: number | string | null;
  address?: string;
  preferredArea?: string;
  onChange: (loc: LocationCoordinates) => void;
  label?: string;
  showPresets?: boolean;
}

export const CAMPUS_PRESETS = [
  // TP. Hồ Chí Minh
  { name: 'ĐHQG TP.HCM - Làng Đại học Thủ Đức', lat: 10.8752, lng: 106.8016, city: 'TP.HCM' },
  { name: 'ĐH Bách Khoa TP.HCM (Cơ sở 1 - Q.10)', lat: 10.7725, lng: 106.6598, city: 'TP.HCM' },
  { name: 'ĐH Kinh Tế TP.HCM - UEH (Cơ sở B - Q.10)', lat: 10.7601, lng: 106.6669, city: 'TP.HCM' },
  { name: 'ĐH Sư Phạm Kỹ Thuật TP.HCM (Thủ Đức)', lat: 10.8507, lng: 106.7719, city: 'TP.HCM' },
  { name: 'ĐH FPT TP.HCM (Khu Công Nghệ Cao - TP. Thủ Đức)', lat: 10.8415, lng: 106.8099, city: 'TP.HCM' },
  { name: 'ĐH Tôn Đức Thắng (Quận 7)', lat: 10.7326, lng: 106.6992, city: 'TP.HCM' },
  // Hà Nội
  { name: 'ĐH FPT Hà Nội (Khu CNC Hòa Lạc)', lat: 21.0133, lng: 105.5278, city: 'Hà Nội' },
  { name: 'ĐHQG Hà Nội (Cơ sở Hòa Lạc)', lat: 21.0045, lng: 105.5098, city: 'Hà Nội' },
  { name: 'ĐH Bách Khoa Hà Nội (Hai Bà Trưng)', lat: 21.0056, lng: 105.8433, city: 'Hà Nội' },
  { name: 'ĐHQG Hà Nội (Xuân Thủy - Cầu Giấy)', lat: 21.0368, lng: 105.7828, city: 'Hà Nội' },
  { name: 'ĐH Kinh Tế Quốc Dân (Hai Bà Trưng)', lat: 21.0003, lng: 105.8427, city: 'Hà Nội' },
  { name: 'ĐH Ngoại Thương (Chùa Láng - Đống Đa)', lat: 21.0227, lng: 105.8045, city: 'Hà Nội' }
];

declare global {
  interface Window {
    google?: any;
    initGoogleMapsCallback?: () => void;
  }
}

export default function LocationPicker({
  latitude,
  longitude,
  address = '',
  preferredArea = '',
  onChange,
  label = 'Vị trí & Tọa độ mong muốn',
  showPresets = true
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerInstance, setMarkerInstance] = useState<any>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string>('');

  const numLat = latitude ? Number(latitude) : 10.8752; // Default to Thu Duc University Village
  const numLng = longitude ? Number(longitude) : 106.8016;

  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;

  // Try to load Google Maps JS SDK if API key is provided
  useEffect(() => {
    if (!apiKey) {
      setMapLoadError(true);
      return;
    }

    if (window.google?.maps) {
      setMapsLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapsLoaded(true);
      script.onerror = () => setMapLoadError(true);
      document.head.appendChild(script);
    } else {
      const existing = document.getElementById(scriptId) as HTMLScriptElement;
      if (existing) {
        existing.addEventListener('load', () => setMapsLoaded(true));
        existing.addEventListener('error', () => setMapLoadError(true));
      }
    }
  }, [apiKey]);

  // Initialize Google Maps instance when script is loaded
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || !window.google?.maps || mapLoadError) return;

    try {
      const center = { lat: numLat, lng: numLng };
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      const marker = new window.google.maps.Marker({
        position: center,
        map,
        draggable: true,
        animation: window.google.maps.Animation.DROP
      });

      marker.addListener('dragend', (evt: any) => {
        const newLat = Number(evt.latLng.lat().toFixed(6));
        const newLng = Number(evt.latLng.lng().toFixed(6));
        reverseGeocode(newLat, newLng);
      });

      map.addListener('click', (evt: any) => {
        const newLat = Number(evt.latLng.lat().toFixed(6));
        const newLng = Number(evt.latLng.lng().toFixed(6));
        marker.setPosition(evt.latLng);
        reverseGeocode(newLat, newLng);
      });

      setMapInstance(map);
      setMarkerInstance(marker);
    } catch {
      setMapLoadError(true);
    }
  }, [mapsLoaded, mapLoadError]);

  const reverseGeocode = (lat: number, lng: number) => {
    if (window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
        if (status === 'OK' && results?.[0]) {
          const addr = results[0].formatted_address;
          onChange({ latitude: lat, longitude: lng, address: addr, preferredArea: addr });
        } else {
          onChange({ latitude: lat, longitude: lng });
        }
      });
    } else {
      onChange({ latitude: lat, longitude: lng });
    }
  };

  const handleSelectPreset = (preset: typeof CAMPUS_PRESETS[0]) => {
    onChange({
      latitude: preset.lat,
      longitude: preset.lng,
      address: preset.name,
      preferredArea: preset.name
    });

    if (mapInstance && markerInstance && window.google?.maps) {
      const pos = { lat: preset.lat, lng: preset.lng };
      mapInstance.setCenter(pos);
      mapInstance.setZoom(15);
      markerInstance.setPosition(pos);
    }
  };

  const handleUseDeviceGps = () => {
    setGpsStatus('Đang lấy vị trí GPS từ thiết bị...');
    if (!navigator.geolocation) {
      setGpsStatus('Thiết bị không hỗ trợ định vị GPS');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setGpsStatus('✓ Đã nhận diện vị trí GPS thiết bị thành công');
        onChange({ latitude: lat, longitude: lng });

        if (mapInstance && markerInstance && window.google?.maps) {
          const newPos = { lat, lng };
          mapInstance.setCenter(newPos);
          markerInstance.setPosition(newPos);
        }
      },
      (err) => {
        setGpsStatus(`Không lấy được GPS (${err.message || 'Bị từ chối'}). Vui lòng chọn điểm mốc bên dưới.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
          <span>📍</span> {label}
        </label>
        <button
          type="button"
          onClick={handleUseDeviceGps}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>🎯</span> Lấy GPS thiết bị hiện tại
        </button>
      </div>

      {gpsStatus && (
        <div className={`text-xs px-3 py-1.5 rounded-xl ${gpsStatus.startsWith('✓') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
          {gpsStatus}
        </div>
      )}

      {/* Interactive Map (if Google Maps SDK loaded) */}
      {mapsLoaded && !mapLoadError && (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xs">
          <div ref={mapRef} className="w-full h-64 bg-gray-100" />
          <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl text-xs text-gray-600 border border-gray-200 shadow-sm flex items-center justify-between">
            <span>Kéo marker hoặc click bản đồ để ghim vị trí</span>
            <span className="font-mono text-indigo-600 font-bold">
              {latitude ? `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}` : 'Chưa ghim'}
            </span>
          </div>
        </div>
      )}

      {/* Preset Hubs */}
      {showPresets && (
        <div>
          <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center justify-between">
            <span>Điểm mốc / Cụm trường Đại học phổ biến:</span>
            <span className="text-[11px] text-gray-400">Nhấn để chọn nhanh</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {CAMPUS_PRESETS.map((p) => {
              const isSelected =
                latitude &&
                Math.abs(Number(latitude) - p.lat) < 0.002 &&
                Math.abs(Number(longitude) - p.lng) < 0.002;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`text-xs px-2.5 py-1.5 rounded-xl font-medium transition-all border text-left flex items-center gap-1 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-[10px] opacity-70">[{p.city}]</span>
                  <span>{p.name.split(' (')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual / Fine-tuning Coordinates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Vĩ độ (Latitude)</label>
          <input
            type="number"
            step="0.000001"
            value={latitude ?? ''}
            onChange={(e) =>
              onChange({
                latitude: Number(e.target.value),
                longitude: Number(longitude || 0),
                address,
                preferredArea
              })
            }
            placeholder="VD: 10.8752"
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Kinh độ (Longitude)</label>
          <input
            type="number"
            step="0.000001"
            value={longitude ?? ''}
            onChange={(e) =>
              onChange({
                latitude: Number(latitude || 0),
                longitude: Number(e.target.value),
                address,
                preferredArea
              })
            }
            placeholder="VD: 106.8016"
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
          />
        </div>
      </div>

      {/* Selected location display summary */}
      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
        <span className="text-gray-500">
          Tọa độ hiện tại: <span className="font-mono text-gray-900 font-semibold">{latitude ? `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}` : 'Chưa chọn'}</span>
        </span>
        {latitude && (
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            ✓ Đã xác định
          </span>
        )}
      </div>
    </div>
  );
}
