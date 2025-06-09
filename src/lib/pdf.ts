import pdf from 'pdf-parse';
import { categorizeInvoice } from './llm';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text.slice(0, 2000); // Limit for LLM
}

export async function processPDFInvoice(buffer: Buffer) {
  const text = await extractTextFromPDF(buffer);
  const category = await categorizeInvoice(text);
  return { category, text };
} 