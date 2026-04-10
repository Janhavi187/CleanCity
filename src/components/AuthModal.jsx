import { useState } from "react"
import { signInWithPopup, signOut } from "firebase/auth"
import { auth, googleProvider } from "../firebase"
import { motion, AnimatePresence } from "framer-motion"
import { LogIn, LogOut, X, ShieldCheck, User } from "lucide-react"

export default function AuthModal({ user, onClose }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleGoogleSignIn = async () => {
        setLoading(true)
        setError("")
        try {
            await signInWithPopup(auth, googleProvider)
            onClose()
        } catch (err) {
            console.error(err)
            setError("Sign-in failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = async () => {
        await signOut(auth)
        onClose()
    }

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0, zIndex: 8000,
                    background: "rgba(0,0,0,0.65)",
                    backdropFilter: "blur(6px)"
                }}
            />

            {/* Modal */}
            <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                style={{
                    position: "fixed", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 8001, width: 340,
                    background: "linear-gradient(145deg, rgba(13,24,41,0.98), rgba(6,11,20,0.98))",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "1.25rem",
                    padding: "2rem",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)"
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute", top: 14, right: 14,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: "0.5rem", padding: "4px 6px",
                        color: "#64748b", cursor: "pointer",
                        display: "flex", alignItems: "center"
                    }}
                >
                    <X size={14} />
                </button>

                {user ? (
                    /* ── Signed-in state ── */
                    <div style={{ textAlign: "center" }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: "50%",
                            border: "2px solid rgba(34,197,94,0.5)",
                            overflow: "hidden", margin: "0 auto 12px",
                            boxShadow: "0 0 20px rgba(34,197,94,0.25)"
                        }}>
                            {user.photoURL
                                ? <img src={user.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <div style={{ width: "100%", height: "100%", background: "#22c55e20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <User size={28} color="#22c55e" />
                                  </div>
                            }
                        </div>
                        <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: "1rem", color: "#f1f5f9" }}>
                            {user.displayName}
                        </p>
                        <p style={{ margin: "0 0 20px", fontSize: "0.75rem", color: "#64748b" }}>
                            {user.email}
                        </p>
                        <div style={{
                            background: "rgba(34,197,94,0.08)",
                            border: "1px solid rgba(34,197,94,0.20)",
                            borderRadius: "0.75rem", padding: "10px 14px",
                            display: "flex", alignItems: "center", gap: 8,
                            marginBottom: 20
                        }}>
                            <ShieldCheck size={15} color="#22c55e" />
                            <span style={{ fontSize: "0.78rem", color: "#4ade80", fontWeight: 600 }}>
                                Volunteer access active
                            </span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            style={{
                                width: "100%", padding: "10px",
                                background: "rgba(239,68,68,0.12)",
                                border: "1px solid rgba(239,68,68,0.25)",
                                borderRadius: "0.625rem", color: "#f87171",
                                fontWeight: 700, fontSize: "0.85rem",
                                cursor: "pointer", display: "flex",
                                alignItems: "center", justifyContent: "center", gap: 8,
                                transition: "background 0.15s"
                            }}
                        >
                            <LogOut size={15} /> Sign Out
                        </button>
                    </div>
                ) : (
                    /* ── Sign-in state ── */
                    <div>
                        <div style={{ textAlign: "center", marginBottom: 24 }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: "0.875rem",
                                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 14px",
                                boxShadow: "0 0 24px rgba(34,197,94,0.35)"
                            }}>
                                <ShieldCheck size={24} color="#060b14" strokeWidth={2.5} />
                            </div>
                            <h2 style={{ margin: "0 0 6px", fontWeight: 900, fontSize: "1.2rem", color: "#f1f5f9" }}>
                                Volunteer Sign-In
                            </h2>
                            <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b", lineHeight: 1.5 }}>
                                Sign in to claim pickups, mark spots<br />as cleaned, and earn points.
                            </p>
                        </div>

                        {/* Points info */}
                        <div style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "0.75rem", padding: "12px 14px",
                            marginBottom: 20, display: "flex", flexDirection: "column", gap: 6
                        }}>
                            <p style={{ margin: 0, fontSize: "0.65rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                Points per cleanup
                            </p>
                            {[
                                { label: "Low Severity",    pts: 10, color: "#4ade80" },
                                { label: "Medium Severity", pts: 25, color: "#fbbf24" },
                                { label: "High Severity",   pts: 50, color: "#f87171" },
                            ].map(({ label, pts, color }) => (
                                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{label}</span>
                                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color }}>{pts} pts</span>
                                </div>
                            ))}
                        </div>

                        {error && (
                            <p style={{ color: "#f87171", fontSize: "0.75rem", marginBottom: 12, textAlign: "center" }}>
                                {error}
                            </p>
                        )}

                        {/* Google Sign-in */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            style={{
                                width: "100%", padding: "11px",
                                background: loading ? "rgba(255,255,255,0.05)" : "white",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: "0.625rem",
                                color: loading ? "#64748b" : "#1a1a1a",
                                fontWeight: 700, fontSize: "0.88rem",
                                cursor: loading ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                marginBottom: 10,
                                transition: "all 0.15s",
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {!loading && (
                                <svg width="18" height="18" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3A12 12 0 0 1 12 24a12 12 0 0 1 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7A20 20 0 0 0 24 4C12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7A20 20 0 0 0 24 4C16.3 4 9.7 8.3 6.3 14.7z"/>
                                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.5 26l-6.6 5.1C9.5 39.4 16.1 44 24 44z"/>
                                    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12.1 12.1 0 0 1-4.1 5.6l6.2 5.2C36.9 40.2 44 35 44 24c0-1.3-.1-2.6-.4-3.9z"/>
                                </svg>
                            )}
                            {loading ? "Signing in…" : "Continue with Google"}
                        </button>

                        <button
                            onClick={onClose}
                            style={{
                                width: "100%", padding: "9px",
                                background: "transparent",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "0.625rem", color: "#475569",
                                fontWeight: 600, fontSize: "0.8rem",
                                cursor: "pointer"
                            }}
                        >
                            Continue as Guest (View Only)
                        </button>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
