// FIBL and the other listening types still on the site's older player:
// an icon-only circle with no class of its own, sharing the page with a
// hidden mobile player that must never be the one clicked.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const script = fs.readFileSync(path.join(__dirname, '..', 'ynwac-shortcuts.user.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, 'fixture-listening.html'), 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ynwac.com/zh/fibl' });
const { window } = dom;
const { document } = window;

// jsdom has no layout, so isVisible() needs a box handed to it — except
// inside .is-hidden, which stands in for the `md:hidden` mobile shell.
// That distinction is the whole point of this fixture.
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
const key = (opts) => {
  const e = new window.KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...opts });
  (document.activeElement || document.body).dispatchEvent(e);
  return e;
};
const clicks = () => window.__clicks;
const last = () => window.__clicks[window.__clicks.length - 1];
const reset = () => { window.__clicks.length = 0; };

/* ---- the point of the whole file: 1 plays ---- */
reset();
key({ key: '1', code: 'Digit1', altKey: true });
check('Alt+1 -> the desktop player', last() === 'b-play', `got ${last()}`);
check('the hidden mobile player was not clicked', !clicks().includes('b-play-mobile'));
check('倍速 was not mistaken for the player', !clicks().includes('b-speed'));
check('a round button outside the question box was not clicked', !clicks().includes('b-decoy-round'));

/* ---- nothing else moved ---- */
for (const [digit, id, what] of [
  ['2', 'b-submit', '提交'],
  ['3', 'b-reset', '重置'],
  ['4', 'b-next', '下一题'],
]) {
  reset();
  key({ key: digit, code: `Digit${digit}`, altKey: true });
  check(`Alt+${digit} -> ${what}`, last() === id, `got ${last()}`);
}

reset();
key({ key: 'b', code: 'KeyB', altKey: true });
check('Alt+B -> 上一题', last() === 'b-prev', `got ${last()}`);
check('重置进度 was never clicked', !clicks().includes('b-resetall'));

/* ---- while the audio is loading the site disables the button ---- */
reset();
document.getElementById('b-play').disabled = true;
key({ key: '1', code: 'Digit1', altKey: true });
check('a loading player is left alone rather than substituted for', clicks().length === 0, `got ${clicks().join(' ')}`);
document.getElementById('b-play').disabled = false;

/* ---- narrow window: the mobile pill is the only player there is ---- */
reset();
document.querySelector('.fibl-mobile-shell').classList.remove('is-hidden');
document.querySelector('.pte-question-box').classList.add('is-hidden');
key({ key: '1', code: 'Digit1', altKey: true });
check('Alt+1 falls back to the mobile pill', last() === 'b-play-mobile', `got ${last()}`);
document.querySelector('.fibl-mobile-shell').classList.add('is-hidden');
document.querySelector('.pte-question-box').classList.remove('is-hidden');

/* ---- the blanks are <input>, so bare digits belong to the field ---- */
reset();
document.getElementById('blank1').focus();
key({ key: '1', code: 'Digit1' });
check('bare 1 stays out of an answer blank', clicks().length === 0, `got ${clicks().join(' ')}`);
key({ key: '1', code: 'Digit1', altKey: true });
check('Alt+1 still plays from inside a blank', last() === 'b-play', `got ${last()}`);

/* ---- chips ---- */
const chips = () => [...document.querySelectorAll('.ynwac-sc-chip')].map((c) => c.textContent);

document.getElementById('blank1').focus();
window.dispatchEvent(new window.Event('resize'));
setTimeout(() => {
  // The chip has to name a key that works from where the cursor is, or it
  // is a lie: bare 1 does nothing while a blank has focus.
  check('inside a blank the chip reads Alt+1', chips().includes('Alt+1'), chips().join(' '));
  check('...and does not still promise a bare 1', !chips().includes('1'), chips().join(' '));

  document.getElementById('blank1').blur();
  window.dispatchEvent(new window.Event('resize'));
  setTimeout(() => {
    check('播放 gets a chip of its own', chips().includes('1'), chips().join(' '));
    check('chips cover the whole loop', ['1', '2', '3', '4'].every((k) => chips().includes(k)), chips().join(' '));

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
  }, 300);
}, 300);
