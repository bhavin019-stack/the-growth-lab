export type NavigationTab = 'home' | 'skill-studio' | 'mba-hub' | 'explore' | 'my-growth';

export interface UserProfile {
  name: string;
  title: string;
  tagline: string;
  targetRoles: string[];
  availableDailyMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  learningGoals: string[];
  skills: Record<string, number>;
}

export interface AppSettings {
  geminiApiKey: string;
  openaiApiKey: string;
  theme: string;
  notificationsEnabled: boolean;
  outlookCalendar: {
    status: 'disconnected' | 'connected' | 'configured';
    clientId: string;
    lastSync: string | null;
    note: string;
  };
}

export interface QuickCapture {
  id: string;
  content: string;
  category: 'idea' | 'learning_note' | 'business_observation' | 'task' | 'question' | 'project_thought';
  tags: string[];
  targetModule: string;
  status: 'inbox' | 'organized' | 'archived';
  createdAt: string;
}

export interface MbaSubject {
  id: string;
  code: string;
  name: string;
  description: string;
  color: string;
  accent: string;
  icon: string;
  totalSessions: number;
  completedSessions: number;
}

export interface AcademicMaterial {
  id: string;
  subjectId: string;
  filename: string;
  originalPath: string;
  title: string;
  session: string;
  fileType: string;
  sizeBytes: number;
  uploadDate: string;
  hash: string;
  extractedTextPreview?: string;
  extractedTextFullLength?: number;
  isBookmarked: boolean;
  studyStatus: 'not_started' | 'in_progress' | 'completed';
  notes: Array<{ id: string; text: string; date: string }>;
}

export interface CommunicationAttempt {
  id: string;
  prompt: string;
  durationSeconds: number;
  transcript: string;
  audioData?: string | null;
  clarityScore: number;
  feedback: {
    fillerWords: string[];
    strengths: string[];
    improvements: string[];
  };
  category: string;
  createdAt: string;
}

export interface ThoughtBuilderEntry {
  id: string;
  title: string;
  rawInput: string;
  framework: 'PRE' | 'PAS' | 'STAR' | 'CEC';
  structured: {
    point?: string;
    reason?: string;
    example?: string;
    conclusion?: string;
    problem?: string;
    analysis?: string;
    solution?: string;
  };
  createdAt: string;
}

export interface SkillTrack {
  id: string;
  title: string;
  category: string;
  progress: number;
  modules: Array<{ id: string; title: string; completed: boolean }>;
}

export interface BrandObservation {
  id: string;
  brandName: string;
  category: string;
  targetAudience: string;
  positioning: string;
  consumerBehavior: string;
  competitorComparison: string;
  rationale: string;
  aiFeedback?: string;
  isTodayObservation?: boolean;
  createdAt: string;
}

export interface ProcessMapStep {
  id: string;
  label: string;
  type: 'start' | 'step' | 'decision' | 'end';
  owner: string;
  inputs: string;
  outputs: string;
  isBottleneck: boolean;
}

export interface ProcessMap {
  id: string;
  name: string;
  department: string;
  description: string;
  steps: ProcessMapStep[];
  bottleneckNotes?: string;
  createdAt: string;
}

export interface SOP {
  id: string;
  processName: string;
  objective: string;
  scope: string;
  owner: string;
  inputs: string[];
  steps: string[];
  outputs: string[];
  qualityCheckpoints: string[];
  escalation: string;
  exceptions: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
}

export interface OperationsSimulation {
  id: string;
  title: string;
  context: string;
  difficulty: string;
  kpis: string[];
  frameworkRecommended: string;
  resolved: boolean;
  userSolution?: string;
  kpisSelected?: string[];
  resolvedAt?: string;
}

export interface VocabularyCard {
  id: string;
  originalSentence: string;
  intendedMeaning: string;
  betterWord: string;
  improvedSentence: string;
  category: string;
  mastery: 'Learning' | 'Reviewing' | 'Mastered';
  reviewDate: string;
}

export interface DecisionRoomChallenge {
  id: string;
  title: string;
  scenario: string;
  options: Array<{ id: string; label: string; description: string }>;
  userDecision?: {
    decision: string;
    rationale: string;
    evidence: string;
    assumptions: string;
    tradeOffs: string;
    submittedAt: string;
  } | null;
}

export interface DecisionJournalEntry {
  id: string;
  title: string;
  situation: string;
  optionsConsidered: string[];
  finalDecision: string;
  expectedOutcome: string;
  actualOutcome: string;
  lessonsLearned: string;
  tags: string[];
  createdAt: string;
}

export interface CuratedResource {
  id: string;
  title: string;
  author: string;
  source: string;
  type: 'article' | 'video';
  url: string;
  category: string;
  readTimeMinutes: number;
  description: string;
  completed: boolean;
  saved: boolean;
}

export interface LinkedInDraft {
  id: string;
  title: string;
  content: string;
  sourceNote: string;
  status: 'draft' | 'ready_to_share' | 'published';
  createdAt: string;
}

export interface InterviewStory {
  id: string;
  title: string;
  framework: 'STAR' | 'CAR' | 'Problem-Action-Outcome';
  competency: string;
  roleCategory: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  aiFollowUp?: string;
  conciseVersion?: string;
  createdAt: string;
}

export interface ProofOfWorkProject {
  id: string;
  title: string;
  category: string;
  problemStatement: string;
  background: string;
  objective: string;
  researchAndAnalysis: string;
  proposedSolution: string;
  implementation: string;
  impact: string;
  skillsDemonstrated: string[];
  status: 'In Progress' | 'Completed';
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;
  priority: 'must' | 'should' | 'optional';
  status: 'pending' | 'completed';
  estimatedMinutes: number;
  linkedMaterial?: string;
}

export interface ExecutionTask {
  id: string;
  title: string;
  timeEst: number;
  completed: boolean;
  category: string;
}

export interface ExecutionPlanner {
  todayMustDo: ExecutionTask[];
  todayShouldDo: ExecutionTask[];
  todayOptional: ExecutionTask[];
}

export interface AppState {
  profile: UserProfile;
  settings: AppSettings;
  dailyWorkout: {
    date: string;
    currentStep: number;
    timeSpentSeconds: number;
    isCompleted: boolean;
    history: Array<{ date: string; durationSeconds: number; reflection: string }>;
  };
  quickCaptures: QuickCapture[];
  subjects: MbaSubject[];
  materials: AcademicMaterial[];
  communicationAttempts: CommunicationAttempt[];
  thoughtBuilderEntries: ThoughtBuilderEntry[];
  skillTracks: SkillTrack[];
  brandLabObservations: BrandObservation[];
  operationsLab: {
    processMaps: ProcessMap[];
    sops: SOP[];
    simulations: OperationsSimulation[];
  };
  communicationIntelligence: {
    patterns: Array<{ pattern: string; occurrences: number; advice: string }>;
    vocabulary: VocabularyCard[];
  };
  decisionRoom: DecisionRoomChallenge[];
  decisionJournal: DecisionJournalEntry[];
  curatedLibrary: CuratedResource[];
  ideaCanvas: {
    cards: Array<{ id: string; x: number; y: number; title: string; content: string; color: string; category: string }>;
    connections: Array<{ from: string; to: string }>;
  };
  linkedInDrafts: LinkedInDraft[];
  careerCompass: {
    targetRoles: Array<{
      id: string;
      title: string;
      matchScore: number;
      requiredSkills: string[];
      userStrengths: string[];
      gaps: string[];
      recommendedTracks: string[];
    }>;
    resumeSummary: string;
  };
  interviewStories: InterviewStory[];
  proofOfWorkProjects: ProofOfWorkProject[];
  projectIncubator: Array<{
    id: string;
    title: string;
    origin: string;
    problem: string;
    targetAudience: string;
    objective: string;
    assumptions: string[];
    milestones: Array<{ title: string; completed: boolean }>;
    status: 'in_progress' | 'completed';
    createdAt: string;
  }>;
  assignments: Assignment[];
  executionPlanner: ExecutionPlanner;
}
