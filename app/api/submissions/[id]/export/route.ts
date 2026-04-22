import { NextResponse } from "next/server";

import { getSubmissionById } from "@/lib/submissions/queries";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const submission = await getSubmissionById(id);

  if (!submission) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  return NextResponse.json(submission, {
    headers: {
      "Content-Disposition": `attachment; filename="${submission.trackingCode.toLowerCase()}-export.json"`,
    },
  });
}
