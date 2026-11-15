import React, { useState } from 'react';
import { 
  GraduationCap, 
  Upload, 
  FileText, 
  Download, 
  Bookmark, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Layers, 
  BookOpen, 
  ArrowRight,
  Eye,
  Check,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { AppState, MbaSubject, AcademicMaterial } from '../types';
import { uploadAcademicMaterial, requestDocumentQuiz } from '../services/api';

interface MbaHubViewProps {
  appState: AppState;
  onStateUpdate: (updater: (prev: AppState) => AppState) => void;
  onOpenAICoachWithContext: (subject: string, docTitle: string) => void;
}

export const MbaHubView: React.FC<MbaHubViewProps> = ({
  appState,
  onStateUpdate,
  onOpenAICoachWithContext
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('microecon');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<AcademicMaterial | null>(null);

  // File Upload & Import Workflow State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSubjectId, setUploadSubjectId] = useState('pm2');
  const [uploadSession, setUploadSession] = useState('Session 1');
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // On-demand quiz state
  const [quizLoading, setQuizLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any[] | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const activeSubject = appState.subjects.find(s => s.id === selectedSubjectId) || appState.subjects[0];

  const subjectMaterials = appState.materials.filter(m => {
    const matchesSubject = m.subjectId === selectedSubjectId;
    const matchesQuery = searchQuery.trim() === '' || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.extractedTextPreview && m.extractedTextPreview.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesQuery;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().includes('entrepreneurial')) {
      alert("Notice: Entrepreneurial Mindset is strictly excluded from The Growth Lab curriculum.");
      return;
    }

    setIsUploading(true);
    setUploadNotice(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectId', uploadSubjectId);
    formData.append('session', uploadSession);

    try {
      const res = await uploadAcademicMaterial(formData);
      if (res.materials) {
        // Zip archive result
        onStateUpdate(prev => ({
          ...prev,
          materials: [...res.materials, ...prev.materials]
        }));
        setUploadNotice(`Successfully imported ${res.count} documents from ZIP archive!`);
      } else if (res.material) {
        onStateUpdate(prev => ({
          ...prev,
          materials: [res.material, ...prev.materials]
        }));
        setUploadNotice(`Successfully imported ${res.material.filename}!`);
      }
    } catch (err: any) {
      setUploadNotice(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateQuiz = async (material: AcademicMaterial) => {
    setQuizLoading(true);
    setActiveQuiz(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const res = await requestDocumentQuiz(material.subjectId, material.title);
      setActiveQuiz(res.quiz);
    } catch (err) {
      console.error(err);
    } finally {
      setQuizLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-terracotta-600 bg-terracotta-50 px-2.5 py-0.5 rounded-full border border-terracotta-200">
            Academic Management Second • Grounded Study
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-charcoal-900 font-sans tracking-tight mt-1">
            MBA Academic Hub
          </h1>
          <p className="text-xs md:text-sm text-charcoal-500 font-medium">
            Term II subjects, original preserved presentations, and on-demand AI study assistance.
          </p>
        </div>

        {/* Upload Trigger Dropdown / Form */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-4 py-2 bg-charcoal-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-warm-sm cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Importing...' : 'Import Documents / ZIP'}</span>
            <input
              type="file"
              accept=".pdf,.pptx,.ppt,.docx,.doc,.zip"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {uploadNotice && (
        <div className="p-3 bg-forest-50 border border-forest-200 text-forest-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest-600" />
            <span>{uploadNotice}</span>
          </div>
          <button onClick={() => setUploadNotice(null)} className="text-forest-600 font-bold">×</button>
        </div>
      )}

      {/* 6 Subject Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {appState.subjects.map((sub) => {
          const isSelected = selectedSubjectId === sub.id;
          const materialCount = appState.materials.filter(m => m.subjectId === sub.id).length;

          return (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubjectId(sub.id);
                setSelectedMaterial(null);
                setActiveQuiz(null);
              }}
              className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-canvas-card border-terracotta-500 shadow-warm ring-1 ring-terracotta-500'
                  : 'bg-canvas-card border-canvas-border hover:border-canvas-border-strong'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-charcoal-400 block mb-1">
                  {sub.code}
                </span>
                <h3 className="font-bold text-xs text-charcoal-900 leading-snug truncate">
                  {sub.name}
                </h3>
              </div>

              <div className="mt-3 pt-2 border-t border-canvas-border flex items-center justify-between text-[10px]">
                <span className="text-charcoal-500 font-semibold">{materialCount} files</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Subject Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Materials List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-charcoal-900">
                  {activeSubject.name} Materials
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  {activeSubject.description}
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter slides & notes..."
                  className="bg-canvas-subtle border border-canvas-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-charcoal-900 w-48 focus:outline-none focus:border-terracotta-500"
                />
              </div>
            </div>

            {/* List */}
            {subjectMaterials.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-400 border border-dashed border-canvas-border rounded-xl space-y-2">
                <BookOpen className="w-6 h-6 mx-auto text-charcoal-300" />
                <p>No documents uploaded yet for this subject.</p>
                <p className="text-[11px] text-charcoal-400">
                  Upload presentations or PDFs using the "Import Documents" button above.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {subjectMaterials.map((mat) => {
                  const isSelected = selectedMaterial?.id === mat.id;
                  return (
                    <div
                      key={mat.id}
                      onClick={() => setSelectedMaterial(mat)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-ink-50/60 border-ink-400 shadow-warm-sm'
                          : 'bg-canvas-subtle border-canvas-border hover:border-canvas-border-strong'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-canvas-card border border-canvas-border text-terracotta-600 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs md:text-sm text-charcoal-900 truncate">
                            {mat.title}
                          </h4>
                          <p className="text-[11px] text-charcoal-500 mt-0.5 truncate">
                            {mat.session} • {(mat.sizeBytes / 1024 / 1024).toFixed(2)} MB • {mat.fileType.toUpperCase()}
                          </p>
                          {mat.extractedTextPreview && (
                            <p className="text-[11px] text-charcoal-600 line-clamp-1 italic mt-1 font-serif">
                              "{mat.extractedTextPreview.slice(0, 140)}..."
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <a
                          href={`/api/materials/${mat.id}/download`}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-canvas-card border border-canvas-border text-charcoal-600 hover:text-charcoal-900"
                          title="Download original file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAICoachWithContext(activeSubject.name, mat.title);
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold bg-ink-500 hover:bg-ink-600 text-white px-2.5 py-1.5 rounded-lg transition-colors"
                          title="Ask AI Learning Coach to explain this document"
                        >
                          <Sparkles className="w-3 h-3 text-amber-200" />
                          <span>Explain</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Document Inspector & On-Demand Quiz */}
        <div className="space-y-4">
          {selectedMaterial ? (
            <div className="bg-canvas-card border border-canvas-border rounded-2xl p-5 shadow-warm-sm space-y-4">
              <div className="flex items-center justify-between border-b border-canvas-border pb-3">
                <span className="text-xs font-bold text-charcoal-900">
                  Document Inspector
                </span>
                <span className="text-[10px] font-mono bg-canvas-subtle px-2 py-0.5 rounded text-charcoal-500">
                  {selectedMaterial.fileType.toUpperCase()}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-charcoal-900">
                  {selectedMaterial.title}
                </h3>
                <p className="text-[11px] text-charcoal-500 mt-0.5">
                  Extracted text length: {selectedMaterial.extractedTextFullLength || 0} characters
                </p>
              </div>

              {/* Slide text preview */}
              <div className="p-3 bg-canvas-subtle rounded-xl border border-canvas-border max-h-48 overflow-y-auto font-mono text-[11px] text-charcoal-700 leading-relaxed whitespace-pre-wrap">
                {selectedMaterial.extractedTextPreview || "Preserved original document. Ready for viewing and grounded AI explanation."}
              </div>

              {/* On-Demand Quiz Generator */}
              <div className="pt-2 border-t border-canvas-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal-800">
                    On-Demand Revision Quiz
                  </span>
                  <span className="text-[10px] text-charcoal-400">
                    Generated only on request
                  </span>
                </div>

                {!activeQuiz ? (
                  <button
                    onClick={() => handleGenerateQuiz(selectedMaterial)}
                    disabled={quizLoading}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-warm-sm transition-all"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>{quizLoading ? 'Generating Quiz Questions...' : 'Generate 3-Question Quiz'}</span>
                  </button>
                ) : (
                  <div className="space-y-3 pt-2">
                    {activeQuiz.map((q, idx) => (
                      <div key={q.id} className="p-3 bg-canvas-subtle rounded-xl border border-canvas-border text-xs space-y-2">
                        <p className="font-bold text-charcoal-900 leading-snug">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="space-y-1">
                          {q.options.map((opt: string, optIdx: number) => {
                            const isChosen = quizAnswers[q.id] === optIdx;
                            const isCorrect = q.correctIndex === optIdx;

                            return (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  if (!quizSubmitted) {
                                    setQuizAnswers({ ...quizAnswers, [q.id]: optIdx });
                                  }
                                }}
                                className={`w-full text-left p-2 rounded-lg border text-[11px] transition-all ${
                                  quizSubmitted
                                    ? isCorrect
                                      ? 'bg-forest-50 border-forest-300 text-forest-800 font-semibold'
                                      : isChosen
                                      ? 'bg-red-50 border-red-300 text-red-800'
                                      : 'bg-canvas-card border-canvas-border text-charcoal-600'
                                    : isChosen
                                    ? 'bg-terracotta-50 border-terracotta-400 text-terracotta-800 font-semibold'
                                    : 'bg-canvas-card border-canvas-border text-charcoal-700 hover:border-canvas-border-strong'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {quizSubmitted && (
                          <p className="text-[10px] text-charcoal-600 bg-white p-2 rounded border border-canvas-border">
                            <strong>Rationale:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}

                    {!quizSubmitted ? (
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        className="w-full py-2 bg-charcoal-900 text-white font-bold text-xs rounded-xl transition-all"
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGenerateQuiz(selectedMaterial)}
                        className="w-full py-2 bg-canvas-subtle border border-canvas-border text-charcoal-800 font-semibold text-xs rounded-xl"
                      >
                        Generate New Questions
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-canvas-card border border-canvas-border rounded-2xl p-6 shadow-warm-sm text-center text-xs text-charcoal-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-charcoal-300" />
              <p className="font-semibold text-charcoal-600">Select any material to inspect</p>
              <p className="text-[11px]">View slide text, download original files, or generate on-demand study quizzes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
