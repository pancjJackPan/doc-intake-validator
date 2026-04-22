import { z } from "zod";

import { acceptedExtensions, acceptedMimeTypes, maxUploadSizeBytes, statusOptions } from "@/lib/constants";

export const uploadRequestSchema = z.object({
  originalName: z.string().min(1),
  mimeType: z.string().refine((value) => acceptedMimeTypes.includes(value as never), {
    message: "Unsupported file type.",
  }),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(maxUploadSizeBytes, `File exceeds the ${Math.round(maxUploadSizeBytes / 1024 / 1024)} MB limit.`),
});

function getFileExtension(filename: string) {
  const segments = filename.toLowerCase().split(".");
  return segments.length > 1 ? `.${segments.at(-1)}` : "";
}

export const uploadFormSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size > 0, "Select a file to continue.").refine(
    (file) => file.size <= maxUploadSizeBytes,
    `File exceeds the ${Math.round(maxUploadSizeBytes / 1024 / 1024)} MB limit.`,
  ).refine((file) => {
    const extension = getFileExtension(file.name);
    return (
      acceptedMimeTypes.includes(file.type as never) ||
      acceptedExtensions.includes(extension as never)
    );
  }, "Only PDF, PNG, JPG, and JPEG files are supported."),
});

export const demoSubmissionSchema = z.object({
  demoFixtureId: z.string().min(1),
});

export const historyFiltersSchema = z.object({
  status: z.enum(statusOptions).default("ALL"),
  query: z.string().trim().optional().default(""),
});
