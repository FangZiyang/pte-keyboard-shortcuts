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

/* ---- 1-5 on a speaking question: 听 → 说 → 看分 → 下一题 ---- */
for (const [digit, id, what] of [
  ['1', 'b-play', '播放'],
  ['2', 'b-record', '停止录音'],
  ['3', 'b-ai', 'AI 评分'],
  ['4', 'b-next', '下一题'],
  ['5', 'b-rerecord', '重录'],
]) {
  reset();
  key({ key: digit, code: `Digit${digit}`, altKey: true });
  check(`Alt+${digit} -> ${what}`, last() === id, `got ${last()}`);
}

/* ---- 提交 is useless here and gives up its number ---- */
reset();
key({ key: '2', code: 'Digit2', altKey: true });
check('Alt+2 does not submit on a speaking question', !clicks().includes('b-submit'), `got ${last()}`);

/* ---- letter alternates keep their original meaning everywhere ---- */
reset();
key({ key: 's', code: 'KeyS', altKey: true });
check('Alt+S still submits', last() === 'b-submit', `got ${last()}`);

reset();
key({ key: 'r', code: 'KeyR', altKey: true });
check('Alt+R still resets the question', last() === 'b-reset', `got ${last()}`);

reset();
key({ key: 'b', code: 'KeyB', altKey: true });
check('Alt+B still goes to the previous question', last() === 'b-prev', `got ${last()}`);

/* ---- icon-only controls keep their own direct keys too ---- */
for (const [digit, id, what] of [
  ['6', 'b-record', '录音'],
  ['7', 'b-skip', '跳过准备'],
  ['8', 'b-ai', 'AI 评分'],
]) {
  reset();
  key({ key: digit, code: `Digit${digit}`, altKey: true });
  check(`Alt+${digit} -> ${what}`, last() === id, `got ${last()}`);
}

/* ---- the three 重置-ish buttons must never be confused ---- */
reset();
key({ key: '5', code: 'Digit5', altKey: true });
check('Alt+5 re-records, it does not wipe the question', last() === 'b-rerecord', `got ${last()}`);
check('the toolbar 重置 was not clicked', !clicks().includes('b-reset'));
check('重置进度 was never clicked', !clicks().includes('b-resetall'));

/* ---- play must be the player, not the recorder ---- */
reset();
key({ key: '1', code: 'Digit1', altKey: true });
check('Alt+1 is the player, not the mic', last() === 'b-play' && !clicks().includes('b-record'), `got ${last()}`);

/* ---- no answer box here, so bare digits are live immediately ---- */
reset();
key({ key: '3', code: 'Digit3' });
check('bare 3 scores (no text field to type into)', last() === 'b-ai', `got ${last()}`);

/* ---- chips ---- */
window.dispatchEvent(new window.Event('resize'));
setTimeout(() => {
  const chips = [...document.querySelectorAll('.ynwac-sc-chip')].map((c) => c.textContent);
  check('chips cover 1-5 plus 跳过准备', ['1', '2', '3', '4', '5', '7'].every((k) => chips.includes(k)), chips.join(' '));
  check('提交 gets no chip at all here', !chips.includes('S'), chips.join(' '));
  check('重置 falls back to its letter', chips.includes('R'), chips.join(' '));
  check('上一题 shows the letter it always had', chips.includes('B'), chips.join(' '));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}, 300);
