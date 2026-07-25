// Read Aloud / Repeat Sentence: icon-only media controls, no answer box.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const script = fs.readFileSync(path.join(__dirname, '..', 'ynwac-shortcuts.user.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, 'fixture-speaking.html'), 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ynwac.com/ra' });
const { window } = dom;
const { document } = window;

const box = { width: 100, height: 30, top: 40, left: 10, bottom: 70, right: 110, x: 10, y: 40 };
window.Element.prototype.getClientRects = () => [box];
window.Element.prototype.getBoundingClientRect = () => box;

document.body.appendChild(Object.assign(document.createElement('script'), { textContent: script }));

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`);
};
const key = (opts) => {
  const e = new window.KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...opts });
  (document.activeElement || document.body).dispatchEvent(e);
  return e;
};
const clicks = () => window.__clicks;
const last = () => window.__clicks[window.__clicks.length - 1];
const reset = () => { window.__clicks.length = 0; };

/* ---- the same 1-5 as everywhere else ---- */
for (const [digit, id] of [['1', 'b-play'], ['2', 'b-submit'], ['3', 'b-reset'], ['4', 'b-prev'], ['5', 'b-next']]) {
  reset();
  key({ key: digit, code: `Digit${digit}`, altKey: true });
  check(`Alt+${digit} -> ${id.replace('b-', '')}`, last() === id, `got ${last()}`);
}

/* ---- icon-only controls, found by component class ---- */
reset();
key({ key: '6', code: 'Digit6', altKey: true });
check('Alt+6 -> 录音 (icon-only, no text node)', last() === 'b-record', `got ${last()}`);

reset();
key({ key: '7', code: 'Digit7', altKey: true });
check('Alt+7 -> 跳过准备', last() === 'b-skip', `got ${last()}`);

/* ---- the two 重置 buttons must not be confused ---- */
reset();
key({ key: '3', code: 'Digit3', altKey: true });
check('Alt+3 resets the question, not the recording', last() === 'b-reset', `got ${last()}`);
check('the recorder 重置 was not clicked', !clicks().includes('b-rerecord'));
check('重置进度 was never clicked', !clicks().includes('b-resetall'));

/* ---- play must be the player, not the recorder ---- */
reset();
key({ key: '1', code: 'Digit1', altKey: true });
check('Alt+1 is the player, not the mic', last() === 'b-play' && !clicks().includes('b-record'), `got ${last()}`);

/* ---- no answer box here, so bare digits are live immediately ---- */
reset();
key({ key: '6', code: 'Digit6' });
check('bare 6 records (no text field to type into)', last() === 'b-record', `got ${last()}`);

/* ---- chips ---- */
window.dispatchEvent(new window.Event('resize'));
setTimeout(() => {
  const chips = [...document.querySelectorAll('.ynwac-sc-chip')].map((c) => c.textContent);
  check('chips cover all seven controls', ['1', '2', '3', '4', '5', '6', '7'].every((k) => chips.includes(k)), chips.join(' '));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}, 300);
