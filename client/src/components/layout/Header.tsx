import React, { useState } from 'react';
import { 
  Search, 
  BrainCircuit, 
  PlusCircle, 
  Menu, 
  Calendar, 
  Volume2, 
  VolumeX, 
  Eye, 
  Zap, 
  Radio
} from 'lucide-react';
import { NavigationTab, Assignment } from '../../types';
import { soundEffects } from '../../services/soundEffects';

interface HeaderProps {
  activeTab: NavigationTab;
  onOpenSearch: () => void;
  onOpenAICoach: () => void;
  onOpenQuickCapture: () => void;
  onOpenPlanner: () => void;
  onOpenScouter: () => void;
  assignments: Assignment[];
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenSearch,
  onOpenAICoach,
  onOpenQuickCapture,
  onOpenPlanner,
  onOpenScouter,
  assignments,
  onToggleMobileMenu
}) => {
  const [soundOn, setSoundOn] = useState(soundEffects.isEnabled());

  const titles: Record<NavigationTab, { title: string; subtitle: string; powerLevel: string }> = {
    'home': {
      title: 'Hyperbolic Daily Studio',
      subtitle: 'Gravity chamber workouts, daily ki alignment, and momentum',
      powerLevel: '9,500'
    },
    'skill-studio': {
      title: 'Super Saiyan Skill Studio',
      subtitle: 'Communication Gym, Capsule Corp Ops Lab, and Critical Decision Arena',
      powerLevel: '14,200'
    },
    'mba-hub': {
      title: 'Grand Academic Archives',
      subtitle: 'Term II MBA courses, preserved presentation slides, and grounded mastery',
      powerLevel: '18,000'
    },
    'explore': {
      title: 'Multiverse Explore & Build',
      subtitle: 'Brand Lab observations, Idea Canvas, LinkedIn transmissions, and Proof-of-Work',
      powerLevel: '24,500'
    },
    'my-growth': {
      title: 'Ultra Instinct Growth Radar',
      subtitle: 'Battle power metrics, verbal fluency trajectory, and weekly executive reviews',
      powerLevel: 'OVER 9,000'
    }
  };

  const current = titles[activeTab];
  const pendingMust = assignments.filter(a => a.status === 'pending' && a.priority === 'must').length;

  const handleToggleSound = () => {
    const newState = soundEffects.toggleSound();
    setSoundOn(newState);
  };

  return (
    <header className="h-16 border-b border-canvas-border bg-canvas-subtle/95 backdrop-blur sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 border-b-dbs-blue/20 shadow-warm-sm">
      {/* Title & Mobile Menu */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={() => {
              soundEffects.playButtonTap();
              onToggleMobileMenu();
            }}
            className="md:hidden p-2 text-charcoal-600 hover:text-charcoal-900 rounded-lg hover:bg-canvas-card"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-charcoal-900 text-sm md:text-base tracking-tight font-sans">
              {current.title}
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold text-dbs-blue bg-dbs-blue/10 px-2 py-0.5 rounded-full border border-dbs-blue/30 shadow-ki-blue">
              <Zap className="w-3 h-3 text-dbs-gold" />
              <span>KI: {current.powerLevel}</span>
            </span>
          </div>
          <p className="hidden md:block text-xs text-charcoal-500 font-medium truncate">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Global Action Bar with DBS Sound & Scouter Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Scouter HUD Mode Button */}
        <button
          onClick={() => {
            soundEffects.playScouterBeep();
            onOpenScouter();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-dbs-scouter/50 text-dbs-scouter font-mono text-xs font-bold shadow-scouter transition-all cursor-pointer"
          title="Launch Scouter Battle Power Scanner HUD"
        >
          <Eye className="w-3.5 h-3.5 animate-pulse text-dbs-scouter" />
          <span className="hidden sm:inline">Scouter HUD</span>
        </button>

        {/* Anime Sound FX Toggle */}
        <button
          onClick={handleToggleSound}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            soundOn
              ? 'bg-dbs-blue/10 border-dbs-blue/40 text-dbs-blue shadow-ki-blue'
              : 'bg-canvas-card border-canvas-border text-charcoal-400 hover:text-charcoal-200'
          }`}
          title={soundOn ? "DBS Anime Sound FX: ACTIVE (Click to Mute)" : "DBS Anime Sound FX: MUTED (Click to Enable)"}
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Search */}
        <button
          onClick={() => {
            soundEffects.playButtonTap();
            onOpenSearch();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-canvas-card border border-canvas-border text-charcoal-500 hover:text-charcoal-900 hover:border-dbs-blue/40 text-xs transition-all shadow-warm-sm group"
        >
          <Search className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-dbs-blue" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline text-[10px] bg-canvas-subtle px-1.5 py-0.5 rounded border border-canvas-border text-charcoal-400 font-mono">
            /
          </kbd>
        </button>

        {/* Quick Capture (Capsule Corp) */}
        <button
          onClick={() => {
            soundEffects.playCapsulePop();
            onOpenQuickCapture();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dbs-orange/20 hover:bg-dbs-orange/30 border border-dbs-orange/50 text-dbs-orange font-bold text-xs shadow-warm-sm transition-all cursor-pointer"
          title="Capsule Corp Quick Capture (Press Q)"
        >
          <PlusCircle className="w-3.5 h-3.5 text-dbs-orange" />
          <span className="hidden sm:inline">Capsule</span>
        </button>

        {/* AI Learning Coach (Angel Whis Mode) */}
        <button
          onClick={() => {
            soundEffects.playKiCharge();
            onOpenAICoach();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dbs-blue/20 hover:bg-dbs-blue/30 border border-dbs-blue text-dbs-blue font-bold text-xs shadow-ki-blue transition-all cursor-pointer"
          title="Spar with AI Coach (Angel Whis Mode)"
        >
          <BrainCircuit className="w-3.5 h-3.5 text-dbs-blue" />
          <span className="hidden sm:inline">Angel Coach</span>
        </button>

        {/* Deadlines Badge */}
        <button
          onClick={() => {
            soundEffects.playButtonTap();
            onOpenPlanner();
          }}
          className="relative p-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-canvas-card rounded-xl border border-transparent hover:border-canvas-border transition-all"
          title={`${pendingMust} priority academic deadlines pending`}
        >
          <Calendar className="w-4 h-4 text-charcoal-600" />
          {pendingMust > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-dbs-orange animate-ping" />
          )}
        </button>
      </div>
    </header>
  );
};
