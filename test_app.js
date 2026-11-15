/**
 * Comprehensive Automated Verification Suite for THE GROWTH LAB
 * Tests all core backend endpoints, persistence, document indexing, and user journeys.
 */

async function runTests() {
  const BASE_URL = 'http://localhost:3001';
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  console.log('\n--- STARTING THE GROWTH LAB TEST SUITE ---\n');

  // Test 1: Health check
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert(res.ok && data.status === 'ok', 'Health check returns status ok');
  } catch (err) {
    assert(false, `Health check failed: ${err.message}`);
  }

  // Test 2: App state retrieval & database verification
  let state = null;
  try {
    const res = await fetch(`${BASE_URL}/api/state`);
    state = await res.json();
    assert(res.ok && state.profile && state.profile.name, 'Full state loaded with user profile');
    assert(state.subjects.length === 6, 'Contains exactly 6 required MBA subjects');
    
    // Strict exclusion check
    const hasEntrepreneurial = state.subjects.some(s => s.name.toLowerCase().includes('entrepreneurial')) ||
      state.materials.some(m => m.filename.toLowerCase().includes('entrepreneurial'));
    assert(!hasEntrepreneurial, 'STRICT EXCLUSION: Entrepreneurial Mindset is NOT present in subjects or materials');
  } catch (err) {
    assert(false, `State retrieval failed: ${err.message}`);
  }

  // Test 3: Auto-imported academic documents verification
  if (state && state.materials) {
    const expectedFiles = [
      'Modules 1_2.pdf',
      'S1 Introduction to the course.pdf',
      'S2 Problem Identification.pdf',
      'Consumer Behavior1 (003).pptx',
      'cost of production.pptx',
      'Deand Estimation1.pptx'
    ];

    expectedFiles.forEach(f => {
      const found = state.materials.find(m => m.filename === f);
      assert(Boolean(found), `Preserved & indexed actual academic file: ${f} in subject: ${found?.subjectId}`);
    });

    const pptxDoc = state.materials.find(m => m.filename.includes('cost of production'));
    assert(pptxDoc && pptxDoc.extractedTextFullLength > 1000, `Extracted slide text from PPTX (${pptxDoc?.extractedTextFullLength} chars)`);
  }

  // Test 4: Quick Capture endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/quick-capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Automated Test: Bottleneck in dispatch staging',
        category: 'business_observation',
        tags: ['Test', 'Ops'],
        targetModule: 'Operations Lab'
      })
    });
    const capture = await res.json();
    assert(res.ok && capture.id && capture.targetModule === 'Operations Lab', 'Quick Capture created and routed successfully');
  } catch (err) {
    assert(false, `Quick capture failed: ${err.message}`);
  }

  // Test 5: Communication Gym evaluation & attempt
  try {
    const res = await fetch(`${BASE_URL}/api/communication/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Explain sunk cost fallacy',
        durationSeconds: 90,
        transcript: 'Basically, sunk costs have already been spent and cannot be recovered by any future decision.',
        category: 'Explaining Business Concepts'
      })
    });
    const attempt = await res.json();
    assert(res.ok && attempt.clarityScore > 0, `Communication attempt saved with clarity score: ${attempt.clarityScore}`);
    assert(attempt.feedback.fillerWords.includes('basically'), 'Detected verbal filler word: "basically"');
  } catch (err) {
    assert(false, `Communication gym failed: ${err.message}`);
  }

  // Test 6: Thought Builder structuring
  try {
    const res = await fetch(`${BASE_URL}/api/ai/thought-builder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawText: 'Our delivery queue is late because nobody signs off on package handover.',
        framework: 'PRE'
      })
    });
    const tb = await res.json();
    assert(res.ok && tb.structuredOutput, 'Thought Builder structured raw text into PRE framework');
  } catch (err) {
    assert(false, `Thought builder failed: ${err.message}`);
  }

  // Test 7: Operations Lab SOP builder
  try {
    const res = await fetch(`${BASE_URL}/api/operations/sop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        processName: 'Test Warehouse Intake Protocol',
        objective: 'Validate all incoming shipments within 30 minutes',
        scope: 'Warehouse Receiving Team',
        owner: 'Intake Lead',
        inputs: ['Bill of Lading', 'Physical pallets'],
        steps: ['Scan barcode', 'Verify condition tag', 'Update ERP stock level'],
        outputs: ['Receipt signed', 'Inventory ledger updated'],
        qualityCheckpoints: ['Zero damage unlogged'],
        escalation: 'Page duty manager if discrepancies > 5%',
        exceptions: 'Cold-chain items take priority'
      })
    });
    const sop = await res.json();
    assert(res.ok && sop.processName === 'Test Warehouse Intake Protocol', 'SOP Builder saved full 10-section operational SOP');
  } catch (err) {
    assert(false, `SOP creation failed: ${err.message}`);
  }

  // Test 8: Decision Room submission
  try {
    const res = await fetch(`${BASE_URL}/api/decision-room/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challengeId: 'dr-1',
        userDecision: 'Option B: Retention Moat',
        rationale: 'Protecting retention creates higher LTV during macroeconomic contraction.',
        evidence: 'Customer retention yields 3x higher gross margin',
        assumptions: 'Existing customers have high willingness to expand',
        tradeOffs: 'Slower top-line new logo acquisition'
      })
    });
    const dec = await res.json();
    assert(res.ok && dec.success, 'Decision Room critical judgment submitted');
  } catch (err) {
    assert(false, `Decision submission failed: ${err.message}`);
  }

  // Test 9: On-demand Quiz generation
  try {
    const res = await fetch(`${BASE_URL}/api/ai/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: 'microecon',
        docTitle: 'Cost of Production & Competitive Supply'
      })
    });
    const quizData = await res.json();
    assert(res.ok && Array.isArray(quizData.quiz) && quizData.quiz.length === 3, 'On-demand 3-question quiz generated dynamically');
  } catch (err) {
    assert(false, `Quiz generation failed: ${err.message}`);
  }

  // Test 10: AI Learning Coach critical thinking partner
  try {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Should we cut marketing budget to increase short-term profit?',
        context: { subject: 'Microeconomics' }
      })
    });
    const aiResp = await res.json();
    assert(res.ok && aiResp.text && aiResp.text.includes('assumption'), 'AI Coach acts as critical thinking partner challenging assumptions');
  } catch (err) {
    assert(false, `AI Coach chat failed: ${err.message}`);
  }

  // Test 11: Static frontend serving check
  try {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();
    assert(res.ok && html.includes('THE GROWTH LAB'), 'Root URL serves production React frontend with The Growth Lab branding');
  } catch (err) {
    assert(false, `Static frontend check failed: ${err.message}`);
  }

  console.log(`\n--- TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---\n`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
