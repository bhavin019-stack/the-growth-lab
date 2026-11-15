import React, { useState } from 'react';
import { 
  Compass, 
  BookOpen, 
  ExternalLink, 
  Bookmark, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  Share2, 
  Briefcase, 
  FileCheck, 
  Lightbulb, 
  Layers, 
  Copy, 
  Check, 
  Trash2,
  FolderKanban,
  UserCheck
} from 'lucide-react';
import { AppState, BrandObservation, CuratedResource, InterviewStory, ProofOfWorkProject, LinkedInDraft } from '../types';
import { 
  saveBrandObservation, 
  saveLinkedInDraft, 
  saveProofOfWork, 
  saveInterviewStory, 
  saveIdeaCanvas, 
  saveProjectIncubator 
} from '../services/api';

interface ExploreViewProps {
  appState: AppState;
  onStateUpdate: (updater: (prev: AppState) => AppState) => void;
  onOpenAICoach: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  appState,
  onStateUpdate,
  onOpenAICoach
}) => {
  const [subTab, setSubTab] = useState<'library' | 'brand-lab' | 'idea-canvas' | 'linkedin' | 'career-compass' | 'story-bank' | 'proof-of-work' | 'incubator'>('library');

  // Library Filters
  const [libCategory, setLibCategory] = useState<string>('all');
  const [libType, setLibType] = useState<string>('all');

  // Brand Lab Form
  const [brandName, setBrandName] = useState('');
  const [brandCategory, setBrandCategory] = useState('FMCG');
  const [targetAudience, setTargetAudience] = useState('');
  const [positioning, setPositioning] = useState('');
  const [consumerBehavior, setConsumerBehavior] = useState('');
  const [competitorComparison, setCompetitorComparison] = useState('');
  const [rationale, setRationale] = useState('');

  // LinkedIn Builder Form
  const [liLearned, setLiLearned] = useState('');
  const [liReflection, setLiReflection] = useState('');
  const [liExample, setLiExample] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Story Bank Form
  const [storyTitle, setStoryTitle] = useState('');
  const [storyCompetency, setStoryCompetency] = useState('Cross-Functional Leadership');
  const [storyRole, setStoryRole] = useState('Operations Management');
  const [storyS, setStoryS] = useState('');
  const [storyT, setStoryT] = useState('');
  const [storyA, setStoryA] = useState('');
  const [storyR, setStoryR] = useState('');

  // Proof of Work Form
  const [powTitle, setPowTitle] = useState('');
  const [powProblem, setPowProblem] = useState('');
  const [powSolution, setPowSolution] = useState('');
  const [powImpact, setPowImpact] = useState('');

  // Idea Canvas State
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardContent, setNewCardContent] = useState('');

  const filteredLibrary = appState.curatedLibrary.filter(item => {
    const matchCat = libCategory === 'all' || item.category === libCategory;
    const matchType = libType === 'all' || item.type === libType;
    return matchCat && matchType;
  });

  const handleSaveBrandObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    const observation: Partial<BrandObservation> = {
      brandName,
      category: brandCategory,
      targetAudience,
      positioning,
      consumerBehavior,
      competitorComparison,
      rationale,
      aiFeedback: "Strong analytical breakdown. Notice how their distinctive brand assets reinforce cognitive availability at point-of-sale."
    };

    const saved = await saveBrandObservation(observation);
    onStateUpdate(prev => ({
      ...prev,
      brandLabObservations: [saved, ...prev.brandLabObservations]
    }));

    setBrandName('');
    setTargetAudience('');
    setPositioning('');
    setConsumerBehavior('');
    setCompetitorComparison('');
    setRationale('');
  };

  const handleGenerateLinkedInPost = async () => {
    if (!liLearned.trim()) return;
    const draftContent = 
      `A critical lesson from our recent MBA study on ${liLearned}:\n\n` +
      `${liReflection || 'Most organizations optimize for immediate speed at the expense of consistent quality.'}\n\n` +
      `Here is a concrete example:\n${liExample || 'When customer support metrics incentivize call volume rather than resolution, customer lifetime value declines by 20%.'}\n\n` +
      `Key Takeaway for leaders:\nBefore scaling an operational workflow, ensure the underlying incentives protect the customer experience.\n\n` +
      `#Leadership #Operations #ProductStrategy #TheGrowthLab`;

    setGeneratedPost(draftContent);
    await saveLinkedInDraft({
      title: `Learning Reflection on ${liLearned.slice(0, 30)}`,
      content: draftContent,
      sourceNote: "Created via Learn-to-LinkedIn workflow",
      status: "ready_to_share"
    });
  };

  const handleCopyPost = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  const handleSaveInterviewStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle.trim()) return;

    const newStory: Partial<InterviewStory> = {
      title: storyTitle,
      framework: 'STAR',
      competency: storyCompetency,
      roleCategory: storyRole,
      situation: storyS,
      task: storyT,
      action: storyA,
      result: storyR,
      conciseVersion: `${storyS.slice(0, 80)}... Taking decisive action, I ${storyA.slice(0, 80)}... achieving ${storyR.slice(0, 80)}.`
    };

    const saved = await saveInterviewStory(newStory);
    onStateUpdate(prev => ({
      ...prev,
      interviewStories: [saved, ...prev.interviewStories]
    }));

    setStoryTitle('');
    setStoryS('');
    setStoryT('');
    setStoryA('');
    setStoryR('');
  };

  const handleAddCanvasCard = async () => {
    if (!newCardTitle.trim()) return;
    const newCard = {
      id: `ic-${Date.now()}`,
      x: 50 + (appState.ideaCanvas.cards.length % 3) * 200,
      y: 50 + Math.floor(appState.ideaCanvas.cards.length / 3) * 150,
      title: newCardTitle,
      content: newCardContent,
      color: '#FEF3C7',
      category: 'Idea'
    };

    const updated = {
      ...appState.ideaCanvas,
      cards: [...appState.ideaCanvas.cards, newCard]
    };

    onStateUpdate(prev => ({ ...prev, ideaCanvas: updated }));
    await saveIdeaCanvas(updated);
    setNewCardTitle('');
    setNewCardContent('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header & Sub-Nav */}
      <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-charcoal-900 font-sans tracking-tight">
              Explore & Build
            </h1>
            <p className="text-xs md:text-sm text-charcoal-500 font-medium">
              Convert learning into creative brand insights, LinkedIn reflections, and demonstrable portfolio proof-of-work.
            </p>
          </div>
          <button
            onClick={onOpenAICoach}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-50 hover:bg-ink-100 text-ink-700 text-xs font-semibold rounded-xl border border-ink-100 shadow-warm-sm self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-ink-600" />
            <span>AI Brainstorm Partner</span>
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-bold border-b border-canvas-border">
          {[
            { id: 'library', label: 'Curated Learning Library', icon: BookOpen },
            { id: 'brand-lab', label: 'Brand Lab', icon: Lightbulb },
            { id: 'idea-canvas', label: 'Idea Canvas', icon: Layers },
            { id: 'linkedin', label: 'Learning-to-LinkedIn', icon: Share2 },
            { id: 'career-compass', label: 'Career Compass (10 Roles)', icon: Compass },
            { id: 'story-bank', label: 'Interview Story Bank', icon: UserCheck },
            { id: 'proof-of-work', label: 'Proof-of-Work Portfolio', icon: Briefcase },
            { id: 'incubator', label: 'Project Incubator', icon: FolderKanban }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-ochre-600 text-white shadow-warm-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-canvas-subtle'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. CURATED LEARNING LIBRARY */}
      {/* ======================================================== */}
      {subTab === 'library' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-canvas-card p-3 rounded-xl border border-canvas-border text-xs">
            <div className="flex items-center gap-2">
              <span className="text-charcoal-500 font-bold">Category:</span>
              {['all', 'Brand Strategy', 'Operations & Process', 'Business Knowledge', 'Consumer Understanding'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLibCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg border font-medium ${
                    libCategory === cat
                      ? 'bg-ochre-50 border-ochre-300 text-ochre-700 font-bold'
                      : 'bg-canvas-subtle border-canvas-border text-charcoal-600'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLibType('all')}
                className={`px-2.5 py-1 rounded-lg border ${libType === 'all' ? 'bg-charcoal-800 text-white' : 'bg-canvas-subtle border-canvas-border text-charcoal-600'}`}
              >
                All
              </button>
              <button
                onClick={() => setLibType('article')}
                className={`px-2.5 py-1 rounded-lg border ${libType === 'article' ? 'bg-charcoal-800 text-white' : 'bg-canvas-subtle border-canvas-border text-charcoal-600'}`}
              >
                Articles
              </button>
              <button
                onClick={() => setLibType('video')}
                className={`px-2.5 py-1 rounded-lg border ${libType === 'video' ? 'bg-charcoal-800 text-white' : 'bg-canvas-subtle border-canvas-border text-charcoal-600'}`}
              >
                Videos
              </button>
            </div>
          </div>

          {/* Inspiration Board Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLibrary.map((item) => (
              <div
                key={item.id}
                className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm flex flex-col justify-between space-y-3 hover:shadow-warm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-ochre-700 bg-ochre-50 px-2 py-0.5 rounded border border-ochre-200">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-charcoal-400 font-semibold">
                      {item.readTimeMinutes} mins • {item.type.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm md:text-base text-charcoal-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-charcoal-500 font-medium mt-0.5">
                    By <strong>{item.author}</strong> • {item.source}
                  </p>
                  <p className="text-xs text-charcoal-600 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-canvas-border flex items-center justify-between">
                  <span className="text-[11px] text-charcoal-400">Credible curated source</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-ochre-600 hover:text-ochre-700 bg-ochre-50 hover:bg-ochre-100 px-3 py-1.5 rounded-xl border border-ochre-200 transition-colors"
                  >
                    <span>Read / Watch Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. BRAND LAB */}
      {/* ======================================================== */}
      {subTab === 'brand-lab' && (
        <div className="space-y-5 animate-fade-in">
          {/* Today's Brand Observation Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-warm-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                Today's Daily Brand Challenge
              </span>
              <h3 className="font-bold text-sm text-charcoal-900">
                Liquid Death: Murdering Thirst with FMCG Category Disruption
              </h3>
              <p className="text-xs text-charcoal-600">
                How did a simple canned water brand command a $1.4B valuation without changing the underlying chemical liquid?
              </p>
            </div>
            <button
              onClick={() => {
                setBrandName('Liquid Death');
                setBrandCategory('Beverage / CPG');
                setPositioning('Mountain water packaged like heavy-metal beer.');
                setConsumerBehavior('Social signaling of irreverence and healthy lifestyle.');
              }}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-warm-sm transition-all shrink-0"
            >
              Analyze This Case
            </button>
          </div>

          {/* New Observation Form */}
          <form onSubmit={handleSaveBrandObservation} className="bg-canvas-card border border-canvas-border rounded-2xl p-6 shadow-warm-sm space-y-4">
            <h3 className="font-bold text-sm text-charcoal-900">Record a Real Brand Observation</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Duolingo, Ikea, Patagonia..."
                  className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                  Industry / Category
                </label>
                <input
                  type="text"
                  value={brandCategory}
                  onChange={(e) => setBrandCategory(e.target.value)}
                  placeholder="e.g. Consumer Tech, Retail..."
                  className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                  Target Audience & Mental Availability
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Who are they targeting and what cue triggers purchase?..."
                  className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                  Positioning & Differentiation
                </label>
                <input
                  type="text"
                  value={positioning}
                  onChange={(e) => setPositioning(e.target.value)}
                  placeholder="What trade-off are they making versus incumbents?..."
                  className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                Strategic Rationale (Why does this work?)
              </label>
              <textarea
                rows={2}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Explain the consumer psychology or unit economics behind this decision..."
                className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!brandName.trim()}
                className="px-5 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-warm-sm transition-all"
              >
                Save Brand Observation
              </button>
            </div>
          </form>

          {/* Saved Observations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appState.brandLabObservations.map((obs) => (
              <div key={obs.id} className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-charcoal-900 text-sm">{obs.brandName}</h4>
                  <span className="text-[10px] bg-canvas-subtle px-2 py-0.5 rounded text-charcoal-500 border border-canvas-border">{obs.category}</span>
                </div>
                <p className="text-charcoal-700"><strong>Positioning:</strong> {obs.positioning}</p>
                <p className="text-charcoal-700"><strong>Rationale:</strong> {obs.rationale}</p>
                {obs.aiFeedback && (
                  <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 text-[11px]">
                    <strong>AI Perspective:</strong> {obs.aiFeedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. IDEA CANVAS */}
      {/* ======================================================== */}
      {subTab === 'idea-canvas' && (
        <div className="space-y-4 animate-fade-in">
          {/* Add Idea Card */}
          <div className="bg-canvas-card border border-canvas-border rounded-2xl p-4 shadow-warm-sm flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Idea concept title..."
              className="bg-canvas-subtle border border-canvas-border rounded-xl px-3 py-2 text-xs text-charcoal-900 flex-1"
            />
            <input
              type="text"
              value={newCardContent}
              onChange={(e) => setNewCardContent(e.target.value)}
              placeholder="Observation or insight..."
              className="bg-canvas-subtle border border-canvas-border rounded-xl px-3 py-2 text-xs text-charcoal-900 flex-1"
            />
            <button
              onClick={handleAddCanvasCard}
              className="px-4 py-2 bg-charcoal-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all"
            >
              + Add Idea Card
            </button>
          </div>

          {/* Interactive Idea Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {appState.ideaCanvas.cards.map((card) => (
              <div
                key={card.id}
                className="bg-canvas-card border-2 border-canvas-border rounded-2xl p-4 shadow-warm-sm space-y-2 hover:border-terracotta-400 transition-all text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-terracotta-700 bg-terracotta-50 px-2 py-0.5 rounded border border-terracotta-200">
                    {card.category}
                  </span>
                </div>
                <h4 className="font-bold text-charcoal-900 text-sm">{card.title}</h4>
                <p className="text-charcoal-600 leading-relaxed">{card.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. LEARNING-TO-LINKEDIN */}
      {/* ======================================================== */}
      {subTab === 'linkedin' && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-canvas-card border border-canvas-border rounded-2xl p-6 shadow-warm-sm space-y-4">
            <div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Learn → Reflect → Organize → Create → Share
              </span>
              <h2 className="text-base font-bold text-charcoal-900 mt-1">
                Learning-to-LinkedIn Post Generator
              </h2>
              <p className="text-xs text-charcoal-500">
                Converts genuine course insights and operational observations into natural, thoughtful posts without cringey motivational fluff.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                  1. What Did You Learn?
                </label>
                <input
                  type="text"
                  value={liLearned}
                  onChange={(e) => setLiLearned(e.target.value)}
                  placeholder="e.g. Sunk cost fallacy in IT projects..."
                  className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                  2. Your Personal Interpretation
                </label>
                <input
                  type="text"
                  value={liReflection}
                  onChange={(e) => setLiReflection(e.target.value)}
                  placeholder="e.g. Leaders hesitate to kill bad features..."
                  className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                  3. Concrete Example
                </label>
                <input
                  type="text"
                  value={liExample}
                  onChange={(e) => setLiExample(e.target.value)}
                  placeholder="e.g. Sunk $500k into an internal tool..."
                  className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerateLinkedInPost}
                disabled={!liLearned.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-warm-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Generate Thoughtful Draft</span>
              </button>
            </div>
          </div>

          {/* Generated Post Box */}
          {generatedPost && (
            <div className="bg-canvas-card border border-canvas-border rounded-2xl p-6 shadow-warm-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-canvas-border pb-3">
                <span className="text-xs font-bold text-charcoal-900">
                  LinkedIn Post Preview
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPost}
                    className="flex items-center gap-1 text-xs text-charcoal-700 bg-canvas-subtle hover:bg-canvas-card border border-canvas-border px-3 py-1.5 rounded-lg font-semibold"
                  >
                    {copiedNotice ? <Check className="w-3.5 h-3.5 text-forest-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNotice ? 'Copied!' : 'Copy Post'}</span>
                  </button>

                  <a
                    href="https://www.linkedin.com/feed/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg font-semibold border border-blue-200"
                  >
                    <span>Open LinkedIn</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <textarea
                rows={8}
                value={generatedPost}
                onChange={(e) => setGeneratedPost(e.target.value)}
                className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-4 text-xs md:text-sm text-charcoal-900 font-sans leading-relaxed focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. CAREER COMPASS */}
      {/* ======================================================== */}
      {subTab === 'career-compass' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm">
            <h2 className="text-base font-bold text-charcoal-900">MBA Career Compass</h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Target role skill gap analysis across Operations, Product Management, and Strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {appState.careerCompass.targetRoles.map((role) => (
              <div key={role.id} className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded border border-forest-200">
                      {role.matchScore}% Match
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-charcoal-900 leading-snug">
                    {role.title}
                  </h3>

                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-forest-700 block">Demonstrated Strengths:</span>
                      <p className="text-charcoal-700">{role.userStrengths.join(', ')}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-terracotta-700 block">Target Skill Gaps:</span>
                      <p className="text-charcoal-700">{role.gaps.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-canvas-border">
                  <span className="text-[10px] text-charcoal-400 block mb-1">Recommended Tracks:</span>
                  <div className="flex flex-wrap gap-1">
                    {role.recommendedTracks.map((tr, i) => (
                      <span key={i} className="text-[10px] bg-canvas-subtle px-2 py-0.5 rounded text-charcoal-600 border border-canvas-border">
                        {tr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. INTERVIEW STORY BANK */}
      {/* ======================================================== */}
      {subTab === 'story-bank' && (
        <div className="space-y-5 animate-fade-in">
          {/* New Story Form */}
          <form onSubmit={handleSaveInterviewStory} className="bg-canvas-card border border-canvas-border rounded-2xl p-6 shadow-warm-sm space-y-4">
            <h3 className="font-bold text-sm text-charcoal-900">Add Genuine Experience to Story Bank (STAR)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="Story Title (e.g. Resolving Warehouse Delays)..."
                className="bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
              />
              <input
                type="text"
                value={storyCompetency}
                onChange={(e) => setStoryCompetency(e.target.value)}
                placeholder="Competency (e.g. Crisis Management)..."
                className="bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
              />
              <input
                type="text"
                value={storyRole}
                onChange={(e) => setStoryRole(e.target.value)}
                placeholder="Role Category (e.g. Operations Mgmt)..."
                className="bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <textarea
                rows={2}
                value={storyS}
                onChange={(e) => setStoryS(e.target.value)}
                placeholder="Situation: Context & challenges..."
                className="bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-charcoal-900"
              />
              <textarea
                rows={2}
                value={storyT}
                onChange={(e) => setStoryT(e.target.value)}
                placeholder="Task: What was expected of you..."
                className="bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-charcoal-900"
              />
              <textarea
                rows={2}
                value={storyA}
                onChange={(e) => setStoryA(e.target.value)}
                placeholder="Action: Step-by-step initiative you took..."
                className="bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-charcoal-900"
              />
              <textarea
                rows={2}
                value={storyR}
                onChange={(e) => setStoryR(e.target.value)}
                placeholder="Result: Quantifiable impact achieved..."
                className="bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-charcoal-900"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!storyTitle.trim()}
                className="px-5 py-2.5 bg-forest-600 hover:bg-forest-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-warm-sm transition-all"
              >
                Save STAR Story
              </button>
            </div>
          </form>

          {/* Stories List */}
          <div className="space-y-4">
            {appState.interviewStories.map((st) => (
              <div key={st.id} className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-canvas-border pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                      {st.competency}
                    </span>
                    <h4 className="font-bold text-sm text-charcoal-900 mt-1">{st.title}</h4>
                  </div>
                  <span className="text-[10px] text-charcoal-400 font-semibold">{st.roleCategory}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-charcoal-700">
                  <div className="p-2.5 rounded-lg bg-canvas-subtle">
                    <strong className="block text-charcoal-900">Situation:</strong>
                    <p className="mt-0.5">{st.situation}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-canvas-subtle">
                    <strong className="block text-charcoal-900">Task:</strong>
                    <p className="mt-0.5">{st.task}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-canvas-subtle">
                    <strong className="block text-charcoal-900">Action:</strong>
                    <p className="mt-0.5">{st.action}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-canvas-subtle">
                    <strong className="block text-forest-800">Result:</strong>
                    <p className="mt-0.5 font-medium">{st.result}</p>
                  </div>
                </div>

                {st.aiFollowUp && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                    <strong>AI Follow-Up Interview Question:</strong> "{st.aiFollowUp}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. PROOF OF WORK PORTFOLIO */}
      {/* ======================================================== */}
      {subTab === 'proof-of-work' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm">
            <h2 className="text-base font-bold text-charcoal-900">Career Proof-of-Work Portfolio</h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Demonstrable, tangible business projects proving real capability to recruiters.
            </p>
          </div>

          <div className="space-y-4">
            {appState.proofOfWorkProjects.map((pow) => (
              <div key={pow.id} className="bg-canvas-card border border-canvas-border rounded-2xl p-6 shadow-warm-sm space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-canvas-border pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-terracotta-700 bg-terracotta-50 px-2 py-0.5 rounded border border-terracotta-200">
                      {pow.category}
                    </span>
                    <h3 className="font-bold text-base text-charcoal-900 mt-1">{pow.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200">
                    {pow.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong className="text-charcoal-900 block mb-0.5">Problem Statement:</strong>
                    <p className="text-charcoal-600 leading-relaxed">{pow.problemStatement}</p>
                  </div>

                  <div>
                    <strong className="text-charcoal-900 block mb-0.5">Objective:</strong>
                    <p className="text-charcoal-600 leading-relaxed">{pow.objective}</p>
                  </div>

                  <div>
                    <strong className="text-charcoal-900 block mb-0.5">Proposed Solution:</strong>
                    <p className="text-charcoal-600 leading-relaxed">{pow.proposedSolution}</p>
                  </div>

                  <div>
                    <strong className="text-forest-800 block mb-0.5">Demonstrated Impact:</strong>
                    <p className="text-forest-900 font-medium leading-relaxed">{pow.impact}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-canvas-border flex flex-wrap gap-1">
                  {pow.skillsDemonstrated.map((sk, i) => (
                    <span key={i} className="text-[10px] font-semibold bg-canvas-subtle px-2 py-0.5 rounded text-charcoal-700 border border-canvas-border">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. PROJECT INCUBATOR */}
      {/* ======================================================== */}
      {subTab === 'incubator' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm">
            <h2 className="text-base font-bold text-charcoal-900">Project Incubator</h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Turn observations from Brand Lab and Operations Lab into structured deliverables.
            </p>
          </div>

          <div className="space-y-4">
            {appState.projectIncubator.map((proj) => (
              <div key={proj.id} className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-canvas-border pb-2.5">
                  <div>
                    <span className="text-[10px] text-charcoal-400 block">Origin: {proj.origin}</span>
                    <h3 className="font-bold text-sm text-charcoal-900">{proj.title}</h3>
                  </div>
                  <span className="text-[10px] font-bold text-ochre-700 bg-ochre-50 px-2 py-0.5 rounded border border-ochre-200">
                    IN PROGRESS
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-charcoal-700">
                  <p><strong>Problem:</strong> {proj.problem}</p>
                  <p><strong>Objective:</strong> {proj.objective}</p>
                </div>

                {/* Milestones */}
                <div>
                  <strong className="text-charcoal-900 block mb-1">Milestones:</strong>
                  <div className="space-y-1">
                    {proj.milestones.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-canvas-subtle border border-canvas-border">
                        {m.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-charcoal-400" />
                        )}
                        <span className={m.completed ? 'line-through text-charcoal-400' : 'text-charcoal-800'}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
