import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Camera,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Search,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Copy,
  Mail,
  ArrowRight,
  ArrowLeft,
  User,
  LogOut,
  LayoutDashboard,
  Cloud,
  Trash2,
  Smartphone,
  Play,
  Download,
  Ticket,
  Scan,
  Edit,
} from "lucide-react";

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  onSnapshot,
  deleteDoc,
  addDoc,
} from "firebase/firestore";

// --- YOUR FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBz89Wu6C14odNtYx2DMBzoq5PUYV4iqhM",
  authDomain: "vipaccess-b0057.firebaseapp.com",
  projectId: "vipaccess-b0057",
  storageBucket: "vipaccess-b0057.firebasestorage.app",
  messagingSenderId: "304860359937",
  appId: "1:304860359937:web:2d8e27ae248d94f920ff00",
  measurementId: "G-2SEM6G6E8T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "vipaccess-app-data";

// --- PLATFORM OWNER EMAIL ---
// CHANGE THIS TO YOUR ACTUAL EMAIL SO ONLY YOU CAN ACCESS THE ADMIN DASHBOARD
const ADMIN_EMAIL = "ahmedalsaidi8@gmail.com";

// --- UTILS & CONSTANTS ---

// Curated Ticket Themes
const TICKET_THEMES = {
  midnight: {
    id: "midnight",
    name: "Midnight VIP",
    bgOut: "#0a0a0a",
    bgIn: "#111111",
    grad1: "#fb923c",
    grad2: "#b91c1c", // Orange to Red
    textMain: "#ffffff",
    textMuted: "#a3a3a3",
    accent: "#ea580c",
    isDark: true,
  },
  onyx: {
    id: "onyx",
    name: "Onyx & Gold",
    bgOut: "#000000",
    bgIn: "#121212",
    grad1: "#fde047",
    grad2: "#b45309", // Yellow to Dark Gold
    textMain: "#ffffff",
    textMuted: "#a3a3a3",
    accent: "#eab308",
    isDark: true,
  },
  frost: {
    id: "frost",
    name: "Frostbite",
    bgOut: "#f8fafc",
    bgIn: "#ffffff",
    grad1: "#60a5fa",
    grad2: "#1e3a8a", // Light blue to Navy
    textMain: "#0f172a",
    textMuted: "#475569",
    accent: "#2563eb",
    isDark: false,
  },
  rose: {
    id: "rose",
    name: "Rose Quartz",
    bgOut: "#fff1f2",
    bgIn: "#ffffff",
    grad1: "#f472b6",
    grad2: "#9d174d", // Pink to Dark Pink
    textMain: "#4c0519",
    textMuted: "#881337",
    accent: "#e11d48",
    isDark: false,
  },
};

const isEventEnded = (event) => {
  if (!event || !event.date || !event.duration) return false;
  const endTime =
    new Date(event.date).getTime() + event.duration * 60 * 60 * 1000;
  return Date.now() > endTime;
};

const getEventGuestCount = (event) => {
  if (!event || !event.guests) return 0;
  return event.guests.reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
};

// HTML Email Template Generator
const generatePassEmailHTML = (event, guest) => {
  const theme = TICKET_THEMES[event.theme || "midnight"];
  const formattedDate = new Date(event.date).toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; background-color: ${theme.bgOut}; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border: 1px solid ${theme.isDark ? "#262626" : "#e2e8f0"};">
  <!-- Header Gradient -->
  <div style="background: linear-gradient(135deg, ${theme.grad1}, ${theme.grad2}); padding: 50px 30px; text-align: center;">
    <p style="color: rgba(255,255,255,0.9); margin: 0 0 12px 0; font-size: 13px; letter-spacing: 6px; font-weight: 800; text-transform: uppercase;">OFFICIAL VIP PASS</p>
    <h2 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -1.5px;">${event.name}</h2>
  </div>

  <!-- Body -->
  <div style="padding: 40px 30px; text-align: center; background-color: ${theme.bgIn};">
    <h3 style="color: ${theme.textMain}; font-size: 26px; margin: 0 0 10px 0; font-weight: 800;">Hi ${guest.name},</h3>
    <p style="color: ${theme.textMuted}; line-height: 1.6; font-size: 16px; margin-top: 0; max-width: 400px; margin-left: auto; margin-right: auto;">
      This secure QR code is your exclusive digital ticket. Please present it at the door for fast, touchless scanning and entry into the event.
    </p>

    <!-- QR Code Container (Always White Background for scannability) -->
    <div style="margin: 40px auto; background: ${theme.isDark ? "#262626" : "#f1f5f9"}; padding: 20px; border-radius: 28px; display: inline-block; border: 2px solid ${theme.isDark ? "#333333" : "#e2e8f0"}; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
      <div style="background: #ffffff; padding: 16px; border-radius: 16px;">
        <img src="https://quickchart.io/qr?text=${guest.id}&size=250&margin=0" alt="QR Code" style="display: block; border-radius: 8px;" width="250" height="250" />
      </div>
    </div>

    <!-- Party Details -->
    <div style="background-color: ${theme.isDark ? "#1a1a1a" : "#f8fafc"}; border: 1px solid ${theme.isDark ? "#262626" : "#e2e8f0"}; border-radius: 20px; padding: 24px; margin-bottom: 30px; text-align: left;">
      <h4 style="color: ${theme.accent}; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 15px 0;">🎟️ Pass Details</h4>
      <p style="margin: 0 0 10px 0; color: ${theme.textMain}; font-size: 16px;"><strong>Primary Guest:</strong> ${guest.name}</p>
      ${
        guest.plusOnes > 0
          ? `<p style="margin: 0; color: ${theme.textMain}; font-size: 16px;"><strong>Additional Guests (+1s):</strong> ${guest.plusOnes} (Total Party of ${1 + guest.plusOnes})</p>`
          : `<p style="margin: 0; color: ${theme.textMuted}; font-size: 15px; font-style: italic;">No additional guests (+1s) attached to this pass.</p>`
      }
    </div>

    <!-- Event Details -->
    <div style="text-align: left; border-top: 1px dashed ${theme.isDark ? "#333333" : "#cbd5e1"}; padding-top: 30px; margin-top: 10px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
        <tr>
          <td width="30" valign="top" style="font-size: 20px; line-height: 24px;">📅</td>
          <td valign="top">
            <p style="margin: 0; color: ${theme.textMuted}; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Date & Time</p>
            <p style="margin: 4px 0 0 0; color: ${theme.textMain}; font-size: 16px; font-weight: 500;">${formattedDate}</p>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="30" valign="top" style="font-size: 20px; line-height: 24px;">📍</td>
          <td valign="top">
            <p style="margin: 0; color: ${theme.textMuted}; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Location</p>
            <p style="margin: 4px 0 0 0; color: ${theme.textMain}; font-size: 16px; font-weight: 500;">${event.location}</p>
          </td>
        </tr>
      </table>
    </div>
  </div>
</div>
`;
};

export default function App() {
  // --- State Management ---
  const [events, setEvents] = useState({});
  const [fbUser, setFbUser] = useState(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(true);
  const [authorizedDoors, setAuthorizedDoors] = useState({});
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [scannerReady, setScannerReady] = useState(false);

  const isHost = fbUser && !fbUser.isAnonymous;
  const hostEmail = fbUser?.email || "";

  // Handle URL Hash Routing
  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Load QR Scanner Script
  useEffect(() => {
    if (window.Html5QrcodeScanner) {
      setScannerReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js";
    script.async = true;
    script.onload = () => setScannerReady(true);
    document.body.appendChild(script);
  }, []);

  // FIREBASE REAL-TIME SYNC & AUTH LOGIC
  useEffect(() => {
    let unsubscribe;
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            setFbUser(user);
          } else {
            try {
              await signInAnonymously(auth);
            } catch (error) {
              console.warn("Anonymous auth fallback active.");
              setFbUser({ uid: "guest-" + Date.now(), isAnonymous: true });
            }
          }
        });
      })
      .catch((err) => console.error("Persistence error:", err));

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!fbUser) return;
    const eventsRef = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "events",
    );
    setIsCloudSyncing(true);
    const unsubscribe = onSnapshot(
      eventsRef,
      (snapshot) => {
        const fetchedEvents = {};
        snapshot.forEach((doc) => {
          fetchedEvents[doc.id] = doc.data();
        });
        setEvents(fetchedEvents);
        setIsCloudSyncing(false);
      },
      (error) => {
        console.warn("Firestore Sync Issue:", error.message);
        setIsCloudSyncing(false);
      },
    );
    return () => unsubscribe();
  }, [fbUser]);

  const updateEvent = async (id, updatedData) => {
    if (!fbUser) return;
    try {
      const eventDoc = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "events",
        id,
      );
      await setDoc(eventDoc, updatedData);
    } catch (error) {
      console.warn("Cloud update issue:", error.message);
    }
  };

  const deleteEvent = async (id) => {
    if (!fbUser) return;
    try {
      const eventDoc = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "events",
        id,
      );
      await deleteDoc(eventDoc);
    } catch (error) {
      console.warn("Cloud delete issue:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.hash = "/";
    } catch (error) {
      window.location.hash = "/";
      setFbUser({ uid: "guest-" + Date.now(), isAnonymous: true });
    }
  };

  // Router Logic
  const route = currentHash.replace("#", "") || "/";
  const pathParts = route.split("/");
  const currentView = pathParts[0] || "/";
  const eventId = pathParts[1];
  const guestId = pathParts[2];

  const renderView = () => {
    switch (currentView) {
      case "/":
        return <LandingView />;
      case "admin":
        if (hostEmail !== ADMIN_EMAIL)
          return <ErrorView message="Access Denied. Master Admins only." />;
        return <AdminDashboardView events={events} />;
      case "door":
        if (isCloudSyncing && !events[eventId])
          return <LoadingView message="Loading event details..." />;
        if (!events[eventId]) return <ErrorView message="Event not found." />;
        return (
          <DoorScannerAuthView
            event={events[eventId]}
            updateEvent={updateEvent}
            scannerReady={scannerReady}
            authorizedDoors={authorizedDoors}
            setAuthorizedDoors={setAuthorizedDoors}
            hostEmail={hostEmail}
          />
        );
      case "service":
        return <ServicePageView serviceId={pathParts[1]} isHost={isHost} />;
      case "pricing":
        return <PricingView isHost={isHost} />;
      case "faq":
        return <FAQView />;
      case "terms":
        return <TermsView />;
      case "privacy":
        return <PrivacyView />;
      case "login":
      case "auth":
        if (isHost) {
          window.setTimeout(() => (window.location.hash = "my-events"), 0);
          return <LoadingView message="Authenticating..." />;
        }
        return <AuthView defaultIsLogin={true} />;
      case "signup":
        if (isHost) {
          window.setTimeout(() => (window.location.hash = "my-events"), 0);
          return <LoadingView message="Authenticating..." />;
        }
        return <AuthView defaultIsLogin={false} />;
      case "my-events":
        return (
          <MyEventsView
            events={events}
            isHost={isHost}
            hostEmail={hostEmail}
            hostName={fbUser?.displayName}
            deleteEvent={deleteEvent}
          />
        );
      case "create":
        if (!isHost)
          return (
            <AuthView
              redirectMessage="Please log in or sign up to host a new event."
              defaultIsLogin={false}
            />
          );
        return (
          <CreateEventView updateEvent={updateEvent} hostEmail={hostEmail} />
        );
      case "edit":
        if (isCloudSyncing && !events[eventId])
          return <LoadingView message="Loading event details..." />;
        if (!events[eventId]) return <ErrorView message="Event not found." />;
        if (events[eventId].owner !== hostEmail)
          return <ErrorView message="Access Denied: Owner only." />;
        return (
          <EditEventView event={events[eventId]} updateEvent={updateEvent} />
        );
      case "host":
        if (isCloudSyncing && !events[eventId])
          return <LoadingView message="Loading event details..." />;
        if (!events[eventId]) return <ErrorView message="Event not found." />;
        if (events[eventId].owner !== hostEmail)
          return <ErrorView message="Access Denied: Owner only." />;
        return <HostDashboardView event={events[eventId]} />;
      case "invite":
        if (isCloudSyncing && !events[eventId])
          return <LoadingView message="Syncing event..." />;
        if (!events[eventId])
          return <ErrorView message="Event link invalid." />;
        return (
          <GuestRegistrationView
            event={events[eventId]}
            updateEvent={updateEvent}
          />
        );
      case "success":
        if (isCloudSyncing && !events[eventId])
          return <LoadingView message="Processing..." />;
        if (!events[eventId]) return <ErrorView message="Pass not found." />;
        return <GuestSuccessView event={events[eventId]} guestId={guestId} />;
      case "scan":
        if (isCloudSyncing && !events[eventId])
          return <LoadingView message="Readying scanner..." />;
        if (!events[eventId]) return <ErrorView message="Event not found." />;
        if (events[eventId].owner !== hostEmail)
          return <ErrorView message="Access Denied." />;
        return (
          <ScannerView
            event={events[eventId]}
            updateEvent={updateEvent}
            scannerReady={scannerReady}
          />
        );
      case "log":
        if (isCloudSyncing && !events[eventId])
          return <LoadingView message="Fetching log..." />;
        if (!events[eventId]) return <ErrorView message="Event not found." />;
        if (events[eventId].owner !== hostEmail)
          return <ErrorView message="Access Denied." />;
        return (
          <LogDashboardView event={events[eventId]} updateEvent={updateEvent} />
        );
      default:
        return <LandingView />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans flex flex-col selection:bg-orange-500/30">
      <nav className="bg-black/80 backdrop-blur-xl border-b border-neutral-900 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <a
                href={isHost ? "#my-events" : "#"}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <ShieldCheck className="w-8 h-8 text-orange-500" />
                <span className="font-extrabold text-2xl tracking-tight text-white">
                  VIP<span className="text-orange-500">ACCESS</span>
                </span>
              </a>
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-500 bg-[#111] px-3 py-1.5 rounded-full border border-neutral-800 font-medium">
                {isCloudSyncing ? (
                  <span className="flex items-center gap-1.5 text-orange-500">
                    <Cloud className="w-3.5 h-3.5 animate-pulse" /> Syncing...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-neutral-400">
                    <CheckCircle className="w-3.5 h-3.5" /> Synced
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-6">
              {isHost ? (
                <>
                  <a
                    href="#my-events"
                    className="flex items-center gap-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />{" "}
                    <span className="hidden sm:inline">Dashboard</span>
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />{" "}
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <a
                    href="#login"
                    className="text-sm text-neutral-300 hover:text-white transition-colors font-medium"
                  >
                    Log In
                  </a>
                  <a
                    href="#signup"
                    className="flex items-center gap-2 text-sm bg-orange-500 hover:bg-orange-600 text-black px-5 py-2.5 rounded-full transition-all font-bold shadow-lg shadow-orange-500/20"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {!fbUser ? (
          <LoadingView message="Initializing secure connection..." />
        ) : (
          renderView()
        )}
      </main>
      <Footer />
    </div>
  );
}

// --- VIEWS ---

function FeatureCard({ icon: Icon, title, description }) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="relative z-10 hover:z-20 bg-white/[0.03] backdrop-blur-3xl transform-gpu border border-white/10 rounded-[32px] p-8 flex flex-col items-start hover:bg-white/[0.06] hover:border-orange-500/40 hover:shadow-[0_8px_32px_rgba(234,88,12,0.25)] transition-all duration-500 group shadow-xl shadow-black/20 overflow-hidden"
    >
      {/* Liquid Glass Edge Highlight */}
      <div className="absolute inset-0 rounded-[32px] pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] z-20"></div>

      {/* Dynamic Mouse Tracking Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
        style={{
          background: `radial-gradient(circle 350px at ${mousePos.x}px ${mousePos.y}px, rgba(249, 115, 22, 0.22), transparent 80%)`,
        }}
      ></div>

      <div className="relative z-10 w-full">
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl inline-block mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-8 h-8 text-orange-400 drop-shadow-md" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-md group-hover:text-orange-400 transition-colors">
          {title}
        </h3>
        <p className="text-white/60 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}

function LandingView() {
  return (
    <div className="w-full space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-16">
      <div className="relative overflow-hidden rounded-[40px] bg-slate-950 text-left min-h-[75vh] flex flex-col justify-center shadow-2xl border border-neutral-900">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-600 to-red-700 z-0"></div>
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80"
            alt="Elegant Wedding and Private Event Background"
            className="w-full h-full object-cover object-center opacity-70 mix-blend-multiply contrast-125 saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-95"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/30 to-transparent md:w-3/4"></div>
          <div className="absolute inset-0 bg-blue-900/30 mix-blend-overlay"></div>
        </div>
        <div className="relative z-10 p-10 md:p-20 w-full md:w-3/4 lg:w-2/3">
          <p className="font-bold text-orange-500 mb-4 text-lg tracking-wide uppercase drop-shadow-md">
            Hey, Event Hosts
          </p>
          <h1 className="text-6xl md:text-[5.5rem] font-black text-white tracking-tighter leading-[1.05] mb-8 drop-shadow-2xl">
            Create
            <br />
            Unforgettable
            <br />
            Experiences.
          </h1>
          <p className="text-neutral-300 text-lg md:text-xl max-w-lg mb-10 font-medium leading-relaxed drop-shadow-md">
            Great events should feel effortless. From custom invites to seamless
            door scanning, we build tools that connect and secure your VIPs.
          </p>
          <div>
            <a
              href="#create"
              className="inline-flex items-center gap-4 bg-white text-black pl-8 pr-2 py-2 rounded-full font-bold text-lg hover:bg-neutral-200 transition-all hover:scale-105 group shadow-2xl"
            >
              Start Hosting{" "}
              <span className="bg-orange-500 text-white rounded-full p-3 flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-16 items-center px-4 md:px-10">
        <div>
          <h3 className="text-orange-500 font-bold mb-4 tracking-wide">
            Behind the Tech
          </h3>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Shaping Experiences That Make Life Simpler
          </h2>
        </div>
        <div>
          <p className="text-xl text-neutral-300 leading-relaxed mb-8">
            We are focused on building clean, intuitive interfaces that solve
            real-world crowd management problems.
          </p>
          <div className="flex items-center justify-between border-t border-neutral-800 pt-8">
            <span className="text-sm text-neutral-500 font-medium">
              Simple, transparent pricing.
              <br />
              No hidden fees.
            </span>
            <a
              href="#pricing"
              className="inline-flex items-center gap-3 bg-neutral-900 border border-neutral-800 text-white pl-5 pr-1.5 py-1.5 rounded-full font-bold text-sm hover:bg-neutral-800 transition-all group"
            >
              View Pricing{" "}
              <span className="bg-neutral-800 group-hover:bg-neutral-700 text-white rounded-full p-1.5 flex items-center justify-center transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Ambient Glows behind the glass cards */}
        <div className="absolute -top-20 left-10 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-screen"></div>
        <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-screen"></div>

        <div className="grid sm:grid-cols-3 gap-6 relative z-10">
          <FeatureCard
            icon={LinkIcon}
            title="1. Create"
            description="Set up your event details and get a unique, beautifully designed link to send to your exclusive guest list."
          />
          <FeatureCard
            icon={QrCode}
            title="2. Distribute"
            description="Guests claim their spot and automatically receive a personalized, unforgeable QR code pass via email."
          />
          <FeatureCard
            icon={Camera}
            title="3. Verify"
            description="Turn any smartphone into a powerful door scanner to verify passes instantly and prevent gatecrashers."
          />
        </div>
      </div>
    </div>
  );
}

function CreateEventView({ updateEvent, hostEmail }) {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    duration: 4,
    location: "",
    capacity: 50,
    message: "",
    allowPlusOnes: false,
    maxPlusOnes: 1,
    scannerPasscode: "",
    theme: "midnight",
  });
  const [isCreating, setIsCreating] = useState(false);

  const [eventDate, setEventDate] = useState("");
  const [eventHour, setEventHour] = useState("08");
  const [eventMinute, setEventMinute] = useState("00");
  const [eventAmPm, setEventAmPm] = useState("PM");

  const stripePaymentLink =
    "https://buy.stripe.com/test_dRmdR921i9qJ5ZO8HOew800";

  useEffect(() => {
    if (eventDate) {
      let h = parseInt(eventHour, 10);
      if (eventAmPm === "PM" && h !== 12) h += 12;
      if (eventAmPm === "AM" && h === 12) h = 0;
      const hh = h.toString().padStart(2, "0");
      setFormData((prev) => ({
        ...prev,
        date: `${eventDate}T${hh}:${eventMinute}`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, date: "" }));
    }
  }, [eventDate, eventHour, eventMinute, eventAmPm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    const eventId = Math.random().toString(36).substr(2, 5).toUpperCase();

    await updateEvent(eventId, {
      id: eventId,
      owner: hostEmail,
      ...formData,
      capacity: parseInt(formData.capacity),
      duration: parseFloat(formData.duration),
      maxPlusOnes: parseInt(formData.maxPlusOnes) || 1,
      guests: [],
    });

    window.open(stripePaymentLink, "_blank");
    window.location.hash = `host/${eventId}`;
  };

  return (
    <div className="max-w-3xl mx-auto bg-[#111] rounded-[32px] border border-neutral-800 overflow-hidden animate-in fade-in duration-300">
      <div className="p-8 md:p-10 border-b border-neutral-800">
        <a
          href="#my-events"
          className="inline-flex items-center text-sm font-bold text-orange-500 mb-6 hover:text-orange-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </a>
        <h2 className="text-4xl font-black text-white tracking-tight">
          Create New Event
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
        <div>
          <label className="block text-sm font-bold text-neutral-300 mb-2">
            Event Name
          </label>
          <input
            required
            type="text"
            placeholder="e.g. Product Launch Party"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="bg-black/40 p-6 rounded-3xl border border-neutral-800/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-neutral-300 mb-2">
                Event Date
              </label>
              <input
                required
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-300 mb-2">
                Start Time
              </label>
              <div className="flex gap-2">
                <select
                  value={eventHour}
                  onChange={(e) => setEventHour(e.target.value)}
                  className="flex-1 bg-black border border-neutral-800 rounded-2xl px-3 sm:px-5 py-4 text-white focus:border-orange-500 focus:outline-none cursor-pointer appearance-none"
                >
                  {[
                    "01",
                    "02",
                    "03",
                    "04",
                    "05",
                    "06",
                    "07",
                    "08",
                    "09",
                    "10",
                    "11",
                    "12",
                  ].map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span className="text-neutral-500 self-center font-bold text-xl">
                  :
                </span>
                <select
                  value={eventMinute}
                  onChange={(e) => setEventMinute(e.target.value)}
                  className="flex-1 bg-black border border-neutral-800 rounded-2xl px-3 sm:px-5 py-4 text-white focus:border-orange-500 focus:outline-none cursor-pointer appearance-none"
                >
                  {[
                    "00",
                    "05",
                    "10",
                    "15",
                    "20",
                    "25",
                    "30",
                    "35",
                    "40",
                    "45",
                    "50",
                    "55",
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={eventAmPm}
                  onChange={(e) => setEventAmPm(e.target.value)}
                  className="flex-1 bg-black border border-neutral-800 rounded-2xl px-3 sm:px-5 py-4 text-white focus:border-orange-500 focus:outline-none cursor-pointer font-bold appearance-none"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-neutral-300 mb-2">
              Duration (Hours)
            </label>
            <input
              required
              type="number"
              step="0.5"
              placeholder="e.g. 4"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-300 mb-2">
              Max Capacity (Total People)
            </label>
            <input
              required
              type="number"
              placeholder="e.g. 50"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
              className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-300 mb-3">
            Ticket Theme
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(TICKET_THEMES).map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setFormData({ ...formData, theme: t.id })}
                className={`p-3 rounded-2xl border-2 transition-all text-left ${formData.theme === t.id ? "border-orange-500 scale-[1.02] bg-neutral-900 shadow-lg shadow-orange-500/10" : "border-neutral-800 bg-black hover:border-neutral-600"}`}
              >
                <div
                  className="h-12 rounded-xl mb-3 w-full"
                  style={{
                    background: `linear-gradient(135deg, ${t.grad1}, ${t.grad2})`,
                  }}
                ></div>
                <p className="text-xs font-bold text-white text-center">
                  {t.name}
                </p>
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-3 font-medium">
            Choose how the digital VIP passes and emails will look for your
            guests.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-300 mb-2">
            Door Scanner Passcode
          </label>
          <input
            required
            type="text"
            placeholder="e.g. SECURE123"
            value={formData.scannerPasscode}
            onChange={(e) =>
              setFormData({ ...formData, scannerPasscode: e.target.value })
            }
            className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors font-mono tracking-wider"
          />
          <p className="text-xs text-neutral-500 mt-2 font-medium">
            Your security team will need this code to open the scanner at the
            door without logging into your account.
          </p>
        </div>

        <div className="bg-black border border-neutral-800 p-6 rounded-3xl">
          <label className="flex items-center gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowPlusOnes}
              onChange={(e) =>
                setFormData({ ...formData, allowPlusOnes: e.target.checked })
              }
              className="w-6 h-6 rounded-md border-neutral-700 text-orange-500 focus:ring-orange-500 bg-neutral-900"
            />
            <span className="font-bold text-white">
              Allow guests to bring extra people (+1s)
            </span>
          </label>

          {formData.allowPlusOnes && (
            <div className="mt-6 pt-6 border-t border-neutral-800 animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-bold text-neutral-300 mb-2">
                Maximum extra people each guest can bring
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxPlusOnes}
                onChange={(e) =>
                  setFormData({ ...formData, maxPlusOnes: e.target.value })
                }
                className="w-full sm:w-1/2 bg-[#111] border border-neutral-700 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-300 mb-2">
            Location
          </label>
          <input
            required
            type="text"
            placeholder="123 Party Lane"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-300 mb-2">
            Welcome Message for Guests
          </label>
          <textarea
            placeholder="e.g. Dress code is strictly black tie. See you there!"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors resize-none"
            rows="4"
          />
        </div>

        <div className="pt-4">
          <button
            disabled={isCreating}
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 transition-colors text-black font-extrabold py-5 rounded-full flex items-center justify-center gap-3 text-lg disabled:opacity-50 shadow-xl shadow-orange-500/20"
          >
            {isCreating ? (
              "Processing Secure Checkout..."
            ) : (
              <>
                Pay $5.99 & Publish Event <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-center text-neutral-500 text-xs font-bold mt-4 tracking-wide uppercase flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Secure Payment Powered by Stripe
          </p>
        </div>
      </form>
    </div>
  );
}

function EditEventView({ event, updateEvent }) {
  const [formData, setFormData] = useState({
    name: event.name || "",
    date: event.date || "",
    duration: event.duration || 4,
    location: event.location || "",
    capacity: event.capacity || 50,
    message: event.message || "",
    allowPlusOnes: event.allowPlusOnes || false,
    maxPlusOnes: event.maxPlusOnes || 1,
    scannerPasscode: event.scannerPasscode || "",
    theme: event.theme || "midnight",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const initialDatePart = event.date ? event.date.split("T")[0] : "";
  const initialTimePart =
    event.date && event.date.includes("T") ? event.date.split("T")[1] : "08:00";
  const initH = parseInt(initialTimePart.split(":")[0], 10) || 8;
  const initM = initialTimePart.split(":")[1] || "00";
  const initAmPm = initH >= 12 ? "PM" : "AM";
  const init12H = initH % 12 || 12;

  const [eventDate, setEventDate] = useState(initialDatePart);
  const [eventHour, setEventHour] = useState(
    init12H.toString().padStart(2, "0"),
  );
  const [eventMinute, setEventMinute] = useState(initM);
  const [eventAmPm, setEventAmPm] = useState(initAmPm);

  useEffect(() => {
    if (eventDate) {
      let h = parseInt(eventHour, 10);
      if (eventAmPm === "PM" && h !== 12) h += 12;
      if (eventAmPm === "AM" && h === 12) h = 0;
      const hh = h.toString().padStart(2, "0");
      setFormData((prev) => ({
        ...prev,
        date: `${eventDate}T${hh}:${eventMinute}`,
      }));
    }
  }, [eventDate, eventHour, eventMinute, eventAmPm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const updatedData = {
      ...event,
      ...formData,
      capacity: parseInt(formData.capacity),
      duration: parseFloat(formData.duration),
      maxPlusOnes: parseInt(formData.maxPlusOnes) || 1,
    };

    await updateEvent(event.id, updatedData);

    if (event.guests && event.guests.length > 0) {
      try {
        const emailPromises = event.guests.map((guest) =>
          addDoc(collection(db, "mail"), {
            to: guest.email,
            message: {
              subject: `Event Update: ${updatedData.name}`,
              html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e5e5e5; border-radius: 12px; background: #fff; color: #000;">
                  <h2 style="color: #f97316; margin-top: 0;">Event Updated</h2>
                  <p>Hi ${guest.name},</p>
                  <p>The host has updated the details for <strong>${updatedData.name}</strong>. Please note the new information:</p>
                  <ul style="background: #f5f5f5; padding: 15px 30px; border-radius: 8px;">
                    <li style="margin-bottom: 8px;"><strong>Date & Time:</strong> ${new Date(updatedData.date).toLocaleString()}</li>
                    <li><strong>Location:</strong> ${updatedData.location}</li>
                  </ul>
                  <p>Your original QR code pass remains valid. See you there!</p>
                </div>
              `,
            },
          }),
        );
        await Promise.all(emailPromises);
      } catch (err) {
        console.error("Failed to queue update emails", err);
      }
    }

    setIsUpdating(false);
    window.location.hash = `host/${event.id}`;
  };

  return (
    <div className="max-w-3xl mx-auto bg-[#111] rounded-[32px] border border-neutral-800 overflow-hidden animate-in fade-in duration-300">
      <div className="p-8 md:p-10 border-b border-neutral-800">
        <a
          href={`#host/${event.id}`}
          className="inline-flex items-center text-sm font-bold text-orange-500 mb-6 hover:text-orange-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Event Panel
        </a>
        <h2 className="text-4xl font-black text-white tracking-tight">
          Edit Event Details
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
        <div>
          <label className="block text-sm font-bold text-neutral-300 mb-2">
            Event Name
          </label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="bg-black/40 p-6 rounded-3xl border border-neutral-800/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-neutral-300 mb-2">
                Event Date
              </label>
              <input
                required
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-300 mb-2">
                Start Time
              </label>
              <div className="flex gap-2">
                <select
                  value={eventHour}
                  onChange={(e) => setEventHour(e.target.value)}
                  className="flex-1 bg-black border border-neutral-800 rounded-2xl px-3 sm:px-5 py-4 text-white focus:border-orange-500 focus:outline-none cursor-pointer appearance-none"
                >
                  {[
                    "01",
                    "02",
                    "03",
                    "04",
                    "05",
                    "06",
                    "07",
                    "08",
                    "09",
                    "10",
                    "11",
                    "12",
                  ].map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span className="text-neutral-500 self-center font-bold text-xl">
                  :
                </span>
                <select
                  value={eventMinute}
                  onChange={(e) => setEventMinute(e.target.value)}
                  className="flex-1 bg-black border border-neutral-800 rounded-2xl px-3 sm:px-5 py-4 text-white focus:border-orange-500 focus:outline-none cursor-pointer appearance-none"
                >
                  {[
                    "00",
                    "05",
                    "10",
                    "15",
                    "20",
                    "25",
                    "30",
                    "35",
                    "40",
                    "45",
                    "50",
                    "55",
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={eventAmPm}
                  onChange={(e) => setEventAmPm(e.target.value)}
                  className="flex-1 bg-black border border-neutral-800 rounded-2xl px-3 sm:px-5 py-4 text-white focus:border-orange-500 focus:outline-none cursor-pointer font-bold appearance-none"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-neutral-300 mb-2">
              Duration (Hours)
            </label>
            <input
              required
              type="number"
              step="0.5"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-300 mb-2">
              Max Capacity (Total People)
            </label>
            <input
              required
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
              className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-300 mb-3">
            Ticket Theme
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(TICKET_THEMES).map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setFormData({ ...formData, theme: t.id })}
                className={`p-3 rounded-2xl border-2 transition-all text-left ${formData.theme === t.id ? "border-orange-500 scale-[1.02] bg-neutral-900 shadow-lg shadow-orange-500/10" : "border-neutral-800 bg-black hover:border-neutral-600"}`}
              >
                <div
                  className="h-12 rounded-xl mb-3 w-full"
                  style={{
                    background: `linear-gradient(135deg, ${t.grad1}, ${t.grad2})`,
                  }}
                ></div>
                <p className="text-xs font-bold text-white text-center">
                  {t.name}
                </p>
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-3 font-medium">
            Changing the theme will update the look of all currently active
            guest passes.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-300 mb-2">
            Door Scanner Passcode
          </label>
          <input
            required
            type="text"
            value={formData.scannerPasscode}
            onChange={(e) =>
              setFormData({ ...formData, scannerPasscode: e.target.value })
            }
            className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors font-mono tracking-wider"
          />
        </div>

        <div className="bg-black border border-neutral-800 p-6 rounded-3xl">
          <label className="flex items-center gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowPlusOnes}
              onChange={(e) =>
                setFormData({ ...formData, allowPlusOnes: e.target.checked })
              }
              className="w-6 h-6 rounded-md border-neutral-700 text-orange-500 focus:ring-orange-500 bg-neutral-900"
            />
            <span className="font-bold text-white">
              Allow guests to bring extra people (+1s)
            </span>
          </label>

          {formData.allowPlusOnes && (
            <div className="mt-6 pt-6 border-t border-neutral-800 animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-bold text-neutral-300 mb-2">
                Maximum extra people each guest can bring
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxPlusOnes}
                onChange={(e) =>
                  setFormData({ ...formData, maxPlusOnes: e.target.value })
                }
                className="w-full sm:w-1/2 bg-[#111] border border-neutral-700 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-300 mb-2">
            Location
          </label>
          <input
            required
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-300 mb-2">
            Welcome Message for Guests
          </label>
          <textarea
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors resize-none"
            rows="4"
          />
        </div>

        <div className="pt-4">
          <button
            disabled={isUpdating}
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 transition-colors text-black font-extrabold py-5 rounded-full flex items-center justify-center gap-3 text-lg disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <Mail className="w-5 h-5 animate-pulse" /> Saving & Emailing
                Guests...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function HostDashboardView({ event }) {
  const [copied, setCopied] = useState(false);
  const [doorCopied, setDoorCopied] = useState(false);

  const baseUrl = window.location.href.split("#")[0];
  const inviteUrl = `${baseUrl}#invite/${event?.id}`;
  const doorUrl = `${baseUrl}#door/${event?.id}`;
  const ended = isEventEnded(event);

  const handleCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = inviteUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDoorCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = doorUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    setDoorCopied(true);
    setTimeout(() => setDoorCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-[#111] border border-neutral-800 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            {event.name}
          </h2>
          <a
            href={`#edit/${event.id}`}
            className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-5 py-2.5 rounded-full text-sm font-bold transition-colors"
          >
            <Edit className="w-4 h-4" /> Edit Event
          </a>
        </div>
        <div className="flex flex-wrap gap-6 text-sm md:text-base text-neutral-400 font-medium">
          <span className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />{" "}
            {new Date(event.date).toLocaleString()}
          </span>
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />{" "}
            {getEventGuestCount(event)} / {event.capacity} Guests
          </span>
        </div>
      </div>

      <div className="bg-[#111] border border-neutral-800 rounded-[32px] p-8 md:p-10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <LinkIcon className="text-orange-500 w-6 h-6" /> Guest Invite Link
        </h3>
        {ended && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-sm font-medium mb-6">
            Event has concluded. Registration is disabled.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            readOnly
            value={inviteUrl}
            className="flex-1 bg-black border border-neutral-800 rounded-full px-6 py-4 text-neutral-400 font-mono text-sm focus:outline-none"
          />
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="bg-neutral-800 text-white px-8 py-4 rounded-full font-bold hover:bg-neutral-700 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <a
              href={`#invite/${event.id}`}
              className="bg-orange-500 text-black px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors"
            >
              Test View
            </a>
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-neutral-800 rounded-[32px] p-8 md:p-10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <Scan className="text-blue-500 w-6 h-6" /> Door Scanner Access
        </h3>
        {ended && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-sm font-medium mb-6">
            Event has concluded. Scanning is permanently disabled.
          </div>
        )}
        <div className="bg-black border border-neutral-800 p-6 rounded-2xl text-sm mb-6">
          <p className="text-neutral-300">
            <strong>
              Scanner Passcode:{" "}
              <span className="text-white font-mono bg-[#222] px-3 py-1 rounded-lg ml-2 tracking-wider text-base">
                {event.scannerPasscode || "Not Set"}
              </span>
            </strong>
          </p>
          <p className="mt-3 text-neutral-500 font-medium">
            Give this dedicated link and passcode to your security team. They
            can scan guests without logging into your account.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            readOnly
            value={doorUrl}
            className="flex-1 bg-black border border-neutral-800 rounded-full px-6 py-4 text-neutral-400 font-mono text-sm focus:outline-none"
          />
          <div className="flex gap-3">
            <button
              onClick={handleDoorCopy}
              className="bg-neutral-800 text-white px-8 py-4 rounded-full font-bold hover:bg-neutral-700 transition-colors"
            >
              {doorCopied ? "Copied!" : "Copy"}
            </button>
            <a
              href={`#door/${event.id}`}
              className="bg-white text-black px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-neutral-200 transition-colors"
            >
              Test View
            </a>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <a
          href={ended ? "#" : `#scan/${event.id}`}
          className={`block bg-[#111] border border-neutral-800 rounded-[32px] p-10 transition-all ${ended ? "opacity-50 cursor-not-allowed" : "hover:border-orange-500/50"}`}
        >
          <Camera className="w-14 h-14 text-orange-500 mb-6" />
          <h3 className="text-2xl font-bold text-white mb-3">Live Scanner</h3>
          <p className="text-neutral-400 font-medium leading-relaxed">
            Launch the web scanner to verify guest QR codes at the door.
          </p>
        </a>
        <a
          href={`#log/${event.id}`}
          className="block bg-[#111] border border-neutral-800 rounded-[32px] p-10 hover:border-blue-500/50 transition-all"
        >
          <Users className="w-14 h-14 text-blue-500 mb-6" />
          <h3 className="text-2xl font-bold text-white mb-3">Guest Log</h3>
          <p className="text-neutral-400 font-medium leading-relaxed">
            View detailed attendance records and manage your guest list.
          </p>
        </a>
      </div>
    </div>
  );
}

function GuestRegistrationView({ event, updateEvent }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plusOnes, setPlusOnes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (isEventEnded(event)) {
    return (
      <div className="max-w-lg mx-auto mt-12 p-12 bg-[#111] border border-neutral-800 rounded-[32px] text-center shadow-2xl">
        <Clock className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-white mb-2">Event Finished</h2>
        <p className="text-neutral-400 text-lg font-medium">
          Registration for {event.name} is now closed.
        </p>
      </div>
    );
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const emailExists = event.guests.some(
      (g) => g.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (emailExists) {
      setErrorMsg(
        "This email is already registered! You cannot claim multiple passes.",
      );
      return;
    }

    setIsLoading(true);
    const guestId = Math.random().toString(36).substr(2, 6).toUpperCase();

    const newGuest = {
      id: guestId,
      name: name.trim(),
      email: email.trim(),
      plusOnes: plusOnes,
      status: "pending",
      registeredAt: new Date().toISOString(),
    };

    await updateEvent(event.id, {
      ...event,
      guests: [...event.guests, newGuest],
    });

    try {
      await addDoc(collection(db, "mail"), {
        to: newGuest.email,
        message: {
          subject: `Your VIP Pass: ${event.name}`,
          html: generatePassEmailHTML(event, newGuest),
        },
      });
    } catch (err) {
      console.error("Failed to queue registration email", err);
    }

    window.location.hash = `success/${event.id}/${guestId}`;
  };

  const totalRegistered = getEventGuestCount(event);
  const isFull = totalRegistered >= event.capacity;
  const remainingCapacity = event.capacity - totalRegistered;
  const availablePlusOnes = Math.min(
    event.maxPlusOnes || 0,
    remainingCapacity - 1,
  );

  return (
    <div className="max-w-lg mx-auto animate-in fade-in zoom-in duration-500">
      <div className="bg-[#111] rounded-[40px] border border-neutral-800 overflow-hidden shadow-2xl">
        <div className="p-10 text-center border-b border-neutral-800 bg-gradient-to-br from-neutral-900 to-black relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
            {event.name}
          </h2>
          <p className="text-neutral-400 font-medium">{event.location}</p>
        </div>

        {isFull ? (
          <div className="p-10 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Event is Full
            </h3>
            <p className="text-neutral-400 leading-relaxed font-medium">
              Unfortunately, this event has reached its maximum capacity of{" "}
              {event.capacity} guests.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="p-10 space-y-6">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-bold flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}
            <div>
              <input
                required
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <input
                required
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>

            {event.allowPlusOnes && availablePlusOnes > 0 && (
              <div className="bg-black border border-neutral-800 p-6 rounded-2xl mt-4">
                <label className="block text-sm font-bold text-neutral-300 mb-3">
                  Bringing extra guests?
                </label>
                <select
                  value={plusOnes}
                  onChange={(e) => setPlusOnes(parseInt(e.target.value))}
                  className="w-full bg-[#111] border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none cursor-pointer appearance-none font-medium"
                >
                  <option value={0}>Just me (1 person)</option>
                  {[...Array(availablePlusOnes)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      + {i + 1} Person{i + 1 > 1 ? "s" : ""} (Total: {i + 2}{" "}
                      people)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-neutral-500 mt-3 font-medium">
                  One single QR code will be generated for your entire party.
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                disabled={isLoading}
                className="w-full bg-orange-500 text-black font-extrabold text-lg py-5 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Register & Get Pass"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-neutral-500 font-medium mb-3">
          Want to host your own VIP events?
        </p>
        <a
          href="#signup"
          className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-orange-500 transition-colors"
        >
          Create a Host Account <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

function GuestSuccessView({ event, guestId }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const guest = event?.guests?.find((g) => g.id === guestId);
  const theme = TICKET_THEMES[event?.theme || "midnight"];

  if (!guest) return <ErrorView message="Pass not found." />;

  const downloadTicket = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 570;
      canvas.height = 1334;
      const ctx = canvas.getContext("2d");

      // Outer Background Canvas Area
      ctx.fillStyle = theme.isDark ? "#000000" : "#e2e8f0";
      ctx.fillRect(0, 0, 570, 1334);

      // Main Ticket Body Background
      ctx.fillStyle = theme.bgIn;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(35, 50, 500, 1234, 40);
      else ctx.rect(35, 50, 500, 1234);
      ctx.fill();

      // Ticket Header (Gradient)
      const grad = ctx.createLinearGradient(35, 50, 535, 250);
      grad.addColorStop(0, theme.grad1);
      grad.addColorStop(1, theme.grad2);
      ctx.fillStyle = grad;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(35, 50, 500, 200, [40, 40, 0, 0]);
      else ctx.rect(35, 50, 500, 200);
      ctx.fill();

      // Top Header Text (Always white on vibrant gradients)
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 16px sans-serif";
      ctx.letterSpacing = "4px";
      ctx.fillText("OFFICIAL VIP PASS", 285, 110);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 36px sans-serif";
      ctx.letterSpacing = "-1px";
      ctx.fillText(event.name.substring(0, 24), 285, 170);

      // Perforation Line
      ctx.strokeStyle = theme.isDark ? "#000000" : "#e2e8f0";
      ctx.lineWidth = 10;
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      ctx.moveTo(35, 250);
      ctx.lineTo(535, 250);
      ctx.stroke();
      ctx.setLineDash([]);

      // Perforation cutouts (matching outer canvas background)
      ctx.fillStyle = theme.isDark ? "#000000" : "#e2e8f0";
      ctx.beginPath();
      ctx.arc(35, 250, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(535, 250, 20, 0, Math.PI * 2);
      ctx.fill();

      // QR Code Generator (Must have margin for guaranteed white background safety!)
      const qrImage = new Image();
      qrImage.crossOrigin = "Anonymous";
      qrImage.src = `https://quickchart.io/qr?text=${guest.id}&size=300&margin=2`;

      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
      });
      ctx.drawImage(qrImage, 135, 320, 300, 300);

      // Guest Info (Themed Colors)
      ctx.fillStyle = theme.textMain;
      ctx.font = "900 48px sans-serif";
      ctx.fillText(guest.name, 285, 680);

      const admits = 1 + (guest.plusOnes || 0);
      ctx.fillStyle = theme.accent;
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(
        `ADMITS: ${admits} ${admits > 1 ? "PEOPLE" : "PERSON"}`,
        285,
        730,
      );

      ctx.fillStyle = theme.textMuted;
      ctx.font = "24px monospace";
      ctx.fillText(guest.id, 285, 780);

      // Divider Line
      ctx.strokeStyle = theme.isDark ? "#333333" : "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(85, 830);
      ctx.lineTo(485, 830);
      ctx.stroke();
      ctx.setLineDash([]);

      // Details block
      ctx.textAlign = "left";
      ctx.fillStyle = theme.textMuted;
      ctx.font = "20px sans-serif";
      ctx.fillText("Date & Time", 85, 890);
      ctx.fillStyle = theme.textMain;
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(new Date(event.date).toLocaleString(), 85, 930);

      ctx.fillStyle = theme.textMuted;
      ctx.font = "20px sans-serif";
      ctx.fillText("Location", 85, 1000);
      ctx.fillStyle = theme.textMain;
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(event.location.substring(0, 30), 85, 1040);

      // Welcome Message Block
      if (event.message) {
        ctx.fillStyle = theme.isDark ? "#1a1a1a" : "#f8fafc";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(85, 1090, 400, 150, 20);
        else ctx.rect(85, 1090, 400, 150);
        ctx.fill();

        ctx.fillStyle = theme.textMuted;
        ctx.font = "italic 20px sans-serif";
        ctx.textAlign = "center";

        const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
          const words = text.split(" ");
          let line = "";
          let currentY = y;
          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " ";
            const metrics = context.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
              context.fillText(line.trim(), x, currentY);
              line = words[n] + " ";
              currentY += lineHeight;
            } else {
              line = testLine;
            }
          }
          context.fillText(line.trim(), x, currentY);
        };
        wrapText(ctx, `"${event.message}"`, 285, 1140, 360, 30);
      }

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${event.name.replace(/\s+/g, "_")}_VIP_Pass.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate ticket image", err);
      alert("Failed to download ticket. Please try again.");
    }
    setIsDownloading(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-emerald-500/10 text-emerald-500 p-5 rounded-[24px] border border-emerald-500/20 flex items-center gap-4 shadow-lg shadow-emerald-500/5">
        <div className="bg-emerald-500 text-black rounded-full p-2">
          <Mail className="w-5 h-5" />
        </div>
        <p className="text-sm font-bold">
          Ticket generated & sent to {guest.email}
        </p>
      </div>

      <div
        className="rounded-[40px] shadow-2xl overflow-hidden text-center p-10 relative border"
        style={{
          backgroundColor: theme.bgIn,
          borderColor: theme.isDark ? "#262626" : "#e2e8f0",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-3"
          style={{
            background: `linear-gradient(to right, ${theme.grad1}, ${theme.grad2})`,
          }}
        ></div>
        <p
          className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 mt-2"
          style={{ color: theme.accent }}
        >
          OFFICIAL VIP PASS
        </p>
        <h2
          className="text-3xl font-black mb-8 tracking-tight"
          style={{ color: theme.textMain }}
        >
          {event.name}
        </h2>
        <div
          className="inline-block bg-white p-5 rounded-3xl mb-8 border"
          style={{ borderColor: theme.isDark ? "#333333" : "#e2e8f0" }}
        >
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${guest.id}&margin=0`}
            className="w-48 h-48 mx-auto"
            alt="QR Code"
          />
        </div>
        <h3 className="text-3xl font-black" style={{ color: theme.textMain }}>
          {guest.name}
        </h3>
        {guest.plusOnes > 0 && (
          <div
            className="font-black px-4 py-2 rounded-full text-sm inline-block mt-3 border"
            style={{
              color: theme.accent,
              backgroundColor: `${theme.accent}1A`,
              borderColor: `${theme.accent}33`,
            }}
          >
            Admits: {1 + guest.plusOnes} People
          </div>
        )}
        <p
          className="font-mono text-sm mt-3 font-medium"
          style={{ color: theme.textMuted }}
        >
          {guest.id}
        </p>
        <div
          className="mt-10 pt-8 border-t border-dashed text-sm text-left space-y-4 font-medium"
          style={{ borderColor: theme.textMuted }}
        >
          <div className="flex gap-3 items-center">
            <Calendar className="w-5 h-5" style={{ color: theme.textMuted }} />{" "}
            <span style={{ color: theme.textMain }}>
              {new Date(event.date).toLocaleString()}
            </span>
          </div>
          <div className="flex gap-3 items-center">
            <MapPin className="w-5 h-5" style={{ color: theme.textMuted }} />{" "}
            <span style={{ color: theme.textMain }}>{event.location}</span>
          </div>
        </div>
      </div>

      <button
        onClick={downloadTicket}
        disabled={isDownloading}
        className="w-full text-white font-extrabold text-lg py-5 rounded-full transition-transform hover:scale-105 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
        style={{
          background: `linear-gradient(135deg, ${theme.grad1}, ${theme.grad2})`,
        }}
      >
        <Download className="w-6 h-6" />
        {isDownloading ? "Generating Ticket..." : "Download VIP Pass (PNG)"}
      </button>
    </div>
  );
}

function DoorScannerAuthView({
  event,
  updateEvent,
  scannerReady,
  authorizedDoors,
  setAuthorizedDoors,
  hostEmail,
}) {
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (isEventEnded(event)) {
    return (
      <div className="max-w-md mx-auto mt-12 p-12 bg-[#111] border border-neutral-800 rounded-[32px] text-center shadow-2xl">
        <Clock className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-white mb-2">Event Finished</h2>
        <p className="text-neutral-400 text-lg font-medium">
          Scanning for {event.name} is permanently closed.
        </p>
      </div>
    );
  }

  if (authorizedDoors[event.id] || (hostEmail && event.owner === hostEmail)) {
    return (
      <ScannerView
        event={event}
        updateEvent={updateEvent}
        scannerReady={scannerReady}
        isDoorMode={true}
      />
    );
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode.trim() === event.scannerPasscode) {
      setAuthorizedDoors((prev) => ({ ...prev, [event.id]: true }));
    } else {
      setErrorMsg("Incorrect passcode. Please verify with the host.");
    }
  };

  return (
    <div className="max-w-md mx-auto animate-in fade-in zoom-in duration-500 mt-12">
      <div className="bg-[#111] rounded-[40px] border border-neutral-800 overflow-hidden shadow-2xl">
        <div className="p-10 text-center border-b border-neutral-800 bg-gradient-to-br from-neutral-900 to-black">
          <div className="inline-block bg-blue-500/10 p-4 rounded-full mb-4">
            <Scan className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
            Scanner Login
          </h2>
          <p className="text-neutral-400 font-medium">{event.name}</p>
        </div>

        <form onSubmit={handleLogin} className="p-10 space-y-6">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-bold flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-neutral-300 mb-2">
              Scanner Passcode
            </label>
            <input
              required
              type="password"
              placeholder="Enter secret code"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-extrabold text-lg py-5 rounded-full hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
            >
              Launch Scanner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScannerView({ event, updateEvent, scannerReady, isDoorMode = false }) {
  const [scanResult, setScanResult] = useState(null);
  const [manualId, setManualId] = useState("");
  const scannerRef = useRef(null);

  const processScan = async (scannedId) => {
    const guestIndex = event.guests.findIndex((g) => g.id === scannedId);
    if (guestIndex === -1) {
      setScanResult({ type: "error", message: "Invalid Pass!" });
      return;
    }
    const guest = event.guests[guestIndex];
    if (guest.status === "attended") {
      setScanResult({ type: "warning", message: "Already Used!", guest });
    } else {
      const updated = [...event.guests];
      updated[guestIndex] = {
        ...guest,
        status: "attended",
        checkInTime: new Date().toLocaleTimeString(),
      };
      await updateEvent(event.id, { ...event, guests: updated });
      setScanResult({
        type: "success",
        message: "Access Granted!",
        guest: updated[guestIndex],
      });
    }
    setTimeout(() => setScanResult(null), 4000);
  };

  useEffect(() => {
    if (!scannerReady || !window.Html5QrcodeScanner || scannerRef.current)
      return;
    const scanner = new window.Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false,
    );
    scanner.render(
      (txt) => processScan(txt),
      () => {},
    );
    scannerRef.current = scanner;
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((e) => console.error(e));
        scannerRef.current = null;
      }
    };
  }, [scannerReady, event]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-center">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white flex items-center gap-3">
          <Camera className="w-8 h-8 text-orange-500" /> Scanner
        </h2>
        {isDoorMode ? (
          <span className="text-xs font-black tracking-widest uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Door Team
          </span>
        ) : (
          <a
            href={`#host/${event.id}`}
            className="text-sm font-bold text-neutral-400 hover:text-white transition-colors border border-neutral-800 px-5 py-2 rounded-full"
          >
            Close
          </a>
        )}
      </div>
      <div className="bg-[#111] border border-neutral-800 rounded-[40px] p-8 md:p-12 flex flex-col items-center shadow-2xl">
        {scanResult && (
          <div
            className={`w-full p-8 rounded-3xl mb-8 shadow-xl ${scanResult.type === "success" ? "bg-emerald-500 text-black" : "bg-red-500 text-white"}`}
          >
            <div className="text-2xl font-black mb-4 uppercase tracking-wider">
              {scanResult.message}
            </div>
            {scanResult.guest && (
              <div className="bg-black/20 p-6 rounded-2xl">
                <div className="text-4xl font-black mb-2 tracking-tight">
                  PARTY OF {1 + (scanResult.guest.plusOnes || 0)}
                </div>
                <p className="text-xl font-bold">{scanResult.guest.name}</p>
                <p className="text-sm opacity-70 font-mono mt-2 font-medium">
                  {scanResult.guest.id}
                </p>
              </div>
            )}
          </div>
        )}
        <div
          id="qr-reader"
          className="w-full max-w-md rounded-3xl overflow-hidden bg-black border-2 border-neutral-800"
        />
        <div className="w-full mt-8 pt-8 border-t border-neutral-800 flex gap-3">
          <input
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="Enter Manual ID"
            className="flex-1 bg-black border border-neutral-800 rounded-full px-6 py-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button
            onClick={() => processScan(manualId)}
            className="bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-neutral-200 transition-colors"
          >
            Check
          </button>
        </div>
      </div>
    </div>
  );
}

function LogDashboardView({ event, updateEvent }) {
  const [removingGuest, setRemovingGuest] = useState(null);

  const confirmRemove = async () => {
    await updateEvent(event.id, {
      ...event,
      guests: event.guests.filter((g) => g.id !== removingGuest.id),
    });
    setRemovingGuest(null);
  };

  const handleManualCheckIn = async (guestId) => {
    const updatedGuests = event.guests.map((g) => {
      if (g.id === guestId && g.status !== "attended") {
        return {
          ...g,
          status: "attended",
          checkInTime: new Date().toLocaleTimeString(),
        };
      }
      return g;
    });
    await updateEvent(event.id, { ...event, guests: updatedGuests });
  };

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Pass ID",
      "Plus Ones",
      "Total Party Size",
      "Status",
      "Registered At",
      "Check-in Time",
    ];
    const rows = event.guests.map((g) => [
      `"${g.name}"`,
      `"${g.email}"`,
      g.id,
      g.plusOnes || 0,
      1 + (g.plusOnes || 0),
      g.status,
      g.registeredAt ? new Date(g.registeredAt).toLocaleString() : "N/A",
      g.checkInTime || "N/A",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${event.name.replace(/\s+/g, "_")}_Guest_Log.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total: getEventGuestCount(event),
    attended: event.guests
      .filter((g) => g.status === "attended")
      .reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0),
    capacity: event.capacity,
  };

  const fillPercentage = Math.min(100, (stats.total / stats.capacity) * 100);
  const attendancePercentage =
    stats.total > 0 ? Math.min(100, (stats.attended / stats.total) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in">
      {removingGuest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#111] border border-neutral-800 rounded-[32px] p-8 md:p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-red-500 mb-4 flex items-center gap-3">
              <Trash2 className="w-8 h-8" /> Remove Guest?
            </h3>
            <p className="text-neutral-300 mb-8 text-lg font-medium leading-relaxed">
              Are you sure you want to ban <strong>{removingGuest.name}</strong>
              ? Their pass will be invalidated immediately.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRemovingGuest(null)}
                className="text-neutral-400 hover:text-white font-bold px-6 py-3 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-full transition-colors shadow-lg shadow-red-500/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <h2 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3 tracking-tight">
          <Users className="text-blue-500 w-8 h-8" /> Guest Log
        </h2>
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="text-sm font-bold bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 px-5 py-2.5 rounded-full transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <a
            href="#my-events"
            className="text-sm font-bold text-neutral-400 hover:text-white transition-colors"
          >
            Dashboard
          </a>
          <a
            href={`#host/${event.id}`}
            className="bg-white hover:bg-neutral-200 text-black px-6 py-3 rounded-full text-sm font-bold transition-colors"
          >
            Host Panel
          </a>
        </div>
      </div>

      <div className="bg-[#111] border border-neutral-800 rounded-[32px] overflow-hidden shadow-2xl p-6 md:p-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-neutral-400">Event Capacity Filled</span>
              <span className="text-white">
                {stats.total} / {stats.capacity} Guests
              </span>
            </div>
            <div className="h-4 bg-black rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                style={{ width: `${fillPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-neutral-400">Door Attendance Rate</span>
              <span className="text-white">
                {stats.attended} / {stats.total} Arrived
              </span>
            </div>
            <div className="h-4 bg-black rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${attendancePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-neutral-800 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#111] text-neutral-400 text-sm uppercase tracking-wider font-bold">
              <tr>
                <th className="p-6">Name (Party)</th>
                <th className="p-6">Pass ID</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {event.guests.map((g) => (
                <tr
                  key={g.id}
                  className="hover:bg-neutral-900/50 transition-colors"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-lg">
                        {g.name}
                      </span>
                      {g.plusOnes > 0 && (
                        <span className="bg-orange-500/10 text-orange-500 text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-widest">
                          +{g.plusOnes}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-neutral-500 font-medium mt-1">
                      {g.email}
                    </div>
                  </td>
                  <td className="p-6 font-mono text-sm text-neutral-400">
                    {g.id}
                  </td>
                  <td className="p-6">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase ${g.status === "attended" ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"}`}
                    >
                      {g.status}
                    </span>
                    {g.status === "attended" && g.checkInTime && (
                      <div className="text-[10px] text-neutral-500 mt-2 font-medium">
                        In: {g.checkInTime}
                      </div>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    {g.status !== "attended" && (
                      <button
                        onClick={() => handleManualCheckIn(g.id)}
                        className="text-emerald-500 hover:text-emerald-400 bg-neutral-900 hover:bg-emerald-500/10 p-3 rounded-full transition-colors mr-2"
                        title="Manual Check-In"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setRemovingGuest(g)}
                      className="text-neutral-600 hover:text-red-500 bg-neutral-900 hover:bg-red-500/10 p-3 rounded-full transition-colors"
                      title="Remove Guest"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {event.guests.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="p-10 text-center text-neutral-500 font-medium"
                  >
                    No guests registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AuthView({ redirectMessage, defaultIsLogin = true }) {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    setIsLogin(defaultIsLogin);
    setError("");
  }, [defaultIsLogin]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(userCredential.user, { displayName: name.trim() });

        try {
          await addDoc(collection(db, "mail"), {
            to: email.trim(),
            message: {
              subject: "Welcome to VIP Access! 🥂",
              html: `
                <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #262626; border-radius: 24px; overflow: hidden; background-color: #000000; color: #ffffff;">
                  <div style="background: linear-gradient(135deg, #ea580c, #dc2626); padding: 40px 30px; text-align: center;">
                    <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 12px; letter-spacing: 4px; font-weight: bold; opacity: 0.9;">HOST ACCOUNT VERIFIED</p>
                    <h2 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px;">VIP ACCESS</h2>
                  </div>
                  <div style="padding: 40px 30px; text-align: center;">
                    <h3 style="color: #ffffff; font-size: 24px; margin-top: 0; font-weight: bold;">Welcome, ${name.trim()}!</h3>
                    <p style="color: #a3a3a3; line-height: 1.6; font-size: 16px;">Your host account is officially ready. You can now start creating exclusive events, managing VIP guest lists, and generating cryptographic QR passes.</p>

                    <div style="margin: 40px 0;">
                      <a href="${window.location.origin}${window.location.pathname}#my-events" style="background-color: #ea580c; color: #000000; padding: 16px 32px; border-radius: 50px; font-weight: bold; text-decoration: none; font-size: 16px; display: inline-block;">Go to your Dashboard</a>
                    </div>
                  </div>
                </div>
              `,
            },
          });
        } catch (mailErr) {
          console.error("Failed to queue welcome email", mailErr);
        }
      }
      window.location.hash = "my-events";
    } catch (err) {
      if (err.code === "auth/email-already-in-use")
        setError(
          'This email is already registered. Please switch to "Log In".',
        );
      else if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      )
        setError("Incorrect email or password. Please try again.");
      else if (err.code === "auth/weak-password")
        setError("Password is too weak. Please use at least 6 characters.");
      else setError(err.message.replace("Firebase: ", ""));
    }
    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setPassword("");
    setConfirmPassword("");
    setIsForgotPassword(false);
    setResetSent(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      {redirectMessage && (
        <div className="bg-orange-500/10 text-orange-500 p-5 rounded-2xl mb-6 text-sm font-bold tracking-wide">
          {redirectMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-2xl mb-6 text-sm font-bold flex items-start gap-3 animate-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <div className="bg-[#111] border border-neutral-800 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
        <ShieldCheck className="w-14 h-14 text-orange-500 mx-auto mb-6" />

        {isForgotPassword ? (
          <>
            <h2 className="text-3xl font-black text-white mb-3 text-center tracking-tight">
              Reset Password
            </h2>
            <p className="text-neutral-400 font-medium text-center mb-10">
              Enter your email and we'll send you a reset link.
            </p>
            {resetSent ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-5 rounded-2xl mb-6 text-sm font-bold text-center">
                Reset link sent! Check your email inbox.
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-neutral-300 mb-2">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 outline-none transition-colors"
                  />
                </div>
                <div className="pt-4">
                  <button
                    disabled={isLoading}
                    className="w-full bg-orange-500 text-black font-extrabold text-lg py-5 rounded-full hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
            <div className="mt-8 text-center pt-8 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetSent(false);
                  setError("");
                }}
                className="text-neutral-400 font-bold hover:text-white transition-colors"
              >
                Back to Login
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-black text-white mb-3 text-center tracking-tight">
              {isLogin ? "Host Login" : "Create Account"}
            </h2>
            <p className="text-neutral-400 font-medium text-center mb-10">
              {isLogin
                ? "Welcome back to your dashboard."
                : "Start hosting exclusive VIP events today."}
            </p>

            <form onSubmit={handleAuth} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-neutral-300 mb-2">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 outline-none transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-2">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 outline-none transition-colors"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-neutral-300">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs font-bold text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  minLength="6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 outline-none transition-colors"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-neutral-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    minLength="6"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:border-orange-500 outline-none transition-colors"
                  />
                </div>
              )}

              <div className="pt-4">
                <button
                  disabled={isLoading}
                  className="w-full bg-orange-500 text-black font-extrabold text-lg py-5 rounded-full hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading
                    ? "Processing..."
                    : isLogin
                      ? "Log In"
                      : "Create Account"}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center pt-8 border-t border-neutral-800">
              <button
                type="button"
                onClick={toggleMode}
                className="text-neutral-400 font-bold hover:text-white transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Log in"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, ended, setRemovingEvent }) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={() => (window.location.hash = `host/${event.id}`)}
      className={`relative z-10 hover:z-20 bg-white/[0.03] backdrop-blur-3xl transform-gpu border border-white/10 rounded-[32px] p-8 cursor-pointer hover:bg-white/[0.06] hover:border-orange-500/40 hover:shadow-[0_8px_32px_rgba(234,88,12,0.25)] transition-all duration-500 group shadow-xl shadow-black/20 overflow-hidden ${ended ? "opacity-60 grayscale" : ""}`}
    >
      {/* Liquid Glass Edge Highlight */}
      <div className="absolute inset-0 rounded-[32px] pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] z-20"></div>

      {/* Dynamic Mouse Tracking Glow (Moves with cursor) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
        style={{
          background: `radial-gradient(circle 350px at ${mousePos.x}px ${mousePos.y}px, rgba(249, 115, 22, 0.22), transparent 80%)`,
        }}
      ></div>

      <div className="relative z-10">
        <div className="absolute top-0 right-0 flex items-center gap-2">
          {ended && (
            <span className="bg-white/10 backdrop-blur-md border border-white/10 text-[10px] text-white/70 px-3 py-1.5 rounded-full font-black tracking-widest uppercase shadow-inner">
              Ended
            </span>
          )}
          <button
            onClick={(ev) => {
              ev.stopPropagation();
              setRemovingEvent(event);
            }}
            className="text-white/40 hover:text-red-400 hover:bg-red-500/20 p-2 rounded-full transition-colors relative z-20"
            title="Delete Event"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <h4 className="text-2xl font-black text-white mb-6 mt-2 group-hover:text-orange-400 transition-colors truncate pr-16 drop-shadow-md">
          {event.name}
        </h4>

        <div className="space-y-4 text-sm text-white/60 mb-8 font-medium">
          <div className="flex gap-3 items-center">
            <Calendar className="w-5 h-5 text-white/40" />{" "}
            {new Date(event.date).toLocaleDateString()}
          </div>
          <div className="flex gap-3 items-center">
            <Users className="w-5 h-5 text-white/40" />{" "}
            {getEventGuestCount(event)} / {event.capacity} Registered
          </div>
        </div>
        <div className="flex justify-between items-center border-t border-white/10 pt-6 relative z-20">
          <span className="text-orange-400 font-bold flex items-center gap-2 group-hover:gap-3 transition-all drop-shadow-md pointer-events-none">
            Manage Event <ArrowRight className="w-4 h-4" />
          </span>
          <a
            href={`#log/${event.id}`}
            onClick={(ev) => ev.stopPropagation()}
            className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <Users className="w-4 h-4" /> Guest Log
          </a>
        </div>
      </div>
    </div>
  );
}

function MyEventsView({ events, isHost, hostEmail, hostName, deleteEvent }) {
  const list = Object.values(events).filter((e) => e.owner === hostEmail);
  const displayName = hostName || hostEmail.split("@")[0];
  const [removingEvent, setRemovingEvent] = useState(null);

  const confirmRemove = async () => {
    if (!removingEvent) return;
    await deleteEvent(removingEvent.id);
    setRemovingEvent(null);
  };

  return (
    <div className="space-y-12 animate-in fade-in pb-16 relative">
      {/* Ambient Background Glows for Liquid Glass Effect - Increased Size & Opacity */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-orange-500/15 rounded-full blur-[128px] pointer-events-none -z-10 mix-blend-screen"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-500/15 rounded-full blur-[128px] pointer-events-none -z-10 mix-blend-screen"></div>

      {removingEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xl animate-in fade-in">
          <div className="relative bg-neutral-900/60 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.8)] max-w-md w-full p-8 md:p-10 animate-in zoom-in-95 overflow-hidden">
            {/* Glass Edge Highlight */}
            <div className="absolute inset-0 rounded-[32px] pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"></div>
            <div className="flex items-center gap-4 text-red-500 mb-6 relative z-10">
              <AlertTriangle className="w-10 h-10" />
              <h3 className="text-2xl font-black text-white">Delete Event?</h3>
            </div>
            <p className="text-white/70 mb-8 font-medium leading-relaxed relative z-10">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white">{removingEvent.name}</strong>? All
              guest records will be wiped.
            </p>
            <div className="flex gap-3 justify-end relative z-10">
              <button
                onClick={() => setRemovingEvent(null)}
                className="px-6 py-3 rounded-full font-bold text-white/50 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="bg-red-500/80 hover:bg-red-500 backdrop-blur-md border border-red-500/50 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-red-500/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <p className="text-orange-500 text-sm font-black uppercase tracking-[0.2em] mb-2 drop-shadow-md">
            Host Dashboard
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-xl">
            Welcome, {displayName}
          </h2>
        </div>
        <a
          href="#create"
          className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-[0_8px_30px_rgb(0,0,0,0.3)]"
        >
          Create Event <ArrowRight className="w-4 h-4 text-orange-400" />
        </a>
      </div>

      {list.length === 0 ? (
        <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[40px] p-16 text-center shadow-2xl overflow-hidden z-10">
          <div className="absolute inset-0 rounded-[40px] pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"></div>
          <Calendar className="w-20 h-20 text-white/20 mx-auto mb-6 relative z-10" />
          <h3 className="text-3xl font-black text-white mb-4 relative z-10">
            No Events Yet
          </h3>
          <p className="text-white/60 text-lg mb-8 max-w-md mx-auto relative z-10">
            Create your first private VIP party and start generating secure
            passes instantly.
          </p>
          <a
            href="#create"
            className="inline-block bg-white text-black px-10 py-4 rounded-full font-bold hover:bg-neutral-200 transition-colors relative z-10"
          >
            Start Hosting
          </a>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {list.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              ended={isEventEnded(e)}
              setRemovingEvent={setRemovingEvent}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ErrorView({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <AlertTriangle className="w-20 h-20 text-red-500 mb-6" />
      <h2 className="text-3xl font-black text-white mb-4">Oops!</h2>
      <p className="text-neutral-400 text-lg mb-8">{message}</p>
      <a
        href="#"
        className="bg-white hover:bg-neutral-200 text-black font-bold px-8 py-4 rounded-full transition-colors"
      >
        Go Home
      </a>
    </div>
  );
}

function LoadingView({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="bg-orange-500/10 p-6 rounded-full mb-6">
        <Cloud className="w-12 h-12 text-orange-500 animate-pulse" />
      </div>
      <p className="text-neutral-400 font-bold tracking-wide">{message}</p>
    </div>
  );
}

function ServicePageView({ serviceId, isHost }) {
  const servicesData = {
    "qr-code-badges": {
      title: "QR Code Badges",
      icon: QrCode,
      description:
        "Generate unique, cryptographic QR code badges for every single guest instantly upon registration.",
      features: [
        {
          icon: Mail,
          title: "Automated Delivery",
          desc: "Beautifully designed VIP passes are instantly emailed to your guests the second they register.",
        },
        {
          icon: ShieldCheck,
          title: "Unforgeable Passes",
          desc: "Each pass contains a cryptographically unique ID, making duplicate or fake tickets impossible.",
        },
        {
          icon: Users,
          title: "Group Ticketing",
          desc: "Allow guests to bring +1s. A single QR code dynamically updates to admit their entire party.",
        },
      ],
    },
    "guest-management": {
      title: "Guest Management",
      icon: Users,
      description:
        "Maintain absolute control over who gets into your events with our powerful guest list tools.",
      features: [
        {
          icon: Clock,
          title: "Real-Time Tracking",
          desc: "Watch your dashboard update live as guests arrive and are scanned in at the door.",
        },
        {
          icon: Trash2,
          title: "Instant Revocation",
          desc: "Need to revoke an invite? Delete a guest with one click and their QR code becomes instantly invalid.",
        },
        {
          icon: AlertTriangle,
          title: "Capacity Control",
          desc: "Set maximum venue capacities and automatically close registration the moment you sell out.",
        },
      ],
    },
    "real-time-scanning": {
      title: "Real-time Scanning",
      icon: Scan,
      description:
        "Turn any smartphone into a powerful, lightning-fast door scanner to verify guests instantly.",
      features: [
        {
          icon: Smartphone,
          title: "No Hardware Needed",
          desc: "Use the built-in camera on any iPhone or Android device. No clunky, expensive scanning hardware required.",
        },
        {
          icon: ShieldCheck,
          title: "Delegated Access",
          desc: 'Create a secure "Door Passcode" so your security team can scan guests without logging into your host account.',
        },
        {
          icon: CheckCircle,
          title: "Visual Feedback",
          desc: "Clear, massive green and red visual indicators ensure your door staff can keep the line moving fast.",
        },
      ],
    },
  };

  const data = servicesData[serviceId];
  if (!data) return <ErrorView message="Service not found." />;
  const Icon = data.icon;

  return (
    <div className="max-w-5xl mx-auto py-12 md:py-20 animate-in fade-in slide-in-from-bottom-8 duration-500 px-4">
      <div className="text-center mb-16 md:mb-24">
        <div className="inline-flex items-center justify-center p-6 bg-orange-500/10 rounded-[32px] mb-8 border border-orange-500/20 shadow-lg shadow-orange-500/5">
          <Icon className="w-16 h-16 text-orange-500" />
        </div>
        <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
          {data.title}
        </h2>
        <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto leading-relaxed font-medium">
          {data.description}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-20">
        {data.features.map((feature, idx) => {
          const FeatureIcon = feature.icon;
          return (
            <div
              key={idx}
              className="bg-[#111] border border-neutral-800 rounded-[32px] p-8 md:p-10 hover:border-orange-500/50 transition-colors group"
            >
              <div className="bg-black border border-neutral-800 p-4 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform">
                <FeatureIcon className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-neutral-400 font-medium leading-relaxed">
                {feature.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div className="text-center bg-gradient-to-br from-orange-600 to-red-600 rounded-[40px] p-12 md:p-20 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Ready to upgrade your events?
          </h2>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Join hosts everywhere who are securing their doors and streamlining
            their guest lists with VIP Access.
          </p>
          <a
            href={isHost ? "#create" : "#signup"}
            className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-full font-bold text-lg hover:bg-neutral-200 transition-transform hover:scale-105 group"
          >
            {isHost ? "Start Hosting Now" : "Create Host Account"}
            <span className="bg-orange-500 text-white rounded-full p-2 flex items-center justify-center group-hover:bg-orange-600 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

function PricingView({ isHost }) {
  return (
    <div className="max-w-4xl mx-auto py-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto font-medium">
          No subscriptions. No hidden fees. Pay only for the events you host.
        </p>
      </div>

      <div className="max-w-lg mx-auto bg-[#111] border border-neutral-800 rounded-[40px] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-orange-500 to-red-500"></div>
        <div className="p-12 text-center border-b border-neutral-800 bg-black/40">
          <h3 className="text-2xl font-black text-white mb-4">
            Single Event Pass
          </h3>
          <div className="flex items-end justify-center gap-2 mb-4">
            <span className="text-6xl font-black text-orange-500">$5.99</span>
            <span className="text-neutral-500 mb-2 font-bold">/ event</span>
          </div>
          <p className="text-neutral-400 font-medium">
            Everything you need to run a flawless VIP experience.
          </p>
        </div>
        <div className="p-12">
          <a
            href={isHost ? "#create" : "#signup"}
            className="block w-full bg-white hover:bg-neutral-200 text-black text-center font-black text-lg py-5 rounded-full transition-transform hover:scale-105 mb-4"
          >
            {isHost ? "Start Hosting Now" : "Create Host Account"}
          </a>
        </div>
      </div>
    </div>
  );
}

function FAQView() {
  const faqs = [
    {
      question: "How does the pricing work?",
      answer:
        "We charge a simple, flat fee of $5.99 per event. No subscriptions, no hidden fees.",
    },
    {
      question: "Do my guests need to download an app?",
      answer:
        "Not at all! Guests simply click your custom invite link to receive their QR code.",
    },
    {
      question: "How do I scan passes at the door?",
      answer:
        "Just log into your Host Dashboard on any smartphone and click 'Launch Scanner'.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
          FAQ
        </h2>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto font-medium">
          Everything you need to know.
        </p>
      </div>
      <div className="space-y-6 max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-[#111] border border-neutral-800 rounded-[32px] p-8 md:p-10 shadow-lg"
          >
            <h3 className="text-xl font-black text-white mb-4 flex items-start gap-3">
              <span className="text-orange-500">Q:</span> {faq.question}
            </h3>
            <p className="text-neutral-400 pl-8 leading-relaxed font-medium">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminDashboardView({ events }) {
  const allEvents = Object.values(events);
  const totalEvents = allEvents.length;
  const totalGuests = allEvents.reduce(
    (sum, e) => sum + getEventGuestCount(e),
    0,
  );
  const estimatedRevenue = totalEvents * 5.99;

  return (
    <div className="space-y-12 animate-in fade-in pb-16 max-w-6xl mx-auto">
      <div className="border-b border-neutral-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-red-500 text-sm font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Master Control Room
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Platform Overview
          </h2>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-[32px] p-8 shadow-lg">
          <div className="bg-orange-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
            <Calendar className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-neutral-400 font-bold mb-1">Total Events Hosted</p>
          <h3 className="text-5xl font-black text-white">{totalEvents}</h3>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-[32px] p-8 shadow-lg">
          <div className="bg-blue-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-neutral-400 font-bold mb-1">
            Total Passes Generated
          </p>
          <h3 className="text-5xl font-black text-white">{totalGuests}</h3>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-[32px] p-8 shadow-lg">
          <div className="bg-emerald-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-emerald-500 font-black text-xl">$</span>
          </div>
          <p className="text-neutral-400 font-bold mb-1">Estimated Revenue</p>
          <h3 className="text-5xl font-black text-white">
            ${estimatedRevenue.toFixed(2)}
          </h3>
        </div>
      </div>

      <div className="bg-[#111] border border-neutral-800 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-neutral-800">
          <h3 className="text-2xl font-black text-white">
            Global Event Database
          </h3>
          <p className="text-neutral-400 font-medium mt-1">
            All events currently stored on the platform.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#111] text-neutral-400 text-sm uppercase tracking-wider font-bold">
              <tr>
                <th className="p-6">Event Name</th>
                <th className="p-6">Host Email</th>
                <th className="p-6">Date</th>
                <th className="p-6">Guests</th>
                <th className="p-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {allEvents
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((e) => {
                  const ended = isEventEnded(e);
                  return (
                    <tr
                      key={e.id}
                      className="hover:bg-neutral-900/50 transition-colors"
                    >
                      <td className="p-6">
                        <div className="font-bold text-white text-base">
                          {e.name}
                        </div>
                        <div className="text-xs text-neutral-500 font-mono mt-1">
                          {e.id}
                        </div>
                      </td>
                      <td className="p-6 text-sm font-medium text-neutral-300">
                        {e.owner}
                      </td>
                      <td className="p-6 text-sm text-neutral-400">
                        {new Date(e.date).toLocaleDateString()}
                      </td>
                      <td className="p-6 text-sm font-bold text-white">
                        {getEventGuestCount(e)} / {e.capacity}
                      </td>
                      <td className="p-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${ended ? "bg-neutral-800 text-neutral-400" : "bg-emerald-500/10 text-emerald-500"}`}
                        >
                          {ended ? "Ended" : "Active"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              {allEvents.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center text-neutral-500 font-medium"
                  >
                    No events found on the platform.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TermsView() {
  return (
    <div className="max-w-4xl mx-auto py-20 animate-in fade-in slide-in-from-bottom-8 duration-500 px-4">
      <div className="mb-12">
        <h2 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
          Terms of Service
        </h2>
        <p className="text-xl text-orange-500 font-bold">
          Last updated: March 2026
        </p>
      </div>
      <div className="bg-[#111] border border-neutral-800 rounded-[32px] p-8 md:p-12 shadow-2xl space-y-8 text-neutral-400 leading-relaxed font-medium">
        <section>
          <h3 className="text-2xl font-black text-white mb-4">
            1. Acceptance of Terms
          </h3>
          <p>
            By accessing and using VIP Access, you accept and agree to be bound
            by the terms and provision of this agreement. If you do not agree to
            abide by these terms, please do not use this service.
          </p>
        </section>
        <section>
          <h3 className="text-2xl font-black text-white mb-4">
            2. Host Responsibilities
          </h3>
          <p>
            As an event host, you are solely responsible for the accuracy of
            your event details, managing your guest list responsibly, and
            ensuring your events comply with all local laws and regulations.
          </p>
        </section>
        <section>
          <h3 className="text-2xl font-black text-white mb-4">
            3. Platform Usage
          </h3>
          <p>
            VIP Access provides tools for generating digital passes and managing
            attendance. We do not guarantee server uptime and are not liable for
            any disruptions during your live events, though we strive for 99.9%
            availability.
          </p>
        </section>
      </div>
    </div>
  );
}

function PrivacyView() {
  return (
    <div className="max-w-4xl mx-auto py-20 animate-in fade-in slide-in-from-bottom-8 duration-500 px-4">
      <div className="mb-12">
        <h2 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
          Privacy Policy
        </h2>
        <p className="text-xl text-orange-500 font-bold">
          Last updated: March 2026
        </p>
      </div>
      <div className="bg-[#111] border border-neutral-800 rounded-[32px] p-8 md:p-12 shadow-2xl space-y-8 text-neutral-400 leading-relaxed font-medium">
        <section>
          <h3 className="text-2xl font-black text-white mb-4">
            Data Collection
          </h3>
          <p>
            We collect minimal information required to provide our service. For
            hosts, this includes your name and email. For guests, this includes
            the name and email provided during registration to generate unique
            VIP passes.
          </p>
        </section>
        <section>
          <h3 className="text-2xl font-black text-white mb-4">
            Data Protection
          </h3>
          <p>
            Your data is securely stored using industry-standard encryption. We
            never sell your personal information or your guests' information to
            third parties.
          </p>
        </section>
        <section>
          <h3 className="text-2xl font-black text-white mb-4">Communication</h3>
          <p>
            We use the provided email addresses strictly for transactional
            purposes, such as sending VIP passes, event updates, and password
            resets. We do not send promotional spam.
          </p>
        </section>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-black border-t border-neutral-900 pt-20 pb-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-orange-500" />
              <span className="font-black text-2xl tracking-tight text-white">
                VIP<span className="text-orange-500">ACCESS</span>
              </span>
            </div>
            <p className="text-neutral-400 font-medium leading-relaxed">
              Incredible All-in-One Platform for your exclusive events and
              private parties.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">
              Services
            </h4>
            <ul className="space-y-4 text-neutral-400 font-medium">
              <li>
                <a
                  href="#service/qr-code-badges"
                  className="hover:text-orange-500 transition-colors"
                >
                  QR Code Badges
                </a>
              </li>
              <li>
                <a
                  href="#service/guest-management"
                  className="hover:text-orange-500 transition-colors"
                >
                  Guest Management
                </a>
              </li>
              <li>
                <a
                  href="#service/real-time-scanning"
                  className="hover:text-orange-500 transition-colors"
                >
                  Real-time Scanning
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Pages</h4>
            <ul className="space-y-4 text-neutral-400 font-medium">
              <li>
                <a
                  href="#pricing"
                  className="hover:text-orange-500 transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="hover:text-orange-500 transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="hover:text-orange-500 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#privacy"
                  className="hover:text-orange-500 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">
              Download app
            </h4>
            <div className="space-y-4">
              <button className="w-full flex items-center gap-4 bg-[#111] border border-neutral-800 hover:border-orange-500 p-4 rounded-2xl transition-all text-left group">
                <Smartphone className="w-8 h-8 text-white group-hover:text-orange-500 transition-colors" />
                <div>
                  <div className="text-[10px] font-black tracking-widest text-neutral-500 uppercase mb-1">
                    Download on
                  </div>
                  <div className="text-base font-bold text-white leading-none">
                    App Store
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left font-medium text-neutral-600">
          <p>Copyright © 2026 VIP Access. All rights reserved.</p>
          <a
            href="#admin"
            className="flex items-center gap-2 text-xs hover:text-orange-500 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" /> Admin Access
          </a>
        </div>
      </div>
    </footer>
  );
}
