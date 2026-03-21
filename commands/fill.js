import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { callLLM } from "../llm.js";
import { extractText } from "../extract.js";

export async function runFill(postingPath, opts) {
  const cwd = process.cwd();
  const ahsPath = join(cwd, "ahs.json");
  const resolvedPosting = resolve(postingPath);

  if (!existsSync(resolvedPosting)) {
    console.error(`File not found: ${resolvedPosting}`);
    process.exit(1);
  }

  let postingText;
  try {
    postingText = (await extractText(resolvedPosting)).trim();
  } catch (err) {
    console.error(`Could not read file: ${err.message}`);
    process.exit(1);
  }
  if (!postingText) {
    console.error("Job posting file is empty.");
    process.exit(1);
  }

  // Load filler prompt
  const fillerPromptPath = join(import.meta.dirname, "..", "FILLER_PROMPT.md");
  if (!existsSync(fillerPromptPath)) {
    console.error("FILLER_PROMPT.md not found alongside the CLI.");
    process.exit(1);
  }
  const systemPrompt = readFileSync(fillerPromptPath, "utf-8");

  console.log(`Reading job posting from ${resolvedPosting}...`);
  console.log("Sending to LLM for extraction...");

  let response;
  try {
    response = await callLLM(systemPrompt, postingText, 8000);
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

  // Extract JSON from the response (may be wrapped in ```json ... ```)
  let parsed;
  try {
    const jsonMatch = response.match(/```json\s*\n([\s\S]*?)\n```/) ||
                      response.match(/(\{[\s\S]*?\})\s*$/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    parsed = JSON.parse(jsonMatch[1]);
  } catch (err) {
    console.error(`Failed to parse LLM response as JSON: ${err.message}`);
    console.error("The LLM may have returned an unexpected format.");
    if (!opts.debug) {
      console.error("Re-run with --debug to see the raw response.");
    }

    // Retry once
    console.log("Retrying...");
    try {
      response = await callLLM(systemPrompt, postingText, 8000);
      const jsonMatch = response.match(/```json\s*\n([\s\S]*?)\n```/) ||
                        response.match(/(\{[\s\S]*?\})\s*$/);
      if (!jsonMatch) throw new Error("No JSON found in retry response");
      parsed = JSON.parse(jsonMatch[1]);
    } catch (retryErr) {
      console.error(`Retry also failed: ${retryErr.message}`);
      if (opts.debug) {
        writeFileSync(join(cwd, ".ahs-debug.txt"), response, "utf-8");
      }
      process.exit(1);
    }
  }

  // Write ahs.json
  writeFileSync(ahsPath, JSON.stringify(parsed, null, 2), "utf-8");

  const filled = parsed.checklist?.filled?.length || 0;
  const needs = parsed.checklist?.needs_human?.length || 0;
  const skills = parsed.prefilled?.["4"]?.length || 0;

  console.log(`\nahs.json written.`);
  console.log(`  ${filled} fields pre-filled from posting`);
  console.log(`  ${skills} skills clustered`);
  console.log(`  ${needs} fields still need your input`);
  console.log(`\nNext: edit ahs.json to fill the remaining fields, then run: ahs convert ahs.json`);
}
