
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Upload,
  RefreshCw
} from 'lucide-react';

const InvoicesTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const invoices = [
    { 
      id: 1, 
      date: '2024-05-20', 
      vendor: 'Deutsche Bahn', 
      category: 'Travel', 
      amount: '€89.50', 
      filename: '2024-05-20-travel-berlin.pdf',
      source: 'Gmail',
      status: 'Processed'
    },
    { 
      id: 2, 
      date: '2024-05-19', 
      vendor: 'Uber', 
      category: 'Travel', 
      amount: '€24.80', 
      filename: '2024-05-19-uber-trip.pdf',
      source: 'Gmail',
      status: 'Processed'
    },
    { 
      id: 3, 
      date: '2024-05-18', 
      vendor: 'Restaurant Zur Post', 
      category: 'Food', 
      amount: '€45.20', 
      filename: '2024-05-18-dinner-client.pdf',
      source: 'Local',
      status: 'Needs Review'
    },
    { 
      id: 4, 
      date: '2024-05-17', 
      vendor: 'Amazon AWS', 
      category: 'Software', 
      amount: '€156.00', 
      filename: '2024-05-17-aws-hosting.pdf',
      source: 'Gmail',
      status: 'Processed'
    },
    { 
      id: 5, 
      date: '2024-05-16', 
      vendor: 'Staples', 
      category: 'Office', 
      amount: '€78.90', 
      filename: '2024-05-16-office-supplies.pdf',
      source: 'Local',
      status: 'Processed'
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Processed':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Processed</Badge>;
      case 'Needs Review':
        return <Badge variant="destructive">Needs Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Travel': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Food': return 'bg-green-50 text-green-700 border-green-200';
      case 'Software': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Office': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage and organize your processed invoices</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload PDFs
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4" />
            Sync Gmail
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search invoices by vendor, filename, or amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="office">Office</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Invoice List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Vendor</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Filename</TableHead>
                <TableHead className="font-semibold">Source</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{invoice.date}</TableCell>
                  <TableCell>{invoice.vendor}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(invoice.category)}>
                      {invoice.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{invoice.amount}</TableCell>
                  <TableCell className="max-w-xs truncate" title={invoice.filename}>
                    {invoice.filename}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {invoice.source}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicesTable;
