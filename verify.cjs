const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const bank=JSON.parse(fs.readFileSync('papers/verified-bank.json','utf8'));
const lectures=JSON.parse(fs.readFileSync('lectures/lectures.json','utf8'));
assert.equal(new Set(bank.questions.map(q=>q.id)).size,bank.questions.length);
const elements=new Map();const storage=new Map();
const element=()=>({innerHTML:'',insertAdjacentHTML(){},classList:{toggle(){}},addEventListener(){}});
const context={window:{scrollTo(){},LECTURES:lectures},document:{querySelector(s){if(!elements.has(s))elements.set(s,element());return elements.get(s)},documentElement:{dataset:{}}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},clearInterval(){},setInterval(){},setTimeout(){},URL,console};context.window.window=context.window;
vm.createContext(context);vm.runInContext(fs.readFileSync('evidence-ui.js','utf8'),context);vm.runInContext(fs.readFileSync('app.js','utf8'),context);
context.bank=bank;vm.runInContext(`validate(bank.questions);for(const q of bank.questions){if(score(q,q.correct)!==1||!exact(q,q.correct)||score(q,[])!==0)throw Error(q.id)}`,context);
for(const q of bank.questions){for(const e of q.evidence||[]){const d=lectures.find(d=>d.id===e.lectureId);assert(d);assert(e.page>=1&&e.page<=d.pages.length);assert(d.pages[e.page-1].text.replace(/\s+/g,' ').trim().includes(e.excerpt));assert(fs.existsSync(d.file.replace(/^\//,'')))}for(const r of q.externalReferences||[])assert.equal(new URL(r.url).protocol,'https:')}
for(const file of ['source-library.js','course-ui.js'])new vm.Script(fs.readFileSync(file,'utf8'));
console.log(`Passed: ${bank.questions.length} question structures, answer scoring, lecture excerpts, local references and script syntax.`);
