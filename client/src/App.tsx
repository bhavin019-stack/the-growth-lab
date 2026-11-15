import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { HomeView } from './views/HomeView';
import { SkillStudioView } from './views/SkillStudioView';
import { MbaHubView } from './views/MbaHubView';
import { ExploreView } from './views/ExploreView';
import { MyGrowthView } from './views/MyGrowthView';
import { AICoachModal } from './components/modals/AICoachModal';
import { QuickCaptureModal } from './components/modals/QuickCaptureModal';
import { SearchModal } from './components/modals/SearchModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ExecutionPlannerModal } from './components/modals/ExecutionPlannerModal';
import { ScouterHUD } from './components/dbs/ScouterHUD';
import { fetchAppState } from './services/api';
import { soundEffects } from './services/soundEffects';
import { AppState, NavigationTab } from './types';
import { RefreshCw, AlertCircle, Zap } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [appState, setAppState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [aiContextSubject, setAiContextSubject] = useState<string | undefined>(undefined);
  const [aiContextDoc, setAiContextDoc] = useState<string | undefined>(undefined);

  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isScouterOpen, setIsScouterOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initial fetch
  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAppState();
      setAppState(data);
    } catch (err: any) {
      console.warn("Backend unavailable, falling back:", err);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        soundEffects.playButtonTap();
        setIsSearchOpen(true);
      } else if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        soundEffects.playCapsulePop();
        setIsQuickCaptureOpen(true);
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        soundEffects.playKiCharge();
        setIsAICoachOpen(true);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        soundEffects.playButtonTap();
        setIsPlannerOpen(true);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        soundEffects.playScouterBeep();
        setIsScouterOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenAICoachWithContext = (subject: string, docTitle: string) => {
    soundEffects.playKiCharge();
    setAiContextSubject(subject);
    setAiContextDoc(docTitle);
    setIsAICoachOpen(true);
  };

  const handleStateUpdate = (updater: (prev: AppState) => AppState) => {
    setAppState(prev => prev ? updater(prev) : prev);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-dbs-blue to-blue-700 flex items-center justify-center text-white shadow-ki-blue animate-bounce">
          <Zap className="w-8 h-8 text-amber-300" />
        </div>
        <div className="flex items-center gap-2 text-dbs-blue font-mono font-black text-sm">
          <RefreshCw className="w-4 h-4 animate-spin text-dbs-blue" />
          <span>Synchronizing Divine Ki Energy...</span>
        </div>
      </div>
    );
  }

  if (!appState) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-canvas-card border border-canvas-border rounded-2xl p-6 shadow-warm-lg space-y-4">
          <AlertCircle className="w-10 h-10 text-dbs-orange mx-auto" />
          <h2 className="text-lg font-bold text-charcoal-900 font-sans">Connecting to Growth Lab Engine...</h2>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            Initializing your personal learning and academic workspace.
          </p>
          <button
            onClick={loadState}
            className="px-5 py-2.5 bg-dbs-blue hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-ki-blue transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-canvas font-sans selection:bg-dbs-blue/20 selection:text-dbs-blue">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
          onOpenAICoach={() => {
            setAiContextSubject(undefined);
            setAiContextDoc(undefined);
            setIsAICoachOpen(true);
          }}
          onOpenPlanner={() => setIsPlannerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          profile={appState.profile}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-charcoal-900/70 backdrop-blur-sm">
          <div className="w-72 bg-canvas-subtle h-full shadow-warm-xl flex flex-col animate-fade-in border-r border-dbs-blue/30">
            <div className="p-4 flex justify-between items-center border-b border-canvas-border">
              <span className="font-black text-dbs-blue text-sm font-mono">THE GROWTH LAB • DBS</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-charcoal-500 hover:text-charcoal-200"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                onOpenQuickCapture={() => {
                  setMobileMenuOpen(false);
                  setIsQuickCaptureOpen(true);
                }}
                onOpenAICoach={() => {
                  setMobileMenuOpen(false);
                  setIsAICoachOpen(true);
                }}
                onOpenPlanner={() => {
                  setMobileMenuOpen(false);
                  setIsPlannerOpen(true);
                }}
                onOpenSettings={() => {
                  setMobileMenuOpen(false);
                  setIsSettingsOpen(true);
                }}
                profile={appState.profile}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAICoach={() => setIsAICoachOpen(true)}
          onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
          onOpenPlanner={() => setIsPlannerOpen(true)}
          onOpenScouter={() => setIsScouterOpen(true)}
          assignments={appState.assignments}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeView
              appState={appState}
              onNavigate={setActiveTab}
              onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
              onOpenAICoach={() => setIsAICoachOpen(true)}
              onStateUpdate={handleStateUpdate}
            />
          )}

          {activeTab === 'skill-studio' && (
            <SkillStudioView
              appState={appState}
              onStateUpdate={handleStateUpdate}
              onOpenAICoach={() => setIsAICoachOpen(true)}
            />
          )}

          {activeTab === 'mba-hub' && (
            <MbaHubView
              appState={appState}
              onStateUpdate={handleStateUpdate}
              onOpenAICoachWithContext={handleOpenAICoachWithContext}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreView
              appState={appState}
              onStateUpdate={handleStateUpdate}
              onOpenAICoach={() => setIsAICoachOpen(true)}
            />
          )}

          {activeTab === 'my-growth' && (
            <MyGrowthView
              appState={appState}
              onOpenAICoach={() => setIsAICoachOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Tactical Dragon Ball Super Scouter HUD Overlay */}
      <ScouterHUD
        isOpen={isScouterOpen}
        onClose={() => setIsScouterOpen(false)}
        userPowerLevel={9001}
      />

      {/* Global Modals */}
      <AICoachModal
        isOpen={isAICoachOpen}
        onClose={() => {
          setIsAICoachOpen(false);
          setAiContextSubject(undefined);
          setAiContextDoc(undefined);
        }}
        appState={appState}
        onOpenSettings={() => {
          setIsAICoachOpen(false);
          setIsSettingsOpen(true);
        }}
        contextSubject={aiContextSubject}
        contextDocTitle={aiContextDoc}
      />

      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onCaptured={(item) => {
          setAppState(prev => prev ? {
            ...prev,
            quickCaptures: [item, ...prev.quickCaptures]
          } : prev);
        }}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        appState={appState}
        onNavigate={setActiveTab}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        appState={appState}
        onStateUpdate={handleStateUpdate}
      />

      <ExecutionPlannerModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        planner={appState.executionPlanner}
        onPlannerUpdate={(planner) => {
          setAppState(prev => prev ? { ...prev, executionPlanner: planner } : prev);
        }}
      />
    </div>
  );
}

export default App;
