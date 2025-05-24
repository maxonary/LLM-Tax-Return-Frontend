"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { InvoiceStatus } from "@/types/invoice";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createInvoice(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = cookies();
    const supabase = createServerActionClient({ cookies: () => cookieStore });

    // Get the current user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    console.log("Auth check:", {
      session: session ? "exists" : "null",
      userId: session?.user?.id,
      authError,
    });

    if (authError || !session?.user) {
      throw new Error("Not authenticated");
    }

    const pdfFile = formData.get("pdf") as File;
    if (!pdfFile) {
      throw new Error("PDF file is required");
    }

    // Upload PDF to Supabase Storage
    const { data: fileData, error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(`${Date.now()}-${pdfFile.name}`, pdfFile);

    console.log("File upload:", {
      success: !!fileData,
      error: uploadError,
    });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("invoices").getPublicUrl(fileData.path);

    const participants = (formData.get("participants") as string)
      .split(",")
      .map((p) => p.trim());

    // Create location object only if any location field is provided
    const locationName = formData.get("locationName") as string;
    const street = formData.get("street") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const country = formData.get("country") as string;
    const postalCode = formData.get("postalCode") as string;

    const location =
      locationName || street || city || state || country || postalCode
        ? {
            name: locationName || undefined,
            street: street || undefined,
            city: city || undefined,
            state: state || undefined,
            country: country || undefined,
            postalCode: postalCode || undefined,
          }
        : undefined;

    const invoice = {
      amount: parseFloat(formData.get("amount") as string),
      tipAmount: parseFloat(formData.get("tipAmount") as string) || 0,
      date: new Date(formData.get("date") as string),
      location,
      reason: formData.get("reason") as string,
      participants,
      signingData: {
        signedBy: session.user.email || "System",
        signedAt: new Date(),
      },
      status: "pending" as InvoiceStatus,
      pdfUrl: publicUrl,
      user_id: session.user.id,
    };

    console.log("Creating invoice:", invoice);

    const { error: insertError, data: insertData } = await supabase
      .from("invoices")
      .insert([invoice])
      .select();

    console.log("Insert result:", {
      success: !!insertData,
      error: insertError,
      data: insertData,
    });

    if (insertError) {
      throw insertError;
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
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
