import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    // App / Logo
    brand_sub: "AI",
    hide_panel: "Hide Panel",
    show_panel: "Show Panel",
    want_to_help: "Want to help clean up?",
    sign_in_desc: "Sign in to earn points & rank up",
    volunteer_sign_in: "Volunteer Sign In",
    volunteer_verified: "Volunteer ✓",
    live_activity: "Live Activity",
    no_activity: "No activity yet",
    reported_nearby: "reported nearby",
    
    // Dashboard
    stats_total: "Reports",
    stats_pending: "Pending",
    stats_cleaned: "Cleaned",
    stats_xp: "Total XP",
    
    // MapView / Popup
    status_reported: "Reported",
    status_in_progress: "In Progress",
    status_pending_proof: "Pending Proof",
    status_cleaned: "Cleaned ✓",
    claim_pickup: "🚛 Claim Pickup",
    sign_in_to_clean: "Sign in to Clean",
    submit_proof: "✅ Submit Proof",
    upload_proof: "Upload Proof (After Photo)",
    working_on_cleanup: "Volunteer working on cleanup...",
    map_all: "All",
    map_hint: "Click anywhere on the map to pin a report location",
    before_label: "BEFORE",
    after_label: "AFTER",
    waste_spot: "Waste Spot",
    claimed_by_other: "Claimed by another volunteer",
    pts_earned: "pts earned",
    by_volunteer: "by",
    
    // ReportForm
    report_engine: "AI Report Engine",
    capture_upload: "Capture or Upload",
    analyzing: "Analyzing waste composition...",
    submit_report: "Submit Report",
    map_pin: "Pin",
    click_to_set: "Click map to set location",
    ai_class: "AI Classification",
    severity_set: "Severity Auto-set",
    
    // Leaderboard
    eco_warriors: "Eco Warriors",
    no_volunteers: "No volunteers yet — be the first! 🌿",
    cleanups: "cleanups",
    cleanup: "cleanup",
    pts: "pts",
    
    // Toasts
    t_connection_fail: "Firebase connection failed",
    t_pickup_claimed: "Pickup claimed! En route 🚛",
    t_spot_cleaned: "Spot fully cleaned! +{pts} pts 🌿",
    t_proof_pending: "Proof pending. Upload 'After' photo to earn points!",
    t_report_success: "EcoTrack AI: Report Logged Successfully!",
    t_select_loc_img: "Select location + image",
    t_error_reporting: "Error reporting waste",
    t_upload_failed: "Upload failed",
    
    // AI Labels
    "Plastic Waste": "Plastic Waste",
    "Organic Waste": "Organic Waste",
    "Hazardous E-Waste": "Hazardous E-Waste",
    "Industrial Scrap": "Industrial Scrap"
  },
  hi: {
    // App / Logo
    brand_sub: "AI",
    hide_panel: "पैनल छिपाएं",
    show_panel: "पैनल दिखाएं",
    want_to_help: "सफाई में मदद करना चाहते हैं?",
    sign_in_desc: "अंक अर्जित करने और रैंक बढ़ाने के लिए साइन इन करें",
    volunteer_sign_in: "स्वयंसेवक साइन इन",
    volunteer_verified: "स्वयंसेवक ✓",
    live_activity: "लाइव गतिविधि",
    no_activity: "अभी कोई गतिविधि नहीं",
    reported_nearby: "आस-पास रिपोर्ट की गई",
    
    // Dashboard
    stats_total: "रिपोर्ट",
    stats_pending: "लंबित",
    stats_cleaned: "साफ किया गया",
    stats_xp: "कुल XP",
    
    // MapView / Popup
    status_reported: "रिपोर्ट की गई",
    status_in_progress: "प्रगति पर है",
    status_pending_proof: "प्रमाण लंबित",
    status_cleaned: "साफ किया गया ✓",
    claim_pickup: "🚛 पिकअप दावा करें",
    sign_in_to_clean: "साफ करने के लिए साइन इन करें",
    submit_proof: "✅ प्रमाण सबमिट करें",
    upload_proof: "प्रमाण अपलोड करें (बाद की फोटो)",
    working_on_cleanup: "स्वयंसेवक सफाई पर काम कर रहा है...",
    map_all: "सभी",
    map_hint: "पिन करने के लिए मानचित्र पर कहीं भी क्लिक करें",
    before_label: "पहले",
    after_label: "बाद में",
    waste_spot: "कचरा स्थान",
    claimed_by_other: "दैनिक स्वयंसेवक द्वारा दावा किया गया",
    pts_earned: "अंक अर्जित",
    by_volunteer: "द्वारा",
    
    // ReportForm
    report_engine: "AI रिपोर्ट इंजन",
    capture_upload: "कैप्चर या अपलोड करें",
    analyzing: "कचरे का विश्लेषण किया जा रहा है...",
    submit_report: "रिपोर्ट सबमिट करें",
    map_pin: "पिन",
    click_to_set: "स्थान सेट करने के लिए मानचित्र पर क्लिक करें",
    ai_class: "AI वर्गीकरण",
    severity_set: "गंभीरता ऑटो-सेट",
    
    // Leaderboard
    eco_warriors: "इको वॉरियर्स",
    no_volunteers: "अभी कोई स्वयंसेवक नहीं - पहले बनें! 🌿",
    cleanups: "सफाइयां",
    cleanup: "सफाई",
    pts: "अंक",
    
    // Toasts
    t_connection_fail: "फायरबेस कनेक्शन विफल रहा",
    t_pickup_claimed: "पिकअप का दावा किया गया! रास्ते में 🚛",
    t_spot_cleaned: "स्थान पूरी तरह से साफ़! +{pts} अंक 🌿",
    t_proof_pending: "प्रमाण लंबित। अंक अर्जित करने के लिए 'बाद' की फोटो अपलोड करें!",
    t_report_success: "EcoTrack AI: रिपोर्ट सफलतापूर्वक दर्ज की गई!",
    t_select_loc_img: "स्थान + छवि चुनें",
    t_error_reporting: "कचरा रिपोर्ट करने में त्रुटि",
    t_upload_failed: "अपलोड विफल रहा",
    
    // AI Labels
    "Plastic Waste": "प्लास्टिक कचरा",
    "Organic Waste": "जैविक कचरा",
    "Hazardous E-Waste": "खतरनाक ई-कचरा",
    "Industrial Scrap": "औद्योगिक स्क्रैप"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem("eco-lang") || "en");

  useEffect(() => {
    localStorage.setItem("eco-lang", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  const t = (key, params = {}) => {
    let str = translations[language][key] || key;
    Object.keys(params).forEach(p => {
        str = str.replace(`{${p}}`, params[p]);
    });
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
