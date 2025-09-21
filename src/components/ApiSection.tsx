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
}

const ApiSection = () => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    {
      method: "GET",
      path: "/api/customers",
      description: "Retrieve all customers",
      tested: false
    },
    {
      method: "GET",
      path: "/api/customers/{id}",
      description: "Get customer by ID",
      tested: false
    },
    {
      method: "POST",
      path: "/api/customers",
      description: "Create new customer",
      tested: false
    },
    {
      method: "PUT",
      path: "/api/customers/{id}",
      description: "Update customer",
      tested: false
    },
    {
      method: "DELETE",
      path: "/api/customers/{id}",
      description: "Delete customer",
      tested: false
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

      let functionPath = 'customers';
      if (endpoint.path.includes('{id}')) {
        // For demo, use the first customer's ID if available
        const { data: customers } = await supabase
          .from('legacy_customers')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        
        if (customers && customers.length > 0) {
          functionPath = `customers/${customers[0].id}`;
        } else {
          functionPath = 'customers/demo-id';
        }
      }

      let requestOptions: any = {
        body: {
          path: functionPath,
          method: endpoint.method,
        }
      };

      // Add test data for POST/PUT requests
      if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
        requestOptions.body.data = {
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '555-0123',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postal_code: '12345'
        };
      }

      const { data, error } = await supabase.functions.invoke('customers-api', requestOptions);

      if (error) throw error;

      setEndpoints(prev => 
        prev.map((ep, i) => 
          i === index ? { ...ep, tested: true } : ep
        )
      );
      
      toast({
        title: "Test successful",
        description: `${endpoint.method} ${endpoint.path} - Edge function responded successfully`,
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
          Test your newly created APIs directly from the browser.
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
                description: "These endpoints interact with your legacy_customers table in Supabase. All data is filtered by user authentication.",
              })}
            >
              <Database className="h-4 w-4" />
              View Schema
            </Button>
          </div>
          
          <div className="space-y-3">
            {endpoints.map((endpoint, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Badge variant={getMethodBadgeVariant(endpoint.method)}>
                  {endpoint.method}
                </Badge>
                <div>
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {endpoint.path}
                  </code>
                  <p className="text-sm text-muted-foreground mt-1">
                    {endpoint.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {endpoint.tested && (
                  <CheckCircle className="h-4 w-4 text-success" />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestEndpoint(index)}
                  disabled={endpoint.tested}
                  className="flex items-center gap-2"
                >
                  <Play className="h-3 w-3" />
                  {endpoint.tested ? "Tested" : "Test"}
                </Button>
              </div>
            </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiSection;