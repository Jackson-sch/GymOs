import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = ["src/app", "src/components"];

function walk(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  const results = [];
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(rel));
    } else if (/\.(tsx|jsx)$/.test(entry.name) && !/PDF/i.test(entry.name)) {
      results.push(rel.replace(/\\/g, "/"));
    }
  }
  return results;
}

function getModuleName(filePath) {
  const parts = filePath.split("/");
  if (parts[1] === "app") {
    if (parts[2]?.startsWith("(")) {
      return `${parts[2]}/${parts[3] || "root"}`;
    }
    return `app/${parts[2] || "root"}`;
  }
  if (parts[1] === "components") {
    return `components/${parts[2] || "root"}`;
  }
  return "other";
}

function auditFile(filePath) {
  const content = fs.readFileSync(path.join(ROOT, filePath), "utf8");
  const lines = content.split("\n");
  const issues = [];

  lines.forEach((line, i) => {
    const lineNum = i + 1;

    // 1. Multi-column grids (>=3 cols) without responsive prefix or grid-cols-1
    // Allow intentional 7-day calendar/heatmap grids inside overflow-x-auto, and numeric keypads
    const contextBeforeGrid = lines.slice(Math.max(0, i - 30), i + 1).join(" ");
    const gridMatch = line.match(/(?<![:\w-])grid-cols-([3-9]|1[0-2])\b/);
    const isScrollableCalendar = gridMatch?.[1] === "7" && /overflow-x-auto/.test(contextBeforeGrid);
    const isKeypad = /Keypad/i.test(contextBeforeGrid);
    if (gridMatch && !isScrollableCalendar && !isKeypad && !/grid-cols-[12]\b/.test(line) && !/(sm|md|lg|xl):grid-cols-/.test(line)) {
      issues.push({
        line: lineNum,
        rule: "non-stacking-grid",
        severity: "high",
        detail: `Unresponsive grid-cols-${gridMatch[1]} without mobile column fallback (grid-cols-1 sm:grid-cols-...)`,
      });
    }

    // 2. Large fixed pixel widths >= 320px without responsive prefix, max-w-full, or overflow-x-auto parent
    const fixedWidthMatch = line.match(/(?<![:\w-])(w|min-w)-\[(\d+)px\]/);
    if (fixedWidthMatch && Number(fixedWidthMatch[2]) >= 320 && !/max-w-full/.test(line) && !/overflow-x-auto/.test(contextBeforeGrid)) {
      issues.push({
        line: lineNum,
        rule: "large-fixed-width",
        severity: "high",
        detail: `Fixed width ${fixedWidthMatch[0]} may overflow <360px viewports without max-w-full or sm:/md: prefix`,
      });
    }

    // 3. Oversized headings without smaller mobile base size
    const headingMatch = line.match(/(?<![:\w-])text-(4xl|5xl|6xl|7xl)\b/);
    if (headingMatch && !/(?<![:\w-])text-(lg|xl|2xl|3xl)\b/.test(line)) {
      issues.push({
        line: lineNum,
        rule: "unscaled-heading",
        severity: "medium",
        detail: `Large heading text-${headingMatch[1]} without smaller mobile base (e.g., text-2xl sm:text-${headingMatch[1]})`,
      });
    }

    // 4. Wide DialogContent without max-h-[90vh] or overflow-y-auto
    if (/DialogContent/.test(line) && /max-w-(2xl|3xl|4xl|5xl)/.test(line)) {
      const windowText = lines.slice(i, i + 4).join(" ");
      if (!/overflow-y-auto|overflow-hidden/.test(windowText)) {
        issues.push({
          line: lineNum,
          rule: "modal-overflow",
          severity: "high",
          detail: `Wide DialogContent without max-h-[90vh] and overflow handling for small screens`,
        });
      }
    }

    // 5. Table without overflow-x-auto wrapper nearby (ignore react-email templates)
    if (!filePath.startsWith("src/components/emails/") && /<Table\b|<table\b/.test(line)) {
      const contextBefore = lines.slice(Math.max(0, i - 6), i + 1).join(" ");
      if (!/overflow-x-auto|overflow-auto/.test(contextBefore)) {
        issues.push({
          line: lineNum,
          rule: "table-no-scroll",
          severity: "high",
          detail: `<Table> missing parent overflow-x-auto wrapper for mobile horizontal scroll`,
        });
      }
    }

    // 6. Excessive horizontal padding on mobile (p-8, p-10, p-12, px-10, px-12 without mobile p-4/p-6)
    const padMatch = line.match(/(?<![:\w-])(p|px)-(8|10|12|16)\b/);
    if (padMatch && !/(?<![:\w-])(p|px)-(2|3|4|5|6)\b/.test(line) && !/(sm|md|lg):(p|px)-/.test(line)) {
      issues.push({
        line: lineNum,
        rule: "large-mobile-padding",
        severity: "low",
        detail: `Large ${padMatch[0]} on mobile without smaller base (e.g., p-4 sm:${padMatch[0]})`,
      });
    }
  });

  return issues;
}

const files = TARGET_DIRS.flatMap(walk);
const byModule = new Map();

for (const file of files) {
  const issues = auditFile(file);
  if (issues.length === 0) continue;
  const mod = getModuleName(file);
  if (!byModule.has(mod)) byModule.set(mod, []);
  byModule.get(mod).push({ file, issues });
}

const summary = [];
let totalHigh = 0;
let totalMed = 0;
let totalLow = 0;

for (const [mod, entries] of [...byModule.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  let high = 0;
  let med = 0;
  let low = 0;
  for (const e of entries) {
    for (const iss of e.issues) {
      if (iss.severity === "high") high++;
      else if (iss.severity === "medium") med++;
      else low++;
    }
  }
  totalHigh += high;
  totalMed += med;
  totalLow += low;
  summary.push({ module: mod, files: entries.length, high, med, low, entries });
}

console.log("=== GYM-OS RESPONSIVE AUDIT REPORT ===");
console.log(`Scanned ${files.length} TSX/JSX files across ${byModule.size} modules with findings.`);
console.log(`Totals -> HIGH: ${totalHigh} | MEDIUM: ${totalMed} | LOW: ${totalLow}\n`);

for (const item of summary) {
  console.log(`[${item.module}] (files: ${item.files}, H:${item.high} M:${item.med} L:${item.low})`);
  for (const e of item.entries) {
    for (const iss of e.issues) {
      console.log(`  - ${e.file}:${iss.line} [${iss.severity.toUpperCase()}] (${iss.rule}) ${iss.detail}`);
    }
  }
}
