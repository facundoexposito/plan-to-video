#!/usr/bin/env node
// Dependency-free checks for this repo. Run: node scripts/validate.mjs
// Checks every skills/<name>/SKILL.md frontmatter against the Agent Skills rules,
// that files referenced as `references/...` exist, that the plugin manifests parse
// and agree on the name and version, and that no em dash appears in the repo text.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const errors = [];
const fail = (msg) => errors.push(msg);

function parseFrontmatter(text, file) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) {
    fail(`${file}: missing YAML frontmatter between --- lines`);
    return {};
  }
  const out = {};
  const lines = m[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    let [, key, value] = kv;
    if (/^[>|][-+]?$/.test(value)) {
      const block = [];
      while (i + 1 < lines.length && /^\s+\S|^\s*$/.test(lines[i + 1])) block.push(lines[++i].trim());
      value = block.filter(Boolean).join(value.startsWith(">") ? " " : "\n");
    } else {
      value = value.replace(/^["'](.*)["']$/, "$1");
    }
    out[key] = value;
  }
  return out;
}

// 1. Skills
const skillsDir = join(root, "skills");
const skills = existsSync(skillsDir)
  ? readdirSync(skillsDir).filter((d) => statSync(join(skillsDir, d)).isDirectory())
  : [];
if (skills.length === 0) fail("no skill folders under skills/");

for (const dir of skills) {
  const file = join(skillsDir, dir, "SKILL.md");
  const rel = relative(root, file);
  if (!existsSync(file)) {
    fail(`${rel}: missing`);
    continue;
  }
  const text = readFileSync(file, "utf8");
  const fm = parseFrontmatter(text, rel);
  const { name, description } = fm;

  if (!name) fail(`${rel}: frontmatter has no name`);
  else {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) fail(`${rel}: name "${name}" must be lowercase letters, digits and single hyphens`);
    if (name.length > 64) fail(`${rel}: name longer than 64 characters`);
    if (name !== dir) fail(`${rel}: name "${name}" does not match folder "${dir}"`);
    if (/anthropic|claude/.test(name)) fail(`${rel}: name uses a reserved word`);
  }
  if (!description) fail(`${rel}: frontmatter has no description`);
  else {
    if (description.length > 1024) fail(`${rel}: description is ${description.length} characters (max 1024)`);
    if (/[<>]/.test(description)) fail(`${rel}: description contains < or >`);
  }
  const bodyLines = text.split("\n").length;
  if (bodyLines > 500) fail(`${rel}: ${bodyLines} lines (keep SKILL.md under 500)`);

  // Own reference files: every `references/x.md` bullet in the "Reference files" section must exist,
  // and every file in references/ must be listed there. (Mentions of upstream HyperFrames
  // references elsewhere in the body are not checked.)
  const section = text.split(/^## Reference files\s*$/m)[1] || "";
  const listed = new Set(section.match(/references\/[A-Za-z0-9_.-]+\.md/g) || []);
  for (const ref of listed) {
    if (!existsSync(join(skillsDir, dir, ref))) fail(`${rel}: lists ${ref}, which does not exist`);
  }
  const refDir = join(skillsDir, dir, "references");
  if (existsSync(refDir)) {
    for (const f of readdirSync(refDir)) {
      if (!listed.has(`references/${f}`)) fail(`${rel}: references/${f} is not listed under "## Reference files"`);
    }
  }
  console.log(`ok  ${rel}  name=${name}  description=${description?.length ?? 0} chars`);
}

// 2. Plugin manifests
const readJson = (p) => {
  try {
    return JSON.parse(readFileSync(join(root, p), "utf8"));
  } catch (e) {
    fail(`${p}: ${e.message}`);
    return null;
  }
};
const plugin = readJson(".claude-plugin/plugin.json");
const market = readJson(".claude-plugin/marketplace.json");
if (plugin && market) {
  if (!market.name || !market.owner?.name || !Array.isArray(market.plugins)) fail("marketplace.json: needs name, owner.name and plugins");
  const entry = market.plugins?.find((p) => p.name === plugin.name);
  if (!entry) fail(`marketplace.json: no entry named "${plugin.name}" (must match plugin.json)`);
  else if (typeof entry.source === "string" && !entry.source.startsWith("./")) fail("marketplace.json: relative source must start with ./");
  const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");
  if (plugin.version && !changelog.includes(`[${plugin.version}]`)) fail(`CHANGELOG.md: no entry for ${plugin.version}`);
  console.log(`ok  .claude-plugin  plugin=${plugin.name}@${plugin.version}  marketplace=${market.name}`);
}

// 3. No em dashes in tracked text
const walk = (d) =>
  readdirSync(d).flatMap((f) => {
    if ([".git", "node_modules"].includes(f)) return [];
    const p = join(d, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
for (const f of walk(root).filter((p) => /\.(md|json|mjs|js|txt)$|LICENSE$/.test(p))) {
  readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    if (line.includes("\u2014")) fail(`${relative(root, f)}:${i + 1}: em dash`);
  });
}

if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("\nall checks passed");
