import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const LICENSE_TEMPLATES = [
  {
    name: "MP3 Lease",
    description: "Great for demos, mixtapes, and non-commercial projects.",
    defaultPrice: 24.99,
    fileFormats: ["MP3"],
    streamLimit: 100000,
    distributionLimit: 2000,
    musicVideos: false,
    performanceRights: false,
    commercialUse: false,
    isExclusive: false,
    sortOrder: 0,
    agreementText: `This is a non-exclusive license for the tagged/MP3 version of the beat. The beat remains available for purchase by other artists. Streaming is capped at 100,000 combined audio streams, and up to 2,000 units may be sold or distributed. This license does not include music video rights, radio broadcast, or performance rights. Full credit must be given to the producer in the title or description of any release (e.g. "prod. CDVRS"). Resale, resampling, or claiming the instrumental as your own composition is prohibited.`,
  },
  {
    name: "WAV Lease",
    description: "Studio-quality WAV file for higher-fidelity releases.",
    defaultPrice: 34.99,
    fileFormats: ["MP3", "WAV"],
    streamLimit: 500000,
    distributionLimit: 5000,
    musicVideos: true,
    performanceRights: false,
    commercialUse: true,
    isExclusive: false,
    sortOrder: 1,
    agreementText: `This is a non-exclusive license including untagged MP3 and WAV files. The beat remains available for purchase by other artists. Streaming is capped at 500,000 combined audio streams, and up to 5,000 units may be sold or distributed. Includes rights to one (1) monetized music video. Producer credit is required (e.g. "prod. CDVRS"). Resale, resampling, or claiming the instrumental as your own composition is prohibited.`,
  },
  {
    name: "Premium Lease",
    description: "WAV + trackout stems for full creative control while mixing.",
    defaultPrice: 59.99,
    fileFormats: ["MP3", "WAV", "STEMS"],
    streamLimit: 2000000,
    distributionLimit: 10000,
    musicVideos: true,
    performanceRights: true,
    commercialUse: true,
    isExclusive: false,
    sortOrder: 2,
    agreementText: `This is a non-exclusive license including untagged MP3, WAV, and trackout stems. The beat remains available for purchase by other artists. Streaming is capped at 2,000,000 combined audio streams, and up to 10,000 units may be sold or distributed. Includes rights to unlimited monetized music videos and limited public performance. Producer credit is required (e.g. "prod. CDVRS"). Resale, resampling, or claiming the instrumental as your own composition is prohibited.`,
  },
  {
    name: "Unlimited Lease",
    description: "All the above, with no streaming or distribution caps.",
    defaultPrice: 99.99,
    fileFormats: ["MP3", "WAV", "STEMS"],
    streamLimit: null,
    distributionLimit: null,
    musicVideos: true,
    performanceRights: true,
    commercialUse: true,
    isExclusive: false,
    sortOrder: 3,
    agreementText: `This is a non-exclusive license including untagged MP3, WAV, and trackout stems, with unlimited streaming and unlimited sales/distribution. The beat remains available for purchase by other artists unless separately purchased as an Exclusive Rights license. Includes unlimited monetized music videos and public performance rights. Producer credit is required (e.g. "prod. CDVRS"). Resale, resampling, or claiming the instrumental as your own composition is prohibited.`,
  },
  {
    name: "Exclusive Rights",
    description: "Full ownership transfer. The beat is taken off the market permanently.",
    defaultPrice: 299.99,
    fileFormats: ["MP3", "WAV", "STEMS"],
    streamLimit: null,
    distributionLimit: null,
    musicVideos: true,
    performanceRights: true,
    commercialUse: true,
    isExclusive: true,
    sortOrder: 4,
    agreementText: `This is an exclusive license. Upon purchase, the beat is permanently removed from sale and will not be licensed to any other artist. Includes untagged MP3, WAV, and trackout stems, unlimited streaming, unlimited sales/distribution, unlimited monetized music videos, and full public performance rights. The producer retains the original composition and production credit but grants exclusive commercial usage rights to the buyer. Producer credit is still required (e.g. "prod. CDVRS") unless a separate buyout of credit is negotiated directly.`,
  },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "you@cdvrswrld.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "change-me-before-seeding";

  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.admin.create({
      data: { email: adminEmail, passwordHash, name: "CDVRS" },
    });
    console.log(`✔ Created admin account: ${adminEmail}`);
  } else {
    console.log(`… Admin account already exists: ${adminEmail}`);
  }

  for (const template of LICENSE_TEMPLATES) {
    const existing = await prisma.licenseTemplate.findFirst({ where: { name: template.name } });
    if (!existing) {
      await prisma.licenseTemplate.create({ data: template });
      console.log(`✔ Created license template: ${template.name}`);
    }
  }

  console.log("\nSeed complete. Log in to /admin/login with the admin credentials above.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
