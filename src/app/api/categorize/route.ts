// src/app/api/categorize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { categorizeInvoice } from '@/lib/categorize';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Missing invoice text' }, { status: 400 });
    }

    const category = await categorizeInvoice(text);
    return NextResponse.json({ category });
  } catch (error) {
    console.error('Categorize API error:', error);
    return NextResponse.json({ error: 'Failed to categorize invoice' }, { status: 500 });
  }
}