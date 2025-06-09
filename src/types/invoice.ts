export type InvoiceStatus = "pending" | "approved" | "rejected";

export type InvoiceCategory =
  | "Travel"
  | "Meals and Entertainment"
  | "Office Supplies"
  | "Equipment"
  | "Utilities"
  | "Professional Services"
  | "Marketing and Advertising"
  | "Training and Development"
  | "Insurance"
  | "Miscellaneous";

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
  user_id: string;
  amount: number;
  tipAmount?: number;
  date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  category: InvoiceCategory;
  pdfUrl?: string;
  participants: string[];
  location?: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  signingData?: {
    signedBy: string;
    signedAt: string;
  };
  createdAt: string;
}
