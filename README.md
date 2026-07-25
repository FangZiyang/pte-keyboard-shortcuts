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

**Question types.** Built against **Write From Dictation** (`/wfd`), but the script finds buttons by their label rather than by page, so any question type using the same 播放 / 提交 / 重置 / 下一题 row works already. Types with their own controls — the recording buttons on Read Aloud and Repeat Sentence — are not wired up yet.

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

## Shortcuts

These work **while you are typing in the answer box** — that is the whole point.

| Keys | Action |
| --- | --- |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> | 提交 Submit |
| <kbd>Alt</kbd> + <kbd>Enter</kbd> | 下一题 Next question |
| <kbd>Alt</kbd> + <kbd>A</kbd> or <kbd>Alt</kbd> + <kbd>P</kbd> | 播放 Play / replay audio |
| <kbd>Alt</kbd> + <kbd>S</kbd> | 提交 Submit |
| <kbd>Alt</kbd> + <kbd>R</kbd> | 重置 Reset this question |
| <kbd>Alt</kbd> + <kbd>N</kbd> or <kbd>Alt</kbd> + <kbd>→</kbd> | 下一题 Next |
| <kbd>Alt</kbd> + <kbd>B</kbd> or <kbd>Alt</kbd> + <kbd>←</kbd> | 上一题 Previous |
| <kbd>Alt</kbd> + <kbd>I</kbd> | Put the cursor back in the answer box |
| <kbd>Alt</kbd> + <kbd>J</kbd> | Jump to a question number (`#` field) |
| <kbd>Esc</kbd> | Leave the answer box |
| <kbd>Alt</kbd> + <kbd>/</kbd> | Open / close the help panel |

### Single-key mode

Once you press <kbd>Esc</kbd> (or click outside the text box), plain letters work — no modifier needed:

<kbd>P</kbd> play · <kbd>S</kbd> submit · <kbd>R</kbd> reset · <kbd>N</kbd> next · <kbd>B</kbd> previous · <kbd>I</kbd> back to the answer box · <kbd>?</kbd> help

Turn this off in the help panel if it gets in your way.

### A typical loop

```
Alt+A        listen
             type the sentence
Ctrl+Enter   submit, read your score
Alt+Enter    next question — cursor lands in the answer box automatically
```

---

## Options

Open the help panel with <kbd>Alt</kbd>+<kbd>/</kbd> and toggle:

- **Auto-focus the answer box after navigating** — on by default, so you can start typing right after <kbd>Alt</kbd>+<kbd>Enter</kbd>.
- **Single-key shortcuts** — on by default.
- **Toast** — the small confirmation in the corner.

Settings persist in `localStorage` per browser.

## If a shortcut says "button not found"

The script finds buttons by their visible label (`播放`, `提交`, `重置`, `下一题`, `上一题`, `跳转`), because the site ships hashed CSS class names — the text is the only stable handle. If the site renames a button, or a question type uses a different word, re-teach it:

1. Press <kbd>Alt</kbd>+<kbd>K</kbd>.
2. Press the number of the action you want to fix.
3. Click that button on the page. The click is intercepted, not passed through — it will not fire the button.

Your bindings are saved locally. <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd> clears them.

## Notes on safety

- **Reset only ever matches the exact label `重置`.** The sidebar has a `重置进度` ("reset all progress") button, and no fuzzy match is allowed to reach it.
- The script only reads and clicks what is already on the page. No network requests, no data collection, no `@grant`ed privileges — `@grant none` means it runs in the page like any other script.
- It never touches your login or account settings.

---

## 中文说明

用键盘操作 PTE 刷题网站，不用再够鼠标。

刷题就是 **播放 → 作答 → 提交 → 下一题** 循环几百遍，每题都要去点鼠标实在太慢。这个油猴脚本把这排按钮绑到键盘上，手不用离开输入框。

**已支持的网站**：[ynwac.com](https://ynwac.com) PTE-CORE（[`ynwac-shortcuts.user.js`](ynwac-shortcuts.user.js)）。每个网站一个脚本，快捷键相同，只是按钮识别不同，欢迎 PR 添加新站点。

**题型**：以 **WFD `/wfd`** 为基础开发，但脚本是按按钮文字识别而不是按页面，所以任何用同一排 播放 / 提交 / 重置 / 下一题 按钮的题型都能直接用。RA、RS 这类有独立录音控件的题型还没有接入。

### 安装

1. 装 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)。
2. 点这个链接安装：**[ynwac-shortcuts.user.js](https://raw.githubusercontent.com/FangZiyang/pte-keyboard-shortcuts/main/ynwac-shortcuts.user.js)**
3. 打开 <https://ynwac.com/wfd> 登录后，按 <kbd>Alt</kbd>+<kbd>/</kbd> 查看快捷键列表。

### 快捷键

下面这些**在输入框里打字时也能用**：

| 按键 | 动作 |
| --- | --- |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> | 提交 |
| <kbd>Alt</kbd> + <kbd>Enter</kbd> | 下一题 |
| <kbd>Alt</kbd> + <kbd>A</kbd> / <kbd>Alt</kbd> + <kbd>P</kbd> | 播放录音 |
| <kbd>Alt</kbd> + <kbd>S</kbd> | 提交 |
| <kbd>Alt</kbd> + <kbd>R</kbd> | 重置本题 |
| <kbd>Alt</kbd> + <kbd>N</kbd> / <kbd>Alt</kbd> + <kbd>→</kbd> | 下一题 |
| <kbd>Alt</kbd> + <kbd>B</kbd> / <kbd>Alt</kbd> + <kbd>←</kbd> | 上一题 |
| <kbd>Alt</kbd> + <kbd>I</kbd> | 光标回到答题框 |
| <kbd>Alt</kbd> + <kbd>J</kbd> | 光标到题号框（`#`） |
| <kbd>Esc</kbd> | 退出输入框 |
| <kbd>Alt</kbd> + <kbd>/</kbd> | 打开/关闭帮助面板 |

**单键模式**：按 <kbd>Esc</kbd> 退出输入框后，直接按 <kbd>P</kbd> 播放、<kbd>S</kbd> 提交、<kbd>R</kbd> 重置、<kbd>N</kbd> 下一题、<kbd>B</kbd> 上一题、<kbd>I</kbd> 回到输入框、<kbd>?</kbd> 帮助。不习惯可以在帮助面板里关掉。

**常用节奏**：`Alt+A` 听 → 打字 → `Ctrl+Enter` 提交看分 → `Alt+Enter` 下一题（光标自动回到输入框）。

### 找不到按钮怎么办

脚本靠按钮上的文字（`播放`/`提交`/`重置`/`下一题`/`上一题`/`跳转`）定位，因为网站的 CSS 类名是构建时哈希的，文字是唯一稳定的标识。如果网站改了文案，按 <kbd>Alt</kbd>+<kbd>K</kbd> → 按数字选动作 → 点页面上对应的按钮重新绑定即可（这一下点击会被拦截，不会真的触发按钮）。<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd> 清除自定义绑定。

### 安全说明

- **重置只匹配完全等于 `重置` 的按钮**，侧边栏的 `重置进度`（清空全部练习进度）被显式排除，模糊匹配永远碰不到它。
- 脚本只读取和点击页面上已有的元素，不发任何网络请求、不收集数据、`@grant none` 无特殊权限，也不会碰你的登录信息或账号设置。

---

## Development

The script is a single dependency-free file — edit `ynwac-shortcuts.user.js` and reload the page.

`test/` drives the script with real `KeyboardEvent`s against a jsdom fixture that mirrors the WFD toolbar, including the `重置进度` button that must never be hit by accident:

```bash
npm install && npm test
```

## Contributing

Issues and PRs welcome — especially if you use a question type whose buttons are worded differently. Include the button's exact label text and the page URL.

## License

[MIT](LICENSE)

Not affiliated with YNWAC. This is an independent accessibility/convenience tool that clicks buttons you can already click.
