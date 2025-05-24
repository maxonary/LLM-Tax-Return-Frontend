"use server";

import { supabase } from "@/lib/supabase";
import { Invoice, InvoiceStatus } from "@/types/invoice";
import { revalidatePath } from "next/cache";

export async function createInvoice(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const pdfFile = formData.get("pdf") as File;
    if (!pdfFile) {
      throw new Error("PDF file is required");
    }

    // Upload PDF to Supabase Storage
    const { data: fileData, error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(`${Date.now()}-${pdfFile.name}`, pdfFile);

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

    const invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt"> = {
      amount: parseFloat(formData.get("amount") as string),
      tipAmount: parseFloat(formData.get("tipAmount") as string) || 0,
      date: new Date(formData.get("date") as string),
      location,
      reason: formData.get("reason") as string,
      participants,
      signingData: {
        signedBy: "System",
        signedAt: new Date(),
      },
      status: "pending" as InvoiceStatus,
      pdfUrl: publicUrl,
    };

    const { error: insertError } = await supabase
      .from("invoices")
      .insert([invoice]);

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
    const { error } = await supabase
      .from("invoices")
      .update({
        status,
        signingData: {
          signedBy: "System",
          signedAt: new Date(),
        },
      })
      .eq("id", id);

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
