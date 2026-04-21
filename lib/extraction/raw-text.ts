import { readFile } from "node:fs/promises";

import { PDFParse } from "pdf-parse";

import { getDemoFixtureByFilename } from "@/lib/demo/fixtures";
import { MockOcrAdapter } from "@/lib/extraction/ocr/mock-ocr-adapter";

export type RawTextExtractionResult = {
  text: string;
  confidence: number;
  notes: string[];
};

async function extractPdfText(filePath: string) {
  const data = await readFile(filePath);
  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}

export async function extractRawTextFromStoredFile(input: {
  filePath: string;
  originalName: string;
  mimeType: string;
}): Promise<RawTextExtractionResult> {
  const fixture = getDemoFixtureByFilename(input.originalName);

  if (input.mimeType === "application/pdf") {
    try {
      const text = await extractPdfText(input.filePath);

      if (text) {
        return {
          text,
          confidence: 0.9,
          notes: ["PDF text was extracted with the local pdf-parse adapter."],
        };
      }
    } catch (error) {
      if (!fixture) {
        throw error;
      }
    }
  }

  if (fixture) {
    return {
      text: fixture.rawText,
      confidence: fixture.slug === "suspicious-review" ? 0.68 : 0.83,
      notes: [
        "A bundled fixture transcript was used because the source file did not yield extractable text locally.",
      ],
    };
  }

  const ocrAdapter = new MockOcrAdapter();
  return ocrAdapter.extractText({ filePath: input.filePath, originalName: input.originalName });
}
