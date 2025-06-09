import { chatWithOllama } from './llm';
import PDFDocument from 'pdfkit';
import fs from 'fs/promises';

export async function screenPDFForInfo(text: string) {
  const prompt = `
You are a restaurant receipt assistant. Extract the following fields as JSON:
- datum_bewirtung (e.g. 12.03.2024)
- ort_bewirtung (restaurant name + address)
- anlass (reason for the meal)
- personen (list of names, max 10)
- rechnungsbetrag (numeric, EUR)
- trinkgeld (numeric, optional)
- ort_datum_unterschrift (e.g. city, date)

Text:
"""
${text}
"""
Return only JSON.`;

  const raw = await chatWithOllama(prompt);

  try {
    const match = raw.match(/\{.*\}/s);
    return match ? JSON.parse(match[0]) : {};
  } catch {
    return {};
  }
}

export async function generateFilledPDF(info: any, filePath: string): Promise<Buffer> {
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer<ArrayBufferLike>) => chunks.push(chunk));
  doc.on('end', async () => {
    await fs.writeFile(filePath, Buffer.concat(chunks));
  });

  doc.fontSize(16).text('Bewirtungsbeleg', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12);

  doc.text(`Datum der Bewirtung: ${info.datum_bewirtung || ''}`);
  doc.text(`Ort der Bewirtung: ${info.ort_bewirtung || ''}`);
  doc.text(`Anlass: ${info.anlass || ''}`);
  doc.text(`Personen: ${(info.personen || []).join(', ')}`);
  doc.text(`Rechnungsbetrag: ${info.rechnungsbetrag || ''} EUR`);
  doc.text(`Trinkgeld: ${info.trinkgeld || ''} EUR`);
  doc.text(`Ort, Datum: ${info.ort_datum_unterschrift || ''}`);

  doc.end();
  return Buffer.concat(chunks);
}
