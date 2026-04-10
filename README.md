<p align="center">
  <img src="https://img.shields.io/badge/🌿-EcoTrack_AI-22c55e?style=for-the-badge&labelColor=060b14" alt="EcoTrack AI" />
</p>

<h1 align="center">♻️ EcoTrack AI — Smart Waste Intelligence Platform</h1>

<p align="center">
  <strong>Real-time, AI-powered waste tracking and community cleanup platform for building smarter, cleaner cities.</strong>
</p>

<p align="center">
  <a href="http://clean-city-bay-three.vercel.app/"><img src="https://img.shields.io/badge/🚀_Live_Demo-clean--city--bay--three.vercel.app-3b82f6?style=for-the-badge&labelColor=1e293b" alt="Live Demo" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Leaflet-Maps-199900?style=flat-square&logo=leaflet&logoColor=white" alt="Leaflet" />
  <img src="https://img.shields.io/badge/Cloudinary-Image_CDN-3448C5?style=flat-square&logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Architecture Diagram](#-architecture-diagram)
- [Application Flow Diagram](#-application-flow-diagram)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🌍 About the Project

**EcoTrack AI** is a community-driven, real-time waste intelligence platform designed to empower citizens and municipal bodies to collaboratively manage urban waste. Users can report waste sightings on an interactive map, upload images for AI-powered waste classification, track cleanup progress, and earn XP through a gamified leaderboard system.

The platform leverages **Firebase Firestore** for real-time data synchronization, **Cloudinary** for optimized image hosting, **Leaflet** for interactive dark-themed maps, and **Framer Motion** for fluid UI animations — all orchestrated through a sleek, dark-themed glassmorphic interface.

---

## 🚀 Live Demo

🔗 **[clean-city-bay-three.vercel.app](http://clean-city-bay-three.vercel.app/)**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Interactive Waste Map** | Full-screen dark-themed Leaflet map with click-to-pin report locations. Custom severity-coded pulsing markers (🔴 High, 🟡 Medium, 🟢 Low). |
| 🤖 **AI Waste Classification** | Simulated AI engine that automatically classifies uploaded waste images into categories (Plastic, Organic, Hazardous E-Waste, Industrial Scrap) and auto-assigns severity levels. |
| 📸 **Image Upload & CDN** | Cloudinary-powered image upload with real-time preview. Images are optimized and served via a global CDN. |
| 🔥 **Real-time Sync** | Firebase Firestore `onSnapshot` listeners provide instant data synchronization — any new report appears across all connected clients immediately. |
| 📊 **Live Dashboard** | Animated top-bar stats showing total Reports, Active pickups, Cleaned locations, and cumulative XP — all updating in real-time. |
| 🚛 **Claim & Cleanup Workflow** | Workers can claim reported waste for pickup and mark it as cleaned. Status transitions: `Reported → In Progress → Cleaned`. |
| 🏆 **Eco Warriors Leaderboard** | Gamified XP system that ranks community contributors. Users earn +10 XP per successful cleanup. |
| 📡 **Live Activity Feed** | Real-time animated feed showing the 5 most recent waste reports with severity indicators and waste type labels. |
| 🎨 **Glassmorphic Dark UI** | Premium dark theme with frosted glass cards, gradient accents, ambient background glows, and smooth micro-animations. |
| 🔍 **Status Filters** | Bottom pill-bar filters to toggle map views: All / Reported / Active / Cleaned. |
| 🔔 **Toast Notifications** | Animated toast system for success, error, and info messages with auto-dismiss. |
| 📱 **Responsive Design** | Fully responsive layout with collapsible sidebar panel for mobile and desktop users. |

---

## 🏗️ Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT  (Browser)                                  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                         React 19 + Vite 8                             │  │
│  │                                                                        │  │
│  │   ┌──────────┐   ┌───────────┐   ┌───────────┐   ┌─────────────┐     │  │
│  │   │  App.jsx  │──▶│ Dashboard │   │  MapView  │   │ ReportForm  │     │  │
│  │   │ (Root)   │   │  (Stats)  │   │ (Leaflet) │   │ (AI + Upload│     │  │
│  │   └────┬─────┘   └───────────┘   └─────┬─────┘   └──────┬──────┘     │  │
│  │        │                                │                 │            │  │
│  │        │  ┌─────────┐                   │                 │            │  │
│  │        └─▶│  Toast   │                  │                 │            │  │
│  │           │(Notifs)  │                  │                 │            │  │
│  │           └──────────┘                  │                 │            │  │
│  │                                         │                 │            │  │
│  │   State: reports[], location, toasts,   │                 │            │  │
│  │          recentActivity[], sidebarOpen   │                 │            │  │
│  └──────────────────────────────────────────┼─────────────────┼────────────┘  │
│                                             │                 │               │
└─────────────────────────────────────────────┼─────────────────┼───────────────┘
                                              │                 │
              ┌───────────────────────────────┘                 │
              │                                                 │
              ▼                                                 ▼
┌──────────────────────────┐                  ┌──────────────────────────────┐
│    🗺️ Leaflet + CARTO     │                  │     ☁️  Cloudinary CDN        │
│                          │                  │                              │
│  • Dark tile layer       │                  │  • Image upload              │
│  • Custom SVG markers    │                  │  • Auto-optimization         │
│  • Click-to-pin events   │                  │  • Secure URL generation     │
│  • Popup cards           │                  │                              │
└──────────────────────────┘                  └──────────────────────────────┘
                                                        │
                                                        │ secure_url
                                                        ▼
                                    ┌──────────────────────────────┐
                                    │    🔥 Firebase Firestore      │
                                    │                              │
                                    │  Collection: "reports"       │
                                    │  ┌────────────────────────┐  │
                                    │  │ • lat, lng             │  │
                                    │  │ • severity (low/med/hi)│  │
                                    │  │ • wasteType            │  │
                                    │  │ • status               │  │
                                    │  │ • imageUrl             │  │
                                    │  │ • createdAt            │  │
                                    │  └────────────────────────┘  │
                                    │                              │
                                    │  Real-time onSnapshot ◀─────│
                                    └──────────────────────────────┘
```

---

## 🔄 Application Flow Diagram

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                     USER INTERACTION FLOW                               │
 └─────────────────────────────────────────────────────────────────────────┘

 ╔══════════════════╗
 ║  User Opens App  ║
 ╚════════╤═════════╝
          │
          ▼
 ┌──────────────────────┐     ┌───────────────────────┐
 │  Map loads (Leaflet) │────▶│ Firestore onSnapshot  │
 │  Dark CARTO tiles    │     │ streams report data    │
 └──────────────────────┘     └───────────┬───────────┘
                                          │
                              ┌───────────▼───────────┐
                              │  reports[] state set   │
                              │  Dashboard + Map +     │
                              │  Activity feed update  │
                              └───────────────────────┘

 ═══════════════════════════════════════════════════════
          REPORTING FLOW (Bottom-Left Panel)
 ═══════════════════════════════════════════════════════

          ┌──────────────────┐
          │ 1. Click on Map  │
          │   (set lat/lng)  │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ 2. Upload Image  │
          │   (file picker)  │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ 3. AI Analysis   │──────────────────┐
          │   (2s simulate)  │                  │
          └────────┬─────────┘                  │
                   │                            ▼
                   │              ┌──────────────────────┐
                   │              │ Auto-classify:       │
                   │              │ • Plastic Waste      │
                   │              │ • Organic Waste      │
                   │              │ • Hazardous E-Waste  │
                   │              │ • Industrial Scrap   │
                   │              │                      │
                   │              │ Auto-set severity:   │
                   │              │ low / medium / high  │
                   │              └──────────────────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ 4. Submit Report │
          └────────┬─────────┘
                   │
          ┌────────▼─────────┐         ┌────────────────┐
          │ Upload to        │────────▶│  Cloudinary    │
          │ Cloudinary       │         │  returns URL   │
          └────────┬─────────┘         └────────────────┘
                   │
          ┌────────▼─────────┐
          │ Save to Firestore│──▶ { lat, lng, severity,
          │                  │     wasteType, imageUrl,
          └────────┬─────────┘     status: "reported",
                   │               createdAt }
                   ▼
          ┌──────────────────┐
          │ ✅ Toast: Success │
          │ 🔄 Map updates   │
          │    (real-time)   │
          └──────────────────┘

 ═══════════════════════════════════════════════════════
          CLEANUP WORKFLOW (Map Popup Actions)
 ═══════════════════════════════════════════════════════

   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │  REPORTED   │───▶│ IN PROGRESS │───▶│   CLEANED   │
   │  (🔵 Blue)  │    │  (🟡 Yellow) │    │  (🟢 Green)  │
   │             │    │             │    │             │
   │ [Claim      │    │ [Mark as    │    │  +10 XP     │
   │  Pickup 🚛] │    │  Cleaned ✅]│    │  awarded 🌿 │
   └─────────────┘    └─────────────┘    └─────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 | UI component library |
| **Build Tool** | Vite 8 | Lightning-fast HMR & bundling |
| **Styling** | Tailwind CSS 4.2 | Utility-first CSS framework |
| **Maps** | Leaflet + React-Leaflet | Interactive map rendering |
| **Tiles** | CARTO Dark Matter | Dark-themed map tile layer |
| **Database** | Firebase Firestore | Real-time NoSQL cloud database |
| **Image CDN** | Cloudinary | Image upload, optimization & delivery |
| **Animations** | Framer Motion | Declarative UI animations |
| **Icons** | Lucide React | Modern icon set |
| **Hosting** | Vercel | Edge-deployed production hosting |

---

## 📂 Project Structure

```
CleanCity/
├── index.html                  # Entry HTML with SEO meta tags
├── package.json                # Dependencies & scripts
├── vite.config.js              # Vite + React plugin config
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS with Tailwind plugin
├── .env                        # Environment variables (not committed)
├── .gitignore                  # Git ignore rules
├── public/                     # Static assets
│   └── favicon.svg             # App favicon
└── src/
    ├── main.jsx                # React DOM entry point
    ├── App.jsx                 # Root component — state, layout, sidebar
    ├── firebase.js             # Firebase app & Firestore initialization
    ├── index.css               # Global styles & glassmorphic design tokens
    ├── style.css               # Additional styles
    ├── counter.js              # Utility module
    ├── main.js                 # Legacy entry
    ├── assets/                 # Static assets (images, etc.)
    └── components/
        ├── Dashboard.jsx       # Top-bar animated stats (Reports, Active, Cleaned, XP)
        ├── MapView.jsx         # Full-screen Leaflet map with markers, popups, filters
        ├── ReportForm.jsx      # AI Report Engine — upload, classify, submit
        └── Toast.jsx           # Animated toast notification component
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **Firebase** project with Firestore enabled
- A **Cloudinary** account with an upload preset

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/CleanCity.git
cd CleanCity

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Fill in your Firebase and Cloudinary credentials (see below)

# 4. Start development server
npm run dev
```

The app will be running at `http://localhost:5173`

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

---

## ☁️ Deployment

The project is deployed on **Vercel** with automatic builds from the `main` branch.

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

**Vercel Configuration:**
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** Add all `VITE_*` variables in the Vercel dashboard

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

<p align="center">
  Built with 💚 for cleaner cities
</p>
#   C l e a n _ c i t y  
 