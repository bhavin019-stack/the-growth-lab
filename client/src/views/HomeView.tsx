import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  GraduationCap, 
  Compass, 
  BrainCircuit, 
  Mic, 
  Check, 
  Flame, 
  Zap, 
  RotateCcw,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, NavigationTab } from '../types';
import { updateDailyWorkoutStep, completeDailyWorkout } from '../services/api';

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
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 mins per step
  const [timerRunning, setTimerRunning] = useState(false);
  const [reflectionInput, setReflectionInput] = useState('');
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(dailyWorkout.isCompleted);

  // 5-min minimum routine modal/toggle
  const [routine5Active, setRoutine5Active] = useState(false);
  const [routine5Step, setRoutine5Step] = useState(1);
  const [routine5Done, setRoutine5Done] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const workoutSteps = [
    {
      step: 1,
      title: "5m Read & Absorb",
      instruction: "Read one short business observation or course slide. Focus on the core mechanism.",
      resource: "Microeconomics: Cost Curves & Returns to Scale (Slide 4)",
      duration: 300
    },
    {
      step: 2,
      title: "5m Explain in Your Own Words",
      instruction: "Explain what you just read out loud or write it simply without looking at the text.",
      prompt: "What is the core takeaway if you had to explain this to a non-business friend?",
      duration: 300
    },
    {
      step: 3,
      title: "5m Structure into Framework",
      instruction: "Organize your explanation: Point → Reason → Example (PRE) or Situation → Action → Result.",
      duration: 300
    },
    {
      step: 4,
      title: "5m Record & Reflect",
      instruction: "Speak or record your final crisp 60-second summary. Eliminate filler words like 'basically'.",
      duration: 300
    }
  ];

  const handleNextWorkoutStep = async () => {
    if (currentStep < 4) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setTimerSeconds(300);
      setTimerRunning(false);
      await updateDailyWorkoutStep(next, 300);
    } else {
      // Complete workout
      setIsWorkoutCompleted(true);
      setWorkoutActive(false);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}
      await completeDailyWorkout(reflectionInput || "Completed daily 20-min communication workout.");
      onStateUpdate(prev => ({
        ...prev,
        dailyWorkout: { ...prev.dailyWorkout, isCompleted: true }
      }));
    }
  };

  const handleStart5MinRoutine = () => {
    setRoutine5Active(true);
    setRoutine5Step(1);
    setRoutine5Done(false);
  };

  const handleComplete5Min = () => {
    setRoutine5Done(true);
    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
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
      {/* 1. SHORT PERSONALIZED WELCOME */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-canvas-card p-5 md:p-6 rounded-2xl border border-canvas-border shadow-warm-sm">
        <div>
          <span className="text-[11px] font-bold text-terracotta-600 uppercase tracking-wider bg-terracotta-50 px-2.5 py-0.5 rounded-full border border-terracotta-200">
            Personal Growth First • Academic Management Second
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-charcoal-900 tracking-tight font-sans mt-1.5">
            Welcome back, {profile.name.split(' ')[0]}
          </h1>
          <p className="text-xs md:text-sm text-charcoal-500 font-medium">
            "{profile.tagline}"
          </p>
        </div>

        {/* Momentum Indicator without guilt */}
        <div className="flex items-center gap-3 bg-canvas-subtle p-2.5 rounded-xl border border-canvas-border shrink-0">
          <div className="w-9 h-9 rounded-lg bg-ochre-100 text-ochre-700 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5 text-ochre-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-charcoal-900">Active Momentum</span>
              <span className="text-[10px] bg-forest-50 text-forest-700 border border-forest-200 px-1.5 py-0.2 rounded font-semibold">
                No Stress
              </span>
            </div>
            <p className="text-[11px] text-charcoal-500">
              {dailyWorkout.history.length + (isWorkoutCompleted ? 1 : 0)} workouts logged
            </p>
          </div>
        </div>
      </div>

      {/* 2 & 3. PROMINENT RECOMMENDED DAILY ACTIVITY + CLEAR START BUTTON */}
      <div className="bg-gradient-to-br from-charcoal-900 to-charcoal-800 text-white rounded-3xl p-6 md:p-8 shadow-warm-xl relative overflow-hidden">
        {/* Background Subtle Geometric Glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-terracotta-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-amber-300 font-semibold text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Today's Recommended 20-Min Workout
            </span>
            <span className="text-xs text-charcoal-300">• 4 Structured 5-Minute Phases</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold font-sans tracking-tight text-white leading-snug">
            {isWorkoutCompleted 
              ? "Today's 20-Minute Communication Workout Completed!" 
              : "20-Minute Communication Workout: Explaining Cost Trade-offs"}
          </h2>

          <p className="text-xs md:text-sm text-charcoal-300 leading-relaxed font-sans">
            {isWorkoutCompleted
              ? "Great momentum. You articulated a business concept clearly and structured your thoughts. Feel free to explore your modules below."
              : "Read 5m → Explain in your own words 5m → Structure with Point-Reason-Example 5m → Record & reflect 5m."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!isWorkoutCompleted ? (
              <button
                onClick={() => setWorkoutActive(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-sm shadow-warm-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start 20-Min Workout</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsWorkoutCompleted(false);
                  setWorkoutActive(true);
                  setCurrentStep(1);
                  setTimerSeconds(300);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice Another Workout</span>
              </button>
            )}

            {/* 4. THE 5-MINUTE ALTERNATIVE */}
            <button
              onClick={handleStart5MinRoutine}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-charcoal-200 hover:text-white font-semibold text-xs border border-white/10 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Busy today? Try 5-Minute Minimum</span>
            </button>
          </div>
        </div>
      </div>

      {/* INTERACTIVE WORKOUT TRAY IF LAUNCHED */}
      {workoutActive && (
        <div className="bg-canvas-card border-2 border-terracotta-400 rounded-2xl p-6 shadow-warm-lg space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-canvas-border pb-4">
            <div>
              <span className="text-xs font-bold text-terracotta-600 uppercase tracking-wider">
                Phase {currentStep} of 4 • {workoutSteps[currentStep - 1].title}
              </span>
              <h3 className="text-lg font-bold text-charcoal-900 mt-0.5">
                {workoutSteps[currentStep - 1].instruction}
              </h3>
            </div>
            {/* Step Timer */}
            <div className="flex items-center gap-3">
              <div className="text-2xl font-mono font-bold text-charcoal-900 bg-canvas-subtle px-3 py-1 rounded-xl border border-canvas-border">
                {formatTime(timerSeconds)}
              </div>
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="px-3 py-1.5 rounded-lg bg-charcoal-800 text-white font-semibold text-xs hover:bg-charcoal-900 transition-colors"
              >
                {timerRunning ? 'Pause' : 'Start Timer'}
              </button>
            </div>
          </div>

          {/* Phase Specific Content */}
          <div className="p-4 rounded-xl bg-canvas-subtle border border-canvas-border space-y-3">
            {currentStep === 1 && (
              <div className="text-xs text-charcoal-700 leading-relaxed">
                <p className="font-semibold text-charcoal-900 mb-1">Assigned Mini Resource:</p>
                <div className="p-3 bg-canvas-card rounded-lg border border-canvas-border font-serif text-sm">
                  "In competitive supply, the short-run marginal cost curve above the average variable cost curve represents the firm's supply curve. Sunk costs are past unrecoverable outlays and must strictly be ignored in forward-looking pricing decisions."
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-xs text-charcoal-700 space-y-2">
                <p className="font-semibold text-charcoal-900">Step 2: Unfiltered Explanation</p>
                <p>Speak aloud or jot down your raw explanation. Do not worry about polish yet.</p>
                <textarea
                  rows={3}
                  placeholder="My explanation in plain English..."
                  className="w-full bg-canvas-card border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-xs text-charcoal-700 space-y-2">
                <p className="font-semibold text-charcoal-900">Step 3: Point → Reason → Example (PRE)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="p-2.5 bg-canvas-card rounded-lg border border-canvas-border">
                    <span className="font-bold text-terracotta-600 block">Point:</span>
                    <span className="text-charcoal-600 text-[11px]">Sunk costs should never influence future product decisions.</span>
                  </div>
                  <div className="p-2.5 bg-canvas-card rounded-lg border border-canvas-border">
                    <span className="font-bold text-terracotta-600 block">Reason:</span>
                    <span className="text-charcoal-600 text-[11px]">Because past dollars cannot be recovered regardless of next actions.</span>
                  </div>
                  <div className="p-2.5 bg-canvas-card rounded-lg border border-canvas-border">
                    <span className="font-bold text-terracotta-600 block">Example:</span>
                    <span className="text-charcoal-600 text-[11px]">Continuing an unprofitable IT project just because \$100k was spent.</span>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-xs text-charcoal-700 space-y-2">
                <p className="font-semibold text-charcoal-900">Step 4: 60-Second Final Audio or Reflection</p>
                <p>Record your voice or summarize your final polished version.</p>
                <textarea
                  rows={2}
                  value={reflectionInput}
                  onChange={(e) => setReflectionInput(e.target.value)}
                  placeholder="Final reflection or feedback on your delivery..."
                  className="w-full bg-canvas-card border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setWorkoutActive(false)}
              className="text-xs text-charcoal-500 hover:text-charcoal-800 font-semibold"
            >
              Exit Workout
            </button>

            <button
              onClick={handleNextWorkoutStep}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs rounded-xl shadow-warm-sm transition-all"
            >
              <span>{currentStep === 4 ? 'Finish Workout' : 'Next 5-Min Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5-MINUTE MINIMUM ROUTINE MODAL */}
      {routine5Active && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-warm-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-charcoal-900 text-sm">
                5-Minute Minimum Routine (Busy Day Mode)
              </h3>
            </div>
            <button
              onClick={() => setRoutine5Active(false)}
              className="text-xs text-charcoal-400 hover:text-charcoal-700 font-semibold"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            1 min observe one business problem → 1 min think about the root cause → 2 min speak/write your solution → 1 min reflect.
          </p>
          <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-charcoal-800">
            <strong>Today's Rapid Prompt:</strong> "When order volume doubles, why does customer support turnaround time triple rather than double?"
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-charcoal-500 font-medium">Takes 5 mins • Never breaks momentum</span>
            <button
              onClick={handleComplete5Min}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              {routine5Done ? 'Completed!' : 'Mark 5-Min Routine Done'}
            </button>
          </div>
        </div>
      )}

      {/* DASHBOARD GRID: 5. UPCOMING DEADLINES & 6. COMPACT PROGRESS SNAPSHOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Upcoming Academic Deadlines */}
        <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-terracotta-500" />
                <h3 className="font-bold text-charcoal-900 text-sm font-sans">
                  Upcoming Academic Deadlines
                </h3>
              </div>
              <button
                onClick={() => onNavigate('mba-hub')}
                className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1"
              >
                <span>View all</span>
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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    assign.priority === 'must'
                      ? 'bg-terracotta-50 text-terracotta-700 border border-terracotta-200'
                      : 'bg-ochre-50 text-ochre-700 border border-ochre-200'
                  }`}>
                    {assign.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-canvas-border flex items-center justify-between text-[11px] text-charcoal-400">
            <span>Microsoft Outlook: Synced manually</span>
            <button
              onClick={() => onNavigate('mba-hub')}
              className="text-terracotta-600 font-semibold hover:underline"
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
                <Sparkles className="w-4 h-4 text-forest-500" />
                <h3 className="font-bold text-charcoal-900 text-sm font-sans">
                  Compact Progress Snapshot
                </h3>
              </div>
              <button
                onClick={() => onNavigate('my-growth')}
                className="text-xs font-semibold text-forest-600 hover:text-forest-700 flex items-center gap-1"
              >
                <span>Analytics</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-canvas-subtle border border-canvas-border">
                <span className="text-lg font-extrabold text-charcoal-900 block font-mono">
                  {communicationAttempts.length}
                </span>
                <span className="text-[10px] text-charcoal-500 font-medium">Speaking Attempts</span>
              </div>
              <div className="p-3 rounded-xl bg-canvas-subtle border border-canvas-border">
                <span className="text-lg font-extrabold text-terracotta-600 block font-mono">
                  {appState.operationsLab.sops.length + appState.operationsLab.processMaps.length}
                </span>
                <span className="text-[10px] text-charcoal-500 font-medium">Ops & SOP Assets</span>
              </div>
              <div className="p-3 rounded-xl bg-canvas-subtle border border-canvas-border">
                <span className="text-lg font-extrabold text-forest-600 block font-mono">
                  {proofOfWorkProjects.length}
                </span>
                <span className="text-[10px] text-charcoal-500 font-medium">Proof of Work</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-forest-50/60 border border-forest-100 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-forest-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-forest-900">Highest Momentum Skill Area</p>
                <p className="text-forest-700 text-[11px]">Process Mapping & Standard Operating Procedures (75% mastery)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. VISUAL SHORTCUTS TO LEARNING AREAS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">
          Studio Learning Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('skill-studio')}
            className="p-4 rounded-2xl bg-canvas-card border border-canvas-border hover:border-terracotta-400 text-left transition-all hover:shadow-warm group"
          >
            <div className="w-8 h-8 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Mic className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-charcoal-900">Communication Gym</p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">Speaking & fluency drills</p>
          </button>

          <button
            onClick={() => onNavigate('skill-studio')}
            className="p-4 rounded-2xl bg-canvas-card border border-canvas-border hover:border-forest-400 text-left transition-all hover:shadow-warm group"
          >
            <div className="w-8 h-8 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-charcoal-900">Operations Lab</p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">SOPs & Process Maps</p>
          </button>

          <button
            onClick={() => onNavigate('explore')}
            className="p-4 rounded-2xl bg-canvas-card border border-canvas-border hover:border-amber-400 text-left transition-all hover:shadow-warm group"
          >
            <div className="w-8 h-8 rounded-xl bg-ochre-50 text-ochre-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-charcoal-900">Brand Lab & Canvas</p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">Observations & Ideas</p>
          </button>

          <button
            onClick={() => onNavigate('mba-hub')}
            className="p-4 rounded-2xl bg-canvas-card border border-canvas-border hover:border-ink-400 text-left transition-all hover:shadow-warm group"
          >
            <div className="w-8 h-8 rounded-xl bg-ink-50 text-ink-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-charcoal-900">MBA Academic Hub</p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">Term II Preserved PPTXs</p>
          </button>
        </div>
      </div>

      {/* 8. RECENTLY CONTINUED ACTIVITIES */}
      <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm space-y-3">
        <h3 className="font-bold text-charcoal-900 text-sm font-sans">
          Recently Continued Activities
        </h3>

        <div className="divide-y divide-canvas-border">
          <div className="py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-forest-500" />
              <div>
                <span className="font-bold text-charcoal-900">Standard Operating Procedure: Escalation Protocol</span>
                <span className="text-charcoal-400 text-[11px] block">Operations Lab • Updated 2 hours ago</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('skill-studio')}
              className="text-terracotta-600 hover:text-terracotta-700 font-semibold text-xs"
            >
              Resume
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div>
                <span className="font-bold text-charcoal-900">Brand Observation: Liquid Death Cultural Packaging</span>
                <span className="text-charcoal-400 text-[11px] block">Brand Lab • Explored today</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('explore')}
              className="text-terracotta-600 hover:text-terracotta-700 font-semibold text-xs"
            >
              Resume
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-ink-500" />
              <div>
                <span className="font-bold text-charcoal-900">Microeconomics: Cost of Production & Profit Maximization</span>
                <span className="text-charcoal-400 text-[11px] block">MBA Hub • Slides 1–15 indexed</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('mba-hub')}
              className="text-terracotta-600 hover:text-terracotta-700 font-semibold text-xs"
            >
              Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
