import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Brain, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleGenerateSchema = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockData: SchemaField[] = [
        {
          field: "CUST_ID",
          suggestedName: "customer_id",
          type: "UUID",
          notes: "Primary key - converted from legacy ID"
        },
        {
          field: "CUST_NM",
          suggestedName: "customer_name",
          type: "VARCHAR(255)",
          notes: "Customer full name"
        },
        {
          field: "ADDR_LN1",
          suggestedName: "address_line_1",
          type: "VARCHAR(255)",
          notes: "Primary address line"
        },
        {
          field: "ADDR_LN2",
          suggestedName: "address_line_2",
          type: "VARCHAR(255)",
          notes: "Secondary address line"
        },
        {
          field: "CITY_NM",
          suggestedName: "city",
          type: "VARCHAR(100)",
          notes: "City name"
        },
        {
          field: "ST_CD",
          suggestedName: "state_code",
          type: "CHAR(2)",
          notes: "State abbreviation"
        },
        {
          field: "ZIP_CD",
          suggestedName: "postal_code",
          type: "VARCHAR(10)",
          notes: "ZIP/postal code"
        }
      ];
      
      setSchemaData(mockData);
      setIsAnalyzing(false);
      
      toast({
        title: "Schema analysis complete",
        description: "AI has analyzed your data and generated modern schema suggestions.",
      });
    }, 3000);
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