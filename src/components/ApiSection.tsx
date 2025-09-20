import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Play, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleTestEndpoint = (index: number) => {
    const endpoint = endpoints[index];
    
    toast({
      title: "Testing endpoint",
      description: `Testing ${endpoint.method} ${endpoint.path}...`,
    });

    // Simulate API test
    setTimeout(() => {
      setEndpoints(prev => 
        prev.map((ep, i) => 
          i === index ? { ...ep, tested: true } : ep
        )
      );
      
      toast({
        title: "Test successful",
        description: `${endpoint.method} ${endpoint.path} returned 200 OK`,
      });
    }, 1500);
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
      </CardContent>
    </Card>
  );
};

export default ApiSection;