const midterm3Bank = window.MIDTERM_3_BANK;
const midterm3Practice = midterm3Bank.filter(question => question.scored);
const midterm3Version = 'midterm-3-bank-v4';

if (!localStorage.getItem(midterm3Version)) {
  validate(midterm3Practice);
  const oldQuestions = new Map(db.questions.map(question => [question.id, question]));
  const merged = new Map(db.questions.filter(question => !question.id.startsWith('midterm3-')).map(question => [question.id, question]));
  const editedIds = new Set(midterm3Practice.map(question => question.id));
  for (const id of oldQuestions.keys()) {
    if (id.startsWith('midterm3-') && !editedIds.has(id)) {
      delete db.attempts[id];
      db.bookmarks = db.bookmarks.filter(bookmark => bookmark !== id);
    }
  }
  for (const question of midterm3Practice) {
    const old = oldQuestions.get(question.id);
    if (old && (old.question !== question.question ||
        JSON.stringify(old.options) !== JSON.stringify(question.options) ||
        JSON.stringify(old.correct) !== JSON.stringify(question.correct))) {
      delete db.attempts[question.id];
    }
  }
  for (const question of midterm3Practice) merged.set(question.id, question);
  db.questions = [...merged.values()];
  save();
  localStorage.setItem(midterm3Version, 'installed');
}

const homeBeforeMidterm3 = home;
home = function () {
  homeBeforeMidterm3();
  app.insertAdjacentHTML('afterbegin', `
    <section class="panel">
      <h2>Midterm 3</h2>
      <p>Liver, biliary tract and exocrine pancreas · Hemostasis · Blood · Immunity</p>
      <div class="toolbar">
        <button class="solid" onclick="openMidterm3()">Open Midterm 3 →</button>
      </div>
    </section>`);
};

const midterm3Topics = [...new Set(midterm3Bank.flatMap(question => question.topics))];
let midterm3Limit = 30;

function openMidterm3() {
  session = null;
  view = 'midterm3';
  page(`
    <button onclick="home()">← Hub</button>
    <h1>Midterm 3 question bank</h1>
    <p class="intro">${midterm3Bank.length} edited questions · ${midterm3Practice.length} available for scored practice</p>
    <p class="muted">Scored practice includes both source keys and answers labelled Unverified answer.</p>
    <div class="toolbar">
      <select id="m3-topic" aria-label="Choose a Midterm 3 topic" onchange="renderMidterm3()">
        <option value="">All four topics</option>
        ${midterm3Topics.map(topic => `<option>${esc(topic)}</option>`).join('')}
      </select>
      <button class="solid" onclick="startMidterm3()">Start scored practice</button>
    </div>
    <h2>Question review</h2>
    <div class="toolbar">
      <select id="m3-answer-status" aria-label="Filter answer status" onchange="renderMidterm3()">
        <option value="">All answer statuses</option>
        <option value="midterm3-source-key">Source answer key</option>
        <option value="midterm3-unverified">Unverified answer</option>
      </select>
      <input id="m3-search" type="search" aria-label="Search Midterm 3 questions" placeholder="Search questions or IDs…" oninput="renderMidterm3()">
    </div>
    <div id="m3-results"></div>
    <button id="m3-more" onclick="renderMidterm3(true)">Show more questions</button>`);
  renderMidterm3();
}

function startMidterm3() {
  const topic = $('#m3-topic').value;
  start(midterm3Practice.filter(question => !topic || question.topics.includes(topic)));
}

function renderMidterm3(more = false) {
  midterm3Limit = more ? midterm3Limit + 30 : 30;
  const term = $('#m3-search').value.trim().toLowerCase();
  const topic = $('#m3-topic').value;
  const status = $('#m3-answer-status').value;
  const matches = midterm3Bank.filter(question =>
    (!topic || question.topics.includes(topic)) &&
    (!status || question.verification === status) &&
    [question.bankId, question.question, question.paper, ...question.options].join(' ').toLowerCase().includes(term)
  );
  $('#m3-results').innerHTML = `<p class="muted" role="status">${matches.length} matching entries</p>` +
    matches.slice(0, midterm3Limit).map(midterm3Question).join('');
  $('#m3-more').hidden = midterm3Limit >= matches.length;
}

function midterm3Question(question) {
  const label = basisLabel(question);
  const options = question.options.map((option, index) => {
    const letter = question.choiceLabels[index] || String.fromCharCode(65 + index);
    return `<li><b>${esc(letter)}.</b> ${esc(option)}</li>`;
  }).join('');
  const answer = question.correct.map(index =>
    question.choiceLabels[index] || question.options[index]).join(', ');
  const provenance = question.adapted ? 'Adapted from past-paper material' : question.sourceReviewed ? 'Reviewed source' : 'Source review pending';
  return `<details class="panel">
    <summary><span class="pill">${esc(question.bankId)} · ${esc(label)}</span><br><b>${esc(question.question)}</b></summary>
    <p class="muted">${esc(question.topics.join(' · '))}<br>${esc(question.paper)} · p. ${esc(question.sourcePage)} · ${provenance}</p>
    ${options ? `<ul>${options}</ul>` : ''}
    <details>
      <summary>Reveal answer</summary>
      <div class="feedback">
        <b>${esc(label)}${answer ? ` · ${esc(answer)}` : ''}</b>
        ${question.explanation ? `<p>${esc(question.explanation)}</p>` : ''}
      </div>
    </details>
  </details>`;
}

home();
