import { env } from "@/lib/env";

export const acceptedMimeTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
] as const;

export const acceptedExtensions = [".pdf", ".png", ".jpg", ".jpeg"] as const;

export const maxUploadSizeBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export const defaultHighAmountThreshold = env.HIGH_AMOUNT_THRESHOLD;

export const statusOptions = [
  "ALL",
  "UPLOADED",
  "PROCESSED",
  "NEEDS_REVIEW",
  "APPROVED",
  "REJECTED",
  "FAILED",
] as const;
