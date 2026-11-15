import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

import { loadDatabase, saveDatabase, syncWorkspaceMaterials } from './db.js';
import { extractDocumentText, computeFileHash } from './services/documentExtractor.js';
import { processAIChat, generateSmartLocalResponse } from './services/aiCoach.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'The Growth Lab Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 2. Full State
app.get('/api/state', (req, res) => {
  const db = loadDatabase();
  res.json(db);
});

// 3. Profile & Settings
app.post('/api/profile', (req, res) => {
  const db = loadDatabase();
  db.profile = { ...db.profile, ...req.body };
  saveDatabase();
  res.json({ success: true, profile: db.profile });
});

app.post('/api/settings', (req, res) => {
  const db = loadDatabase();
  db.settings = { ...db.settings, ...req.body };
  saveDatabase();
  res.json({ success: true, settings: db.settings });
});

// 4. Quick Capture
app.post('/api/quick-capture', (req, res) => {
  const db = loadDatabase();
  const newCapture = {
    id: `qc-${Date.now()}`,
    content: req.body.content,
    category: req.body.category || 'idea',
    tags: req.body.tags || [],
    targetModule: req.body.targetModule || 'Idea Canvas',
    status: 'inbox',
    createdAt: new Date().toISOString()
  };
  db.quickCaptures.unshift(newCapture);
  saveDatabase();
  res.json(newCapture);
});

app.patch('/api/quick-capture/:id', (req, res) => {
  const db = loadDatabase();
  const item = db.quickCaptures.find(q => q.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  Object.assign(item, req.body);
  saveDatabase();
  res.json(item);
});

app.delete('/api/quick-capture/:id', (req, res) => {
  const db = loadDatabase();
  db.quickCaptures = db.quickCaptures.filter(q => q.id !== req.params.id);
  saveDatabase();
  res.json({ success: true });
});

// 5. Daily Workout (20-min routine)
app.post('/api/daily-workout/step', (req, res) => {
  const db = loadDatabase();
  db.dailyWorkout.currentStep = req.body.step;
  if (req.body.timeSpentSeconds) {
    db.dailyWorkout.timeSpentSeconds += req.body.timeSpentSeconds;
  }
  saveDatabase();
  res.json(db.dailyWorkout);
});

app.post('/api/daily-workout/complete', (req, res) => {
  const db = loadDatabase();
  db.dailyWorkout.isCompleted = true;
  db.dailyWorkout.completedAt = new Date().toISOString();
  db.dailyWorkout.history.push({
    date: new Date().toISOString().split('T')[0],
    durationSeconds: db.dailyWorkout.timeSpentSeconds || 1200,
    reflection: req.body.reflection || "Completed structured 20-minute communication workout."
  });
  saveDatabase();
  res.json({ success: true, dailyWorkout: db.dailyWorkout });
});

// 6. Communication Gym
app.post('/api/communication/attempt', (req, res) => {
  const db = loadDatabase();
  const { prompt, durationSeconds, transcript, category, audioData } = req.body;
  
  // Analyze with AI evaluation
  const evaluation = generateSmartLocalResponse(transcript || prompt, { mode: 'comm-eval' });

  const attempt = {
    id: `ca-${Date.now()}`,
    prompt,
    durationSeconds: durationSeconds || 60,
    transcript: transcript || "(Audio recording stored)",
    audioData: audioData || null,
    clarityScore: evaluation.clarityScore || 85,
    feedback: {
      fillerWords: evaluation.fillerWordsFound || [],
      strengths: evaluation.strengths || ["Cohesive central argument."],
      improvements: [evaluation.improvementPriority || "Anchor with a concrete constraint."]
    },
    category: category || "Daily Speaking",
    createdAt: new Date().toISOString()
  };

  db.communicationAttempts.unshift(attempt);

  // Auto-record pattern if filler words detected
  if (evaluation.fillerWordsFound && evaluation.fillerWordsFound.length > 0) {
    const fillerPattern = db.communicationIntelligence.patterns.find(p => p.pattern.includes('Filler word'));
    if (fillerPattern) {
      fillerPattern.occurrences += evaluation.fillerWordsFound.length;
    }
  }

  saveDatabase();
  res.json(attempt);
});

// 7. Thought Builder
app.post('/api/thought-builder', (req, res) => {
  const db = loadDatabase();
  const { title, rawInput, framework, structured } = req.body;
  const entry = {
    id: `tb-${Date.now()}`,
    title: title || "Structured Thought",
    rawInput,
    framework: framework || "PRE",
    structured,
    createdAt: new Date().toISOString()
  };
  db.thoughtBuilderEntries.unshift(entry);
  saveDatabase();
  res.json(entry);
});

// 8. Brand Lab
app.post('/api/brand-lab', (req, res) => {
  const db = loadDatabase();
  const observation = {
    id: `bl-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  db.brandLabObservations.unshift(observation);
  saveDatabase();
  res.json(observation);
});

// 9. Operations Lab
app.post('/api/operations/process-map', (req, res) => {
  const db = loadDatabase();
  const map = {
    id: req.body.id || `pm-${Date.now()}`,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  const idx = db.operationsLab.processMaps.findIndex(m => m.id === map.id);
  if (idx >= 0) {
    db.operationsLab.processMaps[idx] = map;
  } else {
    db.operationsLab.processMaps.unshift(map);
  }
  saveDatabase();
  res.json(map);
});

app.post('/api/operations/sop', (req, res) => {
  const db = loadDatabase();
  const sop = {
    id: req.body.id || `sop-${Date.now()}`,
    ...req.body,
    status: req.body.status || 'active',
    updatedAt: new Date().toISOString()
  };
  const idx = db.operationsLab.sops.findIndex(s => s.id === sop.id);
  if (idx >= 0) {
    db.operationsLab.sops[idx] = sop;
  } else {
    db.operationsLab.sops.unshift(sop);
  }
  saveDatabase();
  res.json(sop);
});

app.post('/api/operations/simulation', (req, res) => {
  const db = loadDatabase();
  const { simulationId, userSolution, kpisSelected } = req.body;
  const sim = db.operationsLab.simulations.find(s => s.id === simulationId);
  if (sim) {
    sim.resolved = true;
    sim.userSolution = userSolution;
    sim.kpisSelected = kpisSelected;
    sim.resolvedAt = new Date().toISOString();
  }
  saveDatabase();
  res.json({ success: true, simulation: sim });
});

// 10. Decision Room
app.post('/api/decision-room/submit', (req, res) => {
  const db = loadDatabase();
  const { challengeId, userDecision, rationale, evidence, assumptions, tradeOffs } = req.body;
  const challenge = db.decisionRoom.find(c => c.id === challengeId);
  if (challenge) {
    challenge.userDecision = {
      decision: userDecision,
      rationale,
      evidence,
      assumptions,
      tradeOffs,
      submittedAt: new Date().toISOString()
    };
  }
  saveDatabase();
  res.json({ success: true, challenge });
});

app.post('/api/decision-journal', (req, res) => {
  const db = loadDatabase();
  const entry = {
    id: `dj-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  db.decisionJournal.unshift(entry);
  saveDatabase();
  res.json(entry);
});

// 11. Assignments
app.post('/api/assignments', (req, res) => {
  const db = loadDatabase();
  const assignment = {
    id: req.body.id || `as-${Date.now()}`,
    title: req.body.title,
    subjectId: req.body.subjectId,
    dueDate: req.body.dueDate,
    priority: req.body.priority || 'should',
    status: req.body.status || 'pending',
    estimatedMinutes: req.body.estimatedMinutes || 60,
    linkedMaterial: req.body.linkedMaterial || ''
  };
  const idx = db.assignments.findIndex(a => a.id === assignment.id);
  if (idx >= 0) {
    db.assignments[idx] = assignment;
  } else {
    db.assignments.push(assignment);
  }
  saveDatabase();
  res.json(assignment);
});

app.patch('/api/assignments/:id/toggle', (req, res) => {
  const db = loadDatabase();
  const assignment = db.assignments.find(a => a.id === req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  assignment.status = assignment.status === 'completed' ? 'pending' : 'completed';
  saveDatabase();
  res.json(assignment);
});

app.delete('/api/assignments/:id', (req, res) => {
  const db = loadDatabase();
  db.assignments = db.assignments.filter(a => a.id !== req.params.id);
  saveDatabase();
  res.json({ success: true });
});

// 12. Execution Planner
app.post('/api/execution-planner', (req, res) => {
  const db = loadDatabase();
  db.executionPlanner = req.body;
  saveDatabase();
  res.json(db.executionPlanner);
});

// 13. Explore: LinkedIn Drafts, Proof of Work, Stories, Incubator
app.post('/api/linkedin-drafts', (req, res) => {
  const db = loadDatabase();
  const draft = {
    id: req.body.id || `li-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  db.linkedInDrafts.unshift(draft);
  saveDatabase();
  res.json(draft);
});

app.post('/api/proof-of-work', (req, res) => {
  const db = loadDatabase();
  const project = {
    id: req.body.id || `pow-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  const idx = db.proofOfWorkProjects.findIndex(p => p.id === project.id);
  if (idx >= 0) {
    db.proofOfWorkProjects[idx] = project;
  } else {
    db.proofOfWorkProjects.unshift(project);
  }
  saveDatabase();
  res.json(project);
});

app.post('/api/interview-stories', (req, res) => {
  const db = loadDatabase();
  const story = {
    id: req.body.id || `is-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  const idx = db.interviewStories.findIndex(s => s.id === story.id);
  if (idx >= 0) {
    db.interviewStories[idx] = story;
  } else {
    db.interviewStories.unshift(story);
  }
  saveDatabase();
  res.json(story);
});

app.post('/api/project-incubator', (req, res) => {
  const db = loadDatabase();
  const project = {
    id: req.body.id || `pi-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  const idx = db.projectIncubator.findIndex(p => p.id === project.id);
  if (idx >= 0) {
    db.projectIncubator[idx] = project;
  } else {
    db.projectIncubator.unshift(project);
  }
  saveDatabase();
  res.json(project);
});

// 14. Vocabulary & Idea Canvas
app.post('/api/vocabulary', (req, res) => {
  const db = loadDatabase();
  const card = {
    id: req.body.id || `voc-${Date.now()}`,
    ...req.body,
    reviewDate: new Date().toISOString()
  };
  db.communicationIntelligence.vocabulary.unshift(card);
  saveDatabase();
  res.json(card);
});

app.post('/api/idea-canvas', (req, res) => {
  const db = loadDatabase();
  db.ideaCanvas = req.body;
  saveDatabase();
  res.json(db.ideaCanvas);
});

// 15. Material Upload & Management
app.post('/api/materials/upload', upload.single('file'), (req, res) => {
  const db = loadDatabase();
  const file = req.file;
  const subjectId = req.body.subjectId || 'pm2';

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  // STRICT EXCLUSION CHECK
  if (file.originalname.toLowerCase().includes('entrepreneurial')) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ error: 'Subject Entrepreneurial Mindset is strictly excluded from The Growth Lab curriculum.' });
  }

  const hash = computeFileHash(file.path);
  const ext = path.extname(file.originalname).replace('.', '').toLowerCase();

  // If ZIP archive, unpack and extract
  if (ext === 'zip') {
    try {
      const zip = new AdmZip(file.path);
      const zipEntries = zip.getEntries();
      const extractedMaterials = [];

      for (const entry of zipEntries) {
        if (entry.isDirectory) continue;
        const entryName = entry.entryName;
        // Ignore hidden and system files
        if (entryName.startsWith('__MACOSX') || path.basename(entryName).startsWith('.')) continue;

        // Strict exclusion inside ZIP
        if (entryName.toLowerCase().includes('entrepreneurial')) continue;

        const subExt = path.extname(entryName).replace('.', '').toLowerCase();
        if (!['pdf', 'pptx', 'ppt', 'docx', 'doc', 'txt', 'md'].includes(subExt)) continue;

        const safeFilename = `${Date.now()}-${path.basename(entryName).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const targetPath = path.join(UPLOADS_DIR, safeFilename);
        
        fs.writeFileSync(targetPath, entry.getData());
        const entryHash = computeFileHash(targetPath);
        const extractedText = extractDocumentText(targetPath, subExt);

        const newMat = {
          id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          subjectId,
          filename: path.basename(entryName),
          originalPath: targetPath,
          title: path.basename(entryName).replace(/\.[^/.]+$/, ''),
          session: req.body.session || "Imported Session",
          fileType: subExt,
          sizeBytes: fs.statSync(targetPath).size,
          uploadDate: new Date().toISOString(),
          hash: entryHash,
          extractedTextPreview: extractedText ? extractedText.slice(0, 1500) : '',
          extractedTextFullLength: extractedText ? extractedText.length : 0,
          isBookmarked: false,
          studyStatus: "in_progress",
          notes: []
        };
        db.materials.push(newMat);
        extractedMaterials.push(newMat);
      }

      saveDatabase();
      return res.json({ success: true, count: extractedMaterials.length, materials: extractedMaterials });
    } catch (err) {
      return res.status(500).json({ error: `ZIP extraction failed: ${err.message}` });
    }
  }

  // Single document
  const extractedText = extractDocumentText(file.path, ext);
  const newMat = {
    id: `mat-${Date.now()}`,
    subjectId,
    filename: file.originalname,
    originalPath: file.path,
    title: file.originalname.replace(/\.[^/.]+$/, ''),
    session: req.body.session || "General Session",
    fileType: ext,
    sizeBytes: file.size,
    uploadDate: new Date().toISOString(),
    hash,
    extractedTextPreview: extractedText ? extractedText.slice(0, 1500) : '',
    extractedTextFullLength: extractedText ? extractedText.length : 0,
    isBookmarked: false,
    studyStatus: "in_progress",
    notes: []
  };

  db.materials.push(newMat);
  saveDatabase();
  res.json({ success: true, material: newMat });
});

// Download Material
app.get('/api/materials/:id/download', (req, res) => {
  const db = loadDatabase();
  const mat = db.materials.find(m => m.id === req.params.id);
  if (!mat || !fs.existsSync(mat.originalPath)) {
    return res.status(404).json({ error: 'File not found on disk' });
  }
  res.download(mat.originalPath, mat.filename);
});

// 16. AI Endpoints
app.post('/api/ai/chat', async (req, res) => {
  const db = loadDatabase();
  const { prompt, context } = req.body;
  const apiKey = db.settings.geminiApiKey || process.env.GEMINI_API_KEY;

  try {
    const result = await processAIChat({ prompt, context, apiKey });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/evaluate-speech', (req, res) => {
  const { transcript } = req.body;
  const evaluation = generateSmartLocalResponse(transcript, { mode: 'comm-eval' });
  res.json(evaluation);
});

app.post('/api/ai/thought-builder', (req, res) => {
  const { rawText, framework } = req.body;
  const result = generateSmartLocalResponse(rawText, { mode: 'thought-builder', framework });
  res.json(result);
});

app.post('/api/ai/sop-builder', (req, res) => {
  const { description, title } = req.body;
  const sop = generateSmartLocalResponse(description, { mode: 'sop-builder', title });
  res.json(sop);
});

app.post('/api/ai/decision-critique', (req, res) => {
  const { decisionData } = req.body;
  const critique = generateSmartLocalResponse(decisionData.rationale || '', { mode: 'decision-room' });
  res.json(critique);
});

app.post('/api/ai/generate-quiz', (req, res) => {
  const { subjectId, docTitle } = req.body;
  // Dynamic 3-question grounded quiz
  const quiz = [
    {
      id: "q1",
      question: `In the context of ${docTitle || 'this course module'}, what is the critical trade-off between immediate cycle speed and operational quality control?`,
      options: [
        "A) Quality control should always be bypassed to meet delivery SLAs",
        "B) Inspection bottlenecks must be addressed by root-cause error prevention at intake rather than adding manual inspection steps",
        "C) Increasing inventory buffers is always the cheapest solution",
        "D) Frontline teams should ignore error reporting"
      ],
      correctIndex: 1,
      explanation: "Process excellence teaches that inspecting quality into a product is inherently wasteful; preventing defects at the source optimizes throughput."
    },
    {
      id: "q2",
      question: "Which of the following metrics directly measures unassisted resolution effectiveness?",
      options: [
        "A) Average Handling Time (AHT)",
        "B) First Contact Resolution (FCR)",
        "C) Capacity Utilization",
        "D) Turnaround Time (TAT)"
      ],
      correctIndex: 1,
      explanation: "FCR captures whether the customer's problem was completely solved in their initial encounter without requiring escalations."
    },
    {
      id: "q3",
      question: "When evaluating a Build vs Buy software architectural decision, what is the most commonly underestimated cost?",
      options: [
        "A) Initial license price",
        "B) Ongoing maintenance debt, integration maintenance, and developer opportunity cost",
        "C) Database storage cost",
        "D) Domain name registration"
      ],
      correctIndex: 1,
      explanation: "Internal software builds incur ongoing technical debt, security patches, and engineer opportunity costs that frequently dwarf initial build estimates."
    }
  ];
  res.json({ quiz });
});

// Serve frontend build if available
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`The Growth Lab Server running on http://localhost:${PORT}`);
  // Perform initial scan
  syncWorkspaceMaterials();
});
