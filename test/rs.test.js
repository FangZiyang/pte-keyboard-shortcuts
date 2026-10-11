// Repeat Sentence — every AI score is kept, keyed by the reference
// sentence, and exported weakest first. Read off the score card only.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const script = fs.readFileSync(path.join(__dirname, '..', 'ynwac-shortcuts.user.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, 'fixture-rs-scored.html'), 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ynwac.com/zh/rs' });
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

const STORE = 'ynwac-shortcuts:rs-scores';
const log = () => JSON.parse(window.localStorage.getItem(STORE) || '{}');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const SENTENCE = 'You need to pass the exam.';
const result = document.getElementById('result');
const card = result.innerHTML;

// 重录 takes the card away; the next AI 评分 brings a new one.
async function rescore(total) {
  result.innerHTML = '';
  await wait(400);
  result.innerHTML = card.replace('>61<', `>${total}<`);
  await wait(400);
}

(async () => {
  await wait(500);

  const r = log()[SENTENCE];
  check('one record, keyed by the reference sentence', Object.keys(log()).length === 1 && !!r, Object.keys(log()).join(' | '));
  check('the inserted word is kept out of the sentence', r && !/um/.test(r.sentence), r && r.sentence);
  check('the question number is captured', r && r.questionNumber === 5, r && r.questionNumber);
  const t = r && r.history[0];
  check(
    'all five scores, by position',
    t && t.total === 61 && t.pronunciation === 58 && t.fluency === 64 && t.completeness === 71 && t.recognition === 83,
    JSON.stringify(t)
  );
  check(
    'the five problem counts',
    t && t.counts.mispronounced === 1 && t.counts.omitted === 1 && t.counts.inserted === 1 && t.counts.unexpectedBreak === 0 && t.counts.missingPause === 2,
    JSON.stringify(t && t.counts)
  );
  check('word scores, "-" padding cells dropped', t && t.words.length === 6 && t.words[3].word === 'pass' && t.words[3].score === 42, JSON.stringify(t && t.words));
  check('which words were omitted, mispronounced, inserted', t && t.omittedWords.join() === 'to' && t.mispronouncedWords.join() === 'pass' && t.insertedWords.join() === 'um', JSON.stringify(t));
  check('a timestamp per take', t && /^\d{4}-\d{2}-\d{2}T/.test(t.at), t && t.at);

  document.querySelector('.pte-content-area').appendChild(document.createElement('i'));
  await wait(500);
  check('re-rendering the same card does not add a take', log()[SENTENCE].attempts === 1);

  await rescore(79);
  const again = log()[SENTENCE];
  check('重录 → AI 评分 again is a second take', again.attempts === 2 && again.history[1].total === 79, JSON.stringify(again.history.map((h) => h.total)));

  /* ---- export ---- */
  document.body.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: '/', code: 'Slash', altKey: true }));
  const btn = document.querySelector('.ynwac-sc-export-rs');
  check('the panel offers an RS export button', !!btn);
  btn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await wait(100);
  check('a file was handed over', window.__downloads.length === 1 && window.__downloads[0].name === 'rs-scores.json', JSON.stringify(window.__downloads));
  const out = JSON.parse(window.__lastBlobText);
  check('schema tag is rs-scores/1', out.schema === 'rs-scores/1', out.schema);
  const item = out.items[0];
  check('average, best and last total', item.averageTotal === 70 && item.bestTotal === 79 && item.lastTotal === 79, JSON.stringify(item));
  check('weak words, lowest average first', item.weakWords[0].word === 'to' && item.weakWords[1].word === 'pass', JSON.stringify(item.weakWords));

  /* ---- nothing is recorded away from /rs ---- */
  window.history.pushState({}, '', '/zh/ra');
  window.localStorage.setItem(STORE, '{}');
  await rescore(50);
  check('other pages are not logged', Object.keys(log()).length === 0, Object.keys(log()).join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
