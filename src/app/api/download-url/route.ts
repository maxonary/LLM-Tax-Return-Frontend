// src/app/api/download-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { extractTextFromPDF } from '@/lib/pdf';
import { categorizeInvoice } from '@/lib/categorize';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid URL' }, { status: 400 });
    }

    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 4000 });
    const contentType = response.headers['content-type'];
    if (!contentType.includes('pdf')) {
      return NextResponse.json({ error: `Not a PDF: ${contentType}` }, { status: 415 });
    }

    const buffer = Buffer.from(response.data);
    const text = await extractTextFromPDF(buffer);
    const category = await categorizeInvoice(text);

    return NextResponse.json({ text, category });
  } catch (error) {
    console.error('Download URL API error:', error);
    return NextResponse.json({ error: 'Failed to download or process PDF' }, { status: 500 });
  }
}