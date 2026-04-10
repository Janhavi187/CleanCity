import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from "react-leaflet"
import L from "leaflet"
import { useState, useRef } from "react"
import { Layers, Navigation, ImagePlus, Camera, Loader2, Sparkles } from "lucide-react"
import { useLanguage } from "../context/LanguageContext"

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

/* Before/After Comparison Card */
function ComparisonCard({ before, after, t }) {
    return (
        <div style={{ display: "flex", gap: 2, height: 100, marginBottom: 8, borderRadius: "0.5rem", overflow: "hidden" }}>
            <div style={{ position: "relative", flex: 1 }}>
                <img src={before} alt="Before" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", bottom: 4, left: 4, background: "rgba(0,0,0,0.6)", color: "white", fontSize: "0.5rem", padding: "1px 4px", borderRadius: 2 }}>{t('before_label')}</span>
            </div>
            <div style={{ position: "relative", flex: 1 }}>
                <img src={after} alt="After" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", bottom: 4, left: 4, background: "rgba(34,197,94,0.8)", color: "white", fontSize: "0.5rem", padding: "1px 4px", borderRadius: 2 }}>{t('after_label')}</span>
            </div>
        </div>
    )
}

/* Popup card */
function ReportPopup({ r, onClaim, onMarkCleaned, user, onRequestAuth, t }) {
    const [isUploading, setIsUploading] = useState(false)
    const [preview, setPreview] = useState(null)
    const fileRef = useRef(null)

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    const color = SEV_COLOR[r.severity] || "#22c55e"
    const statusBadge = {
        reported:      { bg: "#1e3a5f", color: "#60a5fa", label: t('status_reported') },
        in_progress:   { bg: "#3d2900", color: "#fbbf24", label: t('status_in_progress') },
        pending_proof: { bg: "#3d1e00", color: "#f59e0b", label: t('status_pending_proof') },
        cleaned:       { bg: "#0d2e1a", color: "#4ade80", label: t('status_cleaned') },
    }[r.status] || {}

    const isVolunteer = !!user
    const isOwner = user && r.volunteerUid === user.uid

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) setPreview(URL.createObjectURL(file))
    }

    const handleSubmitProof = async () => {
        const file = fileRef.current?.files[0]
        if (!file) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("upload_preset", UPLOAD_PRESET)

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            )
            const data = await res.json()
            await onMarkCleaned(r.id, data.secure_url)
        } catch (error) {
            console.error(error)
            alert(t('t_upload_failed'))
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div style={{ width: 220, overflow: "hidden", borderRadius: "0.75rem" }}>
            {r.status === "cleaned" && r.afterImageUrl ? (
                <ComparisonCard before={r.imageUrl} after={r.afterImageUrl} t={t} />
            ) : r.imageUrl && (
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
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#e2e8f0" }}>
                        {t(r.wasteType) || t('waste_spot')}
                    </span>
                    <span style={{
                        background: statusBadge.bg, color: statusBadge.color,
                        fontSize: "0.6rem", fontWeight: 700,
                        padding: "2px 8px", borderRadius: "9999px"
                    }}>
                        {statusBadge.label}
                    </span>
                </div>

                {r.status === "cleaned" && (
                    <div style={{ fontSize: "0.65rem", color: "#4ade80", fontWeight: 600 }}>
                        {t('pts_earned')} {r.pointsEarned} {t('pts')}
                    </div>
                )}

                {r.status === "reported" && (
                    isVolunteer
                        ? <button onClick={() => onClaim(r.id)} style={{
                            background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                            color: "white", fontWeight: 700, fontSize: "0.78rem",
                            padding: "8px", borderRadius: "0.5rem", border: "none",
                            cursor: "pointer", width: "100%"
                          }}>{t('claim_pickup')}</button>
                        : <button onClick={onRequestAuth} className="btn-outline" style={{ padding: "8px", width: "100%", opacity: 0.8 }}>
                            {t('sign_in_to_clean')}
                          </button>
                )}

                {r.status === "in_progress" && (
                    isOwner ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <input type="file" ref={fileRef} hidden onChange={handleFileChange} accept="image/*" />
                            <button onClick={() => fileRef.current?.click()} style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px dashed rgba(255,255,255,0.2)",
                                borderRadius: "0.5rem", padding: "12px",
                                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                                cursor: "pointer"
                            }}>
                                {preview ? (
                                    <img src={preview} style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 4 }} />
                                ) : (
                                    <>
                                        <Camera size={20} color="#94a3b8" />
                                        <span style={{ fontSize: "0.6rem", color: "#94a3b8" }}>{t('upload_proof')}</span>
                                    </>
                                )}
                            </button>
                            <button 
                                disabled={!preview || isUploading}
                                onClick={handleSubmitProof} 
                                style={{
                                    background: "linear-gradient(135deg,#22c55e,#16a34a)",
                                    color: "#060b14", fontWeight: 700, fontSize: "0.78rem",
                                    padding: "8px", borderRadius: "0.5rem", border: "none",
                                    cursor: "pointer", opacity: (!preview || isUploading) ? 0.5 : 1
                                }}
                            >
                                {isUploading ? <Loader2 size={16} className="animate-spin" style={{ margin: "auto" }} /> : t('submit_proof')}
                            </button>
                        </div>
                    ) : (
                        <div style={{ fontSize: "0.65rem", color: "#64748b", fontStyle: "italic", textAlign: "center", padding: "4px" }}>
                            {t('claimed_by_other')}
                        </div>
                    )
                )}

                {r.status === "pending_proof" && (
                    <div style={{ fontSize: "0.65rem", color: "#f59e0b", background: "#f59e0b10", padding: "8px", borderRadius: "0.5rem", textAlign: "center" }}>
                        {t('working_on_cleanup')}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function MapView({ reports, setLocation, onClaim, onMarkCleaned, user, onRequestAuth, theme }) {
    const { t } = useLanguage()
    const [filter, setFilter] = useState("all")
    const pinRef = useRef(null)

    const visible = filter === "all"
        ? reports
        : reports.filter(r => r.status === filter)

    const tileUrl = theme === "light"
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

    return (
        <div style={{ position: "relative", width: "100%", height: "100vh" }}>
            <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ width: "100%", height: "100%" }}
                zoomControl={false}
            >
                <TileLayer url={tileUrl} />
                <ZoomControl position="bottomright" />
                <MapClickHandler setLocation={setLocation} pinRef={pinRef} />

                {visible.map(r => (
                    <Marker key={r.id} position={[r.lat, r.lng]} icon={createMarkerIcon(r.severity)}>
                        <Popup closeButton={true} maxWidth={240} minWidth={220}>
                            <ReportPopup
                                r={r}
                                onClaim={onClaim}
                                onMarkCleaned={onMarkCleaned}
                                user={user}
                                onRequestAuth={onRequestAuth}
                                t={t}
                            />
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