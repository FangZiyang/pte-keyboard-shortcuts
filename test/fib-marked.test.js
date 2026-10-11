// Reading FIB (/fibr) and Listening FIB (/fibl) — one log shape, two ways
// of answering. Both graded pages put a green or red mark and the right
// answer behind every gap; that mark is the only thing believed.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const script = fs.readFileSync(path.join(__dirname, '..', 'ynwac-shortcuts.user.js'), 'utf8');

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function open(fixture, url) {
  const html = fs.readFileSync(path.join(__dirname, fixture), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url });
  const { window } = dom;
  const box = { width: 100, height: 30, top: 40, left: 10, bottom: 70, right: 110, x: 10, y: 40 };
  const none = { width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0 };
  const laidOut = (el) => !(el.closest && el.closest('.is-hidden'));
  window.Element.prototype.getClientRects = function () { return laidOut(this) ? [box] : []; };
  window.Element.prototype.getBoundingClientRect = function () { return laidOut(this) ? box : none; };
  window.document.body.appendChild(Object.assign(window.document.createElement('script'), { textContent: script }));
  return window;
}

const storeOf = (window, key) => JSON.parse(window.localStorage.getItem(`ynwac-shortcuts:${key}`) || '{}');

async function exportFrom(window, kind) {
  const { document } = window;
  document.body.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: '/', code: 'Slash', altKey: true }));
  document.querySelector(`.ynwac-sc-export-${kind}`).dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await wait(100);
  return { downloads: window.__downloads, out: JSON.parse(window.__lastBlobText || '{}') };
}

(async () => {
  /* ================= Reading FIB ================= */
  {
    const w = open('fixture-fibr.html', 'https://ynwac.com/zh/fibr');
    await wait(500);
    const log = storeOf(w, 'fibr-mistakes');
    check('fibr: one record per gap, mobile copy ignored', Object.keys(log).length === 4, Object.keys(log).join(' | '));
    check('fibr: titled from the header, not from a filled word', !!log['Program 1'], Object.keys(log).join(' | '));
    const [b1, b2, , b4] = [1, 2, 3, 4].map((i) => log[`Program ${i}`]);
    check('fibr: the question number is captured', b1 && b1.questionNumber === 1, b1 && b1.questionNumber);
    check('fibr: a right gap is an attempt, not a miss', b1 && b1.attempts === 1 && b1.wrongCount === 0, JSON.stringify(b1));
    check('fibr: a wrong gap keeps what you dragged in', b2 && b2.wrongCount === 1 && b2.lastChosen === 'uprising', JSON.stringify(b2));
    check('fibr: and the right answer, brackets stripped', b2 && b2.correctAnswer === 'analytical', b2 && b2.correctAnswer);
    check('fibr: an empty gap is a miss with nothing chosen, not 点击填入', b4 && b4.wrongCount === 1 && b4.lastChosen === '', JSON.stringify(b4));
    check('fibrw log is left alone', Object.keys(storeOf(w, 'fibrw-mistakes')).length === 0);

    const { downloads, out } = await exportFrom(w, 'fibr');
    check('fibr: exports fibr-mistakes.json', downloads.length === 1 && downloads[0].name === 'fibr-mistakes.json', JSON.stringify(downloads));
    check('fibr: schema fibr-mistakes/1, the FIB-RW item shape', out.schema === 'fibr-mistakes/1' && out.items.length === 2 && out.items[0].blankIndex === 2, JSON.stringify(out));
  }

  /* ================= Listening FIB ================= */
  {
    const w = open('fixture-fibl.html', 'https://ynwac.com/zh/fibl');
    await wait(500);
    const log = storeOf(w, 'fibl-mistakes');
    const T = 'A Day in the Life of a Baker';
    check('fibl: one record per gap, mobile copy ignored', Object.keys(log).length === 4, Object.keys(log).join(' | '));
    const [b1, b2, b3, b4] = [1, 2, 3, 4].map((i) => log[`${T} ${i}`]);
    check('fibl: the question number is captured', b1 && b1.questionNumber === 44, b1 && b1.questionNumber);
    check('fibl: the site\'s green is believed, case and spaces aside', b2 && b2.wrongCount === 0 && b2.history[0].chosen === 'Sugar', JSON.stringify(b2));
    check('fibl: a misheard word keeps your spelling and the right one', b3 && b3.lastChosen === 'Morning' && b3.correctAnswer === 'rush', JSON.stringify(b3));
    check('fibl: an empty gap is a miss', b4 && b4.wrongCount === 1 && b4.lastChosen === '', JSON.stringify(b4));

    // 重置 → type again → 提交 with the same words: still a new attempt.
    const inputs = [...w.document.querySelectorAll('.pte-question-box input[type="text"]')];
    const marks = [...w.document.querySelectorAll('.pte-question-box .relative.inline-block > span.ml-1')];
    marks.forEach((m) => m.remove());
    inputs.forEach((i) => (i.disabled = false));
    w.document.querySelector('.pte-content-area').appendChild(w.document.createElement('i'));
    await wait(400);
    marks.forEach((m, i) => inputs[i].parentElement.appendChild(m));
    w.document.querySelector('.pte-content-area').appendChild(w.document.createElement('i'));
    await wait(400);
    const again = storeOf(w, 'fibl-mistakes')[`${T} 3`];
    check('fibl: 重置 then the same answer again is a second attempt', again.attempts === 2 && again.wrongCount === 2, JSON.stringify(again));

    const { downloads, out } = await exportFrom(w, 'fibl');
    check('fibl: exports fibl-mistakes.json', downloads.length === 1 && downloads[0].name === 'fibl-mistakes.json', JSON.stringify(downloads));
    check('fibl: only the missed gaps go out', out.schema === 'fibl-mistakes/1' && out.items.map((i) => i.blankIndex).join() === '3,4', JSON.stringify(out.items));
  }

  /* ================= /fibrw is not /fibr ================= */
  {
    const w = open('fixture-fibr.html', 'https://ynwac.com/zh/fibrw');
    await wait(500);
    check('the Reading FIB log does not fire on /fibrw', Object.keys(storeOf(w, 'fibr-mistakes')).length === 0);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
