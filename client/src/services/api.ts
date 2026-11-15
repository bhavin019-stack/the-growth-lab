import { AppState, QuickCapture, SOP, ProcessMap, BrandObservation, ThoughtBuilderEntry, Assignment, ProofOfWorkProject, InterviewStory, VocabularyCard } from '../types';

const API_BASE = '/api';

export async function fetchAppState(): Promise<AppState> {
  const res = await fetch(`${API_BASE}/state`);
  if (!res.ok) throw new Error('Failed to load application state');
  return res.json();
}

export async function updateProfile(profileData: Partial<AppState['profile']>) {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  return res.json();
}

export async function updateSettings(settingsData: Partial<AppState['settings']>) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData)
  });
  return res.json();
}

export async function createQuickCapture(data: { content: string; category: string; tags: string[]; targetModule: string }): Promise<QuickCapture> {
  const res = await fetch(`${API_BASE}/quick-capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateQuickCapture(id: string, updates: Partial<QuickCapture>): Promise<QuickCapture> {
  const res = await fetch(`${API_BASE}/quick-capture/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function deleteQuickCapture(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/quick-capture/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function updateDailyWorkoutStep(step: number, timeSpentSeconds?: number) {
  const res = await fetch(`${API_BASE}/daily-workout/step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, timeSpentSeconds })
  });
  return res.json();
}

export async function completeDailyWorkout(reflection?: string) {
  const res = await fetch(`${API_BASE}/daily-workout/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reflection })
  });
  return res.json();
}

export async function saveCommunicationAttempt(data: {
  prompt: string;
  durationSeconds: number;
  transcript: string;
  category: string;
  audioData?: string | null;
}) {
  const res = await fetch(`${API_BASE}/communication/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function saveThoughtBuilder(data: Partial<ThoughtBuilderEntry>) {
  const res = await fetch(`${API_BASE}/thought-builder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function saveBrandObservation(data: Partial<BrandObservation>) {
  const res = await fetch(`${API_BASE}/brand-lab`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function saveProcessMap(data: Partial<ProcessMap>) {
  const res = await fetch(`${API_BASE}/operations/process-map`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function saveSOP(data: Partial<SOP>) {
  const res = await fetch(`${API_BASE}/operations/sop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function resolveSimulation(simulationId: string, userSolution: string, kpisSelected: string[]) {
  const res = await fetch(`${API_BASE}/operations/simulation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ simulationId, userSolution, kpisSelected })
  });
  return res.json();
}

export async function submitDecision(challengeId: string, data: { decision: string; rationale: string; evidence: string; assumptions: string; tradeOffs: string }) {
  const res = await fetch(`${API_BASE}/decision-room/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeId, ...data })
  });
  return res.json();
}

export async function saveDecisionJournal(entry: any) {
  const res = await fetch(`${API_BASE}/decision-journal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  return res.json();
}

export async function saveAssignment(assignment: Partial<Assignment>) {
  const res = await fetch(`${API_BASE}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assignment)
  });
  return res.json();
}

export async function toggleAssignment(id: string) {
  const res = await fetch(`${API_BASE}/assignments/${id}/toggle`, { method: 'PATCH' });
  return res.json();
}

export async function deleteAssignment(id: string) {
  const res = await fetch(`${API_BASE}/assignments/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function updateExecutionPlanner(planner: AppState['executionPlanner']) {
  const res = await fetch(`${API_BASE}/execution-planner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(planner)
  });
  return res.json();
}

export async function saveLinkedInDraft(draft: any) {
  const res = await fetch(`${API_BASE}/linkedin-drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft)
  });
  return res.json();
}

export async function saveProofOfWork(project: Partial<ProofOfWorkProject>) {
  const res = await fetch(`${API_BASE}/proof-of-work`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  });
  return res.json();
}

export async function saveInterviewStory(story: Partial<InterviewStory>) {
  const res = await fetch(`${API_BASE}/interview-stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(story)
  });
  return res.json();
}

export async function saveProjectIncubator(proj: any) {
  const res = await fetch(`${API_BASE}/project-incubator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proj)
  });
  return res.json();
}

export async function saveVocabulary(card: Partial<VocabularyCard>) {
  const res = await fetch(`${API_BASE}/vocabulary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(card)
  });
  return res.json();
}

export async function saveIdeaCanvas(canvas: AppState['ideaCanvas']) {
  const res = await fetch(`${API_BASE}/idea-canvas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(canvas)
  });
  return res.json();
}

export async function uploadAcademicMaterial(formData: FormData) {
  const res = await fetch(`${API_BASE}/materials/upload`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}

// AI Endpoints
export async function sendAIChat(prompt: string, context: Record<string, any> = {}) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, context })
  });
  return res.json();
}

export async function requestAITranscriptEvaluation(transcript: string) {
  const res = await fetch(`${API_BASE}/ai/evaluate-speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript })
  });
  return res.json();
}

export async function requestAIThoughtStructure(rawText: string, framework: string) {
  const res = await fetch(`${API_BASE}/ai/thought-builder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText, framework })
  });
  return res.json();
}

export async function requestAISopDraft(title: string, description: string) {
  const res = await fetch(`${API_BASE}/ai/sop-builder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  });
  return res.json();
}

export async function requestAIDecisionCritique(decisionData: any) {
  const res = await fetch(`${API_BASE}/ai/decision-critique`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decisionData })
  });
  return res.json();
}

export async function requestDocumentQuiz(subjectId: string, docTitle: string) {
  const res = await fetch(`${API_BASE}/ai/generate-quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subjectId, docTitle })
  });
  return res.json();
}
