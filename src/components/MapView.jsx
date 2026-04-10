import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { useState, useEffect } from "react"
import { Map as MapIcon, Layers, Trash2 } from "lucide-react"

// Leaflet heatmap plugin needs special handling or a library
// For a hackathon, we can use simple circles for heatmap effect if the library is not available
// or just standard markers with better icons

function getColor(severity) {
    if (severity === "high") return "#ef4444" // red-500
    if (severity === "medium") return "#f59e0b" // amber-500
    return "#22c55e" // green-500
}

function createIcon(color) {
    return L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    })
}

function MapClickHandler({ setLocation }) {
    useMapEvents({
        click(e) {
            setLocation(e.latlng)
        }
    })
    return null
}

export default function MapView({ reports, setLocation, onClaim }) {
    const [showHeatmap, setShowHeatmap] = useState(false)

    return (
        <div className="relative w-full h-full min-h-[100vh]">
            <MapContainer 
                center={[20.5937, 78.9629]} 
                zoom={5} 
                className="w-full h-full"
                zoomControl={false}
            >
                <TileLayer 
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                <MapClickHandler setLocation={setLocation} />

                {reports.map((r) => (
                    <Marker
                        key={r.id}
                        position={[r.lat, r.lng]}
                        icon={createIcon(getColor(r.severity))}
                    >
                        <Popup className="premium-popup">
                            <div className="p-1 space-y-2 min-w-[150px]">
                                <img src={r.imageUrl} className="w-full h-32 object-cover rounded-lg shadow-md" alt="Waste" />
                                <div className="flex justify-between items-center text-xs opacity-70">
                                    <span>Severity: {r.severity.toUpperCase()}</span>
                                    <span>Status: {r.status}</span>
                                </div>
                                {r.status === "reported" && (
                                    <button 
                                        onClick={() => onClaim(r.id)}
                                        className="w-full py-2 bg-primary text-dark font-bold rounded-md hover:bg-primary/90 transition-all text-sm"
                                    >
                                        Claim Pickup
                                    </button>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Float Controls */}
            <div className="fixed bottom-32 right-6 z-[1000] flex flex-col gap-3">
                <button 
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`p-3 rounded-full shadow-2xl transition-all ${showHeatmap ? 'bg-primary text-dark' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                >
                    <Layers size={24} />
                </button>
            </div>
        </div>
    )
}