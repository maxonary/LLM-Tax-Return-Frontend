import { Badge } from "@/components/ui/badge";
import { Invoice, InvoiceCategory } from "@/types/invoice";
import { format } from "date-fns";
import Link from "next/link";
import {
  Building2,
  FileText,
  GraduationCap,
  Megaphone,
  Monitor,
  Plane,
  Shield,
  ShoppingBag,
  Utensils,
  Wrench,
} from "lucide-react";

const CATEGORY_ICONS: Record<InvoiceCategory, React.ReactNode> = {
  Travel: <Plane className="w-5 h-5 text-blue-600" />,
  "Meals and Entertainment": <Utensils className="w-5 h-5 text-green-600" />,
  "Office Supplies": <ShoppingBag className="w-5 h-5 text-purple-600" />,
  Equipment: <Monitor className="w-5 h-5 text-amber-600" />,
  Utilities: <Wrench className="w-5 h-5 text-red-600" />,
  "Professional Services": <Building2 className="w-5 h-5 text-indigo-600" />,
  "Marketing and Advertising": <Megaphone className="w-5 h-5 text-pink-600" />,
  "Training and Development": (
    <GraduationCap className="w-5 h-5 text-teal-600" />
  ),
  Insurance: <Shield className="w-5 h-5 text-slate-600" />,
  Miscellaneous: <FileText className="w-5 h-5 text-gray-600" />,
};

interface InvoiceItemProps {
  invoice: Invoice;
  showLink?: boolean;
}

export function InvoiceItem({ invoice, showLink = true }: InvoiceItemProps) {
  const content = (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
          {CATEGORY_ICONS[invoice.category]}
        </div>
        <div>
          <p className="font-medium text-gray-900">{invoice.reason}</p>
          <p className="text-sm text-gray-500">
            {format(new Date(invoice.date), "PPP")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-xs">
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </Badge>
        <span className="font-semibold text-gray-900">
          ${invoice.amount.toFixed(2)}
        </span>
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link href={`/invoice/${invoice.id}`} className="block">
        <div>{content}</div>
      </Link>
    );
  }

  return <div>{content}</div>;
}
