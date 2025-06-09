import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf';
import { categorizeInvoice } from '@/lib/categorize';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Invalid file upload' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text
    const text = await extractTextFromPDF(buffer);
    const category = await categorizeInvoice(text);

    // Optional: Save file to disk (for dev/testing only)
    const uploadDir = path.resolve('uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const filename = file.name || `invoice-${Date.now()}.pdf`;
    const savePath = path.join(uploadDir, filename);
    await fs.writeFile(savePath, buffer);

    return NextResponse.json({ category, text, filename });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 });
  }
}