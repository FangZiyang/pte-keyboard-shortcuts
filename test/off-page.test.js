// Write Email. Same toolbar as everywhere else, but the answer is prose
// you compose yourself — "at 7 o'clock", a phone number, "100 words" —
// and a bare 3 in the middle of that would fire 重置 and take the email
// with it. The script has to be completely inert here.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const script = fs.readFileSync(path.join(__dirname, '..', 'ynwac-shortcuts.user.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, 'fixture.html'), 'utf8').replace(/<script src=[^>]*><\/script>/, '');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ynwac.com/zh/we' });
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
const reset = () => { window.__clicks.length = 0; };

const answer = document.getElementById('answer');

/* ---- the one that costs you the email ---- */
reset();
answer.focus();
answer.value = 'I had dinner at ';
const typed = key({ key: '3', code: 'Digit3' });
check('bare 3 does not reset the question on /we', !clicks().includes('b-reset'), clicks().join(' '));
check('...and the keypress reaches the textarea', !typed.defaultPrevented);

/* ---- nothing else fires either ---- */
for (const [name, opts] of [
  ['bare 4', { key: '4', code: 'Digit4' }],
  ['Alt+3', { key: '3', code: 'Digit3', altKey: true }],
  ['Alt+4', { key: '4', code: 'Digit4', altKey: true }],
  ['Alt+S', { key: 's', code: 'KeyS', altKey: true }],
  ['Alt+B', { key: 'b', code: 'KeyB', altKey: true }],
  ['Ctrl+Enter', { key: 'Enter', code: 'Enter', ctrlKey: true }],
]) {
  reset();
  key(opts);
  check(`${name} clicks nothing on /we`, clicks().length === 0, clicks().join(' '));
}

/* ---- the panel and the master toggle stay out of the way too ---- */
answer.blur();
reset();
key({ key: '/', code: 'Slash', altKey: true });
check('Alt+/ does not open the panel on /we', !document.querySelector('.ynwac-sc-modal[data-show="1"]'));
key({ key: '/', code: 'Slash' });
check('bare / does not open the panel either', !document.querySelector('.ynwac-sc-modal[data-show="1"]'));

/* ---- and no chips on the buttons ---- */
window.dispatchEvent(new window.Event('resize'));
setTimeout(() => {
  const chips = [...document.querySelectorAll('.ynwac-sc-chip')];
  check('no key chips are drawn on /we', chips.length === 0, chips.map((c) => c.textContent).join(' '));
  check('the first-run greeting is not spent here', !window.localStorage.getItem('ynwac-shortcuts:seen-hint-v2'));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}, 1500);
