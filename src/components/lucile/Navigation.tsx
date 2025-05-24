
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  MapPin, 
  Receipt, 
  Settings,
  Mail,
  Calendar,
  Bot,
  FileSpreadsheet
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/' },
    { id: 'invoices', label: 'Invoices', icon: FileText, badge: '154', route: '/' },
    { id: 'travel-reports', label: 'Travel Reports', icon: MapPin, route: '/' },
    { id: 'bewirtungsbeleg', label: 'Bewirtungsbelege', icon: Receipt, route: '/' },
    { id: 'xrechnung-export', label: 'XRechnung Export', icon: FileSpreadsheet, route: '/export-xrechnung' },
    { id: 'gmail-sync', label: 'Gmail Sync', icon: Mail, route: '/gmail-sync' },
    { id: 'settings', label: 'Settings', icon: Settings, route: '/' },
  ];

  const handleNavigation = (item: any) => {
    if (item.route === '/') {
      setActiveTab(item.id);
      navigate('/');
    } else {
      navigate(item.route);
    }
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-10">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">InvoiceBot</h1>
            <p className="text-sm text-gray-500">AI Invoice Manager</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = (location.pathname === item.route && item.route !== '/') || 
                           (location.pathname === '/' && activeTab === item.id);
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-11 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => handleNavigation(item)}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
        
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Calendar Sync</span>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Enhanced file naming with calendar context
          </p>
          <Button size="sm" variant="outline" className="w-full">
            Upload .ics File
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
