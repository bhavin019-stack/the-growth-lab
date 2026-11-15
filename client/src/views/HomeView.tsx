import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Sparkles, 
  Layers, 
  GraduationCap, 
  Compass, 
  Mic, 
  Flame, 
  Zap, 
  RotateCcw,
  Crosshair,
  Award,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, NavigationTab } from '../types';
import { updateDailyWorkoutStep, completeDailyWorkout } from '../services/api';
import { soundEffects } from '../services/soundEffects';
import { DragonRadarWidget } from '../components/dbs/DragonRadarWidget';

interface HomeViewProps {
  appState: AppState;
  onNavigate: (tab: NavigationTab) => void;
  onOpenQuickCapture: () => void;
  onOpenAICoach: () => void;
  onStateUpdate: (updater: (prev: AppState) => AppState) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  appState,
  onNavigate,
  onOpenQuickCapture,
  onOpenAICoach,
  onStateUpdate
}) => {
  const { profile, dailyWorkout, assignments, proofOfWorkProjects, communicationAttempts } = appState;

  // 20-min workout interactive state
  const [workoutActive, setWorkoutActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(dailyWorkout.currentStep || 1);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [reflectionInput, setReflectionInput] = useState('');
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(dailyWorkout.isCompleted);

  // 5-min minimum routine modal/toggle
  const [routine5Active, setRoutine5Active] = useState(false);
  const [routine5Done, setRoutine5Done] = useState(false);

  // Dragon Balls collected count calculation
  const dragonBallsCollected = Math.min(
    7,
    (isWorkoutCompleted ? 2 : 0) +
    (communicationAttempts.length > 0 ? 1 : 0) +
    (appState.operationsLab.sops.length > 0 ? 1 : 0) +
    (proofOfWorkProjects.length > 0 ? 1 : 0) +
    (appState.materials.length > 0 ? 1 : 0) +
    (appState.linkedInDrafts.length > 0 ? 1 : 0)
  );

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
      soundEffects.playInstantTransmission();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const workoutSteps = [
    {
      step: 1,
      title: "5m Read & Absorb (Ki Gathering)",
      instruction: "Read one core business mechanism or course slide. Focus on the underlying structural trade-off.",
      resource: "Microeconomics: Cost Curves & Returns to Scale (Slide 4)",
      duration: 300
    },
    {
      step: 2,
      title: "5m Explain in Your Own Voice (Kiai Roar)",
      instruction: "Explain what you just read out loud in simple terms without looking at the text.",
      prompt: "What is the core takeaway if you had to explain this to a non-business ally?",
      duration: 300
    },
    {
      step: 3,
      title: "5m Structure into Framework (Martial Stance)",
      instruction: "Organize your explanation: Point → Reason → Example (PRE) or Situation → Action → Result.",
      duration: 300
    },
    {
      step: 4,
      title: "5m Record & Reflect (Super Saiyan Burst)",
      instruction: "Speak or record your final crisp 60-second summary. Eliminate filler sounds and own your power.",
      duration: 300
    }
  ];

  const handleStartWorkout = () => {
    soundEffects.playKiCharge();
    setWorkoutActive(true);
    setTimerRunning(true);
  };

  const handleNextWorkoutStep = async () => {
    soundEffects.playInstantTransmission();
    if (currentStep < 4) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setTimerSeconds(300);
      setTimerRunning(false);
      await updateDailyWorkoutStep(next, 300);
    } else {
      setIsWorkoutCompleted(true);
      setWorkoutActive(false);
      soundEffects.playSuperSaiyanAura();
      try {
        confetti({
          particleCount: 120,
          spread: 75,
          colors: ['#00E5FF', '#FFD700', '#FF5722', '#FFFFFF'],
          origin: { y: 0.6 }
        });
      } catch {}
      await completeDailyWorkout(reflectionInput || "Completed Hyperbolic Time Chamber 20-min daily gravity workout.");
      onStateUpdate(prev => ({
        ...prev,
        dailyWorkout: { ...prev.dailyWorkout, isCompleted: true }
      }));
    }
  };

  const handleStart5MinRoutine = () => {
    soundEffects.playInstantTransmission();
    setRoutine5Active(true);
    setRoutine5Done(false);
  };

  const handleComplete5Min = () => {
    soundEffects.playSuperSaiyanAura();
    setRoutine5Done(true);
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch {}
    setTimeout(() => {
      setRoutine5Active(false);
    }, 1500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const pendingDeadlines = assignments
    .filter(a => a.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* 1. SUPER DRAGON BALLS RADAR TRACKER */}
      <DragonRadarWidget completedCount={dragonBallsCollected} />

      {/* 2. SAIYAN SCHOLAR WELCOME BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-canvas-card p-5 md:p-6 rounded-2xl border border-canvas-border shadow-warm-sm border-l-4 border-l-dbs-blue">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-dbs-blue uppercase tracking-widest bg-dbs-blue/10 px-2.5 py-0.5 rounded-full border border-dbs-blue/30 shadow-ki-blue">
              TOURNAMENT OF POWER TRAINING CHAMBER
            </span>
            <span className="text-[10px] font-bold text-dbs-gold bg-dbs-gold/10 px-2 py-0.5 rounded border border-dbs-gold/30">
              FORM: SUPER SAIYAN BLUE
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-charcoal-900 tracking-tight font-sans mt-2">
            Welcome back, Saiyan Scholar {profile.name.split(' ')[0]}
          </h1>
          <p className="text-xs md:text-sm text-charcoal-500 font-medium mt-0.5">
            "{profile.tagline}"
          </p>
        </div>

        {/* Battle Power Meter */}
        <div className="flex items-center gap-3 bg-canvas-subtle p-3 rounded-2xl border border-canvas-border shrink-0 shadow-warm-sm">
          <div className="w-10 h-10 rounded-xl bg-dbs-blue/20 border border-dbs-blue flex items-center justify-center font-bold shadow-ki-blue text-dbs-blue">
            <Zap className="w-5 h-5 animate-pulse text-dbs-blue" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-charcoal-900 font-mono">BATTLE POWER</span>
              <span className="text-[10px] bg-dbs-scouter/20 text-dbs-scouter border border-dbs-scouter/40 px-1.5 py-0.2 rounded font-mono font-bold">
                SCOUTER LOCK
              </span>
            </div>
            <p className="text-xs font-mono font-black text-dbs-scouter">
              9,001+ (DIVINE KI)
            </p>
          </div>
        </div>
      </div>

      {/* 3. HYPERBOLIC TIME CHAMBER 20-MINUTE WORKOUT HERO CARD */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white rounded-3xl p-6 md:p-8 shadow-ki-blue relative overflow-hidden border-2 border-dbs-blue/40">
        {/* Animated Ki Energy Aura Background */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-dbs-blue/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute right-36 -bottom-20 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-dbs-blue/20 text-dbs-blue border border-dbs-blue/40 font-mono font-black text-xs flex items-center gap-1.5 shadow-ki-blue">
              <Sparkles className="w-3.5 h-3.5" />
              100X GRAVITY CHAMBER • 20-MIN WORKOUT
            </span>
            <span className="text-xs text-charcoal-400 font-mono">4 Phased Saiyan Drills</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black font-sans tracking-tight text-white leading-tight">
            {isWorkoutCompleted 
              ? "Gravity Chamber 20-Minute Drill Completed! Ki Maxed Out!" 
              : "Hyperbolic Training: Articulating Cost Trade-Offs Under Pressure"}
          </h2>

          <p className="text-xs md:text-sm text-charcoal-300 leading-relaxed font-sans">
            {isWorkoutCompleted
              ? "Your verbal ki output is synchronized. You demonstrated crisp business reasoning without verbal filler words. Super Saiyan Blue mastery elevated."
              : "Read 5m (Absorb) → Explain in own words 5m (Kiai) → Structure into PRE 5m (Stance) → Record crisp 60s summary 5m (Super Saiyan Burst)."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!isWorkoutCompleted ? (
              <button
                onClick={handleStartWorkout}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-dbs-blue to-cyan-500 hover:from-cyan-400 hover:to-dbs-blue text-slate-950 font-black text-sm shadow-ki-blue hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Power Up & Begin Workout</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundEffects.playKiCharge();
                  setIsWorkoutCompleted(false);
                  setWorkoutActive(true);
                  setCurrentStep(1);
                  setTimerSeconds(300);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-Enter Gravity Chamber</span>
              </button>
            )}

            {/* KAIOKEN 5-MINUTE MINIMUM ALTERNATIVE */}
            <button
              onClick={handleStart5MinRoutine}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white font-bold text-xs border border-red-500/40 shadow-ki-god transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-red-400" />
              <span>Busy today? Kaioken 5-Minute Burst</span>
            </button>
          </div>
        </div>
      </div>

      {/* INTERACTIVE GRAVITY CHAMBER WORKOUT TRAY */}
      {workoutActive && (
        <div className="bg-canvas-card border-2 border-dbs-blue rounded-3xl p-6 shadow-ki-blue space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-canvas-border pb-4">
            <div>
              <span className="text-xs font-mono font-black text-dbs-blue uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-dbs-blue animate-ping" />
                PHASE {currentStep} OF 4 • {workoutSteps[currentStep - 1].title}
              </span>
              <h3 className="text-lg font-black text-charcoal-900 mt-1">
                {workoutSteps[currentStep - 1].instruction}
              </h3>
            </div>
            {/* Step Timer with Scouter Styling */}
            <div className="flex items-center gap-3">
              <div className="text-2xl font-mono font-black text-dbs-scouter bg-black/60 px-4 py-1.5 rounded-xl border border-dbs-scouter/50 shadow-scouter">
                {formatTime(timerSeconds)}
              </div>
              <button
                onClick={() => {
                  soundEffects.playButtonTap();
                  setTimerRunning(!timerRunning);
                }}
                className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {timerRunning ? 'Pause Gravity' : 'Engage Timer'}
              </button>
            </div>
          </div>

          {/* Phase Content */}
          <div className="p-4 rounded-2xl bg-canvas-subtle border border-canvas-border space-y-3">
            {currentStep === 1 && (
              <div className="text-xs text-charcoal-700 leading-relaxed">
                <p className="font-bold text-charcoal-900 mb-1 text-sm">Assigned Course Insight (Ki Gathering):</p>
                <div className="p-3.5 bg-canvas-card rounded-xl border border-dbs-blue/30 font-serif text-sm text-charcoal-900 shadow-warm-sm">
                  "In competitive markets, sunk costs are historical outlays that cannot be altered by future decisions. A master strategist ignores sunk expenditures and bases marginal capacity only on prospective forward returns."
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-xs text-charcoal-700 space-y-2">
                <p className="font-bold text-charcoal-900 text-sm">Step 2: Unfiltered Explanation (Kiai Roar)</p>
                <p>Speak aloud or jot down your raw explanation. Do not worry about polish yet.</p>
                <textarea
                  rows={3}
                  placeholder="Explain in plain English with conviction..."
                  className="w-full bg-canvas-card border border-canvas-border rounded-xl p-3 text-xs text-charcoal-900 focus:outline-none focus:border-dbs-blue"
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-xs text-charcoal-700 space-y-2">
                <p className="font-bold text-charcoal-900 text-sm">Step 3: Point → Reason → Example (Martial Stance)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-canvas-card rounded-xl border border-dbs-blue/40">
                    <span className="font-black text-dbs-blue text-[11px] block uppercase">Point:</span>
                    <span className="text-charcoal-700 text-xs">Sunk costs must never dictate future resource allocation.</span>
                  </div>
                  <div className="p-3 bg-canvas-card rounded-xl border border-dbs-gold/40">
                    <span className="font-black text-dbs-gold text-[11px] block uppercase">Reason:</span>
                    <span className="text-charcoal-700 text-xs">Because historical capital is unrecoverable regardless of outcome.</span>
                  </div>
                  <div className="p-3 bg-canvas-card rounded-xl border border-dbs-orange/40">
                    <span className="font-black text-dbs-orange text-[11px] block uppercase">Example:</span>
                    <span className="text-charcoal-700 text-xs">Pouring further engineering budget into a failing legacy tool.</span>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-xs text-charcoal-700 space-y-2">
                <p className="font-bold text-charcoal-900 text-sm">Step 4: 60-Second Final Super Saiyan Summary</p>
                <p>Speak with executive authority. Own your conclusion without verbal filler sounds.</p>
                <textarea
                  rows={2}
                  value={reflectionInput}
                  onChange={(e) => setReflectionInput(e.target.value)}
                  placeholder="Record your final reflections or key takeaway..."
                  className="w-full bg-canvas-card border border-canvas-border rounded-xl p-3 text-xs text-charcoal-900 focus:outline-none focus:border-dbs-blue"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setWorkoutActive(false)}
              className="text-xs text-charcoal-500 hover:text-charcoal-800 font-semibold cursor-pointer"
            >
              Exit Chamber
            </button>

            <button
              onClick={handleNextWorkoutStep}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-dbs-blue hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-ki-blue transition-all cursor-pointer"
            >
              <span>{currentStep === 4 ? 'Master Gravity Workout' : 'Next 5-Min Phase'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* KAIOKEN 5-MINUTE MINIMUM ROUTINE */}
      {routine5Active && (
        <div className="bg-red-950/30 border-2 border-red-500/50 rounded-2xl p-5 shadow-ki-god space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500 animate-pulse" />
              <h3 className="font-black text-white text-sm">
                Kaioken 5-Minute Burst Mode (Busy Day Power Drill)
              </h3>
            </div>
            <button
              onClick={() => setRoutine5Active(false)}
              className="text-xs text-charcoal-400 hover:text-white font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-charcoal-300 leading-relaxed">
            1 min observe one business dilemma → 1 min uncover root cause → 2 min speak/write recommendation → 1 min reflect.
          </p>
          <div className="p-3 bg-canvas-card rounded-xl border border-red-500/30 text-xs text-charcoal-900 font-bold">
            Today's Rapid Prompt: "When customer support ticket backlog doubles, why does turnaround time triple instead of double?"
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-charcoal-400 font-mono">10X KI SURGE • ZERO MOMENTUM LOSS</span>
            <button
              onClick={handleComplete5Min}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-all shadow-ki-god cursor-pointer"
            >
              {routine5Done ? 'Kaioken Completed!' : 'Mark Kaioken Burst Done'}
            </button>
          </div>
        </div>
      )}

      {/* DASHBOARD GRID: UPCOMING DEADLINES & PROGRESS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Upcoming Academic Deadlines */}
        <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-dbs-blue" />
                <h3 className="font-bold text-charcoal-900 text-sm font-sans">
                  Capsule Corp Academic Deadlines
                </h3>
              </div>
              <button
                onClick={() => {
                  soundEffects.playInstantTransmission();
                  onNavigate('mba-hub');
                }}
                className="text-xs font-semibold text-dbs-blue hover:text-cyan-400 flex items-center gap-1 cursor-pointer"
              >
                <span>Archives</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {pendingDeadlines.map((assign) => (
                <div
                  key={assign.id}
                  className="p-3 rounded-xl bg-canvas-subtle border border-canvas-border flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-charcoal-900 truncate">
                      {assign.title}
                    </p>
                    <p className="text-[10px] text-charcoal-500 mt-0.5">
                      Due: {assign.dueDate} • Est: {assign.estimatedMinutes}m
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 font-mono ${
                    assign.priority === 'must'
                      ? 'bg-dbs-orange/20 text-dbs-orange border border-dbs-orange/40'
                      : 'bg-dbs-gold/20 text-dbs-gold border border-dbs-gold/40'
                  }`}>
                    {assign.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-canvas-border flex items-center justify-between text-[11px] text-charcoal-400">
            <span>Synced with Tournament Schedule</span>
            <button
              onClick={() => onNavigate('mba-hub')}
              className="text-dbs-blue font-bold hover:underline"
            >
              + Add assignment
            </button>
          </div>
        </div>

        {/* Compact Progress Snapshot */}
        <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-dbs-gold" />
                <h3 className="font-bold text-charcoal-900 text-sm font-sans">
                  Saiyan Capability Snapshot
                </h3>
              </div>
              <button
                onClick={() => {
                  soundEffects.playInstantTransmission();
                  onNavigate('my-growth');
                }}
                className="text-xs font-semibold text-dbs-gold hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Power Radar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-3 rounded-xl bg-canvas-subtle border border-canvas-border">
                <span className="text-lg font-black text-dbs-blue block">
                  {communicationAttempts.length}
                </span>
                <span className="text-[10px] text-charcoal-400 font-sans">Kiai Drills</span>
              </div>
              <div className="p-3 rounded-xl bg-canvas-subtle border border-canvas-border">
                <span className="text-lg font-black text-dbs-gold block">
                  {appState.operationsLab.sops.length + appState.operationsLab.processMaps.length}
                </span>
                <span className="text-[10px] text-charcoal-400 font-sans">Ops Blueprints</span>
              </div>
              <div className="p-3 rounded-xl bg-canvas-subtle border border-canvas-border">
                <span className="text-lg font-black text-dbs-scouter block">
                  {proofOfWorkProjects.length}
                </span>
                <span className="text-[10px] text-charcoal-400 font-sans">Proof of Work</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-dbs-blue/10 border border-dbs-blue/30 flex items-center gap-3">
              <Zap className="w-5 h-5 text-dbs-blue shrink-0 animate-pulse" />
              <div className="text-xs">
                <p className="font-bold text-dbs-blue">Highest Battle Mastery</p>
                <p className="text-charcoal-700 text-[11px]">Process Mapping & Standard Operating Procedures (75% mastery)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SHORTCUTS TO TRAINING CHAMBERS */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-dbs-blue uppercase tracking-widest">
          Capsule Corp Training Chambers
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => {
              soundEffects.playInstantTransmission();
              onNavigate('skill-studio');
            }}
            className="p-4 rounded-2xl bg-canvas-card border border-canvas-border hover:border-dbs-blue text-left transition-all hover:shadow-ki-blue group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-dbs-blue/20 text-dbs-blue flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Mic className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-charcoal-900">Communication Gym</p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">Speaking & fluency drills</p>
          </button>

          <button
            onClick={() => {
              soundEffects.playInstantTransmission();
              onNavigate('skill-studio');
            }}
            className="p-4 rounded-2xl bg-canvas-card border border-canvas-border hover:border-dbs-scouter text-left transition-all hover:shadow-scouter group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-950/40 text-dbs-scouter flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-charcoal-900">Capsule Ops Lab</p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">SOPs & Process Maps</p>
          </button>

          <button
            onClick={() => {
              soundEffects.playInstantTransmission();
              onNavigate('explore');
            }}
            className="p-4 rounded-2xl bg-canvas-card border border-canvas-border hover:border-dbs-gold text-left transition-all hover:shadow-ki-gold group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-950/40 text-dbs-gold flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-charcoal-900">Brand Lab & Canvas</p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">Observations & Ideas</p>
          </button>

          <button
            onClick={() => {
              soundEffects.playInstantTransmission();
              onNavigate('mba-hub');
            }}
            className="p-4 rounded-2xl bg-canvas-card border border-canvas-border hover:border-dbs-orange text-left transition-all hover:shadow-warm group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-red-950/40 text-dbs-orange flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-charcoal-900">Grand MBA Archives</p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">Term II Preserved PPTXs</p>
          </button>
        </div>
      </div>
    </div>
  );
};
