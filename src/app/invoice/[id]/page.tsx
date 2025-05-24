import { updateInvoiceStatus } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Invoice } from "@/types/invoice";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getInvoice(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Invoice;
}

export default async function InvoicePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const invoice = await getInvoice(id);

  if (!invoice) {
    notFound();
  }

  async function handleStatusUpdate(status: "approved" | "cancelled") {
    "use server";
    await updateInvoiceStatus(id, status);
  }

  return (
    <main className="container mx-auto py-8">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{invoice.reason}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="text-lg font-bold">${invoice.amount.toFixed(2)}</p>
            </div>

            {invoice.tipAmount > 0 && (
              <div>
                <p className="text-sm text-gray-500">Tip Amount</p>
                <p className="text-lg">${invoice.tipAmount.toFixed(2)}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="text-lg">{format(new Date(invoice.date), "PPP")}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Location</p>
              {invoice.location ? (
                <>
                  {invoice.location.name && (
                    <p className="text-lg">{invoice.location.name}</p>
                  )}
                  <p className="text-gray-600">
                    {invoice.location.street && (
                      <>
                        {invoice.location.street}
                        <br />
                      </>
                    )}
                    {(invoice.location.city ||
                      invoice.location.state ||
                      invoice.location.postalCode) && (
                      <>
                        {[
                          invoice.location.city,
                          invoice.location.state,
                          invoice.location.postalCode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                        <br />
                      </>
                    )}
                    {invoice.location.country && invoice.location.country}
                  </p>
                </>
              ) : (
                <p className="text-gray-600">No location provided</p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500">Participants</p>
              <ul className="list-disc list-inside">
                {invoice.participants.map((participant, index) => (
                  <li key={index} className="text-gray-600">
                    {participant}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span
                className={`inline-block px-2 py-1 text-sm rounded ${
                  invoice.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : invoice.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {invoice.status.charAt(0).toUpperCase() +
                  invoice.status.slice(1)}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500">Signing Information</p>
              <p className="text-gray-600">
                Signed by: {invoice.signingData.signedBy}
                <br />
                Signed on:{" "}
                {format(new Date(invoice.signingData.signedAt), "PPP")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Invoice PDF</h2>
          <div className="aspect-[3/4] bg-gray-100 rounded-lg">
            <iframe
              src={invoice.pdfUrl}
              className="w-full h-full rounded-lg"
              title="Invoice PDF"
            />
          </div>
        </div>
      </div>

      {invoice.status === "pending" && (
        <div className="mt-8 flex gap-4">
          <form
            action={async () => {
              await handleStatusUpdate("approved");
            }}
          >
            <Button type="submit" variant="default">
              Approve Invoice
            </Button>
          </form>
          <form
            action={async () => {
              await handleStatusUpdate("cancelled");
            }}
          >
            <Button type="submit" variant="destructive">
              Cancel Invoice
            </Button>
          </form>
        </div>
      )}
    </main>
  );
}
