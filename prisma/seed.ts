import "dotenv/config";

import { prisma } from "@/lib/prisma";
import { demoFixtures } from "@/lib/demo/fixtures";
import { processDemoFixture } from "@/lib/submissions/process-submission";

async function main() {
  await prisma.validationIssue.deleteMany();
  await prisma.processingRun.deleteMany();
  await prisma.extractedDocument.deleteMany();
  await prisma.uploadedFile.deleteMany();
  await prisma.submission.deleteMany();

  for (const fixture of demoFixtures) {
    await processDemoFixture(fixture.slug, "SEED");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
