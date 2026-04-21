import { z } from "zod";

export const documentTypeSchema = z.enum([
  "business-intake",
  "invoice",
  "compliance-form",
  "unknown",
]);

export const structuredDocumentSchema = z.object({
  documentType: documentTypeSchema,
  fullName: z.string().nullable(),
  companyName: z.string().nullable(),
  organizationMentions: z.array(z.string()).default([]),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  documentDate: z.string().nullable(),
  invoiceNumber: z.string().nullable(),
  referenceNumber: z.string().nullable(),
  totalAmount: z.number().nullable(),
  currency: z.string().nullable(),
  address: z.string().nullable(),
  notes: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});

export type StructuredDocument = z.infer<typeof structuredDocumentSchema>;

export const structuredDocumentJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "documentType",
    "fullName",
    "companyName",
    "organizationMentions",
    "email",
    "phone",
    "documentDate",
    "invoiceNumber",
    "referenceNumber",
    "totalAmount",
    "currency",
    "address",
    "notes",
    "confidence",
  ],
  properties: {
    documentType: {
      type: "string",
      enum: ["business-intake", "invoice", "compliance-form", "unknown"],
    },
    fullName: { type: ["string", "null"] },
    companyName: { type: ["string", "null"] },
    organizationMentions: {
      type: "array",
      items: { type: "string" },
    },
    email: { type: ["string", "null"] },
    phone: { type: ["string", "null"] },
    documentDate: { type: ["string", "null"] },
    invoiceNumber: { type: ["string", "null"] },
    referenceNumber: { type: ["string", "null"] },
    totalAmount: { type: ["number", "null"] },
    currency: { type: ["string", "null"] },
    address: { type: ["string", "null"] },
    notes: {
      type: "array",
      items: { type: "string" },
    },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
} as const;
