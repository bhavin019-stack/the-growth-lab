import React, { useState, useMemo } from 'react';
import { X, Search, FileText, Sparkles, BookOpen, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { AppState, NavigationTab } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onNavigate: (tab: NavigationTab) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  appState,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: string;
      tab: NavigationTab;
      icon: any;
    }> = [];

    // 1. MBA Materials
    appState.materials.forEach((m) => {
      if (m.title.toLowerCase().includes(q) || m.filename.toLowerCase().includes(q) || (m.extractedTextPreview && m.extractedTextPreview.toLowerCase().includes(q))) {
        results.push({
          id: m.id,
          title: m.title,
          subtitle: `Academic Material • ${m.session}`,
          category: 'MBA Hub',
          tab: 'mba-hub',
          icon: FileText
        });
      }
    });

    // 2. SOPs & Operations
    appState.operationsLab.sops.forEach((s) => {
      if (s.processName.toLowerCase().includes(q) || s.objective.toLowerCase().includes(q)) {
        results.push({
          id: s.id,
          title: s.processName,
          subtitle: `SOP • Owner: ${s.owner}`,
          category: 'Operations Lab',
          tab: 'skill-studio',
          icon: Layers
        });
      }
    });

    // 3. Curated Library
    appState.curatedLibrary.forEach((c) => {
      if (c.title.toLowerCase().includes(q) || c.author.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) {
        results.push({
          id: c.id,
          title: c.title,
          subtitle: `${c.source} • ${c.category}`,
          category: 'Explore Library',
          tab: 'explore',
          icon: BookOpen
        });
      }
    });

    // 4. Assignments
    appState.assignments.forEach((a) => {
      if (a.title.toLowerCase().includes(q)) {
        results.push({
          id: a.id,
          title: a.title,
          subtitle: `Due: ${a.dueDate} • Priority: ${a.priority.toUpperCase()}`,
          category: 'Deadlines',
          tab: 'home',
          icon: CheckCircle2
        });
      }
    });

    return results.slice(0, 8);
  }, [query, appState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-charcoal-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-canvas-card border border-canvas-border w-full max-w-xl rounded-2xl shadow-warm-xl overflow-hidden flex flex-col">
        {/* Input Bar */}
        <div className="p-3.5 border-b border-canvas-border flex items-center gap-3">
          <Search className="w-5 h-5 text-charcoal-400 shrink-0 ml-1" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search academic docs, SOPs, library articles, cases..."
            className="flex-1 bg-transparent text-sm md:text-base text-charcoal-900 focus:outline-none placeholder:text-charcoal-400 font-sans"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 text-charcoal-400 hover:text-charcoal-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-xs text-charcoal-400">
              Type to search course slides, process frameworks, or case studies...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-6 text-center text-xs text-charcoal-500">
              No results found for "<span className="font-semibold">{query}</span>".
            </div>
          ) : (
            <div className="space-y-1">
              {searchResults.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      onNavigate(r.tab);
                      onClose();
                    }}
                    className="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:bg-canvas-subtle border border-transparent hover:border-canvas-border transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-canvas-card border border-canvas-border text-charcoal-600 group-hover:text-terracotta-600 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-charcoal-900 truncate">
                          {r.title}
                        </p>
                        <p className="text-[11px] text-charcoal-500 truncate">
                          {r.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-semibold bg-canvas-subtle px-2 py-0.5 rounded text-charcoal-500 border border-canvas-border">
                        {r.category}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-charcoal-800 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 border-t border-canvas-border bg-canvas-subtle text-[11px] text-charcoal-400 flex items-center justify-between px-4">
          <span>Search index spans 6 subjects and all saved studio modules</span>
          <kbd className="font-mono text-[10px] bg-canvas-card px-1.5 py-0.5 rounded border border-canvas-border">ESC to close</kbd>
        </div>
      </div>
    </div>
  );
};
