"use client";

import { Button } from "@/components/ui/button";
import { Invoice } from "@/types/invoice";
import { format } from "date-fns";
import { LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
      return;
    }

    async function loadInvoices() {
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", user?.id)
          .order("createdAt", { ascending: false });

        if (error) {
          console.error("Error loading invoices:", error);
          return;
        }

        setInvoices(data as Invoice[]);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadInvoices();
    }
  }, [user, authLoading, router]);

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

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/invoice/new">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <Link
            key={invoice.id}
            href={`/invoice/${invoice.id}`}
            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {invoice.reason}
                  </h2>
                  <p className="text-gray-600">
                    {format(new Date(invoice.date), "PPP")}
                  </p>
                </div>
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

              <div className="mt-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-lg font-bold">
                    ${invoice.amount.toFixed(2)}
                    {invoice.tipAmount > 0 && (
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        + ${invoice.tipAmount.toFixed(2)} tip
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Location</p>
                  {invoice.location?.name ? (
                    <p className="text-gray-600">{invoice.location.name}</p>
                  ) : (
                    <p className="text-gray-600">No location</p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {invoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No invoices found</p>
          </div>
        )}
      </div>
    </main>
  );
}
