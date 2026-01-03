import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaCrosshairs } from 'react-icons/fa';
import { Button } from 'react-bootstrap';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks and updates
const MapEvents = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });
    return null;
};

// Component to update map center when coordinates change externally
const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const LocationPicker = ({ initialLat, initialLng, onLocationSelect }) => {
    const [position, setPosition] = useState(initialLat && initialLng ? [initialLat, initialLng] : [19.0760, 72.8777]); // Default to Mumbai
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition([initialLat, initialLng]);
        }
    }, [initialLat, initialLng]);

    const handleCurrentLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const newPos = [latitude, longitude];
                    setPosition(newPos);
                    onLocationSelect({ lat: latitude, lng: longitude });
                    setLoading(false);
                },
                (error) => {
                    console.error("Error getting location", error);
                    alert("Could not get your location. Please check permissions.");
                    setLoading(false);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    };

    const handleMarkerDragEnd = (event) => {
        const marker = event.target;
        const position = marker.getLatLng();
        setPosition([position.lat, position.lng]);
        onLocationSelect(position);
    };

    const handleMapClick = (latlng) => {
        setPosition([latlng.lat, latlng.lng]);
        onLocationSelect(latlng);
    };

    return (
        <div className="position-relative" style={{ height: '100%', minHeight: '300px', width: '100%' }}>
            <MapContainer
                center={position}
                zoom={15}
                style={{ height: '100%', width: '100%', borderRadius: '12px' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <Marker
                    position={position}
                    draggable={true}
                    eventHandlers={{
                        dragend: handleMarkerDragEnd,
                    }}
                >
                    <Popup>Delivery Location</Popup>
                </Marker>
                <MapEvents onLocationSelect={handleMapClick} />
                <ChangeView center={position} />
            </MapContainer>

            <Button
                variant="light"
                className="position-absolute shadow-sm d-flex align-items-center gap-2"
                style={{ bottom: '20px', left: '20px', zIndex: 1000, fontWeight: '500' }}
                onClick={handleCurrentLocation}
                disabled={loading}
            >
                <FaCrosshairs className={loading ? "spinner-border spinner-border-sm" : "text-primary"} />
                {loading ? "Locating..." : "Go to current location"}
            </Button>
        </div>
    );
};

export default LocationPicker;
