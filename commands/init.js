import { writeFileSync, existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { blankAHS } from "../template.js";

export function runInit(cwd) {
  const envPath = join(cwd, ".env");
  const ahsPath = join(cwd, "ahs.json");

  // Create .env from example if it doesn't exist
  if (!existsSync(envPath)) {
    const examplePath = join(import.meta.dirname, "..", ".env.example");
    if (existsSync(examplePath)) {
      copyFileSync(examplePath, envPath);
      console.log("Created .env (edit it with your API key and provider)");
    } else {
      writeFileSync(
        envPath,
        "AHS_PROVIDER=anthropic\nAHS_API_KEY=\nAHS_MODEL=\n",
        "utf-8"
      );
      console.log("Created .env (edit it with your API key and provider)");
    }
  } else {
    console.log(".env already exists, skipping");
  }

  // Create blank ahs.json
  if (!existsSync(ahsPath)) {
    writeFileSync(ahsPath, JSON.stringify(blankAHS(), null, 2), "utf-8");
    console.log("Created ahs.json (blank AHS form)");
  } else {
    console.log("ahs.json already exists, skipping");
  }

  console.log("\nNext steps:");
  console.log("  1. Edit .env with your LLM provider and API key");
  console.log("  2. Run: ahs fill <job-posting.txt>  to pre-fill from a posting");
  console.log("  3. Edit ahs.json to complete the remaining fields");
  console.log("  4. Run: ahs convert ahs.json  to generate the workspace");
}
