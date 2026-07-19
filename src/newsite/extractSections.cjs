/**
 * Extract section HTML fragments from strategyBody.html into sections/*.html
 * Preserves exact UTF-8 content. Does not modify strategyBody.html.
 *
 * Usage: node src/newsite/extractSections.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SOURCE = path.join(ROOT, "strategyBody.html");
const OUT_DIR = path.join(ROOT, "sections");

/**
 * Find the start index of an opening tag that has id="…" (or class for mobile-dock).
 * Returns { start, tagName } or null.
 */
function findElementStart(html, selector) {
  let re;
  if (selector.startsWith("#")) {
    const id = selector.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    re = new RegExp(`<(?<tag>[a-zA-Z][\\w-]*)\\b[^>]*\\bid=["']${id}["'][^>]*>`, "i");
  } else if (selector.startsWith(".")) {
    const cls = selector.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    re = new RegExp(
      `<(?<tag>[a-zA-Z][\\w-]*)\\b[^>]*\\bclass=["'][^"']*\\b${cls}\\b[^"']*["'][^>]*>`,
      "i"
    );
  } else {
    throw new Error(`Unsupported selector: ${selector}`);
  }
  const m = re.exec(html);
  if (!m) return null;
  return { start: m.index, tagName: m.groups.tag.toLowerCase(), openEnd: m.index + m[0].length };
}

/**
 * Extract a full element from html starting at `start`, balancing nested same-tag names.
 * Handles void-ish self-closing within the slice via depth counting of open/close tags.
 */
function extractElement(html, start, tagName) {
  const slice = html.slice(start);
  const tokenRe = new RegExp(`<(/)?${tagName}\\b([^>]*)>`, "gi");
  let depth = 0;
  let match;
  let end = -1;
  while ((match = tokenRe.exec(slice)) !== null) {
    const isClose = Boolean(match[1]);
    const attrs = match[2] || "";
    const selfClosing = /\/\s*$/.test(attrs);
    if (isClose) {
      depth -= 1;
      if (depth === 0) {
        end = start + match.index + match[0].length;
        break;
      }
    } else if (selfClosing) {
      if (depth === 0) {
        // opening was self-closing — rare for section
        end = start + match.index + match[0].length;
        break;
      }
      // nested self-close does not change depth
    } else {
      depth += 1;
    }
  }

  if (end < 0) {
    throw new Error(`Unclosed <${tagName}> starting at index ${start}`);
  }
  return html.slice(start, end);
}

function extractBySelector(html, selector) {
  const found = findElementStart(html, selector);
  if (!found) throw new Error(`Not found: ${selector}`);
  return extractElement(html, found.start, found.tagName);
}

function joinFragments(parts) {
  return parts.join("\n");
}

function writeUtf8(filePath, content) {
  // Normalize to LF endings as in source reads; keep exact body bytes for Korean
  fs.writeFileSync(filePath, content, "utf8");
  const bytes = Buffer.byteLength(content, "utf8");
  return bytes;
}

function main() {
  const html = fs.readFileSync(SOURCE, "utf8");
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const homeHero = extractBySelector(html, "#home");
  const integratedStrategy = extractBySelector(html, "#integrated-strategy");
  const lifeStage = extractBySelector(html, "#life-stage");
  const quickDesign = extractBySelector(html, "#quick-design");
  const actionLog = extractBySelector(html, "#action-log");
  const library = extractBySelector(html, "#library");
  const todayQuest = extractBySelector(html, "#today-quest");
  const survey = extractBySelector(html, "#survey");
  const result = extractBySelector(html, "#result");

  const opsParts = [
    extractBySelector(html, "#ops-tools"),
    extractBySelector(html, "#ai-hub"),
    extractBySelector(html, "#team"),
    extractBySelector(html, "#idea-lab"),
    extractBySelector(html, "#strategy"),
    extractBySelector(html, "#small-proposal"),
    extractBySelector(html, "#institution"),
  ];

  const chromeParts = [
    extractBySelector(html, ".mobile-dock"),
    extractBySelector(html, "#adminDrawer"),
    extractBySelector(html, "#toast"),
  ];

  const outputs = {
    "homeHero.html": homeHero,
    "integratedStrategy.html": integratedStrategy,
    "lifeStage.html": lifeStage,
    "quickDesign.html": quickDesign,
    "actionLog.html": actionLog,
    "library.html": library,
    "opsTools.html": joinFragments(opsParts),
    "survey.html": joinFragments([survey, result]),
    "todayQuest.html": todayQuest,
    "sharedChrome.html": joinFragments(chromeParts),
  };

  // Sanity checks
  if (!library.includes('id="dawonLibraryRoot"')) {
    throw new Error("library.html missing dawonLibraryRoot");
  }
  if (!integratedStrategy.includes("alliance-canvas")) {
    throw new Error("integratedStrategy missing nested alliance-canvas");
  }
  if (!lifeStage.includes("stage-shell")) {
    throw new Error("lifeStage missing stage-shell");
  }

  const report = [];
  for (const [name, content] of Object.entries(outputs)) {
    const dest = path.join(OUT_DIR, name);
    const bytes = writeUtf8(dest, content);
    report.push({ name, path: dest, bytes, chars: content.length });
  }

  console.log("Extracted sections from strategyBody.html → sections/");
  for (const r of report) {
    const kb = (r.bytes / 1024).toFixed(1);
    console.log(`  ${r.name.padEnd(28)} ${String(r.bytes).padStart(6)} bytes (~${kb} KB)`);
  }
  console.log(`Wrote ${report.length} files.`);
}

main();
