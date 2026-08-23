// A log written by 1.7.0 meeting the version that added questionNumber and
// per-attempt history. The counts in it are weeks of practice: the upgrade
// has to add fields without touching a single number already there.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const script = fs.readFileSync(path.join(__dirname, '..', 'ynwac-shortcuts.user.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, 'fixture-fibrw.html'), 'utf8');

// Exactly the shape 1.7.0 wrote: no questionNumber, no history anywhere.
const OLD_LOG = {
  'Stress and Life Changes 1': {
    title: 'Stress and Life Changes',
    blankIndex: 1,
    attempts: 3,
    wrongCount: 2,
    lastChosen: 'expectations',
    lastAttemptAt: '2026-08-22T16:49:21.763Z',
    correctAnswer: 'changes',
  },
  'Stress and Life Changes 2': {
    title: 'Stress and Life Changes',
    blankIndex: 2,
    attempts: 3,
    wrongCount: 0,
    correctAnswer: 'including',
  },
  'Never Visited Again 1': {
    title: 'Never Visited Again',
    blankIndex: 1,
    attempts: 1,
    wrongCount: 1,
    lastChosen: 'wrong',
    lastAttemptAt: '2026-08-20T10:00:00.000Z',
    correctAnswer: 'right',
  },
};

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ynwac.com/zh/fibrw' });
const { window } = dom;
const { document } = window;

const box = { width: 100, height: 30, top: 40, left: 10, bottom: 70, right: 110, x: 10, y: 40 };
const none = { width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0 };
const laidOut = (el) => !(el.closest && el.closest('.is-hidden'));
window.Element.prototype.getClientRects = function () { return laidOut(this) ? [box] : []; };
window.Element.prototype.getBoundingClientRect = function () { return laidOut(this) ? box : none; };

// Seed the old log, plus a number index that knows one of the two titles —
// so the "we learned it later" path and the "still unknown" path both run.
const RAW_BEFORE = JSON.stringify(OLD_LOG);
window.localStorage.setItem('ynwac-shortcuts:fibrw-mistakes', RAW_BEFORE);
window.localStorage.setItem('ynwac-shortcuts:fibrw-qnum', JSON.stringify({ 'Stress and Life Changes': 21 }));

document.body.appendChild(Object.assign(document.createElement('script'), { textContent: script }));

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`);
};
const log = () => JSON.parse(window.localStorage.getItem('ynwac-shortcuts:fibrw-mistakes') || '{}');

setTimeout(() => {
  const after = log();
  const a = after['Stress and Life Changes 1'];
  const b = after['Stress and Life Changes 2'];
  const c = after['Never Visited Again 1'];

  /* ---- nothing is dropped ---- */
  // The fixture page is itself a graded question, so the log legitimately
  // grows by three. What matters is that the seeded ones are all still in.
  check('every pre-existing record survives', Object.keys(OLD_LOG).every((k) => k in after), Object.keys(after).join(' | '));

  /* ---- and no count is rewritten ---- */
  check('attempts are left exactly as they were', a.attempts === 3 && b.attempts === 3 && c.attempts === 1);
  check('wrongCount is left exactly as it was', a.wrongCount === 2 && b.wrongCount === 0 && c.wrongCount === 1);
  check('lastChosen is untouched', a.lastChosen === 'expectations', a.lastChosen);
  check('correctAnswer is untouched', a.correctAnswer === 'changes' && b.correctAnswer === 'including');
  check('lastAttemptAt is untouched', a.lastAttemptAt === '2026-08-22T16:49:21.763Z', a.lastAttemptAt);

  /* ---- the question number comes from what has been learned since ---- */
  check('a title the index knows gets its number back', a.questionNumber === 21 && b.questionNumber === 21, `${a.questionNumber} ${b.questionNumber}`);
  check('a title nobody has seen yet is left without one rather than guessed', !c.questionNumber, String(c.questionNumber));

  /* ---- history is synthesised only from what was actually recorded ---- */
  check('the one wrong attempt with a timestamp becomes a history entry', a.history.length === 1 && a.history[0].at === '2026-08-22T16:49:21.763Z' && a.history[0].ok === false, JSON.stringify(a.history));
  check('it carries the word that was picked', a.history[0].chosen === 'expectations', a.history[0].chosen);
  check('a record with no timestamp gets an empty history, not an invented one', Array.isArray(b.history) && b.history.length === 0, JSON.stringify(b.history));

  /* ---- and the pre-migration bytes are kept ---- */
  const backup = window.localStorage.getItem('ynwac-shortcuts:fibrw-mistakes-backup-v1');
  check('the log as it was before the upgrade is copied aside', backup === RAW_BEFORE, backup ? `${backup.length} bytes` : 'missing');

  /* ---- running again must not double anything ---- */
  const snapshot = window.localStorage.getItem('ynwac-shortcuts:fibrw-mistakes');
  window.dispatchEvent(new window.Event('resize'));
  setTimeout(() => {
    check('a second boot changes nothing', window.localStorage.getItem('ynwac-shortcuts:fibrw-mistakes') === snapshot);
    check('and does not overwrite the backup', window.localStorage.getItem('ynwac-shortcuts:fibrw-mistakes-backup-v1') === RAW_BEFORE);

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
  }, 400);
}, 700);
