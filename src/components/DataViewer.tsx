import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CustomerData {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

const DataViewer = () => {
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, session } = useAuth();

  const fetchCustomerData = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase
        .from('legacy_customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCustomerData(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch customer data.",
        variant: "destructive",
      });
    }
  };

  const addSampleData = async () => {
    if (!session) return;
    
    setIsRefreshing(true);
    try {
      const sampleData = [
        {
          user_id: session.user.id,
          name: 'Acme Corporation',
          address: '123 Business Ave',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          phone: '555-0123',
          email: 'contact@acme.com'
        },
        {
          user_id: session.user.id,
          name: 'Global Industries',
          address: '456 Corporate Blvd',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94105',
          phone: '555-0456',
          email: 'info@global.com'
        },
        {
          user_id: session.user.id,
          name: 'Tech Solutions Inc',
          address: '789 Innovation Way',
          city: 'Austin',
          state: 'TX',
          postal_code: '73301',
          phone: '555-0789',
          email: 'hello@techsolutions.com'
        }
      ];

      const { error } = await supabase
        .from('legacy_customers')
        .insert(sampleData);

      if (error) {
        throw error;
      }

      await fetchCustomerData();
      toast({
        title: "Sample Data Added",
        description: "Sample customer data has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add sample data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCustomerData();
    setIsRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Customer data has been updated successfully.",
    });
  };

  useEffect(() => {
    if (session) {
      fetchCustomerData().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [session]);

  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Modernized Data Viewer</CardTitle>
          <CardDescription className="text-muted-foreground">
            Please sign in to view your modernized legacy data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Authentication required to access customer data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl font-semibold">Modernized Data Viewer</CardTitle>
          <CardDescription className="text-muted-foreground">
            View the ingested and transformed legacy customer data
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {customerData.length === 0 && !isLoading && (
            <Button
              variant="outline"
              size="sm"
              onClick={addSampleData}
              disabled={isRefreshing}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Sample Data
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading customer data...</p>
        ) : customerData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No customer data found. Click "Add Sample Data" to get started.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Postal Code</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerData.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.address || '-'}</TableCell>
                  <TableCell>{customer.city || '-'}</TableCell>
                  <TableCell>{customer.state || '-'}</TableCell>
                  <TableCell>{customer.postal_code || '-'}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default DataViewer;