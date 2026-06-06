# Output Spec

## WeChat HTML

Render final Markdown into a self-contained HTML fragment suitable for pasting into a WeChat public-account editor.

Default visual system:

- max width: 600px
- background: warm off-white `#FAF7F2`
- primary accent: clay red `#C0512F`
- secondary accent: deep green `#2F5B4F`
- body font: `Noto Serif SC`, Georgia, serif
- body line-height: about 2
- all critical styles inline

Markdown conventions:

- `#` becomes the article title.
- The paragraph immediately after `#` can act as subtitle when short.
- `##` starts a major block.
- `###` starts a subsection.
- `>` becomes a quote or golden-sentence block.
- Horizontal rule `---` becomes a divider.
- Bold text remains emphasized with inline color when possible.

Use:

```bash
node /Users/hanzhang/.codex/skills/writing-team/scripts/render_writing_team.js render-wechat --input "<run>/定稿.md" --output "<run>/wechat.html"
```

## Xiaohongshu Cards

Cards are generated from `xhs/cards.json`, not directly from the article. The writer should distill the article into 6-8 cards first.

Card JSON shape:

```json
{
  "theme": "classic",
  "cards": [
    {
      "kicker": "AI · 开发者 · 普通人",
      "title": "AI能不能\n替代软件\n开发者",
      "subtitle": "代码生成已经不是瓶颈了。\n验证才是。",
      "footerLabel": "乘法 · 除法 · 陷阱",
      "footerTitle": "普通人的最佳路径"
    },
    {
      "kicker": "乘法区",
      "title": "AI让你\n效率翻倍",
      "subtitle": "这些环节，放心交给AI。",
      "items": [
        {
          "label": "i.",
          "title": "原型设计和界面生成",
          "body": "30秒一个可交互原型。前端界面是AI的舒适区。"
        }
      ],
      "quote": "把需求说清楚，是普通人用AI做软件ROI最高的一步。"
    }
  ]
}
```

Card rules:

- width: 1080px
- height: 1440px
- format: JPG
- one strong idea per card
- cover title should be short enough for 2-4 lines
- body text should be cut aggressively; do not copy long paragraphs
- use quiet colors, large whitespace, strong hierarchy, and mobile-readable type

Render:

```bash
node /Users/hanzhang/.codex/skills/writing-team/scripts/render_writing_team.js render-xhs --cards "<run>/xhs/cards.json" --out-dir "<run>/xhs/cards" --strict
```

## Acceptance Checks

- `wechat.html` exists and opens as a complete styled fragment.
- Every Xiaohongshu card is `1080x1440` unless the user explicitly requests another size.
- No card has text overflow in strict mode.
- Card filenames are stable: `01.jpg`, `02.jpg`, ...
- The article and cards use the selected persona's structure and voice, but do not invent facts from persona files.
