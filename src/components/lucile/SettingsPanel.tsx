
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Key, 
  Bot, 
  Globe, 
  Calendar,
  Mail,
  Database,
  Check,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

const SettingsPanel = () => {
  const [useCache, setUseCache] = useState(true);
  const [parallelProcessing, setParallelProcessing] = useState(true);
  const [autoRename, setAutoRename] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your InvoiceBot preferences and integrations</p>
      </div>

      <Tabs defaultValue="gmail" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gmail">Gmail & API</TabsTrigger>
          <TabsTrigger value="llm">LLM Config</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="gmail" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Gmail Integration
              </CardTitle>
              <CardDescription>
                Configure Gmail API access for automatic invoice fetching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Gmail API Connected</span>
                </div>
                <p className="text-sm text-green-700">
                  Successfully authenticated with Gmail API. Last sync: 2 hours ago
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="credentials">Upload New Credentials (credentials.json)</Label>
                  <div className="mt-2">
                    <Button variant="outline" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Credentials
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Download from Google Cloud Console → APIs & Services → Credentials
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="gmail-query">Gmail Search Query</Label>
                  <Input 
                    id="gmail-query"
                    placeholder="has:attachment filename:pdf invoice OR receipt"
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Customize the search query for finding invoices in Gmail
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llm" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                LLM Configuration
              </CardTitle>
              <CardDescription>
                Choose between local Ollama or OpenAI API for processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>AI Provider</Label>
                  <Select defaultValue="ollama">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ollama">Local Ollama</SelectItem>
                      <SelectItem value="openai">OpenAI API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">Local Ollama</h3>
                        <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                          Free & Private
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>Model</Label>
                        <Select defaultValue="llama3.1">
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="llama3.1">Llama 3.1 8B</SelectItem>
                            <SelectItem value="llama3.1:70b">Llama 3.1 70B</SelectItem>
                            <SelectItem value="mixtral">Mixtral 8x7B</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Ollama URL</Label>
                        <Input defaultValue="http://localhost:11434" className="mt-1" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                        <Key className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">OpenAI API</h3>
                        <Badge variant="secondary" className="text-xs">
                          Paid Service
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>Model</Label>
                        <Select defaultValue="gpt-4">
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>API Key</Label>
                        <Input 
                          type="password" 
                          placeholder="sk-..." 
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Processing Options
              </CardTitle>
              <CardDescription>
                Configure how invoices are processed and organized
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable Response Caching</Label>
                    <p className="text-sm text-gray-500">Save LLM responses to avoid duplicate processing</p>
                  </div>
                  <Switch checked={useCache} onCheckedChange={setUseCache} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Parallel Processing</Label>
                    <p className="text-sm text-gray-500">Process multiple invoices simultaneously</p>
                  </div>
                  <Switch checked={parallelProcessing} onCheckedChange={setParallelProcessing} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-rename by Date</Label>
                    <p className="text-sm text-gray-500">Automatically rename files using detected dates</p>
                  </div>
                  <Switch checked={autoRename} onCheckedChange={setAutoRename} />
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-base">Processing Threads</Label>
                <Select defaultValue="4">
                  <SelectTrigger className="mt-2 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Thread</SelectItem>
                    <SelectItem value="2">2 Threads</SelectItem>
                    <SelectItem value="4">4 Threads</SelectItem>
                    <SelectItem value="8">8 Threads</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Number of parallel processing threads
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Calendar Integration
              </CardTitle>
              <CardDescription>
                Upload calendar file for enhanced context and file naming
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Calendar (.ics)
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">
                    Enhance file names with calendar event context
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    📅 <strong>calendar.ics</strong> uploaded successfully
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Found 24 events for contextual file naming
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Default language, currency, and application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Default Currency</Label>
                  <Select defaultValue="eur">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-6">
                <Label className="text-base">File Organization</Label>
                <div className="mt-3 space-y-2">
                  <Input 
                    placeholder="Invoices/&#123;Category&#125;/&#123;Year&#125;/"
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500">
                    File organization pattern. Available variables: &#123;Category&#125;, &#123;Year&#125;, &#123;Month&#125;, &#123;Vendor&#125;
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPanel;
