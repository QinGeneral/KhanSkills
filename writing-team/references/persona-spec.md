# Persona Spec

## Directory Shape

Each persona lives in one directory:

```text
写作人设/<画像名>/
├── persona.yaml
├── references.md
├── 风格概述.md
├── 思维内核.md
├── 创作方法论.md
├── 创作习惯.md
├── 表达特征.md
└── 独特标记.md
```

The six Markdown files are the context loaded before style-constrained writing. Keep their headings stable so future agents can find the right section quickly.

## persona.yaml

Use this shape:

```yaml
name: "画像名"
role: "写作画像"
description: "一句话描述这个画像适合写什么"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
source_language: "zh-CN"
reference_policy: "local-first"
style_files:
  - "风格概述.md"
  - "思维内核.md"
  - "创作方法论.md"
  - "创作习惯.md"
  - "表达特征.md"
  - "独特标记.md"
```

## references.md

Record the source material used to create or update the persona:

- local file paths
- public URLs
- pasted text labels
- date read
- short note on why each source mattered

If a source was unavailable or unreadable, record that instead of pretending it was used.

## Six Files

`风格概述.md`

- overall style metaphor
- target audience
- author/voice image inferred from the corpus
- 5 most important style traits
- 2-4 original examples when available

`思维内核.md`

- worldview
- preferred reasoning patterns
- what the style treats as evidence
- recurring judgments and values
- thinking anti-patterns to avoid

`创作方法论.md`

- topic selection logic
- how the author turns input into an article
- common article paths
- decision points, depth choices, and risk controls

`创作习惯.md`

- common structures
- opening and ending habits
- reader interaction style
- sectioning, transitions, and pacing

`表达特征.md`

- language layers
- tone matrix
- sentence rhythm
- rhetorical devices
- concrete rewrite rules

`独特标记.md`

- vocabulary fingerprints
- sentence signatures
- punctuation habits
- title habits
- image/screenshot habits
- markers to use sparingly

## Creation Workflow

1. Read all supplied reference material, or a representative sample if the corpus is large.
2. Deduplicate repeated exports and avoid overcounting copied boilerplate.
3. Separate evidence from reusable rules. Evidence can appear as examples, but the file should teach future writing.
4. Fill the six files using the headings above.
5. Create `persona.yaml` and `references.md`.
6. Run `validate-persona`.

## Quality Rules

- Good: "The article usually opens with a familiar scene, then exposes a hidden model and returns to action."
- Bad: "Article A says..., Article B says..., Article C says..."
- Good: "Use a few signature words where the argument naturally calls for them."
- Bad: "Stuff every paragraph with catchphrases."
- Good: "Preserve the persona's thinking structure."
- Bad: "Only imitate surface口语."

## Failure Handling

- Missing persona directory: tell the user the persona does not exist and list nearby persona directories if discoverable.
- Missing one of six files: create a TODO stub only if the user asked to create/update the persona; otherwise stop and report the missing file.
- Empty references: ask for source material or clearly mark the persona as draft.
- Conflicting style evidence: write the conflict into `references.md`, then choose the pattern supported by the strongest or freshest sources.
