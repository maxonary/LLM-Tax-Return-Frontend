"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { InvoiceStatus } from "@/types/invoice";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createInvoice(formData: FormData) {
  try {
    const cookieStore = cookies();
    const supabase = createServerActionClient({ cookies: () => cookieStore });

    // Get the current user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      throw new Error("Not authenticated");
    }

    // Parse the data from FormData
    const amount = parseFloat(formData.get("amount") as string);
    const tipAmount = parseFloat(formData.get("tipAmount") as string) || 0;
    const date = new Date(formData.get("date") as string);
    const reason = formData.get("reason") as string;
    const category = formData.get("category") as string;
    const pdfUrl = formData.get("pdfUrl") as string;

    // Parse participants from the comma-separated string
    const participants = (formData.get("participants") as string)
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    // Parse location data
    const locationData = {
      name: formData.get("locationName") as string,
      street: formData.get("street") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      country: formData.get("country") as string,
      postalCode: formData.get("postalCode") as string,
    };

    // Only include location if at least one field is filled
    const location = Object.values(locationData).some((v) => v)
      ? locationData
      : null;

    const invoice = {
      amount,
      tipAmount,
      date,
      reason,
      category,
      participants,
      location,
      pdfUrl,
      status: "pending" as InvoiceStatus,
      user_id: session.user.id,
      signingData: {
        signedBy: session.user.email || "System",
        signedAt: new Date(),
      },
    };

    const { error } = await supabase.from("invoices").insert([invoice]);

    if (error) throw error;

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create invoice",
    };
  }
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = cookies();
    const supabase = createServerActionClient({ cookies: () => cookieStore });

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      throw new Error("Not authenticated");
    }

    const { error } = await supabase
      .from("invoices")
      .update({
        status,
        signingData: {
          signedBy: session.user.email || "System",
          signedAt: new Date(),
        },
      })
      .eq("id", id)
      .eq("user_id", session.user.id); // Only update if the invoice belongs to the user

    if (error) {
      throw error;
    }

    revalidatePath(`/invoice/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating invoice status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
