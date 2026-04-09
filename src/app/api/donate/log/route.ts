import { NextRequest, NextResponse } from 'next/server';
import { kvZadd } from '@/lib/kv';
import type { DonationRecord } from '@/lib/types';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const method = body?.method as DonationRecord['method'];
  if (!['wechat', 'alipay', 'paypal', 'bmc'].includes(method)) {
    return NextResponse.json({ error: 'invalid method' }, { status: 400 });
  }
  const ts = Date.now();
  const record: DonationRecord = { method, ts };
  await kvZadd('admin:donations', ts, JSON.stringify(record));
  return NextResponse.json({ ok: true });
}
