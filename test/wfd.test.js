// Write From Dictation — the mistake log and its export.
// The graded DOM is the only source: no ids, no network, no site internals.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const script = fs.readFileSync(path.join(__dirname, '..', 'ynwac-shortcuts.user.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, 'fixture-wfd-graded.html'), 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ynwac.com/zh/wfd' });
const { window } = dom;
const { document } = window;

const box = { width: 100, height: 30, top: 40, left: 10, bottom: 70, right: 110, x: 10, y: 40 };
const none = { width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0 };
const laidOut = (el) => !(el.closest && el.closest('.is-hidden'));
window.Element.prototype.getClientRects = function () { return laidOut(this) ? [box] : []; };
window.Element.prototype.getBoundingClientRect = function () { return laidOut(this) ? box : none; };

document.body.appendChild(Object.assign(document.createElement('script'), { textContent: script }));

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`);
};

const STORE = 'ynwac-shortcuts:wfd-mistakes';
const log = () => JSON.parse(window.localStorage.getItem(STORE) || '{}');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const SENTENCE = 'The employment demand in engineering is increasing rapidly.';
const slot = document.getElementById('result-slot');
const graded = slot.innerHTML;

const word = (w, ok) =>
  `<span class="inline-block mr-1 p-1 ${ok ? 'text-green-600' : 'bg-red-100 text-red-600'} font-semibold">${w}</span>`;
const diff = (right, yours) => `
  <div class="space-y-3"><div class="wfd-result-diff"><div class="wfd-diff-grid">
    <section class="wfd-diff-block"><h4 class="wfd-diff-title">正确答案</h4><div class="wfd-diff-content">${right}</div></section>
    <section class="wfd-diff-block"><h4 class="wfd-diff-title">你的答案</h4><div class="wfd-diff-content">${yours}</div></section>
  </div></div></div>`;

// 重置 takes the result away; 提交 puts a fresh one back.
async function resubmit(markup) {
  slot.innerHTML = '';
  await wait(400);
  slot.innerHTML = markup;
  await wait(400);
}

(async () => {
  await wait(500); // the boot reading of the already-graded page

  /* ---- what one graded sentence yields ---- */
  const first = log();
  check('one record per sentence, mobile copy not read', Object.keys(first).length === 1, Object.keys(first).join(' | '));
  const r = first[SENTENCE];
  check('keyed by the correct sentence, verbatim', !!r, Object.keys(first).join(' | '));
  check('the question number is captured off the badge', r && r.questionNumber === 128, r && r.questionNumber);
  check('the sentence is split into its words', r && r.words.join(' ') === SENTENCE, r && JSON.stringify(r.words));
  check('an imperfect submit counts as attempt and miss', r && r.attempts === 1 && r.wrongCount === 1, JSON.stringify(r));
  check('each word position carries its own miss count', r && JSON.stringify(r.missCounts) === '[0,0,0,0,1,0,0,1]', r && JSON.stringify(r.missCounts));
  check('what you wrote is kept', r && r.lastAnswer === 'The employment demand in engineer is increasing rapid', r && r.lastAnswer);
  check('lastAttemptAt is an ISO timestamp', r && /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(r.lastAttemptAt || ''), r && r.lastAttemptAt);

  const h = r && r.history[0];
  check('one history entry per submit', r && r.history.length === 1, JSON.stringify(r && r.history));
  check('history keeps the score', h && h.correct === 6 && h.total === 8 && h.ok === false, JSON.stringify(h));
  check('history names the words you missed', h && JSON.stringify(h.missed) === '["engineering","rapidly."]', JSON.stringify(h && h.missed));
  check('history names the words you got wrong', h && JSON.stringify(h.wrong) === '["engineer","rapid"]', JSON.stringify(h && h.wrong));

  /* ---- the observer fires many times per submit; the log must not ---- */
  slot.appendChild(document.createElement('i'));
  await wait(500);
  check('re-rendering the same graded screen does not re-count', log()[SENTENCE].attempts === 1, JSON.stringify(log()[SENTENCE]));

  /* ---- 重置 → 提交 again, the same words: still a second attempt ---- */
  await resubmit(graded);
  const again = log()[SENTENCE];
  check('the same answer submitted again accumulates', again.attempts === 2 && again.wrongCount === 2, JSON.stringify(again));
  check('per-word counts accumulate too', JSON.stringify(again.missCounts) === '[0,0,0,0,2,0,0,2]', JSON.stringify(again.missCounts));

  /* ---- nothing typed at all ---- */
  const words = SENTENCE.split(' ');
  await resubmit(diff(words.map((w) => word(w, false)).join(''), '<span class="text-gray-400 text-sm">未作答</span>'));
  const blank = log()[SENTENCE];
  check('an empty submit misses every word', JSON.stringify(blank.missCounts) === '[1,1,1,1,3,1,1,3]', JSON.stringify(blank.missCounts));
  check('an empty submit records an empty answer', blank.history[2].answer === '' && blank.history[2].correct === 0, JSON.stringify(blank.history[2]));

  /* ---- finally getting it right ---- */
  await resubmit(diff(words.map((w) => word(w, true)).join(''), words.map((w) => word(w, true)).join('')));
  const right = log()[SENTENCE];
  check('a perfect submit counts as an attempt, not a miss', right.attempts === 4 && right.wrongCount === 3, JSON.stringify(right));
  check('a perfect submit is in the history, marked ok', right.history[3].ok === true && right.history[3].correct === 8, JSON.stringify(right.history[3]));
  check('lastAnswer still shows the last WRONG answer', right.lastAnswer === '', right.lastAnswer);

  /* ---- a sentence got right first time is logged but not exported ---- */
  const other = 'Students must submit their assignments before the deadline.';
  await resubmit(diff(other.split(' ').map((w) => word(w, true)).join(''), other.split(' ').map((w) => word(w, true)).join('')));
  check('a clean sentence gets a record too', log()[other] && log()[other].wrongCount === 0, JSON.stringify(log()[other]));

  /* ---- export ---- */
  const key = (opts) => document.body.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...opts }));
  key({ key: '/', code: 'Slash', altKey: true });
  const exportBtn = document.querySelector('.ynwac-sc-export-wfd');
  check('the panel offers a WFD export button', !!exportBtn);
  exportBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await wait(100);

  check('a file was handed over', window.__downloads.length === 1 && window.__downloads[0].name === 'wfd-mistakes.json', JSON.stringify(window.__downloads));

  const out = JSON.parse(window.__lastBlobText);
  check('schema tag is wfd-mistakes/1', out.schema === 'wfd-mistakes/1', out.schema);
  check('the envelope names the zone the timestamps were collected in', typeof out.timezone === 'string', out.timezone);
  check('only sentences actually missed are exported', out.items.length === 1 && out.items[0].sentence === SENTENCE, JSON.stringify(out.items.map((i) => i.sentence)));

  const item = out.items[0];
  check(
    'the item carries everything a revision sheet needs',
    ['sentence', 'questionNumber', 'attempts', 'wrongCount', 'words', 'lastAnswer', 'lastAttemptAt', 'history'].every((f) => f in item),
    Object.keys(item).join(' ')
  );
  check('words pair each word with its miss count', item.words[4].word === 'engineering' && item.words[4].missCount === 3, JSON.stringify(item.words));
  check('the export carries the per-attempt history', item.history.length === 4, JSON.stringify(item.history));

  /* ---- FIB-RW export is untouched ---- */
  check('the FIB-RW export button is still there', !!document.querySelector('.ynwac-sc-export-fibrw'));

  /* ---- nothing is recorded away from /wfd ---- */
  window.history.pushState({}, '', '/zh/fibrw');
  window.localStorage.setItem(STORE, '{}');
  await resubmit(graded);
  check('other question types are not logged as WFD', Object.keys(log()).length === 0, Object.keys(log()).join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
