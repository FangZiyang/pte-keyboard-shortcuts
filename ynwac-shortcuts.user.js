// ==UserScript==
// @name         YNWAC PTE-CORE Keyboard Shortcuts
// @name:zh-CN   YNWAC PTE-CORE 键盘快捷键
// @namespace    https://github.com/FangZiyang/ynwac-wfd-shortcuts
// @version      1.0.0
// @description  Play / Submit / Reset / Next on ynwac.com practice pages (WFD and friends) without touching the mouse.
// @description:zh-CN  在 ynwac.com 练习页面用键盘完成 播放 / 提交 / 重置 / 下一题，不用再点鼠标。
// @author       FangZiyang
// @match        https://ynwac.com/*
// @match        https://www.ynwac.com/*
// @icon         https://ynwac.com/logo192.png
// @run-at       document-idle
// @grant        none
// @license      MIT
// @homepageURL  https://github.com/FangZiyang/ynwac-wfd-shortcuts
// @supportURL   https://github.com/FangZiyang/ynwac-wfd-shortcuts/issues
// @downloadURL  https://raw.githubusercontent.com/FangZiyang/ynwac-wfd-shortcuts/main/ynwac-shortcuts.user.js
// @updateURL    https://raw.githubusercontent.com/FangZiyang/ynwac-wfd-shortcuts/main/ynwac-shortcuts.user.js
// ==/UserScript==

(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Config — edit these, or use the in-page help panel (Alt+/)
   * ------------------------------------------------------------------ */
  const CONFIG = {
    // Put the cursor back in the answer box after Reset / Next / Previous.
    autoFocusAnswer: true,
    // Show the little toast confirming which button was pressed.
    showToast: true,
    // Single-letter shortcuts (p / s / r / n …) when you are NOT typing.
    quickKeys: true,
  };

  const STORE_PREFIX = 'ynwac-shortcuts:';
  const load = (k, d) => {
    try {
      const v = localStorage.getItem(STORE_PREFIX + k);
      return v === null ? d : JSON.parse(v);
    } catch (_) {
      return d;
    }
  };
  const save = (k, v) => {
    try {
      localStorage.setItem(STORE_PREFIX + k, JSON.stringify(v));
    } catch (_) {
      /* private mode, quota — not worth failing over */
    }
  };

  Object.assign(CONFIG, load('config', {}));
  const setConfig = (k, v) => {
    CONFIG[k] = v;
    save('config', CONFIG);
  };

  // User-recorded button labels from the picker (Alt+K): { actionId: "label" }
  let customLabels = load('labels', {});

  /* ------------------------------------------------------------------ *
   * Text matching
   * ------------------------------------------------------------------ */

  // Strip the decorations the site puts around labels: "▶ 播放", "下一题 →",
  // "← 上一题", "⟳ 重置". What is left is the bare word we match on.
  const DECORATION = /[\s ►▶▷⏵⏯⏸■●↻⟳⭯⭮←→⇐⇒<>«»·•|#*]+/g;

  const norm = (s) => (s || '').replace(DECORATION, '').trim().toLowerCase();
  const rawText = (el) => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();

  function isVisible(el) {
    if (!el || !el.getClientRects().length) return false;
    const st = getComputedStyle(el);
    return st.visibility !== 'hidden' && st.display !== 'none' && st.opacity !== '0';
  }

  function isEnabled(el) {
    if (el.disabled) return false;
    if (el.getAttribute('aria-disabled') === 'true') return false;
    return true;
  }

  /* ------------------------------------------------------------------ *
   * Actions
   *
   * `exactOnly: true` means we will never fall back to a fuzzy match.
   * Reset uses it on purpose: the sidebar has a "重置进度" (reset ALL
   * progress) button, and a loose match must never be able to hit it.
   * ------------------------------------------------------------------ */
  const ACTIONS = [
    {
      id: 'play',
      name: 'Play / replay audio',
      cn: '播放录音',
      labels: ['播放', '重播', '再听一次', 'play', 'replay', 'play audio'],
      deny: ['播放列表', 'playlist', '自动播放', 'autoplay', '倍速'],
    },
    {
      id: 'submit',
      name: 'Submit answer',
      cn: '提交答案',
      labels: ['提交', '提交答案', 'submit', 'submit answer'],
      deny: ['提交记录', '提交历史', '反馈', 'feedback'],
    },
    {
      id: 'reset',
      name: 'Reset this question',
      cn: '重置本题',
      labels: ['重置', '清空', 'reset', 'clear'],
      deny: ['重置进度', '重置全部', '重置所有', '重置密码', 'reset progress', 'reset all', 'reset password'],
      exactOnly: true, // never fuzzy-match — see comment above
    },
    {
      id: 'next',
      name: 'Next question',
      cn: '下一题',
      labels: ['下一题', '下一个', '下一句', 'next', 'next question'],
      deny: ['下一页', 'next page'],
    },
    {
      id: 'prev',
      name: 'Previous question',
      cn: '上一题',
      labels: ['上一题', '上一个', '上一句', 'prev', 'previous', 'previous question'],
      deny: ['上一页', 'previous page'],
    },
    {
      id: 'jump',
      name: 'Jump to question number',
      cn: '跳转到指定题号',
      labels: ['跳转', '跳转到', 'jump', 'go', 'go to'],
      deny: [],
    },
  ];

  const actionById = (id) => ACTIONS.find((a) => a.id === id);

  function clickableElements() {
    return Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"], a[href]'));
  }

  /**
   * Find the best element for an action.
   *
   * Scoring, highest wins:
   *   100  exact match on a label the user recorded with the picker
   *    90  exact match on a built-in label
   *    40  the element text starts with a label ("提交答案" for "提交")
   *    20  the element text merely contains a label
   *
   * Exact beats fuzzy, so "重置" wins over "重置进度" even when both exist.
   */
  function findTarget(actionId) {
    const action = actionById(actionId);
    if (!action) return null;

    const custom = customLabels[actionId] ? [norm(customLabels[actionId])] : [];
    const builtin = action.labels.map(norm).filter(Boolean);
    const deny = action.deny.map(norm).filter(Boolean);

    let best = null;
    let bestScore = 0;

    for (const el of clickableElements()) {
      if (!isVisible(el) || !isEnabled(el)) continue;

      const text = norm(rawText(el)) || norm(el.getAttribute('aria-label') || el.title || '');
      if (!text || text.length > 24) continue;
      if (deny.some((d) => text.includes(d))) continue;

      let score = 0;
      if (custom.includes(text)) score = 100;
      else if (builtin.includes(text)) score = 90;
      else if (!action.exactOnly) {
        for (const l of builtin) {
          if (text.startsWith(l)) score = Math.max(score, 40);
          else if (text.includes(l)) score = Math.max(score, 20);
        }
      }

      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    }
    return best;
  }

  function answerBox() {
    const areas = Array.from(document.querySelectorAll('textarea')).filter(isVisible);
    if (areas.length) return areas[0];
    return Array.from(document.querySelectorAll('[contenteditable="true"]')).filter(isVisible)[0] || null;
  }

  function jumpBox() {
    const inputs = Array.from(document.querySelectorAll('input')).filter(
      (el) => isVisible(el) && !['button', 'submit', 'checkbox', 'radio'].includes(el.type)
    );
    // The site labels it with a bare "#" placeholder.
    return inputs.find((el) => (el.placeholder || '').trim() === '#') || inputs.find((el) => /题号|number|#/i.test(el.placeholder || '')) || null;
  }

  function focusEl(el) {
    if (!el) return false;
    el.focus();
    if (typeof el.setSelectionRange === 'function' && el.value != null) {
      const n = el.value.length;
      try {
        el.setSelectionRange(n, n);
      } catch (_) {
        /* input types that reject selection ranges */
      }
    }
    return true;
  }

  // The answer box is re-rendered after navigation, so retry for a moment.
  function refocusAnswerSoon() {
    if (!CONFIG.autoFocusAnswer) return;
    let tries = 0;
    const tick = () => {
      const box = answerBox();
      if (box) {
        focusEl(box);
        return;
      }
      if (++tries < 10) setTimeout(tick, 60);
    };
    setTimeout(tick, 80);
  }

  function run(actionId) {
    const action = actionById(actionId);
    const el = findTarget(actionId);
    if (!el) {
      toast(`✕ ${action.cn} — 没找到按钮 / button not found`, true);
      return false;
    }
    el.click();
    toast(`${action.cn} · ${rawText(el) || action.name}`);
    if (actionId === 'next' || actionId === 'prev' || actionId === 'reset') refocusAnswerSoon();
    return true;
  }

  /* ------------------------------------------------------------------ *
   * Toast
   * ------------------------------------------------------------------ */
  let toastEl = null;
  let toastTimer = null;

  function toast(msg, isError) {
    if (!CONFIG.showToast) return;
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'ynwac-sc-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.dataset.error = isError ? '1' : '0';
    toastEl.dataset.show = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.dataset.show = '0';
    }, isError ? 2200 : 1100);
  }

  /* ------------------------------------------------------------------ *
   * Key map
   * ------------------------------------------------------------------ */

  // Use e.code for letters/digits so Alt+S works the same on macOS
  // (where Option+S produces "ß") as it does on Windows.
  function keyName(e) {
    const m = /^Key([A-Z])$/.exec(e.code) || /^Digit([0-9])$/.exec(e.code);
    if (m) return m[1].toLowerCase();
    if (e.code === 'Slash') return '/';
    if (e.code === 'Space') return 'space';
    return (e.key || '').toLowerCase();
  }

  function combo(e) {
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('mod');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('shift');
    parts.push(keyName(e));
    return parts.join('+');
  }

  // Work everywhere, including while typing in the answer box.
  const GLOBAL_KEYS = {
    'mod+enter': () => run('submit'),
    'alt+enter': () => run('next'),
    'alt+a': () => run('play'),
    'alt+p': () => run('play'),
    'alt+s': () => run('submit'),
    'alt+r': () => run('reset'),
    'alt+n': () => run('next'),
    'alt+arrowright': () => run('next'),
    'alt+b': () => run('prev'),
    'alt+arrowleft': () => run('prev'),
    'alt+i': () => focusEl(answerBox()) || toast('✕ 找不到输入框 / no answer box', true),
    'alt+j': () => focusEl(jumpBox()) || toast('✕ 找不到题号框 / no jump box', true),
    'alt+/': () => toggleHelp(),
    'alt+k': () => openPicker(),
    'alt+shift+k': () => {
      customLabels = {};
      save('labels', customLabels);
      toast('已清除自定义绑定 / custom bindings cleared');
    },
  };

  // Only when the cursor is NOT in a text field. Press Esc to get here.
  const QUICK_KEYS = {
    p: () => run('play'),
    a: () => run('play'),
    s: () => run('submit'),
    r: () => run('reset'),
    n: () => run('next'),
    b: () => run('prev'),
    i: () => focusEl(answerBox()),
    j: () => focusEl(jumpBox()),
    arrowright: () => run('next'),
    arrowleft: () => run('prev'),
    '/': () => toggleHelp(),
    'shift+/': () => toggleHelp(),
  };

  function isTyping() {
    const el = document.activeElement;
    if (!el) return false;
    if (el.isContentEditable) return true;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  }

  document.addEventListener(
    'keydown',
    (e) => {
      // Mid-composition in a Chinese/Japanese IME — hands off.
      if (e.isComposing || e.keyCode === 229) return;

      const key = combo(e);

      if (pickerState.active) {
        if (pickerState.handleKey(e, key)) {
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }

      if (key === 'escape') {
        if (helpOpen) {
          toggleHelp(false);
          e.preventDefault();
        } else if (isTyping()) {
          document.activeElement.blur();
          e.preventDefault();
        }
        return;
      }

      const global = GLOBAL_KEYS[key];
      if (global) {
        e.preventDefault();
        e.stopPropagation();
        global();
        return;
      }

      if (!CONFIG.quickKeys || isTyping() || helpOpen) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const quick = QUICK_KEYS[key];
      if (quick) {
        e.preventDefault();
        e.stopPropagation();
        quick();
      }
    },
    true // capture, so the site's own handlers do not swallow these first
  );

  /* ------------------------------------------------------------------ *
   * Help panel (Alt+/, or "?" when not typing)
   * ------------------------------------------------------------------ */
  const HELP_ROWS = [
    ['Ctrl / ⌘ + Enter', '提交 Submit'],
    ['Alt + Enter', '下一题 Next'],
    ['Alt + A  /  Alt + P', '播放 Play'],
    ['Alt + S', '提交 Submit'],
    ['Alt + R', '重置 Reset'],
    ['Alt + N  /  Alt + →', '下一题 Next'],
    ['Alt + B  /  Alt + ←', '上一题 Previous'],
    ['Alt + I', '光标回到答题框 Focus answer box'],
    ['Alt + J', '光标到题号框 Focus jump box'],
    ['Esc', '离开输入框 Leave the text box'],
    ['p / a · s · r · n · b', '不在输入框时的单键版 Single-key (when not typing)'],
    ['Alt + K', '重新绑定按钮 Re-bind a button'],
    ['Alt + Shift + K', '清除自定义绑定 Clear custom bindings'],
    ['Alt + /  或 ?', '打开/关闭本面板 Toggle this panel'],
  ];

  let helpEl = null;
  let helpOpen = false;

  function buildHelp() {
    const wrap = document.createElement('div');
    wrap.className = 'ynwac-sc-modal';
    wrap.innerHTML = `
      <div class="ynwac-sc-card" role="dialog" aria-label="Keyboard shortcuts">
        <div class="ynwac-sc-head">
          <span>⌨️ YNWAC 快捷键 / Shortcuts</span>
          <button class="ynwac-sc-x" type="button" aria-label="Close">✕</button>
        </div>
        <table class="ynwac-sc-table">
          ${HELP_ROWS.map(([k, d]) => `<tr><td><kbd>${k}</kbd></td><td>${d}</td></tr>`).join('')}
        </table>
        <label class="ynwac-sc-opt"><input type="checkbox" data-opt="autoFocusAnswer"> 切题后自动聚焦答题框 / auto-focus answer box after navigating</label>
        <label class="ynwac-sc-opt"><input type="checkbox" data-opt="quickKeys"> 启用单键快捷键 / enable single-key shortcuts</label>
        <label class="ynwac-sc-opt"><input type="checkbox" data-opt="showToast"> 显示操作提示 / show toast</label>
      </div>`;

    wrap.addEventListener('mousedown', (e) => {
      if (e.target === wrap || e.target.classList.contains('ynwac-sc-x')) toggleHelp(false);
    });
    wrap.querySelectorAll('[data-opt]').forEach((cb) => {
      cb.checked = !!CONFIG[cb.dataset.opt];
      cb.addEventListener('change', () => setConfig(cb.dataset.opt, cb.checked));
    });
    return wrap;
  }

  function toggleHelp(force) {
    const next = force === undefined ? !helpOpen : force;
    if (next && !helpEl) {
      helpEl = buildHelp();
      document.body.appendChild(helpEl);
    }
    if (helpEl) helpEl.dataset.show = next ? '1' : '0';
    helpOpen = next;
  }

  /* ------------------------------------------------------------------ *
   * Picker (Alt+K) — click a button to teach the script its label.
   *
   * The site ships hashed CSS class names, so the visible text is the
   * only stable handle. We record that text and match on it first.
   * ------------------------------------------------------------------ */
  const pickerState = { active: false, action: null, handleKey: () => false };

  let pickerEl = null;

  function openPicker() {
    toggleHelp(false);
    if (!pickerEl) {
      pickerEl = document.createElement('div');
      pickerEl.className = 'ynwac-sc-picker';
      document.body.appendChild(pickerEl);
    }
    pickerState.active = true;
    pickerState.action = null;
    renderPicker();

    pickerState.handleKey = (e, key) => {
      if (key === 'escape') {
        closePicker();
        return true;
      }
      const i = parseInt(key, 10);
      if (!pickerState.action && i >= 1 && i <= ACTIONS.length) {
        pickerState.action = ACTIONS[i - 1];
        renderPicker();
        document.addEventListener('click', pickOnce, true);
        return true;
      }
      return true; // swallow everything else while picking
    };
  }

  function renderPicker() {
    if (!pickerState.action) {
      pickerEl.innerHTML =
        `<b>重新绑定 / Re-bind</b><div class="ynwac-sc-hint">按数字选择要绑定的动作，Esc 取消<br>Press a number to choose an action, Esc to cancel</div>` +
        ACTIONS.map((a, i) => `<div class="ynwac-sc-row"><kbd>${i + 1}</kbd> ${a.cn} <span>${a.name}</span></div>`).join('');
    } else {
      pickerEl.innerHTML =
        `<b>${pickerState.action.cn}</b><div class="ynwac-sc-hint">现在点击页面上对应的按钮（点击不会触发该按钮）<br>Now click that button on the page — the click will not activate it.<br>Esc to cancel</div>`;
    }
    pickerEl.dataset.show = '1';
  }

  function pickOnce(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = e.target.closest('button, [role="button"], input[type="button"], input[type="submit"], a[href]');
    document.removeEventListener('click', pickOnce, true);

    if (!el) {
      toast('✕ 那不是一个按钮 / not a button', true);
      closePicker();
      return;
    }
    const label = rawText(el) || el.getAttribute('aria-label') || '';
    if (!norm(label)) {
      toast('✕ 该按钮没有可识别的文字 / no readable label', true);
      closePicker();
      return;
    }
    customLabels[pickerState.action.id] = label;
    save('labels', customLabels);
    toast(`✓ ${pickerState.action.cn} → “${label.trim()}”`);
    closePicker();
  }

  function closePicker() {
    pickerState.active = false;
    pickerState.action = null;
    document.removeEventListener('click', pickOnce, true);
    if (pickerEl) pickerEl.dataset.show = '0';
  }

  /* ------------------------------------------------------------------ *
   * Styles
   * ------------------------------------------------------------------ */
  const css = document.createElement('style');
  css.textContent = `
.ynwac-sc-toast{position:fixed;right:18px;bottom:18px;z-index:2147483000;max-width:min(70vw,420px);
  padding:9px 14px;border-radius:10px;font:500 13px/1.45 system-ui,-apple-system,"Segoe UI","Microsoft YaHei",sans-serif;
  color:#fff;background:#1f2937;box-shadow:0 8px 26px rgba(0,0,0,.24);
  opacity:0;transform:translateY(8px);transition:opacity .14s ease,transform .14s ease;pointer-events:none}
.ynwac-sc-toast[data-show="1"]{opacity:.96;transform:translateY(0)}
.ynwac-sc-toast[data-error="1"]{background:#b91c1c}

.ynwac-sc-modal{position:fixed;inset:0;z-index:2147483001;display:none;align-items:center;justify-content:center;
  background:rgba(15,23,42,.45);backdrop-filter:blur(2px);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI","Microsoft YaHei",sans-serif}
.ynwac-sc-modal[data-show="1"]{display:flex}
.ynwac-sc-card{background:#fff;color:#111827;border-radius:14px;padding:18px 20px;
  max-width:min(92vw,600px);max-height:86vh;overflow:auto;box-shadow:0 24px 64px rgba(0,0,0,.3)}
.ynwac-sc-head{display:flex;align-items:center;justify-content:space-between;gap:16px;
  font-weight:700;font-size:15px;margin-bottom:12px}
.ynwac-sc-x{border:0;background:#f3f4f6;border-radius:8px;width:28px;height:28px;cursor:pointer;font-size:13px;color:#374151}
.ynwac-sc-x:hover{background:#e5e7eb}
.ynwac-sc-table{border-collapse:collapse;width:100%}
.ynwac-sc-table td{padding:5px 8px;vertical-align:middle;border-bottom:1px solid #f1f5f9}
.ynwac-sc-table td:first-child{white-space:nowrap;width:1%}
.ynwac-sc-card kbd{display:inline-block;padding:2px 7px;border-radius:6px;border:1px solid #d1d5db;border-bottom-width:2px;
  background:#f9fafb;font:600 12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#111827}
.ynwac-sc-opt{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:13px;color:#374151;cursor:pointer}

.ynwac-sc-picker{position:fixed;left:50%;top:22px;transform:translateX(-50%);z-index:2147483002;display:none;
  min-width:min(92vw,420px);padding:14px 18px;border-radius:12px;background:#111827;color:#f9fafb;
  box-shadow:0 18px 48px rgba(0,0,0,.36);font:14px/1.55 system-ui,-apple-system,"Segoe UI","Microsoft YaHei",sans-serif}
.ynwac-sc-picker[data-show="1"]{display:block}
.ynwac-sc-hint{margin:6px 0 10px;font-size:12px;color:#9ca3af}
.ynwac-sc-row{padding:3px 0}
.ynwac-sc-row span{color:#9ca3af;font-size:12px}
.ynwac-sc-picker kbd{display:inline-block;min-width:18px;text-align:center;padding:1px 6px;margin-right:6px;
  border-radius:5px;background:#374151;font:600 12px/1.5 ui-monospace,Menlo,Consolas,monospace}
`;
  document.documentElement.appendChild(css);

  // One-time nudge so the shortcuts are discoverable.
  if (!load('seen-hint', false)) {
    save('seen-hint', true);
    setTimeout(() => toast('⌨️ 快捷键已启用，按 Alt + / 查看 · Shortcuts on — press Alt + / for the list'), 1200);
  }
})();
