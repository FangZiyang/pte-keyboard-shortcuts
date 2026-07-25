// ==UserScript==
// @name         PTE Keyboard Shortcuts — YNWAC
// @name:zh-CN   PTE 键盘快捷键 — YNWAC
// @namespace    https://github.com/FangZiyang/pte-keyboard-shortcuts
// @version      1.4.0
// @description  Play / Submit / Reset / Next on ynwac.com PTE practice pages without touching the mouse — plus record, AI score and re-record on speaking questions. Rebindable keys, on-button hints.
// @description:zh-CN  在 ynwac.com PTE 练习页面用键盘完成 播放 / 提交 / 重置 / 下一题，口语题还支持 录音 / AI 评分 / 重录。快捷键可自定义，按钮上直接显示提示。
// @author       FangZiyang
// @match        https://ynwac.com/*
// @match        https://www.ynwac.com/*
// @icon         https://ynwac.com/logo192.png
// @run-at       document-idle
// @grant        none
// @license      MIT
// @homepageURL  https://github.com/FangZiyang/pte-keyboard-shortcuts
// @supportURL   https://github.com/FangZiyang/pte-keyboard-shortcuts/issues
// @downloadURL  https://raw.githubusercontent.com/FangZiyang/pte-keyboard-shortcuts/main/ynwac-shortcuts.user.js
// @updateURL    https://raw.githubusercontent.com/FangZiyang/pte-keyboard-shortcuts/main/ynwac-shortcuts.user.js
// ==/UserScript==

(function () {
  'use strict';

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

  const CONFIG = Object.assign(
    {
      enabled: true,
      autoFocusAnswer: true,
      showToast: true,
      quickKeys: true,
      showHints: true, // key badges drawn on the buttons themselves
    },
    load('config', {})
  );
  const setConfig = (k, v) => {
    CONFIG[k] = v;
    save('config', CONFIG);
    if (k === 'showHints' || k === 'enabled') refreshHints();
  };

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  /* ------------------------------------------------------------------ *
   * Default bindings
   *
   * Alt+A is deliberately NOT used: it is Immersive Translate's default
   * "translate page" hotkey, and extension listeners live in an isolated
   * world where our preventDefault cannot reach them. Anything here can
   * be rebound from the help panel (Alt+/) if it clashes with something
   * else you have installed.
   * ------------------------------------------------------------------ */
  /*
   * 1-5 run left to right along the toolbar:
   *
   *   播放 1   提交 2   重置 3   …   上一题 4   下一题 5
   *
   * The number belongs to the action, not to the button's position, so
   * nothing shifts under your fingers when 提交 disappears on a question
   * you have already submitted. Letters are kept as alternates.
   *
   * On speaking questions the middle three point elsewhere — see
   * SPEAKING_SLOTS below.
   *
   * Alt+1-9 is free on Windows and macOS Chrome (tab switching there is
   * Ctrl/Cmd+1-9). On Linux Chrome, Alt+1-9 does switch tabs — rebind if
   * that is you.
   */
  const DEFAULT_BINDINGS = {
    play: ['alt+1', 'alt+p'],
    submit: ['alt+2', 'mod+enter', 'alt+s'],
    reset: ['alt+3', 'alt+r'],
    prev: ['alt+4', 'alt+b', 'alt+arrowleft'],
    next: ['alt+5', 'alt+enter', 'alt+n', 'alt+arrowright'],
    // Speaking questions (RA, RS) only — absent elsewhere, so 6-9 simply
    // do nothing on Write From Dictation.
    record: ['alt+6'],
    skipPrep: ['alt+7'],
    aiScore: ['alt+8'],
    rerecord: ['alt+9'],
    focusAnswer: ['alt+i'],
    focusJump: ['alt+j'],
  };

  // Single keys, live only when the cursor is not in a text field.
  const DEFAULT_QUICK = {
    play: ['1', 'p'],
    submit: ['2', 's'],
    reset: ['3', 'r'],
    prev: ['4', 'b', 'arrowleft'],
    next: ['5', 'n', 'arrowright'],
    record: ['6'],
    skipPrep: ['7'],
    aiScore: ['8'],
    rerecord: ['9'],
    focusAnswer: ['i'],
    focusJump: ['j'],
  };

  let bindings = Object.assign({}, DEFAULT_BINDINGS, load('bindings', {}));
  let quickKeys = Object.assign({}, DEFAULT_QUICK, load('quick', {}));

  /* ------------------------------------------------------------------ *
   * Actions
   * ------------------------------------------------------------------ */
  const ACTIONS = [
    {
      id: 'play',
      kind: 'click',
      name: 'Play / stop audio',
      cn: '播放 / 停止',
      // RA and RS render the player as an icon with no text at all.
      selectors: ['.pte-audio-pill__play'],
      // On WFD the site swaps this button's label to 停止 while the audio
      // is playing, so the same key has to match both states.
      labels: ['播放', '停止', '暂停', '重播', '停止播放', '再听一次', 'play', 'stop', 'pause', 'replay'],
      deny: ['播放列表', 'playlist', '自动播放', 'autoplay', '倍速'],
    },
    {
      id: 'submit',
      kind: 'click',
      name: 'Submit answer',
      cn: '提交答案',
      labels: ['提交', '提交答案', 'submit', 'submit answer'],
      deny: ['提交记录', '提交历史', '反馈', 'feedback'],
    },
    {
      id: 'reset',
      kind: 'click',
      name: 'Reset this question',
      cn: '重置本题',
      labels: ['重置', '清空', 'reset', 'clear'],
      // The sidebar has 重置进度 (wipe ALL practice progress). Exact match
      // only, so no fuzzy match can ever reach it.
      deny: ['重置进度', '重置全部', '重置所有', '重置密码', 'reset progress', 'reset all', 'reset password'],
      exactOnly: true,
    },
    // Listed in toolbar order so the panel and the picker's 1-N numbering
    // read the same way the buttons do.
    {
      id: 'prev',
      kind: 'click',
      name: 'Previous question',
      cn: '上一题',
      labels: ['上一题', '上一个', '上一句', 'prev', 'previous', 'previous question'],
      deny: ['上一页', 'previous page'],
    },
    {
      id: 'next',
      kind: 'click',
      name: 'Next question',
      cn: '下一题',
      labels: ['下一题', '下一个', '下一句', 'next', 'next question'],
      deny: ['下一页', 'next page'],
    },
    // Speaking questions (Read Aloud, Repeat Sentence). Both controls are
    // icon-only, so the component class is the only handle — the labels
    // are a fallback in case the markup changes.
    {
      id: 'record',
      kind: 'click',
      name: 'Record / stop recording',
      cn: '录音 / 停止录音',
      selectors: ['.pte-rec-pill__main'],
      labels: ['录音', '录音控制', '录音或播放', '开始录音', '停止录音', 'record', 'stop recording'],
      deny: [],
    },
    {
      id: 'skipPrep',
      kind: 'click',
      name: 'Skip the preparation countdown',
      cn: '跳过准备',
      selectors: ['.pte-rec-pill__skip'],
      labels: ['跳过准备', '跳过', 'skip', 'skip preparation'],
      deny: [],
    },
    {
      id: 'aiScore',
      kind: 'click',
      name: 'AI-score this take',
      cn: 'AI 评分',
      selectors: ['.pte-rec-pill__submit'],
      // The button also reads 「AI未开通」 on accounts without the feature,
      // so match that too rather than reporting "button not found".
      labels: ['ai评分', 'ai打分', 'ai批改', 'ai未开通', '评分', 'ai score'],
      deny: ['评分标准', '评分说明', '历史评分'],
    },
    {
      id: 'rerecord',
      kind: 'click',
      name: 'Discard the take and record again',
      cn: '重录',
      // Icon-only, with title="重置" — the class is what keeps this apart
      // from the toolbar's 重置 (wipe the whole question).
      selectors: ['.pte-rec-pill__reset'],
      labels: ['重录', '重新录音', 're-record', 'record again'],
      deny: ['重置进度', '重置全部', '重置所有', '重置本题'],
      exactOnly: true,
    },
    { id: 'focusAnswer', kind: 'focus', name: 'Focus the answer box', cn: '光标到答题框' },
    { id: 'focusJump', kind: 'focus', name: 'Focus the # box', cn: '光标到题号框' },
  ];
  const actionById = (id) => ACTIONS.find((a) => a.id === id);

  /* ------------------------------------------------------------------ *
   * Speaking questions borrow the middle of the number row
   *
   * RA and RS have no answer box and nothing worth 提交-ing — the loop is
   * 听 → 说 → 看分 → 下一题. So whenever the recorder pill is on the page,
   * slots 2/3/4 point at the recorder's own controls instead:
   *
   *   播放 1   停止录音 2   AI 评分 3   重录 4   下一题 5
   *
   * Only each slot's PRIMARY key moves, so rebinding a slot carries the
   * swap with it. The alternates keep their original meaning everywhere
   * (Alt+S 提交, Alt+R 重置本题, Alt+B 上一题) — nothing is lost, and the
   * toolbar keys still work on a speaking question if you want them.
   * ------------------------------------------------------------------ */
  const SPEAKING_SLOTS = { submit: 'record', reset: 'aiScore', prev: 'rerecord' };
  const speakingMode = () => Array.from(document.querySelectorAll('.pte-rec-pill')).some(isVisible);
  const slotAction = (id) => (speakingMode() && SPEAKING_SLOTS[id]) || id;

  /* ------------------------------------------------------------------ *
   * Finding buttons by their visible label
   * ------------------------------------------------------------------ */
  const DECORATION = /[\s ►▶▷⏵⏯⏸■●↻⟳⭯⭮←→⇐⇒<>«»·•|#*]+/g;
  const norm = (s) => (s || '').replace(DECORATION, '').trim().toLowerCase();
  const rawText = (el) => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();

  function isVisible(el) {
    if (!el || !el.getClientRects().length) return false;
    const st = getComputedStyle(el);
    return st.visibility !== 'hidden' && st.display !== 'none' && st.opacity !== '0';
  }
  const isEnabled = (el) => !el.disabled && el.getAttribute('aria-disabled') !== 'true';

  let customLabels = load('labels', {});

  const CLICKABLE = 'button, [role="button"], input[type="button"], input[type="submit"], a[href]';

  // The practice toolbar carries a semantic class of its own. Matching text
  // still does the real work — this is a tie-breaker that keeps us inside
  // the question controls and away from lookalikes elsewhere on the page.
  const TOOLBAR = '.pte-toolbar-btn';

  /**
   * Exact matches outrank fuzzy ones, so "重置" wins over "重置进度".
   */
  function findTarget(actionId) {
    const action = actionById(actionId);
    if (!action || action.kind !== 'click') return null;

    const custom = customLabels[actionId] ? [norm(customLabels[actionId])] : [];

    // A component class beats guessing at text — but never overrules a
    // button the user pointed at themselves with the picker.
    if (!custom.length && action.selectors) {
      for (const sel of action.selectors) {
        for (const el of document.querySelectorAll(sel)) {
          if (isVisible(el) && isEnabled(el)) return el;
        }
      }
    }

    const builtin = action.labels.map(norm).filter(Boolean);
    const deny = action.deny.map(norm).filter(Boolean);

    let best = null;
    let bestScore = 0;

    for (const el of document.querySelectorAll(CLICKABLE)) {
      if (el.closest('.ynwac-sc-root')) continue;
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
      if (score && el.closest(TOOLBAR)) score += 5;

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

  function refocusAnswerSoon() {
    if (!CONFIG.autoFocusAnswer) return;
    let tries = 0;
    const tick = () => {
      const box = answerBox();
      if (box) return focusEl(box);
      if (++tries < 10) setTimeout(tick, 60);
    };
    setTimeout(tick, 80);
  }

  function run(actionId) {
    const action = actionById(actionId);
    if (!action) return false;

    if (action.kind === 'focus') {
      const box = actionId === 'focusAnswer' ? answerBox() : jumpBox();
      if (!focusEl(box)) {
        toast(`✕ ${action.cn} — 没找到 / not found`, true);
        return false;
      }
      return true;
    }

    const el = findTarget(actionId);
    if (!el) {
      toast(`✕ ${action.cn} — 没找到按钮 / button not found`, true);
      return false;
    }
    el.click();
    toast(`${action.cn} · ${rawText(el) || action.name}`);
    if (['next', 'prev', 'reset'].includes(actionId)) refocusAnswerSoon();
    setTimeout(refreshHints, 200);
    return true;
  }

  /* ------------------------------------------------------------------ *
   * Key naming
   * ------------------------------------------------------------------ */

  // e.code for letters/digits, so Alt+S behaves the same on macOS where
  // Option+S emits "ß".
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

  const KEY_LABEL = {
    mod: isMac ? '⌘' : 'Ctrl',
    alt: isMac ? '⌥' : 'Alt',
    shift: isMac ? '⇧' : 'Shift',
    enter: 'Enter',
    arrowright: '→',
    arrowleft: '←',
    arrowup: '↑',
    arrowdown: '↓',
    escape: 'Esc',
    space: 'Space',
  };
  const pretty = (c) =>
    c
      .split('+')
      .map((p) => KEY_LABEL[p] || (p.length === 1 ? p.toUpperCase() : p))
      .join(isMac ? '' : '+');

  const isModifierKey = (e) => ['Alt', 'Control', 'Shift', 'Meta'].includes(e.key);

  /* ------------------------------------------------------------------ *
   * Dispatch
   * ------------------------------------------------------------------ */
  // Index 0 is the slot's primary key and is subject to the speaking-mode
  // swap; the alternates behind it always mean what they say.
  function actionForCombo(c, typing) {
    for (const id of Object.keys(bindings)) {
      const i = (bindings[id] || []).indexOf(c);
      if (i === 0) return slotAction(id);
      if (i > 0) return id;
    }
    if (!typing && CONFIG.quickKeys && !/\+/.test(c)) {
      for (const id of Object.keys(quickKeys)) {
        const i = (quickKeys[id] || []).indexOf(c);
        if (i === 0) return slotAction(id);
        if (i > 0) return id;
      }
    }
    return null;
  }

  function isTyping() {
    const el = document.activeElement;
    if (!el) return false;
    if (el.isContentEditable) return true;
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
  }

  document.addEventListener(
    'keydown',
    (e) => {
      const key = combo(e);
      const hasModifier = e.ctrlKey || e.metaKey || e.altKey;

      // Mid-composition in a Chinese/Japanese IME — hands off. Bare keys
      // only: some IMEs report keyCode 229 for everything while active,
      // and a modifier combo is never part of a composition.
      if (!hasModifier && (e.isComposing || e.keyCode === 229)) return;

      if (captureState.active) {
        captureState.onKey(e, key);
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (pickerState.active) {
        pickerState.handleKey(e, key);
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (key === 'escape') {
        if (panelOpen) {
          togglePanel(false);
          e.preventDefault();
        } else if (isTyping()) {
          document.activeElement.blur();
          e.preventDefault();
          refreshHints();
        }
        return;
      }

      // Panel shortcuts stay alive even when everything else is off, so
      // there is always a way back in.
      if (key === 'alt+/' || (!isTyping() && (key === '/' || key === 'shift+/'))) {
        e.preventDefault();
        e.stopPropagation();
        togglePanel();
        return;
      }
      if (key === 'alt+0') {
        e.preventDefault();
        setConfig('enabled', !CONFIG.enabled);
        toast(CONFIG.enabled ? '快捷键已开启 / shortcuts on' : '快捷键已关闭 / shortcuts off');
        return;
      }

      if (!CONFIG.enabled || panelOpen) return;

      if (key === 'alt+h') {
        e.preventDefault();
        setConfig('showHints', !CONFIG.showHints);
        return;
      }
      if (key === 'alt+k') {
        e.preventDefault();
        openPicker();
        return;
      }

      const id = actionForCombo(key, isTyping());
      if (id) {
        e.preventDefault();
        e.stopPropagation();
        run(id);
      }
    },
    true // capture, so the site's own handlers do not swallow these first
  );

  /* ------------------------------------------------------------------ *
   * Toast
   * ------------------------------------------------------------------ */
  let toastEl = null;
  let toastTimer = null;

  function toast(msg, isError) {
    if (!CONFIG.showToast) return;
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'ynwac-sc-root ynwac-sc-toast';
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
   * Key hints drawn on the buttons
   *
   * This is the answer to "I can't remember the shortcuts" — the key is
   * sitting on the button you were about to click.
   * ------------------------------------------------------------------ */
  let hintLayer = null;

  /**
   * Which key to draw on a button right now.
   *
   * While typing you need the modifier combo; once you have left the box
   * the single key works, so show whichever one applies. In speaking mode
   * the borrowed controls show the number that actually fires them, the
   * slots that lent it fall back to their alternate, and 提交 — useless on
   * RA/RS — gets no chip at all.
   */
  function hintKey(actionId, typing) {
    const at = (id, i) => {
      const list = (typing || !CONFIG.quickKeys ? bindings[id] : quickKeys[id]) || [];
      return list[i] || (i === 0 ? (bindings[id] || [])[0] : null) || null;
    };
    if (!speakingMode()) return at(actionId, 0);

    const lender = Object.keys(SPEAKING_SLOTS).find((k) => SPEAKING_SLOTS[k] === actionId);
    if (lender) return at(lender, 0);
    if (actionId === 'submit') return null;
    if (SPEAKING_SLOTS[actionId]) return at(actionId, 1);
    return at(actionId, 0);
  }

  function refreshHints() {
    if (!CONFIG.showHints || !CONFIG.enabled) {
      if (hintLayer) hintLayer.innerHTML = '';
      return;
    }
    if (!hintLayer) {
      hintLayer = document.createElement('div');
      hintLayer.className = 'ynwac-sc-root ynwac-sc-hints';
      document.body.appendChild(hintLayer);
    }
    const typing = isTyping();
    const frag = document.createDocumentFragment();

    for (const action of ACTIONS) {
      if (action.kind !== 'click') continue;
      const el = findTarget(action.id);
      if (!el) continue;

      const key = hintKey(action.id, typing);
      if (!key) continue;

      const r = el.getBoundingClientRect();
      const chip = document.createElement('span');
      chip.className = 'ynwac-sc-chip';
      chip.textContent = pretty(key);
      chip.style.left = `${r.right - 4}px`;
      chip.style.top = `${r.top - 6}px`;
      frag.appendChild(chip);
    }
    hintLayer.innerHTML = '';
    hintLayer.appendChild(frag);
  }

  let hintTimer = null;
  const scheduleHints = () => {
    clearTimeout(hintTimer);
    hintTimer = setTimeout(refreshHints, 150);
  };

  addEventListener('scroll', scheduleHints, { passive: true, capture: true });
  addEventListener('resize', scheduleHints, { passive: true });
  addEventListener('focusin', scheduleHints);
  addEventListener('focusout', scheduleHints);

  /* ------------------------------------------------------------------ *
   * Panel: bindings, rebinding, options
   * ------------------------------------------------------------------ */
  let panelEl = null;
  let panelOpen = false;

  const captureState = { active: false, onKey: () => {} };

  function bindingRows() {
    // The same three number keys mean something else on RA/RS. Say so in
    // both rows, or this table quietly lies on speaking questions.
    const lenderOf = (id) => Object.keys(SPEAKING_SLOTS).find((k) => SPEAKING_SLOTS[k] === id);

    return ACTIONS.map((a) => {
      const g = (bindings[a.id] || []).map((k) => `<kbd>${pretty(k)}</kbd>`).join(' ') || '<i>—</i>';
      const q = (quickKeys[a.id] || []).map((k) => `<kbd>${pretty(k)}</kbd>`).join(' ') || '<i>—</i>';

      const borrower = SPEAKING_SLOTS[a.id];
      const lender = lenderOf(a.id);
      let swap = '';
      if (borrower) swap = `<em>口语题上首键 → ${actionById(borrower).cn}</em>`;
      else if (lender) swap = `<em>口语题上 ${pretty((quickKeys[lender] || [])[0] || (bindings[lender] || [])[0])} 也走这里</em>`;

      return `<tr>
        <td class="ynwac-sc-act">${a.cn}<span>${a.name}</span>${swap}</td>
        <td>${g}</td>
        <td class="ynwac-sc-q">${q}</td>
        <td><button type="button" class="ynwac-sc-rebind" data-act="${a.id}">改键 Rebind</button></td>
      </tr>`;
    }).join('');
  }

  // The five number slots as they read on a speaking question, in order.
  function speakingStrip() {
    const cells = ['play', 'submit', 'reset', 'prev', 'next']
      .map((slot) => {
        const key = (quickKeys[slot] || [])[0] || (bindings[slot] || [])[0];
        return key ? `<kbd>${pretty(key)}</kbd> ${actionById(SPEAKING_SLOTS[slot] || slot).cn}` : '';
      })
      .filter(Boolean)
      .join(' · ');
    return `<div class="ynwac-sc-speak"><b>口语题 RA / RS</b> — 数字键在这里是<br>${cells}</div>`;
  }

  function panelHTML() {
    return `
      <div class="ynwac-sc-card" role="dialog" aria-label="Keyboard shortcuts">
        <div class="ynwac-sc-head">
          <span>⌨️ PTE 快捷键 / Shortcuts</span>
          <button class="ynwac-sc-x" type="button" aria-label="Close">✕</button>
        </div>
        <table class="ynwac-sc-table">
          <tr><th>动作 Action</th><th>打字时 While typing</th><th>不打字时 Single key</th><th></th></tr>
          ${bindingRows()}
        </table>
        ${speakingStrip()}
        <div class="ynwac-sc-fixed">
          <kbd>Esc</kbd> 离开输入框 leave the box ·
          <kbd>${pretty('alt+h')}</kbd> 按钮提示 button hints ·
          <kbd>${pretty('alt+k')}</kbd> 重新识别按钮 re-bind a button ·
          <kbd>${pretty('alt+0')}</kbd> 总开关 master on/off ·
          <kbd>${pretty('alt+/')}</kbd> 本面板 this panel
        </div>
        <label class="ynwac-sc-opt"><input type="checkbox" data-opt="showHints"> 在按钮上显示按键提示 / show key hints on buttons</label>
        <label class="ynwac-sc-opt"><input type="checkbox" data-opt="autoFocusAnswer"> 切题后自动聚焦答题框 / auto-focus answer box</label>
        <label class="ynwac-sc-opt"><input type="checkbox" data-opt="quickKeys"> 启用单键快捷键 / enable single-key shortcuts</label>
        <label class="ynwac-sc-opt"><input type="checkbox" data-opt="showToast"> 显示操作提示 / show toast</label>
        <div class="ynwac-sc-foot">
          <button type="button" class="ynwac-sc-reset">恢复默认 Reset to defaults</button>
          <span class="ynwac-sc-note">和翻译插件冲突？点“改键”换一个 · Clashes with a translator extension? Hit Rebind.</span>
        </div>
      </div>`;
  }

  function renderPanel() {
    panelEl.innerHTML = panelHTML();
    panelEl.querySelectorAll('[data-opt]').forEach((cb) => {
      cb.checked = !!CONFIG[cb.dataset.opt];
      cb.addEventListener('change', () => {
        setConfig(cb.dataset.opt, cb.checked);
        renderPanel();
      });
    });
    panelEl.querySelector('.ynwac-sc-x').addEventListener('click', () => togglePanel(false));
    panelEl.querySelector('.ynwac-sc-reset').addEventListener('click', () => {
      bindings = JSON.parse(JSON.stringify(DEFAULT_BINDINGS));
      quickKeys = JSON.parse(JSON.stringify(DEFAULT_QUICK));
      save('bindings', bindings);
      save('quick', quickKeys);
      renderPanel();
      refreshHints();
      toast('已恢复默认快捷键 / defaults restored');
    });
    panelEl.querySelectorAll('.ynwac-sc-rebind').forEach((btn) => {
      btn.addEventListener('click', () => startCapture(btn.dataset.act, btn));
    });
  }

  function startCapture(actionId, btn) {
    const action = actionById(actionId);
    btn.textContent = '按下新按键… Press keys…';
    btn.classList.add('ynwac-sc-listening');
    captureState.active = true;

    captureState.onKey = (e, key) => {
      if (isModifierKey(e)) return; // wait for the real key
      captureState.active = false;

      if (key === 'escape') {
        renderPanel();
        return;
      }

      const bare = !/\+/.test(key);
      const table = bare ? quickKeys : bindings;

      // A key can only mean one thing — take it off whatever had it.
      for (const id of Object.keys(table)) {
        const i = (table[id] || []).indexOf(key);
        if (i !== -1) table[id].splice(i, 1);
      }
      // Replace the primary binding rather than adding to it: you are
      // usually here because the old key clashed with something, so
      // leaving it live would not fix anything. Alternates are kept.
      table[actionId] = [key].concat((table[actionId] || []).slice(1).filter((k) => k !== key));

      save('bindings', bindings);
      save('quick', quickKeys);
      renderPanel();
      refreshHints();
      toast(`✓ ${action.cn} → ${pretty(key)}${bare ? '（不打字时 / single key）' : ''}`);
    };
  }

  function togglePanel(force) {
    const next = force === undefined ? !panelOpen : force;
    if (next && !panelEl) {
      panelEl = document.createElement('div');
      panelEl.className = 'ynwac-sc-root ynwac-sc-modal';
      panelEl.addEventListener('mousedown', (e) => {
        if (e.target === panelEl) togglePanel(false);
      });
      document.body.appendChild(panelEl);
    }
    if (next) renderPanel();
    if (panelEl) panelEl.dataset.show = next ? '1' : '0';
    panelOpen = next;
    captureState.active = false;
    if (!next) refreshHints();
  }

  /* ------------------------------------------------------------------ *
   * Picker (Alt+K) — click a button to teach the script its label.
   * ------------------------------------------------------------------ */
  const pickerState = { active: false, action: null, handleKey: () => {} };
  let pickerEl = null;

  function openPicker() {
    togglePanel(false);
    if (!pickerEl) {
      pickerEl = document.createElement('div');
      pickerEl.className = 'ynwac-sc-root ynwac-sc-picker';
      document.body.appendChild(pickerEl);
    }
    pickerState.active = true;
    pickerState.action = null;
    renderPicker();

    pickerState.handleKey = (e, key) => {
      if (key === 'escape') return closePicker();
      const i = parseInt(key, 10);
      const clickable = ACTIONS.filter((a) => a.kind === 'click');
      if (!pickerState.action && i >= 1 && i <= clickable.length) {
        pickerState.action = clickable[i - 1];
        renderPicker();
        document.addEventListener('click', pickOnce, true);
      }
    };
  }

  function renderPicker() {
    const clickable = ACTIONS.filter((a) => a.kind === 'click');
    if (!pickerState.action) {
      pickerEl.innerHTML =
        `<b>重新识别按钮 / Re-bind a button</b><div class="ynwac-sc-hint">按数字选择动作，Esc 取消<br>Press a number, Esc to cancel</div>` +
        clickable.map((a, i) => `<div class="ynwac-sc-row"><kbd>${i + 1}</kbd> ${a.cn} <span>${a.name}</span></div>`).join('');
    } else {
      pickerEl.innerHTML = `<b>${pickerState.action.cn}</b><div class="ynwac-sc-hint">点击页面上对应的按钮（不会触发它）<br>Click that button — it will not fire.<br>Esc to cancel</div>`;
    }
    pickerEl.dataset.show = '1';
  }

  function pickOnce(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = e.target.closest(CLICKABLE);
    document.removeEventListener('click', pickOnce, true);

    if (!el) {
      toast('✕ 那不是一个按钮 / not a button', true);
      return closePicker();
    }
    const label = rawText(el) || el.getAttribute('aria-label') || '';
    if (!norm(label)) {
      toast('✕ 该按钮没有可识别的文字 / no readable label', true);
      return closePicker();
    }
    customLabels[pickerState.action.id] = label;
    save('labels', customLabels);
    toast(`✓ ${pickerState.action.cn} → “${label.trim()}”`);
    closePicker();
    refreshHints();
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
.ynwac-sc-root{font:14px/1.5 system-ui,-apple-system,"Segoe UI","Microsoft YaHei",sans-serif}
.ynwac-sc-toast{position:fixed;right:18px;bottom:18px;z-index:2147483000;max-width:min(70vw,420px);
  padding:9px 14px;border-radius:10px;font-weight:500;font-size:13px;color:#fff;background:#1f2937;
  box-shadow:0 8px 26px rgba(0,0,0,.24);opacity:0;transform:translateY(8px);
  transition:opacity .14s ease,transform .14s ease;pointer-events:none}
.ynwac-sc-toast[data-show="1"]{opacity:.96;transform:translateY(0)}
.ynwac-sc-toast[data-error="1"]{background:#b91c1c}

.ynwac-sc-hints{position:fixed;inset:0;z-index:2147482900;pointer-events:none}
.ynwac-sc-chip{position:fixed;transform:translate(-50%,-50%);padding:1px 6px;border-radius:6px;
  background:#2563eb;color:#fff;font:700 11px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  box-shadow:0 2px 6px rgba(0,0,0,.28);white-space:nowrap;opacity:.94}

.ynwac-sc-modal{position:fixed;inset:0;z-index:2147483001;display:none;align-items:center;justify-content:center;
  background:rgba(15,23,42,.45);backdrop-filter:blur(2px)}
.ynwac-sc-modal[data-show="1"]{display:flex}
.ynwac-sc-card{background:#fff;color:#111827;border-radius:14px;padding:18px 20px;
  max-width:min(94vw,720px);max-height:88vh;overflow:auto;box-shadow:0 24px 64px rgba(0,0,0,.3)}
.ynwac-sc-head{display:flex;align-items:center;justify-content:space-between;gap:16px;font-weight:700;font-size:15px;margin-bottom:12px}
.ynwac-sc-x{border:0;background:#f3f4f6;border-radius:8px;width:28px;height:28px;cursor:pointer;font-size:13px;color:#374151}
.ynwac-sc-x:hover{background:#e5e7eb}
.ynwac-sc-table{border-collapse:collapse;width:100%}
.ynwac-sc-table th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;padding:0 8px 6px}
.ynwac-sc-table td{padding:6px 8px;vertical-align:middle;border-top:1px solid #f1f5f9}
.ynwac-sc-act{line-height:1.25}
.ynwac-sc-act span{display:block;font-size:11px;color:#6b7280}
.ynwac-sc-act em{display:block;margin-top:2px;font-style:normal;font-size:11px;color:#2563eb}
.ynwac-sc-speak{margin-top:12px;padding:10px 12px;border-radius:10px;background:#eff6ff;
  font-size:12px;color:#1e3a8a;line-height:2}
.ynwac-sc-speak b{font-size:12px}
.ynwac-sc-q{opacity:.75}
.ynwac-sc-card kbd{display:inline-block;padding:2px 7px;border-radius:6px;border:1px solid #d1d5db;border-bottom-width:2px;
  background:#f9fafb;font:600 12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#111827}
.ynwac-sc-card i{color:#9ca3af;font-style:normal}
.ynwac-sc-rebind{border:1px solid #d1d5db;background:#fff;border-radius:7px;padding:3px 9px;font-size:12px;cursor:pointer;color:#374151;white-space:nowrap}
.ynwac-sc-rebind:hover{background:#f3f4f6}
.ynwac-sc-listening{background:#2563eb;border-color:#2563eb;color:#fff}
.ynwac-sc-fixed{margin-top:12px;padding-top:10px;border-top:1px solid #f1f5f9;font-size:12px;color:#4b5563;line-height:2}
.ynwac-sc-opt{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:13px;color:#374151;cursor:pointer}
.ynwac-sc-foot{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1px solid #f1f5f9}
.ynwac-sc-reset{border:1px solid #d1d5db;background:#fff;border-radius:8px;padding:5px 11px;font-size:12px;cursor:pointer;color:#374151}
.ynwac-sc-reset:hover{background:#f3f4f6}
.ynwac-sc-note{font-size:11px;color:#6b7280}

.ynwac-sc-picker{position:fixed;left:50%;top:22px;transform:translateX(-50%);z-index:2147483002;display:none;
  min-width:min(92vw,420px);padding:14px 18px;border-radius:12px;background:#111827;color:#f9fafb;box-shadow:0 18px 48px rgba(0,0,0,.36)}
.ynwac-sc-picker[data-show="1"]{display:block}
.ynwac-sc-hint{margin:6px 0 10px;font-size:12px;color:#9ca3af}
.ynwac-sc-row{padding:3px 0}
.ynwac-sc-row span{color:#9ca3af;font-size:12px}
.ynwac-sc-picker kbd{display:inline-block;min-width:18px;text-align:center;padding:1px 6px;margin-right:6px;
  border-radius:5px;background:#374151;font:600 12px/1.5 ui-monospace,Menlo,Consolas,monospace}
`;
  document.documentElement.appendChild(css);

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  const mo = new MutationObserver(scheduleHints);
  if (document.body) mo.observe(document.body, { childList: true, subtree: true });
  refreshHints();

  if (!load('seen-hint-v2', false)) {
    save('seen-hint-v2', true);
    setTimeout(() => toast(`⌨️ 快捷键已启用 · 按 ${pretty('alt+/')} 查看和改键 / press ${pretty('alt+/')} to view & rebind`), 1200);
  }
})();
