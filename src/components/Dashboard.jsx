import { LayoutList, Clock, CheckCircle, Trophy, ImagePlus } from "lucide-react"
import { motion } from "framer-motion"
import { useLanguage } from "../context/LanguageContext"

const STATS = [
    { key: "total", labelKey: "stats_total", color: "#3b82f6", icon: LayoutList },
    { key: "pending", labelKey: "stats_pending", color: "#f59e0b", icon: ImagePlus },
    { key: "cleaned", labelKey: "stats_cleaned", color: "#22c55e", icon: CheckCircle },
    { key: "points", labelKey: "stats_xp", color: "#a855f7", icon: Trophy },
]

export default function Dashboard({ reports }) {
    const { t } = useLanguage()
    const total      = reports.length
    const pending    = reports.filter(r => r.status === "in_progress" || r.status === "pending_proof").length
    const cleaned    = reports.filter(r => r.status === "cleaned").length
    const points     = reports
        .filter(r => r.status === "cleaned")
        .reduce((sum, r) => sum + (r.pointsEarned || 10), 0)

    const values = { total, pending, cleaned, points }

    return (
        <div style={{
            position: "fixed", top: 16, left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2000, display: "flex", gap: 10,
            pointerEvents: "none"
        }}>
            {STATS.map(({ key, labelKey, color, icon: Icon }) => (
                <motion.div
                    key={key}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: STATS.findIndex(s => s.key === key) * 0.08 }}
                    style={{
                        background: "rgba(255,255,255,0.07)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: "0.875rem",
                        padding: "10px 18px",
                        display: "flex", alignItems: "center", gap: 10,
                        boxShadow: `0 4px 24px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.04)`,
                        minWidth: 110
                    }}
                >
                    <div style={{
                        background: color + "20",
                        border: `1px solid ${color}40`,
                        borderRadius: "0.5rem", padding: 7,
                        display: "flex", alignItems: "center"
                    }}>
                        <Icon size={16} color={color} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: "0.6rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            {t(labelKey)}
                        </p>
                        <p style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#f1f5f9", lineHeight: 1.2 }}>
                            {values[key]}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}