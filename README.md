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

## You don't have to memorize anything

The key sits **on the button**. A small blue chip is drawn on 播放 / 提交 / 重置 / 上一题 / 下一题, and it follows the page as you scroll.

It also changes with context: while your cursor is in the answer box it shows `Alt+1`, and the moment you leave the box it shows just `1`, because that's what works right then. Toggle the chips with <kbd>Alt</kbd>+<kbd>H</kbd>.

## Shortcuts

These work **while you are typing in the answer box** — that is the whole point.

**1 – 5 run left to right along the toolbar**, in the order the buttons sit on screen:

```
   播放       提交       重置              上一题     下一题
  Alt+1      Alt+2      Alt+3             Alt+4     Alt+5
```

| Keys | Action |
| --- | --- |
| <kbd>Alt</kbd> + <kbd>1</kbd> | 播放 Play / 停止 Stop |
| <kbd>Alt</kbd> + <kbd>2</kbd> | 提交 Submit |
| <kbd>Alt</kbd> + <kbd>3</kbd> | 重置 Reset this question |
| <kbd>Alt</kbd> + <kbd>4</kbd> | 上一题 Previous |
| <kbd>Alt</kbd> + <kbd>5</kbd> | 下一题 Next |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> | 提交 Submit |
| <kbd>Alt</kbd> + <kbd>Enter</kbd> | 下一题 Next |
| <kbd>Alt</kbd> + <kbd>I</kbd> | Put the cursor back in the answer box |
| <kbd>Alt</kbd> + <kbd>J</kbd> | Jump to a question number (`#` field) |
| <kbd>Esc</kbd> | Leave the answer box |

The number belongs to the **action**, not to the button's position — so nothing shifts under your fingers when 提交 vanishes on a question you've already submitted.

Letters still work as alternates if you prefer mnemonics: <kbd>Alt</kbd>+<kbd>P</kbd> play, <kbd>Alt</kbd>+<kbd>S</kbd> submit, <kbd>Alt</kbd>+<kbd>R</kbd> reset, <kbd>Alt</kbd>+<kbd>B</kbd>/<kbd>N</kbd> prev/next, plus <kbd>Alt</kbd>+<kbd>←</kbd>/<kbd>→</kbd>.

And the controls:

| Keys | |
| --- | --- |
| <kbd>Alt</kbd> + <kbd>/</kbd> | Panel — see and change every key |
| <kbd>Alt</kbd> + <kbd>H</kbd> | Show / hide the chips on the buttons |
| <kbd>Alt</kbd> + <kbd>0</kbd> | Master on/off for every shortcut |
| <kbd>Alt</kbd> + <kbd>K</kbd> | Re-teach the script a renamed button |

### Single-key mode

Once you press <kbd>Esc</kbd> (or click outside the text box), drop the <kbd>Alt</kbd> — bare <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> <kbd>5</kbd> do the same five things, and <kbd>I</kbd> puts you back in the answer box. Letters <kbd>P</kbd> <kbd>S</kbd> <kbd>R</kbd> <kbd>B</kbd> <kbd>N</kbd> work too.

Turn this off in the panel if it gets in your way.

### A typical loop

```
Alt+1        listen
             type the sentence
Alt+2        submit, read your score
Alt+5        next question — cursor lands in the answer box automatically
```

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
- **Toast** — the small confirmation in the corner.

Settings persist in `localStorage` per browser.

## If a shortcut says "button not found"

The script finds buttons by their visible label (`播放`/`停止`, `提交`, `重置`, `下一题`, `上一题`, `跳转`), preferring ones inside the site's `.pte-toolbar-btn` question toolbar so a lookalike elsewhere on the page can't win. Note that 播放 relabels itself to **停止** while audio is playing — the same key matches both.

If the site renames a button, or a question type uses a different word, re-teach it:

1. Press <kbd>Alt</kbd>+<kbd>K</kbd>.
2. Press the number of the action you want to fix.
3. Click that button on the page. The click is intercepted, not passed through — it will not fire the button.

The label is saved locally. **恢复默认 / Reset to defaults** in the panel clears everything you've customised.

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

**1–5 按工具栏从左到右排列**，跟按钮在屏幕上的顺序一致：

```
   播放       提交       重置              上一题     下一题
  Alt+1      Alt+2      Alt+3             Alt+4     Alt+5
```

| 按键 | 动作 |
| --- | --- |
| <kbd>Alt</kbd> + <kbd>1</kbd> | 播放 / 停止 |
| <kbd>Alt</kbd> + <kbd>2</kbd> | 提交 |
| <kbd>Alt</kbd> + <kbd>3</kbd> | 重置本题 |
| <kbd>Alt</kbd> + <kbd>4</kbd> | 上一题 |
| <kbd>Alt</kbd> + <kbd>5</kbd> | 下一题 |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> | 提交 |
| <kbd>Alt</kbd> + <kbd>Enter</kbd> | 下一题 |
| <kbd>Alt</kbd> + <kbd>I</kbd> | 光标回到答题框 |
| <kbd>Alt</kbd> + <kbd>J</kbd> | 光标到题号框（`#`） |
| <kbd>Esc</kbd> | 退出输入框 |
| <kbd>Alt</kbd> + <kbd>/</kbd> | 打开/关闭面板 |

数字绑定的是**动作**而不是按钮的位置，所以做完提交、`提交` 按钮消失时，其他键不会跟着挪位。

习惯字母的话，<kbd>Alt</kbd>+<kbd>P</kbd> 播放、<kbd>Alt</kbd>+<kbd>S</kbd> 提交、<kbd>Alt</kbd>+<kbd>R</kbd> 重置、<kbd>Alt</kbd>+<kbd>B</kbd>/<kbd>N</kbd> 上/下一题、<kbd>Alt</kbd>+<kbd>←</kbd>/<kbd>→</kbd> 也都保留可用。

**单键模式**：按 <kbd>Esc</kbd> 退出输入框后，不用按 Alt，直接 <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> <kbd>5</kbd> 就是同样五个动作，<kbd>I</kbd> 回到输入框（字母 <kbd>P</kbd> <kbd>S</kbd> <kbd>R</kbd> <kbd>B</kbd> <kbd>N</kbd> 同样可用）。不习惯可以在面板里关掉。

> Windows / macOS 的 Chrome 里 <kbd>Alt</kbd>+<kbd>1</kbd>–<kbd>8</kbd> 是空闲的（切标签页用的是 Ctrl/⌘）。Linux 版 Chrome 用 Alt+数字切标签页，遇到冲突改键即可。

### 记不住快捷键？不用记

按键提示直接画在按钮上：播放 / 提交 / 重置 / 上一题 / 下一题 上都有一个蓝色小标签，跟着页面滚动。光标在输入框里时显示 `Alt+P`，离开输入框后自动变成 `P`——显示的永远是当下能用的那个键。<kbd>Alt</kbd>+<kbd>H</kbd> 开关提示。

### 和翻译插件冲突？

**沉浸式翻译默认占用 <kbd>Alt</kbd>+<kbd>A</kbd>**，所以本脚本特意不用这个键，播放是 <kbd>Alt</kbd>+<kbd>P</kbd>。

如果还有别的冲突，直接改键即可。脚本抢不过插件——扩展的内容脚本运行在独立环境里，页面脚本的 `preventDefault()` 拦不住它，只能换键：

1. <kbd>Alt</kbd>+<kbd>/</kbd> 打开面板
2. 点对应那行的 **改键 Rebind**
3. 按下你想用的组合键

立即保存。改键是**替换**原来的主键而不是叠加，所以冲突的那个键会真的被释放；如果按的键已被别的动作占用，会自动从那个动作上解绑——一个键只对应一个功能。**恢复默认** 可以一键还原。

实在不行：<kbd>Alt</kbd>+<kbd>0</kbd> 是总开关，一键关掉/打开所有快捷键。关掉时面板依然能打开，不会把自己锁死。

### 其他控制键

<kbd>Alt</kbd>+<kbd>/</kbd> 面板 · <kbd>Alt</kbd>+<kbd>H</kbd> 按钮提示开关 · <kbd>Alt</kbd>+<kbd>0</kbd> 总开关 · <kbd>Alt</kbd>+<kbd>K</kbd> 重新识别按钮

**常用节奏**：`Alt+A` 听 → 打字 → `Ctrl+Enter` 提交看分 → `Alt+Enter` 下一题（光标自动回到输入框）。

### 找不到按钮怎么办

脚本靠按钮上的文字（`播放`/`停止`、`提交`、`重置`、`下一题`、`上一题`、`跳转`）定位，并优先选择网站题目工具栏 `.pte-toolbar-btn` 里的按钮，避免误伤页面上同名的其他按钮。注意播放中该按钮会变成 **停止**，同一个键两种状态都能匹配。

如果网站改了文案，按 <kbd>Alt</kbd>+<kbd>K</kbd> → 按数字选动作 → 点页面上对应的按钮重新识别即可（这一下点击会被拦截，不会真的触发按钮）。面板里的 **恢复默认** 可清除所有自定义。

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
