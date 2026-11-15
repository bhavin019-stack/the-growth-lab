import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Layers, 
  FileText, 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Search, 
  BookOpen, 
  Scale, 
  BarChart3, 
  HelpCircle, 
  ChevronRight, 
  TrendingUp, 
  Trash2,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { AppState, SOP, ProcessMap, ThoughtBuilderEntry, CommunicationAttempt, VocabularyCard } from '../types';
import { 
  saveCommunicationAttempt, 
  saveThoughtBuilder, 
  saveSOP, 
  saveProcessMap, 
  resolveSimulation, 
  submitDecision, 
  saveDecisionJournal, 
  saveVocabulary, 
  requestAITranscriptEvaluation, 
  requestAIThoughtStructure, 
  requestAISopDraft, 
  requestAIDecisionCritique 
} from '../services/api';

interface SkillStudioViewProps {
  appState: AppState;
  onStateUpdate: (updater: (prev: AppState) => AppState) => void;
  onOpenAICoach: () => void;
}

export const SkillStudioView: React.FC<SkillStudioViewProps> = ({
  appState,
  onStateUpdate,
  onOpenAICoach
}) => {
  const [activeTab, setActiveTab] = useState<'comm-gym' | 'thought-builder' | 'skill-tracks' | 'ops-lab' | 'comm-intel' | 'decision-room' | 'analytics-lab'>('comm-gym');

  // ==========================================
  // A. COMMUNICATION GYM STATE
  // ==========================================
  const [gymMode, setGymMode] = useState<3 | 5 | 10>(5);
  const [gymCategory, setGymCategory] = useState('Explaining Business Concepts');
  const [gymPrompt, setGymPrompt] = useState('Explain the concept of Opportunity Cost to a startup founder deciding whether to hire a senior engineer or spend on marketing.');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [gymFeedback, setGymFeedback] = useState<any>(null);
  const [gymSaving, setGymSaving] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Timer for recording
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(recordingTimerRef.current);
    }
    return () => clearInterval(recordingTimerRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setAudioUrl(null);
      setGymFeedback(null);
      setSpeechTranscript('');
      setRecordingSeconds(0);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone permission was not granted or not supported in this browser. You can still type your speech response in the transcript box below for full AI feedback!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleEvaluateGymAttempt = async () => {
    const textToEvaluate = speechTranscript.trim() || "When deciding to hire an engineer versus spending on paid marketing, opportunity cost represents the highest-value alternative forgone. Basically, the money spent on paid ads cannot simultaneously build the core proprietary product features that retain users.";
    setGymSaving(true);
    try {
      const evalResult = await requestAITranscriptEvaluation(textToEvaluate);
      setGymFeedback(evalResult);

      const savedAttempt = await saveCommunicationAttempt({
        prompt: gymPrompt,
        durationSeconds: recordingSeconds || 60,
        transcript: textToEvaluate,
        category: gymCategory,
        audioData: audioUrl
      });

      onStateUpdate(prev => ({
        ...prev,
        communicationAttempts: [savedAttempt, ...prev.communicationAttempts]
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setGymSaving(false);
    }
  };

  // ==========================================
  // B. THOUGHT BUILDER STATE
  // ==========================================
  const [tbFramework, setTbFramework] = useState<'PRE' | 'PAS' | 'STAR' | 'CEC'>('PRE');
  const [tbTitle, setTbTitle] = useState('');
  const [tbRaw, setTbRaw] = useState('');
  const [tbResult, setTbResult] = useState<any>(null);
  const [tbLoading, setTbLoading] = useState(false);

  const handleStructureThought = async () => {
    if (!tbRaw.trim()) return;
    setTbLoading(true);
    try {
      const res = await requestAIThoughtStructure(tbRaw, tbFramework);
      setTbResult(res);

      const newEntry = await saveThoughtBuilder({
        title: tbTitle || "Structured Executive Argument",
        rawInput: tbRaw,
        framework: tbFramework,
        structured: res
      });

      onStateUpdate(prev => ({
        ...prev,
        thoughtBuilderEntries: [newEntry, ...prev.thoughtBuilderEntries]
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setTbLoading(false);
    }
  };

  // ==========================================
  // C. OPERATIONS LAB STATE
  // ==========================================
  const [opsSubTab, setOpsSubTab] = useState<'process-maps' | 'sop-builder' | 'toolkit' | 'simulations' | 'metrics'>('process-maps');

  // SOP Builder State
  const [sopTitle, setSopTitle] = useState('');
  const [sopDesc, setSopDesc] = useState('');
  const [activeSop, setActiveSop] = useState<SOP | null>(appState.operationsLab.sops[0] || null);
  const [sopDrafting, setSopDrafting] = useState(false);

  const handleGenerateSopAI = async () => {
    if (!sopDesc.trim()) return;
    setSopDrafting(true);
    try {
      const draft = await requestAISopDraft(sopTitle || "Standard Operations Procedure", sopDesc);
      setActiveSop(draft as any);
      await saveSOP(draft);
      onStateUpdate(prev => ({
        ...prev,
        operationsLab: {
          ...prev.operationsLab,
          sops: [draft as any, ...prev.operationsLab.sops]
        }
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setSopDrafting(false);
    }
  };

  // Process Mapping Studio State
  const [activeMap, setActiveMap] = useState<ProcessMap>(appState.operationsLab.processMaps[0]);
  const [newStepLabel, setNewStepLabel] = useState('');
  const [newStepOwner, setNewStepOwner] = useState('Frontline Agent');
  const [newStepType, setNewStepType] = useState<ProcessMap['steps'][0]['type']>('step');

  const handleAddMapStep = async () => {
    if (!newStepLabel.trim()) return;
    const newStep = {
      id: `s-${Date.now()}`,
      label: newStepLabel,
      type: newStepType,
      owner: newStepOwner,
      inputs: "Previous step handover",
      outputs: "Verified output",
      isBottleneck: false
    };

    const updated = {
      ...activeMap,
      steps: [...activeMap.steps, newStep]
    };
    setActiveMap(updated);
    setNewStepLabel('');
    await saveProcessMap(updated);
  };

  const toggleBottleneck = async (stepId: string) => {
    const updated = {
      ...activeMap,
      steps: activeMap.steps.map(s => s.id === stepId ? { ...s, isBottleneck: !s.isBottleneck } : s)
    };
    setActiveMap(updated);
    await saveProcessMap(updated);
  };

  // Operations 5 Whys state
  const [whysProblem, setWhysProblem] = useState('Order delivery delays spiked by 35% in Zone North.');
  const [whysSteps, setWhysSteps] = useState([
    { why: 1, text: "Dispatch was waiting 40 minutes for packing invoices to print." },
    { why: 2, text: "The solitary shared printer ran out of thermal paper rolls." },
    { why: 3, text: "Inventory for consumables was reordered only when the shelf was completely empty." },
    { why: 4, text: "There was no reorder point (ROP) trigger in the warehouse ERP." },
    { why: 5, text: "Procurement treated packaging consumables as discretionary rather than critical BOM." }
  ]);

  // Operations Metrics Library (12 complete operations metrics)
  const operationsMetrics = [
    { code: "SLA", name: "Service Level Agreement", formula: "(Requests met within agreed timeframe / Total requests) × 100", example: "98.5% tickets resolved within 2 hours.", category: "Service Quality" },
    { code: "TAT", name: "Turnaround Time", formula: "Completion Time - Initiation Time", example: "Average delivery turnaround from order to doorstep = 24.5 hrs.", category: "Speed" },
    { code: "FCR", name: "First Contact Resolution", formula: "(Inquiries resolved on 1st interaction / Total inquiries) × 100", example: "FCR = 78% (Target > 80%).", category: "Quality" },
    { code: "AHT", name: "Average Handling Time", formula: "(Talk Time + Hold Time + Wrap-up Time) / Total Calls", example: "AHT = 4 mins 30 secs.", category: "Efficiency" },
    { code: "CSAT", name: "Customer Satisfaction Score", formula: "(Positive Responses / Total Responses) × 100", example: "CSAT = 88% based on post-resolution survey.", category: "Customer" },
    { code: "NPS", name: "Net Promoter Score", formula: "% Promoters (9-10) - % Detractors (0-6)", example: "NPS = +42 in enterprise B2B accounts.", category: "Customer" },
    { code: "Cycle Time", name: "Process Cycle Time", formula: "Total Duration from Start to Delivery of 1 Unit", example: "Package packing cycle time cut from 18m to 9m.", category: "Flow" },
    { code: "Throughput", name: "Throughput Rate", formula: "Units Produced or Processed / Unit Time", example: "1,250 parcels dispatched per hour during peak.", category: "Volume" },
    { code: "Productivity", name: "Labor Productivity", formula: "Output Produced / Total Labor Hours Worked", example: "18.2 completed reconciliations per analyst-hour.", category: "Efficiency" },
    { code: "Capacity Util", name: "Capacity Utilization", formula: "(Actual Output / Potential Maximum Output) × 100", example: "Warehouse operating at 88% capacity utilization.", category: "Resource" },
    { code: "Defect Rate", name: "Defect Rate (DPMO)", formula: "(Total Defects / Total Opportunities) × 1,000,000", example: "Order defect rate = 0.4% (4,000 DPMO).", category: "Quality" },
    { code: "CPT", name: "Cost Per Transaction", formula: "Total Operating Costs / Total Volume Processed", example: "$1.45 per automated payment transaction.", category: "Financial" }
  ];

  // ==========================================
  // D. DECISION ROOM STATE
  // ==========================================
  const [selectedChallenge, setSelectedChallenge] = useState(appState.decisionRoom[0]);
  const [userDecisionChoice, setUserDecisionChoice] = useState('');
  const [decisionRationale, setDecisionRationale] = useState('');
  const [decisionAssumptions, setDecisionAssumptions] = useState('');
  const [decisionTradeOffs, setDecisionTradeOffs] = useState('');
  const [decisionCritique, setDecisionCritique] = useState<any>(null);

  const handleSubmitDecision = async () => {
    if (!decisionRationale.trim()) return;
    try {
      const critique = await requestAIDecisionCritique({
        choice: userDecisionChoice,
        rationale: decisionRationale,
        assumptions: decisionAssumptions,
        tradeOffs: decisionTradeOffs
      });
      setDecisionCritique(critique);

      await submitDecision(selectedChallenge.id, {
        decision: userDecisionChoice,
        rationale: decisionRationale,
        evidence: "Historical cohort retention metrics",
        assumptions: decisionAssumptions,
        tradeOffs: decisionTradeOffs
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // E. VOCABULARY BUILDER STATE
  // ==========================================
  const [newVocOriginal, setNewVocOriginal] = useState('');
  const [newVocMeaning, setNewVocMeaning] = useState('');
  const [newVocWord, setNewVocWord] = useState('');
  const [newVocImproved, setNewVocImproved] = useState('');
  const [newVocCategory, setNewVocCategory] = useState('Professional');

  const handleAddVocabulary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVocOriginal.trim() || !newVocWord.trim()) return;

    const newCard: Partial<VocabularyCard> = {
      originalSentence: newVocOriginal,
      intendedMeaning: newVocMeaning || 'Concise business phrasing',
      betterWord: newVocWord,
      improvedSentence: newVocImproved || newVocOriginal,
      category: newVocCategory,
      mastery: 'Learning'
    };

    const saved = await saveVocabulary(newCard);
    onStateUpdate(prev => ({
      ...prev,
      communicationIntelligence: {
        ...prev.communicationIntelligence,
        vocabulary: [saved, ...prev.communicationIntelligence.vocabulary]
      }
    }));

    setNewVocOriginal('');
    setNewVocMeaning('');
    setNewVocWord('');
    setNewVocImproved('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Studio Header & Sub-Navigation */}
      <div className="bg-canvas-card border border-canvas-border rounded-2xl p-4 md:p-5 shadow-warm-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-charcoal-900 font-sans tracking-tight">
              Skill Studio
            </h1>
            <p className="text-xs md:text-sm text-charcoal-500 font-medium">
              Where capability is trained through practice, critical thinking, and real business cases.
            </p>
          </div>
          <button
            onClick={onOpenAICoach}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ink-50 hover:bg-ink-100 border border-ink-100 text-ink-700 text-xs font-semibold shadow-warm-sm transition-all self-start sm:self-auto"
          >
            <BrainCircuit className="w-4 h-4 text-ink-600" />
            <span>AI Sparring Coach</span>
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-bold border-b border-canvas-border">
          {[
            { id: 'comm-gym', label: 'Communication Gym', icon: Mic },
            { id: 'thought-builder', label: 'Thought Builder', icon: BrainCircuit },
            { id: 'skill-tracks', label: '6 Career Tracks', icon: TrendingUp },
            { id: 'ops-lab', label: 'Operations & Process Lab', icon: Layers },
            { id: 'comm-intel', label: 'Communication Intelligence', icon: Sparkles },
            { id: 'decision-room', label: 'Decision Room', icon: Scale },
            { id: 'analytics-lab', label: 'Business Analytics Lab', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-terracotta-500 text-white shadow-warm-sm'
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
      {/* 1. COMMUNICATION GYM */}
      {/* ======================================================== */}
      {activeTab === 'comm-gym' && (
        <div className="space-y-5 animate-fade-in">
          {/* Gym Controls & Prompt */}
          <div className="bg-canvas-card border border-canvas-border rounded-2xl p-6 shadow-warm-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Practice Duration:</span>
                {[3, 5, 10].map((m) => (
                  <button
                    key={m}
                    onClick={() => setGymMode(m as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                      gymMode === m
                        ? 'bg-terracotta-500 border-terracotta-600 text-white shadow-warm-sm'
                        : 'bg-canvas-subtle border-canvas-border text-charcoal-600 hover:border-canvas-border-strong'
                    }`}
                  >
                    {m} Mins
                  </button>
                ))}
              </div>

              <select
                value={gymCategory}
                onChange={(e) => setGymCategory(e.target.value)}
                className="bg-canvas-subtle border border-canvas-border rounded-xl px-3 py-1.5 text-xs text-charcoal-800 font-semibold focus:outline-none"
              >
                <option value="Explaining Business Concepts">Explaining Business Concepts</option>
                <option value="Executive Impromptu Speaking">Executive Impromptu Speaking</option>
                <option value="Interview Answer Practice">Interview Answer Practice</option>
                <option value="Strategic Storytelling">Strategic Storytelling</option>
              </select>
            </div>

            {/* Prompt Box */}
            <div className="p-4 rounded-xl bg-canvas-subtle border border-canvas-border">
              <span className="text-[10px] font-bold text-terracotta-600 uppercase tracking-wider block mb-1">
                Your Practice Prompt
              </span>
              <p className="text-sm md:text-base font-bold text-charcoal-900 leading-snug">
                "{gymPrompt}"
              </p>
            </div>

            {/* Recording Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-warm-sm hover:scale-[1.02] transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start Voice Practice</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-warm-sm animate-pulse"
                  >
                    <Square className="w-4 h-4" />
                    <span>Stop Recording ({recordingSeconds}s)</span>
                  </button>
                )}

                {audioUrl && (
                  <audio controls src={audioUrl} className="h-9 w-60 rounded-lg shadow-warm-sm" />
                )}
              </div>

              <div className="text-xs text-charcoal-400">
                Audio is analyzed for clarity, structure, and verbal filler words.
              </div>
            </div>

            {/* Transcript Input / Edit */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
                  Speech Transcript or Typed Response
                </label>
                <span className="text-[10px] text-charcoal-400">
                  You can speak or type directly here
                </span>
              </div>
              <textarea
                rows={3}
                value={speechTranscript}
                onChange={(e) => setSpeechTranscript(e.target.value)}
                placeholder="Type or review transcribed response here (e.g. When deciding to hire an engineer vs spend on marketing...)"
                className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-3 text-xs md:text-sm text-charcoal-900 focus:outline-none focus:border-terracotta-500"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleEvaluateGymAttempt}
                disabled={gymSaving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-charcoal-900 hover:bg-black text-white font-semibold text-xs shadow-warm-sm transition-all disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{gymSaving ? 'Analyzing Attempt...' : 'Evaluate & Save Attempt'}</span>
              </button>
            </div>
          </div>

          {/* Constructive AI Feedback Display */}
          {gymFeedback && (
            <div className="bg-canvas-card border-2 border-forest-300 rounded-2xl p-5 shadow-warm-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-canvas-border pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-forest-600" />
                  <h3 className="font-bold text-charcoal-900 text-sm">
                    Objective Communication Feedback
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-charcoal-500 font-semibold">Clarity Rating:</span>
                  <span className="text-sm font-extrabold text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-lg border border-forest-200">
                    {gymFeedback.clarityScore}/100
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <span className="font-bold text-forest-800 uppercase tracking-wider text-[10px] block">
                    What Worked Well
                  </span>
                  <ul className="space-y-1 text-charcoal-700 list-disc list-inside">
                    {gymFeedback.strengths?.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-terracotta-700 uppercase tracking-wider text-[10px] block">
                    One High-Impact Improvement
                  </span>
                  <p className="text-charcoal-800 bg-terracotta-50 p-2.5 rounded-xl border border-terracotta-200">
                    {gymFeedback.improvementPriority}
                  </p>
                </div>
              </div>

              {gymFeedback.fillerWordsFound && gymFeedback.fillerWordsFound.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  <strong>Detected Filler Words:</strong> {gymFeedback.fillerWordsFound.join(', ')}. Practice replacing voiced fillers with deliberate one-second silent pauses.
                </div>
              )}
            </div>
          )}

          {/* Past Attempts Comparison */}
          <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm space-y-3">
            <h3 className="font-bold text-charcoal-900 text-sm font-sans">
              Attempt History & Comparison
            </h3>
            <div className="divide-y divide-canvas-border">
              {appState.communicationAttempts.map((att) => (
                <div key={att.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-charcoal-900 truncate">{att.prompt}</p>
                    <p className="text-charcoal-500 text-[11px] mt-0.5 line-clamp-1 italic">
                      "{att.transcript}"
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold bg-canvas-subtle px-2 py-0.5 rounded text-charcoal-600 border border-canvas-border">
                      {att.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                      {att.clarityScore} Clarity
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* B. THOUGHT BUILDER */}
      {/* ======================================================== */}
      {activeTab === 'thought-builder' && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-canvas-card border border-canvas-border rounded-2xl p-6 shadow-warm-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-charcoal-900">Thought Builder</h2>
              <p className="text-xs text-charcoal-500">
                Speak or paste unstructured ideas. The AI structures your reasoning without replacing your natural voice.
              </p>
            </div>

            {/* Framework Selector */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { id: 'PRE', label: 'Point → Reason → Example', desc: 'Direct executive answers' },
                { id: 'PAS', label: 'Problem → Analysis → Solution', desc: 'Consulting & operations cases' },
                { id: 'STAR', label: 'Situation → Action → Result', desc: 'Behavioral stories' },
                { id: 'CEC', label: 'Claim → Evidence → Conclusion', desc: 'Analytical board papers' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTbFramework(f.id as any)}
                  className={`text-left p-3 rounded-xl border transition-all text-xs flex-1 min-w-[200px] ${
                    tbFramework === f.id
                      ? 'bg-ink-500 text-white border-ink-600 shadow-warm-sm'
                      : 'bg-canvas-subtle border-canvas-border text-charcoal-700 hover:border-canvas-border-strong'
                  }`}
                >
                  <span className="font-bold block">{f.label}</span>
                  <span className={`text-[10px] ${tbFramework === f.id ? 'text-charcoal-200' : 'text-charcoal-500'}`}>
                    {f.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* Raw Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
                Unstructured Thoughts / Raw Brainstorm
              </label>
              <textarea
                rows={4}
                value={tbRaw}
                onChange={(e) => setTbRaw(e.target.value)}
                placeholder="Paste or type raw thoughts... e.g. Customer support is overloaded because clients get confused during onboarding. We should create a 2-minute video checklist instead of sending 20-page PDFs..."
                className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-3 text-xs md:text-sm text-charcoal-900 focus:outline-none focus:border-terracotta-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleStructureThought}
                disabled={!tbRaw.trim() || tbLoading}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-warm-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>{tbLoading ? 'Structuring Logic...' : 'Structure Thoughts'}</span>
              </button>
            </div>
          </div>

          {/* Side-by-Side Comparison if result exists */}
          {tbResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-canvas-card border-2 border-ink-200 rounded-2xl p-5 shadow-warm-sm animate-fade-in">
              {/* Left: Raw Input */}
              <div className="p-4 rounded-xl bg-canvas-subtle border border-canvas-border space-y-2">
                <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                  Original Raw Thought
                </span>
                <p className="text-xs text-charcoal-700 whitespace-pre-wrap leading-relaxed font-mono">
                  {tbRaw}
                </p>
              </div>

              {/* Right: Structured Output */}
              <div className="p-4 rounded-xl bg-ink-50/70 border border-ink-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-ink-700 uppercase tracking-wider block">
                    Structured Framework ({tbFramework})
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(tbResult.structuredOutput || '')}
                    className="text-[11px] text-ink-600 hover:text-ink-800 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>

                <div className="text-xs text-charcoal-900 whitespace-pre-wrap leading-relaxed font-sans font-medium">
                  {tbResult.structuredOutput}
                </div>

                {tbResult.assumptionsIdentified && (
                  <div className="mt-3 pt-3 border-t border-ink-100 text-[11px] text-charcoal-700">
                    <strong className="text-ink-800 block mb-1">Identified Assumptions:</strong>
                    <ul className="list-disc list-inside space-y-0.5">
                      {tbResult.assumptionsIdentified.map((a: string, i: number) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* C. SIX CAREER SKILL TRACKS */}
      {/* ======================================================== */}
      {activeTab === 'skill-tracks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
          {appState.skillTracks.map((track) => (
            <div key={track.id} className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-terracotta-600 bg-terracotta-50 px-2 py-0.5 rounded-full border border-terracotta-200">
                    {track.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-charcoal-700">
                    {track.progress}% Complete
                  </span>
                </div>

                <h3 className="font-bold text-base text-charcoal-900 font-sans">
                  {track.title}
                </h3>

                {/* Progress bar */}
                <div className="w-full bg-canvas-subtle rounded-full h-2 mt-2 overflow-hidden border border-canvas-border">
                  <div
                    className="bg-terracotta-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${track.progress}%` }}
                  />
                </div>

                {/* Module List */}
                <div className="mt-4 space-y-2">
                  {track.modules.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl bg-canvas-subtle border border-canvas-border flex items-center justify-between text-xs"
                    >
                      <span className={`font-medium ${m.completed ? 'text-charcoal-500 line-through' : 'text-charcoal-900'}`}>
                        {m.title}
                      </span>
                      {m.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-forest-500 shrink-0" />
                      ) : (
                        <span className="text-[10px] text-terracotta-600 font-bold bg-white px-2 py-0.5 rounded border border-terracotta-200">
                          Practice
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-canvas-border flex items-center justify-between">
                <span className="text-[11px] text-charcoal-400">Includes real business case applications</span>
                <button
                  onClick={() => {
                    const prompt = `Let's practice an exercise from track: ${track.title}. Present a realistic business challenge and ask me to apply this framework.`;
                    onOpenAICoach();
                  }}
                  className="text-xs font-bold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1"
                >
                  <span>Spar with AI</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* D. OPERATIONS & PROCESS LAB */}
      {/* ======================================================== */}
      {activeTab === 'ops-lab' && (
        <div className="space-y-5 animate-fade-in">
          {/* Sub Navigation */}
          <div className="flex gap-2 border-b border-canvas-border pb-2 text-xs font-bold overflow-x-auto">
            {[
              { id: 'process-maps', label: 'Process Mapping Studio' },
              { id: 'sop-builder', label: 'Interactive SOP Builder' },
              { id: 'toolkit', label: 'Process Improvement Toolkit' },
              { id: 'simulations', label: 'Operations Simulations (8 Cases)' },
              { id: 'metrics', label: 'Operations Metrics Library (12)' }
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setOpsSubTab(sub.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  opsSubTab === sub.id
                    ? 'bg-forest-600 text-white shadow-warm-sm'
                    : 'bg-canvas-subtle text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Sub 1: Process Mapping Studio */}
          {opsSubTab === 'process-maps' && (
            <div className="bg-canvas-card border border-canvas-border rounded-2xl p-6 shadow-warm-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-charcoal-900 font-sans">
                    {activeMap.name}
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    {activeMap.department} • Click on any step to toggle Bottleneck identification
                  </p>
                </div>
              </div>

              {/* Visual Flow Representation */}
              <div className="p-4 bg-canvas-subtle rounded-2xl border border-canvas-border overflow-x-auto">
                <div className="flex items-center gap-3 min-w-[700px]">
                  {activeMap.steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                      <div
                        onClick={() => toggleBottleneck(step.id)}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all w-52 shrink-0 ${
                          step.isBottleneck
                            ? 'bg-red-50 border-red-500 text-red-900 shadow-warm'
                            : step.type === 'decision'
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-canvas-card border-canvas-border text-charcoal-900 hover:border-forest-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
                            Step {idx + 1} • {step.type}
                          </span>
                          {step.isBottleneck && (
                            <span className="text-[9px] font-extrabold bg-red-600 text-white px-1.5 py-0.2 rounded">
                              BOTTLENECK
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold leading-tight">
                          {step.label}
                        </p>
                        <p className="text-[10px] text-charcoal-500 mt-2 truncate">
                          Owner: <strong>{step.owner}</strong>
                        </p>
                      </div>

                      {idx < activeMap.steps.length - 1 && (
                        <div className="text-charcoal-400 font-bold shrink-0">→</div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Add Step Form */}
              <div className="p-4 bg-canvas-subtle rounded-xl border border-canvas-border space-y-3">
                <span className="text-xs font-bold text-charcoal-900 block">Add Step to Process Map</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={newStepLabel}
                    onChange={(e) => setNewStepLabel(e.target.value)}
                    placeholder="Step label (e.g. Verify invoice balance)..."
                    className="sm:col-span-2 bg-canvas-card border border-canvas-border rounded-lg p-2 text-xs text-charcoal-900"
                  />
                  <input
                    type="text"
                    value={newStepOwner}
                    onChange={(e) => setNewStepOwner(e.target.value)}
                    placeholder="Owner (e.g. Finance Specialist)..."
                    className="bg-canvas-card border border-canvas-border rounded-lg p-2 text-xs text-charcoal-900"
                  />
                  <button
                    onClick={handleAddMapStep}
                    className="px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs rounded-lg transition-all"
                  >
                    + Add Step
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub 2: SOP Builder */}
          {opsSubTab === 'sop-builder' && (
            <div className="space-y-4">
              <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm space-y-3">
                <h3 className="font-bold text-sm text-charcoal-900">AI Standard Operating Procedure Generator</h3>
                <p className="text-xs text-charcoal-500">
                  Convert a plain language process description into a comprehensive 10-section SOP with objective, scope, quality checkpoints, and escalation protocols.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={sopTitle}
                    onChange={(e) => setSopTitle(e.target.value)}
                    placeholder="SOP Title..."
                    className="bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                  />
                  <input
                    type="text"
                    value={sopDesc}
                    onChange={(e) => setSopDesc(e.target.value)}
                    placeholder="Describe the workflow in plain English..."
                    className="sm:col-span-2 bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleGenerateSopAI}
                    disabled={!sopDesc.trim() || sopDrafting}
                    className="flex items-center gap-1.5 px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{sopDrafting ? 'Building SOP...' : 'Generate 10-Section SOP'}</span>
                  </button>
                </div>
              </div>

              {/* Display Active SOP */}
              {activeSop && (
                <div className="bg-canvas-card border border-canvas-border rounded-2xl p-6 shadow-warm-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-canvas-border pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                        OFFICIAL SOP DOCUMENT
                      </span>
                      <h2 className="text-lg font-bold text-charcoal-900 mt-1">
                        {activeSop.processName}
                      </h2>
                    </div>
                    <button
                      onClick={() => alert("SOP formatted for export. You can copy or print this specification directly.")}
                      className="flex items-center gap-1 text-xs text-charcoal-600 hover:text-charcoal-900 border border-canvas-border px-3 py-1.5 rounded-lg"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export SOP</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <strong className="text-charcoal-900 block mb-0.5">Objective:</strong>
                      <p className="text-charcoal-600">{activeSop.objective}</p>
                    </div>
                    <div>
                      <strong className="text-charcoal-900 block mb-0.5">Process Owner:</strong>
                      <p className="text-charcoal-600">{activeSop.owner}</p>
                    </div>
                    <div>
                      <strong className="text-charcoal-900 block mb-0.5">Scope:</strong>
                      <p className="text-charcoal-600">{activeSop.scope}</p>
                    </div>
                    <div>
                      <strong className="text-charcoal-900 block mb-0.5">Escalation Protocol:</strong>
                      <p className="text-charcoal-600">{activeSop.escalation}</p>
                    </div>
                  </div>

                  {/* Step-by-Step Procedure */}
                  <div className="pt-2 border-t border-canvas-border">
                    <strong className="text-xs text-charcoal-900 block mb-2">Step-by-Step Procedure:</strong>
                    <div className="space-y-1.5 text-xs">
                      {activeSop.steps.map((st: any, i: number) => (
                        <div key={i} className="p-2 rounded-lg bg-canvas-subtle border border-canvas-border flex items-start gap-2">
                          <span className="font-bold text-forest-700 shrink-0">{i + 1}.</span>
                          <span className="text-charcoal-800">{typeof st === 'string' ? st : st.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub 3: Toolkit (5 Whys, Fishbone, etc.) */}
          {opsSubTab === 'toolkit' && (
            <div className="bg-canvas-card border border-canvas-border rounded-2xl p-6 shadow-warm-sm space-y-5">
              <div>
                <h3 className="font-bold text-base text-charcoal-900">5 Whys Root Cause Analysis Guided Workflow</h3>
                <p className="text-xs text-charcoal-500">
                  Drill down from immediate surface symptoms to underlying systemic causes.
                </p>
              </div>

              <div className="p-3.5 bg-canvas-subtle rounded-xl border border-canvas-border text-xs">
                <span className="font-bold text-charcoal-900 block mb-1">Problem Statement:</span>
                <input
                  type="text"
                  value={whysProblem}
                  onChange={(e) => setWhysProblem(e.target.value)}
                  className="w-full bg-canvas-card border border-canvas-border rounded-lg p-2 text-xs text-charcoal-900"
                />
              </div>

              <div className="space-y-2">
                {whysSteps.map((w, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-canvas-card border border-canvas-border text-xs">
                    <span className="font-extrabold text-forest-700 bg-forest-50 px-2.5 py-1 rounded-lg border border-forest-200 shrink-0">
                      Why #{w.why}
                    </span>
                    <span className="text-charcoal-800 flex-1">{w.text}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-forest-50 rounded-xl border border-forest-200 text-xs text-forest-800">
                <strong>Systemic Remedy:</strong> Establish automated Reorder Point (ROP) thresholds in ERP for all warehouse consumables and assign a designated supply replenishment owner.
              </div>
            </div>
          )}

          {/* Sub 4: Simulations */}
          {opsSubTab === 'simulations' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appState.operationsLab.simulations.map((sim) => (
                  <div key={sim.id} className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-charcoal-500 uppercase">
                          {sim.difficulty} Case
                        </span>
                        {sim.resolved ? (
                          <span className="text-[10px] bg-forest-50 text-forest-700 px-2 py-0.5 rounded font-bold border border-forest-200">
                            Resolved
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold border border-amber-200">
                            Active Crisis
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-charcoal-900 text-sm font-sans">
                        {sim.title}
                      </h4>
                      <p className="text-xs text-charcoal-600 mt-2 leading-relaxed">
                        {sim.context}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-canvas-border">
                      <span className="text-[10px] font-bold text-charcoal-400 block mb-1">Target KPIs:</span>
                      <div className="flex flex-wrap gap-1">
                        {sim.kpis.map((k, i) => (
                          <span key={i} className="text-[10px] bg-canvas-subtle px-2 py-0.5 rounded text-charcoal-700 border border-canvas-border">
                            {k}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          const sol = prompt("Enter your operational turnaround recommendation for this case:");
                          if (sol) {
                            resolveSimulation(sim.id, sol, sim.kpis);
                            onStateUpdate(prev => ({
                              ...prev,
                              operationsLab: {
                                ...prev.operationsLab,
                                simulations: prev.operationsLab.simulations.map(s => s.id === sim.id ? { ...s, resolved: true, userSolution: sol } : s)
                              }
                            }));
                          }
                        }}
                        className="w-full mt-3 py-2 bg-charcoal-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all text-center"
                      >
                        {sim.resolved ? 'Update Case Solution' : 'Solve Case Simulation'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub 5: Operations Metrics Library */}
          {opsSubTab === 'metrics' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {operationsMetrics.map((m) => (
                  <div key={m.code} className="bg-canvas-card border border-canvas-border rounded-xl p-4 shadow-warm-sm space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200 font-mono">
                        {m.code}
                      </span>
                      <span className="text-[10px] text-charcoal-400 font-semibold">{m.category}</span>
                    </div>
                    <h5 className="font-bold text-charcoal-900">{m.name}</h5>
                    <div className="p-2 bg-canvas-subtle rounded border border-canvas-border font-mono text-[10px] text-charcoal-700">
                      {m.formula}
                    </div>
                    <p className="text-[11px] text-charcoal-500 italic">
                      "{m.example}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* E. COMMUNICATION INTELLIGENCE */}
      {/* ======================================================== */}
      {activeTab === 'comm-intel' && (
        <div className="space-y-5 animate-fade-in">
          {/* Pattern Tracker */}
          <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm space-y-3">
            <h3 className="font-bold text-sm text-charcoal-900">Communication Pattern Tracker</h3>
            <p className="text-xs text-charcoal-500">
              Aggregated across your actual recorded speaking and thought-building exercises.
            </p>
            <div className="space-y-2">
              {appState.communicationIntelligence.patterns.map((p, i) => (
                <div key={i} className="p-3 rounded-xl bg-canvas-subtle border border-canvas-border flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-3">
                    <span className="font-bold text-charcoal-900 block">{p.pattern}</span>
                    <span className="text-[11px] text-charcoal-600 block mt-0.5">Actionable Advice: {p.advice}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-terracotta-700 bg-terracotta-50 px-2 py-0.5 rounded border border-terracotta-200 shrink-0">
                    {p.occurrences}x detected
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vocabulary Builder with Flashcard Spaced Repetition */}
          <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-charcoal-900">Personal Vocabulary Builder</h3>
                <p className="text-xs text-charcoal-500">Natural professional expressions without pretension</p>
              </div>
            </div>

            {/* Quick Add Word */}
            <form onSubmit={handleAddVocabulary} className="p-3 bg-canvas-subtle rounded-xl border border-canvas-border grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={newVocOriginal}
                onChange={(e) => setNewVocOriginal(e.target.value)}
                placeholder="Original rough sentence..."
                className="bg-canvas-card border border-canvas-border rounded-lg p-2 text-xs text-charcoal-900"
              />
              <input
                type="text"
                value={newVocWord}
                onChange={(e) => setNewVocWord(e.target.value)}
                placeholder="Better word or phrase..."
                className="bg-canvas-card border border-canvas-border rounded-lg p-2 text-xs text-charcoal-900"
              />
              <input
                type="text"
                value={newVocImproved}
                onChange={(e) => setNewVocImproved(e.target.value)}
                placeholder="Polished sentence..."
                className="bg-canvas-card border border-canvas-border rounded-lg p-2 text-xs text-charcoal-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs rounded-lg transition-all"
              >
                + Add Phrase
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {appState.communicationIntelligence.vocabulary.map((voc) => (
                <div key={voc.id} className="p-3.5 rounded-xl bg-canvas-subtle border border-canvas-border space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-terracotta-700 font-bold bg-white px-2 py-0.5 rounded border border-canvas-border">
                      {voc.betterWord}
                    </span>
                    <span className="text-[10px] font-semibold text-charcoal-400">{voc.category}</span>
                  </div>
                  <p className="text-charcoal-500 text-[11px] line-through">
                    "{voc.originalSentence}"
                  </p>
                  <p className="text-charcoal-900 font-medium">
                    "{voc.improvedSentence}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* F. DECISION ROOM */}
      {/* ======================================================== */}
      {activeTab === 'decision-room' && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-canvas-card border border-canvas-border rounded-2xl p-6 shadow-warm-sm space-y-4">
            <div>
              <span className="text-[10px] font-bold text-terracotta-600 uppercase tracking-wider bg-terracotta-50 px-2.5 py-0.5 rounded-full border border-terracotta-200">
                Critical Judgment & Trade-offs
              </span>
              <h2 className="text-lg font-bold text-charcoal-900 mt-1">
                {selectedChallenge.title}
              </h2>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                {selectedChallenge.scenario}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2 pt-2">
              {selectedChallenge.options.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setUserDecisionChoice(opt.label)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all text-xs ${
                    userDecisionChoice === opt.label
                      ? 'bg-ink-50 border-ink-600 shadow-warm-sm'
                      : 'bg-canvas-subtle border-canvas-border hover:border-canvas-border-strong'
                  }`}
                >
                  <div className="font-bold text-charcoal-900 mb-0.5">{opt.label}</div>
                  <div className="text-charcoal-600">{opt.description}</div>
                </div>
              ))}
            </div>

            {/* Structured Rationale Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                  1. Your Detailed Reasoning & Logic
                </label>
                <textarea
                  rows={3}
                  value={decisionRationale}
                  onChange={(e) => setDecisionRationale(e.target.value)}
                  placeholder="Why is this option superior given the constraints?..."
                  className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                  2. Assumptions You Are Making
                </label>
                <textarea
                  rows={3}
                  value={decisionAssumptions}
                  onChange={(e) => setDecisionAssumptions(e.target.value)}
                  placeholder="What must be true for this recommendation to work?..."
                  className="w-full bg-canvas-subtle border border-canvas-border rounded-xl p-2.5 text-xs text-charcoal-900"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmitDecision}
                disabled={!decisionRationale.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-warm-sm transition-all"
              >
                <Scale className="w-4 h-4" />
                <span>Submit & Challenge with AI Critique</span>
              </button>
            </div>
          </div>

          {/* AI Critical Critique */}
          {decisionCritique && (
            <div className="bg-canvas-card border-2 border-amber-300 rounded-2xl p-5 shadow-warm-sm space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>AI Critical Partner Evaluation</span>
              </div>
              <p className="text-xs text-charcoal-700">
                <strong>Main Argument Quality:</strong> {decisionCritique.mainArgumentQuality}
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <strong>Challenging Counter-Perspective:</strong>
                <p>{decisionCritique.counterPerspective}</p>
              </div>
            </div>
          )}

          {/* Decision Journal */}
          <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm space-y-3">
            <h3 className="font-bold text-sm text-charcoal-900">Personal Decision Journal</h3>
            <p className="text-xs text-charcoal-500">Record past business calls to track actual vs expected outcomes.</p>
            <div className="space-y-2">
              {appState.decisionJournal.map((entry) => (
                <div key={entry.id} className="p-3.5 rounded-xl bg-canvas-subtle border border-canvas-border text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-charcoal-900">{entry.title}</span>
                    <span className="text-[10px] text-charcoal-400">{entry.tags.join(', ')}</span>
                  </div>
                  <p className="text-charcoal-700"><strong>Final Decision:</strong> {entry.finalDecision}</p>
                  <p className="text-forest-700 font-medium"><strong>Outcome & Lesson:</strong> {entry.lessonsLearned}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* G. BUSINESS ANALYTICS PRACTICE LAB */}
      {/* ======================================================== */}
      {activeTab === 'analytics-lab' && (
        <div className="bg-canvas-card border border-canvas-border rounded-2xl p-6 shadow-warm-sm space-y-5 animate-fade-in">
          <div>
            <h2 className="text-lg font-bold text-charcoal-900">Business Analytics Practice Lab</h2>
            <p className="text-xs text-charcoal-500">
              Real Excel functions, Power BI data modeling workflows, and dataset interpretations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Excel Practice */}
            <div className="p-4 rounded-xl bg-canvas-subtle border border-canvas-border space-y-3">
              <span className="font-bold text-charcoal-900 text-sm block">Excel Business Functions</span>
              <div className="space-y-1.5">
                {[
                  { fn: "XLOOKUP", desc: "Lookup customer ID against transaction ledger with exact match fallbacks." },
                  { fn: "SUMIFS & COUNTIFS", desc: "Aggregate quarterly revenues filtered by region and product line." },
                  { fn: "Pivot Tables", desc: "Multi-dimensional grouping of support tickets by severity and TAT." },
                  { fn: "Conditional Formatting", desc: "Highlight SLA breaches exceeding 120 minutes in real-time." }
                ].map((item, i) => (
                  <div key={i} className="p-2.5 bg-canvas-card rounded-lg border border-canvas-border">
                    <span className="font-mono font-bold text-forest-700">{item.fn}</span>
                    <p className="text-[11px] text-charcoal-600 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Power BI & Data Interpretation */}
            <div className="p-4 rounded-xl bg-canvas-subtle border border-canvas-border space-y-3">
              <span className="font-bold text-charcoal-900 text-sm block">Power BI & Data Interpretation</span>
              <div className="space-y-1.5">
                {[
                  { topic: "Star Schema Modeling", desc: "Fact tables for sales transactions linked to Dimension tables for stores and dates." },
                  { topic: "DAX Measures", desc: "Calculate Year-Over-Year revenue growth and trailing 90-day retention rates." },
                  { topic: "Executive KPI Cards", desc: "Design high-contrast visual status cards for CEO and Operations reviews." }
                ].map((item, i) => (
                  <div key={i} className="p-2.5 bg-canvas-card rounded-lg border border-canvas-border">
                    <span className="font-bold text-ink-700">{item.topic}</span>
                    <p className="text-[11px] text-charcoal-600 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
