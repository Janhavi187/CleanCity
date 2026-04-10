import { LayoutList, Clock, CheckCircle, Trophy } from "lucide-react"

export default function Dashboard({ reports }) {
    const total = reports.length
    const inProgress = reports.filter(r => r.status === "in_progress").length
    const cleaned = reports.filter(r => r.status === "cleaned").length

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex gap-4">
            <StatCard icon={<LayoutList className="text-secondary" />} label="Total" value={total} />
            <StatCard icon={<Clock className="text-amber-500" />} label="Active" value={inProgress} />
            <StatCard icon={<CheckCircle className="text-primary" />} label="Cleaned" value={cleaned} />
            <StatCard icon={<Trophy className="text-yellow-400" />} label="Points" value={cleaned * 10} />
        </div>
    )
}

function StatCard({ icon, label, value }) {
    return (
        <div className="glass-card flex items-center gap-4 py-3 px-6">
            <div className="p-2 bg-white/5 rounded-lg">
                {icon}
            </div>
            <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
                <p className="text-xl font-bold leading-none">{value}</p>
            </div>
        </div>
    )
}