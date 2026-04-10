import { useEffect, useState, useCallback } from "react"
import {
    collection, onSnapshot, doc, updateDoc,
    query, orderBy, limit
} from "firebase/firestore"
import { db } from "./firebase"
import { Leaf, BarChart3, Users, Bell } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import MapView   from "./components/MapView"
import ReportForm from "./components/ReportForm"
import Dashboard  from "./components/Dashboard"
import Toast      from "./components/Toast"

function App() {
    const [reports, setReports]             = useState([])
    const [location, setLocation]           = useState(null)
    const [recentActivity, setRecentActivity] = useState([])
    const [toasts, setToasts]               = useState([])
    const [sidebarOpen, setSidebarOpen]     = useState(true)

    // Push a toast notification
    const pushToast = useCallback((msg, type = "info") => {
        const id = Date.now()
        setToasts(t => [...t, { id, msg, type }])
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
    }, [])

    useEffect(() => {
        // All reports — map + stats
        const unsub = onSnapshot(collection(db, "reports"), (snap) => {
            setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        }, (err) => {
            console.error(err)
            pushToast("Firebase connection failed", "error")
        })

        // Recent 5 for activity feed
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(5))
        const unsubActivity = onSnapshot(q, (snap) => {
            setRecentActivity(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        })

        return () => { unsub(); unsubActivity() }
    }, [])

    const handleClaim = async (id) => {
        await updateDoc(doc(db, "reports", id), { status: "in_progress" })
        pushToast("Pickup claimed! En route 🚛", "success")
    }

    const handleMarkCleaned = async (id) => {
        await updateDoc(doc(db, "reports", id), { status: "cleaned" })
        pushToast("Marked as cleaned! +10 XP 🌿", "success")
    }

    return (
        <div style={{ position: "relative", height: "100vh", overflow: "hidden", background: "#060b14" }}>

            {/* ── Logo / Brand ── */}
            <div style={{
                position: "fixed", top: 20, left: 20, zIndex: 2000,
                display: "flex", alignItems: "center", gap: 10
            }}>
                <div style={{
                    background: "linear-gradient(135deg,#22c55e,#16a34a)",
                    padding: "8px", borderRadius: "10px",
                    boxShadow: "0 0 20px rgba(34,197,94,0.40)"
                }}>
                    <Leaf size={20} color="#060b14" strokeWidth={2.5} />
                </div>
                <span style={{
                    fontSize: "1.35rem", fontWeight: 900, letterSpacing: "-0.03em",
                    background: "linear-gradient(135deg,#22c55e,#3b82f6)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>
                    EcoTrack <span style={{ WebkitTextFillColor: "rgba(255,255,255,0.7)", background: "none" }}>AI</span>
                </span>
            </div>

            {/* ── Stats Dashboard (top-center) ── */}
            <Dashboard reports={reports} />

            {/* ── Map (full screen) ── */}
            <MapView
                reports={reports}
                setLocation={setLocation}
                onClaim={handleClaim}
                onMarkCleaned={handleMarkCleaned}
            />

            {/* ── Report Form (bottom-left) ── */}
            <ReportForm location={location} pushToast={pushToast} />

            {/* ── Right Sidebar ── */}
            <div style={{
                position: "fixed", top: 80, right: 16, zIndex: 1500,
                width: 260, display: "flex", flexDirection: "column", gap: 12,
                transition: "opacity 0.3s", opacity: sidebarOpen ? 1 : 0,
                pointerEvents: sidebarOpen ? "auto" : "none"
            }}>
                {/* Leaderboard */}
                <div className="glass-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <BarChart3 size={16} color="#22c55e" />
                        <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Eco Warriors</span>
                    </div>
                    {[
                        { name: "Priya Sharma", pts: 450, emoji: "🥇" },
                        { name: "Arjun Mehta",  pts: 380, emoji: "🥈" },
                        { name: "Divya Rao",    pts: 310, emoji: "🥉" },
                        { name: "Rahul Nair",   pts: 240, emoji: "⭐" },
                    ].map((u, i) => (
                        <div key={i} style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "center", padding: "6px 0",
                            borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: "1rem" }}>{u.emoji}</span>
                                <span style={{ fontSize: "0.8rem" }}>{u.name}</span>
                            </div>
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#22c55e" }}>{u.pts} XP</span>
                        </div>
                    ))}
                </div>

                {/* Live Activity Feed */}
                <div className="glass-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <Bell size={16} color="#3b82f6" />
                        <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Live Activity</span>
                        <span style={{
                            marginLeft: "auto",
                            background: "#3b82f6", color: "white",
                            fontSize: "0.6rem", fontWeight: 700,
                            borderRadius: "9999px", padding: "1px 6px"
                        }}>LIVE</span>
                    </div>
                    <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                        <AnimatePresence>
                            {recentActivity.length === 0 && (
                                <p style={{ fontSize: "0.75rem", color: "#64748b", textAlign: "center", padding: "12px 0" }}>
                                    No activity yet
                                </p>
                            )}
                            {recentActivity.map((a) => (
                                <motion.div
                                    key={a.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    style={{
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        borderRadius: "0.5rem", padding: "7px 10px",
                                        fontSize: "0.72rem", color: "#94a3b8"
                                    }}
                                >
                                    <span style={{ color: severityColor(a.severity), fontWeight: 700 }}>●</span>
                                    {" "}<span style={{ color: "#e2e8f0" }}>
                                        {a.wasteType || `${a.severity} severity`}
                                    </span>
                                    {" "}reported nearby
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Sidebar toggle */}
            <button
                onClick={() => setSidebarOpen(o => !o)}
                style={{
                    position: "fixed", top: 20, right: 16, zIndex: 2000,
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "0.5rem", padding: "7px 10px",
                    color: "#e2e8f0", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                    backdropFilter: "blur(12px)"
                }}
            >
                <Users size={15} style={{ display: "inline", marginRight: 4 }} />
                {sidebarOpen ? "Hide Panel" : "Show Panel"}
            </button>

            {/* Background ambient glows */}
            <div style={{
                position: "fixed", top: "-15%", left: "-10%",
                width: "45%", height: "45%",
                background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)",
                pointerEvents: "none", zIndex: 0
            }} />
            <div style={{
                position: "fixed", bottom: "-15%", right: "-10%",
                width: "45%", height: "45%",
                background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
                pointerEvents: "none", zIndex: 0
            }} />

            {/* Toast stack */}
            <div style={{
                position: "fixed", bottom: 24, right: 284, zIndex: 9999,
                display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end"
            }}>
                <AnimatePresence>
                    {toasts.map(t => <Toast key={t.id} msg={t.msg} type={t.type} />)}
                </AnimatePresence>
            </div>
        </div>
    )
}

function severityColor(s) {
    if (s === "high")   return "#f87171"
    if (s === "medium") return "#fbbf24"
    return "#4ade80"
}

export default App