import { env } from "@/lib/env";
import { MockExtractionProvider } from "@/lib/extraction/providers/mock-extraction-provider";
import { OpenAiExtractionProvider } from "@/lib/extraction/providers/openai-extraction-provider";

export function createExtractionProvider() {
  if (env.EXTRACTION_PROVIDER === "openai" && env.OPENAI_API_KEY) {
    return new OpenAiExtractionProvider();
  }

  return new MockExtractionProvider();
}
