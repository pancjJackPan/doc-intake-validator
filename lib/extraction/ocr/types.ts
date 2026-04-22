export type OcrTextResult = {
  text: string;
  confidence: number;
  notes: string[];
};

export interface OcrAdapter {
  readonly name: string;
  extractText(input: { filePath: string; originalName: string }): Promise<OcrTextResult>;
}
