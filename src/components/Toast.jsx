import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, Info, X } from "lucide-react"

export default function Toast({ msg, type }) {
    const icons = {
        success: <CheckCircle size={16} className="text-emerald-400" />,
        error:   <AlertCircle size={16} className="text-rose-400" />,
        info:    <Info size={16} className="text-blue-400" />
    }

    const colors = {
        success: "border-emerald-500/20 bg-emerald-500/5",
        error:   "border-rose-500/20 bg-rose-500/5",
        info:    "border-blue-500/20 bg-blue-500/5"
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`toast flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl ${colors[type] || colors.info}`}
            style={{
                minWidth: "240px",
                maxWidth: "400px",
                pointerEvents: "auto"
            }}
        >
            <div className="flex-shrink-0">
                {icons[type] || icons.info}
            </div>
            <p className="text-sm font-medium text-slate-200 m-0 flex-grow">
                {msg}
            </p>
        </motion.div>
    )
}
