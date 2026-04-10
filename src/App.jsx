import { useEffect, useState } from "react"
import { collection, onSnapshot, doc, updateDoc, query, orderBy, limit } from "firebase/firestore"
import { db } from "./firebase"
import { Shield, BarChart3, Users, Leaf } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import MapView from "./components/MapView"
import ReportForm from "./components/ReportForm"
import Dashboard from "./components/Dashboard"

function App() {
    const [reports, setReports] = useState([])
    const [location, setLocation] = useState(null)
    const [recentActivity, setRecentActivity] = useState([])

    useEffect(() => {
        // Full collection for map and stats
        const unsub = onSnapshot(collection(db, "reports"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setReports(data)
        })

        // Recent activity query
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(5))
        const unsubActivity = onSnapshot(q, (snapshot) => {
            setRecentActivity(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })))
        })

        return () => {
            unsub()
            unsubActivity()
        }
    }, [])

    const handleClaim = async (id) => {
        await updateDoc(doc(db, "reports", id), {
            status: "in_progress"
        })
    }

    return (
        <div className="relative min-h-screen bg-dark overflow-hidden">
            {/* Header / Logo */}
            <div className="fixed top-6 left-6 z-[1001] flex items-center gap-2 group cursor-pointer">
                <div className="bg-primary p-2 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.3)] group-hover:scale-110 transition-transform">
                    <Leaf className="text-dark w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    ECOTRACK AI
                </h1>
            </div>

            {/* Main UI Components */}
            <Dashboard reports={reports} />
            <MapView reports={reports} setLocation={setLocation} onClaim={handleClaim} />
            <ReportForm location={location} />

            {/* Sidebar Overlay - Gamification / Leaderboard Simulation */}
            <div className="fixed top-24 right-6 z-[1000] w-64 space-y-4 hidden md:block">
                <div className="glass-card">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="text-secondary w-5 h-5" />
                        <h3 className="font-bold">Eco Warriors</h3>
                    </div>
                    <div className="space-y-3">
                        <LeaderboardRow name="Suresh K." points={450} rank={1} />
                        <LeaderboardRow name="Priya R." points={380} rank={2} />
                        <LeaderboardRow name="Amit S." points={320} rank={3} />
                    </div>
                </div>

                <div className="glass-card">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="text-primary w-5 h-5" />
                        <h3 className="font-bold">Live Activity</h3>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        <AnimatePresence>
                            {recentActivity.map((activity) => (
                                <motion.div 
                                    key={activity.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[11px] p-2 bg-white/5 rounded border border-white/5"
                                >
                                    <span className="text-primary font-bold">New Report</span> in {activity.severity} zone.
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Background VFX */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />
        </div>
    )
}

function LeaderboardRow({ name, points, rank }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
                <span className="text-xs opacity-50 font-mono">#{rank}</span>
                <span>{name}</span>
            </div>
            <span className="font-bold text-primary">{points} XP</span>
        </div>
    )
}

export default App