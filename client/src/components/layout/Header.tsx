import React from 'react';
import { Search, BrainCircuit, PlusCircle, Bell, Menu, Calendar } from 'lucide-react';
import { NavigationTab, Assignment } from '../../types';

interface HeaderProps {
  activeTab: NavigationTab;
  onOpenSearch: () => void;
  onOpenAICoach: () => void;
  onOpenQuickCapture: () => void;
  onOpenPlanner: () => void;
  assignments: Assignment[];
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenSearch,
  onOpenAICoach,
  onOpenQuickCapture,
  onOpenPlanner,
  assignments,
  onToggleMobileMenu
}) => {
  const titles: Record<NavigationTab, { title: string; subtitle: string }> = {
    'home': {
      title: 'Daily Growth Studio',
      subtitle: 'Structured daily workouts, priorities, and momentum'
    },
    'skill-studio': {
      title: 'Skill Studio',
      subtitle: 'Communication Gym, Operations Lab, Thought Builder & Decision Room'
    },
    'mba-hub': {
      title: 'MBA Academic Hub',
      subtitle: 'Term II courses, preserved documents, and grounded learning'
    },
    'explore': {
      title: 'Explore & Build',
      subtitle: 'Brand Lab, Idea Canvas, LinkedIn Creation & Proof-of-Work'
    },
    'my-growth': {
      title: 'My Growth Analytics',
      subtitle: 'Skill radar, practice history, and weekly executive reviews'
    }
  };

  const current = titles[activeTab];
  const pendingMust = assignments.filter(a => a.status === 'pending' && a.priority === 'must').length;

  return (
    <header className="h-16 border-b border-canvas-border bg-canvas/90 backdrop-blur sticky top-0 z-20 flex items-center justify-between px-4 md:px-8">
      {/* Title & Mobile Menu */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-charcoal-600 hover:text-charcoal-900 rounded-lg hover:bg-canvas-subtle"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="font-bold text-charcoal-900 text-base md:text-lg tracking-tight font-sans">
            {current.title}
          </h2>
          <p className="hidden md:block text-xs text-charcoal-500 font-medium truncate">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Global Action Bar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-canvas-card border border-canvas-border text-charcoal-500 hover:text-charcoal-900 hover:border-canvas-border-strong text-xs transition-all shadow-warm-sm group"
        >
          <Search className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-charcoal-700" />
          <span className="hidden sm:inline">Search anything...</span>
          <kbd className="hidden sm:inline text-[10px] bg-canvas-subtle px-1.5 py-0.5 rounded border border-canvas-border text-charcoal-400 font-mono">
            /
          </kbd>
        </button>

        {/* Quick Capture Pill */}
        <button
          onClick={onOpenQuickCapture}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-terracotta-50 hover:bg-terracotta-100 border border-terracotta-200 text-terracotta-700 font-medium text-xs shadow-warm-sm transition-all"
          title="Quick Capture (Press Q)"
        >
          <PlusCircle className="w-3.5 h-3.5 text-terracotta-600" />
          <span className="hidden sm:inline">Capture</span>
        </button>

        {/* AI Learning Coach Pill */}
        <button
          onClick={onOpenAICoach}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink-50 hover:bg-ink-100 border border-ink-100 text-ink-700 font-medium text-xs shadow-warm-sm transition-all"
          title="Ask AI Learning Coach"
        >
          <BrainCircuit className="w-3.5 h-3.5 text-ink-600" />
          <span className="hidden sm:inline">AI Coach</span>
        </button>

        {/* Deadlines Badge */}
        <button
          onClick={onOpenPlanner}
          className="relative p-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-canvas-card rounded-xl border border-transparent hover:border-canvas-border transition-all"
          title={`${pendingMust} priority academic deadlines pending`}
        >
          <Calendar className="w-4 h-4 text-charcoal-600" />
          {pendingMust > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
};
