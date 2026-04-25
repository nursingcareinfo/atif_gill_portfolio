import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef, Suspense, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

// --- Error Boundary for 3D ---
class CanvasErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50 rounded-3xl border border-white/5">
          <p className="text-white/30 text-xs font-mono uppercase tracking-widest">3D Presence Offline</p>
        </div>
      );
    }
    return this.props.children;
  }
}

import { 
  Float, 
  MeshDistortMaterial, 
  PerspectiveCamera, 
  ScrollControls, 
  Scroll, 
  useScroll,
  Image as DreiImage,
  Text,
  Environment
} from '@react-three/drei';
import * as THREE from 'three';
import { 
  User, 
  Maximize2, 
  FileText, 
  Mail, 
  Instagram, 
  Twitter, 
  Play,
  Activity,
  Layers,
  Box,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

// --- Type Definitions ---
interface Asset {
  url: string;
  type: 'image' | 'video';
  label: string;
}

// --- Constants & Assets ---
/**
 * Note: To use your own files, upload them to:
 * - /public/images/ for photos
 * - /public/videos/ for clips
 * Then update the URLs below to: '/images/filename.jpg' or '/videos/filename.mp4'
 */
const DIGITAL_ARCHIVE = [
  'images/WhatsApp%20Image%202026-04-25%20at%2010.42.51%20AM%20(1).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.42.51%20AM%20(2).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.42.51%20AM.jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.42.52%20AM%20(1).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.42.52%20AM.jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010,43,11%20AM-1.jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.11%20AM%20(1).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.11%20AM.jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.12%20AM%20(1).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.12%20AM.jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.13%20AM%20(1).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.13%20AM%20(2).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.13%20AM.jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.14%20AM%20(1).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.14%20AM%20(2).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.14%20AM%20(3).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.14%20AM.jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.15%20AM%20(1).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.15%20AM.jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.16%20AM%20(1).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.16%20AM.jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.18%20AM%20(1).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.18%20AM%20(2).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.18%20AM.jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.19%20AM%20(1).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.19%20AM%20(2).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.19%20AM.jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.20%20AM%20(1).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.20%20AM%20(2).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.20%20AM.jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.20%20AM%20(3).jpeg',
  'images/WhatsApp%20Image%202026-04-25%20at%2010.43.21%20AM.jpeg',
];

const VIDEO_ASSETS = [
  { url: 'videos/WhatsApp%20Video%202026-04-25%20at%2010.42.55%20AM.mp4', label: 'Presence Reel 01' },
  { url: 'videos/WhatsApp%20Video%202026-04-25%20at%2010.42.59%20AM.mp4', label: 'Behind the Scenes' },
  { url: 'videos/WhatsApp%20Video%202026-04-25%20at%2010.43.10%20AM.mp4', label: 'Commercial Clip' },
  { url: 'videos/WhatsApp%20Video%202026-04-25%20at%2010.43.17%20AM.mp4', label: 'Street Style' }
];

const ASSETS: Asset[] = [
  { 
    url: 'images/WhatsApp%20Image%202026-04-25%20at%2010.42.51%20AM%20(1).jpeg', 
    type: 'image', 
    label: 'Full Body Presence' 
  },
  { 
    url: 'images/WhatsApp%20Image%202026-04-25%20at%2010.43.11%20AM.jpeg', 
    type: 'image', 
    label: 'Cinematic Portrait' 
  },
  { 
    url: 'images/WhatsApp%20Image%202026-04-25%20at%2010.43.14%20AM.jpeg', 
    type: 'image', 
    label: 'Dramatic Range' 
  },
  { 
    url: 'images/WhatsApp%20Image%202026-04-25%20at%2010.43.16%20AM.jpeg', 
    type: 'image', 
    label: 'Street Style' 
  },
  { 
    url: 'images/WhatsApp%20Image%202026-04-25%20at%2010.43.19%20AM.jpeg', 
    type: 'image', 
    label: 'High Fashion' 
  },
  { 
    url: 'images/WhatsApp%20Image%202026-04-25%20at%2010.43.20%20AM%20(1).jpeg', 
    type: 'image', 
    label: 'Editorial Edge' 
  },
  { 
    url: 'images/WhatsApp%20Image%202026-04-25%20at%2010.43.20%20AM%20(2).jpeg', 
    type: 'image', 
    label: 'Moody Contrast' 
  },
  { 
    url: 'images/WhatsApp%20Image%202026-04-25%20at%2010.43.20%20AM%20(3).jpeg', 
    type: 'image', 
    label: 'Signature Pose' 
  },
];

const STAFF_DATA = {
  name: "Atif Gill",
  title: "Professional Actor & Model",
  height: "6'0\"",
  suit: "40R",
  eyes: "Brown",
  hair: "Dark Brown",
  waist: "32\"",
  shoe: "10 US",
  location: "Pakistan",
  socials: {
    facebook: "https://www.facebook.com/share/1K1RG5GdW8/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/gill.sahib.545?igsh=ejV1aDEzanBsaTQy&utm_source=qr",
    tiktok: "https://www.tiktok.com/@atif.gill946?_r=1&_t=ZS-95pFvp6LjHg"
  },
  stats: [
    { label: "Experience", value: "8+ Years" },
    { label: "Digital Assets", value: `${DIGITAL_ARCHIVE.length + VIDEO_ASSETS.length}` },
    { label: "Rating", value: "4.9/5" },
    { label: "Range", value: "Dramatic / Commercial" }
  ]
};

// --- Components ---

/**
 * Machine Experience (MX) Optimization Component
 * Renders JSON-LD for AI search agents.
 */
const MXSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": STAFF_DATA.name,
    "jobTitle": STAFF_DATA.title,
    "height": STAFF_DATA.height,
    "gender": "Male",
    "description": "Professional Actor and Model based in Pakistan. Specializing in dramatic theater and high-fashion editorial.",
    "knowsAbout": ["Acting", "Modeling", "Theater", "Commercials"],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Karachi",
      "addressCountry": "PK"
    }
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

/**
 * Elegant Dark Material Simulation
 */
const GlassCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group ${className}`}
  >
    <div className="absolute inset-0 bg-neutral-800 mix-blend-overlay pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10 h-full">{children}</div>
  </motion.div>
);

/**
 * Z-Axis 3D Gallery (Three.js)
 */
const ZAxisGallery = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="h-[400px] md:h-[600px] w-full rounded-3xl overflow-hidden relative border border-white/5 bg-black">
      <CanvasErrorBoundary>
        <Canvas>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={0.5} />
            <ScrollControls pages={ASSETS.length} damping={0.1}>
              <Scroll>
                {ASSETS.map((asset, i) => (
                  <DreiImage
                    key={i}
                    url={asset.url}
                    position={[i % 2 === 0 ? (isMobile ? -0.8 : -1.5) : (isMobile ? 0.8 : 1.5), -i * 3.5, -i * 2]}
                    scale={(isMobile ? [2, 3] : [3.5, 4.5]) as any}
                    transparent
                    opacity={0.9}
                  />
                ))}
              </Scroll>
              <Scroll html>
                <div className="w-full">
                    {ASSETS.map((asset, i) => (
                      <div key={i} className={`absolute w-full h-screen flex items-center ${i % 2 === 0 ? 'justify-start pl-[10vw]' : 'justify-end pr-[10vw]'}`} style={{ top: `${i * 100}vh` }}>
                        <h3 className="text-2xl md:text-6xl font-bold text-white/10 uppercase tracking-tighter mix-blend-difference">{asset.label}</h3>
                      </div>
                    ))}
                </div>
              </Scroll>
            </ScrollControls>
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs font-mono text-white/30 uppercase tracking-[0.2em] pointer-events-none">
        <Layers className="w-4 h-4" />
        <span className="hidden sm:inline">Scroll Z-Axis Exploration</span>
        <span className="sm:hidden">Swipe Up</span>
      </div>
    </div>
  );
};

/**
 * Digital Archive Grid (all uploaded images)
 */
const DigitalArchive = () => (
  <section className="pt-12 space-y-8">
    <div className="flex items-center gap-6">
      <h2 className="text-3xl font-light uppercase tracking-tighter italic opacity-80">Digital Archive</h2>
      <div className="h-[1px] flex-grow bg-white/10" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {DIGITAL_ARCHIVE.map((img, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: (i % 6) * 0.1 }}
          className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-neutral-900 group relative"
        >
          <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={`Archive item ${i}`} />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Maximize2 className="w-6 h-6 text-white" />
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);
export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'digitals' | 'reel' | 'stats'>('digitals');

  useEffect(() => {
    const handleScroll = () => {
      const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F0] font-sans overflow-x-hidden p-8 flex flex-col gap-8">
      <MXSchema />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#E6E6FA]/5 blur-[150px] rounded-full animate-pulse" />
      </div>

      {/* Header (Elegant Dark Design) */}
      <header className="relative z-10 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6 max-w-7xl w-full mx-auto">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl md:text-6xl font-light tracking-tighter uppercase"
          >
            {STAFF_DATA.name}
          </motion.h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#E6E6FA] opacity-80 font-medium">
            Presence Engine v2026 // SAG-AFTRA
          </p>
        </div>
        <div className="flex gap-4 mt-6 md:mt-0">
          <button className="px-6 py-2 rounded-full border border-white/20 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">Digital Twin</button>
          <button className="px-6 py-2 rounded-full bg-[#E6E6FA] text-black text-[10px] uppercase tracking-widest font-bold">Request Booking</button>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl w-full mx-auto space-y-12 pb-24 relative z-10">
        
        {/* Behavioral Controls */}
        <section className="flex items-center justify-between border-b border-white/10 pb-4">
           <span className="text-[10px] uppercase tracking-widest text-white/40">Situational Engine: ACTIVE</span>
           <div className="flex gap-3">
             {(['digitals', 'reel', 'stats'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-6 py-2 rounded-full text-[9px] uppercase tracking-widest transition-all duration-300 font-bold ${activeTab === t ? 'bg-[#E6E6FA] text-black' : 'text-white/40 hover:text-white/60'}`}
                >
                  {t}
                </button>
              ))}
           </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto">
           {activeTab === 'digitals' && (
              <AnimatePresence mode="wait">
                 <motion.div 
                    key="digitals"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-4"
                 >
                    <div className="col-span-1 md:col-span-4 rounded-3xl bg-neutral-900 border border-white/10 relative overflow-hidden group h-[350px] md:h-[500px]">
                      <img src={ASSETS[0].url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <p className="absolute bottom-6 left-6 text-[10px] uppercase tracking-widest font-medium">Digital Portrait / 01</p>
                    </div>

                    <div className="col-span-1 md:col-span-5 rounded-3xl bg-neutral-900 border border-white/10 overflow-hidden relative group h-[350px] md:h-[500px]">
                      <img src={ASSETS[1].url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-neutral-800 mix-blend-overlay"></div>
                      <div className="absolute bottom-6 left-6">
                        <h3 className="text-2xl font-light tracking-tight">Stage Performance</h3>
                        <p className="text-[10px] uppercase tracking-widest text-[#E6E6FA]">Karachi, 2026</p>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-3 space-y-4">
                       <GlassCard className="h-[242px] bg-white/5 backdrop-blur-xl">
                          <div className="space-y-4 flex flex-col justify-between h-full">
                            <span className="text-[10px] uppercase tracking-widest text-white/40">MX Data Protocol</span>
                            <div className="grid grid-cols-2 gap-y-6">
                              <div><p className="text-[10px] uppercase text-white/40 mb-1">Height</p><p className="text-xl font-light">{STAFF_DATA.height}</p></div>
                              <div><p className="text-[10px] uppercase text-white/40 mb-1">Suit</p><p className="text-xl font-light">{STAFF_DATA.suit}</p></div>
                              <div><p className="text-[10px] uppercase text-white/40 mb-1">Waist</p><p className="text-xl font-light">{STAFF_DATA.waist}</p></div>
                              <div><p className="text-[10px] uppercase text-white/40 mb-1">Eyes</p><p className="text-xl font-light underline decoration-[#E6E6FA] underline-offset-4">{STAFF_DATA.eyes}</p></div>
                            </div>
                          </div>
                       </GlassCard>
                       <div className="rounded-3xl bg-[#E6E6FA] p-8 flex flex-col justify-between h-auto md:h-[242px] cursor-pointer group hover:bg-white transition-colors">
                          <div className="flex justify-between items-start mb-4 md:mb-0">
                            <h4 className="text-black text-2xl font-medium leading-tight">Download<br/>Asset Pack</h4>
                            <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-black" />
                            </div>
                          </div>
                          <p className="text-[9px] text-black/60 uppercase tracking-widest font-bold">Schema Validated // WebP + AVIF</p>
                       </div>
                    </div>
                 </motion.div>
              </AnimatePresence>
           )}

           {activeTab === 'reel' && (
              <AnimatePresence mode="wait">
                 <motion.div 
                    key="reel"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[500px]"
                 >
                    {VIDEO_ASSETS.map((video, i) => (
                      <div key={i} className="rounded-3xl bg-neutral-900 border border-white/10 relative overflow-hidden group h-[350px] md:h-[500px]">
                        <video 
                          src={video.url} 
                          className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                          muted
                          loop
                          playsInline
                          onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                          onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                              <Play fill="white" className="w-6 h-6 ml-1" />
                           </div>
                        </div>
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                          <p className="text-[10px] uppercase tracking-widest text-white/80 font-bold">{video.label}</p>
                          <span className="text-[9px] uppercase tracking-widest text-[#E6E6FA] opacity-60">PRO VIDEO</span>
                        </div>
                      </div>
                    ))}
                 </motion.div>
              </AnimatePresence>
            )}

           {activeTab === 'stats' && (
              <AnimatePresence mode="wait">
                 <motion.div 
                    key="stats"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="col-span-1 md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4"
                 >
                    {STAFF_DATA.stats.map((stat, i) => (
                      <GlassCard key={i} className="min-h-[220px] flex flex-col justify-between">
                         <Activity className="w-6 h-6 text-[#E6E6FA]/40" />
                         <div>
                            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{stat.label}</p>
                            <p className="text-3xl font-light tracking-tight">{stat.value}</p>
                         </div>
                      </GlassCard>
                    ))}
                    <div className="col-span-2 md:col-span-4 rounded-3xl border border-white/5 bg-neutral-900/40 p-12 text-center">
                       <p className="text-white/40 uppercase tracking-[0.25em] text-xs font-light leading-loose">
                         [Situational Mode: ACTIVE] <br />
                         Prioritizing theatrical digitals for casting AI agents. Measurement logs synced 2026-04-25.
                       </p>
                    </div>
                 </motion.div>
              </AnimatePresence>
           )}
        </section>

        {/* 3D Visual Gallery Container */}
        <section className="pt-12 space-y-8">
            <div className="flex items-center gap-6">
              <h2 className="text-3xl font-light uppercase tracking-tighter italic opacity-80">Spatial Volume</h2>
              <div className="h-[1px] flex-grow bg-white/10" />
            </div>
            <div className="rounded-[3rem] border border-white/5 overflow-hidden ring-1 ring-white/10 shadow-2xl">
               <ZAxisGallery />
            </div>
        </section>

        <DigitalArchive />

        {/* Interaction Pillars (Design Feature) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-16">
           {[
             { label: 'Dramatic Range', num: '01', active: true },
             { label: 'Commercial Pulse', num: '02', active: false },
             { label: 'Motion Capture', num: '03', active: false }
           ].map((pill) => (
              <div key={pill.num} className={`rounded-3xl border border-white/10 p-10 flex items-center gap-6 transition-all ${pill.active ? 'bg-white/5' : 'opacity-30 grayscale hover:grayscale-0 hover:opacity-100'}`}>
                 <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-[11px] font-bold ${pill.active ? 'border-[#E6E6FA] text-[#E6E6FA]' : 'border-white/20 text-white/40'}`}>
                    {pill.num}
                 </div>
                 <p className="text-sm font-medium uppercase tracking-widest">{pill.label}</p>
              </div>
           ))}
        </section>

      </main>

      {/* Footer (Elegant Dark Design) */}
      <footer className="relative z-10 flex flex-col md:flex-row justify-between items-center text-[10px] text-white/40 uppercase tracking-[0.2em] pt-12 pb-8 border-t border-white/10 max-w-7xl w-full mx-auto gap-8 md:gap-0">
        <div>System: Optimized for AI Search Agents</div>
        <div className="flex gap-12 font-bold text-white/40">
          <a href={STAFF_DATA.socials.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#E6E6FA] transition-colors">Facebook</a>
          <a href={STAFF_DATA.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#E6E6FA] transition-colors">Instagram</a>
          <a href={STAFF_DATA.socials.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-[#E6E6FA] transition-colors">TikTok</a>
        </div>
        <div>© 2026 {STAFF_DATA.name.toUpperCase()} Presence Engine</div>
      </footer>
    </div>
  );
}

