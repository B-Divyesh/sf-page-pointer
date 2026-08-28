export const LICENSE_KEY = 'sb_license:page-pointer';
const VERDICT_KEY = 'sb_license_verdict:page-pointer';
const DAY = 86_400_000;

interface Verdict { valid: boolean; checkedAt: number; reason?: string }

export function captureLicenseFromUrl(url = new URL(location.href)): string | null {
  const token = url.searchParams.get('license');
  if (!token) return localStorage.getItem(LICENSE_KEY);
  localStorage.setItem(LICENSE_KEY, token);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  return token;
}

export function saveLicense(token: string): void {
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function removeLicense(): void {
  localStorage.removeItem(LICENSE_KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export function cachedUnlock(): boolean {
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '') as Verdict;
    return verdict.valid === true;
  } catch { return false; }
}

export async function verifyLicense(token: string, force = false): Promise<{ valid: boolean; reason?: string }> {
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '') as Verdict;
    if (!force && Date.now() - cached.checkedAt < DAY) return cached;
  } catch { /* first verification */ }
  const production = location.hostname === 'page-pointer.sociobot.in';
  const base = production ? 'https://api.sociobot.in' : 'https://pilot-api.sociobot.in';
  const response = await fetch(`${base}/api/v1/products/page-pointer/verify?license=${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error('The license service is unavailable.');
  const result = await response.json() as { valid: boolean; reason?: string };
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ ...result, checkedAt: Date.now() }));
  return result;
}

export function checkoutUrl(): string {
  const production = location.hostname === 'page-pointer.sociobot.in';
  const base = production ? 'https://api.sociobot.in' : 'https://pilot-api.sociobot.in';
  return `${base}/api/v1/products/page-pointer/checkout`;
}
