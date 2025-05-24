"use client";

import { useEffect, useState, use } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Invoice } from "@/types/invoice";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { updateInvoiceStatus } from "@/app/actions";
import { useAuth } from "@/components/auth/AuthProvider";

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

        setInvoice(data as Invoice);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
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

  if (!invoice) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Invoice not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">{invoice.reason}</h1>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              invoice.status === "approved"
                ? "bg-green-100 text-green-800"
                : invoice.status === "cancelled"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Amount</h2>
            <p className="text-xl font-bold">
              ${invoice.amount.toFixed(2)}
              {invoice.tipAmount > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  + ${invoice.tipAmount.toFixed(2)} tip
                </span>
              )}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Date</h2>
            <p>{format(new Date(invoice.date), "PPP")}</p>
          </div>

          {invoice.location && (
            <div className="col-span-2">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">
                Location
              </h2>
              <div>
                {invoice.location.name && <p>{invoice.location.name}</p>}
                {invoice.location.street && <p>{invoice.location.street}</p>}
                <p>
                  {[
                    invoice.location.city,
                    invoice.location.state,
                    invoice.location.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {invoice.location.country && <p>{invoice.location.country}</p>}
              </div>
            </div>
          )}

          <div className="col-span-2">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">
              Participants
            </h2>
            <div className="flex flex-wrap gap-2">
              {invoice.participants.map((participant, index) => (
                <span
                  key={index}
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  {participant}
                </span>
              ))}
            </div>
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

        {invoice.pdfUrl && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">
              Invoice PDF
            </h2>
            <a
              href={invoice.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View PDF
            </a>
          </div>
        )}

        <div className="mt-8 pt-6 border-t text-sm text-gray-500">
          <p>
            Last updated by {invoice.signingData.signedBy} on{" "}
            {format(new Date(invoice.signingData.signedAt), "PPP")}
          </p>
        </div>
      </div>
    </div>
  );
}
