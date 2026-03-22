#!/usr/bin/env node

import { config } from "dotenv";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { Command } from "commander";

// Load .env from cwd first, fall back to package directory
const cwdEnv = join(process.cwd(), ".env");
const pkgEnv = join(import.meta.dirname, "..", ".env");

if (existsSync(cwdEnv)) {
  config({ path: cwdEnv });
} else if (existsSync(pkgEnv)) {
  config({ path: pkgEnv });
}

const program = new Command();

program
  .name("ahs")
  .description("Agent Hiring Standard -- generate OpenClaw workspaces from job postings")
  .version("0.1.0");

program
  .command("init")
  .description("Create a blank .env and ahs.json in the current directory")
  .action(async () => {
    const { runInit } = await import("../commands/init.js");
    runInit(process.cwd());
  });

program
  .command("fill <posting>")
  .description("Pre-fill ahs.json from a job posting (.txt, .md, .pdf, .docx)")
  .option("--debug", "Write raw LLM response to .ahs-debug.txt")
  .action(async (posting, opts) => {
    const { runFill } = await import("../commands/fill.js");
    await runFill(posting, opts);
  });

program
  .command("convert <ahs-json>")
  .description("Generate an OpenClaw workspace from a completed ahs.json")
  .option("--attach <dir>", "Directory of reference files to include")
  .option("--debug", "Write raw LLM response to .ahs-debug.txt")
  .action(async (ahsJson, opts) => {
    const { runConvert } = await import("../commands/convert.js");
    await runConvert(ahsJson, opts);
  });

program
  .command("form")
  .description("Open the AHS web form in your browser")
  .option("--port <number>", "Port to serve on", "3000")
  .action(async (opts) => {
    const { runForm } = await import("../commands/form.js");
    runForm(opts);
  });

program.parse();
