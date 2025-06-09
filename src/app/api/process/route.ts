import { NextRequest, NextResponse } from 'next/server';
import { processPDFInvoice } from '@/lib/pdf';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Invalid file upload' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await processPDFInvoice(buffer);

  return NextResponse.json(result);
}