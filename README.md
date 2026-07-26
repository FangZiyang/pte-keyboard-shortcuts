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

One hand, four keys, in the order you press them. <kbd>4</kbd> is 下一题 on every question type.

Speaking questions have no answer box and nothing worth submitting — the loop there is **听 → 说 → 看分 → 下一题** — so <kbd>2</kbd> and <kbd>3</kbd> point at the recorder's own controls instead. The script switches automatically when the recorder is on the page.

Nothing is lost in the swap: the toolbar actions keep their letter alternates everywhere (<kbd>Alt</kbd>+<kbd>S</kbd> 提交, <kbd>Alt</kbd>+<kbd>R</kbd> 重置), and each recorder control also has a direct key of its own — <kbd>6</kbd> 录音, <kbd>7</kbd> 跳过准备 (RA), <kbd>8</kbd> AI 评分.

**上一题 has no number.** It's a once-an-evening key, and spending a digit on it pushed 下一题 — pressed on every single question — out to <kbd>5</kbd>. It still answers to <kbd>Alt</kbd>+<kbd>B</kbd> and <kbd>Alt</kbd>+<kbd>←</kbd>.

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
| <kbd>4</kbd> | 下一题 Next | same |
| <kbd>5</kbd> | — | **重录** Record again |
| <kbd>6</kbd> | 录音 Record / stop — RA, RS | |
| <kbd>7</kbd> | 跳过准备 Skip the prep countdown — RA | |
| <kbd>8</kbd> | AI 评分 AI-score the take — RA, RS | |
| <kbd>Alt</kbd> + <kbd>B</kbd> / <kbd>Alt</kbd> + <kbd>←</kbd> | 上一题 Previous | |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> | 提交 Submit | |
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

> **Upgrading from 1.4.x or earlier resets your rebinds once.** The number row changed shape in 1.5.0 (下一题 moved to <kbd>4</kbd>), and merging an old saved set would have left half the row pointing at the previous meaning. Options and re-taught button labels are kept.

## If a shortcut says "button not found"

The script finds buttons by their visible label (`播放`/`停止`, `提交`, `重置`, `下一题`, `上一题`, `跳转`), preferring ones inside the site's `.pte-toolbar-btn` question toolbar so a lookalike elsewhere on the page can't win. Note that 播放 relabels itself to **停止** while audio is playing — the same key matches both.

The recorder's controls carry no text at all — they're icon-only — so those are found by their component class (`.pte-audio-pill__play`, `.pte-rec-pill__main`, `.pte-rec-pill__submit`, `.pte-rec-pill__reset`, `.pte-rec-pill__skip`) with the labels as a fallback.

If the site renames a button, or a question type uses a different word, re-teach it:

1. Press <kbd>Alt</kbd>+<kbd>K</kbd>.
2. Press the number of the action you want to fix.
3. Click that button on the page. The click is intercepted, not passed through — it will not fire the button.

The label is saved locally. **恢复默认 / Reset to defaults** in the panel clears everything you've customised.

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

一只手四个键，按的顺序就是它们的顺序。<kbd>4</kbd> 在所有题型上都是下一题。

口语题没有答题框，也没什么好提交的，节奏是 **听 → 说 → 看分 → 下一题**，所以 <kbd>2</kbd> 和 <kbd>3</kbd> 改成指录音条自己的控件。页面上一出现录音条就自动切换，不用手动开关。

原来的动作一个都没丢：工具栏动作的字母别名在所有题型上都保持原义（<kbd>Alt</kbd>+<kbd>S</kbd> 提交、<kbd>Alt</kbd>+<kbd>R</kbd> 重置本题），录音条的每个控件也各有自己的直达键：<kbd>6</kbd> 录音、<kbd>7</kbd> 跳过准备（RA）、<kbd>8</kbd> AI 评分。

**上一题不占数字键**。这是一晚上按不了几次的键，为它留一个数字就把每题都要按的下一题挤到了 <kbd>5</kbd>。它保留 <kbd>Alt</kbd>+<kbd>B</kbd> 和 <kbd>Alt</kbd>+<kbd>←</kbd>。

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
| <kbd>4</kbd> | 下一题 | 同左 |
| <kbd>5</kbd> | — | **重录** |
| <kbd>6</kbd> | 录音 / 停止录音（RA、RS） | |
| <kbd>7</kbd> | 跳过准备（RA） | |
| <kbd>8</kbd> | AI 评分（RA、RS） | |
| <kbd>Alt</kbd> + <kbd>B</kbd> / <kbd>Alt</kbd> + <kbd>←</kbd> | 上一题 | |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> | 提交 | |
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

如果网站改了文案，按 <kbd>Alt</kbd>+<kbd>K</kbd> → 按数字选动作 → 点页面上对应的按钮重新识别即可（这一下点击会被拦截，不会真的触发按钮）。面板里的 **恢复默认** 可清除所有自定义。

### 安全说明

- **重置只匹配完全等于 `重置` 的按钮**，侧边栏的 `重置进度`（清空全部练习进度）被显式排除，模糊匹配永远碰不到它。
- **重录和重置分得很清**：录音条上的重录按钮是纯图标、`title="重置"`，脚本只按类名认它、绝不按这段文字认——所以 <kbd>5</kbd> 只会重录，不会清空整题，更碰不到 `重置进度`。
- 脚本只读取和点击页面上已有的元素，不发任何网络请求、不收集数据、`@grant none` 无特殊权限，也不会碰你的登录信息或账号设置。

---

## Development

The script is a single dependency-free file — edit `ynwac-shortcuts.user.js` and reload the page.

`test/` drives the script with real `KeyboardEvent`s against two jsdom fixtures — the WFD toolbar (including the `重置进度` button that must never be hit by accident) and the RA/RS recorder pill, where the number row swaps and the three 重置-ish buttons have to stay apart:

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
5. Both fixtures must be green:
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
