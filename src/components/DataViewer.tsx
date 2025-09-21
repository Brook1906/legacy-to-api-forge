import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DatasetRecord {
  id: string;
  name: string;
  description?: string;
  data: any[];
  created_at: string;
  updated_at: string;
}

const DataViewer = () => {
  const [datasets, setDatasets] = useState<DatasetRecord[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<DatasetRecord | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchDatasets = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('uploaded_datasets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDatasets(data || []);
      
      // Auto-select the latest dataset if none selected
      if (data && data.length > 0 && !selectedDataset) {
        setSelectedDataset(data[0]);
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
      toast({
        title: "Error loading data",
        description: "Failed to fetch datasets from the database.",
        variant: "destructive",
      });
    }
  };

  const getDataColumns = () => {
    if (!selectedDataset || !selectedDataset.data || selectedDataset.data.length === 0) {
      return [];
    }
    
    const firstRecord = selectedDataset.data[0];
    return Object.keys(firstRecord);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDatasets();
    setIsRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchDatasets();
      setIsLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  if (!user) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Modernized Data Viewer
          </CardTitle>
          <CardDescription>
            Please sign in to view your uploaded datasets.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Modernized Data Viewer
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const columns = getDataColumns();

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
              View your uploaded datasets same to same as they were converted to JSON.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {datasets.length > 0 && (
              <Badge variant="secondary">{datasets.length} datasets</Badge>
            )}
            {selectedDataset && (
              <Badge variant="outline">{selectedDataset.data.length} records</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {datasets.length === 0 ? (
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No datasets available</h3>
            <p className="text-muted-foreground mb-4">
              Upload some legacy data files to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {datasets.map((dataset) => (
                  <Button
                    key={dataset.id}
                    variant={selectedDataset?.id === dataset.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDataset(dataset)}
                  >
                    {dataset.name}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {selectedDataset && selectedDataset.data.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 bg-muted/50 border-b">
                  <h4 className="font-medium">{selectedDataset.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedDataset.description}</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead key={column}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedDataset.data.map((record, index) => (
                      <TableRow key={index}>
                        {columns.map((column) => (
                          <TableCell key={column}>
                            {typeof record[column] === 'object' 
                              ? JSON.stringify(record[column])
                              : record[column]?.toString() || 'N/A'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataViewer;