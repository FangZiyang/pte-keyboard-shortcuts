const fs = require('fs');
const { JSDOM } = require('jsdom');

const path = require('path');

const script = fs.readFileSync(path.join(__dirname, '..', 'ynwac-shortcuts.user.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, 'fixture.html'), 'utf8').replace(/<script src=[^>]*><\/script>/, '');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ynwac.com/wfd' });
const { window } = dom;
const { document } = window;

// jsdom has no layout: getClientRects() is always empty, so isVisible() would
// reject everything. Give every element a non-zero box.
window.Element.prototype.getClientRects = function () {
  return [{ width: 100, height: 30, top: 0, left: 0, bottom: 30, right: 100 }];
};

const el = document.createElement('script');
el.textContent = script;
document.body.appendChild(el);

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  (cond ? pass++ : fail++);
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`);
};

function key(opts) {
  const e = new window.KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...opts });
  (document.activeElement || document.body).dispatchEvent(e);
  return e;
}
const clicks = () => window.__clicks;
const last = () => window.__clicks[window.__clicks.length - 1];
const reset = () => { window.__clicks.length = 0; };

const answer = document.getElementById('answer');

/* ---- 1. modifier shortcuts while typing in the answer box ---- */
answer.focus();
check('focus is in the textarea', document.activeElement === answer);

key({ key: 'a', code: 'KeyA', altKey: true });
check('Alt+A -> 播放', last() === 'b-play', `got ${last()}`);

reset();
key({ key: 'Enter', code: 'Enter', ctrlKey: true });
check('Ctrl+Enter -> 提交', last() === 'b-submit', `got ${last()}`);

reset();
key({ key: 'Enter', code: 'Enter', altKey: true });
check('Alt+Enter -> 下一题', last() === 'b-next', `got ${last()}`);

reset();
key({ key: 'r', code: 'KeyR', altKey: true });
check('Alt+R -> 重置 (NOT 重置进度)', last() === 'b-reset', `got ${last()}`);
check('重置进度 was never clicked', !clicks().includes('b-resetall'));

reset();
key({ key: 'ArrowLeft', code: 'ArrowLeft', altKey: true });
check('Alt+ArrowLeft -> 上一题', last() === 'b-prev', `got ${last()}`);

reset();
key({ key: 'ArrowRight', code: 'ArrowRight', altKey: true });
check('Alt+ArrowRight -> 下一题', last() === 'b-next', `got ${last()}`);

/* ---- 2. plain typing must still reach the textarea ---- */
reset();
const typed = key({ key: 'n', code: 'KeyN' });
check('plain "n" while typing is NOT intercepted', clicks().length === 0 && !typed.defaultPrevented);

/* ---- 3. Esc leaves the box, then single keys work ---- */
key({ key: 'Escape', code: 'Escape' });
check('Esc blurs the textarea', document.activeElement !== answer);

reset();
key({ key: 'p', code: 'KeyP' });
check('quick key "p" -> 播放', last() === 'b-play', `got ${last()}`);

reset();
key({ key: 's', code: 'KeyS' });
check('quick key "s" -> 提交', last() === 'b-submit', `got ${last()}`);

reset();
key({ key: 'r', code: 'KeyR' });
check('quick key "r" -> 重置 (not 重置进度)', last() === 'b-reset' && !clicks().includes('b-resetall'), `got ${last()}`);

reset();
key({ key: 'b', code: 'KeyB' });
check('quick key "b" -> 上一题', last() === 'b-prev', `got ${last()}`);

/* ---- 4. focus helpers ---- */
key({ key: 'i', code: 'KeyI', altKey: true });
check('Alt+I focuses the answer box', document.activeElement === answer);

key({ key: 'j', code: 'KeyJ', altKey: true });
check('Alt+J focuses the # field', document.activeElement === document.getElementById('b-num'));

/* ---- 5. macOS: Option+S emits key "ß" but code "KeyS" ---- */
reset();
answer.focus();
key({ key: 'ß', code: 'KeyS', altKey: true });
check('macOS Option+S still submits (uses e.code)', last() === 'b-submit', `got ${last()}`);

/* ---- 6. IME composition ---- */
reset();
answer.blur();
key({ key: 'r', code: 'KeyR', isComposing: true });
check('bare keys during IME composition are ignored', clicks().length === 0);

// Some IMEs report keyCode 229 for every keydown while active. A modifier
// combo is never part of a composition, so it must still fire.
reset();
answer.focus();
key({ key: 'r', code: 'KeyR', altKey: true, keyCode: 229 });
check('Alt+R still works with a Chinese IME active', last() === 'b-reset', `got ${last()}`);

/* ---- 7. help panel ---- */
key({ key: '/', code: 'Slash', altKey: true });
const modal = document.querySelector('.ynwac-sc-modal');
check('Alt+/ opens the help panel', !!modal && modal.dataset.show === '1');
check('help panel lists every shortcut row', modal.querySelectorAll('.ynwac-sc-table tr').length >= 13);
key({ key: 'Escape', code: 'Escape' });
check('Esc closes the help panel', modal.dataset.show === '0');

/* ---- 8. disabled buttons are skipped ---- */
reset();
document.getElementById('b-next').disabled = true;
answer.focus();
key({ key: 'Enter', code: 'Enter', altKey: true });
check('a disabled 下一题 is not clicked', clicks().length === 0, `got ${JSON.stringify(clicks())}`);
document.getElementById('b-next').disabled = false;

/* ---- 9. auto-focus after navigating ---- */
reset();
answer.blur();
key({ key: 'n', code: 'KeyN' });
setTimeout(() => {
  check('cursor returns to the answer box after 下一题', document.activeElement === answer);

  /* ---- 10. custom binding via the picker ---- */
  const relabelled = document.getElementById('b-play');
  relabelled.textContent = '🔊 Listen again';
  reset();
  key({ key: 'a', code: 'KeyA', altKey: true });
  check('renamed play button is no longer matched', clicks().length === 0);

  key({ key: 'k', code: 'KeyK', altKey: true });
  check('Alt+K opens the picker', document.querySelector('.ynwac-sc-picker').dataset.show === '1');
  key({ key: '1', code: 'Digit1' });
  relabelled.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  check('picking a button does not fire it', clicks().length === 0);

  reset();
  key({ key: 'a', code: 'KeyA', altKey: true });
  check('Alt+A works again after re-binding', last() === 'b-play', `got ${last()}`);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}, 400);
