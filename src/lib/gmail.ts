// src/lib/gmail.ts
import { google } from 'googleapis';
import path from 'path';
import { authenticate } from '@google-cloud/local-auth';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = path.resolve('token.json');
const CREDENTIALS_PATH = path.resolve('credentials.json');

export async function gmailAuthenticate() {
  const auth = await authenticate({
    keyfilePath: CREDENTIALS_PATH,
    scopes: SCOPES,
  });
  return google.gmail({ version: 'v1', auth });
}

export async function searchMessages(service: any, query: string) {
  const messages: { id: string }[] = [];
  let nextPageToken: string | undefined;

  do {
    const res = await service.users.messages.list({
      userId: 'me',
      q: query,
      pageToken: nextPageToken,
    });

    const found = res.data.messages || [];
    messages.push(...found);
    nextPageToken = res.data.nextPageToken;
  } while (nextPageToken);

  return messages;
}

export async function downloadAttachments(service: any, messageId: string) {
  const message = await service.users.messages.get({ userId: 'me', id: messageId });
  const parts = message.data.payload?.parts || [];
  const attachments: { buffer: Buffer; filename: string; subject?: string }[] = [];

  let subject = 'No Subject';
  for (const header of message.data.payload?.headers || []) {
    if (header.name === 'Subject') subject = header.value;
  }

  for (const part of parts) {
    if (part.filename?.toLowerCase().endsWith('.pdf') && part.body?.attachmentId) {
      const attachment = await service.users.messages.attachments.get({
        userId: 'me',
        messageId,
        id: part.body.attachmentId,
      });

      const data = attachment.data.data as string;
      const buffer = Buffer.from(data, 'base64');
      attachments.push({ buffer, filename: part.filename, subject });
    }
  }

  return attachments;
}
