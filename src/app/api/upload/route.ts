import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUploadUrl, buildKey } from "@/lib/r2";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { beatId, folder, fileName, contentType } = await req.json();
  if (!beatId || !folder || !fileName || !contentType) {
    return NextResponse.json({ error: "beatId, folder, fileName, and contentType are required" }, { status: 400 });
  }
  if (!["artwork", "preview", "files"].includes(folder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  const storageKey = buildKey(beatId, folder, fileName);
  const uploadUrl = await getUploadUrl(storageKey, contentType);

  return NextResponse.json({ uploadUrl, storageKey });
}
