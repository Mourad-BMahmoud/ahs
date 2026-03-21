import { readFileSync } from "node:fs";
import { extname } from "node:path";

/**
 * Extract plain text from a file. Supports .txt, .md, .pdf, .docx.
 * @param {string} filePath — absolute path to the file
 * @returns {Promise<string>} — extracted text
 */
export async function extractText(filePath) {
  const ext = extname(filePath).toLowerCase();

  switch (ext) {
    case ".txt":
    case ".md":
      return readFileSync(filePath, "utf-8");

    case ".pdf":
      return extractPDF(filePath);

    case ".docx":
      return extractDOCX(filePath);

    default:
      throw new Error(
        `Unsupported file type: ${ext}. Supported: .txt, .md, .pdf, .docx`
      );
  }
}

async function extractPDF(filePath) {
  let pdfParse;
  try {
    pdfParse = (await import("pdf-parse")).default;
  } catch {
    throw new Error(
      "pdf-parse is not installed. Run: npm install pdf-parse"
    );
  }
  const buffer = readFileSync(filePath);
  const data = await pdfParse(buffer);
  if (!data.text || !data.text.trim()) {
    throw new Error("PDF appears to be empty or image-only (no extractable text).");
  }
  return data.text;
}

async function extractDOCX(filePath) {
  let mammoth;
  try {
    mammoth = await import("mammoth");
  } catch {
    throw new Error(
      "mammoth is not installed. Run: npm install mammoth"
    );
  }
  const buffer = readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  if (!result.value || !result.value.trim()) {
    throw new Error("DOCX appears to be empty (no extractable text).");
  }
  return result.value;
}
