import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Brain, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SchemaField {
  field: string;
  suggestedName: string;
  type: string;
  notes: string;
}

const SchemaSection = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [schemaData, setSchemaData] = useState<SchemaField[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerateSchema = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate schema analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Fetch user's uploaded datasets
      const { data: datasets, error } = await supabase
        .from('uploaded_datasets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!datasets || datasets.length === 0) {
        toast({
          title: "No data found",
          description: "Please upload some files first to generate schema analysis.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      // Analyze the most recent dataset
      const latestDataset = datasets[0];
      const sampleData = latestDataset.data;

      if (!sampleData || sampleData.length === 0) {
        toast({
          title: "No data to analyze",
          description: "The selected dataset appears to be empty.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      // Analyze the first record to determine schema
      const firstRecord = sampleData[0];
      const fields = Object.keys(firstRecord);
      
      const analyzedSchema: SchemaField[] = fields.map(field => {
        const value = firstRecord[field];
        let suggestedType = "VARCHAR(255)";
        let notes = "Detected from uploaded data";

        // Determine type based on value
        if (typeof value === 'number') {
          if (Number.isInteger(value)) {
            suggestedType = "INTEGER";
            notes = "Numeric integer field";
          } else {
            suggestedType = "DECIMAL(10,2)";
            notes = "Numeric decimal field";
          }
        } else if (typeof value === 'boolean') {
          suggestedType = "BOOLEAN";
          notes = "Boolean field";
        } else if (value && typeof value === 'string') {
          if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
            suggestedType = "TIMESTAMP";
            notes = "Date/time field";
          } else if (value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            suggestedType = "VARCHAR(255)";
            notes = "Email address field";
          } else if (value.length > 255) {
            suggestedType = "TEXT";
            notes = "Long text field";
          }
        }

        // Generate suggested modern name
        const suggestedName = field
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');

        return {
          field,
          suggestedName,
          type: suggestedType,
          notes
        };
      });
      
      setSchemaData(analyzedSchema);
      setIsAnalyzing(false);
      
      toast({
        title: "Schema analysis complete",
        description: `Analyzed ${fields.length} fields from "${latestDataset.name}".`,
      });
    } catch (error) {
      console.error('Schema analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze your uploaded data.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Schema Analysis
        </CardTitle>
        <CardDescription>
          Automatically detect entities, primary keys, and propose a modern schema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGenerateSchema}
          disabled={isAnalyzing}
          className="flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing Schema...
            </>
          ) : (
            "Generate Schema"
          )}
        </Button>

        {schemaData.length > 0 && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Legacy Field</TableHead>
                  <TableHead>Suggested Name</TableHead>
                  <TableHead>Modern Type</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schemaData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">{row.field}</TableCell>
                    <TableCell className="font-medium">{row.suggestedName}</TableCell>
                    <TableCell className="text-primary font-medium">{row.type}</TableCell>
                    <TableCell className="text-muted-foreground">{row.notes}</TableCell>
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

export default SchemaSection;