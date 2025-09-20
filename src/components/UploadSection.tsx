import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UploadStatus = "waiting" | "uploading" | "done";

const UploadSection = () => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("waiting");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload first.",
        variant: "destructive",
      });
      return;
    }

    setUploadStatus("uploading");
    
    // Simulate upload process
    setTimeout(() => {
      setUploadStatus("done");
      toast({
        title: "Upload successful",
        description: `${selectedFile.name} has been uploaded and is ready for analysis.`,
      });
    }, 2000);
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
            accept=".csv,.json,.txt"
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
                Supports CSV, JSON, and TXT files
              </p>
            </div>
          )}
        </div>

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
                Uploading...
              </>
            ) : uploadStatus === "done" ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Uploaded
              </>
            ) : (
              "Upload Data"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadSection;