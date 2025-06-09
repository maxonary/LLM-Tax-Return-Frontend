export async function chatWithOllama(prompt: string): Promise<string> {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM request failed with status ${response.status}`);
    }

    const result = await response.json();
    const content = result?.message?.content?.trim();

    if (!content) {
      throw new Error('LLM response did not contain content');
    }

    return content;
  } catch (error) {
    console.error('LLM error:', error);
    return '';
  }
}

export async function categorizeInvoice(text: string): Promise<string> {
  const prompt = `
You are an invoice assistant. Categorize this invoice into one of the following categories:
- Work Equipment
- Insurance
- Travel
- Food
- Lifestyle
- Other

Invoice:
${text}

Category:
`;

  const result = await chatWithOllama(prompt);
  return result || 'Other';
}