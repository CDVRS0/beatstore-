export async function uploadToR2(params: {
  file: File;
  beatId: string;
  folder: "artwork" | "preview" | "files";
}): Promise<string> {
  const { file, beatId, folder } = params;

  const presignRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ beatId, folder, fileName: file.name, contentType: file.type || "application/octet-stream" }),
  });
  if (!presignRes.ok) throw new Error("Could not get an upload URL");
  const { uploadUrl, storageKey } = await presignRes.json();

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!putRes.ok) throw new Error(`Upload failed for ${file.name}`);

  return storageKey;
}
