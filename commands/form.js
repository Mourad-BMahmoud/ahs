import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { join, extname, resolve, normalize, basename } from "node:path";
import { execSync } from "node:child_process";
import { blankAHS } from "../template.js";
import { callLLM } from "../llm.js";
import { parseConverterResponse, writeWorkspace } from "../parser.js";

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};

const MAX_BODY = 5 * 1024 * 1024; // 5MB

/** Read a POST body with size limit. Rejects if too large. */
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) { req.destroy(); reject(new Error("Request body too large")); return; }
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

export function runForm(opts) {
  const cwd = process.cwd();
  const port = parseInt(opts.port) || 3000;
  const uiDir = resolve(join(import.meta.dirname, "..", "ui"));
  const ahsPath = join(cwd, "ahs.json");

  const server = createServer(async (req, res) => {
    try {
      // API: load ahs.json
      if (req.method === "GET" && req.url === "/api/ahs") {
        res.setHeader("Content-Type", "application/json");
        if (existsSync(ahsPath)) {
          res.end(readFileSync(ahsPath, "utf-8"));
        } else {
          res.end(JSON.stringify(blankAHS()));
        }
        return;
      }

      // API: save LLM config to .env
      if (req.method === "POST" && req.url === "/api/config") {
        const body = await readBody(req, MAX_BODY);
        const { provider, apiKey } = JSON.parse(body);
        if (!provider || !apiKey) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Provider and API key are required." }));
          return;
        }
        const envPath = join(cwd, ".env");
        const envContent = `AHS_PROVIDER=${provider}\nAHS_API_KEY=${apiKey}\nAHS_MODEL=\n`;
        writeFileSync(envPath, envContent, "utf-8");
        // Update process.env so it takes effect immediately
        process.env.AHS_PROVIDER = provider;
        process.env.AHS_API_KEY = apiKey;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true }));
        return;
      }

      // API: check LLM config status
      if (req.method === "GET" && req.url === "/api/config") {
        const configured = !!(process.env.AHS_PROVIDER && process.env.AHS_API_KEY);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ configured, provider: process.env.AHS_PROVIDER || "" }));
        return;
      }

      // API: save ahs.json
      if (req.method === "POST" && req.url === "/api/ahs") {
        const body = await readBody(req, MAX_BODY);
        const parsed = JSON.parse(body);
        writeFileSync(ahsPath, JSON.stringify(parsed, null, 2), "utf-8");
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true }));
        return;
      }

      // API: fill from job posting text
      if (req.method === "POST" && req.url === "/api/fill") {
        const body = await readBody(req, MAX_BODY);
        const { text } = JSON.parse(body);
        if (!text || !text.trim()) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "No text provided" }));
          return;
        }

        if (!process.env.AHS_API_KEY || !process.env.AHS_PROVIDER) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "LLM not configured. Set AHS_PROVIDER and AHS_API_KEY in your .env file, then restart the form server." }));
          return;
        }

        const fillerPromptPath = join(import.meta.dirname, "..", "FILLER_PROMPT.md");
        if (!existsSync(fillerPromptPath)) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "FILLER_PROMPT.md not found" }));
          return;
        }

        const systemPrompt = readFileSync(fillerPromptPath, "utf-8");
        const response = await callLLM(systemPrompt, text.trim(), 8000);

        const jsonMatch = response.match(/```json\s*\n([\s\S]*?)\n```/) ||
                          response.match(/(\{[\s\S]*?\})\s*$/);
        if (!jsonMatch) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "LLM did not return valid JSON. Try again." }));
          return;
        }

        const parsed = JSON.parse(jsonMatch[1]);
        writeFileSync(ahsPath, JSON.stringify(parsed, null, 2), "utf-8");
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(parsed));
        return;
      }

      // API: upload reference files
      if (req.method === "POST" && req.url === "/api/upload") {
        const attachDir = join(cwd, "attachments");
        mkdirSync(attachDir, { recursive: true });

        const chunks = [];
        let size = 0;
        req.on("data", (chunk) => {
          size += chunk.length;
          if (size > MAX_BODY) { req.destroy(); return; }
          chunks.push(chunk);
        });
        req.on("end", () => {
          try {
            const buffer = Buffer.concat(chunks);
            // Parse multipart boundary from content-type
            const ct = req.headers["content-type"] || "";
            const boundaryMatch = ct.match(/boundary=(.+)/);
            if (!boundaryMatch) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Missing multipart boundary" }));
              return;
            }
            const boundary = boundaryMatch[1];
            const files = parseMultipart(buffer, boundary);
            const saved = [];
            for (const file of files) {
              const safeName = file.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
              const dest = join(attachDir, safeName);
              writeFileSync(dest, file.data);
              saved.push(safeName);
            }
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, files: saved, dir: attachDir }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      // API: list uploaded files
      if (req.method === "GET" && req.url === "/api/files") {
        const attachDir = join(cwd, "attachments");
        const files = existsSync(attachDir)
          ? readdirSync(attachDir).filter(f => !f.startsWith("."))
          : [];
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ files }));
        return;
      }

      // API: convert ahs.json into agent workspace
      if (req.method === "POST" && req.url === "/api/convert") {
        const body = await readBody(req, MAX_BODY);
        const { outputDir: requestedDir } = JSON.parse(body);

        // Read ahs.json from CWD
        if (!existsSync(ahsPath)) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "ahs.json not found. Fill the form first." }));
          return;
        }

        let ahsData;
        try {
          ahsData = JSON.parse(readFileSync(ahsPath, "utf-8"));
        } catch (err) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: `Invalid JSON in ahs.json: ${err.message}` }));
          return;
        }

        const prefilled = ahsData.prefilled || ahsData;
        const jobTitle = prefilled["1.1"];
        if (!jobTitle) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Field 1.1 (Job Title) is required. Fill it in the form first." }));
          return;
        }

        // Derive agent-id slug
        const agentId = jobTitle
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

        // Resolve and validate output directory
        const baseDir = requestedDir ? resolve(requestedDir) : cwd;
        if (!baseDir.startsWith(cwd)) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "outputDir must be within the current working directory." }));
          return;
        }
        const outputDir = join(baseDir, agentId);

        // Check LLM config
        if (!process.env.AHS_API_KEY || !process.env.AHS_PROVIDER) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "LLM not configured. Set AHS_PROVIDER and AHS_API_KEY in your .env file, then restart the form server." }));
          return;
        }

        // Load converter prompt
        const converterPath = join(import.meta.dirname, "..", "CONVERTER_PROMPT_v2.md");
        if (!existsSync(converterPath)) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "CONVERTER_PROMPT_v2.md not found" }));
          return;
        }
        const systemPrompt = readFileSync(converterPath, "utf-8");

        // Build user message
        let userMessage = `# Completed AHS Data\n\n\`\`\`json\n${JSON.stringify(prefilled, null, 2)}\n\`\`\`\n`;

        // Include attachment manifest if attachments/ exists
        const attachDir = join(cwd, "attachments");
        if (existsSync(attachDir)) {
          const attachFiles = listFilesRecursive(attachDir);
          if (attachFiles.length > 0) {
            userMessage += `\n# Attachment Manifest\n\nThe following files are available in the references directory:\n`;
            for (const f of attachFiles) {
              userMessage += `- ${f}\n`;
            }
          }
        }

        // Call LLM
        const response = await callLLM(systemPrompt, userMessage, 16000);

        // Parse and write workspace
        const parsedFiles = parseConverterResponse(response, agentId);
        if (parsedFiles.length === 0) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "No files could be parsed from the LLM response. Try again." }));
          return;
        }

        mkdirSync(outputDir, { recursive: true });
        const written = writeWorkspace(outputDir, parsedFiles);

        // Copy INSTALL_v3.md as INSTALL.md
        const installSrc = join(import.meta.dirname, "..", "INSTALL_v3.md");
        if (existsSync(installSrc)) {
          copyFileSync(installSrc, join(outputDir, "INSTALL.md"));
          written.push("INSTALL.md");
        }

        // Copy reference files if attachments/ exists
        if (existsSync(attachDir)) {
          const skills = prefilled["4"] || [];
          const refFiles = listFilesRecursive(attachDir);
          if (skills.length > 0 && refFiles.length > 0) {
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
              for (const f of refFiles) {
                const src = resolve(join(attachDir, f));
                if (!src.startsWith(resolve(attachDir))) continue;
                const dest = join(refDir, basename(f));
                copyFileSync(src, dest);
              }
            }
          }
        }

        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, outputDir, files: written }));
        return;
      }

      // Static files from ui/
      const reqPath = req.url === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
      const fullPath = resolve(join(uiDir, normalize(reqPath)));

      // Prevent directory traversal
      if (!fullPath.startsWith(uiDir)) {
        res.statusCode = 403;
        res.end("Forbidden");
        return;
      }

      if (!existsSync(fullPath)) {
        res.statusCode = 404;
        res.end("Not found");
        return;
      }

      const ext = extname(fullPath);
      res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
      res.end(readFileSync(fullPath));

    } catch (err) {
      if (!res.headersSent) {
        res.statusCode = err.message === "Request body too large" ? 413 : 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: err.message }));
      }
    }
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`AHS Form running at ${url}`);
    console.log(`Saving to: ${ahsPath}`);
    console.log("Press Ctrl+C to stop.\n");

    try {
      const cmd =
        process.platform === "win32" ? `start "" "${url}"` :
        process.platform === "darwin" ? `open "${url}"` :
        `xdg-open "${url}"`;
      execSync(cmd, { stdio: "ignore" });
    } catch { /* browser open is best-effort */ }
  });
}

/** Recursively list files in a directory, returning relative paths. */
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

/** Minimal multipart/form-data parser. Extracts files from a multipart buffer. */
function parseMultipart(buffer, boundary) {
  const files = [];
  const sep = Buffer.from(`--${boundary}`);
  let pos = 0;

  while (pos < buffer.length) {
    const start = buffer.indexOf(sep, pos);
    if (start === -1) break;
    const next = buffer.indexOf(sep, start + sep.length);
    if (next === -1) break;

    const part = buffer.subarray(start + sep.length, next);
    const headerEnd = part.indexOf("\r\n\r\n");
    if (headerEnd === -1) { pos = next; continue; }

    const headers = part.subarray(0, headerEnd).toString();
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    if (!filenameMatch) { pos = next; continue; }

    // Data starts after \r\n\r\n, ends before trailing \r\n
    let data = part.subarray(headerEnd + 4);
    if (data[data.length - 2] === 0x0d && data[data.length - 1] === 0x0a) {
      data = data.subarray(0, data.length - 2);
    }

    files.push({ filename: filenameMatch[1], data });
    pos = next;
  }

  return files;
}
