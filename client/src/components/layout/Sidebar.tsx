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
  SlidersHorizontal
} from 'lucide-react';
import { NavigationTab, UserProfile } from '../../types';

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
      label: 'Home',
      description: 'Daily studio & workouts',
      icon: Home
    },
    {
      id: 'skill-studio' as NavigationTab,
      label: 'Skill Studio',
      description: 'Speaking, Ops, Decisions',
      icon: Sparkles
    },
    {
      id: 'mba-hub' as NavigationTab,
      label: 'MBA Hub',
      description: 'Term II courses & docs',
      icon: GraduationCap
    },
    {
      id: 'explore' as NavigationTab,
      label: 'Explore',
      description: 'Library, Brand, LinkedIn, Career',
      icon: Compass
    },
    {
      id: 'my-growth' as NavigationTab,
      label: 'My Growth',
      description: 'Progress & weekly review',
      icon: TrendingUp
    }
  ];

  return (
    <aside className="w-64 md:w-72 bg-canvas-subtle border-r border-canvas-border flex flex-col h-screen sticky top-0 select-none z-30 transition-all">
      {/* Brand Header */}
      <div className="p-5 border-b border-canvas-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-terracotta-500 flex items-center justify-center text-white shadow-warm-sm">
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
              <path d="M14 34V14L24 24L34 14V34" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="24" cy="24" r="3" fill="currentColor"/>
              <circle cx="34" cy="34" r="3" fill="#FEF3C7"/>
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-charcoal-900 tracking-tight text-base leading-tight font-sans">
              THE GROWTH LAB
            </h1>
            <p className="text-[11px] text-charcoal-500 font-medium tracking-tight">
              build along with it
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="p-4 border-b border-canvas-border space-y-2">
        <button
          onClick={onOpenAICoach}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-ink-500 hover:bg-ink-600 text-white font-medium text-xs shadow-warm-sm transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <BrainCircuit className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
            <span>AI Learning Coach</span>
          </div>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/90">
            Partner
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenQuickCapture}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-canvas-card hover:bg-canvas-subtle border border-canvas-border text-charcoal-700 hover:text-terracotta-600 text-xs font-semibold shadow-warm-sm transition-all"
            title="Quickly capture ideas or observations"
          >
            <PlusCircle className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Capture</span>
          </button>

          <button
            onClick={onOpenPlanner}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-canvas-card hover:bg-canvas-subtle border border-canvas-border text-charcoal-700 hover:text-forest-600 text-xs font-semibold shadow-warm-sm transition-all"
            title="Daily & Weekly Execution Planner"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-forest-500" />
            <span>Planner</span>
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-charcoal-400 uppercase">
          Studio Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full text-left flex items-start gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? 'bg-canvas-card text-charcoal-900 font-semibold shadow-warm border border-canvas-border'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-canvas-card/60'
              }`}
            >
              <div
                className={`mt-0.5 p-1 rounded-lg ${
                  isActive
                    ? 'bg-terracotta-50 text-terracotta-600'
                    : 'text-charcoal-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500" />
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

      {/* Bottom Profile & Settings */}
      <div className="p-3 border-t border-canvas-border bg-canvas-subtle">
        <div className="flex items-center justify-between p-2 rounded-xl bg-canvas-card border border-canvas-border shadow-warm-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-terracotta-100 text-terracotta-800 font-bold text-xs flex items-center justify-center shrink-0">
              {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'AV'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-charcoal-900 truncate">
                {profile?.name || 'Alex Vance'}
              </p>
              <p className="text-[10px] text-charcoal-500 truncate">
                {profile?.title || 'MBA Candidate'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:bg-canvas-subtle rounded-lg transition-colors"
            title="Settings and API Configuration"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
