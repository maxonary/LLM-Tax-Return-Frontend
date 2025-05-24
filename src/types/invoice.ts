export type InvoiceStatus = "pending" | "approved" | "cancelled";

export interface Location {
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface SigningData {
  signedBy: string;
  signedAt: Date;
  signature?: string;
}

export interface Invoice {
  id: string;
  amount: number;
  tipAmount: number;
  date: Date;
  location?: Location;
  reason: string;
  participants: string[];
  signingData: SigningData;
  status: InvoiceStatus;
  pdfUrl: string;
  createdAt: Date;
  updatedAt: Date;
  user_id: string;
}
