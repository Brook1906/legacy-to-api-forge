import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, Download, Upload, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface FileHistoryRecord {
  id: string;
  name: string;
  description?: string;
  file_type: 'upload' | 'download';
  file_size?: number;
  created_at: string;
  metadata?: any;
}

const FileHistorySection = () => {
  const [history, setHistory] = useState<FileHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchHistory = async () => {
    if (!user) return;
    
    try {
      // Get uploaded datasets
      const { data: uploads, error: uploadsError } = await supabase
        .from('uploaded_datasets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (uploadsError) throw uploadsError;

      // Transform uploads to history format
      const uploadHistory: FileHistoryRecord[] = uploads?.map(upload => ({
        id: upload.id,
        name: upload.name,
        description: upload.description,
        file_type: 'upload' as const,
        file_size: upload.data?.length || 0,
        created_at: upload.created_at,
        metadata: { records: upload.data?.length || 0 }
      })) || [];

      // For now, we'll only show uploads. Downloads can be tracked separately if needed
      const allHistory = [...uploadHistory];
      
      setHistory(allHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: "Error loading history",
        description: "Failed to fetch file history.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('uploaded_datasets')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "File deleted",
        description: "File has been removed from your history.",
      });

      fetchHistory();
    } catch (error) {
      toast({
        title: "Error deleting file",
        description: "Failed to delete the file.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (record: FileHistoryRecord) => {
    try {
      const { data, error } = await supabase
        .from('uploaded_datasets')
        .select('data')
        .eq('id', record.id)
        .single();

      if (error) throw error;

      const dataStr = JSON.stringify(data.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${record.name}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `${record.name} is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the file.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      await fetchHistory();
      setIsLoading(false);
    };

    if (user) {
      loadHistory();
    }
  }, [user]);

  if (!user) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            File History
          </CardTitle>
          <CardDescription>
            Please sign in to view your file upload and download history.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              File History
            </CardTitle>
            <CardDescription>
              View and manage your uploaded and downloaded files.
            </CardDescription>
          </div>
          <Badge variant="secondary">{history.length} files</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No files yet</h3>
            <p className="text-muted-foreground">
              Upload some files to see them in your history.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.name}</div>
                        {record.description && (
                          <div className="text-sm text-muted-foreground">
                            {record.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={record.file_type === 'upload' ? 'default' : 'secondary'}
                        className="flex items-center gap-1 w-fit"
                      >
                        {record.file_type === 'upload' ? (
                          <Upload className="h-3 w-3" />
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                        {record.file_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.metadata?.records || 0} records
                    </TableCell>
                    <TableCell>
                      {format(new Date(record.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(record)}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                          className="flex items-center gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileHistorySection;