const normalize = (value?: string) => value?.trim();

function resolveAuthUrl() {
  const configured = normalize(process.env.NEXTAUTH_URL) || normalize(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) return configured.replace(/\/$/, "");

  const vercelUrl = normalize(process.env.VERCEL_URL);
  if (vercelUrl) return `https://${vercelUrl}`.replace(/\/$/, "");

  return "http://localhost:3000";
}

const authUrl = resolveAuthUrl();

if (!normalize(process.env.NEXTAUTH_URL)) {
  process.env.NEXTAUTH_URL = authUrl;
}

if (!normalize(process.env.AUTH_URL)) {
  process.env.AUTH_URL = authUrl;
}

if (!normalize(process.env.NEXTAUTH_SECRET)) {
  process.env.NEXTAUTH_SECRET = "dev-secret-change-me";
}
