// src/app/api/bewirtungsbeleg/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf';
import { screenPDFForInfo, generateFilledPDF } from '@/lib/bewirtungsbeleg';
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
    const text = await extractTextFromPDF(buffer);
    const extracted = await screenPDFForInfo(text);

    // Generate filled form
    const filename = file.name?.replace(/\.pdf$/, '') || 'bewirtungsbeleg';
    const outputDir = path.resolve('bewirtungsbelege');
    await fs.mkdir(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `${filename}_form.pdf`);
    const pdfBuffer = await generateFilledPDF(extracted, outputPath);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}_form.pdf"`
      }
    });
  } catch (error) {
    console.error('Bewirtungsbeleg API error:', error);
    return NextResponse.json({ error: 'Failed to generate form' }, { status: 500 });
  }
}