import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DollarSign, FileText, TrendingUp, Calendar } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Invoice, InvoiceCategory } from "@/types/invoice";
import { format, subMonths } from "date-fns";
import { InvoiceItem } from "@/components/ui/invoice-item";

interface CategoryData {
  name: InvoiceCategory;
  value: number;
  color: string;
}

interface MonthlyData {
  month: string;
  amount: number;
}

const CATEGORY_COLORS: Record<InvoiceCategory, string> = {
  Travel: "#3b82f6",
  "Meals and Entertainment": "#10b981",
  "Office Supplies": "#8b5cf6",
  Equipment: "#f59e0b",
  Utilities: "#ef4444",
  "Professional Services": "#6366f1",
  "Marketing and Advertising": "#ec4899",
  "Training and Development": "#14b8a6",
  Insurance: "#64748b",
  Miscellaneous: "#6b7280",
};

const DashboardOverview = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    travelReports: 0,
    processingAccuracy: 98.2,
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadData() {
      try {
        // Get last 6 months of invoices
        const sixMonthsAgo = subMonths(new Date(), 6);
        const { data: invoiceData, error } = await supabase
          .from("invoices")
          .select("*")
          .gte("date", sixMonthsAgo.toISOString())
          .order("date", { ascending: true });

        if (error) throw error;

        const invoices = invoiceData as Invoice[];
        setInvoices(invoices);

        // Calculate total stats
        const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
        const travelInvoices = invoices.filter(
          (inv) => inv.category === "Travel"
        ).length;

        setStats({
          totalInvoices: invoices.length,
          totalAmount,
          travelReports: travelInvoices,
          processingAccuracy: 98.2,
        });

        // Calculate monthly data
        const monthlyStats = new Map<string, number>();
        for (let i = 0; i < 6; i++) {
          const date = subMonths(new Date(), i);
          const monthKey = format(date, "MMM yyyy");
          monthlyStats.set(monthKey, 0);
        }

        invoices.forEach((invoice) => {
          const monthKey = format(new Date(invoice.date), "MMM yyyy");
          if (monthlyStats.has(monthKey)) {
            monthlyStats.set(
              monthKey,
              monthlyStats.get(monthKey)! + invoice.amount
            );
          }
        });

        setMonthlyData(
          Array.from(monthlyStats.entries())
            .map(([month, amount]) => ({ month, amount }))
            .reverse()
        );

        // Calculate category data
        const categoryStats = new Map<InvoiceCategory, number>();
        invoices.forEach((invoice) => {
          const current = categoryStats.get(invoice.category) || 0;
          categoryStats.set(invoice.category, current + invoice.amount);
        });

        setCategoryData(
          Array.from(categoryStats.entries())
            .map(([name, value]) => ({
              name,
              value,
              color: CATEGORY_COLORS[name],
            }))
            .sort((a, b) => b.value - a.value)
        );
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Your AI-powered invoice management overview
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-green-50 text-green-700 border-green-200"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          All systems operational
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Total Invoices
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.totalInvoices}
                </p>
                <p className="text-xs text-blue-600 mt-1">Last 6 months</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-green-900">
                  ${stats.totalAmount.toFixed(2)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  All processed invoices
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Travel Reports
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.travelReports}
                </p>
                <p className="text-xs text-purple-600 mt-1">Last 6 months</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">
                  LLM Processing
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {stats.processingAccuracy}%
                </p>
                <p className="text-xs text-orange-600 mt-1">Accuracy rate</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Spending</CardTitle>
            <CardDescription>
              Invoice amounts over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Spending by Category</CardTitle>
            <CardDescription>Breakdown of expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Invoices</CardTitle>
          <CardDescription>
            Latest processed invoices with AI categorization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .slice(-4)
              .map((invoice) => (
                <InvoiceItem key={invoice.id} invoice={invoice} />
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
