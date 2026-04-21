import path from "node:path";

import { NextResponse } from "next/server";

import { processDemoFixture, processUploadedDocument } from "@/lib/submissions/process-submission";

export const runtime = "nodejs";

function inferMimeType(filename: string) {
  const extension = path.extname(filename).toLowerCase();

  switch (extension) {
    case ".pdf":
      return "application/pdf";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    default:
      return "";
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Processing failed.";
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { demoFixtureId?: string };
      const result = await processDemoFixture(body.demoFixtureId ?? "");

      return NextResponse.json(
        {
          submissionId: result.submissionId,
          redirectUrl: `/results/${result.submissionId}`,
        },
        { status: 201 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A PDF or image file is required." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || inferMimeType(file.name);
    const result = await processUploadedDocument({
      originalName: file.name,
      mimeType,
      sizeBytes: file.size,
      buffer,
      source: "UPLOAD",
    });

    return NextResponse.json(
      {
        submissionId: result.submissionId,
        redirectUrl: `/results/${result.submissionId}`,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
