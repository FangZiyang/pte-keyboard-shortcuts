// Reading & Writing: Fill in the Blanks — the mistake log and its export.
// The graded DOM is the only source: no ids, no network, no site internals.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const script = fs.readFileSync(path.join(__dirname, '..', 'ynwac-shortcuts.user.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, 'fixture-fibrw.html'), 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ynwac.com/zh/fibrw' });
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

const STORE = 'ynwac-shortcuts:fibrw-mistakes';
const log = () => JSON.parse(window.localStorage.getItem(STORE) || '{}');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// One submit, as the page delivers it: a DOM change the observer picks up.
const nudge = () => document.querySelector('.pte-content-area').appendChild(document.createElement('i'));

// 重置 → answer again → 提交. The graded classes come back, so a fresh
// attempt has to be counted even when the same words were picked.
function regrade() {
  const sels = [...document.querySelectorAll('.pte-question-box select')];
  sels.forEach((s) => { s.disabled = false; s.className = 'mx-1 px-3 py-2 border rounded-md'; });
  nudge();
  return wait(400).then(() => {
    sels[0].disabled = true; sels[0].className = 'mx-1 bg-red-50 border-red-300 text-red-700';
    sels[1].disabled = true; sels[1].className = 'mx-1 bg-green-50 border-green-300 text-green-700';
    sels[2].disabled = true; sels[2].className = 'mx-1 bg-red-50 border-red-300 text-red-700';
    nudge();
    return wait(400);
  });
}

(async () => {
  await wait(500); // the boot reading of the already-graded page

  /* ---- what one graded question yields ---- */
  const first = log();
  check('one record per blank, mobile copy not double-counted', Object.keys(first).length === 3, Object.keys(first).join(' | '));
  check('keyed by title and 1-based blank number', !!first['Ice Age and Ocean Currents 1'], Object.keys(first).join(' | '));

  const b1 = first['Ice Age and Ocean Currents 1'];
  check('title is kept verbatim', b1 && b1.title === 'Ice Age and Ocean Currents', b1 && b1.title);
  check('the question number is captured off the badge', b1 && b1.questionNumber === 2, b1 && b1.questionNumber);
  check('one history entry per submit, with its own timestamp', b1 && b1.history.length === 1 && /^\d{4}-/.test(b1.history[0].at), JSON.stringify(b1 && b1.history));
  check('history says what was picked and whether it was right', b1 && b1.history[0].chosen === 'denied' && b1.history[0].ok === false, JSON.stringify(b1 && b1.history));
  check('a wrong blank counts as attempt and miss', b1 && b1.attempts === 1 && b1.wrongCount === 1, JSON.stringify(b1));
  check('what you picked is kept', b1 && b1.lastChosen === 'denied', b1 && b1.lastChosen);
  check('the right answer comes off the chip', b1 && b1.correctAnswer === 'caused', b1 && b1.correctAnswer);

  const b2 = first['Ice Age and Ocean Currents 2'];
  check('a right blank counts as an attempt, not a miss', b2 && b2.attempts === 1 && b2.wrongCount === 0, JSON.stringify(b2));
  check('a right blank is in the history too, marked ok', b2 && b2.history.length === 1 && b2.history[0].ok === true, JSON.stringify(b2 && b2.history));
  check('its answer is what you chose', b2 && b2.correctAnswer === 'Even though', b2 && b2.correctAnswer);

  const b3 = first['Ice Age and Ocean Currents 3'];
  check('blank 3 reads its own chip, not blank 1\'s', b3 && b3.correctAnswer === 'up', b3 && b3.correctAnswer);

  /* ---- the observer fires many times per submit; the log must not ---- */
  nudge();
  await wait(500);
  check('re-rendering the same graded screen does not re-count', log()['Ice Age and Ocean Currents 1'].attempts === 1, JSON.stringify(log()['Ice Age and Ocean Currents 1']));

  /* ---- doing it again accumulates instead of overwriting ---- */
  await regrade();
  const again = log()['Ice Age and Ocean Currents 1'];
  check('a second attempt on the same blank accumulates', again.attempts === 2 && again.wrongCount === 2, JSON.stringify(again));
  check('the history grows with it, keeping both timestamps', again.history.length === 2 && again.history[0].at !== again.history[1].at, JSON.stringify(again.history));
  check('a blank you got right again counts attempts only', log()['Ice Age and Ocean Currents 2'].wrongCount === 0, JSON.stringify(log()['Ice Age and Ocean Currents 2']));

  /* ---- export ---- */
  const panel = document.querySelector('.ynwac-sc-modal');
  const key = (opts) => document.body.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...opts }));
  key({ key: '/', code: 'Slash', altKey: true });
  const exportBtn = document.querySelector('.ynwac-sc-export-fibrw');
  check('the panel offers an export button', !!exportBtn);
  exportBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await wait(100);

  check('a file was handed over', window.__downloads.length === 1 && window.__downloads[0].name === 'fibrw-mistakes.json', JSON.stringify(window.__downloads));

  const out = JSON.parse(window.__lastBlobText);
  check('schema tag is fibrw-mistakes/2', out.schema === 'fibrw-mistakes/2', out.schema);
  check('the envelope names the zone the timestamps were collected in', typeof out.timezone === 'string', out.timezone);
  check('exportedAt is an ISO timestamp', /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(out.exportedAt || ''), out.exportedAt);
  check('only blanks actually missed are exported', out.items.length === 2, JSON.stringify(out.items.map((i) => i.blankIndex)));
  check('the right-every-time blank is left out', !out.items.some((i) => i.blankIndex === 2), JSON.stringify(out.items.map((i) => i.blankIndex)));

  const item = out.items[0];
  check(
    'every schema-1 field is still present and unmoved',
    ['title', 'blankIndex', 'attempts', 'wrongCount', 'lastChosen', 'correctAnswer', 'lastAttemptAt'].every((f) => f in item),
    Object.keys(item).join(' ')
  );
  check('the export carries the question number', item.questionNumber === 2, String(item.questionNumber));
  check('the export carries the per-attempt history', Array.isArray(item.history) && item.history.length === 2, JSON.stringify(item.history));
  check('items are sorted by question then blank', out.items[0].blankIndex === 1 && out.items[1].blankIndex === 3);
  check('lastAttemptAt is an ISO timestamp', /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(item.lastAttemptAt || ''), item.lastAttemptAt);

  /* ---- nothing is recorded away from /fibrw ---- */
  window.history.pushState({}, '', '/zh/fibr');
  window.localStorage.setItem(STORE, '{}');
  await regrade();
  check('/fibr and the rest of the site are not logged', Object.keys(log()).length === 0, Object.keys(log()).join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
