---
name: writing-team
description: Build and run a Chinese AI writing team workflow with reusable writing personas, reference material, staged drafts, fact checks, WeChat article HTML, and Xiaohongshu card images. Use when the user asks to create/manage writing personas, write with a selected persona, generate polished WeChat public-account HTML, or turn article highlights into Xiaohongshu images.
---

# Writing Team

Use this skill to run a local, file-backed writing workflow. The team is a staged workflow, not a set of long-running autonomous agents.

## Sequential Role Contract

When writing with a persona, execute the writing team one role at a time. Do not batch-generate all stage files in one response, one patch, or one script call.

For every role:

1. Announce the current role briefly.
2. Read the required upstream artifact(s).
3. Produce only that role's artifact or output.
4. Save it before moving to the next role.
5. Do not create, edit, or prefill downstream stage artifacts until their role is reached.
6. After saving the current role's artifact, summarize the artifact path and the next role, then ask the user to confirm before continuing.
7. If the user requests changes at a gate, revise only the current role's artifact or the explicitly requested upstream artifact, then ask for confirmation again.

If the user asks for a complete article in one turn, still complete the whole pipeline sequentially and interactively. Use separate file edits/tool calls for each role so the run folder is auditable, and do not treat the initial request as confirmation to skip later gates.

## User Interaction Gates

Writing runs are interactive by default.

- Before starting any downstream role, tell the user which role is next, which upstream artifact(s) will be read, and which artifact will be created.
- Wait for the user's explicit confirmation before moving from one role to the next.
- `赵选题` has an additional topic-scope and research gate: before drafting candidates, ask the user for a `主题范围` unless the user's request already gives one clearly. Wait for the user's scope before searching or writing `选题.md`.
- After the topic scope is available, `赵选题` must search the internet for current and relevant material inside that scope before recommending topics. Record search queries, source links, and short evidence notes in `选题.md`.
- `赵选题` must then produce exactly three concrete recommended topic candidates, present the three candidates to the user, and wait for the user to choose one or request revisions.
- After the user chooses a topic, record the selected topic in `选题.md`, then ask for confirmation before entering `张素材`.
- `张素材` may build the material pack from current-project articles, local reference material, and internet search. If internet search is used, collect and synthesize 20-30 relevant articles/pages as the external material pool, not just a few search snippets.
- `张素材` may also use personal-note sources to retrieve the user's notes, highlights, book thoughts, and prior reflections related to the selected topic. For Get 笔记/getnotes, prefer the local downloaded note directory `/Users/hanzhang/Downloads/getnotes_export/` when present instead of calling a Get 笔记/GetBigi/getnotes skill or tool. 微信读书 can still be called through its skill when relevant. Treat personal notes as personal inputs for ideas, cases, metaphors, and lived context; do not treat them as verified factual evidence unless checked against reliable sources.
- Do not generate `素材.md`, `初稿.md`, `事实核查.md`, `审稿.md`, `定稿.md`, `wechat.html`, or Xiaohongshu cards until the relevant confirmation gate has passed.

## Default Paths

- Persona library: prefer a user-provided path; otherwise use `写作人设/` in the current workspace when present.
- Output runs: `写作产出/<YYYYMMDD-HHMM>-<slug>/`.
- Default Get 笔记 local source: `/Users/hanzhang/Downloads/getnotes_export/` when present.
- Example persona source: `/Users/hanzhang/Downloads/Get 笔记专家版写作团/画像/`.
- Example output source: `/Users/hanzhang/Downloads/Get 笔记专家版写作团/微信公众号文章/` and `/Users/hanzhang/Downloads/Get 笔记专家版写作团/小红书/`.

## Workflows

### Create or Update a Persona

1. Read `references/persona-spec.md`.
2. Gather the persona name, short description, and reference materials from the user or local paths.
3. Read the reference materials directly; do not summarize from filenames alone.
4. Generate or update the six persona files plus `persona.yaml` and `references.md`.
5. Keep the files reusable and writing-oriented; avoid article-by-article reading reports.
6. Validate with:

```bash
node /Users/hanzhang/.codex/skills/writing-team/scripts/render_writing_team.js validate-persona --persona-dir "<persona dir>"
```

### Write With a Persona

1. Read `references/team-workflow.md` and `references/output-spec.md`.
2. Load the selected persona's `persona.yaml` and six Markdown files. Treat them as the operative style spec.
3. Create a run folder with `new-run`.
4. Execute the roles in strict order. Each role must read the previous artifact and write only its own target:
   - 王整理: confirm inputs, persona, run path, and source material boundaries in `meta.yaml` or a short run note. After saving, ask the user to confirm entering `赵选题`; make clear that `赵选题` will first collect a topic scope if one is not already explicit.
   - 赵选题: before writing candidates, ask the user for a `主题范围` unless the user's request already gives one clearly. After the scope is available, search the internet for current and relevant material inside that scope. Then write `选题.md` with the topic scope, search queries, source links, short evidence notes, and exactly three concrete recommended topic candidates. Each candidate should include a working title, core angle, why it fits the persona, source-material lead, web-research lead, and expected reader value. Present the three candidates to the user and wait for the user to choose one or request revisions. After the user chooses, update `选题.md` with the selected topic and ask the user to confirm entering `张素材`.
   - 张素材: read `选题.md`, then gather topic-related material from current-project articles and local reference material when available. It may use personal-note sources to collect the user's notes, highlights, book thoughts, and prior reflections as personal inputs. For Get 笔记/getnotes, first search the local directory `/Users/hanzhang/Downloads/getnotes_export/` when present; only call a Get 笔记/GetBigi/getnotes skill or tool if the local directory is unavailable or insufficient. 微信读书 can still be called through its skill when relevant. It may also search the internet; if it does, collect and synthesize 20-30 relevant articles/pages as the external material pool. Write `素材.md` with local article/source notes, personal-note inputs, outside article/source notes, examples, data, quotes, counterexamples, and weak-evidence warnings.
   - 李文章: read `选题.md` and `素材.md`, then write `初稿.md`.
   - 吴查查: read `初稿.md` and `素材.md`, then write `事实核查.md`.
   - 周审稿: read `初稿.md` and `事实核查.md`, then write `审稿.md`.
   - 刘风格: read `初稿.md`, `审稿.md`, and the persona files, then write `定稿.md`.
   - 陈排版: render `wechat.html` and optional Xiaohongshu cards.
5. Between every adjacent pair of roles, stop after saving the current artifact, summarize what changed, and ask the user whether to continue to the next role. Continue only after explicit confirmation.
6. For factual or time-sensitive claims, verify sources before finalizing. Record source links or local evidence in `事实核查.md` and `素材.md`.
7. Render the WeChat article from `定稿.md`:

```bash
node /Users/hanzhang/.codex/skills/writing-team/scripts/render_writing_team.js render-wechat --input "<run>/定稿.md" --output "<run>/wechat.html"
```

8. Create `xhs/cards.json`, then render cards:

```bash
node /Users/hanzhang/.codex/skills/writing-team/scripts/render_writing_team.js render-xhs --cards "<run>/xhs/cards.json" --out-dir "<run>/xhs/cards" --strict
```

## References

- Team roles and artifact sequence: `references/team-workflow.md`
- Persona file contract: `references/persona-spec.md`
- WeChat and Xiaohongshu output contract: `references/output-spec.md`
- Deterministic layout/rendering script: `scripts/render_writing_team.js`

## Quality Bar

- A persona is useful only if it can guide future writing. Favor abstract writing rules, structural habits, voice, examples, and anti-patterns.
- The article must pass through topic, material, draft, fact-check, review, style polish, and layout stages sequentially, with each role producing only its own artifact.
- WeChat HTML must be copyable into a public-account editor and should use inline styles.
- Xiaohongshu cards must be 1080px wide, readable on mobile, visually quiet, and free of text overflow.
