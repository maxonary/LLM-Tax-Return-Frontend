
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, 
  Plus, 
  FileSpreadsheet, 
  Calendar,
  Globe,
  Eye,
  RefreshCw
} from 'lucide-react';

const TravelReports = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const reports = [
    {
      id: 1,
      year: '2024',
      language: 'EN',
      filename: 'travel_report_2024_en.xlsx',
      generatedDate: '2024-05-20',
      totalAmount: '€4,280.50',
      trips: 12,
      meals: 28,
      status: 'Generated'
    },
    {
      id: 2,
      year: '2024',
      language: 'DE',
      filename: 'reisekosten_2024_de.xlsx',
      generatedDate: '2024-05-20',
      totalAmount: '€4,280.50',
      trips: 12,
      meals: 28,
      status: 'Generated'
    },
    {
      id: 3,
      year: '2023',
      language: 'EN',
      filename: 'travel_report_2023_en.xlsx',
      generatedDate: '2024-01-15',
      totalAmount: '€3,950.80',
      trips: 15,
      meals: 32,
      status: 'Generated'
    },
  ];

  const upcomingTrips = [
    {
      id: 1,
      destination: 'Berlin Conference',
      dates: 'Jun 15-17, 2024',
      estimatedCost: '€380.00',
      calendarMatch: true
    },
    {
      id: 2,
      destination: 'Munich Client Meeting',
      dates: 'Jul 02-03, 2024',
      estimatedCost: '€220.00',
      calendarMatch: true
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Reports</h1>
          <p className="text-gray-600 mt-1">Generate and manage Excel travel expense reports</p>
        </div>
      </div>

      {/* Generate New Report */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate New Report
          </CardTitle>
          <CardDescription>
            Create a comprehensive travel expense report with automatic categorization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <FileSpreadsheet className="w-4 h-4" />
                Generate Report
              </Button>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Use Cache
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>🔄 Uses parallel processing for faster generation</p>
            <p>📅 Includes calendar context for enhanced trip descriptions</p>
            <p>🤖 AI-powered expense categorization and validation</p>
          </div>
        </CardContent>
      </Card>

      {/* Generated Reports */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Generated Reports</CardTitle>
          <CardDescription>Download and manage your travel expense reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{report.filename}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500">Generated: {report.generatedDate}</span>
                      <Badge className="text-xs" variant="outline">
                        <Globe className="w-3 h-3 mr-1" />
                        {report.language}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{report.totalAmount}</p>
                    <p className="text-sm text-gray-500">{report.trips} trips • {report.meals} meals</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Trips */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Calendar-Linked Trips
          </CardTitle>
          <CardDescription>
            Trips detected from your calendar that may generate expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingTrips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{trip.destination}</p>
                    <p className="text-sm text-gray-600">{trip.dates}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{trip.estimatedCost}</p>
                    <p className="text-sm text-blue-600">Estimated cost</p>
                  </div>
                  {trip.calendarMatch && (
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      📅 Calendar Match
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelReports;
