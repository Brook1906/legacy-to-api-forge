import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Play, CheckCircle, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  tested: boolean;
  api: 'datasets' | 'customers' | 'rest' | 'files';
}

const ApiSection = () => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    {
      method: "GET",
      path: "/api/datasets",
      description: "Retrieve all uploaded datasets",
      tested: false,
      api: 'datasets'
    },
    {
      method: "GET",
      path: "/api/datasets/{id}",
      description: "Get specific dataset by ID",
      tested: false,
      api: 'datasets'
    },
    {
      method: "POST",
      path: "/api/datasets",
      description: "Create new dataset",
      tested: false,
      api: 'datasets'
    },
    {
      method: "GET",
      path: "/api/customers",
      description: "Retrieve all legacy customers",
      tested: false,
      api: 'customers'
    },
    {
      method: "POST",
      path: "/api/customers",
      description: "Create new customer record",
      tested: false,
      api: 'customers'
    },
    {
      method: "GET",
      path: "/rest-api/{dataset_name}",
      description: "Access uploaded data as REST API",
      tested: false,
      api: 'rest'
    },
    {
      method: "POST",
      path: "/rest-api/{dataset_name}",
      description: "Add new record to dataset",
      tested: false,
      api: 'rest'
    },
    {
      method: "GET",
      path: "/file-api/list",
      description: "List all uploaded files",
      tested: false,
      api: 'files'
    },
    {
      method: "GET",
      path: "/file-api/download/{id}",
      description: "Download file by ID",
      tested: false,
      api: 'files'
    }
  ]);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleTestEndpoint = async (index: number) => {
    const endpoint = endpoints[index];
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to test endpoints.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Testing endpoint",
      description: `Testing ${endpoint.method} ${endpoint.path}...`,
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

                           endpoint.api === 'rest' ? 'rest-api' :
                           endpoint.api === 'files' ? 'file-api' :
      const functionName = endpoint.api === 'datasets' ? 'datasets-api' : 'customers-api';
      
      let requestOptions: any = {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      };

      // Add test data for POST requests
      if (endpoint.method === 'POST') {
        if (endpoint.api === 'datasets') {
          requestOptions.body = {
            name: 'Test Dataset API',
            description: 'API test dataset',
            data: [{ id: 1, name: 'Sample Record', value: 'test' }]
          };
        } else if (endpoint.api === 'rest') {
          requestOptions.body = {
            test_field: 'test_value',
            created_at: new Date().toISOString()
          };
        } else {
          requestOptions.body = {
            name: 'Test Customer API',
            email: 'test@example.com',
            phone: '555-0123'
          };
        }
      }

      const { data, error } = await supabase.functions.invoke(functionName, requestOptions);

      if (error) throw error;

      setEndpoints(prev => 
        prev.map((ep, i) => 
          i === index ? { ...ep, tested: true } : ep
        )
      );
      
      toast({
        title: "Test successful",
        description: `${endpoint.method} ${endpoint.path} - API responded successfully`,
      });
    } catch (error) {
      toast({
        title: "Test failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case "GET":
        return "default";
      case "POST":
        return "secondary";
      case "PUT":
        return "outline";
      case "DELETE":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          Generated API Endpoints
        </CardTitle>
        <CardDescription>
          Test your auto-generated APIs for datasets and legacy data directly from the browser.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => toast({
                title: "API Documentation",
                description: "These endpoints interact with your uploaded_datasets and legacy_customers tables. All data is filtered by user authentication.",
              })}
            >
              <Database className="h-4 w-4" />
              View Schema
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Dataset Endpoints</h4>
                {endpoints.filter(ep => ep.api === 'datasets').map((endpoint, index) => {
                  const originalIndex = endpoints.findIndex(ep => ep === endpoint);
                  return (
                    <div
                      key={originalIndex}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={getMethodBadgeVariant(endpoint.method)} className="text-xs">
                          {endpoint.method}
                        </Badge>
                        <div>
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                          <p className="text-xs text-muted-foreground mt-1">
                            {endpoint.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {endpoint.tested && (
                          <CheckCircle className="h-3 w-3 text-success" />
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestEndpoint(originalIndex)}
                          disabled={endpoint.tested}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Play className="h-3 w-3" />
                          {endpoint.tested ? "Tested" : "Test"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Legacy Customer Endpoints</h4>
                {endpoints.filter(ep => ep.api === 'customers').map((endpoint, index) => {
                  const originalIndex = endpoints.findIndex(ep => ep === endpoint);
                  return (
                    <div
                      key={originalIndex}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={getMethodBadgeVariant(endpoint.method)} className="text-xs">
                          {endpoint.method}
                        </Badge>
                        <div>
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                          <p className="text-xs text-muted-foreground mt-1">
                            {endpoint.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {endpoint.tested && (
                          <CheckCircle className="h-3 w-3 text-success" />
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestEndpoint(originalIndex)}
                          disabled={endpoint.tested}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Play className="h-3 w-3" />
                          {endpoint.tested ? "Tested" : "Test"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">REST API Endpoints</h4>
                {endpoints.filter(ep => ep.api === 'rest').map((endpoint, index) => {
                  const originalIndex = endpoints.findIndex(ep => ep === endpoint);
                  return (
                    <div
                      key={originalIndex}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={getMethodBadgeVariant(endpoint.method)} className="text-xs">
                          {endpoint.method}
                        </Badge>
                        <div>
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                          <p className="text-xs text-muted-foreground mt-1">
                            {endpoint.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {endpoint.tested && (
                          <CheckCircle className="h-3 w-3 text-success" />
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestEndpoint(originalIndex)}
                          disabled={endpoint.tested}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Play className="h-3 w-3" />
                          {endpoint.tested ? "Tested" : "Test"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">File Management Endpoints</h4>
                {endpoints.filter(ep => ep.api === 'files').map((endpoint, index) => {
                  const originalIndex = endpoints.findIndex(ep => ep === endpoint);
                  return (
                    <div
                      key={originalIndex}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={getMethodBadgeVariant(endpoint.method)} className="text-xs">
                          {endpoint.method}
                        </Badge>
                        <div>
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                          <p className="text-xs text-muted-foreground mt-1">
                            {endpoint.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {endpoint.tested && (
                          <CheckCircle className="h-3 w-3 text-success" />
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestEndpoint(originalIndex)}
                          disabled={endpoint.tested}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Play className="h-3 w-3" />
                          {endpoint.tested ? "Tested" : "Test"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiSection;