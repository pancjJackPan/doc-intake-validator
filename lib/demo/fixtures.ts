import path from "node:path";

export type DemoFixture = {
  slug: string;
  title: string;
  description: string;
  filename: string;
  mimeType: "application/pdf" | "image/png" | "image/jpeg";
  rawText: string;
  expectedStatus: "APPROVED" | "PROCESSED" | "NEEDS_REVIEW" | "REJECTED";
};

export const demoFixtures: DemoFixture[] = [
  {
    slug: "clean-intake",
    title: "Clean Business Intake",
    description: "Complete intake package with consistent organization details and a normal billing amount.",
    filename: "clean-intake.pdf",
    mimeType: "application/pdf",
    expectedStatus: "APPROVED",
    rawText: `
Business Intake Packet
Document Type: Business Intake
Full Name: Maya Chen
Company / Organization: North Coast Logistics LLC
Email: maya.chen@northcoastlogistics.com
Phone: (415) 555-0148
Date: 2026-02-18
Reference Number: REF-2026-1842
Invoice Number: INV-2104
Total Amount: $4,280.50
Address: 918 Harbor Way, Oakland, CA 94607
Operations Contact: Maya Chen, North Coast Logistics LLC
    `.trim(),
  },
  {
    slug: "missing-fields",
    title: "Missing Fields Intake",
    description: "Document missing contact and billing fields, forcing a manual follow-up path.",
    filename: "missing-fields.pdf",
    mimeType: "application/pdf",
    expectedStatus: "REJECTED",
    rawText: `
Vendor Onboarding Request
Document Type: Compliance Form
Full Name: Derek Alvarez
Company / Organization: Atlas Freight Partners
Phone: 555-0112
Date: 2026-03-12
Address: 411 West Monroe Street, Phoenix, AZ
Notes: Submitter requested rush processing. Billing sheet was not attached.
    `.trim(),
  },
  {
    slug: "suspicious-review",
    title: "Suspicious Invoice Review",
    description: "High-value image-based document with inconsistent organization names and a future date.",
    filename: "suspicious-review.png",
    mimeType: "image/png",
    expectedStatus: "NEEDS_REVIEW",
    rawText: `
Accounts Review Image Capture
Document Type: Invoice
Full Name: Priya Nair
Company / Organization: Meridian Clinical Supply
Email: accounts@meridian-clinical.com
Phone: (650) 555-0199
Date: 2027-01-05
Reference Number: CASE-77A
Invoice Number: INV-89012
Total Amount: $27,950.00
Address: 2200 Market Street, San Francisco, CA 94114
Remit to: Meridian Medical Supply Group
Notes: Signature block lists Meridian Clinical Supply, while the footer lists Meridian Medical Supply Group.
    `.trim(),
  },
];

export function getDemoFixture(slug: string) {
  return demoFixtures.find((fixture) => fixture.slug === slug);
}

export function getDemoFixtureByFilename(filename: string) {
  return demoFixtures.find((fixture) => fixture.filename.toLowerCase() === filename.toLowerCase());
}

export function getDemoFixtureAssetPath(filename: string) {
  return path.join(process.cwd(), "public", "demo", filename);
}
