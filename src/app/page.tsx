"use client";

import { Invoice } from "@/types/invoice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Navigation } from "@/components/ui/navigation";
import { GroupedInvoiceList } from "@/components/ui/grouped-invoice-list";

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
          .order("date", { ascending: true });

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
    <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Navigation onSignOut={handleSignOut} />

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No invoices found</p>
        </div>
      ) : (
        <GroupedInvoiceList invoices={invoices} />
      )}
    </main>
  );
}
