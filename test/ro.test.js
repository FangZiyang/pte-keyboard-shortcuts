// Reorder Paragraphs — the mistake log and its export, read off the graded
// page: which paragraphs are green, and where the red ones say they belong.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const script = fs.readFileSync(path.join(__dirname, '..', 'ynwac-shortcuts.user.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, 'fixture-ro.html'), 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ynwac.com/zh/ro' });
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

const STORE = 'ynwac-shortcuts:ro-mistakes';
const log = () => JSON.parse(window.localStorage.getItem(STORE) || '{}');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const nudge = () => document.querySelector('.pte-content-area').appendChild(document.createElement('i'));
const items = () => [...document.querySelectorAll('.pte-question-box .paragraph-item')];

// 重置 → drag into the right order → 提交: every paragraph comes back green.
function regradeAllRight() {
  const list = items()[0].parentElement;
  items().forEach((it) => (it.className = it.className.replace(/bg-(green|red)-50/, 'bg-gray-50')));
  nudge();
  return wait(400).then(() => {
    const [p2, p1, p4, p3] = items();
    [p2, p1, p3, p4].forEach((it) => {
      it.className = it.className.replace('bg-gray-50', 'bg-green-50');
      const pos = it.querySelector('div.mt-2');
      if (pos) pos.remove();
      list.appendChild(it);
    });
    nudge();
    return wait(400);
  });
}

(async () => {
  await wait(500); // the boot reading of the already-graded page

  const first = log();
  check('one record per question, mobile copy ignored', Object.keys(first).length === 1, Object.keys(first).join(' | '));
  const r = first['Brazilian Folk Music Research'];
  check('keyed by title', !!r);
  check('the question number is captured', r && r.questionNumber === 1, r && r.questionNumber);
  check('a wrong order counts as attempt and miss', r && r.attempts === 1 && r.wrongCount === 1, JSON.stringify(r));
  check('your order is kept as labels', r && r.lastOrder.join() === '2,1,4,3', r && JSON.stringify(r.lastOrder));
  check('the right order is read back off greens and 正确位置', r && r.correctOrder.join() === '2,1,3,4', r && JSON.stringify(r.correctOrder));
  check(
    'paragraphs are stored in the right order, label and text, punctuation joined up',
    r && r.paragraphs.map((p) => p.label).join() === '2,1,3,4' && r.paragraphs[0].text === 'Early in 1938, a mission.',
    r && JSON.stringify(r.paragraphs)
  );
  check('the 正确位置 note is not part of the text', r && !r.paragraphs.some((p) => /正确位置/.test(p.text)), r && JSON.stringify(r.paragraphs));

  const h = r && r.history[0];
  check('history: 2 of 4 in place, as the site scores it', h && h.inPlace === 2 && h.total === 4, JSON.stringify(h));
  check('history: 1 of 3 adjacent pairs, as PTE scores it', h && h.pairsRight === 1 && h.pairsTotal === 3, JSON.stringify(h));
  check('history: which paragraphs were out of place', h && h.misplaced.join() === '4,3' && h.ok === false, JSON.stringify(h));

  nudge();
  await wait(500);
  check('re-rendering the same graded screen does not re-count', log()['Brazilian Folk Music Research'].attempts === 1);

  await regradeAllRight();
  const again = log()['Brazilian Folk Music Research'];
  check('getting it right is an attempt, not a miss', again.attempts === 2 && again.wrongCount === 1, JSON.stringify(again));
  check('lastOrder still shows the order you got wrong', again.lastOrder.join() === '2,1,4,3', JSON.stringify(again.lastOrder));
  check('the right attempt is in the history, all pairs right', again.history[1].ok === true && again.history[1].pairsRight === 3, JSON.stringify(again.history[1]));

  /* ---- export ---- */
  document.body.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: '/', code: 'Slash', altKey: true }));
  const btn = document.querySelector('.ynwac-sc-export-ro');
  check('the panel offers an RO export button', !!btn);
  btn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await wait(100);
  check('a file was handed over', window.__downloads.length === 1 && window.__downloads[0].name === 'ro-mistakes.json', JSON.stringify(window.__downloads));
  const out = JSON.parse(window.__lastBlobText);
  check('schema tag is ro-mistakes/1', out.schema === 'ro-mistakes/1', out.schema);
  const item = out.items[0];
  check(
    'the item carries everything a revision sheet needs',
    ['title', 'questionNumber', 'attempts', 'wrongCount', 'correctOrder', 'paragraphs', 'lastOrder', 'lastAttemptAt', 'history'].every((f) => f in item),
    Object.keys(item).join(' ')
  );

  /* ---- nothing is recorded away from /ro ---- */
  window.history.pushState({}, '', '/zh/rs');
  window.localStorage.setItem(STORE, '{}');
  await regradeAllRight();
  check('other pages are not logged', Object.keys(log()).length === 0, Object.keys(log()).join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
