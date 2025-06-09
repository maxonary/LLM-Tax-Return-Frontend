"use client";

import { useEffect, useState, use } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Invoice, InvoiceCategory } from "@/types/invoice";
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
import { CalendarIcon } from "lucide-react";
import { Navigation } from "@/components/ui/navigation";
import { InvoiceItem } from "@/components/ui/invoice-item";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const CATEGORIES: InvoiceCategory[] = [
  "Travel",
  "Meals and Entertainment",
  "Office Supplies",
  "Equipment",
  "Utilities",
  "Professional Services",
  "Marketing and Advertising",
  "Training and Development",
  "Insurance",
  "Miscellaneous",
];

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

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
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

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

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
      <Navigation onSignOut={handleSignOut} />
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
          <div className="flex items-center justify-between pb-6">
            <div className="flex items-center gap-4">
              {invoice.status === "pending" ? (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusUpdate("approved")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("rejected")}
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-md text-sm font-medium",
                      invoice.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    )}
                  >
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </span>
                </div>
              )}
            </div>

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

          <div className="mb-6">
            <InvoiceItem invoice={invoice} showLink={false} />
          </div>

          <div className="space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential invoice details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <select
                    value={editedInvoice.category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      handleInputChange(
                        "category",
                        e.target.value as InvoiceCategory
                      )
                    }
                    disabled={!isEditing}
                    className="block w-full rounded-md border border-gray-200 px-4 py-2"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

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
              </CardContent>
            </Card>

            {/* Financial Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Details</CardTitle>
                <CardDescription>Amount and tip information</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
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
              </CardContent>
            </Card>

            {/* Location Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
                <CardDescription>Where the expense occurred</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  placeholder="Business Name"
                  value={editedInvoice.location?.name || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("location.name", e.target.value)
                  }
                  disabled={!isEditing}
                />
                <Input
                  placeholder="Street Address"
                  value={editedInvoice.location?.street || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("location.street", e.target.value)
                  }
                  disabled={!isEditing}
                />
                <div className="grid grid-cols-2 gap-2">
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
                </div>
                <div className="grid grid-cols-2 gap-2">
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
              </CardContent>
            </Card>

            {/* Participants Card */}
            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
                <CardDescription>
                  People involved in this expense
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={editedInvoice.participants.join(", ")}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange(
                      "participants",
                      e.target.value.split(",").map((p) => p.trim())
                    )
                  }
                  disabled={!isEditing}
                  placeholder="Enter participant names, separated by commas"
                />
              </CardContent>
            </Card>

            {/* Date Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Date</CardTitle>
                <CardDescription>When the expense occurred</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Invoice Date</Label>
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
                {invoice.signingData && (
                  <div>
                    <Label>Status Updated</Label>
                    <div className="text-sm text-gray-500 mt-1">
                      {format(new Date(invoice.signingData.signedAt), "PPP")}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
