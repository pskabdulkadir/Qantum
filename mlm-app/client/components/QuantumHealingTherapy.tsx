import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity, Heart, Zap, Brain, Eye, Shield, Sparkles,
  Play, Square, RotateCcw, ChevronRight, Volume2, VolumeX,
  AlertCircle, Star, Waves, Sun, Moon, Wind, Flame,
  HeartPulse, Radio, CheckCircle2, Info
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
   DATA: Healing Protocols — Şifa Reçeteleri
───────────────────────────────────────────────────────────────── */
const HEALING_PROTOCOLS = [
  {
    id: "heart-blockage",
    condition: "Kalp Çakrası Blokajı",
    description: "Duygusal sıkışma, sevgi bağı kısıtlaması tespit edildi.",
    auraColor: "#ff69b4",
    bodyZone: "Göğüs / Kalp",
    icon: Heart,
    energyScore: 38,
    surah: { name: "İnşirah Suresi", ref: "94:5-6", meaning: "Her güçlükle birlikte bir kolaylık vardır.", category: "Ferahlama & Açılma" },
    esma: "Ya Vedûd (Sonsuz Seven)",
    solfeggio: 528,
    binauralBase: 200, binauralBeat: 10,
    healingDuration: 180,
    color: "rose",
  },
  {
    id: "anxiety",
    condition: "Kaygı & Enerji Dağılması",
    description: "Stres frekansı yüksek, odak enerjisi dağınık.",
    auraColor: "#ffa500",
    bodyZone: "Güneş Pleksusu / Mide",
    icon: Wind,
    energyScore: 42,
    surah: { name: "Fatiha Suresi", ref: "1:1-7", meaning: "Yalnız Sana ibadet eder, yalnız Senden yardım dileriz.", category: "Koruma & Şifa" },
    esma: "Ya Selâm (Esenlik Veren)",
    solfeggio: 396,
    binauralBase: 180, binauralBeat: 6,
    healingDuration: 210,
    color: "orange",
  },
  {
    id: "mind-fog",
    condition: "Zihinsel Sis & Bilişsel Blokaj",
    description: "Beyin dalgaları yavaş, yaratıcı kanal tıkalı.",
    auraColor: "#6a5acd",
    bodyZone: "Üçüncü Göz / Alın",
    icon: Brain,
    energyScore: 33,
    surah: { name: "Tâhâ Suresi", ref: "20:114", meaning: "Rabbim, ilmimi artır.", category: "İlim & Feraset" },
    esma: "Ya Alîm (Her Şeyi Bilen)",
    solfeggio: 852,
    binauralBase: 210, binauralBeat: 40,
    healingDuration: 150,
    color: "violet",
  },
  {
    id: "low-vitality",
    condition: "Düşük Vitalite & Yaşam Gücü",
    description: "Beden frekansı zayıf, fiziksel enerji rezervi tükeniyor.",
    auraColor: "#228b22",
    bodyZone: "Kök Çakra / Bel",
    icon: Flame,
    energyScore: 29,
    surah: { name: "Nahl Suresi", ref: "16:18", meaning: "Allah'ın nimetlerini saymaya kalksanız bitiremezsiniz.", category: "Şükür & Güç" },
    esma: "Ya Kavî (Her Şeye Gücü Yeten)",
    solfeggio: 174,
    binauralBase: 150, binauralBeat: 4,
    healingDuration: 240,
    color: "emerald",
  },
  {
    id: "spiritual-disconnect",
    condition: "Manevi Bağlantı Kopukluğu",
    description: "Üst frekans kanalları kapalı, kozmik rezonans düşük.",
    auraColor: "#9400d3",
    bodyZone: "Taç Çakra / Tepe",
    icon: Sun,
    energyScore: 45,
    surah: { name: "Bakara Suresi", ref: "2:286", meaning: "Allah kimseye gücünün üstünde yük yüklemez.", category: "Teslimiyet & Nur" },
    esma: "Ya Nûr (Her Şeyin Işığı)",
    solfeggio: 963,
    binauralBase: 250, binauralBeat: 7,
    healingDuration: 200,
    color: "purple",
  },
  {
    id: "trauma-echo",
    condition: "Travma Yankısı & Karmik Yük",
    description: "Geçmişten gelen frekans kalıpları aktif.",
    auraColor: "#4682b4",
    bodyZone: "Boğaz Çakrası / Boğaz",
    icon: Moon,
    energyScore: 36,
    surah: { name: "Zümer Suresi", ref: "39:53", meaning: "Allah'ın rahmetinden umudunuzu kesmeyin.", category: "Af & Tövbe & Arınma" },
    esma: "Ya Gaffâr (Çok Bağışlayan)",
    solfeggio: 417,
    binauralBase: 195, binauralBeat: 8,
    healingDuration: 190,
    color: "blue",
  },
];

const AURA_COLORS = [
  { color: "#ff69b4", name: "Pembe Aura", trait: "Yüksek empati, sevgi enerjisi" },
  { color: "#9400d3", name: "Mor Aura", trait: "Spiritüel uyanış, sezgi" },
  { color: "#00bfff", name: "Mavi Aura", trait: "İletişim gücü, ifade özgürlüğü" },
  { color: "#32cd32", name: "Yeşil Aura", trait: "İyileşme, büyüme, denge" },
  { color: "#ffd700", name: "Altın Aura", trait: "İlahi koruma, kadim bilgelik" },
  { color: "#ff4500", name: "Kırmızı Aura", trait: "Yaşam gücü, tutku, harekete geçiş" },
  { color: "#e0e0e0", name: "Gümüş Aura", trait: "Yansıma, esneklik, uyum" },
];

/* ─────────────────────────────────────────────────────────────────
   WEB AUDIO API — Binaural Beat Generator
───────────────────────────────────────────────────────────────── */
function useBinauralBeats() {
  const ctxRef = useRef<AudioContext | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const start = useCallback((baseFreq: number, beatFreq: number) => {
    try {
      if (ctxRef.current) { stop(); }
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2);
      gain.connect(ctx.destination);
      gainRef.current = gain;

      // Left ear — base frequency
      const merger = ctx.createChannelMerger(2);
      merger.connect(gain);

      const leftOsc = ctx.createOscillator();
      leftOsc.type = "sine";
      leftOsc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      const leftGain = ctx.createGain();
      leftGain.gain.value = 0.5;
      leftOsc.connect(leftGain);
      leftGain.connect(merger, 0, 0);
      leftOsc.start();
      leftOscRef.current = leftOsc;

      // Right ear — base + beat
      const rightOsc = ctx.createOscillator();
      rightOsc.type = "sine";
      rightOsc.frequency.setValueAtTime(baseFreq + beatFreq, ctx.currentTime);
      const rightGain = ctx.createGain();
      rightGain.gain.value = 0.5;
      rightOsc.connect(rightGain);
      rightGain.connect(merger, 0, 1);
      rightOsc.start();
      rightOscRef.current = rightOsc;

      setIsPlaying(true);
    } catch (e) {
      console.warn("Web Audio API not available", e);
    }
  }, []);

  const stop = useCallback(() => {
    try {
      if (gainRef.current && ctxRef.current) {
        gainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 1.5);
        setTimeout(() => {
          leftOscRef.current?.stop();
          rightOscRef.current?.stop();
          ctxRef.current?.close();
          ctxRef.current = null;
          leftOscRef.current = null;
          rightOscRef.current = null;
          gainRef.current = null;
          setIsPlaying(false);
        }, 1600);
      } else {
        setIsPlaying(false);
      }
    } catch (_) {
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => () => { try { ctxRef.current?.close(); } catch (_) {} }, []);

  return { isPlaying, start, stop };
}

/* ─────────────────────────────────────────────────────────────────
   PHASE TYPES
───────────────────────────────────────────────────────────────── */
type Phase = "idle" | "scanning" | "analyzing" | "result" | "healing" | "complete";

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
export default function QuantumHealingTherapy() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [protocol, setProtocol] = useState<typeof HEALING_PROTOCOLS[0] | null>(null);
  const [aura, setAura] = useState<typeof AURA_COLORS[0] | null>(null);
  const [healProgress, setHealProgress] = useState(0);
  const [healTimer, setHealTimer] = useState(0);
  const [energyHistory, setEnergyHistory] = useState<{ score: number; date: string }[]>([]);
  const [disclaimer, setDisclaimer] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const healTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const binaural = useBinauralBeats();

  /* ── Scan Phase ── */
  const startScan = () => {
    if (!disclaimer) { setDisclaimer(true); return; }
    setPhase("scanning");
    setScanProgress(0);
    let p = 0;
    scanTimerRef.current = setInterval(() => {
      p += 1 + Math.random() * 2;
      setScanProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(scanTimerRef.current!);
        setPhase("analyzing");
        setTimeout(() => {
          const picked = HEALING_PROTOCOLS[Math.floor(Math.random() * HEALING_PROTOCOLS.length)];
          const pickedAura = AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)];
          setProtocol(picked);
          setAura(pickedAura);
          setPhase("result");
        }, 2200);
      }
    }, 60);
  };

  /* ── Healing Phase ── */
  const startHealing = () => {
    if (!protocol) return;
    setPhase("healing");
    setHealProgress(0);
    setHealTimer(0);
    const duration = protocol.healingDuration;
    let elapsed = 0;
    if (audioEnabled) binaural.start(protocol.binauralBase, protocol.binauralBeat);
    healTimerRef.current = setInterval(() => {
      elapsed += 1;
      setHealTimer(elapsed);
      setHealProgress(Math.round((elapsed / duration) * 100));
      if (elapsed >= duration) {
        clearInterval(healTimerRef.current!);
        binaural.stop();
        const newScore = Math.min(100, (protocol.energyScore || 40) + 30 + Math.floor(Math.random() * 20));
        setEnergyHistory(prev => [...prev.slice(-9), {
          score: newScore,
          date: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
        }]);
        setPhase("complete");
      }
    }, 1000);
  };

  const reset = () => {
    clearInterval(scanTimerRef.current!);
    clearInterval(healTimerRef.current!);
    binaural.stop();
    setPhase("idle");
    setScanProgress(0);
    setHealProgress(0);
    setHealTimer(0);
    setProtocol(null);
    setAura(null);
    setScanProgress(0);
  };

  useEffect(() => () => {
    clearInterval(scanTimerRef.current!);
    clearInterval(healTimerRef.current!);
  }, []);

  /* ── Helpers ── */
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-8">

      {/* ── HEADER ── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-400/30 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-cyan-600">
          <Zap className="w-3 h-3" /> Quantum Healing Engine v2.0
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Quantum Healing Therapy
        </h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Biyometrik rezonans analizi, Binaural Beat frekansları ve manevi şifa protokollerini birleştiren kapsamlı enerji terapisi.
        </p>
        {/* Audio toggle */}
        <button
          onClick={() => setAudioEnabled(v => !v)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {audioEnabled ? "Ses Aktif (Kulaklık Önerilir)" : "Ses Kapalı"}
        </button>
      </div>

      {/* ── DISCLAIMER MODAL ── */}
      <AnimatePresence>
        {disclaimer && phase === "idle" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Yasal Uyarı & Sorumluluk Reddi</h3>
                  <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wider">Lütfen okuyun ve onaylayın</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Bu uygulama <strong>tıbbi bir tanı veya tedavi aracı değildir.</strong> Sunulan içerik manevi rehberlik,
                spiritüel farkındalık ve kişisel gelişim amacıyla tasarlanmış sembolik bir platformdur.
                Frekans analizi simülasyon esaslıdır; gerçek biyometrik ölçüm içermez.
                Sağlık sorunlarınız için mutlaka bir doktora danışın.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setDisclaimer(false)} variant="outline" className="flex-1 rounded-xl">
                  İptal
                </Button>
                <Button
                  onClick={() => { setDisclaimer(false); setTimeout(startScan, 100); }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 text-white"
                >
                  Anladım, Devam Et
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN PANEL ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT: Scanner Viewport */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">

            {/* IDLE */}
            {phase === "idle" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="relative bg-slate-900 rounded-3xl overflow-hidden min-h-[420px] flex flex-col items-center justify-center gap-8 p-8 border border-slate-700"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,255,0.05)_0%,transparent_70%)]" />
                {/* Pulsing rings */}
                {[1, 2, 3].map(i => (
                  <motion.div key={i}
                    className="absolute rounded-full border border-cyan-500/20"
                    style={{ width: i * 140, height: i * 140 }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.05, 0.3] }}
                    transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
                  />
                ))}
                <div className="relative z-10 text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-cyan-500/10 border-2 border-cyan-500/40 flex items-center justify-center mx-auto backdrop-blur-md">
                    <Activity className="w-10 h-10 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter">Enerji Taraması</h3>
                    <p className="text-sm text-slate-400 mt-1">Aurik alan analizi için taramayı başlatın</p>
                  </div>
                  <Button
                    onClick={startScan}
                    className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white h-14 px-8 rounded-2xl font-black text-base shadow-lg shadow-cyan-500/20"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Kuantum Taramayı Başlat
                  </Button>
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest">[ BİNAURAL BEAT + SOLFEGGIO ENTEGRELİ ]</p>
                </div>
              </motion.div>
            )}

            {/* SCANNING */}
            {phase === "scanning" && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="relative bg-slate-900 rounded-3xl overflow-hidden min-h-[420px] flex flex-col items-center justify-center gap-6 p-8 border border-cyan-500/30"
              >
                {/* Scanline effect */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80"
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_340deg,rgba(0,255,255,0.08)_360deg)] animate-spin [animation-duration:4s]" />

                {/* Rotating radar */}
                <div className="relative w-48 h-48">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="absolute inset-0 rounded-full border border-cyan-500/20" style={{ transform: `scale(${i * 0.25 + 0.25})` }} />
                  ))}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: "conic-gradient(from 0deg, transparent 80%, rgba(0,255,255,0.4) 100%)" }}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>

                <div className="text-center space-y-3 w-full max-w-xs">
                  <p className="text-cyan-400 font-black uppercase tracking-widest text-xs animate-pulse">Aurik Alan Taranıyor...</p>
                  <Progress value={scanProgress} className="h-2 bg-slate-800" />
                  <p className="text-slate-500 text-xs">{Math.round(scanProgress)}% tamamlandı</p>
                  <div className="text-[10px] text-slate-600 space-y-0.5 text-left font-mono">
                    {scanProgress > 20 && <p className="text-cyan-700">✓ Biyoelektrik alan tespit edildi</p>}
                    {scanProgress > 40 && <p className="text-cyan-700">✓ Chakra haritalaması yapılıyor</p>}
                    {scanProgress > 60 && <p className="text-cyan-700">✓ Frekans sinyalleri analiz ediliyor</p>}
                    {scanProgress > 80 && <p className="text-cyan-700">✓ Blokaj noktaları hesaplanıyor</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ANALYZING */}
            {phase === "analyzing" && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="relative bg-slate-900 rounded-3xl overflow-hidden min-h-[420px] flex items-center justify-center p-8 border border-purple-500/30"
              >
                <div className="text-center space-y-5">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 mx-auto"
                  />
                  <p className="text-purple-300 font-black uppercase tracking-widest text-sm">Kuantum Analizi Tamamlanıyor...</p>
                  <p className="text-slate-500 text-xs">Şifa protokolü hazırlanıyor</p>
                </div>
              </motion.div>
            )}

            {/* RESULT */}
            {phase === "result" && protocol && aura && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 min-h-[420px]"
              >
                {/* Aura header */}
                <div className="relative p-6 text-white overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${aura.color}22 0%, ${protocol.auraColor}22 100%)` }}
                >
                  <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full blur-3xl opacity-30" style={{ background: aura.color }} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aura Analizi</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black border" style={{ borderColor: aura.color, color: aura.color }}>
                        {aura.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: `${aura.color}22`, border: `2px solid ${aura.color}44` }}>
                        <protocol.icon className="w-8 h-8" style={{ color: aura.color }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black">{protocol.condition}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">{protocol.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Energy score */}
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="text-3xl font-black" style={{ color: aura.color }}>{protocol.energyScore}</div>
                    <div>
                      <p className="text-xs text-slate-400">Enerji Seviyesi</p>
                      <Progress value={protocol.energyScore} className="w-32 h-1.5 mt-1 bg-slate-700" />
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[10px] text-slate-500">Blokaj Bölgesi</p>
                      <p className="text-xs font-bold text-slate-300">{protocol.bodyZone}</p>
                    </div>
                  </div>

                  {/* Şifa reçetesi */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Solfeggio Frekansı</p>
                      <p className="text-lg font-black" style={{ color: aura.color }}>{protocol.solfeggio} Hz</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Binaural Beat</p>
                      <p className="text-lg font-black text-purple-300">{protocol.binauralBeat} Hz</p>
                      <p className="text-[9px] text-slate-600">Baz: {protocol.binauralBase} Hz</p>
                    </div>
                  </div>

                  <Button
                    onClick={startHealing}
                    className="w-full h-12 rounded-2xl font-black text-white shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${aura.color}, ${protocol.auraColor})` }}
                  >
                    <HeartPulse className="w-5 h-5 mr-2" />
                    Şifa Seansını Başlat ({formatTime(protocol.healingDuration)})
                  </Button>
                  <button onClick={reset} className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-1">
                    ↩ Yeniden Tara
                  </button>
                </div>
              </motion.div>
            )}

            {/* HEALING */}
            {phase === "healing" && protocol && aura && (
              <motion.div key="healing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="relative bg-slate-900 rounded-3xl overflow-hidden min-h-[420px] flex flex-col items-center justify-center gap-6 p-8 border"
                style={{ borderColor: `${aura.color}44` }}
              >
                {/* Pulsing aura rings */}
                {[1, 2, 3, 4].map(i => (
                  <motion.div key={i} className="absolute rounded-full"
                    style={{ width: i * 100, height: i * 100, border: `1px solid ${aura.color}`, opacity: 0.15 }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.03, 0.15] }}
                    transition={{ repeat: Infinity, duration: 2 + i * 0.5, delay: i * 0.3 }}
                  />
                ))}

                {/* Central mandala */}
                <div className="relative">
                  <motion.div className="w-28 h-28 rounded-full flex items-center justify-center border-4"
                    style={{ borderColor: `${aura.color}55`, background: `${aura.color}11` }}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  >
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <HeartPulse className="w-10 h-10" style={{ color: aura.color }} />
                    </motion.div>
                  </motion.div>

                  {/* Orbiting particles */}
                  {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                    <motion.div key={i} className="absolute w-2 h-2 rounded-full"
                      style={{
                        background: aura.color,
                        top: "50%", left: "50%",
                        transformOrigin: "-48px -1px"
                      }}
                      animate={{ rotate: [deg, deg + 360] }}
                      transition={{ repeat: Infinity, duration: 4 + i * 0.5, ease: "linear" }}
                    />
                  ))}
                </div>

                {/* Status */}
                <div className="text-center space-y-2 z-10">
                  <p className="text-white font-black text-lg">Şifa Seansı Aktif</p>
                  <p className="text-[10px] font-black uppercase tracking-widest animate-pulse" style={{ color: aura.color }}>
                    {protocol.solfeggio} Hz Solfeggio · {protocol.binauralBeat} Hz Binaural
                  </p>
                  {audioEnabled && binaural.isPlaying && (
                    <p className="text-[9px] text-slate-500">🎧 Kulaklık takmanız önerilir</p>
                  )}
                </div>

                {/* Timer + progress */}
                <div className="w-full max-w-xs space-y-2 z-10">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{formatTime(healTimer)}</span>
                    <span>{formatTime(protocol.healingDuration)}</span>
                  </div>
                  <Progress value={healProgress} className="h-3 bg-slate-800 rounded-full" />
                  <p className="text-center text-xs font-bold" style={{ color: aura.color }}>{healProgress}% tamamlandı</p>
                </div>

                {/* Sur / Ayet reminder */}
                <div className="z-10 p-3 bg-white/5 rounded-xl border border-white/10 w-full max-w-xs text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Manevi Odak</p>
                  <p className="text-white text-xs font-bold">{protocol.surah.name} · {protocol.surah.ref}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 italic">"{protocol.surah.meaning}"</p>
                </div>

                {/* Waveform visualizer */}
                <div className="absolute bottom-0 left-0 w-full h-16 flex items-end justify-center gap-0.5 px-2 opacity-20">
                  {[...Array(60)].map((_, i) => (
                    <motion.div key={i} className="w-full rounded-t-sm"
                      style={{ background: aura.color }}
                      animate={{ height: [4, Math.random() * 40 + 10, 4] }}
                      transition={{ repeat: Infinity, duration: 0.4 + Math.random() * 0.4, delay: Math.random() * 0.5 }}
                    />
                  ))}
                </div>

                <button onClick={() => { binaural.stop(); reset(); }}
                  className="z-10 text-xs text-slate-600 hover:text-slate-400 transition-colors">
                  Seansı İptal Et
                </button>
              </motion.div>
            )}

            {/* COMPLETE */}
            {phase === "complete" && protocol && aura && (
              <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="bg-slate-900 rounded-3xl overflow-hidden min-h-[420px] flex flex-col items-center justify-center gap-6 p-8 border"
                style={{ borderColor: `${aura.color}44` }}
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: `${aura.color}22`, border: `3px solid ${aura.color}` }}
                >
                  <CheckCircle2 className="w-10 h-10" style={{ color: aura.color }} />
                </motion.div>

                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-white">Seans Tamamlandı!</h3>
                  <p className="text-slate-400 text-sm">Enerji alanınız yeniden kalibre edildi.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                  {[
                    { label: "Enerji Artışı", value: `+${30 + Math.floor(Math.random() * 20)}%` },
                    { label: "Frekans", value: `${protocol.solfeggio} Hz` },
                    { label: "Süre", value: formatTime(protocol.healingDuration) },
                    { label: "Esma", value: protocol.esma.split(" ")[0] },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-xl text-center border border-white/10">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-black" style={{ color: aura.color }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="w-full max-w-xs p-3 bg-white/5 rounded-xl border border-white/10 text-center space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Şükür Tavsiyesi</p>
                  <p className="text-white text-xs font-bold">{protocol.surah.name}</p>
                  <p className="text-[10px] text-slate-400 italic">"{protocol.surah.meaning}"</p>
                  <p className="text-[10px]" style={{ color: aura.color }}>{protocol.esma}</p>
                </div>

                <div className="flex gap-3 w-full max-w-xs">
                  <Button onClick={reset} variant="outline" className="flex-1 rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Tekrar Tara
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-4">

          {/* Healing Protocol Card */}
          {protocol && (phase === "result" || phase === "healing" || phase === "complete") ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 rounded-2xl p-5 border border-slate-700 space-y-4"
            >
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Şifa Protokolü</h4>

              {/* Surah */}
              <div className="p-3 rounded-xl border space-y-1" style={{ borderColor: `${protocol.auraColor}33`, background: `${protocol.auraColor}09` }}>
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5" style={{ color: protocol.auraColor }} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Şifa Suresi</span>
                </div>
                <p className="text-white text-sm font-bold">{protocol.surah.name}</p>
                <p className="text-[10px] text-slate-500">{protocol.surah.ref} · {protocol.surah.category}</p>
                <p className="text-[10px] italic text-slate-400">"{protocol.surah.meaning}"</p>
              </div>

              {/* Esma */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Esma-ül Hüsna</p>
                <p className="text-white font-bold text-sm">{protocol.esma}</p>
              </div>

              {/* Frequencies */}
              <div className="space-y-2">
                {[
                  { label: "Solfeggio", value: `${protocol.solfeggio} Hz`, desc: "Ana şifa frekansı" },
                  { label: "Binaural Beat", value: `${protocol.binauralBeat} Hz`, desc: `Baz: ${protocol.binauralBase} Hz` },
                ].map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">{f.label}</p>
                      <p className="text-[9px] text-slate-600">{f.desc}</p>
                    </div>
                    <span className="text-sm font-black" style={{ color: aura?.color }}>{f.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Info card when idle */
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-700 space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nasıl Çalışır?</h4>
              {[
                { step: "1", title: "Kuantum Tarama", desc: "Biyoelektrik alan analizi ve chakra haritalaması", icon: Eye },
                { step: "2", title: "Protokol Seçimi", desc: "AI destekli Sure + Frekans kombinasyonu", icon: Brain },
                { step: "3", title: "Binaural Seans", desc: "Sol/sağ kulak frekans farkıyla beyin dalgası kalibrasyonu", icon: Waves },
                { step: "4", title: "Enerji Yükleme", desc: "Görsel ve işitsel rezonans terapisi", icon: Zap },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">{item.title}</p>
                    <p className="text-slate-500 text-[10px]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Energy History */}
          {energyHistory.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-slate-900 rounded-2xl p-5 border border-slate-700 space-y-3"
            >
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enerji Geçmişi</h4>
              <div className="space-y-2">
                {energyHistory.slice().reverse().map((entry, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-600 w-10 shrink-0">{entry.date}</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${entry.score}%` }}
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                      />
                    </div>
                    <span className="text-[10px] font-black text-cyan-400 w-8 text-right">{entry.score}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Disclaimer notice */}
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 leading-relaxed">
              Bu araç <strong>manevi rehberlik</strong> amaçlıdır. Tıbbi tanı ve tedavi yerine geçmez.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
