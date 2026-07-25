const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const script = fs.readFileSync(path.join(__dirname, '..', 'ynwac-shortcuts.user.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, 'fixture.html'), 'utf8').replace(/<script src=[^>]*><\/script>/, '');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ynwac.com/wfd' });
const { window } = dom;
const { document } = window;

// jsdom has no layout: getClientRects() is always empty, so isVisible() would
// reject everything and hint chips would have nowhere to sit.
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
const click = (el) => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
const clicks = () => window.__clicks;
const last = () => window.__clicks[window.__clicks.length - 1];
const reset = () => { window.__clicks.length = 0; };
const chips = () => [...document.querySelectorAll('.ynwac-sc-chip')].map((c) => c.textContent);

const answer = document.getElementById('answer');

/* ---- 1. modifier shortcuts while typing ---- */
answer.focus();
check('focus is in the textarea', document.activeElement === answer);

key({ key: 'p', code: 'KeyP', altKey: true });
check('Alt+P -> 播放', last() === 'b-play', `got ${last()}`);

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

/* ---- 1a. the number row, left to right along the toolbar ---- */
const NUMBERED = [['1', 'b-play'], ['2', 'b-submit'], ['3', 'b-reset'], ['4', 'b-prev'], ['5', 'b-next']];
for (const [digit, id] of NUMBERED) {
  reset();
  key({ key: digit, code: `Digit${digit}`, altKey: true });
  check(`Alt+${digit} -> ${id.replace('b-', '')}`, last() === id, `got ${last()}`);
}

/* ---- 1b. live-site states the mock originally missed ---- */
reset();
check('the toolbar 播放 wins over an identical sidebar button', clicks().length === 0);
key({ key: 'p', code: 'KeyP', altKey: true });
check('Alt+P hits the toolbar button, not the decoy', last() === 'b-play', `got ${last()}`);

// The site relabels this button to 停止 while the audio is playing.
const playBtn = document.getElementById('b-play');
playBtn.textContent = '停止';
reset();
key({ key: 'p', code: 'KeyP', altKey: true });
check('Alt+P still works when 播放 has become 停止', last() === 'b-play', `got ${last()}`);
playBtn.textContent = '▶ 播放';

/* ---- 2. Alt+A must stay free for Immersive Translate ---- */
reset();
const altA = key({ key: 'a', code: 'KeyA', altKey: true });
check('Alt+A is not bound (translator keeps it)', clicks().length === 0 && !altA.defaultPrevented);

/* ---- 3. plain typing still reaches the textarea ---- */
reset();
const typed = key({ key: 'n', code: 'KeyN' });
check('plain "n" while typing is NOT intercepted', clicks().length === 0 && !typed.defaultPrevented);

/* ---- 4. Esc, then single keys ---- */
key({ key: 'Escape', code: 'Escape' });
check('Esc blurs the textarea', document.activeElement !== answer);

reset();
key({ key: 'p', code: 'KeyP' });
check('quick key "p" -> 播放', last() === 'b-play', `got ${last()}`);

reset();
key({ key: 'r', code: 'KeyR' });
check('quick key "r" -> 重置 (not 重置进度)', last() === 'b-reset' && !clicks().includes('b-resetall'), `got ${last()}`);

/* ---- 5. focus helpers ---- */
key({ key: 'i', code: 'KeyI', altKey: true });
check('Alt+I focuses the answer box', document.activeElement === answer);
key({ key: 'j', code: 'KeyJ', altKey: true });
check('Alt+J focuses the # field', document.activeElement === document.getElementById('b-num'));

/* ---- 6. macOS Option+S emits "ß" but code KeyS ---- */
reset();
answer.focus();
key({ key: 'ß', code: 'KeyS', altKey: true });
check('macOS Option+S still submits (uses e.code)', last() === 'b-submit', `got ${last()}`);

/* ---- 7. IME ---- */
reset();
answer.blur();
key({ key: 'r', code: 'KeyR', isComposing: true });
check('bare keys during IME composition are ignored', clicks().length === 0);

reset();
answer.focus();
key({ key: 'r', code: 'KeyR', altKey: true, keyCode: 229 });
check('Alt+R still works with a Chinese IME active', last() === 'b-reset', `got ${last()}`);

/* ---- 8. hint chips drawn on the buttons ---- */
answer.focus();
window.dispatchEvent(new window.Event('resize'));

setTimeout(() => {
  const typingChips = chips();
  check(
    'chips show the numbers while typing',
    ['Alt+1', 'Alt+2', 'Alt+3', 'Alt+4', 'Alt+5'].every((k) => typingChips.includes(k)),
    typingChips.join(' ')
  );

  answer.blur();
  window.dispatchEvent(new window.Event('resize'));

  setTimeout(() => {
    const idleChips = chips();
    check(
      'chips drop the modifier once you leave the box',
      ['1', '2', '3', '4', '5'].every((k) => idleChips.includes(k)),
      idleChips.join(' ')
    );

    /* ---- 9. rebinding through the panel ---- */
    key({ key: '/', code: 'Slash', altKey: true });
    const panel = document.querySelector('.ynwac-sc-modal');
    check('Alt+/ opens the panel', !!panel && panel.dataset.show === '1');

    const rebind = panel.querySelector('.ynwac-sc-rebind[data-act="play"]');
    check('panel has a Rebind button for 播放', !!rebind);
    click(rebind);

    key({ key: 'Alt', code: 'AltLeft', altKey: true }); // bare modifier: ignored
    check('a bare modifier does not end capture', !!panel.querySelector('.ynwac-sc-listening'));

    key({ key: 'y', code: 'KeyY', altKey: true });
    key({ key: 'Escape', code: 'Escape' });

    reset();
    answer.focus();
    key({ key: 'y', code: 'KeyY', altKey: true });
    check('rebound Alt+Y -> 播放', last() === 'b-play', `got ${last()}`);

    reset();
    const oldKey = key({ key: '1', code: 'Digit1', altKey: true });
    check('the replaced primary Alt+1 is released', clicks().length === 0 && !oldKey.defaultPrevented);

    reset();
    key({ key: 'p', code: 'KeyP', altKey: true });
    check('the Alt+P alternate survives rebinding', last() === 'b-play', `got ${last()}`);

    check(
      'rebinding persists to localStorage',
      JSON.parse(window.localStorage.getItem('ynwac-shortcuts:bindings')).play[0] === 'alt+y'
    );

    /* ---- 10. stealing a key takes it off the other action ---- */
    key({ key: '/', code: 'Slash', altKey: true });
    click(document.querySelector('.ynwac-sc-rebind[data-act="next"]'));
    key({ key: 'y', code: 'KeyY', altKey: true });
    key({ key: 'Escape', code: 'Escape' });

    reset();
    answer.focus();
    key({ key: 'y', code: 'KeyY', altKey: true });
    check('Alt+Y now means 下一题, not 播放', last() === 'b-next', `got ${last()}`);

    /* ---- 11. master switch ---- */
    reset();
    key({ key: '0', code: 'Digit0', altKey: true });
    key({ key: 'Enter', code: 'Enter', ctrlKey: true });
    check('Alt+0 turns every shortcut off', clicks().length === 0);
    check('hints disappear when disabled', chips().length === 0);

    key({ key: '/', code: 'Slash', altKey: true });
    check('the panel still opens while disabled', document.querySelector('.ynwac-sc-modal').dataset.show === '1');
    key({ key: 'Escape', code: 'Escape' });

    key({ key: '0', code: 'Digit0', altKey: true });
    reset();
    answer.focus();
    key({ key: 'Enter', code: 'Enter', ctrlKey: true });
    check('Alt+0 turns them back on', last() === 'b-submit', `got ${last()}`);

    /* ---- 12. reset to defaults ---- */
    key({ key: '/', code: 'Slash', altKey: true });
    click(document.querySelector('.ynwac-sc-reset'));
    key({ key: 'Escape', code: 'Escape' });

    reset();
    answer.focus();
    key({ key: 'p', code: 'KeyP', altKey: true });
    check('Reset to defaults restores Alt+P', last() === 'b-play', `got ${last()}`);

    /* ---- 13. disabled buttons are skipped ---- */
    reset();
    document.getElementById('b-next').disabled = true;
    key({ key: 'Enter', code: 'Enter', altKey: true });
    check('a disabled 下一题 is not clicked', clicks().length === 0, JSON.stringify(clicks()));
    document.getElementById('b-next').disabled = false;

    /* ---- 14. auto-focus after navigating ---- */
    reset();
    answer.blur();
    key({ key: 'n', code: 'KeyN' });
    setTimeout(() => {
      check('cursor returns to the answer box after 下一题', document.activeElement === answer);

      /* ---- 15. picker re-teaches a renamed button ---- */
      const play = document.getElementById('b-play');
      play.textContent = '🔊 Listen again';
      // Take the sidebar decoy out of the running too, so nothing at all
      // matches and we are testing the picker rather than the fallback.
      document.getElementById('b-decoy-play').textContent = '侧边栏';

      reset();
      answer.focus();
      key({ key: 'p', code: 'KeyP', altKey: true });
      check('renamed play button is no longer matched', clicks().length === 0, JSON.stringify(clicks()));

      key({ key: 'k', code: 'KeyK', altKey: true });
      check('Alt+K opens the picker', document.querySelector('.ynwac-sc-picker').dataset.show === '1');
      key({ key: '1', code: 'Digit1' });
      reset();
      click(play);
      check('picking a button does not fire it', clicks().length === 0, JSON.stringify(clicks()));

      reset();
      key({ key: 'p', code: 'KeyP', altKey: true });
      check('Alt+P works again after re-teaching the label', last() === 'b-play', `got ${last()}`);

      console.log(`\n${pass} passed, ${fail} failed`);
      process.exit(fail ? 1 : 0);
    }, 400);
  }, 300);
}, 300);
