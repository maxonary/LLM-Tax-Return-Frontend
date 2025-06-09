"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Navigation } from "@/components/ui/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import DashboardOverview from "@/components/lucile/DashboardOverview";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Navigation onSignOut={handleSignOut} />
      <DashboardOverview />
    </main>
  );
}
