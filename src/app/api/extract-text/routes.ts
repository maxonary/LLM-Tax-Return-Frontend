// src/app/api/extract-text/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Invalid file upload' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPDF(buffer);

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Extract Text API error:', error);
    return NextResponse.json({ error: 'Failed to extract text' }, { status: 500 });
  }
}