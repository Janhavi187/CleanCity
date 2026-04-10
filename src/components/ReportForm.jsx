import { useState, useEffect } from "react"
import { db } from "../firebase"
import { collection, addDoc } from "firebase/firestore"
import { Camera, MapPin, Loader2, Sparkles, Send } from "lucide-react"

export default function ReportForm({ location }) {
    const [file, setFile] = useState(null)
    const [severity, setSeverity] = useState("low")
    const [isUploading, setIsUploading] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [aiLabel, setAiLabel] = useState("")

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    // Simulate AI classification
    useEffect(() => {
        if (file) {
            setIsAnalyzing(true)
            setTimeout(() => {
                const labels = ["Plastic Waste", "Organic Waste", "Hazardous E-Waste", "Industrial Scrap"]
                const severities = ["low", "medium", "high"]
                setAiLabel(labels[Math.floor(Math.random() * labels.length)])
                setSeverity(severities[Math.floor(Math.random() * severities.length)])
                setIsAnalyzing(false)
            }, 2000)
        }
    }, [file])

    const handleSubmit = async () => {
        if (!file || !location) return alert("Select location + image")
        
        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("upload_preset", UPLOAD_PRESET)

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData
                }
            )

            const data = await res.json()

            await addDoc(collection(db, "reports"), {
                lat: location.lat,
                lng: location.lng,
                severity,
                wasteType: aiLabel,
                status: "reported",
                imageUrl: data.secure_url,
                createdAt: Date.now()
            })

            setFile(null)
            setAiLabel("")
            alert("EcoTrack AI: Report Logged Successfully!")
        } catch (error) {
            console.error(error)
            alert("Error reporting waste")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="fixed bottom-6 left-6 z-[1000] w-80">
            <div className="glass-card space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-primary w-5 h-5" />
                    <h3 className="font-bold text-lg">AI Report Engine</h3>
                </div>

                {/* File Input */}
                <div className="relative group">
                    <input 
                        type="file" 
                        id="file-upload"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files[0])} 
                    />
                    <label 
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-6 cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all"
                    >
                        {file ? (
                            <img src={URL.createObjectURL(file)} className="w-full h-32 object-cover rounded-lg" alt="Preview" />
                        ) : (
                            <>
                                <Camera className="w-8 h-8 text-slate-400 mb-2" />
                                <span className="text-sm text-slate-400">Capture or Upload</span>
                            </>
                        )}
                    </label>
                </div>

                {/* Status/AI Info */}
                {isAnalyzing && (
                    <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing waste composition...
                    </div>
                )}

                {aiLabel && !isAnalyzing && (
                    <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
                        <p className="text-xs uppercase font-bold text-primary mb-1 text-[10px]">AI Classification</p>
                        <p className="text-sm font-semibold">{aiLabel}</p>
                        <p className="text-xs text-slate-400 mt-1">Severity Auto-set: <span className="text-white capitalize">{severity}</span></p>
                    </div>
                )}

                <div className="flex items-center gap-2 text-xs py-2 px-1 rounded-md bg-white/5">
                    <MapPin className="w-4 h-4 text-secondary" />
                    <span className={location ? "text-white" : "text-amber-500 animate-pulse"}>
                        {location ? `Pin: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Click map to set location"}
                    </span>
                </div>

                <button 
                    disabled={!file || !location || isUploading || isAnalyzing}
                    onClick={handleSubmit} 
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {isUploading ? <Loader2 className="animate-spin" /> : <><Send size={18} className="group-hover:translate-x-1 transition-transform" /> Submit Report</>}
                </button>
            </div>
        </div>
    )
}