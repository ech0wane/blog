#!/usr/bin/env node
/**
 * Pre-generates Python exec block outputs.
 *
 * Scans all markdown files in BLOG_PATH for ```python exec blocks,
 * executes each one via the exec-python.py wrapper, and writes results
 * to a cache file that the remark plugin reads at build time.
 *
 * Usage: node scripts/pregenerate-python.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const BLOG_PATH = path.join(ROOT, "src/data/blog");
const EXEC_SCRIPT = path.join(ROOT, "src/plugins/exec-python.py");
const CACHE_FILE = path.join(ROOT, "src/plugins/.python-exec-cache.json");

function findMarkdownFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(full));
    } else if (entry.name.endsWith(".md")) {
      results.push(full);
    }
  }
  return results;
}

function extractPythonExecBlocks(content) {
  const blocks = [];
  const regex = /```python\s+exec\s*\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    // Remove trailing newline to match what remark sees
    const code = match[1].replace(/\n$/, '');
    blocks.push(code);
  }
  return blocks;
}

function hashCode(code) {
  return createHash("sha256").update(code).digest("hex");
}

function main() {
  let cache = {};
  if (fs.existsSync(CACHE_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    } catch {
      cache = {};
    }
  }

  const files = findMarkdownFiles(BLOG_PATH);
  let totalBlocks = 0;
  let executed = 0;
  let cached = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const blocks = extractPythonExecBlocks(content);

    for (const code of blocks) {
      totalBlocks++;
      const hash = hashCode(code);

      if (cache[hash]) {
        cached++;
        continue;
      }

      console.log(`Executing Python block (${hash.slice(0, 8)}...) from ${path.relative(ROOT, file)}`);

      try {
        const raw = execFileSync("python3", [EXEC_SCRIPT], {
          input: code,
          encoding: "utf-8",
          timeout: 300000, // 5 minutes
          maxBuffer: 50 * 1024 * 1024,
        });

        const marker = "__PYEXEC_RESULT__";
        const markerIdx = raw.indexOf(marker);
        if (markerIdx === -1) {
          cache[hash] = { stdout: "", images: [], error: "No result marker found in output" };
        } else {
          cache[hash] = JSON.parse(raw.slice(markerIdx + marker.length));
        }
      } catch (err) {
        // In sandboxed environments, Node may report EPERM even when execution succeeds
        // Check if stdout contains valid output despite the error
        if (err.stdout && err.stdout.trim()) {
          const marker = "__PYEXEC_RESULT__";
          const markerIdx = err.stdout.indexOf(marker);
          if (markerIdx !== -1) {
            cache[hash] = JSON.parse(err.stdout.slice(markerIdx + marker.length));
            executed++;
            continue;
          }
        }
        
        console.error(`  ⚠ Error executing block: ${err.code || err.message}`);
        cache[hash] = {
          stdout: "",
          images: [],
          error: `${err.code || 'ERROR'}: ${err.stderr || err.message}`,
        };
      }

      executed++;
    }
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  console.log(`\nDone: ${totalBlocks} blocks total, ${executed} executed, ${cached} cached`);
  console.log(`Cache written to ${path.relative(ROOT, CACHE_FILE)}`);
}

main();
