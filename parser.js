import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

/**
 * Known workspace files the converter can produce.
 * Includes top-level files and the skills/ pattern.
 */
const TOP_LEVEL_FILES = [
  "SOUL.md",
  "IDENTITY.md",
  "AGENTS.md",
  "USER.md",
  "TOOLS.md",
  "HEARTBEAT.md",
  "MEMORY.md",
  "BOOTSTRAP.md",
  "SETUP.md",
];

/**
 * Parse the converter's LLM response into individual files.
 * Looks for file path headers like:
 *   ### path/to/FILE.md
 *   ## path/to/FILE.md
 *   **path/to/FILE.md**
 *   `path/to/FILE.md`
 *   --- path/to/FILE.md ---
 *
 * Returns an array of { path, content } objects.
 */
export function parseConverterResponse(text, agentId) {
  const files = [];

  // Pattern: lines that look like file path headers
  // Matches: ### agent-id/SOUL.md, **agent-id/SOUL.md**, `agent-id/SOUL.md`, etc.
  const headerPattern = new RegExp(
    `^(?:#{1,4}\\s+)?(?:\\*\\*|` + "`" + `|---\\s*)?` +
    `(?:[a-z0-9][a-z0-9-]*/)?` +
    `((?:skills/[\\w-]+/)?(?:SKILL|SOUL|IDENTITY|AGENTS|USER|TOOLS|HEARTBEAT|MEMORY|BOOTSTRAP|SETUP)\\.md)` +
    `(?:\\*\\*|` + "`" + `|\\s*---)?\\s*$`,
    "im"
  );

  // Split on file headers, keeping the header
  const lines = text.split("\n");
  let currentPath = null;
  let currentContent = [];

  for (const line of lines) {
    const match = line.match(headerPattern);
    if (match) {
      // Save previous file
      if (currentPath) {
        files.push({ path: currentPath, content: cleanContent(currentContent.join("\n")) });
      }
      currentPath = match[1];
      currentContent = [];
    } else if (currentPath) {
      currentContent.push(line);
    }
  }

  // Save last file
  if (currentPath) {
    files.push({ path: currentPath, content: cleanContent(currentContent.join("\n")) });
  }

  return files;
}

/**
 * Clean extracted content: strip leading/trailing code fences and whitespace.
 */
function cleanContent(text) {
  let cleaned = text.trim();

  // Remove wrapping ```markdown ... ``` or ``` ... ```
  // For the last file, LLM may append commentary after the closing fence,
  // so we strip everything from the last ``` onward.
  if (/^```\w*\s*\n/.test(cleaned)) {
    cleaned = cleaned.replace(/^```\w*\s*\n/, "");
    cleaned = cleaned.replace(/\n```[\s\S]*$/, "");
  }

  // Remove trailing --- separators (LLM adds these between files)
  cleaned = cleaned.replace(/\n---\s*$/, "").trim();

  return cleaned.trim();
}

/**
 * Write parsed files to disk under the output directory.
 */
export function writeWorkspace(outputDir, parsedFiles) {
  const written = [];

  for (const { path, content } of parsedFiles) {
    if (!content) continue;

    const fullPath = join(outputDir, path);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, content, "utf-8");
    written.push(path);
  }

  return written;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
