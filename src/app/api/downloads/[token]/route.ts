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

  const matchingFiles = item.beat.files.filter((f) => item.license.fileFormats.includes(f.kind));

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
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${escapeHtml(item.beatTitle)}</h1>
      <p class="sub">${escapeHtml(item.licenseName)} · Links expire ${item.downloadExpiresAt.toDateString()}</p>
      ${links
        .map(
          (l) => `<a class="file" href="${l.url}" download>
            <span>${escapeHtml(l.fileName)}</span>
            <span class="kind">${l.kind} ↓</span>
          </a>`
        )
        .join("")}
    </div>
  </body>
  </html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
