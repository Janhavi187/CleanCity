import { useEffect, useState, useCallback } from "react"
import {
    collection, onSnapshot, doc, updateDoc, setDoc,
    query, orderBy, limit, getDoc
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { db, auth } from "./firebase"
import { Leaf, Users, Bell, LogIn, Sun, Moon, Languages } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useLanguage } from "./context/LanguageContext"

import MapView from "./components/MapView"
import ReportForm from "./components/ReportForm"
import Dashboard from "./components/Dashboard"
import Toast from "./components/Toast"
import AuthModal from "./components/AuthModal"
import Leaderboard from "./components/Leaderboard"

/* Points per severity */
const SEVERITY_POINTS = { low: 10, medium: 25, high: 50 }

function App() {
    const { t, language, toggleLanguage } = useLanguage()
    const [reports, setReports] = useState([])
    const [location, setLocation] = useState(null)
    const [recentActivity, setRecentActivity] = useState([])
    const [toasts, setToasts] = useState([])
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [user, setUser] = useState(null)
    const [showAuth, setShowAuth] = useState(false)
    const [theme, setTheme] = useState(() => localStorage.getItem("eco-theme") || "dark")

    /* ── Theme effect ── */
    useEffect(() => {
        if (theme === "light") {
            document.body.classList.add("light-theme")
        } else {
            document.body.classList.remove("light-theme")
        }
        localStorage.setItem("eco-theme", theme)
    }, [theme])

    const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark")

    /* ── Auth listener ── */
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u || null))
        return () => unsub()
    }, [])

    /* ── Push a toast notification ── */
    const pushToast = useCallback((msg, type = "info") => {
        const id = Date.now()
        setToasts(t => [...t, { id, msg, type }])
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
    }, [])

    /* ── Firestore listeners ── */
    useEffect(() => {
        // All reports — map + stats
        const unsub = onSnapshot(collection(db, "reports"), (snap) => {
            setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        }, (err) => {
            console.error(err)
            pushToast(t('t_connection_fail'), "error")
        })

        // Recent 5 for activity feed
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(5))
        const unsubActivity = onSnapshot(q, (snap) => {
            setRecentActivity(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        })

        return () => { unsub(); unsubActivity() }
    }, [])

    /* ── Claim a pickup (requires sign-in) ── */
    const handleClaim = async (id) => {
        if (!user) { setShowAuth(true); return }
        await updateDoc(doc(db, "reports", id), {
            status: "in_progress",
            volunteerUid: user.uid,
            volunteerName: user.displayName,
            volunteerPhoto: user.photoURL || ""
        })
        pushToast(t('t_pickup_claimed'), "success")
    }

    /* ── Mark as cleaned + award points ── */
    const handleMarkCleaned = async (id, afterImageUrl = null) => {
        if (!user) { setShowAuth(true); return }

        // If no afterImageUrl is provided, we move to 'pending_proof' 
        // (though in the UI we will try to ensure it's provided)
        const finalStatus = afterImageUrl ? "cleaned" : "pending_proof"

        // Get the report to find severity
        const reportSnap = await getDoc(doc(db, "reports", id))
        if (!reportSnap.exists()) return
        const reportData = reportSnap.data()
        
        const pts = SEVERITY_POINTS[reportData.severity] || 10

        // Update the report
        await updateDoc(doc(db, "reports", id), {
            status: finalStatus,
            pointsEarned: afterImageUrl ? pts : 0,
            cleanedByUid: user.uid,
            cleanedByName: user.displayName,
            afterImageUrl: afterImageUrl || ""
        })

        // Upsert volunteer score in volunteers collection only if fully cleaned
        if (afterImageUrl) {
            const volRef = doc(db, "volunteers", user.uid)
            const volSnap = await getDoc(volRef)
            if (volSnap.exists()) {
                const existing = volSnap.data()
                await setDoc(volRef, {
                    name: user.displayName,
                    photoURL: user.photoURL || "",
                    totalScore: (existing.totalScore || 0) + pts,
                    cleanupCount: (existing.cleanupCount || 0) + 1
                })
            } else {
                await setDoc(volRef, {
                    name: user.displayName,
                    photoURL: user.photoURL || "",
                    totalScore: pts,
                    cleanupCount: 1
                })
            }
            pushToast(t('t_spot_cleaned').replace('{pts}', pts), "success")
        } else {
            pushToast(t('t_proof_pending'), "info")
        }
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
                user={user}
                onRequestAuth={() => setShowAuth(true)}
                theme={theme}
            />

            {/* ── Report Form (bottom-left) ── */}
            <ReportForm location={location} pushToast={pushToast} user={user} />

            {/* ── Right Sidebar ── */}
            <div style={{
                position: "fixed", top: 80, right: 16, zIndex: 1500,
                width: 260, display: "flex", flexDirection: "column", gap: 12,
                transition: "opacity 0.3s", opacity: sidebarOpen ? 1 : 0,
                pointerEvents: sidebarOpen ? "auto" : "none"
            }}>
                {/* Live Leaderboard */}
                <div className="glass-card">
                    <Leaderboard />
                </div>

                {/* Live Activity Feed */}
                <div className="glass-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <Bell size={16} color="#3b82f6" />
                        <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{t('live_activity')}</span>
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
                                    {t('no_activity')}
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
                                        {t(a.wasteType) || `${a.severity} severity`}
                                    </span>
                                    {" "}{t('reported_nearby')}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Volunteer sign-in card */}
                {!user && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{ textAlign: "center", padding: "1rem" }}
                    >
                        <p style={{ margin: "0 0 6px", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>
                            {t('want_to_help')}
                        </p>
                        <p style={{ margin: "0 0 12px", fontSize: "0.7rem", color: "#475569" }}>
                            {t('sign_in_desc')}
                        </p>
                        <button
                            onClick={() => setShowAuth(true)}
                            style={{
                                width: "100%", padding: "8px",
                                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                                border: "none", borderRadius: "0.5rem",
                                color: "#060b14", fontWeight: 700, fontSize: "0.8rem",
                                cursor: "pointer", display: "flex",
                                alignItems: "center", justifyContent: "center", gap: 6
                            }}
                        >
                            <LogIn size={14} /> {t('volunteer_sign_in')}
                        </button>
                    </motion.div>
                )}

                {/* Signed-in volunteer chip */}
                {user && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "0.75rem 1rem", cursor: "pointer"
                        }}
                        onClick={() => setShowAuth(true)}
                    >
                        {user.photoURL
                            ? <img src={user.photoURL} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(34,197,94,0.5)" }} />
                            : <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#22c55e20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>👤</div>
                        }
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {user.displayName}
                            </p>
                            <p style={{ margin: 0, fontSize: "0.65rem", color: "#22c55e" }}>{t('volunteer_verified')}</p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Sidebar toggle + Theme toggle + Language toggle */}
            <div style={{ position: "fixed", top: 20, right: 16, zIndex: 2000, display: "flex", gap: 8 }}>
                {/* Language toggle */}
                <button
                    onClick={toggleLanguage}
                    title={language === "en" ? "हिन्दी में बदलें" : "Switch to English"}
                    style={{
                        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "0.5rem", padding: "5px 10px",
                        color: "#e2e8f0", cursor: "pointer",
                        backdropFilter: "blur(12px)",
                        display: "flex", alignItems: "center", gap: 5,
                        transition: "background 0.2s, border-color 0.2s",
                        fontWeight: 700, fontSize: "0.78rem"
                    }}
                >
                    <Languages size={14} />
                    {language === "en" ? "हि" : "EN"}
                </button>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    style={{
                        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "0.5rem", padding: "7px 9px",
                        color: "#e2e8f0", cursor: "pointer",
                        backdropFilter: "blur(12px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 0.2s, border-color 0.2s"
                    }}
                >
                    {theme === "dark"
                        ? <Sun size={15} color="#fbbf24" />
                        : <Moon size={15} color="#3b82f6" />}
                </button>

                {/* Sidebar toggle */}
                <button
                    onClick={() => setSidebarOpen(o => !o)}
                    style={{
                        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "0.5rem", padding: "7px 10px",
                        color: "#e2e8f0", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                        backdropFilter: "blur(12px)"
                    }}
                >
                    <Users size={15} style={{ display: "inline", marginRight: 4 }} />
                    {sidebarOpen ? t('hide_panel') : t('show_panel')}
                </button>
            </div>

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

            {/* Auth Modal */}
            {showAuth && <AuthModal user={user} onClose={() => setShowAuth(false)} />}
        </div>
    )
}

function severityColor(s) {
    if (s === "high") return "#f87171"
    if (s === "medium") return "#fbbf24"
    return "#4ade80"
}

export default App