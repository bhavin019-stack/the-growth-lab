import React, { useState } from 'react';
import { X, PlusCircle, Check } from 'lucide-react';
import { createQuickCapture } from '../../services/api';
import { QuickCapture } from '../../types';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptured: (item: QuickCapture) => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  onCaptured
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<QuickCapture['category']>('idea');
  const [targetModule, setTargetModule] = useState('Idea Canvas');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Quick']);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^#/, '');
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter(tag => tag !== t));
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    try {
      const saved = await createQuickCapture({
        content,
        category,
        tags,
        targetModule
      });
      setIsSaved(true);
      onCaptured(saved);
      setTimeout(() => {
        setIsSaved(false);
        setContent('');
        setTags(['Quick']);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Error saving quick capture:', err);
    }
  };

  const categories = [
    { id: 'idea', label: 'Idea' },
    { id: 'learning_note', label: 'Learning Note' },
    { id: 'business_observation', label: 'Business Observation' },
    { id: 'task', label: 'Task' },
    { id: 'question', label: 'Question' },
    { id: 'project_thought', label: 'Project Thought' }
  ];

  const targetModules = [
    'Idea Canvas',
    'Operations Lab',
    'Thought Builder',
    'Brand Lab',
    'MBA Hub',
    'Project Incubator',
    'LinkedIn Drafts'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-canvas-card border border-canvas-border w-full max-w-lg rounded-2xl shadow-warm-xl p-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-canvas-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-terracotta-100 text-terracotta-700 flex items-center justify-center font-bold">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-charcoal-900 text-sm">Quick Capture</h3>
              <p className="text-[11px] text-charcoal-500">Capture now • Organize into your learning studio later</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:bg-canvas rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="py-4 space-y-4">
          {/* Category Chips */}
          <div>
            <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id as any)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    category === c.id
                      ? 'bg-terracotta-50 border-terracotta-300 text-terracotta-700 font-semibold'
                      : 'bg-canvas-subtle border-canvas-border text-charcoal-600 hover:border-canvas-border-strong'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1.5">
              What are you thinking, observing, or learning?
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Bottleneck during fulfillment happens when packing benches wait on the shared printer..."
              className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-3 text-xs md:text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all placeholder:text-charcoal-400"
              autoFocus
            />
          </div>

          {/* Module Routing & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1.5">
                Route to Module
              </label>
              <select
                value={targetModule}
                onChange={(e) => setTargetModule(e.target.value)}
                className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2 text-xs text-charcoal-800 focus:outline-none focus:border-terracotta-500"
              >
                {targetModules.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1.5">
                Tags (Press Enter)
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="e.g. Ops, PM2..."
                className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2 text-xs text-charcoal-800 focus:outline-none focus:border-terracotta-500"
              />
            </div>
          </div>

          {/* Active Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-[10px] bg-canvas-subtle border border-canvas-border px-2 py-0.5 rounded-md text-charcoal-600"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-terracotta-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-canvas-border flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 rounded-xl hover:bg-canvas-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!content.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-40 text-white shadow-warm-sm transition-all"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            <span>{isSaved ? 'Captured!' : 'Save Capture'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
