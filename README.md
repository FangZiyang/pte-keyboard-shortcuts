# PTE Keyboard Shortcuts

[![test](https://github.com/FangZiyang/pte-keyboard-shortcuts/actions/workflows/test.yml/badge.svg)](https://github.com/FangZiyang/pte-keyboard-shortcuts/actions/workflows/test.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Drive PTE practice sites from the keyboard instead of the mouse.

PTE practice is the same loop a few hundred times a night — **play the audio → answer → submit → next question**. Reaching for the mouse between every question is the slow part. This userscript wires that button row to the keyboard so your hands never leave the answer box.

**Supported sites**

| Site | Status |
| --- | --- |
| [ynwac.com](https://ynwac.com) PTE-CORE | ✅ [`ynwac-shortcuts.user.js`](ynwac-shortcuts.user.js) |

Each site gets its own script — the shortcuts stay the same, only the button-matching differs. PRs adding a site are welcome.

**Question types**

| | <kbd>1</kbd> | <kbd>2</kbd> | <kbd>3</kbd> | <kbd>4</kbd> | <kbd>5</kbd> |
| --- | :-: | :-: | :-: | :-: | :-: |
| **WFD** Write From Dictation | 播放 | 提交 | 重置 | 下一题 | – |
| **RA** Read Aloud · **RS** Repeat Sentence | 播放 | 停止录音 | AI 评分 | 下一题 | 重录 |
| **FIBL** · **HIW** · **SMW** · listening **MC** | 播放 | 提交 | 重置 | 下一题 | – |

One hand, four keys, in the order you press them. <kbd>4</kbd> is 下一题 on every question type — and so is <kbd>→</kbd>, whenever the cursor is not in a text field (<kbd>←</kbd> is 上一题).

Speaking questions have no answer box and nothing worth submitting — the loop there is **听 → 说 → 看分 → 下一题** — so <kbd>2</kbd> and <kbd>3</kbd> point at the recorder's own controls instead. The script switches automatically when the recorder is on the page.

Nothing is lost in the swap: the toolbar actions keep their letter alternates everywhere (<kbd>Alt</kbd>+<kbd>S</kbd> 提交, <kbd>Alt</kbd>+<kbd>R</kbd> 重置), and each recorder control also has a direct key of its own — <kbd>6</kbd> 录音, <kbd>7</kbd> 跳过准备 (RA), <kbd>8</kbd> AI 评分.

**上一题 has no number.** It's a once-an-evening key, and spending a digit on it pushed 下一题 — pressed on every single question — out to <kbd>5</kbd>. It answers to <kbd>←</kbd>, <kbd>Alt</kbd>+<kbd>B</kbd> and <kbd>Alt</kbd>+<kbd>←</kbd>.

Other question types that reuse the same toolbar should work without changes — buttons are matched by what they are, not by which page you're on. A key with no button on the current page simply does nothing.

> 中文说明见下方 [中文](#中文说明)。

---

## Install

1. Install a userscript manager — [Tampermonkey](https://www.tampermonkey.net/) (Chrome / Edge / Firefox / Safari) or [Violentmonkey](https://violentmonkey.github.io/).
2. Click to install the script:
   **[ynwac-shortcuts.user.js](https://raw.githubusercontent.com/FangZiyang/pte-keyboard-shortcuts/main/ynwac-shortcuts.user.js)**
3. Open <https://ynwac.com/wfd>, log in, and press <kbd>Alt</kbd>+<kbd>/</kbd> to see the shortcut list.

Tampermonkey will offer updates automatically from this repo.

### Nothing happens after installing?

**On Chrome, this is almost always the MV3 user-scripts switch.** Since Chrome 120, Tampermonkey cannot run *any* userscript until you turn it on — and it fails silently, with no error anywhere:

1. Go to `chrome://extensions`
2. Tampermonkey → **Details**
3. Turn on **Allow User Scripts**

(On older Chrome builds the equivalent is the **Developer mode** toggle in the top-right of `chrome://extensions`.)

Then reload the practice page. You should see a toast in the bottom-right the first time it runs.

Other things to check:

- Clicking the raw `.user.js` link shows a page of source code instead of an install prompt → the userscript manager isn't installed or isn't handling `.user.js` links.
- Tampermonkey's dashboard shows the script as **enabled**, and the page you're on matches `https://ynwac.com/*`.
- Still stuck? Open DevTools (<kbd>F12</kbd>) → Console on the practice page and run `Object.keys(localStorage).filter(k => k.startsWith('ynwac-shortcuts'))`. An empty array means the script never ran — an install problem, not a shortcut problem.

---

## You don't have to memorize anything

The key sits **on the button**. A small blue chip is drawn on every control the script can reach, and it follows the page as you scroll.

It also changes with context. On a speaking question the chips move with the swap — `2` sits on the recorder, `3` on AI 评分 — so the button always tells you the key that actually fires it. Toggle the chips with <kbd>Alt</kbd>+<kbd>H</kbd>.

## Shortcuts

**You do not need the <kbd>Alt</kbd> key.** Bare <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> work everywhere, *including while you are typing the answer* — a dictated sentence is words, not numerals, so the digits are free. The one exception is the `#` box: you go there precisely to type a number, so the digits reach the field instead.

```
   播放       提交       重置       下一题
     1          2          3          4
```

On a speaking question the same keys follow the recorder instead:

```
   播放     停止录音     AI 评分     下一题      重录
     1          2          3          4          5
```

| Keys | Action | On RA / RS |
| --- | --- | --- |
| <kbd>1</kbd> | 播放 Play / 停止 Stop | same |
| <kbd>2</kbd> | 提交 Submit | **停止录音** Stop recording |
| <kbd>3</kbd> | 重置 Reset this question | **AI 评分** AI-score the take |
| <kbd>4</kbd> / <kbd>→</kbd> | 下一题 Next — <kbd>→</kbd> outside a text field, where it would otherwise move the cursor | same |
| <kbd>5</kbd> | — | **重录** Record again |
| <kbd>6</kbd> | 录音 Record / stop — RA, RS | |
| <kbd>7</kbd> | 跳过准备 Skip the prep countdown — RA | |
| <kbd>8</kbd> | AI 评分 AI-score the take — RA, RS | |
| <kbd>←</kbd> / <kbd>Alt</kbd> + <kbd>B</kbd> / <kbd>Alt</kbd> + <kbd>←</kbd> | 上一题 Previous — bare <kbd>←</kbd> outside a text field | |
| <kbd>Enter</kbd> | 提交 Submit — **WFD only**, and it works with the cursor still in the answer box | |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> | 提交 Submit — every question type | |
| <kbd>Alt</kbd> + <kbd>Enter</kbd> | 下一题 Next | |
| <kbd>Alt</kbd> + <kbd>I</kbd> | Put the cursor back in the answer box | |
| <kbd>Alt</kbd> + <kbd>J</kbd> | Jump to a question number (`#` field) | |
| <kbd>Esc</kbd> | Leave the answer box | |

Every digit above also works as <kbd>Alt</kbd>+digit — that combo is never swallowed by a text field, so it's the reliable one if you've turned the bare digits off.

The number belongs to the **action**, not to the button's position — so nothing shifts under your fingers when 提交 vanishes on a question you've already submitted.

Letters work as alternates if you prefer mnemonics: <kbd>Alt</kbd>+<kbd>P</kbd> play, <kbd>Alt</kbd>+<kbd>S</kbd> submit, <kbd>Alt</kbd>+<kbd>R</kbd> reset, <kbd>Alt</kbd>+<kbd>B</kbd>/<kbd>N</kbd> prev/next, plus <kbd>Alt</kbd>+<kbd>←</kbd>/<kbd>→</kbd>. **The letters never move** — only each slot's first key is swapped on speaking questions, so <kbd>Alt</kbd>+<kbd>S</kbd> still submits on RS if you ever need it.

> **If a sentence really does contain a numeral**, open the panel (<kbd>Alt</kbd>+<kbd>/</kbd>) and untick **打字时数字键也生效**. Pressing <kbd>Esc</kbd> will not help — that frees up *more* keys, not fewer.

And the controls:

| Keys | |
| --- | --- |
| <kbd>Alt</kbd> + <kbd>/</kbd> | Panel — see and change every key |
| <kbd>Alt</kbd> + <kbd>H</kbd> | Show / hide the chips on the buttons |
| <kbd>Alt</kbd> + <kbd>0</kbd> | Master on/off for every shortcut |
| <kbd>Alt</kbd> + <kbd>K</kbd> | Re-teach the script a renamed button |

### What the bare keys do where

| Cursor is… | Digits | Letters |
| --- | --- | --- |
| Nowhere (RA/RS, or after <kbd>Esc</kbd>) | live | live |
| In the answer box | **live** | typed |
| In the `#` box | typed | typed |

Letters step aside as soon as you're typing — <kbd>b</kbd> in the middle of a sentence is a letter, not 上一题 — so use <kbd>Alt</kbd>+<kbd>B</kbd> there. Digits are the ones that stay. Both fall back to their <kbd>Alt</kbd> form, and the chip on the button always shows whichever one currently works.

On the fill-in-the-blank types the answer isn't a box, it's a row of small `<input>` fields — the same kind of field as `#`, so the digits go into the blank and <kbd>Alt</kbd>+digit is the one that plays. The chip on the button switches to `Alt+1` while the cursor is in a blank, so you can always read off the key that works.

Turn either off in the panel if it gets in your way.

### A typical loop

```
WFD                              RS / RA
1   listen                       1   listen
    type the sentence                speak
2   submit, read your score      2   stop recording
                                 3   AI score
                                 5   not happy? record again
4   next question                4   next question
```

After 下一题 the cursor lands back in the answer box automatically on question types that have one.

---

## Clashing with another extension?

**Immersive Translate (沉浸式翻译) uses <kbd>Alt</kbd>+<kbd>A</kbd> by default**, so this script deliberately leaves that key alone — play is <kbd>Alt</kbd>+<kbd>P</kbd>.

If something else on your machine still collides, rebind it — the script cannot win a key fight on its own, because extension content scripts listen in an isolated world where a page script's `preventDefault()` can't reach them. Avoiding the key is the only real fix.

1. <kbd>Alt</kbd>+<kbd>/</kbd> to open the panel
2. **改键 / Rebind** on the row you want
3. Press the new key combination

It's saved immediately. Rebinding replaces the old primary key rather than adding to it, so the clashing one actually goes away. If you press a key that another action already owns, it's taken off that action — a key only ever means one thing. **恢复默认 / Reset to defaults** puts everything back.

Nuclear option: <kbd>Alt</kbd>+<kbd>0</kbd> switches every shortcut off and on. The panel still opens while they're off, so you can't lock yourself out.

## Options

In the panel (<kbd>Alt</kbd>+<kbd>/</kbd>):

- **Key hints on buttons** — the blue chips. On by default.
- **Auto-focus the answer box after navigating** — on by default, so you can type right after <kbd>Alt</kbd>+<kbd>Enter</kbd>.
- **Single-key shortcuts** — on by default.
- **打字时数字键也生效 / digits stay live inside the answer box** — on by default. Untick it for a question whose answer contains a numeral. The `#` box is always exempt.
- **Toast** — the small confirmation in the corner.

Settings persist in `localStorage` per browser.

> **Upgrading to 1.11.0 resets your rebinds once**, because <kbd>→</kbd> / <kbd>←</kbd> became the first keys of 下一题 / 上一题 — the keys drawn on those buttons. Options and re-taught button labels are kept.
>
> **Upgrading from 1.4.x or earlier resets your rebinds once.** The number row changed shape in 1.5.0 (下一题 moved to <kbd>4</kbd>), and merging an old saved set would have left half the row pointing at the previous meaning. Options and re-taught button labels are kept.

## If a shortcut says "button not found"

The script finds buttons by their visible label (`播放`/`停止`, `提交`, `重置`, `下一题`, `上一题`, `跳转`), preferring ones inside the site's `.pte-toolbar-btn` question toolbar so a lookalike elsewhere on the page can't win. Note that 播放 relabels itself to **停止** while audio is playing — the same key matches both.

The recorder's controls carry no text at all — they're icon-only — so those are found by their component class (`.pte-audio-pill__play`, `.pte-rec-pill__main`, `.pte-rec-pill__submit`, `.pte-rec-pill__reset`, `.pte-rec-pill__skip`) with the labels as a fallback.

The listening types that still use the site's **older player** — FIBL, Highlight Incorrect Words, Select Missing Word and both listening Multiple-Choice — have no class or label on the play button either: it's a bare circle whose colour changes from one question type to the next. That one is matched by shape, `.pte-question-box button.w-10.h-10.rounded-full`, so a round button elsewhere on the page can't be mistaken for it. While the audio is still loading the site disables the button; <kbd>1</kbd> does nothing for that moment rather than reaching for something else.

If the site renames a button, or a question type uses a different word, re-teach it:

1. Press <kbd>Alt</kbd>+<kbd>K</kbd>.
2. Press the number of the action you want to fix.
3. Click that button on the page. The click is intercepted, not passed through — it will not fire the button.

The label is saved locally. **恢复默认 / Reset to defaults** in the panel clears everything you've customised.

## FIB-RW: the blanks you keep missing

Reading & Writing: Fill in the Blanks grades your answer and then forgets it. Nothing on the site tells you that *which* vs *what* in **Climate and Weather** is the gap you have now missed four evenings running. The script keeps that tally.

It reads the graded page and nothing else — no ids, no API, no network. After 提交 each blank's `<select>` goes disabled and takes a colour: red blanks are followed by a chip holding the right answer, green ones by a check mark. That is the whole source.

Every graded submit adds one `attempts` to each blank and one `wrongCount` to the ones you missed, so doing a question again accumulates rather than overwrites. Records are keyed by **question title plus blank number**, never by the site's own ids — those can be renumbered by any deploy, and the title is what an offline question bank can be joined on.

**导出 FIB-RW 错题 / Export FIB-RW** in the panel (<kbd>Alt</kbd>+<kbd>/</kbd>) downloads `fibrw-mistakes.json`:

```json
{
  "schema": "fibrw-mistakes/2",
  "exportedAt": "2026-08-23T20:00:00.000Z",
  "timezone": "America/Toronto",
  "items": [
    {
      "title": "Stress and Life Changes",
      "questionNumber": 21,
      "blankIndex": 1,
      "attempts": 3,
      "wrongCount": 2,
      "lastChosen": "expectations",
      "correctAnswer": "changes",
      "lastAttemptAt": "2026-08-22T16:49:21.763Z",
      "history": [
        { "at": "2026-08-20T14:02:11.000Z", "chosen": "expectations", "ok": false },
        { "at": "2026-08-21T09:31:04.000Z", "chosen": "changes", "ok": true },
        { "at": "2026-08-22T16:49:21.763Z", "chosen": "expectations", "ok": false }
      ]
    }
  ]
}
```

`questionNumber` is the site's own **Question #N** — the number you type into the `#` box to get back to it. Without it, finding a logged mistake again means paging through 67 questions looking for a title. It rides along as a field; the record is still **keyed** on title plus blank number, because the site can renumber its questions on any deploy and an offline question bank can only be joined on the title.

`history` is one entry per submit, right or wrong, each with its own timestamp — so "when did I miss this" has an answer per attempt rather than only for the most recent one. Capped at the last 50 entries; the totals are counted separately, so trimming the tail never changes them. Every `at` is UTC, and `timezone` names the zone they were collected in so a sheet can print the local clock time you actually sat down at.

`blankIndex` is 1-based in the order the gaps are read. Only blanks with `wrongCount > 0` are exported; the rest stay in the log to keep `attempts` honest. `lastChosen` and `lastAttemptAt` describe the last time you got that blank **wrong** — in a revision sheet, showing the correct word you eventually settled on under "what you picked" would be nonsense.

### Upgrading a log written by 1.7.x

Schema 2 is **additive**: every field schema 1 had is still there, unchanged and in the same place, so a reader written against 1 keeps working as long as it does not reject the version string outright.

The upgrade runs once, on the first `/fibrw` page you open, and only ever adds fields — no count is rewritten and no record is dropped. Old records get a `history` synthesised from the single wrong attempt they had a timestamp for; the correct attempts they also counted were never timestamped, so they are left out rather than stamped with an invented time. `questionNumber` cannot be invented either, so an old record gets one the next time you visit that question, and the export writes `null` until then.

The pre-upgrade log is copied to `ynwac-shortcuts:fibrw-mistakes-backup-v1` and left alone after that.

**It stays in your browser.** The log lives in `localStorage` under `ynwac-shortcuts:fibrw-mistakes` and goes nowhere until you press export. Clearing site data clears it.

This is only `/fibrw`. `/fibr` — Reading: Fill in the Blanks, the drag-a-word-bank one — is a different question type and is not touched.

## WFD: the words you keep missing

Write From Dictation gets the same treatment. After 提交 the site lays the sentence out twice, word by word — **正确答案** with the words you did not get in red, **你的答案** with the words that matched nothing in red — and the script reads those colours back. Nothing else: no ids, no API, no network. The match is the site's own, so a misspelling shows up both as a missed word and as a wrong one, and case counts.

There is no per-question title on WFD, so a record is keyed on **the correct sentence itself**, verbatim. `questionNumber` rides along as a field, as on FIB-RW.

Every submit adds one `attempts`; a submit that missed anything also adds one `wrongCount`, and one to the miss count of each word position it missed — positions rather than words, because a sentence can use the same word twice. Doing a sentence again accumulates. 重置 → 提交 with the very same words is still a second attempt.

**导出 WFD 错题 / Export WFD** in the panel downloads `wfd-mistakes.json`:

```json
{
  "schema": "wfd-mistakes/1",
  "exportedAt": "2026-09-23T20:00:00.000Z",
  "timezone": "America/Toronto",
  "items": [
    {
      "sentence": "The employment demand in engineering is increasing rapidly.",
      "questionNumber": 128,
      "attempts": 2,
      "wrongCount": 1,
      "words": [
        { "word": "The", "missCount": 0 },
        { "word": "employment", "missCount": 1 },
        { "word": "rapidly.", "missCount": 1 }
      ],
      "lastAnswer": "The employ",
      "lastAttemptAt": "2026-09-23T19:12:40.118Z",
      "history": [
        { "at": "2026-09-23T19:12:40.118Z", "answer": "The employ", "correct": 1, "total": 8,
          "missed": ["employment", "demand", "in", "engineering", "is", "increasing", "rapidly."],
          "wrong": ["employ"], "ok": false },
        { "at": "2026-09-23T19:20:02.004Z", "answer": "The employment demand in engineering is increasing rapidly.",
          "correct": 8, "total": 8, "missed": [], "wrong": [], "ok": true }
      ]
    }
  ]
}
```

(`words` is trimmed above; the file has one entry per word of the sentence.) Words keep the punctuation the site shows them with, so the last one is `rapidly.`. Only sentences with `wrongCount > 0` are exported. `lastAnswer` and `lastAttemptAt` are the last **wrong** attempt; `history` is capped at 50 entries per sentence, like FIB-RW.

The log lives in `localStorage` under `ynwac-shortcuts:wfd-mistakes`, and only `/wfd` is read.

## RO, Reading FIB, Listening FIB: the same idea

Three more question types keep a log, read off the graded page the same way. Each has its own export button in the panel, next to FIB-RW and WFD. Records are keyed by question title, and `questionNumber` rides along.

**Reading FIB (`/fibr`) and Listening FIB (`/fibl`)** log per blank, in exactly the FIB-RW record and export shape (`fibr-mistakes.json`, schema `fibr-mistakes/1`; `fibl-mistakes.json`, schema `fibl-mistakes/1`). After 提交 both pages put a green or red mark behind every gap with the right answer in brackets, and that mark is all that is read. `lastChosen` is the word you dragged in (Reading) or typed (Listening), `""` for a gap left empty. Listening FIB is graded by the site ignoring case and stray spaces — `Sugar ` counts as right for *sugar* — and the log believes the site.

**Reorder Paragraphs (`/ro`)** logs per question. Each paragraph carries a label (`2.`) that travels with it however you drag it, so an order is written as a list of labels. After 提交 a paragraph is green if it sits in the right slot, and red with `正确位置: N` if not; between them the full correct order is read back off the page. `ro-mistakes.json`, schema `ro-mistakes/1`:

```json
{
  "title": "Brazilian Folk Music Research",
  "questionNumber": 1,
  "attempts": 2,
  "wrongCount": 1,
  "correctOrder": [2, 1, 3, 4],
  "paragraphs": [{ "label": 2, "text": "Early in 1938, Mario de Andrade, …" }, "…"],
  "lastOrder": [2, 1, 4, 3],
  "lastAttemptAt": "2026-10-11T15:39:13.083Z",
  "history": [
    { "at": "…", "order": [2, 1, 4, 3], "inPlace": 2, "total": 4, "pairsRight": 1, "pairsTotal": 3, "misplaced": [4, 3], "ok": false }
  ]
}
```

`inPlace` is how the site scores (paragraphs in the right slot); `pairsRight` is how PTE scores (adjacent pairs in the right order). `paragraphs` is in the correct order.

Logs: `ynwac-shortcuts:fibr-mistakes`, `…:fibl-mistakes`, `…:ro-mistakes`. Nothing leaves the browser until you export.

## Where the script stays off

**Write Email (`/we`) is excluded outright** — no shortcuts, no chips, not even the panel.

The digits are allowed to stay live inside the answer box because a dictated sentence is words, not numerals. That reasoning is true of dictation and of nothing else. Write Email is ten minutes of prose you compose yourself — "at 7 o'clock", a phone number, "at least 100 words" — and every one of those digits would have fired an action instead of reaching the sentence. `3` fires 重置, which takes the email with it. There is nothing on the other side of the trade either: no audio to play, and 提交 on a question you spend ten minutes on is not a key you are reaching for.

The list is `OFF_PATHS` near the top of `ynwac-shortcuts.user.js` — one regex per path. It is matched when you press a key rather than by the `@match` header, because the site is a SPA and walking to `/we` from another question type never reloads the script.

If you want another long-form writing type out too — Summarize Written Text has the same shape — add its path there.

## Notes on safety

- **Reset only ever matches the exact label `重置`.** The sidebar has a `重置进度` ("reset all progress") button, and no fuzzy match is allowed to reach it.
- **重录 and 重置 are kept apart.** The recorder's own re-record button is icon-only with `title="重置"`, so it's matched by class, never by that text — <kbd>5</kbd> re-records, it cannot wipe the question, and neither can reach 重置进度.
- The script only reads and clicks what is already on the page. No network requests, no data collection, no `@grant`ed privileges — `@grant none` means it runs in the page like any other script.
- It never touches your login or account settings.

---

## 中文说明

用键盘操作 PTE 刷题网站，不用再够鼠标。

刷题就是 **播放 → 作答 → 提交 → 下一题** 循环几百遍，每题都要去点鼠标实在太慢。这个油猴脚本把这排按钮绑到键盘上，手不用离开输入框。

**已支持的网站**：[ynwac.com](https://ynwac.com) PTE-CORE（[`ynwac-shortcuts.user.js`](ynwac-shortcuts.user.js)）。每个网站一个脚本，快捷键相同，只是按钮识别不同，欢迎 PR 添加新站点。

**已支持的题型**

| | <kbd>1</kbd> | <kbd>2</kbd> | <kbd>3</kbd> | <kbd>4</kbd> | <kbd>5</kbd> |
| --- | :-: | :-: | :-: | :-: | :-: |
| **WFD** Write From Dictation | 播放 | 提交 | 重置 | 下一题 | – |
| **RA** Read Aloud · **RS** Repeat Sentence | 播放 | 停止录音 | AI 评分 | 下一题 | 重录 |
| **FIBL** · **HIW** · **SMW** · 听力选择题 | 播放 | 提交 | 重置 | 下一题 | – |

一只手四个键，按的顺序就是它们的顺序。<kbd>4</kbd> 在所有题型上都是下一题；光标不在输入框里时，方向键 <kbd>→</kbd> 也是下一题（<kbd>←</kbd> 是上一题），按钮上显示的就是 →。

口语题没有答题框，也没什么好提交的，节奏是 **听 → 说 → 看分 → 下一题**，所以 <kbd>2</kbd> 和 <kbd>3</kbd> 改成指录音条自己的控件。页面上一出现录音条就自动切换，不用手动开关。

原来的动作一个都没丢：工具栏动作的字母别名在所有题型上都保持原义（<kbd>Alt</kbd>+<kbd>S</kbd> 提交、<kbd>Alt</kbd>+<kbd>R</kbd> 重置本题），录音条的每个控件也各有自己的直达键：<kbd>6</kbd> 录音、<kbd>7</kbd> 跳过准备（RA）、<kbd>8</kbd> AI 评分。

**上一题不占数字键**。这是一晚上按不了几次的键，为它留一个数字就把每题都要按的下一题挤到了 <kbd>5</kbd>。它用 <kbd>←</kbd>，也保留 <kbd>Alt</kbd>+<kbd>B</kbd> 和 <kbd>Alt</kbd>+<kbd>←</kbd>。

脚本按按钮本身识别，而不是按页面，所以其他复用同一排工具栏的题型一般也能直接用。当前页面上没有的按钮，对应的键按了不会有任何反应。

### 安装

1. 装 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)。
2. 点这个链接安装：**[ynwac-shortcuts.user.js](https://raw.githubusercontent.com/FangZiyang/pte-keyboard-shortcuts/main/ynwac-shortcuts.user.js)**
3. 打开 <https://ynwac.com/wfd> 登录后，按 <kbd>Alt</kbd>+<kbd>/</kbd> 查看快捷键列表。

### 快捷键

**不用按 Alt。** 裸的 <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> 在哪儿都能用，**包括你正在答题框里打字的时候**——听写的是英文单词、不是阿拉伯数字，所以这几个键是空着的。唯一的例外是题号框（`#`）：你去那儿就是为了输数字，所以数字会正常进到框里。

```
   播放       提交       重置       下一题
     1          2          3          4
```

口语题上这几个键跟着录音条走：

```
   播放     停止录音     AI 评分     下一题      重录
     1          2          3          4          5
```

| 按键 | 动作 | 口语题 RA / RS |
| --- | --- | --- |
| <kbd>1</kbd> | 播放 / 停止 | 同左 |
| <kbd>2</kbd> | 提交 | **停止录音** |
| <kbd>3</kbd> | 重置本题 | **AI 评分** |
| <kbd>4</kbd> / <kbd>→</kbd> | 下一题（<kbd>→</kbd> 仅在光标不在输入框时，输入框里它照常移动光标） | 同左 |
| <kbd>5</kbd> | — | **重录** |
| <kbd>6</kbd> | 录音 / 停止录音（RA、RS） | |
| <kbd>7</kbd> | 跳过准备（RA） | |
| <kbd>8</kbd> | AI 评分（RA、RS） | |
| <kbd>Alt</kbd> + <kbd>B</kbd> / <kbd>Alt</kbd> + <kbd>←</kbd> | 上一题 | |
| <kbd>Enter</kbd> | 提交——**仅 WFD**，光标还在答题框里也能用 | |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> | 提交——所有题型 | |
| <kbd>Alt</kbd> + <kbd>Enter</kbd> | 下一题 | |
| <kbd>Alt</kbd> + <kbd>I</kbd> | 光标回到答题框 | |
| <kbd>Alt</kbd> + <kbd>J</kbd> | 光标到题号框（`#`） | |
| <kbd>Esc</kbd> | 退出输入框 | |
| <kbd>Alt</kbd> + <kbd>/</kbd> | 打开/关闭面板 | |

上表每个数字也都能加 Alt 用（<kbd>Alt</kbd>+<kbd>1</kbd> 等）。Alt 组合永远不会被输入框吞掉，所以如果你把裸数字关了，用它最稳。

数字绑定的是**动作**而不是按钮的位置，所以做完提交、`提交` 按钮消失时，其他键不会跟着挪位。

习惯字母的话，<kbd>Alt</kbd>+<kbd>P</kbd> 播放、<kbd>Alt</kbd>+<kbd>S</kbd> 提交、<kbd>Alt</kbd>+<kbd>R</kbd> 重置、<kbd>Alt</kbd>+<kbd>B</kbd>/<kbd>N</kbd> 上/下一题、<kbd>Alt</kbd>+<kbd>←</kbd>/<kbd>→</kbd> 也都保留可用。**字母永远不换位**——口语题只换每个槽位的第一个键，所以在 RS 上真要提交，<kbd>Alt</kbd>+<kbd>S</kbd> 照样能用。改键也一样：把 2 改成别的键，那个键在口语题上就跟着变成停止录音。

**裸键在哪儿有效**

| 光标在 | 数字 | 字母 |
| --- | --- | --- |
| 没在任何输入框（RA/RS，或按了 <kbd>Esc</kbd>） | 有效 | 有效 |
| 答题框里 | **有效** | 正常输入 |
| 题号框里 | 正常输入 | 正常输入 |

字母一进输入框就让位——句子中间的 <kbd>b</kbd> 是个字母，不是上一题——所以在那儿要用 <kbd>Alt</kbd>+<kbd>B</kbd>。留下的是数字。两者都能退回 Alt 组合，按钮上的小标签永远显示当下真正管用的那个。不习惯可以在面板里分别关掉。

填空类题型的答题区不是一个大框，而是一排小小的 `<input>`，跟题号框是同一类控件——所以数字会真的打进空格里，要播放得用 <kbd>Alt</kbd>+数字。光标一进空格，按钮上的标签就会变成 `Alt+1`，照着按就行。

> **万一某句听写真的含阿拉伯数字**，按 <kbd>Alt</kbd>+<kbd>/</kbd> 打开面板，取消勾选 **打字时数字键也生效**。按 <kbd>Esc</kbd> 没用——那只会让*更多*键变成快捷键。

> Windows / macOS 的 Chrome 里 <kbd>Alt</kbd>+<kbd>1</kbd>–<kbd>8</kbd> 是空闲的（切标签页用的是 Ctrl/⌘）。Linux 版 Chrome 用 Alt+数字切标签页，遇到冲突改键即可。

### 记不住快捷键？不用记

按键提示直接画在按钮上：每个能操作的按钮上都有一个蓝色小标签，跟着页面滚动。**标签上显示什么，你就按什么**——它跟着光标位置变：在答题框里数字标签依旧是 `4`，字母类的会变成 `Alt+B`，离开输入框后又变回 `B`。口语题上标签也跟着换位，`2` 会画在录音按钮上、`3` 画在 AI 评分上。<kbd>Alt</kbd>+<kbd>H</kbd> 开关提示。

### 和翻译插件冲突？

**沉浸式翻译默认占用 <kbd>Alt</kbd>+<kbd>A</kbd>**，所以本脚本特意不用这个键，播放是 <kbd>Alt</kbd>+<kbd>P</kbd>。

如果还有别的冲突，直接改键即可。脚本抢不过插件——扩展的内容脚本运行在独立环境里，页面脚本的 `preventDefault()` 拦不住它，只能换键：

1. <kbd>Alt</kbd>+<kbd>/</kbd> 打开面板
2. 点对应那行的 **改键 Rebind**
3. 按下你想用的组合键

立即保存。改键是**替换**原来的主键而不是叠加，所以冲突的那个键会真的被释放；如果按的键已被别的动作占用，会自动从那个动作上解绑——一个键只对应一个功能。**恢复默认** 可以一键还原。

实在不行：<kbd>Alt</kbd>+<kbd>0</kbd> 是总开关，一键关掉/打开所有快捷键。关掉时面板依然能打开，不会把自己锁死。

> **升级到 1.11.0 会把自定义改键重置一次**：下一题 / 上一题的首键改成了 <kbd>→</kbd> / <kbd>←</kbd>（也就是按钮上显示的那个键）。选项和教过的按钮不受影响。
>
> **从 1.4.x 及更早版本升级会把自定义改键重置一次。** 1.5.0 重排了数字键（下一题挪到 <kbd>4</kbd>），把旧的存档合并进来会让半排键还指着原来的动作，不如清一次干净。面板里的选项和你用 <kbd>Alt</kbd>+<kbd>K</kbd> 教过的按钮不受影响。

### 其他控制键

<kbd>Alt</kbd>+<kbd>/</kbd> 面板 · <kbd>Alt</kbd>+<kbd>H</kbd> 按钮提示开关 · <kbd>Alt</kbd>+<kbd>0</kbd> 总开关 · <kbd>Alt</kbd>+<kbd>K</kbd> 重新识别按钮

**常用节奏**

```
WFD                       RS / RA
1   听                    1   听
    打字                      开口说
2   提交看分               2   停止录音
                          3   AI 评分
                          5   不满意就重录
4   下一题                 4   下一题
```

WFD 切题后光标会自动回到答题框，接着打字就行。

### 找不到按钮怎么办

脚本靠按钮上的文字（`播放`/`停止`、`提交`、`重置`、`下一题`、`上一题`、`跳转`）定位，并优先选择网站题目工具栏 `.pte-toolbar-btn` 里的按钮，避免误伤页面上同名的其他按钮。注意播放中该按钮会变成 **停止**，同一个键两种状态都能匹配。

录音条上的控件是纯图标、没有任何文字，所以靠组件类名定位（`.pte-audio-pill__play`、`.pte-rec-pill__main`、`.pte-rec-pill__submit`、`.pte-rec-pill__reset`、`.pte-rec-pill__skip`），文字只作为兜底。

FIBL、Highlight Incorrect Words、Select Missing Word 和两个听力选择题仍在用网站的**旧版播放器**：播放键既没有类名也没有文字，只是一个圆形按钮，而且颜色还随题型变（FIBL 是青色，HIW 是蓝色）。这个只能靠形状认，选择器是 `.pte-question-box button.w-10.h-10.rounded-full`，限定在题目框内，页面上别处的圆按钮不会被误认。音频加载期间网站会把它禁用，那一小会儿按 <kbd>1</kbd> 不会有反应——但也不会去点别的按钮。

如果网站改了文案，按 <kbd>Alt</kbd>+<kbd>K</kbd> → 按数字选动作 → 点页面上对应的按钮重新识别即可（这一下点击会被拦截，不会真的触发按钮）。面板里的 **恢复默认** 可清除所有自定义。

### FIB-RW：总错的那几个空

Reading & Writing: Fill in the Blanks 判完分就丢了。网站不会告诉你 **Climate and Weather** 里 *which* / *what* 那个空你已经连错四个晚上了。脚本把这笔账记下来。

数据只从判完分的页面上读——不碰 id、不调接口、不联网。提交后每个空的 `<select>` 会变成 disabled 并上色：错的是红的，紧跟着一个写着正确答案的小标；对的是绿的，后面跟一个对号。就这么多。

每提交一次，每个空的 `attempts` 加一，错的那几个 `wrongCount` 再加一——同一道题再做是**累加**，不是覆盖。记录用**题目标题 + 空序号**做键，不用网站内部的数字 id——那个一发版就可能重排，而标题是本地题库能对齐的东西。

面板（<kbd>Alt</kbd>+<kbd>/</kbd>）里的 **导出 FIB-RW 错题** 会下载 `fibrw-mistakes.json`，格式见上面英文部分。

`questionNumber` 就是网站上的 **Question #N**，也就是你往 `#` 框里填的那个数。没它的话，想回到一个错空就只能拿着标题在 67 道题里一页页翻。它只是一个字段；记录的**键**仍然是标题 + 空序号，因为站点一发版就可能重排编号，而本地题库只能靠标题对齐。

`history` 是每次提交一条（对错都记），各自带时间戳——“我什么时候错的”不再只有最后一次的答案。最多保留 50 条；总数是单独计的，截尾巴不会改变它们。所有 `at` 都是 UTC，信封上的 `timezone` 说明当时所在时区，下游才能打印出你真正坐下来做题的本地时间。

**从 1.7.x 的旧记录升级**：schema 2 是**只加不改**的——schema 1 的每个字段都原样在原位。升级在你下次打开 `/fibrw` 时跑一次，只补字段，不改任何计数、不删任何记录。旧记录的 `history` 由它唯一带时间戳的那次错答生成；它同时计过的对答从来没存过时间，所以宁可缺也不编一个。`questionNumber` 同理无法凭空补，会在你下次访问那道题时自动填上，在那之前导出为 `null`。升级前的旧日志会完整拷贝到 `ynwac-shortcuts:fibrw-mistakes-backup-v1` 并不再动。

`blankIndex` 从 1 开始，按空在文章里出现的先后顺序。只导出 `wrongCount > 0` 的空；其余的留在本地只为了让 `attempts` 准确。`lastChosen` 和 `lastAttemptAt` 指的是**最后一次做错**的那次——复习单里“上次选了什么”如果显示你最后选对的那个词，就没意义了。

**数据不出浏览器。** 存在 `localStorage` 的 `ynwac-shortcuts:fibrw-mistakes` 里，不点导出就不会发往任何地方；清网站数据会一并清掉。

只对 `/fibrw` 生效。`/fibr`（Reading FIB，整篇共用一个拖拽词库的那个）是另一个题型，单独记，见下面。

### WFD：总写错的那几个词

Write From Dictation 也一样记。提交后网站会把句子逐词排两遍——**正确答案**里你没写对的词标红，**你的答案**里对不上的词标红——脚本就读这些颜色，不碰 id、不调接口、不联网。对错是网站自己判的：拼错一个词会同时算“漏掉的词”和“写错的词”，大小写也算。

WFD 没有题目标题，所以记录用**正确答案整句**（原样）做键；`questionNumber` 和 FIB-RW 一样作为字段附带。

每提交一次 `attempts` 加一；只要有漏词，`wrongCount` 加一，漏掉的每个**词位**的计数也加一——按位置而不是按单词记，因为一句里同一个词可能出现两次。同一句再做是累加；重置后用一模一样的内容再交，也算新的一次。

面板里的 **导出 WFD 错题** 会下载 `wfd-mistakes.json`，格式见上面英文部分。只导出 `wrongCount > 0` 的句子；`lastAnswer` 和 `lastAttemptAt` 指最后一次做错的那次；`history` 每句最多保留 50 条。

数据存在 `localStorage` 的 `ynwac-shortcuts:wfd-mistakes` 里，只在 `/wfd` 上读取。

### RO、Reading FIB、Listening FIB：同样记

这三个题型也会记，同样只读提交后的页面。面板里各有一个导出按钮，和 FIB-RW、WFD 放在一起。记录按题目标题记，附带题号。

**Reading FIB（`/fibr`）和 Listening FIB（`/fibl`）** 按空记，记录和导出格式跟 FIB-RW 完全一样（`fibr-mistakes.json` / `fibl-mistakes.json`）。提交后两个页面都会在每个空后面放一个绿勾或红叉，括号里是正确答案，脚本就读这个。`lastChosen` 是你拖进去（Reading）或打进去（Listening）的词，空着没填就是 `""`。Listening FIB 网站判分不分大小写、忽略多余空格（`Sugar ` 算对），以网站为准。

**Reorder Paragraphs（`/ro`）** 按题记。每段前面的编号（`2.`）跟着段落走，拖到哪都不变，所以顺序就记成编号列表。提交后排对位置的段变绿，排错的变红并写着“正确位置: N”，脚本由此拼出完整的正确顺序。导出 `ro-mistakes.json`，格式见上面英文部分：`correctOrder` 正确顺序、`lastOrder` 最后一次排错的顺序、`paragraphs` 按正确顺序的段落原文；`history` 每次一条，`inPlace` 是网站的算法（几段在对的位置），`pairsRight` 是 PTE 的算法（相邻两段排对了几对）。

数据存在 `ynwac-shortcuts:fibr-mistakes`、`…:fibl-mistakes`、`…:ro-mistakes` 里，不点导出不会离开浏览器。

### 哪些页面不生效

**Write Email（`/we`）整页停用**——没有快捷键、没有按钮标签，面板也不会弹。

数字键之所以能在答题框里照样生效，前提是“听写的句子是单词，不是阿拉伯数字”——而这句话只对听写成立。写邮件是你自己写十分钟的正文：`at 7 o'clock`、电话号码、`at least 100 words`，这些数字本来会变成指令而不是落到句子里，而 `3` 对应的是 **重置**——一下去邮件就没了。反过来也没什么好换的：这页既没有音频可播，写了十分钟的题也不差那一下提交的功夫。

名单就是 `ynwac-shortcuts.user.js` 靠前面的 `OFF_PATHS`，一条路径一个正则。它在**按键时**判断，而不是靠脚本头部的 `@match`：网站是 SPA，从别的题型点进 `/we` 是不会重新加载脚本的。

还想停用别的写作类题型（Summarize Written Text 情况一样），把它的路径加进去即可。

### 安全说明

- **重置只匹配完全等于 `重置` 的按钮**，侧边栏的 `重置进度`（清空全部练习进度）被显式排除，模糊匹配永远碰不到它。
- **重录和重置分得很清**：录音条上的重录按钮是纯图标、`title="重置"`，脚本只按类名认它、绝不按这段文字认——所以 <kbd>5</kbd> 只会重录，不会清空整题，更碰不到 `重置进度`。
- 脚本只读取和点击页面上已有的元素，不发任何网络请求、不收集数据、`@grant none` 无特殊权限，也不会碰你的登录信息或账号设置。

---

## Development

The script is a single dependency-free file — edit `ynwac-shortcuts.user.js` and reload the page.

`test/` drives the script against seven jsdom fixtures — the WFD toolbar (including the `重置进度` button that must never be hit by accident), the RA/RS recorder pill, where the number row swaps and the three 重置-ish buttons have to stay apart, the FIBL page, where a hidden mobile player shares the DOM with the unlabelled desktop one, the WFD toolbar again under a `/we` URL, where every key has to do nothing at all, a graded `/fibrw` question, where the mistake log and its export are checked end to end, a log written by an older version, where the upgrade has to add fields without disturbing a single count, and a graded `/wfd` sentence, where a hidden mobile copy of the result must not be read:

```bash
npm install && npm test
```

## Releasing

There is no build step, no bundle, no server. **The file on `main` is the live version** — `@downloadURL` and `@updateURL` both point at this repo's raw URL, so pushing to `main` *is* the deploy. There is no release branch or tag to maintain, and a bad release is undone by another push.

1. Edit `ynwac-shortcuts.user.js`.
2. **Bump `@version` in the header.** Tampermonkey compares that string and nothing else. A push without it never reaches anyone's browser, no matter how many times they hit "check for updates" — this is the one step that silently wastes an afternoon.
3. Match `package.json`, then sync the lockfile:
   ```bash
   npm install --package-lock-only
   ```
4. **If you moved a default key, bump `LAYOUT`.** Saved bindings are merged over the defaults, so without it anyone who has ever rebound a key keeps their old number row and ends up with a layout that is half new, half stale.
5. Every test file must be green:
   ```bash
   npm test
   ```
6. Commit and push to `main`.

Then, in a browser that already has it installed:

- Tampermonkey checks for updates on its own schedule. To force it, open the raw `.user.js` URL — it intercepts the link and offers **Update** with a side-by-side diff.
- GitHub's raw CDN caches for a few minutes, so a fresh push is not visible immediately. If the diff still shows the old version, wait and reload.
- Reload the practice page afterwards, then press <kbd>Alt</kbd>+<kbd>/</kbd>. The table is the fastest check that the new version actually took — if it still shows the previous key layout, the update did not land.

## Contributing

Issues and PRs welcome — especially if you use a question type whose buttons are worded differently. Include the button's exact label text and the page URL.

## License

[MIT](LICENSE)

Not affiliated with YNWAC. This is an independent accessibility/convenience tool that clicks buttons you can already click.
