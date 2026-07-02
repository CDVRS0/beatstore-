import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { publicUrl } from "@/lib/r2";
import { formatPrice } from "@/lib/utils";
import AgreementAccept from "@/components/AgreementAccept";

export default async function LicenseAgreementPage({
  params,
}: {
  params: { beatId: string; licenseId: string };
}) {
  const license = await prisma.license.findUnique({
    where: { id: params.licenseId },
    include: { beat: true },
  });

  if (!license || license.beatId !== params.beatId) notFound();
  if (license.beat.exclusiveSold) notFound();

  const artworkUrl = license.beat.artworkKey ? publicUrl(license.beat.artworkKey) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <Link href={`/beats/${license.beat.slug}`} className="text-xs text-lo hover:text-hi">
        ← Back to {license.beat.title}
      </Link>

      <h1 className="mt-3 font-display text-2xl font-bold text-hi">License agreement</h1>
      <p className="mt-1 text-sm text-lo">
        {license.name} — {license.beat.title} — {formatPrice(Number(license.price))}
      </p>

      <div className="mt-6 max-h-[50vh] overflow-y-auto rounded-xs border border-line bg-panel p-5 text-sm leading-relaxed text-lo">
        <p className="whitespace-pre-wrap">{license.agreementText}</p>
      </div>

      <AgreementAccept
        beat={{ id: license.beat.id, title: license.beat.title, slug: license.beat.slug, artworkUrl }}
        license={{ id: license.id, name: license.name, price: Number(license.price) }}
      />
    </div>
  );
}
