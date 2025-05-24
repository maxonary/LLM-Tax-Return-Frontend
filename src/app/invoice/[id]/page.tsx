"use client";

import { useEffect, useState, use } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Invoice } from "@/types/invoice";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { updateInvoiceStatus } from "@/app/actions";
import { useAuth } from "@/components/auth/AuthProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState<Invoice | null>(null);
  const [date, setDate] = useState<Date>();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
      return;
    }

    async function loadInvoice() {
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Invoice not found");
        }

        const invoiceData = data as Invoice;
        setInvoice(invoiceData);
        setEditedInvoice(invoiceData);
        setDate(new Date(invoiceData.date));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadInvoice();
    }
  }, [id, user, authLoading, router]);

  const handleStatusUpdate = async (status: "approved" | "cancelled") => {
    try {
      const result = await updateInvoiceStatus(id, status);
      if (!result.success) {
        throw new Error(result.error || "Failed to update status");
      }

      // Refresh the invoice data
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .single();

      setInvoice(data as Invoice);
      setEditedInvoice(data as Invoice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleSave = async () => {
    if (!editedInvoice) return;

    try {
      const { error } = await supabase
        .from("invoices")
        .update({
          ...editedInvoice,
          date: date?.toISOString(),
          signingData: {
            signedBy: user?.email || "System",
            signedAt: new Date().toISOString(),
          },
        })
        .eq("id", id);

      if (error) throw error;

      setInvoice(editedInvoice);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    }
  };

  const handleInputChange = (
    field: keyof Invoice | string,
    value: string | number | string[] | Date | object
  ) => {
    if (!editedInvoice) return;

    if (field.startsWith("location.")) {
      const locationField = field.split(
        "."
      )[1] as keyof typeof editedInvoice.location;
      setEditedInvoice({
        ...editedInvoice,
        location: {
          ...editedInvoice.location,
          [locationField]: value,
        },
      });
    } else {
      setEditedInvoice({
        ...editedInvoice,
        [field]: value,
      });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!invoice || !editedInvoice) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Invoice not found</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Invoice Details</h1>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {invoice.pdfUrl && (
            <iframe
              src={`${invoice.pdfUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full min-h-[800px]"
              title="Invoice PDF"
            />
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedInvoice(invoice);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Reason</Label>
              <Input
                value={editedInvoice.reason}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("reason", e.target.value)
                }
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={editedInvoice.amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("amount", parseFloat(e.target.value))
                }
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Tip Amount</Label>
              <Input
                type="number"
                value={editedInvoice.tipAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("tipAmount", parseFloat(e.target.value))
                }
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    disabled={!isEditing}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Location</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Name"
                  value={editedInvoice.location?.name || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("location.name", e.target.value)
                  }
                  disabled={!isEditing}
                />
                <Input
                  placeholder="Street"
                  value={editedInvoice.location?.street || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("location.street", e.target.value)
                  }
                  disabled={!isEditing}
                />
                <Input
                  placeholder="City"
                  value={editedInvoice.location?.city || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("location.city", e.target.value)
                  }
                  disabled={!isEditing}
                />
                <Input
                  placeholder="State"
                  value={editedInvoice.location?.state || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("location.state", e.target.value)
                  }
                  disabled={!isEditing}
                />
                <Input
                  placeholder="Postal Code"
                  value={editedInvoice.location?.postalCode || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("location.postalCode", e.target.value)
                  }
                  disabled={!isEditing}
                />
                <Input
                  placeholder="Country"
                  value={editedInvoice.location?.country || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("location.country", e.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label>Participants</Label>
              <Textarea
                value={editedInvoice.participants.join(", ")}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange(
                    "participants",
                    e.target.value.split(",").map((p) => p.trim())
                  )
                }
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Status</Label>
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  invoice.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : invoice.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {invoice.status.charAt(0).toUpperCase() +
                  invoice.status.slice(1)}
              </div>
            </div>

            {invoice.status === "pending" && (
              <div className="flex gap-4 mt-8">
                <Button
                  onClick={() => handleStatusUpdate("approved")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleStatusUpdate("cancelled")}
                  variant="destructive"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
