const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const bank=JSON.parse(fs.readFileSync('papers/verified-bank.json','utf8'));
const lectures=JSON.parse(fs.readFileSync('lectures/lectures.json','utf8'));
assert.equal(new Set(bank.questions.map(q=>q.id)).size,bank.questions.length);
const elements=new Map();const storage=new Map();
const element=()=>({value:'',innerHTML:'',insertAdjacentHTML(){},classList:{toggle(){}},addEventListener(){}});
const context={window:{scrollTo(){},LECTURES:lectures},document:{querySelector(s){if(!elements.has(s))elements.set(s,element());return elements.get(s)},documentElement:{dataset:{}}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},clearInterval(){},setInterval(){},setTimeout(){},URL,console};context.window.window=context.window;
vm.createContext(context);vm.runInContext(fs.readFileSync('evidence-ui.js','utf8'),context);vm.runInContext(fs.readFileSync('app.js','utf8'),context);
context.bank=bank;vm.runInContext(`validate(bank.questions);for(const q of bank.questions){if(score(q,q.correct)!==1||!exact(q,q.correct)||score(q,[])!==0)throw Error(q.id)}`,context);
for(const q of bank.questions){for(const e of q.evidence||[]){const d=lectures.find(d=>d.id===e.lectureId);assert(d);assert(e.page>=1&&e.page<=d.pages.length);assert(d.pages[e.page-1].text.replace(/\s+/g,' ').trim().includes(e.excerpt));assert(fs.existsSync(d.file.replace(/^\//,'')))}for(const r of q.externalReferences||[])assert.equal(new URL(r.url).protocol,'https:')}
for(const file of ['source-library.js','course-ui.js'])new vm.Script(fs.readFileSync(file,'utf8'));
console.log(`Passed: ${bank.questions.length} question structures, answer scoring, lecture excerpts, local references and script syntax.`);

for (const script of [
  'papers/sources.js',
  'lectures/lectures.js',
  'papers/checked-bank.js',
  'papers/verified-bank.js',
  'source-library.js',
  'course-ui.js',
  'papers/midterm-3.js',
  'midterm-3-ui.js'
]) {
  vm.runInContext(fs.readFileSync(script, 'utf8'), context);
  for (const [key, value] of Object.entries(context.window)) {
    if (!(key in context)) context[key] = value;
  }
}
vm.runInContext(`
  const requireCheck = (value, message) => { if (!value) throw Error(message); };
  requireCheck(midterm3Topics.length === 4, 'Expected four Midterm 3 topics');
  requireCheck(midterm3Bank.length === 160, 'Expected the in-scope bank');
  requireCheck(new Set(midterm3Bank.map(q => q.id)).size === midterm3Bank.length, 'Duplicate Midterm 3 IDs');
  requireCheck(db.questions.length === bank.questions.length + midterm3Practice.length, 'Earlier questions should survive installation');
  requireCheck(midterm3Bank.filter(q => q.verification === 'midterm3-unverified').length === 138, 'Missing unverified answers');
  requireCheck(midterm3Practice.length === 160, 'Expected all usable source and inferred keys');
  requireCheck(midterm3Practice.filter(q => q.verification === 'midterm3-unverified').length === 138, 'Missing inferred keys');
  requireCheck(!midterm3Bank.some(q => q.scored && !q.correct.length), 'Cannot score without a choice key');
  const inferred = midterm3Practice.find(q => q.bankId === 'q0215');
  requireCheck(renderEvidence(inferred).includes('Unverified answer'), 'Inferred scoring provenance');
  for (const q of midterm3Practice) {
    requireCheck(q.verification === 'midterm3-unverified' || (q.sourceReviewed && !q.ocrDraft && q.verification === 'midterm3-source-key'), q.id);
    requireCheck(score(q, q.correct) === 1 && score(q, []) === 0, q.id);
  }
  openMidterm3();
  $('#m3-topic').value = '';
  $('#m3-answer-status').value = 'midterm3-unverified';
  $('#m3-search').value = 'q0215';
  renderMidterm3();
  requireCheck($('#m3-results').innerHTML.includes('q0215 · Unverified answer'), 'Answer filter');
  requireCheck($('#m3-results').innerHTML.includes('A, B, C'), 'Inferred choice labels');
  $('#m3-topic').value = 'Immunity';
  startMidterm3();
  requireCheck(session.qs.length > 0 && session.qs.every(q => q.scored && q.topics.includes('Immunity')), 'Topic practice');
`, context);
console.log('Passed: Midterm 3 migration, provenance, answer filtering and topic-scoped scoring.');

const part3Html = fs.readFileSync('index.html', 'utf8');
const part3Script = part3Html.match(/<script>([\s\S]*?)<\/script>/)[1];
const part3Elements = new Map();
const part3Storage = new Map();
const part3Element = () => ({
  value: '', innerHTML: '', querySelectorAll: () => [],
  classList: { toggle() {}, contains() { return false; }, remove() {} }
});
const part3 = vm.createContext({
  document: {
    querySelector(selector) {
      if (!part3Elements.has(selector)) part3Elements.set(selector, part3Element());
      return part3Elements.get(selector);
    },
    body: part3Element(),
    documentElement: part3Element(),
    addEventListener() {}
  },
  window: { scrollTo() {}, addEventListener() {} },
  localStorage: {
    getItem: k => part3Storage.get(k) ?? null,
    setItem: (k, v) => part3Storage.set(k, v)
  },
  setInterval: () => 1, clearInterval() {}
});
vm.runInContext(part3Script, part3);
vm.runInContext(`
  function expect(value, message) { if (!value) throw Error(message); }
  expect(app.innerHTML.includes('Midterm test 3'), 'Part 3 hub');
  expect(REVIEW_BANK.length === 160 && BANK.length === 160 && TOPICS.length === 4, 'Part 3 data');
  expect(BANK.filter(unoff).length === 138 && BANK.filter(asked).length > 0, 'Practice filters');
  expect(JSON.stringify(REVIEW_BANK) === JSON.stringify(BANK), 'Only edited questions are public');
  const rawOcrMarker = /\\[unclear\\]|\\[cropped\\]|Translated text|Select all YES NO|moodle\\.upol\\.cz|PHOTO-[0-9]/i;
  for (const q of BANK) {
    expect(!rawOcrMarker.test([q.q, q.why, ...q.opts].join(' ')), 'Raw OCR in ' + q.id);
    expect(q.correct.length > 0 && q.correct.every(k => k >= 0 && k < q.opts.length), q.id);
    expect(q.optionWhy.length === q.opts.length && q.optionWhy.every(reason => typeof reason === 'string' && reason.trim()), 'Missing choice explanation for ' + q.id);
    expect(grade(q, new Set(q.correct)).part === 1 && grade(q, new Set()).part === 0, q.id);
  }
  sheet();
  $('#s').value = 'q0215';
  $('#s').oninput();
  expect($('#list').innerHTML.includes('Unverified answer'), 'Cheat sheet search and labels');
  written();
  expect(app.innerHTML.includes(WRITTEN[0].q), 'Written practice');
  mock();
  expect(app.innerHTML.includes('Moodle-style mock'), 'Mock screen');
  expect(wspread(BANK, TOPICS.map(t => t.id), 10).length === 10, 'Balanced mock');
  const inferredPart3 = BANK.find(q => q.id === 'midterm3-q0215');
  practice([inferredPart3], 'Test practice', false);
  $('#next').onclick();
  expect(app.innerHTML.includes('Unverified answer: inferred from the study material.'), 'Practice feedback');
  expect(app.innerHTML.includes('Missed correct choice'), 'Missing-choice feedback');
  expect(app.innerHTML.includes('Histamine dilates vessels and reduces systemic vascular resistance.'), 'Reason follows the shuffled choice');
  const mismatchFeedback = optionFeedback(inferredPart3, new Set([0, 3]));
  expect(mismatchFeedback.includes('Incorrect choice you picked') && mismatchFeedback.includes('Hyperkalemia is a different mechanism.'), 'Wrong-choice explanation');
  expect(!mismatchFeedback.includes('Mast-cell leukotrienes contract bronchial smooth muscle.'), 'Fully correct selections do not clutter correction feedback');
  $('#next').onclick();
  expect(store.get('sessions', []).length === 1, 'Session recorded');
  practice([inferredPart3], 'Timed test', true, 20);
  expect($('#clock').textContent.includes('left'), 'Timer');
  $('#next').onclick();
  expect(store.get('q', {})[inferredPart3.id].seen === 2, 'Mock scored and saved');
`, part3);
assert(part3Storage.has('ppmt3_q'));
console.log('Passed: Part 3 template hub, search, written practice, timed mocks, scoring and local progress.');
