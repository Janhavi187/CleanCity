import { useEffect, useState } from "react"
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore"
import { db } from "../firebase"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Medal } from "lucide-react"
import { useLanguage } from "../context/LanguageContext"

const RANK_EMOJI = ["🥇", "🥈", "🥉", "⭐", "✨", "🌿", "💚"]

function getRankStyle(i) {
    if (i === 0) return { color: "#fbbf24", glow: "rgba(251,191,36,0.25)" }
    if (i === 1) return { color: "#94a3b8", glow: "rgba(148,163,184,0.15)" }
    if (i === 2) return { color: "#cd7c2f", glow: "rgba(205,124,47,0.15)" }
    return { color: "#4ade80", glow: "rgba(74,222,128,0.08)" }
}

export default function Leaderboard() {
    const { t } = useLanguage()
    const [volunteers, setVolunteers] = useState([])

    useEffect(() => {
        const q = query(
            collection(db, "volunteers"),
            orderBy("totalScore", "desc"),
            limit(8)
        )
        const unsub = onSnapshot(q, (snap) => {
            setVolunteers(snap.docs.map(d => ({ uid: d.id, ...d.data() })))
        })
        return () => unsub()
    }, [])

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Trophy size={16} color="#fbbf24" />
                <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{t('eco_warriors')}</span>
                <span style={{
                    marginLeft: "auto",
                    background: "rgba(34,197,94,0.15)", color: "#4ade80",
                    fontSize: "0.6rem", fontWeight: 700,
                    borderRadius: "9999px", padding: "1px 6px",
                    border: "1px solid rgba(34,197,94,0.25)"
                }}>LIVE</span>
            </div>

            {volunteers.length === 0 ? (
                <p style={{ fontSize: "0.75rem", color: "#475569", textAlign: "center", padding: "16px 0" }}>
                    {t('no_volunteers')}
                </p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <AnimatePresence>
                        {volunteers.map((v, i) => {
                            const rank = getRankStyle(i)
                            return (
                                <motion.div
                                    key={v.uid}
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: i * 0.04 }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 8,
                                        padding: "7px 10px",
                                        borderRadius: "0.625rem",
                                        background: i === 0
                                            ? "rgba(251,191,36,0.06)"
                                            : "rgba(255,255,255,0.02)",
                                        border: i === 0
                                            ? "1px solid rgba(251,191,36,0.15)"
                                            : "1px solid transparent",
                                        boxShadow: i < 3 ? `0 2px 12px ${rank.glow}` : "none"
                                    }}
                                >
                                    {/* Avatar / Rank emoji */}
                                    <div style={{ position: "relative", flexShrink: 0 }}>
                                        {v.photoURL ? (
                                            <img
                                                src={v.photoURL}
                                                alt={v.name}
                                                style={{
                                                    width: 28, height: 28, borderRadius: "50%",
                                                    border: `1.5px solid ${rank.color}60`,
                                                    objectFit: "cover"
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: 28, height: 28, borderRadius: "50%",
                                                background: `${rank.color}20`,
                                                border: `1.5px solid ${rank.color}60`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: "0.75rem"
                                            }}>
                                                {RANK_EMOJI[i] || "🌿"}
                                            </div>
                                        )}
                                        {/* Rank badge */}
                                        <span style={{
                                            position: "absolute", bottom: -3, right: -3,
                                            fontSize: "0.6rem", lineHeight: 1
                                        }}>
                                            {RANK_EMOJI[i] || ""}
                                        </span>
                                    </div>

                                    {/* Name + cleanups */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            margin: 0, fontSize: "0.78rem", fontWeight: 700,
                                            color: "#e2e8f0", whiteSpace: "nowrap",
                                            overflow: "hidden", textOverflow: "ellipsis"
                                        }}>
                                            {v.name || "Anonymous"}
                                        </p>
                                        <p style={{ margin: 0, fontSize: "0.65rem", color: "#475569" }}>
                                            {v.cleanupCount || 0} {v.cleanupCount !== 1 ? t('cleanups') : t('cleanup')}
                                        </p>
                                    </div>

                                    {/* Score */}
                                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                                        <span style={{
                                            fontSize: "0.85rem", fontWeight: 800, color: rank.color,
                                            textShadow: `0 0 10px ${rank.glow}`
                                        }}>
                                            {v.totalScore || 0}
                                        </span>
                                        <span style={{ fontSize: "0.6rem", color: "#475569", marginLeft: 2 }}>{t('pts')}</span>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
