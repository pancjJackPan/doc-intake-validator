import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const uploadsDirectory = path.join(process.cwd(), "storage", "uploads");

export async function ensureUploadsDirectory() {
  await mkdir(uploadsDirectory, { recursive: true });
}

export function getUploadsDirectory() {
  return uploadsDirectory;
}

export function sanitizeFilename(filename: string) {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
  return sanitized.toLowerCase();
}

export async function persistUploadFile({
  submissionId,
  originalName,
  buffer,
}: {
  submissionId: string;
  originalName: string;
  buffer: Buffer;
}) {
  await ensureUploadsDirectory();

  const extension = path.extname(originalName).toLowerCase() || ".bin";
  const safeName = sanitizeFilename(path.basename(originalName, extension));
  const storedFilename = `${submissionId}-${safeName}${extension}`;
  const storedPath = path.join(uploadsDirectory, storedFilename);

  await writeFile(storedPath, buffer);

  return {
    extension,
    storagePath: storedPath,
  };
}
