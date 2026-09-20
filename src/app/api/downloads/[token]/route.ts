import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/r2";

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const item = await prisma.orderItem.findUnique({
    where: { downloadToken: params.token },
    include: { order: true, beat: { include: { files: true } }, license: true },
  });

  if (!item) return new NextResponse("Download link not found.", { status: 404 });
  if (item.order.status !== "PAID") return new NextResponse("This order has not completed payment.", { status: 403 });
  if (item.downloadExpiresAt < new Date()) {
    return new NextResponse("This download link has expired. Contact us for a re-send.", { status: 410 });
  }

  const isTaggedPreview = item.licenseName === "Tagged preview" && item.license.price.toString() === "0";
  const matchingFiles = isTaggedPreview
    ? item.beat.previewKey
      ? [{ kind: "MP3", fileName: `${item.beatTitle} - tagged preview.mp3`, storageKey: item.beat.previewKey }]
      : []
    : item.beat.files
        .filter((f) => item.license.fileFormats.includes(f.kind))
        .map((f) => ({ kind: f.kind, fileName: f.fileName, storageKey: f.storageKey }));

  if (matchingFiles.length === 0) {
    return new NextResponse("No files are attached to this beat yet. Contact us for support.", { status: 404 });
  }

  await prisma.orderItem.update({ where: { id: item.id }, data: { downloadCount: { increment: 1 } } });

  const links = await Promise.all(
    matchingFiles.map(async (f) => ({
      kind: f.kind,
      fileName: f.fileName,
      url: await getDownloadUrl(f.storageKey, f.fileName),
    }))
  );

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Your download — ${escapeHtml(item.beatTitle)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { background:#0A0B0D; color:#F3F4F1; font-family: Arial, sans-serif; padding: 48px 20px; }
      .card { max-width: 480px; margin: 0 auto; background:#131519; border:1px solid #23262C; border-radius:8px; padding:32px; }
      h1 { font-size: 20px; margin: 0 0 4px; }
      p.sub { color:#8A8F98; font-size: 13px; margin: 0 0 24px; }
      a.file { display:flex; justify-content:space-between; align-items:center; padding: 14px 16px; margin-bottom:10px; border:1px solid #23262C; border-radius:4px; color:#F3F4F1; text-decoration:none; }
      a.file:hover { border-color:#2E5CFF; }
      .kind { font-family: monospace; color:#2E5CFF; font-size:12px; }
      .contract { margin-top:32px; padding-top:28px; border-top:1px solid #23262C; }
      .contract h2 { font-size:16px; margin:0 0 16px; }
      .contract dl { display:grid; grid-template-columns:140px 1fr; gap:8px 16px; margin:0 0 20px; font-size:13px; }
      .contract dt { color:#8A8F98; }
      .contract dd { margin:0; }
      .terms { white-space:pre-wrap; color:#C5C8CD; font-size:13px; line-height:1.6; }
      button.print { width:100%; margin-top:20px; padding:12px 16px; border:0; border-radius:4px; background:#2E5CFF; color:#F3F4F1; font-weight:700; cursor:pointer; }
      @media print {
        body { background:#fff; color:#111; padding:0; }
        .card { max-width:none; background:#fff; border:0; padding:0; }
        h1, .contract h2, .contract dd { color:#111; }
        p.sub, .contract dt, .terms { color:#333; }
        a.file, .contract { border-color:#ccc; }
        .files, .print { display:none; }
        .contract { margin-top:0; padding-top:0; border-top:0; }
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${escapeHtml(item.beatTitle)}</h1>
      <p class="sub">${escapeHtml(item.licenseName)} · Links expire ${item.downloadExpiresAt.toDateString()}</p>
      <div class="files">
      ${links
        .map(
          (l) => `<a class="file" href="${l.url}" download>
            <span>${escapeHtml(l.fileName)}</span>
            <span class="kind">${l.kind} ↓</span>
          </a>`
        )
        .join("")}
      </div>
      <section class="contract">
        <h2>License contract</h2>
        <dl>
          <dt>Artist legal name</dt>
          <dd>${escapeHtml(item.order.artistLegalName || item.order.customerName || "Not provided")}</dd>
          <dt>Beat</dt>
          <dd>${escapeHtml(item.beatTitle)}</dd>
          <dt>License</dt>
          <dd>${escapeHtml(item.licenseName)}</dd>
          <dt>Purchase date</dt>
          <dd>${escapeHtml((item.order.paidAt || item.order.createdAt).toLocaleDateString("en-GB"))}</dd>
        </dl>
        <div class="terms">${escapeHtml(item.agreementText || item.license.agreementText)}</div>
        <button class="print" type="button" onclick="window.print()">Print / Save contract as PDF</button>
      </section>
    </div>
  </body>
  </html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
