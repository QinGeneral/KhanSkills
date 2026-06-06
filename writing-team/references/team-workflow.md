# Team Workflow

## Role Roster

The writing team is a deterministic, interactive sequence. Run every relevant stage, save its artifact, and ask the user to confirm before moving on.

## Sequential Invocation Protocol

The workflow must feel like a real editorial pipeline. Never write all stage artifacts at once.

For each role:

- Say which role is now working.
- Read the exact upstream file(s) needed for that role.
- Write only the target artifact for that role.
- Leave downstream files untouched except for placeholder files created by `new-run`.
- Summarize the saved artifact and the next proposed role.
- Move to the next role only after the current artifact exists, contains role-specific content, and the user explicitly confirms.

Forbidden shortcuts:

- One `apply_patch` that fills `选题.md`, `素材.md`, `初稿.md`, `事实核查.md`, `审稿.md`, and `定稿.md` together.
- Generating the final draft before `素材.md` exists.
- Writing `事实核查.md` from memory without reading the draft and material pack.
- Writing `定稿.md` before `审稿.md` exists.
- Rendering `wechat.html` before `定稿.md` exists.
- Producing `赵选题`'s three candidates before the user has provided a topic scope and the agent has searched current internet sources.
- Starting `素材.md` before the user chooses one of the three topic candidates in `选题.md`.
- Treating a request for a complete article as permission to skip user confirmations between stages.

1. 王整理 - Knowledge steward

   Input cleanup, reference indexing, corpus grouping, deduplication notes, and run-folder setup.

   Must produce: run folder plus confirmed run metadata. Do not write article-stage files beyond placeholders created by `new-run`.

2. 赵选题 - Topic consultant

   Turns a user-provided topic scope plus current internet research into exactly three concrete recommended angles, then asks the user to choose one. Each candidate names the tension, audience, promise, why now, source-material lead, and web-research lead.

   Must read: user request, selected persona summary, user-provided topic scope, and internet search results/source notes.

   Before producing candidates: ask the user for a topic scope (`主题范围`) unless it is already explicit in the request; wait for the user's answer. After the scope is available, search the internet for current and relevant material inside that scope, then use those sources to shape recommendations.

   Must produce: `选题.md` only. The first version contains the topic scope, search queries, source links, short evidence notes, exactly three concrete topic candidates, and a pending selection. After the user chooses, update `选题.md` with the selected topic before asking to enter `张素材`.

3. 张素材 - Research specialist

   Collects examples, current-project article evidence, local corpus evidence, personal-note inputs, data, quotes, cases, counterexamples, internet material, and missing-source notes.

   Must read: `选题.md`, relevant current-project articles or local references found for the selected topic, personal notes from local note directories or available note skills/tools, and any internet articles/pages used as external material.

   May search: current project articles, local reference material, personal-note sources, and the internet. Personal-note sources include the local Get 笔记/getnotes directory `/Users/hanzhang/Downloads/getnotes_export/` when present, plus 微信读书 or other note skills/tools when relevant. Prefer reading `/Users/hanzhang/Downloads/getnotes_export/` directly before calling a Get 笔记/GetBigi/getnotes skill or tool; call the skill/tool only when the local directory is unavailable, stale, incomplete, or insufficient for the selected topic. Use personal-note sources to retrieve the user's notes, highlights, book thoughts, and prior reflections related to the selected topic. If internet search is used, collect and synthesize 20-30 relevant articles/pages as the external material pool; do not rely on search-result snippets alone.

   Must produce: `素材.md` only. If `/Users/hanzhang/Downloads/getnotes_export/` is unavailable or insufficient, state that limitation in `素材.md` and fall back to any available Get 笔记/GetBigi/getnotes skill or tool when useful. If a personal-note skill/tool such as 微信读书 is unavailable or unauthenticated, state that limitation in `素材.md` and continue with the remaining source base unless the user asks to pause. If fewer than 20 useful external articles/pages can be found or internet search is unavailable, state that limitation in `素材.md` and ask the user whether to continue with the available source base, retry search, or provide sources manually.

4. 李文章 - Writer

   Produces the first complete draft from the approved angle and material pack.

   Must read: `选题.md`, `素材.md`.

   Must produce: `初稿.md` only.

5. 吴查查 - Fact checker

   Checks factual claims, dates, numbers, names, product claims, and source reliability. Marks unsupported claims for removal or softening.

   Must read: `素材.md`, `初稿.md`.

   Must produce: `事实核查.md` only.

6. 周审稿 - Senior editor

   Reviews structure, logic, promise delivery, reader friction, section order, and whether the article answers the opening question.

   Must read: `初稿.md`, `事实核查.md`.

   Must produce: `审稿.md` only.

7. 刘风格 - Style polisher

   Applies the selected persona without making the article a parody. Checks voice, rhythm, transitions, sentence habits, and unique markers.

   Must read: `初稿.md`, `审稿.md`, and the selected persona files.

   Must produce: `定稿.md` only.

8. 陈排版 - Layout designer

   Produces WeChat HTML and Xiaohongshu cards using the output templates and rendering script.

   Must read: `定稿.md` and `references/output-spec.md`.

   Must produce: `wechat.html` and optional `xhs/cards.json` plus rendered cards.

## Required Run Artifacts

Create this structure for every long-form run:

```text
写作产出/<YYYYMMDD-HHMM>-<slug>/
├── meta.yaml
├── 选题.md
├── 素材.md
├── 初稿.md
├── 事实核查.md
├── 审稿.md
├── 定稿.md
├── wechat.html
└── xhs/
    ├── cards.json
    └── cards/
        ├── 01.jpg
        └── ...
```

## Stage Contracts

`选题.md` must include:

- topic scope provided by the user
- internet search queries and source links checked before recommendation
- short evidence notes from the internet research
- audience
- core question
- exactly three topic candidates
- for each candidate: working title, core angle, one-sentence thesis, why this is worth writing now, source-material lead, web-research lead, expected reader value
- selected topic after the user chooses
- article skeleton for the selected topic only

`素材.md` must include:

- current-project articles and local references read
- personal-note sources checked, including local directory paths such as `/Users/hanzhang/Downloads/getnotes_export/`, Get 笔记/GetBigi/getnotes skill/tool fallback if used, and 微信读书 when used
- personal inputs worth using, with source path or skill/tool, query or book/course/article title, note/highlight date when available, and why it matters to the selected topic
- outside articles/pages checked when internet search is used
- if internet search is used, a source list of 20-30 relevant articles/pages with title, URL, publisher or author when available, date when available, reason selected, and useful evidence
- examples and data with source notes
- quotes, cases, counterexamples, and analogies worth using
- claims to avoid because evidence is weak

`初稿.md` must be a complete article, not an outline.

`事实核查.md` must list:

- checked claims
- source or evidence
- status: verified, softened, removed, or needs user confirmation

`审稿.md` must list:

- structural issues fixed
- logical gaps fixed
- reader-friction points fixed
- remaining editorial risks

`定稿.md` must be the final Markdown used for layout. Do not put process notes in this file.

## Operating Rules

- Use the selected persona as style context, not as content authority.
- Use local reference material before web sources when the user provided local files.
- In `赵选题`, always collect or confirm a topic scope before searching, and always search the internet before recommending the three concrete topics.
- If internet search is unavailable during `赵选题`, report the blockage and ask the user whether to retry, provide sources manually, or pause.
- In `张素材`, use current-project articles and local reference material as valid topic-related sources. Internet search is optional, but when used it must cover 20-30 relevant articles/pages and summarize them into `素材.md`.
- In `张素材`, personal notes from `/Users/hanzhang/Downloads/getnotes_export/`, Get 笔记/GetBigi/getnotes fallback skill/tool, 微信读书, or similar note sources are valid personal inputs. Prefer the local `/Users/hanzhang/Downloads/getnotes_export/` directory over calling Get 笔记/GetBigi/getnotes when it is present and sufficient. Label personal notes as personal inputs, use them for angles, examples, metaphors, and lived context, and fact-check any external factual claims before reuse.
- If a personal-note skill/tool is unavailable during `张素材`, report the limitation in `素材.md` and continue with available sources unless the user explicitly wants to pause and fix access.
- If internet search is unavailable during `张素材`, report the blockage and ask the user whether to retry, continue with local/current-project sources, or provide sources manually.
- Browse the web for current facts, dates, prices, product claims, regulations, news, or statistics.
- If a claim cannot be verified, either remove it, soften it, or explicitly mark it as opinion.
- Keep role names visible in intermediate artifacts so later reviews can audit the workflow.
- Do not skip fact-checking just because the prose sounds confident.
- Keep user interaction gates visible: after each role, ask whether to continue, revise, or stop before starting the next role.
- If the agent catches itself batch-writing downstream artifacts, stop, discard the downstream draft work, and resume from the earliest legitimate role artifact.
