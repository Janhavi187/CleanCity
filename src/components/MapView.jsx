import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from "react-leaflet"
import L from "leaflet"
import { useState, useRef } from "react"
import { Layers, Navigation } from "lucide-react"

/* ── Severity colours ── */
const SEV_COLOR = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" }
const SEV_LABEL = { high: "HIGH", medium: "MED", low: "LOW" }

/* ── Custom pulsing SVG marker ── */
function createMarkerIcon(severity) {
    const color = SEV_COLOR[severity] || "#22c55e"
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="42" viewBox="0 0 36 42">
        <circle cx="18" cy="18" r="16" fill="${color}" opacity="0.18"/>
        <circle cx="18" cy="18" r="10" fill="${color}" opacity="0.90"/>
        <circle cx="18" cy="18" r="5"  fill="white"   opacity="1"/>
        <line  x1="18" y1="28" x2="18" y2="42" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`
    return L.divIcon({
        className: "",
        html: svg,
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -44]
    })
}

/* Click-to-pin handler */
function MapClickHandler({ setLocation, pinRef }) {
    useMapEvents({
        click(e) {
            setLocation(e.latlng)
            // Animate pin drop
            if (pinRef.current) {
                pinRef.current.style.display = "block"
                pinRef.current.style.top = e.containerPoint.y + "px"
                pinRef.current.style.left = e.containerPoint.x + "px"
            }
        }
    })
    return null
}

/* Popup card */
function ReportPopup({ r, onClaim, onMarkCleaned }) {
    const color = SEV_COLOR[r.severity] || "#22c55e"
    const statusBadge = {
        reported: { bg: "#1e3a5f", color: "#60a5fa", label: "Reported" },
        in_progress: { bg: "#3d2900", color: "#fbbf24", label: "In Progress" },
        cleaned: { bg: "#0d2e1a", color: "#4ade80", label: "Cleaned ✓" },
    }[r.status] || {}

    return (
        <div style={{ width: 210, overflow: "hidden", borderRadius: "0.75rem" }}>
            {r.imageUrl && (
                <div style={{ position: "relative" }}>
                    <img src={r.imageUrl} alt="Waste"
                        style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                    <span style={{
                        position: "absolute", top: 8, left: 8,
                        background: color + "30", border: `1px solid ${color}60`,
                        color, fontSize: "0.6rem", fontWeight: 800,
                        padding: "2px 7px", borderRadius: "9999px", letterSpacing: "0.06em"
                    }}>
                        {SEV_LABEL[r.severity]}
                    </span>
                </div>
            )}
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                        fontSize: "0.72rem", fontWeight: 700,
                        color: r.wasteType ? "#e2e8f0" : "#64748b"
                    }}>
                        {r.wasteType || "Unknown Type"}
                    </span>
                    <span style={{
                        background: statusBadge.bg, color: statusBadge.color,
                        fontSize: "0.6rem", fontWeight: 700,
                        padding: "2px 8px", borderRadius: "9999px"
                    }}>
                        {statusBadge.label}
                    </span>
                </div>
                <span style={{ fontSize: "0.65rem", color: "#475569" }}>
                    {new Date(r.createdAt).toLocaleString()}
                </span>

                {r.status === "reported" && (
                    <button onClick={() => onClaim(r.id)} style={{
                        background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                        color: "white", fontWeight: 700, fontSize: "0.78rem",
                        padding: "8px", borderRadius: "0.5rem", border: "none",
                        cursor: "pointer", width: "100%"
                    }}>
                        🚛 Claim Pickup
                    </button>
                )}
                {r.status === "in_progress" && (
                    <button onClick={() => onMarkCleaned(r.id)} style={{
                        background: "linear-gradient(135deg,#22c55e,#16a34a)",
                        color: "#060b14", fontWeight: 700, fontSize: "0.78rem",
                        padding: "8px", borderRadius: "0.5rem", border: "none",
                        cursor: "pointer", width: "100%"
                    }}>
                        ✅ Mark as Cleaned
                    </button>
                )}
            </div>
        </div>
    )
}

export default function MapView({ reports, setLocation, onClaim, onMarkCleaned }) {
    const [filter, setFilter] = useState("all")
    const pinRef = useRef(null)

    const visible = filter === "all"
        ? reports
        : reports.filter(r => r.status === filter)

    return (
        <div style={{ position: "relative", width: "100%", height: "100vh" }}>
            <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ width: "100%", height: "100%" }}
                zoomControl={false}
            >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <ZoomControl position="bottomright" />
                <MapClickHandler setLocation={setLocation} pinRef={pinRef} />

                {visible.map(r => (
                    <Marker key={r.id} position={[r.lat, r.lng]} icon={createMarkerIcon(r.severity)}>
                        <Popup closeButton={true} maxWidth={220} minWidth={210}>
                            <ReportPopup r={r} onClaim={onClaim} onMarkCleaned={onMarkCleaned} />
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Filter bar */}
            <div style={{
                position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
                zIndex: 1000, display: "flex", gap: 8,
                background: "rgba(6,11,20,0.80)", backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.10)", borderRadius: "9999px",
                padding: "6px 8px"
            }}>
                {[
                    { key: "all", label: "All", color: "#e2e8f0" },
                    { key: "reported", label: "🔵 Reported", color: "#60a5fa" },
                    { key: "in_progress", label: "🟡 Active", color: "#fbbf24" },
                    { key: "cleaned", label: "🟢 Cleaned", color: "#4ade80" },
                ].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)} style={{
                        padding: "5px 14px", borderRadius: "9999px",
                        border: filter === f.key ? "1px solid " + f.color + "60" : "1px solid transparent",
                        background: filter === f.key ? f.color + "20" : "transparent",
                        color: filter === f.key ? f.color : "#64748b",
                        fontSize: "0.72rem", fontWeight: 700, cursor: "pointer",
                        transition: "all 0.15s ease"
                    }}>{f.label}</button>
                ))}
            </div>

            {/* Map hint */}
            <div style={{
                position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
                zIndex: 1000, display: "flex", alignItems: "center", gap: 6,
                background: "rgba(6,11,20,0.70)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "9999px", padding: "5px 14px",
                fontSize: "0.7rem", color: "#64748b", pointerEvents: "none"
            }}>
                <Navigation size={12} color="#22c55e" />
                Click anywhere on the map to pin a report location
            </div>
        </div>
    )
}