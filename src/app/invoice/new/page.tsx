import { createInvoice } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function NewInvoicePage() {
  async function handleSubmit(formData: FormData) {
    "use server";

    const result = await createInvoice(formData);
    if (result.success) {
      redirect("/");
    } else {
      console.error(result.error);
    }
  }

  return (
    <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">New Invoice</h1>
      </div>

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
