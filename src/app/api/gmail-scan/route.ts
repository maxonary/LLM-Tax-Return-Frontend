// src/app/api/gmail-scan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { gmailAuthenticate, searchMessages, downloadAttachments } from '@/lib/gmail';
import { extractTextFromPDF } from '@/lib/pdf';
import { categorizeInvoice } from '@/lib/categorize';

export async function GET() {
  try {
    const service = await gmailAuthenticate();
    const keywords = ['RECHNUNG', 'INVOICE', 'BELEG'];
    const query = `(${keywords.join(' OR ')}) newer_than:1y`;

    const messages = await searchMessages(service, query);
    const results: { subject: string; category: string }[] = [];

    for (const msg of messages) {
      const attachments = await downloadAttachments(service, msg.id);

      for (const { buffer, filename, subject } of attachments) {
        const text = await extractTextFromPDF(buffer);
        const category = await categorizeInvoice(text);
        results.push({ subject: subject || filename, category });
      }
    }

    return NextResponse.json({ count: results.length, results });
  } catch (error) {
    console.error('Gmail Scan API error:', error);
    return NextResponse.json({ error: 'Failed to scan Gmail' }, { status: 500 });
  }
}