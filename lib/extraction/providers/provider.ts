import type { ProviderKind } from "@prisma/client";

import type { StructuredDocument } from "@/lib/extraction/schema";

export type StructuredExtractionResult = {
  provider: ProviderKind;
  modelName?: string;
  document: StructuredDocument;
  notes: string[];
};

export interface ExtractionProvider {
  readonly kind: ProviderKind;
  extractStructuredDocument(input: {
    rawText: string;
    fileName: string;
    mimeType: string;
  }): Promise<StructuredExtractionResult>;
}
