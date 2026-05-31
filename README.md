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

复制 `movie-finder` 到 Codex 的 Skills 目录：

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

注意：当前 `movie-finder` 包装脚本默认依赖本机 MovieFinder 项目位于 `/Users/hanzhang/Documents/MovieFinder`。如果项目路径发生变化，需要更新 `movie-finder/scripts/search_movie.py` 中的 `MOVIEFINDER_PROJECT`。
