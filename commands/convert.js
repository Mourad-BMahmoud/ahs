import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { callLLM } from "../llm.js";
import { parseConverterResponse, writeWorkspace } from "../parser.js";

export async function runConvert(ahsJsonPath, opts) {
  const cwd = process.cwd();
  const resolvedAhs = resolve(ahsJsonPath);

  if (!existsSync(resolvedAhs)) {
    console.error(`File not found: ${resolvedAhs}`);
    process.exit(1);
  }

  // Load and validate AHS JSON
  let ahsData;
  try {
    ahsData = JSON.parse(readFileSync(resolvedAhs, "utf-8"));
  } catch (err) {
    console.error(`Invalid JSON in ${resolvedAhs}: ${err.message}`);
    process.exit(1);
  }

  const prefilled = ahsData.prefilled || ahsData;
  const jobTitle = prefilled["1.1"];
  if (!jobTitle) {
    console.error("Field 1.1 (Job Title) is required. Fill it in ahs.json first.");
    process.exit(1);
  }

  // Derive agent-id
  const agentId = jobTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Load converter prompt
  const converterPath = join(import.meta.dirname, "..", "CONVERTER_PROMPT_v2.md");
  if (!existsSync(converterPath)) {
    console.error("CONVERTER_PROMPT_v2.md not found alongside the CLI.");
    process.exit(1);
  }
  const systemPrompt = readFileSync(converterPath, "utf-8");

  // Build user message: AHS data + attachment manifest
  let userMessage = `# Completed AHS Data\n\n\`\`\`json\n${JSON.stringify(prefilled, null, 2)}\n\`\`\`\n`;

  // Handle --attach for reference files
  if (opts.attach) {
    const attachDir = resolve(opts.attach);
    if (!existsSync(attachDir)) {
      console.error(`Attach directory not found: ${attachDir}`);
      process.exit(1);
    }
    userMessage += `\n# Attachment Manifest\n\nThe following files are available in the references directory:\n`;
    const files = listFilesRecursive(attachDir);
    for (const f of files) {
      userMessage += `- ${f}\n`;
    }
  }

  console.log(`Agent ID: ${agentId}`);
  console.log("Sending to LLM for workspace generation...");

  let response;
  try {
    response = await callLLM(systemPrompt, userMessage, 16000);
  } catch (err) {
    console.error(`LLM error: ${err.message}`);
    if (opts.debug) {
      writeFileSync(join(cwd, ".ahs-debug.txt"), String(err), "utf-8");
      console.error("Debug info written to .ahs-debug.txt");
    }
    process.exit(1);
  }

  if (opts.debug) {
    writeFileSync(join(cwd, ".ahs-debug.txt"), response, "utf-8");
    console.log("Raw response written to .ahs-debug.txt");
  }

  // Parse response into files
  const parsedFiles = parseConverterResponse(response, agentId);

  if (parsedFiles.length === 0) {
    console.error("No files could be parsed from the LLM response.");
    console.error("The converter may have returned an unexpected format.");
    if (!opts.debug) {
      console.error("Re-run with --debug to see the raw response.");
    }
    process.exit(1);
  }

  // Write workspace
  const outputDir = join(cwd, agentId);
  mkdirSync(outputDir, { recursive: true });
  const written = writeWorkspace(outputDir, parsedFiles);

  // Copy INSTALL_v3.md as INSTALL.md
  const installSrc = join(import.meta.dirname, "..", "INSTALL_v3.md");
  if (existsSync(installSrc)) {
    copyFileSync(installSrc, join(outputDir, "INSTALL.md"));
    written.push("INSTALL.md");
  }

  // Copy reference files -- explicit --attach flag or auto-detect attachments/ dir
  const attachDir = opts.attach
    ? resolve(opts.attach)
    : existsSync(join(cwd, "attachments")) ? join(cwd, "attachments") : null;

  if (attachDir && existsSync(attachDir)) {
    copyReferences(attachDir, outputDir, prefilled);
    console.log(`Reference files bundled from: ${attachDir}`);
  }

  console.log(`\nWorkspace created: ${outputDir}/`);
  console.log(`Files written:`);
  for (const f of written) {
    console.log(`  ${f}`);
  }

  // Check for missing expected files
  const expectedTop = ["SOUL.md", "IDENTITY.md", "AGENTS.md", "USER.md", "TOOLS.md",
    "HEARTBEAT.md", "MEMORY.md", "BOOTSTRAP.md", "SETUP.md"];
  const missing = expectedTop.filter(f => !written.includes(f));
  if (missing.length > 0) {
    console.log(`\nWarning: these expected files were not found in the response:`);
    for (const f of missing) {
      console.log(`  ${f}`);
    }
  }

  // Count skill files
  const skillFiles = written.filter(f => f.startsWith("skills/") && f.endsWith("SKILL.md"));
  console.log(`\n${skillFiles.length} skill(s) generated`);
  console.log(`\nNext: review the workspace, then follow INSTALL.md to set up the agent.`);
}

function listFilesRecursive(dir, prefix = "") {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...listFilesRecursive(join(dir, entry.name), rel));
    } else {
      results.push(rel);
    }
  }
  return results;
}

/**
 * Copy reference files into the appropriate skills/{slug}/references/ directories.
 * Uses the skill names from AHS Section 4 to create slug directories.
 */
function copyReferences(attachDir, outputDir, prefilled) {
  const skills = prefilled["4"] || [];
  if (skills.length === 0) return;

  // For simplicity, copy all attached files into each skill's references/ dir.
  // A smarter version would route by AHS field mapping, but that requires
  // the attachment manifest to include field IDs.
  const files = listFilesRecursive(attachDir);
  if (files.length === 0) return;

  for (const skill of skills) {
    const name = skill["4.1"];
    if (!name) continue;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const refDir = join(outputDir, "skills", slug, "references");
    mkdirSync(refDir, { recursive: true });

    for (const f of files) {
      const src = resolve(join(attachDir, f));
      if (!src.startsWith(resolve(attachDir))) continue; // skip path traversal attempts
      const dest = join(refDir, basename(f));
      copyFileSync(src, dest);
    }
  }
}
