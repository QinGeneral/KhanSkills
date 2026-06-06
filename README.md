# MySkills

这是我的自创 Codex Skill 合集，用来沉淀可复用的 Agent 能力、工作流封装和本地工具入口。

每个 Skill 都以独立目录保存，目录内包含 `SKILL.md` 入口说明，以及需要给 Agent 调用的脚本、参考文档或配置文件。

## Skills

### movie-finder

`movie-finder` 用于让 Agent 搜索 MovieFinder 电影/剧集资源元数据，并返回适合对话展示的 Markdown 或适合程序处理的 JSON。

它封装了本机 MovieFinder CLI 的调用细节，让 Agent 不需要记住项目路径、`PYTHONPATH`、缓存数据库路径或底层命令参数。

### writing-team

`writing-team` 是一个中文 AI 写作团队 Skill，用来把写作任务拆成可审计的流水线：人设管理、选题、素材、初稿、事实核查、审稿、风格定稿、微信公众号排版和小红书卡片生成。

它适合这些场景：

- 创建或维护可复用的写作人设。
- 使用指定人设写公众号文章、博客文章或长文初稿。
- 把文章转换成可复制到微信公众号编辑器的 `wechat.html`。
- 把文章要点拆成小红书图文卡片，并渲染为 `1080x1440` JPG。

该 Skill 的核心特点是文件化、分阶段、可复盘。每个角色只产出自己的阶段文件，例如 `选题.md`、`素材.md`、`初稿.md`、`事实核查.md`、`审稿.md`、`定稿.md`、`wechat.html` 和 `xhs/cards/`。

## 给 Agent 安装 Skills

在需要使用该 Skill 的机器上，先把本仓库克隆到本地：

```bash
git clone https://github.com/QinGeneral/MySkills.git
cd MySkills
```

### Codex

全局安装，适合所有 Codex 项目复用：

```bash
mkdir -p ~/.codex/skills
cp -R movie-finder ~/.codex/skills/movie-finder
cp -R writing-team ~/.codex/skills/writing-team
```

验证 Skill 结构：

```bash
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py ~/.codex/skills/movie-finder
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py ~/.codex/skills/writing-team
```

安装后可以这样让 Agent 使用：

```text
Use $movie-finder to search for a movie by keyword and return a Markdown resource list with synopsis, Douban/IMDB ratings, and cloud drive links.
```

`writing-team` 示例：

```text
Use $writing-team to create a writing persona from these reference articles, then write a WeChat article and Xiaohongshu cards with that persona.
```

或者：

```text
使用 writing-team，按万维钢人设写一篇关于 AI 时代个人规划的公众号文章，并输出小红书卡片。
```

也可以直接运行包装脚本做烟测：

```bash
python3 ~/.codex/skills/movie-finder/scripts/search_movie.py "一一" --limit 3
node ~/.codex/skills/writing-team/scripts/render_writing_team.js render-wechat --input "<run>/定稿.md" --output "<run>/wechat.html"
```

### Claude Code

全局安装：

```bash
mkdir -p ~/.claude/skills
cp -R movie-finder ~/.claude/skills/movie-finder
cp -R writing-team ~/.claude/skills/writing-team
```

项目内安装：

```bash
mkdir -p .claude/skills
cp -R movie-finder .claude/skills/movie-finder
cp -R writing-team .claude/skills/writing-team
```

Claude Code 会从 Skill 目录发现 `SKILL.md`。如果当前 Claude Code 会话已经打开，新增顶层 skills 目录后建议重启会话；已有目录中的 `SKILL.md` 修改通常会被监听到。使用时可以直接输入：

```text
/movie-finder 一一
```

`writing-team` 使用示例：

```text
/writing-team 使用本地 写作人设/万维钢 写一篇公众号文章，并生成小红书卡片
```

### Cursor

项目内安装：

```bash
mkdir -p .cursor/skills
cp -R movie-finder .cursor/skills/movie-finder
cp -R writing-team .cursor/skills/writing-team
```

全局安装：

```bash
mkdir -p ~/.cursor/skills
cp -R movie-finder ~/.cursor/skills/movie-finder
cp -R writing-team ~/.cursor/skills/writing-team
```

打开或重载 Cursor 工作区后，Agent 会根据 `SKILL.md` 的 `description` 判断是否加载该 Skill。也可以在对话里明确要求：

```text
Use movie-finder to search for "一一" and summarize the available resources.
```

`writing-team` 示例：

```text
Use writing-team to run a staged Chinese writing workflow with persona, draft, fact-check, final article, WeChat HTML, and Xiaohongshu cards.
```

如果你的 Cursor 版本没有自动识别 Skills，可以用 Project Rules 做兼容兜底：

```bash
mkdir -p .cursor/rules
cat > .cursor/rules/movie-finder.mdc <<'EOF'
---
description: Use the local movie-finder Skill to search MovieFinder resources and return Markdown or JSON results.
alwaysApply: false
---

When the user asks to search movie or TV resources, read `movie-finder/SKILL.md` and follow its workflow. Prefer `movie-finder/scripts/search_movie.py`.
EOF
```

### Antigravity

全局安装：

```bash
mkdir -p ~/.gemini/antigravity/skills
cp -R movie-finder ~/.gemini/antigravity/skills/movie-finder
cp -R writing-team ~/.gemini/antigravity/skills/writing-team
```

工作区安装：

```bash
mkdir -p .agents/skills
cp -R movie-finder .agents/skills/movie-finder
cp -R writing-team .agents/skills/writing-team
```

Antigravity 会在 Agent 启动时看到可用 Skills 的名称和描述，并在任务匹配时读取完整 `SKILL.md`。使用时可以直接说：

```text
Use movie-finder to search for "一一".
```

`writing-team` 示例：

```text
Use writing-team to create a reusable Chinese writing persona and produce WeChat/Xiaohongshu outputs.
```

### Qoder / qcoder

Qoder CLI 全局安装：

```bash
mkdir -p ~/.qoder/skills
cp -R movie-finder ~/.qoder/skills/movie-finder
cp -R writing-team ~/.qoder/skills/writing-team
```

Qoder CLI 项目内安装：

```bash
mkdir -p .qoder/skills
cp -R movie-finder .qoder/skills/movie-finder
cp -R writing-team .qoder/skills/writing-team
```

如果 Qoder CLI 会话已经运行，执行：

```text
/skills reload
```

然后查看可用 Skills：

```text
/skills
```

如果你使用的是 QoderWork，Skill 目录是：

```bash
mkdir -p ~/.qoderwork/skills
cp -R movie-finder ~/.qoderwork/skills/movie-finder
cp -R writing-team ~/.qoderwork/skills/writing-team
```

注意：当前 `movie-finder` 包装脚本默认依赖本机 MovieFinder 项目位于 `/Users/hanzhang/Documents/MovieFinder`。如果项目路径发生变化，需要更新 `movie-finder/scripts/search_movie.py` 中的 `MOVIEFINDER_PROJECT`。

`writing-team` 的渲染脚本依赖 Node.js；生成小红书 JPG 时会通过 Playwright/Chrome 截图。如果本机缺少 Playwright 浏览器，需要先安装浏览器依赖，或允许脚本使用本机 Chrome。
