import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import FileHistoryTable from "./FileHistoryTable";
import { insertFileHistory } from "@/integrations/supabase/api/file-history";

type UploadStatus = "waiting" | "uploading" | "done";

const UploadSection = () => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("waiting");
  const [progressStep, setProgressStep] = useState<'idle' | 'parsing' | 'transforming' | 'done'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [jsonDownloadUrl, setJsonDownloadUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (user) {
        try {
          await insertFileHistory({
            file_name: file.name,
            action: 'upload',
            user_id: user.id
          });
        } catch (e) {
          console.error('Failed to log upload:', e);
        }
      }
    }
  };

  const parseFileContent = (content: string, fileType: string): any[] => {
    try {
      if (fileType === 'json') {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [parsed];
      } else if (fileType === 'csv') {
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });
        return data;
      } else {
        // For txt and other formats, try to parse as JSON first, then as CSV
        try {
          const parsed = JSON.parse(content);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // Try CSV format
          return parseFileContent(content, 'csv');
        }
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      return [];
    }
  };

  const downloadJson = async () => {
    if (parsedData.length === 0) return;
    const dataStr = JSON.stringify(parsedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    setJsonDownloadUrl(url);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedFile?.name.split('.')[0] || 'data'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (user && selectedFile) {
      try {
        await insertFileHistory({
          file_name: link.download,
          action: 'download',
          user_id: user.id
        });
      } catch (e) {
        console.error('Failed to log download:', e);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload first.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files.",
        variant: "destructive",
      });
      return;
    }

  setUploadStatus("uploading");
  setProgressStep('parsing');
  // Animate progress: parsing (0.7s), transforming (0.7s), done (0.5s)
  setTimeout(() => setProgressStep('transforming'), 700);
  setTimeout(() => setProgressStep('done'), 1400);
    
  try {
      const content = await selectedFile.text();
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || 'txt';
      const parsedContent = parseFileContent(content, fileExtension);
      
      if (parsedContent.length === 0) {
        throw new Error('No valid data found in file');
      }

  setParsedData(parsedContent);
  setTimeout(() => setProgressStep('idle'), 2000);

      // Store the entire dataset as JSONB array in uploaded_datasets table
      const datasetName = selectedFile.name.split('.')[0] || 'Unknown Dataset';
      const { error } = await supabase
        .from('uploaded_datasets')
        .insert([{
          user_id: user.id,
          name: datasetName,
          description: `Uploaded from ${selectedFile.name}`,
          data: parsedContent
        }]);

      if (error) {
        console.error('Error inserting dataset:', error);
        throw error;
      }

      setUploadStatus("done");
      toast({
        title: "Upload successful",
        description: `${selectedFile.name} has been processed and converted to JSON with ${parsedContent.length} records.`,
      });
    } catch (error) {
      setUploadStatus("waiting");
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process file.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    switch (uploadStatus) {
      case "waiting":
        return <Badge variant="secondary">Waiting</Badge>;
      case "uploading":
        return <Badge className="bg-warning text-warning-foreground">Uploading</Badge>;
      case "done":
        return <Badge className="bg-success text-success-foreground">Done</Badge>;
    }
  };

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Legacy Data
              </CardTitle>
              <CardDescription>
                Upload AS/400 flat files, DB2 dumps, or sample CSV data to start modernization.
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,.txt,.log"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                <span className="font-medium">{selectedFile.name}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Choose a file or drag and drop it here
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV, JSON, TXT, and LOG files
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar Animation */}
          {uploadStatus === 'uploading' && (
            <div className="w-full my-4">
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${progressStep === 'parsing' ? 'bg-blue-400 w-1/3' : progressStep === 'transforming' ? 'bg-yellow-400 w-2/3' : progressStep === 'done' ? 'bg-green-500 w-full' : 'w-0'}`}
                  style={{}}
                />
              </div>
              <div className="text-xs text-center mt-1 text-gray-600">
                {progressStep === 'parsing' && 'Parsing...'}
                {progressStep === 'transforming' && 'Transforming...'}
                {progressStep === 'done' && 'Done!'}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadStatus === "uploading"}
            >
              Choose File
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadStatus === "uploading"}
              className="flex items-center gap-2"
            >
              {uploadStatus === "uploading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : uploadStatus === "done" ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Converted
                </>
              ) : (
                "Convert to JSON"
              )}
            </Button>
            {parsedData.length > 0 && (
              <Button
                variant="secondary"
                onClick={downloadJson}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download JSON
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <FileHistoryTable />
    </>
  );
};

export default UploadSection;