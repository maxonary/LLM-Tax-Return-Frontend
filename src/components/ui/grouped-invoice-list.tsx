import { Invoice } from "@/types/invoice";
import { format, parseISO } from "date-fns";
import { InvoiceItem } from "./invoice-item";

interface GroupedInvoiceListProps {
  invoices: Invoice[];
}

interface GroupedInvoices {
  [key: string]: {
    [key: string]: Invoice[];
  };
}

export function GroupedInvoiceList({ invoices }: GroupedInvoiceListProps) {
  // Group invoices by year and month
  const groupedInvoices = invoices.reduce((acc: GroupedInvoices, invoice) => {
    const date = parseISO(invoice.date);
    const year = format(date, "yyyy");
    const month = format(date, "MMMM");

    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][month]) {
      acc[year][month] = [];
    }
    acc[year][month].push(invoice);
    return acc;
  }, {});

  // Sort years in descending order
  const sortedYears = Object.keys(groupedInvoices).sort((a, b) =>
    b.localeCompare(a)
  );

  return (
    <div className="space-y-8">
      {sortedYears.map((year) => {
        const months = Object.keys(groupedInvoices[year]);
        // Sort months in descending order
        months.sort((a, b) => {
          const monthA = parseISO(
            `${year}-${format(parseISO(`${year}-${a}-01`), "MM")}-01`
          );
          const monthB = parseISO(
            `${year}-${format(parseISO(`${year}-${b}-01`), "MM")}-01`
          );
          return monthB.getTime() - monthA.getTime();
        });

        return (
          <div key={year} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{year}</h2>
            {months.map((month) => (
              <div key={`${year}-${month}`} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">{month}</h3>
                <div className="space-y-2">
                  {groupedInvoices[year][month]
                    .sort(
                      (a, b) =>
                        parseISO(b.date).getTime() - parseISO(a.date).getTime()
                    )
                    .map((invoice) => (
                      <InvoiceItem key={invoice.id} invoice={invoice} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
