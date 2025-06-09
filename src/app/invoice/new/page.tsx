"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Navigation } from "@/components/ui/navigation";
import { createInvoice } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { InvoiceCategory } from "@/types/invoice";

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

export default function NewInvoicePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      // Upload file to Supabase Storage
      const pdfFile = formData.get("pdf") as File;
      if (!pdfFile) {
        throw new Error("PDF file is required");
      }

      const { data: fileData, error: uploadError } = await supabase.storage
        .from("invoices")
        .upload(`${Date.now()}-${pdfFile.name}`, pdfFile);

      if (uploadError) throw uploadError;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("invoices").getPublicUrl(fileData.path);

      // Create a new FormData with all the fields
      const processedData = new FormData();
      processedData.append("amount", formData.get("amount") as string);
      processedData.append(
        "tipAmount",
        (formData.get("tipAmount") as string) || "0"
      );
      processedData.append("date", formData.get("date") as string);
      processedData.append("reason", formData.get("reason") as string);
      processedData.append("category", formData.get("category") as string);
      processedData.append(
        "participants",
        formData.get("participants") as string
      );
      processedData.append("pdfUrl", publicUrl);

      // Add location fields directly
      processedData.append(
        "locationName",
        formData.get("locationName") as string
      );
      processedData.append("street", formData.get("street") as string);
      processedData.append("city", formData.get("city") as string);
      processedData.append("state", formData.get("state") as string);
      processedData.append("country", formData.get("country") as string);
      processedData.append("postalCode", formData.get("postalCode") as string);

      const result = await createInvoice(processedData);

      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || "Failed to create invoice");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
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
      <Navigation
        onSignOut={async () => {
          await supabase.auth.signOut();
          router.push("/login");
        }}
      />
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">New Invoice</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <form
          action={handleSubmit}
          className="bg-white rounded-lg shadow p-6 space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="block text-sm font-medium">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                step="0.01"
                required
                className="block w-full rounded-md border border-gray-200 px-4 py-2"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tipAmount" className="block text-sm font-medium">
                Tip Amount
              </label>
              <input
                type="number"
                id="tipAmount"
                name="tipAmount"
                step="0.01"
                className="block w-full rounded-md border border-gray-200 px-4 py-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              className="block w-full rounded-md border border-gray-200 px-4 py-2"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              className="block w-full rounded-md border border-gray-200 px-4 py-2"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="reason" className="block text-sm font-medium">
              Reason
            </label>
            <input
              type="text"
              id="reason"
              name="reason"
              required
              className="block w-full rounded-md border border-gray-200 px-4 py-2"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="participants" className="block text-sm font-medium">
              Participants (comma-separated)
            </label>
            <input
              type="text"
              id="participants"
              name="participants"
              required
              className="block w-full rounded-md border border-gray-200 px-4 py-2"
            />
          </div>

          <fieldset className="space-y-4">
            <legend className="text-sm font-medium">Location</legend>

            <div className="space-y-2">
              <label htmlFor="locationName" className="block text-sm">
                Name
              </label>
              <input
                type="text"
                id="locationName"
                name="locationName"
                className="block w-full rounded-md border border-gray-200 px-4 py-2"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="street" className="block text-sm">
                Street
              </label>
              <input
                type="text"
                id="street"
                name="street"
                className="block w-full rounded-md border border-gray-200 px-4 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="city" className="block text-sm">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="block w-full rounded-md border border-gray-200 px-4 py-2"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="state" className="block text-sm">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  className="block w-full rounded-md border border-gray-200 px-4 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="postalCode" className="block text-sm">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  className="block w-full rounded-md border border-gray-200 px-4 py-2"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="country" className="block text-sm">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  className="block w-full rounded-md border border-gray-200 px-4 py-2"
                />
              </div>
            </div>
          </fieldset>

          <div className="space-y-2">
            <label htmlFor="pdf" className="block text-sm font-medium">
              Invoice PDF
            </label>
            <input
              type="file"
              id="pdf"
              name="pdf"
              accept=".pdf"
              required
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full">
              Create Invoice
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
