# KhanSkills

这是我的自创 Agent Skill 合集，用来沉淀可复用的 Agent 能力、工作流封装和本地工具入口。

每个 Skill 都以独立目录保存，目录内包含 `SKILL.md` 入口说明，以及需要给 Agent 调用的脚本、参考文档或配置文件。

## Skills

| Skill | 介绍 | 典型用法 | 输出/依赖 |
| --- | --- | --- | --- |
| `writing-team` | 中文 AI 写作团队 Skill，把写作任务拆成可审计流水线：人设管理、选题、素材、初稿、事实核查、审稿、风格定稿、微信公众号排版和小红书卡片生成。 | 创建或维护写作人设；使用指定人设写公众号文章、博客文章或长文初稿；把文章输出为微信公众号 HTML 和小红书图文卡片。 | 产出 `选题.md`、`素材.md`、`初稿.md`、`事实核查.md`、`审稿.md`、`定稿.md`、`wechat.html` 和 `xhs/cards/`；渲染脚本依赖 Node.js，生成小红书 JPG 时会使用 Playwright/Chrome。 |
| `movie-finder` | 电影/剧集资源搜索 Skill，让 Agent 搜索 MovieFinder 资源元数据，并返回适合对话展示的 Markdown 或适合程序处理的 JSON。 | 让 Agent 按关键词搜索电影/剧集资源，整理简介、评分和可用资源链接。 | 封装本机 MovieFinder CLI；默认依赖 MovieFinder 项目位于 `/Users/hanzhang/Documents/MovieFinder`。 |

## 安装方式

在 Claude Code、Codex、OpenClaw 等支持 Skill 的 Agent 里，可以直接让 Agent 从 GitHub 目录安装。格式是：

```text
帮我安装这个 skill：https://github.com/QinGeneral/KhanSkills/tree/main/<skill-name>
```

把 `<skill-name>` 换成你想安装的 Skill 名称即可。

例如安装 `movie-finder`：

```text
帮我安装这个 skill：https://github.com/QinGeneral/KhanSkills/tree/main/movie-finder
```

例如安装 `writing-team`：

```text
帮我安装这个 skill：https://github.com/QinGeneral/KhanSkills/tree/main/writing-team
```

支持 Skill 安装的 Agent 会自己 clone 仓库、复制对应目录到它的 Skill 路径，并在需要时读取 `SKILL.md`。你不需要手动关心 Codex、Claude Code、OpenClaw 或其他 Agent 的具体本地目录。

## 使用示例

安装后，可以直接在 Agent 里说：

```text
Use $movie-finder to search for a movie by keyword and return a Markdown resource list with synopsis, Douban/IMDB ratings, and cloud drive links.
```

也可以说：

```text
使用 writing-team，按万维钢人设写一篇关于 AI 时代个人规划的公众号文章，并输出小红书卡片。
```

或者：

```text
Use $writing-team to create a writing persona from these reference articles, then write a WeChat article and Xiaohongshu cards with that persona.
```

## 手动安装兜底

如果你的 Agent 暂时不支持从 GitHub tree URL 自动安装，可以手动克隆本仓库，再复制对应 Skill 目录：

```bash
git clone https://github.com/QinGeneral/KhanSkills.git
cd KhanSkills
mkdir -p ~/.codex/skills
cp -R movie-finder ~/.codex/skills/movie-finder
cp -R writing-team ~/.codex/skills/writing-team
```

验证 Skill 结构：

```bash
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py ~/.codex/skills/movie-finder
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py ~/.codex/skills/writing-team
```

也可以直接运行包装脚本做烟测：

```bash
python3 ~/.codex/skills/movie-finder/scripts/search_movie.py "一一" --limit 3
node ~/.codex/skills/writing-team/scripts/render_writing_team.js render-wechat --input "<run>/定稿.md" --output "<run>/wechat.html"
```

## 依赖说明

当前 `movie-finder` 包装脚本默认依赖本机 MovieFinder 项目位于 `/Users/hanzhang/Documents/MovieFinder`。如果项目路径发生变化，需要更新 `movie-finder/scripts/search_movie.py` 中的 `MOVIEFINDER_PROJECT`。

`writing-team` 的渲染脚本依赖 Node.js；生成小红书 JPG 时会通过 Playwright/Chrome 截图。如果本机缺少 Playwright 浏览器，需要先安装浏览器依赖，或允许脚本使用本机 Chrome。
