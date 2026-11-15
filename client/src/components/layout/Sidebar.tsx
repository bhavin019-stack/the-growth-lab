import React from 'react';
import { 
  Home, 
  Sparkles, 
  GraduationCap, 
  Compass, 
  TrendingUp, 
  PlusCircle, 
  BrainCircuit, 
  CalendarCheck, 
  Settings, 
  Zap,
  Shield,
  Activity
} from 'lucide-react';
import { NavigationTab, UserProfile } from '../../types';
import { soundEffects } from '../../services/soundEffects';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onOpenQuickCapture: () => void;
  onOpenAICoach: () => void;
  onOpenPlanner: () => void;
  onOpenSettings: () => void;
  profile?: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickCapture,
  onOpenAICoach,
  onOpenPlanner,
  onOpenSettings,
  profile
}) => {
  const navItems = [
    {
      id: 'home' as NavigationTab,
      label: 'Home Chamber',
      description: 'Daily studio & gravity drills',
      icon: Home
    },
    {
      id: 'skill-studio' as NavigationTab,
      label: 'Saiyan Skill Studio',
      description: 'Speaking gym, Ops Lab & Decisions',
      icon: Sparkles
    },
    {
      id: 'mba-hub' as NavigationTab,
      label: 'MBA Archives',
      description: 'Term II courses & preserved slides',
      icon: GraduationCap
    },
    {
      id: 'explore' as NavigationTab,
      label: 'Multiverse Explore',
      description: 'Brand Lab, LinkedIn, Proof-of-Work',
      icon: Compass
    },
    {
      id: 'my-growth' as NavigationTab,
      label: 'Ultra Instinct Growth',
      description: 'Power metrics & weekly reviews',
      icon: TrendingUp
    }
  ];

  const handleNavClick = (tabId: NavigationTab) => {
    soundEffects.playInstantTransmission();
    onTabChange(tabId);
  };

  return (
    <aside className="w-64 md:w-72 bg-canvas-subtle border-r border-canvas-border flex flex-col h-screen sticky top-0 select-none z-30 transition-all border-r-dbs-blue/20">
      {/* Brand Header with Capsule Corp / Super Saiyan Crest */}
      <div className="p-5 border-b border-canvas-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-dbs-blue to-blue-700 flex items-center justify-center text-white shadow-ki-blue relative overflow-hidden group">
            <span className="font-mono font-black text-xs text-white tracking-widest">
              CC
            </span>
            <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-charcoal-900 tracking-tight text-base leading-tight font-sans">
                THE GROWTH LAB
              </h1>
              <span className="text-[9px] font-black bg-dbs-orange text-white px-1 py-0.2 rounded font-mono">
                DBS
              </span>
            </div>
            <p className="text-[11px] text-dbs-blue font-semibold tracking-tight">
              super saiyan scholar edition
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="p-4 border-b border-canvas-border space-y-2">
        <button
          onClick={() => {
            soundEffects.playKiCharge();
            onOpenAICoach();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-dbs-blue/30 to-blue-900/40 hover:from-dbs-blue/40 hover:to-blue-900/60 border border-dbs-blue text-dbs-blue font-bold text-xs shadow-ki-blue transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <BrainCircuit className="w-4 h-4 text-dbs-blue group-hover:scale-110 transition-transform animate-pulse" />
            <span className="text-white">Angel Whis AI Coach</span>
          </div>
          <span className="text-[9px] font-mono bg-dbs-blue text-black font-extrabold px-1.5 py-0.5 rounded">
            DIVINE
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              soundEffects.playCapsulePop();
              onOpenQuickCapture();
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-canvas-card hover:bg-canvas-subtle border border-canvas-border hover:border-dbs-orange/50 text-charcoal-700 hover:text-dbs-orange text-xs font-bold shadow-warm-sm transition-all cursor-pointer"
            title="Capsule Corp Pocket Storage"
          >
            <PlusCircle className="w-3.5 h-3.5 text-dbs-orange" />
            <span>Capsule</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playButtonTap();
              onOpenPlanner();
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-canvas-card hover:bg-canvas-subtle border border-canvas-border hover:border-dbs-scouter/50 text-charcoal-700 hover:text-dbs-scouter text-xs font-bold shadow-warm-sm transition-all cursor-pointer"
            title="Gravity Chamber Planner"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-dbs-scouter" />
            <span>Gravity Plan</span>
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="px-3 pb-1.5 text-[10px] font-extrabold tracking-wider text-dbs-blue/70 uppercase font-mono flex items-center justify-between">
          <span>Tournament Navigation</span>
          <span className="w-1.5 h-1.5 rounded-full bg-dbs-blue animate-ping" />
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left flex items-start gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-canvas-card text-charcoal-900 font-bold shadow-ki-blue border border-dbs-blue/50'
                  : 'text-charcoal-500 hover:text-charcoal-900 hover:bg-canvas-card/60'
              }`}
            >
              <div
                className={`mt-0.5 p-1 rounded-lg ${
                  isActive
                    ? 'bg-dbs-blue/20 text-dbs-blue'
                    : 'text-charcoal-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-dbs-blue shadow-ki-blue animate-pulse" />
                  )}
                </div>
                <p className="text-[11px] text-charcoal-500 truncate mt-0.5">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Saiyan Profile & Battle Power Badge */}
      <div className="p-3 border-t border-canvas-border bg-canvas-subtle">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-canvas-card border border-canvas-border shadow-warm-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-dbs-orange to-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 border border-amber-300 shadow-ki-gold">
              悟
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-charcoal-900 truncate">
                  {profile?.name || 'Alex Vance'}
                </p>
                <span className="text-[8px] bg-dbs-blue/20 text-dbs-blue font-bold px-1 rounded font-mono">
                  SSJB
                </span>
              </div>
              <p className="text-[10px] text-dbs-scouter font-mono truncate font-semibold">
                POWER: 9,001+
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playButtonTap();
              onOpenSettings();
            }}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-200 hover:bg-canvas-subtle rounded-lg transition-colors cursor-pointer"
            title="Capsule Settings & Sound Options"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
