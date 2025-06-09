import { Button } from "@/components/ui/button";
import { LogOut, Plus, LayoutDashboard, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavigationProps {
  onSignOut: () => void;
}

export function Navigation({ onSignOut }: NavigationProps) {
  const pathname = usePathname();

  return (
    <div className="bg-white border-b border-gray-200 mb-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-14 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">LLM Tax Return</h1>
          </div>

          {/* Main Navigation */}
          <nav className="flex items-center space-x-4">
            <Link
              href="/overview"
              className={cn(
                "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === "/overview"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Dashboard
            </Link>
            <Link
              href="/"
              className={cn(
                "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === "/"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <FileText className="w-5 h-5 mr-2" />
              Invoices
            </Link>

            <div className="h-6 w-px bg-gray-200" />

            <Button asChild variant="ghost" className="font-medium">
              <Link href="/invoice/new">
                <Plus className="w-5 h-5 mr-2" />
                New Invoice
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
              onClick={onSignOut}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
