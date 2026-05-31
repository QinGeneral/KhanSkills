# MySkills

这是我的自创 Codex Skill 合集，用来沉淀可复用的 Agent 能力、工作流封装和本地工具入口。

每个 Skill 都以独立目录保存，目录内包含 `SKILL.md` 入口说明，以及需要给 Agent 调用的脚本、参考文档或配置文件。

## Skills

### movie-finder

`movie-finder` 用于让 Agent 搜索 MovieFinder 电影/剧集资源元数据，并返回适合对话展示的 Markdown 或适合程序处理的 JSON。

它封装了本机 MovieFinder CLI 的调用细节，让 Agent 不需要记住项目路径、`PYTHONPATH`、缓存数据库路径或底层命令参数。

## 给 Agent 安装 movie-finder

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
```

验证 Skill 结构：

```bash
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py ~/.codex/skills/movie-finder
```

安装后可以这样让 Agent 使用：

```text
Use $movie-finder to search for a movie by keyword and return a Markdown resource list with synopsis, Douban/IMDB ratings, and cloud drive links.
```

也可以直接运行包装脚本做烟测：

```bash
python3 ~/.codex/skills/movie-finder/scripts/search_movie.py "一一" --limit 3
```

### Claude Code

全局安装：

```bash
mkdir -p ~/.claude/skills
cp -R movie-finder ~/.claude/skills/movie-finder
```

项目内安装：

```bash
mkdir -p .claude/skills
cp -R movie-finder .claude/skills/movie-finder
```

Claude Code 会从 Skill 目录发现 `SKILL.md`。如果当前 Claude Code 会话已经打开，新增顶层 skills 目录后建议重启会话；已有目录中的 `SKILL.md` 修改通常会被监听到。使用时可以直接输入：

```text
/movie-finder 一一
```

### Cursor

项目内安装：

```bash
mkdir -p .cursor/skills
cp -R movie-finder .cursor/skills/movie-finder
```

全局安装：

```bash
mkdir -p ~/.cursor/skills
cp -R movie-finder ~/.cursor/skills/movie-finder
```

打开或重载 Cursor 工作区后，Agent 会根据 `SKILL.md` 的 `description` 判断是否加载该 Skill。也可以在对话里明确要求：

```text
Use movie-finder to search for "一一" and summarize the available resources.
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
```

工作区安装：

```bash
mkdir -p .agents/skills
cp -R movie-finder .agents/skills/movie-finder
```

Antigravity 会在 Agent 启动时看到可用 Skills 的名称和描述，并在任务匹配时读取完整 `SKILL.md`。使用时可以直接说：

```text
Use movie-finder to search for "一一".
```

### Qoder / qcoder

Qoder CLI 全局安装：

```bash
mkdir -p ~/.qoder/skills
cp -R movie-finder ~/.qoder/skills/movie-finder
```

Qoder CLI 项目内安装：

```bash
mkdir -p .qoder/skills
cp -R movie-finder .qoder/skills/movie-finder
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
```

注意：当前 `movie-finder` 包装脚本默认依赖本机 MovieFinder 项目位于 `/Users/hanzhang/Documents/MovieFinder`。如果项目路径发生变化，需要更新 `movie-finder/scripts/search_movie.py` 中的 `MOVIEFINDER_PROJECT`。
