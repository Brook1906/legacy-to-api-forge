import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CustomerData {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

const DataViewer = () => {
  const [customerData, setCustomerData] = useState<CustomerData[]>([
    {
      id: "CUST-001",
      name: "Acme Corporation",
      address: "123 Business Ave",
      city: "New York",
      state: "NY",
      postalCode: "10001"
    },
    {
      id: "CUST-002",
      name: "Global Industries Inc",
      address: "456 Enterprise Blvd",
      city: "Chicago",
      state: "IL",
      postalCode: "60601"
    },
    {
      id: "CUST-003",
      name: "Tech Solutions LLC",
      address: "789 Innovation Dr",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105"
    },
    {
      id: "CUST-004",
      name: "Manufacturing Plus",
      address: "321 Industrial Way",
      city: "Detroit",
      state: "MI",
      postalCode: "48201"
    },
    {
      id: "CUST-005",
      name: "Service Masters Corp",
      address: "654 Commerce St",
      city: "Austin",
      state: "TX",
      postalCode: "73301"
    }
  ]);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Data refreshed",
        description: "Customer data has been updated from the database.",
      });
    }, 1000);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Modernized Data Viewer
            </CardTitle>
            <CardDescription>
              View the ingested and transformed data in a clean table.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Postal Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerData.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-mono text-sm">{customer.id}</TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.city}</TableCell>
                  <TableCell>{customer.state}</TableCell>
                  <TableCell>{customer.postalCode}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataViewer;