import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';
const PAYLOAD = 'admin:authenticated';

async function sign(value: string): Promise<string> {
  const secret = process.env.ADMIN_COOKIE_SECRET ?? 'dev-secret-change-me';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Buffer.from(sig).toString('hex');
}

async function verify(value: string, signature: string): Promise<boolean> {
  const expected = await sign(value);
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const sig = await sign(PAYLOAD);
  return `${PAYLOAD}:${sig}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  const lastColon = token.lastIndexOf(':');
  if (lastColon === -1) return false;
  const payload = token.substring(0, lastColon);
  const signature = token.substring(lastColon + 1);
  if (payload !== PAYLOAD) return false;
  return verify(payload, signature);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export { COOKIE_NAME };
