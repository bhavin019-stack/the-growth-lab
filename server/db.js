import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractDocumentText, computeFileHash } from './services/documentExtractor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const SEED_DB_FILE = path.join(__dirname, 'data', 'db.json');
const DATA_DIR = isServerless ? '/tmp/growth-lab-data' : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const WORKSPACE_DIR = path.resolve(__dirname, '..');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create DATA_DIR:', e.message);
}

// In-memory state
let database = null;

function getInitialDatabase() {
  return {
    profile: {
      name: "Alex Vance",
      title: "MBA Candidate & Operations/Product Specialist",
      tagline: "just do not simply learn, build along with it",
      targetRoles: ["Operations Management", "Business Operations Analyst", "Product Management"],
      availableDailyMinutes: 20,
      difficulty: "Intermediate",
      learningGoals: [
        "Master Structured Executive Communication",
        "Operations & Process Excellence (SOPs, Bottleneck Analysis)",
        "Build 3 Tangible Proof-of-Work Portfolio Projects",
        "Aces in Term II MBA Subjects"
      ],
      skills: {
        "Executive Communication": 65,
        "Process Mapping & SOPs": 75,
        "Critical Thinking & Decision Making": 70,
        "Brand Strategy": 60,
        "Business Analytics": 55,
        "Execution & Project Mgmt": 80
      }
    },
    settings: {
      geminiApiKey: process.env.GEMINI_API_KEY || "",
      openaiApiKey: process.env.OPENAI_API_KEY || "",
      theme: "warm-studio",
      notificationsEnabled: true,
      outlookCalendar: {
        status: "disconnected", // disconnected | connected | configured
        clientId: "",
        lastSync: null,
        note: "Microsoft Graph calendar integration is optional. You can configure credentials in Settings or manually track your academic deadlines."
      }
    },
    dailyWorkout: {
      date: new Date().toISOString().split('T')[0],
      currentStep: 1, // 1: Read/Watch (5m), 2: Explain (5m), 3: Structure (5m), 4: Record/Reflect (5m)
      timeSpentSeconds: 0,
      isCompleted: false,
      history: []
    },
    quickCaptures: [
      {
        id: "qc-1",
        content: "Bottleneck in warehouse dispatch happens during the manual invoice verification step, not physical packaging.",
        category: "business_observation",
        tags: ["Operations", "Warehouse", "Bottlenecks"],
        targetModule: "Operations Lab",
        status: "inbox",
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: "qc-2",
        content: "Idea for PM2 project: A unified API gateway monitoring tool for microservices latency tracking.",
        category: "project_thought",
        tags: ["PM2", "APIs", "TechDebt"],
        targetModule: "Project Incubator",
        status: "organized",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ],
    subjects: [
      {
        id: "pm2",
        code: "PM-502",
        name: "Product Management II (PM2)",
        description: "Day-wise PM presentations, APIs and integrations, Frontend/Backend architecture, DBs, Cloud, Tech debt, Build vs Buy.",
        color: "#1E3A5F",
        accent: "#EBF4FF",
        icon: "Layers",
        totalSessions: 12,
        completedSessions: 4
      },
      {
        id: "microecon",
        code: "ECON-501",
        name: "Microeconomics",
        description: "Consumer behavior, market mechanism, elasticities, demand estimation, cost of production, profit maximization.",
        color: "#1E6F50",
        accent: "#E6F4EA",
        icon: "TrendingUp",
        totalSessions: 10,
        completedSessions: 6
      },
      {
        id: "market-research",
        code: "MR-504",
        name: "Market Research Methods",
        description: "Research design, problem identification, qualitative & quantitative methods, survey design, data interpretation.",
        color: "#D97706",
        accent: "#FEF3C7",
        icon: "Search",
        totalSessions: 8,
        completedSessions: 3
      },
      {
        id: "emerging-tech",
        code: "TECH-506",
        name: "Introduction to Emerging Technologies",
        description: "AI architectures, enterprise cloud, blockchain applications, IoT, and digital transformation strategy.",
        color: "#0F766E",
        accent: "#F0FDFA",
        icon: "Cpu",
        totalSessions: 8,
        completedSessions: 2
      },
      {
        id: "ui-ux",
        code: "UX-508",
        name: "Introduction to UI/UX",
        description: "Design thinking, information architecture, wireframing, usability heuristics, customer journey mapping.",
        color: "#D95D39",
        accent: "#FDF4F0",
        icon: "Palette",
        totalSessions: 8,
        completedSessions: 3
      },
      {
        id: "leadership",
        code: "LEAD-510",
        name: "Leadership Accelerator",
        description: "Team dynamics, high-performance coaching, influence without authority, crisis communication, execution.",
        color: "#4A3728",
        accent: "#FDF8F3",
        icon: "Compass",
        totalSessions: 6,
        completedSessions: 2
      }
    ],
    materials: [],
    academicNotes: [],
    quizzes: [],
    communicationAttempts: [
      {
        id: "ca-1",
        prompt: "Explain the difference between Fixed Costs and Sunk Costs to a non-finance stakeholder.",
        durationSeconds: 145,
        transcript: "Fixed costs are expenses that do not change with the level of output in the short run, like office rent. Sunk costs are costs that have already been incurred and cannot be recovered by any future decision. Basically, when making future decisions, sunk costs should be ignored, whereas fixed costs can still be negotiated or avoided when planning long-term contracts.",
        clarityScore: 88,
        feedback: {
          fillerWords: ["basically"],
          strengths: ["Clean distinction between unrecoverable past costs and committed current overhead.", "Used an accessible real-world example (rent)."],
          improvements: ["Avoid opening with definition-first; try opening with a decision dilemma (e.g. 'Should we cancel a project?') before introducing the terminology."]
        },
        category: "Explaining Business Concepts",
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ],
    thoughtBuilderEntries: [
      {
        id: "tb-1",
        title: "Standardizing Warehouse Handoffs",
        rawInput: "I noticed the fulfillment team blames customer service for missing notes and CS blames the drivers. We need a clear checklist so whoever accepts a parcel signs off. If it's late we should know exactly whose queue it sat in.",
        framework: "PRE",
        structured: {
          point: "Implement a digital chain-of-custody checklist for all warehouse order handoffs.",
          reason: "Lack of explicit queue ownership causes cross-department blame and adds an average of 4.5 hours of unlogged latency per order.",
          example: "In Tuesday's delayed electronics batch, orders sat uninspected for three hours because dispatch assumed customer service had not verified payment.",
          conclusion: "By establishing timestamped digital sign-offs, we eliminate ambiguities and protect customer delivery SLAs."
        },
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ],
    skillTracks: [
      {
        id: "track-consumer",
        title: "Consumer Understanding",
        category: "Consumer Behavior & Insights",
        progress: 60,
        modules: [
          { id: "m-c1", title: "Uncovering Latent Needs vs Stated Desires", completed: true },
          { id: "m-c2", title: "Cognitive Biases in Purchasing Decisions", completed: true },
          { id: "m-c3", title: "Jobs-to-Be-Done (JTBD) Framework in Action", completed: false },
          { id: "m-c4", title: "Interpreting Qualitative Research Without Confirmation Bias", completed: false }
        ]
      },
      {
        id: "track-brand",
        title: "Brand Strategy",
        category: "Positioning & Differentiation",
        progress: 45,
        modules: [
          { id: "m-b1", title: "Distinctive Brand Assets (Sharp vs Kotler debate)", completed: true },
          { id: "m-b2", title: "Positioning Statements that Actually Guide Trade-offs", completed: false },
          { id: "m-b3", title: "Brand Architecture: House of Brands vs Branded House", completed: false },
          { id: "m-b4", title: "Measuring Brand Equity & Mental Availability", completed: false }
        ]
      },
      {
        id: "track-business",
        title: "Business Knowledge",
        category: "Economics & Revenue Models",
        progress: 75,
        modules: [
          { id: "m-bk1", title: "Unit Economics: CAC, LTV, Contribution Margin", completed: true },
          { id: "m-bk2", title: "Dissecting Platform & Marketplace Flywheels", completed: true },
          { id: "m-bk3", title: "Cost Structure Analysis: Fixed, Variable, Marginal", completed: true },
          { id: "m-bk4", title: "Working Capital & Cash Conversion Cycles", completed: false }
        ]
      },
      {
        id: "track-analytical",
        title: "Analytical Thinking",
        category: "Data & Critical Judgment",
        progress: 50,
        modules: [
          { id: "m-at1", title: "Separating Correlation from Causation in Business KPIs", completed: true },
          { id: "m-at2", title: "First-Principles Decomposition of Complex Systems", completed: true },
          { id: "m-at3", title: "Scenario Modeling & Sensitivity Analysis", completed: false },
          { id: "m-at4", title: "Evaluating Evidence Quality & Challenging Assumptions", completed: false }
        ]
      },
      {
        id: "track-comm",
        title: "Communication and Storytelling",
        category: "Executive Presentations & Persuasion",
        progress: 70,
        modules: [
          { id: "m-cs1", title: "The Pyramid Principle: Lead with the Answer", completed: true },
          { id: "m-cs2", title: "Structuring High-Stakes 2-Minute Executive Updates", completed: true },
          { id: "m-cs3", title: "Translating Technical Details into Business Impact", completed: true },
          { id: "m-cs4", title: "Handling Tough Questions & Pushback in the Boardroom", completed: false }
        ]
      },
      {
        id: "track-execution",
        title: "Execution and Problem Solving",
        category: "Operations & Turnaround",
        progress: 65,
        modules: [
          { id: "m-ex1", title: "Bottleneck Theory (Goldratt's Five Focusing Steps)", completed: true },
          { id: "m-ex2", title: "Drafting Bulletproof Standard Operating Procedures (SOPs)", completed: true },
          { id: "m-ex3", title: "Root Cause Analysis: 5 Whys & Fishbone Execution", completed: true },
          { id: "m-ex4", title: "Change Management: Overcoming Frontline Inertia", completed: false }
        ]
      }
    ],
    brandLabObservations: [
      {
        id: "bl-1",
        brandName: "Liquid Death",
        category: "Beverage / FMCG",
        targetAudience: "Gen Z & Millennials seeking anti-corporate, irreverent healthy lifestyle choices (skaters, punks, non-drinkers at concerts).",
        positioning: "Mountain water branded like heavy metal beer. Murder your thirst.",
        consumerBehavior: "Consumers treat water cans as social identity badges rather than mere hydration commodities.",
        competitorComparison: "Dasani/Aquafina sell generic purity; Liquid Death sells humor, sustainability (aluminum cans), and rebellious belonging.",
        rationale: "They decoupled product utility (water) from cultural packaging, transforming a low-margin commodity into a viral high-margin lifestyle brand.",
        aiFeedback: "Strong observation. Notice how their aluminum can format also solves a genuine ESG concern (single-use plastic) while doubling as an edgy packaging gimmick.",
        isTodayObservation: true,
        createdAt: new Date().toISOString()
      }
    ],
    operationsLab: {
      processMaps: [
        {
          id: "pm-1",
          name: "Customer Refund & Return Resolution Flow",
          department: "Customer Operations & Logistics",
          description: "End-to-end journey from return request to replacement/reimbursement dispatch.",
          steps: [
            { id: "s1", label: "Customer Files Return Request in App", type: "start", owner: "Customer / App", inputs: "Order ID, Reason", outputs: "RMA Ticket #", isBottleneck: false },
            { id: "s2", label: "Automated Eligibility Check (<14 days)", type: "decision", owner: "ERP Rules Engine", inputs: "RMA Ticket", outputs: "Approved / Rejected", isBottleneck: false },
            { id: "s3", label: "Physical Item Inspection at Hub", type: "step", owner: "Warehouse QA Lead", inputs: "Received Package", outputs: "Condition Tag (Grade A/B/Defect)", isBottleneck: true },
            { id: "s4", label: "Finance Approval & Refund Release", type: "step", owner: "Finance Specialist", inputs: "Inspection Signoff", outputs: "Bank Credit Gateway Hook", isBottleneck: false },
            { id: "s5", label: "Customer Confirmation Email & Survey", type: "end", owner: "CRM System", inputs: "Payment Reference", outputs: "Ticket Closed", isBottleneck: false }
          ],
          bottleneckNotes: "Inspection at Hub currently has a 36-hour queue due to manual barcode verification.",
          createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
        }
      ],
      sops: [
        {
          id: "sop-1",
          processName: "Critical Customer Escalation Handling (P1 Incidents)",
          objective: "To resolve high-severity customer service disruptions within 120 minutes with zero communication lapses.",
          scope: "Applies to Tier 2 Support, Operations Duty Managers, and Product Engineering leads.",
          owner: "Operations Duty Manager",
          inputs: ["P1 Incident Trigger", "Customer Account Tier", "Diagnostic Log"],
          steps: [
            "Acknowledge ticket within 5 minutes and assign dedicated Incident Commander.",
            "Post internal war-room link in Slack #ops-critical within 10 minutes.",
            "Dispatch proactive 30-minute status notification to customer VIP contact.",
            "Implement verified hotfix or rollback protocol.",
            "Conduct post-mortem review within 24 hours of incident closure."
          ],
          outputs: ["Resolved Incident State", "Published RCA Document", "Updated Runbook Entry"],
          qualityCheckpoints: ["Mean Time to Detect (MTTD) < 5 mins", "Mean Time to Acknowledge < 10 mins", "Customer NPS score post-fix > 8"],
          escalation: "If uncontained at 45 minutes, immediately page VP of Operations and Lead Architect.",
          exceptions: "Third-party cloud infrastructure outages bypass engineering hotfix and activate Disaster Recovery status page.",
          status: "active",
          createdAt: new Date(Date.now() - 3600000 * 120).toISOString()
        }
      ],
      simulations: [
        {
          id: "sim-1",
          title: "The E-Commerce Black Friday Dispatch Crisis",
          context: "Peak season volume surged by 220%. Orders are stacking up at the packing station. Pickers are waiting 18 minutes per cart because packing benches are overflowing with unlabelled boxes. 3PL couriers are arriving, waiting 40 minutes, and leaving half-loaded.",
          difficulty: "Challenging",
          kpis: ["Order Fulfillment Cycle Time", "Courier Turnaround Time (TAT)", "Order Defect Rate (ODR)"],
          frameworkRecommended: "Theory of Constraints (Goldratt) + 5 Whys",
          resolved: false
        },
        {
          id: "sim-2",
          title: "SaaS Enterprise Onboarding Latency",
          context: "New enterprise accounts take 64 days to go live against an SLA of 30 days. Client sponsors are complaining of silence between contract signing and initial kick-off call. Security questionnaire reviews take 3 weeks alone.",
          difficulty: "Intermediate",
          kpis: ["Time to First Value (TTFV)", "CSAT Onboarding", "Contract Activation Rate"],
          frameworkRecommended: "Value Stream Mapping & Handoff Optimization",
          resolved: true
        }
      ]
    },
    communicationIntelligence: {
      patterns: [
        { pattern: "Prefers starting with definitions rather than user dilemma", occurrences: 4, advice: "Open with the stakes or decision before defining terms." },
        { pattern: "Filler word: 'basically' used when transitioning to conclusions", occurrences: 7, advice: "Replace with a one-second deliberate pause." },
        { pattern: "Strong use of real-world business analogies", occurrences: 8, advice: "Keep anchoring explanations in tangible case studies." }
      ],
      vocabulary: [
        {
          id: "voc-1",
          originalSentence: "We need to fix the big problem with our warehouse people.",
          intendedMeaning: "Address operational friction and lack of throughput accountability.",
          betterWord: "Remediate systemic operational bottlenecks",
          improvedSentence: "We must remediate the operational bottlenecks currently constricting warehouse throughput.",
          category: "Operations",
          mastery: "Mastered",
          reviewDate: new Date().toISOString()
        },
        {
          id: "voc-2",
          originalSentence: "The market doesn't really care about this feature anymore.",
          intendedMeaning: "The feature has become a baseline table-stake rather than a true differentiator.",
          betterWord: "Commoditized / Table-stakes",
          improvedSentence: "This capability has transformed into an industry table-stake rather than a distinct competitive advantage.",
          category: "Brand & Strategy",
          mastery: "Learning",
          reviewDate: new Date().toISOString()
        }
      ]
    },
    decisionRoom: [
      {
        id: "dr-1",
        title: "Customer Acquisition vs Customer Retention in a Downturn",
        scenario: "Your B2B SaaS company faces a 25% marketing budget cut. Sales wants to keep pouring money into top-of-funnel lead generation to replace churned customers. Customer Success argues that increasing retention by 5% will yield 3x more lifetime profit and protect gross margins.",
        options: [
          { id: "opt-1", label: "Option A: Aggressive Acquisition", description: "Allocate 70% of budget to customer acquisition to chase top-line revenue." },
          { id: "opt-2", label: "Option B: Retention Moat", description: "Allocate 70% to customer success, onboarding, and proactive feature adoption." },
          { id: "opt-3", label: "Option C: Account Expansion", description: "Double down on upsells and cross-sells to top 20% highest-margin accounts." }
        ],
        userDecision: null
      },
      {
        id: "dr-2",
        title: "Launch Now with Minor Glitches vs Delay Product Release by 3 Weeks",
        scenario: "Sprint deadline is tomorrow. The core workflow functions, but 3 edge cases cause slow page refreshes for 2% of users. The sales team has already announced the launch date to 50 VIP clients.",
        options: [
          { id: "opt-1", label: "Release on Schedule", description: "Launch with proactive advisory notes and commit to hotfix within 72 hours." },
          { id: "opt-2", label: "Delay Launch by 3 Weeks", description: "Protect customer experience and guarantee bug-free debut." }
        ],
        userDecision: null
      }
    ],
    decisionJournal: [
      {
        id: "dj-1",
        title: "Vendor Selection: Custom Internal Tool vs Third-Party SaaS",
        situation: "Needed an internal ticket-routing system for the 25-person support team.",
        optionsConsidered: ["Build custom in-house dashboard (6 weeks dev time)", "Buy Zendesk/Freshdesk off the shelf ($49/seat/mo)"],
        finalDecision: "Bought off-the-shelf SaaS with 1-year contract.",
        expectedOutcome: "Immediate deployment within 3 days without diverting our two full-stack developers from revenue-generating core product.",
        actualOutcome: "Deployed in 4 days. Saved ~240 engineering hours.",
        lessonsLearned: "Build vs Buy must factor in ongoing maintenance debt, not just initial build time.",
        tags: ["Build vs Buy", "Operations", "PM2"],
        createdAt: new Date(Date.now() - 3600000 * 200).toISOString()
      }
    ],
    curatedLibrary: [
      {
        id: "cl-1",
        title: "The 3 Immutable Rules of Brand Positioning",
        author: "Mark Ritson",
        source: "Marketing Week",
        type: "article",
        url: "https://www.marketingweek.com/mark-ritson-positioning/",
        category: "Brand Strategy",
        readTimeMinutes: 8,
        description: "Why most positioning statements fail: they try to be all things to all consumers instead of choosing what NOT to do.",
        completed: true,
        saved: true
      },
      {
        id: "cl-2",
        title: "How Domino's Re-engineered its 30-Minute Supply Chain",
        author: "Think School",
        source: "Think School (YouTube)",
        type: "video",
        url: "https://www.youtube.com/@TheThinkSchool",
        category: "Operations & Process",
        readTimeMinutes: 16,
        description: "A masterclass in operational layout, standardized ingredient prep, and hub-and-spoke distribution optimization.",
        completed: false,
        saved: true
      },
      {
        id: "cl-3",
        title: "What Is Strategy? The Seminal Foundations",
        author: "Michael E. Porter",
        source: "Harvard Business Review",
        type: "article",
        url: "https://hbr.org/1996/11/what-is-strategy",
        category: "Business Knowledge",
        readTimeMinutes: 20,
        description: "Operational effectiveness is necessary but NOT strategy. Strategy is creating a unique and valuable position involving a different set of activities.",
        completed: true,
        saved: false
      },
      {
        id: "cl-4",
        title: "Liquid Death's $1.4B Disruptive CPG Playbook",
        author: "The Branding Journal",
        source: "The Branding Journal",
        type: "article",
        url: "https://www.thebrandingjournal.com",
        category: "Consumer Understanding",
        readTimeMinutes: 10,
        description: "How irreverent humor, distinctive physical assets, and anti-plastic environmentalism won Gen-Z mindshare.",
        completed: false,
        saved: true
      }
    ],
    ideaCanvas: {
      cards: [
        { id: "ic-1", x: 80, y: 100, title: "SLA Drift in B2B Customer Support", content: "When average handling time is rewarded, agents rush calls and First Contact Resolution plunges. The two metrics must be paired.", color: "#FEF3C7", category: "Operations" },
        { id: "ic-2", x: 420, y: 120, title: "Mental Availability vs Brand Love", content: "Consumers don't obsess over brands; they recall the easiest distinctive cue when buying under cognitive pressure (Sharp).", color: "#FDF4F0", category: "Brand" },
        { id: "ic-3", x: 260, y: 340, title: "Synthesis: The Operations of Brand Promises", content: "A brand promise is marketing debt unless the operational workflow is engineered to deliver it consistently.", color: "#E6F4EA", category: "Synthesis" }
      ],
      connections: [
        { from: "ic-1", to: "ic-3" },
        { from: "ic-2", to: "ic-3" }
      ]
    },
    linkedInDrafts: [
      {
        id: "li-1",
        title: "Why Operational Excellence Is the Real Brand Moat",
        content: `Most business schools teach Marketing and Operations in separate silos.\n\nMarketing makes the promise. Operations is left to fulfill it.\n\nHere is the issue: When marketing promises 'under 30 minutes delivery' or 'frictionless returns', every bottleneck on the warehouse floor turns that campaign into brand erosion.\n\nIn our latest case review on supply chain handoffs:\n→ Unassigned ticket queues caused 40% of customer latency.\n→ Frontline staff were optimizing for AHT instead of First Contact Resolution.\n\nBefore spending another dollar on performance ads, ask:\nDoes your operational workflow actually support the promise you are making?\n\n#Operations #ProductManagement #Leadership #TheGrowthLab`,
        sourceNote: "Synthesized from Liquid Death case & Warehouse Handoffs observation",
        status: "ready_to_share",
        createdAt: new Date().toISOString()
      }
    ],
    careerCompass: {
      targetRoles: [
        {
          id: "cr-ops",
          title: "Operations Management / Business Operations Analyst",
          matchScore: 82,
          requiredSkills: ["Process Mapping & SOPs", "Root Cause Analysis (5 Whys/Fishbone)", "SLA & TAT Optimization", "Cross-Functional Execution", "Excel/Power BI"],
          userStrengths: ["Process Mapping & SOPs", "Root Cause Analysis (5 Whys/Fishbone)", "Cross-Functional Execution"],
          gaps: ["Advanced Excel/Power BI Dashboards", "Statistical Process Control"],
          recommendedTracks: ["Operations Lab", "Business Analytics Practice Lab"]
        },
        {
          id: "cr-pm",
          title: "Product Manager (Technical & B2B)",
          matchScore: 78,
          requiredSkills: ["API Architecture & Data Modeling", "PRD Writing & User Stories", "Prioritization Frameworks (RICE)", "Build vs Buy Analysis"],
          userStrengths: ["Prioritization Frameworks (RICE)", "Build vs Buy Analysis"],
          gaps: ["System Architecture & Tech Debt Evaluation", "SQL Querying"],
          recommendedTracks: ["PM2 Academic Hub", "Business Analytics Practice Lab"]
        },
        {
          id: "cr-brand",
          title: "Brand Strategist / Consumer Insights Lead",
          matchScore: 70,
          requiredSkills: ["Consumer Segmentation", "Distinctive Asset Strategy", "Qualitative Research Design", "Competitive Teardowns"],
          userStrengths: ["Competitive Teardowns", "Distinctive Asset Strategy"],
          gaps: ["Quantitative Conjoint Analysis", "Brand Health Tracking Studies"],
          recommendedTracks: ["Brand Lab", "Market Research Methods"]
        }
      ],
      resumeSummary: "MBA Candidate with background in operational workflows, structured business analysis, and cross-functional team coordination."
    },
    interviewStories: [
      {
        id: "is-1",
        title: "Resolving Cross-Team Logistics Latency During Peak Demand",
        framework: "STAR",
        competency: "Operations & Crisis Execution",
        roleCategory: "Operations Management",
        situation: "During our seasonal peak, customer delivery complaints spiked by 45% due to bottlenecks at the regional distribution center.",
        task: "I was assigned to identify the root cause within 48 hours and restore our 98% on-time fulfillment SLA without increasing temporary headcount.",
        action: "I mapped the end-to-end fulfillment stream on-site. I discovered that packers were manually waiting for printed invoices from a single shared printer. I reorganized the flow into cell-based stations with localized label printers and introduced a standardized 4-point handover checklist.",
        result: "Turnaround time per package dropped from 18 minutes to 9 minutes. On-time delivery returned to 99.2% within 5 days, saving an estimated $35,000 in SLA penalty rebates.",
        aiFollowUp: "How did you manage pushback from older warehouse staff who resisted moving away from the central printer desk?",
        conciseVersion: "Faced with a 45% spike in fulfillment complaints during peak season, I mapped the packing workflow, identified a single printer bottleneck, and redesigned cell-based stations with local label printers—cutting packaging cycle time by 50% and restoring our 99% SLA.",
        createdAt: new Date(Date.now() - 3600000 * 96).toISOString()
      }
    ],
    proofOfWorkProjects: [
      {
        id: "pow-1",
        title: "End-to-End Fulfillment Cycle Time Reduction by 50%",
        category: "Operations & Process Improvement",
        problemStatement: "Regional distribution hub suffered an unmitigated 45% spike in SLA delivery breaches caused by unmapped physical handoff friction.",
        background: "Warehouse dispatched 25,000 units weekly but suffered from an antiquated centralized paperwork flow dating back to 2018.",
        objective: "Eliminate packing queue latency and recover 99%+ on-time customer delivery SLA within 7 days.",
        researchAndAnalysis: "Conducted Time-and-Motion study across 40 order pick cycles. Identified that 38% of total cycle time was non-value-add transit between packing benches and the solitary central paperwork printer.",
        proposedSolution: "Decentralized packing cells with dedicated thermal label printers, automated invoice digital sync, and a 4-step Standard Operating Procedure (SOP).",
        implementation: "Piloted in Zone B for 24 hours. Iterated packing ergonomics. Rolled out to all 12 zones with a 30-minute frontline training session.",
        impact: "Turnaround time cut from 18 min to 9 min per parcel. Zero SLA penalty fees incurred. 100% team adoption.",
        skillsDemonstrated: ["Process Mapping", "Value Stream Mapping", "Standard Operating Procedures (SOP)", "Frontline Change Management"],
        status: "Completed",
        createdAt: new Date(Date.now() - 3600000 * 120).toISOString()
      }
    ],
    projectIncubator: [
      {
        id: "pi-1",
        title: "Digital Chain-of-Custody for Third-Party Logistics Handover",
        origin: "Brand & Operations Lab Observation",
        problem: "Courier drivers and warehouse staff dispute package damage liability, causing delayed customer claims.",
        targetAudience: "3PL Logistics Managers and Dispatch Coordinators",
        objective: "Create a lightweight mobile-web QR verification prototype that logs time, condition, and digital signature in <10 seconds.",
        assumptions: ["Drivers will carry smartphones with active data.", "Camera scanning is faster than paper clipboards."],
        milestones: [
          { title: "Process Map of Current Handover", completed: true },
          { title: "Define Data Schema & API Contract", completed: true },
          { title: "Build Interactive Prototype", completed: false },
          { title: "Test with Frontline Team", completed: false }
        ],
        status: "in_progress",
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ],
    assignments: [
      {
        id: "as-1",
        title: "Microeconomics: Cost Curves & Profit Maximization Problem Set",
        subjectId: "microecon",
        dueDate: new Date(Date.now() + 3600000 * 24 * 3).toISOString().split('T')[0],
        priority: "must",
        status: "pending",
        estimatedMinutes: 90,
        linkedMaterial: "cost of production.pptx"
      },
      {
        id: "as-2",
        title: "PM2: System Architecture Diagram & Technical Debt Audit",
        subjectId: "pm2",
        dueDate: new Date(Date.now() + 3600000 * 24 * 5).toISOString().split('T')[0],
        priority: "must",
        status: "pending",
        estimatedMinutes: 120,
        linkedMaterial: "Session 4 APIs and Microservices"
      },
      {
        id: "as-3",
        title: "Market Research: Qualitative Interview Protocol Design",
        subjectId: "market-research",
        dueDate: new Date(Date.now() + 3600000 * 24 * 7).toISOString().split('T')[0],
        priority: "should",
        status: "pending",
        estimatedMinutes: 60,
        linkedMaterial: "S2 Problem Identification.pdf"
      },
      {
        id: "as-4",
        title: "Leadership Accelerator: Conflict Case Study Reflection",
        subjectId: "leadership",
        dueDate: new Date(Date.now() + 3600000 * 24 * 10).toISOString().split('T')[0],
        priority: "optional",
        status: "pending",
        estimatedMinutes: 45,
        linkedMaterial: "Modules 1_2.pdf"
      }
    ],
    executionPlanner: {
      todayMustDo: [
        { id: "ep-1", title: "Complete 20-Minute Communication Workout", timeEst: 20, completed: false, category: "Skill Development" },
        { id: "ep-2", title: "Microeconomics Cost of Production Review (Slides 1-15)", timeEst: 35, completed: false, category: "MBA Academics" }
      ],
      todayShouldDo: [
        { id: "ep-3", title: "Refine Warehouse Handoff SOP Draft", timeEst: 25, completed: false, category: "Operations Lab" },
        { id: "ep-4", title: "Review 1 Thought Builder Framework", timeEst: 15, completed: true, category: "Skill Development" }
      ],
      todayOptional: [
        { id: "ep-5", title: "Draft LinkedIn Post on Supply Chain Promises", timeEst: 15, completed: false, category: "LinkedIn Creation" }
      ]
    }
  };
}

export function loadDatabase() {
  if (database) return database;

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      database = JSON.parse(content);
      // Auto-scan workspace files and ensure existing documents are indexed
      syncWorkspaceMaterials();
      return database;
    } catch (err) {
      console.error('Error loading db.json, falling back to default:', err.message);
    }
  }

  // Fallback to bundled seed data if DB_FILE does not exist yet (e.g. on Vercel)
  if (fs.existsSync(SEED_DB_FILE)) {
    try {
      const content = fs.readFileSync(SEED_DB_FILE, 'utf8');
      database = JSON.parse(content);
      syncWorkspaceMaterials();
      saveDatabase();
      return database;
    } catch (err) {
      console.error('Error loading seed db.json:', err.message);
    }
  }

  database = getInitialDatabase();
  syncWorkspaceMaterials();
  saveDatabase();
  return database;
}

export function saveDatabase() {
  if (!database) return;
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(database, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving db.json:', err.message);
  }
}

/**
 * Automatically inspects the repository folders and links actual academic files:
 * - leadership accelarator/Modules 1_2.pdf -> leadership
 * - market research/S1 Introduction to the course.pdf -> market-research
 * - market research/S2 Problem Identification.pdf -> market-research
 * - micro econmics/Consumer Behavior1 (003).pptx -> microecon
 * - micro econmics/cost of production.pptx -> microecon
 * - micro econmics/Deand Estimation1.pptx -> microecon
 * STRICT EXCLUSION: Never imports Entrepreneurial Mindset!
 */
export function syncWorkspaceMaterials() {
  if (!database) return;
  if (!database.materials) database.materials = [];

  const mappings = [
    { folder: 'leadership accelarator', subjectId: 'leadership', sessionPrefix: 'Modules 1 & 2' },
    { folder: 'market research', subjectId: 'market-research', sessionPrefix: 'Market Research Foundations' },
    { folder: 'micro econmics', subjectId: 'microecon', sessionPrefix: 'Microeconomic Principles' }
  ];

  for (const map of mappings) {
    const folderPath = path.join(WORKSPACE_DIR, map.folder);
    if (!fs.existsSync(folderPath)) continue;

    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      const fullPath = path.join(folderPath, file);
      const stat = fs.statSync(fullPath);
      if (!stat.isFile()) continue;

      // Strict exclusion check
      if (file.toLowerCase().includes('entrepreneurial')) continue;

      const hash = computeFileHash(fullPath);
      const ext = path.extname(file).replace('.', '').toLowerCase();
      
      const existing = database.materials.find(m => m.hash === hash || m.filename === file);
      if (!existing) {
        console.log(`Auto-importing academic resource: ${file} into ${map.subjectId}`);
        const extracted = extractDocumentText(fullPath, ext);
        database.materials.push({
          id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          subjectId: map.subjectId,
          filename: file,
          originalPath: fullPath,
          title: file.replace(/\.[^/.]+$/, ''),
          session: map.sessionPrefix,
          fileType: ext,
          sizeBytes: stat.size,
          uploadDate: stat.mtime.toISOString(),
          hash: hash,
          extractedTextPreview: extracted ? extracted.slice(0, 1500) : '',
          extractedTextFullLength: extracted ? extracted.length : 0,
          isBookmarked: false,
          studyStatus: "in_progress",
          notes: []
        });
      }
    }
  }
}
