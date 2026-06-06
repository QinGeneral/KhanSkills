#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const REQUIRED_PERSONA_FILES = [
  "persona.yaml",
  "references.md",
  "风格概述.md",
  "思维内核.md",
  "创作方法论.md",
  "创作习惯.md",
  "表达特征.md",
  "独特标记.md",
];

const STYLE_FILES = REQUIRED_PERSONA_FILES.filter((name) => name.endsWith(".md") && name !== "references.md");
const BUNDLE_NODE_MODULES = "/Users/hanzhang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";

function usage() {
  console.log(`Usage:
  render_writing_team.js new-run --title <title> --persona <name> [--out-root <dir>]
  render_writing_team.js import-persona --source <dir> --name <name> [--description <text>] [--out-root <dir>]
  render_writing_team.js validate-persona --persona-dir <dir>
  render_writing_team.js render-wechat --input <final.md> --output <wechat.html>
  render_writing_team.js render-xhs --cards <cards.json> --out-dir <dir> [--strict]
`);
}

function parseArgs(argv) {
  const command = argv[2];
  const opts = {};
  for (let i = 3; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      opts[key] = true;
    } else {
      opts[key] = next;
      i += 1;
    }
  }
  return { command, opts };
}

function requireOption(opts, key) {
  if (!opts[key]) throw new Error(`Missing required option --${key}`);
  return String(opts[key]);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function writeText(file, text) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, text, "utf8");
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function todayDate() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function timestampSlug() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

function slugify(input) {
  const clean = String(input || "untitled")
    .trim()
    .replace(/[\\/:*?"<>|#%&{}$!@+=`]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
  return clean || "untitled";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMarkdown(value) {
  const escaped = escapeHtml(value);
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:600;color:#C0512F;">$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="font-family:Menlo,Consolas,monospace;background:#F3EDE5;padding:2px 5px;border-radius:4px;">$1</code>');
}

function parseMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const tokens = [];
  let paragraph = [];
  let list = null;

  function flushParagraph() {
    if (paragraph.length) {
      tokens.push({ type: "p", text: paragraph.join("\n").trim() });
      paragraph = [];
    }
  }

  function flushList() {
    if (list) {
      tokens.push(list);
      list = null;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      tokens.push({ type: `h${heading[1].length}`, text: heading[2].trim() });
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      flushParagraph();
      flushList();
      tokens.push({ type: "hr" });
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      flushList();
      tokens.push({ type: "quote", text: trimmed.replace(/^>\s?/, "").trim() });
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      if (list && list.type !== "ul") flushList();
      if (!list) list = { type: "ul", items: [] };
      list.items.push(bullet[1]);
      continue;
    }

    const ordered = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      if (list && list.type !== "ol") flushList();
      if (!list) list = { type: "ol", start: Number(ordered[1]), items: [] };
      list.items.push(ordered[2]);
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return tokens;
}

function renderWechat(markdown) {
  const tokens = parseMarkdown(markdown);
  let html = '<section style="max-width:600px;margin:0 auto;padding:0;background-color:#FAF7F2;">\n';
  html += '<section style="height:6px;background-color:#C0512F;"></section>\n';
  let titleRendered = false;
  let sectionOpen = false;

  function closeSection() {
    if (sectionOpen) {
      html += "</section>\n";
      sectionOpen = false;
    }
  }

  for (const token of tokens) {
    if (token.type === "h1") {
      closeSection();
      html += '<section style="padding:48px 24px 36px 24px;">\n';
      html += `<h1 style="font-family:'Noto Serif SC',Georgia,serif;font-size:28px;font-weight:600;color:#1A1A1A;line-height:1.5;margin:0 0 16px 0;letter-spacing:1px;">${inlineMarkdown(token.text)}</h1>\n`;
      html += "</section>\n";
      html += '<section style="margin:0 24px;height:1px;background-color:#E0D8CE;"></section>\n';
      titleRendered = true;
      continue;
    }

    if (!titleRendered) {
      html += '<section style="padding:48px 24px 36px 24px;">\n';
      html += '<h1 style="font-family:\'Noto Serif SC\',Georgia,serif;font-size:28px;font-weight:600;color:#1A1A1A;line-height:1.5;margin:0 0 16px 0;letter-spacing:1px;">未命名文章</h1>\n';
      html += "</section>\n";
      titleRendered = true;
    }

    if (token.type === "h2") {
      closeSection();
      html += '<section style="margin:32px 24px 24px 24px;padding:28px 24px;background-color:#FDF8F3;border-left:4px solid #C0512F;">\n';
      html += `<p style="font-family:'Noto Serif SC',Georgia,serif;font-size:20px;color:#1A1A1A;line-height:1.5;margin:0;font-weight:600;">${inlineMarkdown(token.text)}</p>\n`;
      html += "</section>\n";
      continue;
    }

    if (token.type === "h3") {
      closeSection();
      html += '<section style="padding:0 24px 20px 24px;">\n';
      html += `<p style="font-family:'Noto Serif SC',Georgia,serif;font-size:17px;color:#C0512F;line-height:1.6;margin:0 0 12px 0;font-weight:600;">${inlineMarkdown(token.text)}</p>\n`;
      sectionOpen = true;
      continue;
    }

    if (token.type === "hr") {
      closeSection();
      html += '<section style="margin:0 24px 32px 24px;height:2px;background-color:#C0512F;opacity:0.3;"></section>\n';
      continue;
    }

    if (token.type === "quote") {
      closeSection();
      html += '<section style="margin:8px 24px 24px 24px;padding:24px;background-color:#F3EDE5;border-left:4px solid #C0512F;">\n';
      html += `<p style="font-family:'Noto Serif SC',Georgia,serif;font-size:17px;color:#C0512F;line-height:1.8;margin:0;font-weight:600;">${inlineMarkdown(token.text)}</p>\n`;
      html += "</section>\n";
      continue;
    }

    if (!sectionOpen) {
      html += '<section style="padding:0 24px 20px 24px;">\n';
      sectionOpen = true;
    }

    if (token.type === "p") {
      html += `<p style="font-family:'Noto Serif SC',Georgia,serif;font-size:16px;color:#333333;line-height:2;margin:0 0 20px 0;">${inlineMarkdown(token.text).replace(/\n/g, "<br>")}</p>\n`;
    } else if (token.type === "ul") {
      html += '<ul style="font-family:\'Noto Serif SC\',Georgia,serif;font-size:16px;color:#333333;line-height:2;margin:0 0 20px 20px;padding:0;">\n';
      for (const item of token.items) {
        html += `<li style="margin:0 0 8px 0;">${inlineMarkdown(item)}</li>\n`;
      }
      html += "</ul>\n";
    } else if (token.type === "ol") {
      const start = Number.isFinite(token.start) ? token.start : 1;
      token.items.forEach((item, index) => {
        const number = start + index;
        html += `<p style="font-family:'Noto Serif SC',Georgia,serif;font-size:16px;color:#333333;line-height:2;margin:0 0 12px 0;padding-left:30px;text-indent:-30px;"><span style="font-weight:600;color:#333333;">${number}. </span>${inlineMarkdown(item)}</p>\n`;
      });
    }
  }

  closeSection();
  html += "</section>\n";
  return html;
}

function newRun(opts) {
  const title = requireOption(opts, "title");
  const persona = requireOption(opts, "persona");
  const outRoot = opts["out-root"] ? path.resolve(String(opts["out-root"])) : path.resolve("写作产出");
  const runDir = path.join(outRoot, `${timestampSlug()}-${slugify(title)}`);
  ensureDir(path.join(runDir, "xhs", "cards"));
  const meta = [
    `title: "${title.replace(/"/g, '\\"')}"`,
    `persona: "${persona.replace(/"/g, '\\"')}"`,
    `created_at: "${todayDate()}"`,
    'status: "draft"',
    "",
  ].join("\n");
  writeText(path.join(runDir, "meta.yaml"), meta);
  for (const name of ["选题.md", "素材.md", "初稿.md", "事实核查.md", "审稿.md", "定稿.md"]) {
    writeText(path.join(runDir, name), `# ${name.replace(".md", "")}\n\n`);
  }
  writeText(path.join(runDir, "xhs", "cards.json"), JSON.stringify({ theme: "classic", cards: [] }, null, 2) + "\n");
  console.log(runDir);
}

function validatePersona(opts) {
  const personaDir = path.resolve(requireOption(opts, "persona-dir"));
  const missing = [];
  const present = [];
  for (const file of REQUIRED_PERSONA_FILES) {
    const target = path.join(personaDir, file);
    if (fs.existsSync(target) && fs.statSync(target).isFile()) {
      const size = fs.statSync(target).size;
      present.push({ file, size });
      if (size === 0) missing.push(`${file} is empty`);
    } else {
      missing.push(file);
    }
  }
  const result = {
    personaDir,
    ok: missing.length === 0,
    present,
    missing,
  };
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

function importPersona(opts) {
  const source = path.resolve(requireOption(opts, "source"));
  const name = requireOption(opts, "name");
  const description = String(opts.description || "本地写作画像");
  const outRoot = opts["out-root"] ? path.resolve(String(opts["out-root"])) : path.resolve("写作人设");
  const target = path.join(outRoot, name);
  ensureDir(target);

  for (const file of STYLE_FILES) {
    const src = path.join(source, file);
    const dest = path.join(target, file);
    if (fs.existsSync(src)) {
      copyFile(src, dest);
    } else {
      writeText(dest, `# ${file.replace(".md", "")}\n\n待补充：源目录中未找到 ${file}。请读取参考资料后补齐这一维度，保持内容为可复用写作规则。\n`);
    }
  }

  writeText(path.join(target, "persona.yaml"), [
    `name: "${name.replace(/"/g, '\\"')}"`,
    'role: "写作画像"',
    `description: "${description.replace(/"/g, '\\"')}"`,
    `created_at: "${todayDate()}"`,
    `updated_at: "${todayDate()}"`,
    'source_language: "zh-CN"',
    'reference_policy: "local-first"',
    "style_files:",
    ...STYLE_FILES.map((file) => `  - "${file}"`),
    "",
  ].join("\n"));

  const references = [
    "# References",
    "",
    `- ${source}`,
    `  - date_read: ${todayDate()}`,
    "  - note: Imported as seed persona source.",
    "",
  ].join("\n");
  writeText(path.join(target, "references.md"), references);
  console.log(target);
}

function renderWechatCommand(opts) {
  const input = path.resolve(requireOption(opts, "input"));
  const output = path.resolve(requireOption(opts, "output"));
  const html = renderWechat(readText(input));
  writeText(output, html);
  console.log(output);
}

function loadPlaywright() {
  try {
    return require("playwright");
  } catch (error) {
    return require(path.join(BUNDLE_NODE_MODULES, "playwright"));
  }
}

async function launchChromium(chromium) {
  const errors = [];
  try {
    return await chromium.launch({ headless: true });
  } catch (firstError) {
    errors.push(`bundled: ${firstError.message}`);
    const candidates = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    ];
    for (const executablePath of candidates) {
      if (!fs.existsSync(executablePath)) continue;
      try {
        return await chromium.launch({ headless: true, executablePath });
      } catch (candidateError) {
        errors.push(`${executablePath}: ${candidateError.message}`);
      }
    }
    try {
      return await chromium.launch({ headless: true, channel: "chrome" });
    } catch (channelError) {
      errors.push(`channel chrome: ${channelError.message}`);
      throw new Error(`Unable to launch Chromium or installed Chrome.\n${errors.join("\n")}`);
    }
  }
}

function normalizeLines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function titleSize(title, hasItems) {
  const longest = normalizeLines(title).reduce((max, line) => Math.max(max, line.length), 0);
  if (hasItems) return longest > 9 ? 58 : 66;
  if (longest > 9) return 68;
  if (longest > 6) return 76;
  return 84;
}

function renderCardHtml(card, index, total) {
  const items = Array.isArray(card.items) ? card.items : [];
  const titleLines = normalizeLines(card.title);
  const subtitleLines = normalizeLines(card.subtitle);
  const size = titleSize(card.title, items.length > 0);
  const titleHtml = titleLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("");
  const subtitleHtml = subtitleLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("");
  const itemHtml = items.map((item, idx) => `
    <div class="item ${idx === items.length - 1 ? "last" : ""}">
      <div class="label">${escapeHtml(item.label || `${idx + 1}.`)}</div>
      <div class="item-body">
        <div class="item-title">${escapeHtml(item.title || "")}</div>
        <div class="item-text">${escapeHtml(item.body || "")}</div>
      </div>
    </div>
  `).join("");
  const footer = card.footerTitle ? `
    <div class="footer">
      <div class="footer-label">${escapeHtml(card.footerLabel || `${index + 1}/${total}`)}</div>
      <div class="footer-title">${escapeHtml(card.footerTitle)}</div>
    </div>
  ` : "";
  const quote = card.quote ? `<div class="quote">${escapeHtml(card.quote)}</div>` : "";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  html, body { width: 1080px; height: 1440px; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif;
    color: #171917;
    background: #FAF7F2;
  }
  .card {
    position: relative;
    width: 1080px;
    height: 1440px;
    overflow: hidden;
    padding: 96px 90px 86px 90px;
    background:
      linear-gradient(180deg, #C0512F 0, #C0512F 7px, transparent 7px),
      #FAF7F2;
  }
  .kicker {
    position: absolute;
    top: 96px;
    right: 90px;
    max-width: 520px;
    text-align: right;
    color: #7D7B76;
    font-size: 25px;
    letter-spacing: 8px;
    font-weight: 400;
  }
  .main { padding-top: ${items.length ? "76px" : "170px"}; }
  .title {
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: #151714;
    font-size: ${size}px;
    line-height: 1.18;
    font-weight: 800;
    letter-spacing: 0;
    margin: 0 0 34px 0;
  }
  .subtitle {
    display: flex;
    flex-direction: column;
    gap: 10px;
    color: #777772;
    font-size: 31px;
    line-height: 1.55;
    font-weight: 300;
    margin-bottom: 52px;
  }
  .rule {
    width: 64px;
    height: 3px;
    background: #B25A41;
    margin: 0 0 52px 0;
  }
  .items { margin-top: 8px; }
  .item {
    display: grid;
    grid-template-columns: 82px 1fr;
    gap: 0;
    padding: 0 0 42px 0;
    margin-bottom: 42px;
    border-bottom: 1px solid rgba(74, 68, 60, 0.12);
  }
  .item.last { border-bottom: 0; margin-bottom: 0; }
  .label {
    color: #B25A41;
    font-size: 33px;
    line-height: 1;
    font-family: Georgia, serif;
    font-style: italic;
  }
  .item-title {
    color: #181A17;
    font-size: 36px;
    line-height: 1.25;
    font-weight: 800;
    margin-bottom: 18px;
  }
  .item-text {
    color: #8A8780;
    font-size: 28px;
    line-height: 1.72;
    font-weight: 300;
  }
  .quote {
    position: absolute;
    left: 90px;
    right: 90px;
    bottom: 128px;
    border-left: 4px solid #B25A41;
    padding-left: 32px;
    color: #B25A41;
    font-size: 32px;
    line-height: 1.7;
    font-weight: 700;
  }
  .footer {
    position: absolute;
    left: 90px;
    right: 90px;
    bottom: 84px;
    border-left: 4px solid #B25A41;
    padding-left: 32px;
  }
  .footer-label {
    color: #8E8A82;
    font-size: 26px;
    letter-spacing: 9px;
    margin-bottom: 12px;
  }
  .footer-title {
    color: #161814;
    font-size: 34px;
    line-height: 1.35;
    font-weight: 800;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="kicker">${escapeHtml(card.kicker || `${index + 1}/${total}`)}</div>
    <main class="main">
      <h1 class="title">${titleHtml}</h1>
      ${subtitleHtml ? `<div class="subtitle">${subtitleHtml}</div>` : ""}
      <div class="rule"></div>
      ${itemHtml ? `<section class="items">${itemHtml}</section>` : ""}
    </main>
    ${quote}
    ${footer}
  </div>
</body>
</html>`;
}

async function renderXhs(opts) {
  const cardsFile = path.resolve(requireOption(opts, "cards"));
  const outDir = path.resolve(requireOption(opts, "out-dir"));
  const strict = Boolean(opts.strict);
  const data = JSON.parse(readText(cardsFile));
  const cards = Array.isArray(data.cards) ? data.cards : [];
  if (!cards.length) throw new Error("cards.json must contain a non-empty cards array");
  ensureDir(outDir);

  const { chromium } = loadPlaywright();
  const browser = await launchChromium(chromium);
  const page = await browser.newPage({ viewport: { width: 1080, height: 1440 }, deviceScaleFactor: 1 });
  const qa = [];

  try {
    for (let i = 0; i < cards.length; i += 1) {
      const html = renderCardHtml(cards[i], i, cards.length);
      await page.setContent(html, { waitUntil: "load" });
      const metrics = await page.evaluate(() => {
        const card = document.querySelector(".card");
        return {
          bodyScrollWidth: document.body.scrollWidth,
          bodyScrollHeight: document.body.scrollHeight,
          cardScrollWidth: card.scrollWidth,
          cardScrollHeight: card.scrollHeight,
          cardClientWidth: card.clientWidth,
          cardClientHeight: card.clientHeight,
        };
      });
      const overflow = metrics.bodyScrollWidth > 1080 || metrics.bodyScrollHeight > 1440 || metrics.cardScrollHeight > 1440;
      const filename = `${String(i + 1).padStart(2, "0")}.jpg`;
      const output = path.join(outDir, filename);
      await page.screenshot({ path: output, type: "jpeg", quality: 94, clip: { x: 0, y: 0, width: 1080, height: 1440 } });
      qa.push({ file: output, width: 1080, height: 1440, overflow, metrics });
    }
  } finally {
    await browser.close();
  }

  writeText(path.join(outDir, "qa-report.json"), JSON.stringify(qa, null, 2) + "\n");
  const overflowing = qa.filter((item) => item.overflow);
  if (overflowing.length) {
    console.error(`Overflow detected in ${overflowing.length} card(s). See ${path.join(outDir, "qa-report.json")}`);
    if (strict) process.exitCode = 1;
  }
  console.log(outDir);
}

async function main() {
  const { command, opts } = parseArgs(process.argv);
  if (!command || command === "help" || command === "--help") {
    usage();
    return;
  }
  if (command === "new-run") return newRun(opts);
  if (command === "import-persona") return importPersona(opts);
  if (command === "validate-persona") return validatePersona(opts);
  if (command === "render-wechat") return renderWechatCommand(opts);
  if (command === "render-xhs") return renderXhs(opts);
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
