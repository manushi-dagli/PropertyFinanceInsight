
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { readExcelFile, validateImportData, downloadTemplate, EXCEL_TEMPLATES } from "@/utils/excelUtils";

interface ExcelImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
  moduleName: keyof typeof EXCEL_TEMPLATES;
  title: string;
}

const ExcelImportDialog = ({ isOpen, onClose, onImport, moduleName, title }: ExcelImportDialogProps) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      toast({
        title: "Invalid File",
        description: "Please select an Excel file (.xlsx or .xls)",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);

    try {
      const data = await readExcelFile(file);
      const expectedHeaders = EXCEL_TEMPLATES[moduleName];
      const validation = validateImportData(data, expectedHeaders);

      if (!validation.isValid) {
        toast({
          title: "Import Error",
          description: validation.errors.join(', '),
          variant: "destructive"
        });
        setSelectedFile(null);
        return;
      }

      setPreviewData(data.slice(0, 6)); // Show first 5 rows + header
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read Excel file",
        variant: "destructive"
      });
      setSelectedFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      const data = await readExcelFile(selectedFile);
      const dataRows = data.slice(1); // Remove header row
      onImport(dataRows);
      
      toast({
        title: "Success",
        description: `${dataRows.length} records imported successfully`
      });
      
      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewData([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import {title}
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file to import {title.toLowerCase()} data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={() => downloadTemplate(moduleName)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div>
            <Label htmlFor="file-upload">Select Excel File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>

          {previewData.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Preview (First 5 rows)</h3>
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {previewData[0]?.map((header: string, index: number) => (
                        <TableHead key={index}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.slice(1).map((row: any[], index: number) => (
                      <TableRow key={index}>
                        {row.map((cell: any, cellIndex: number) => (
                          <TableCell key={cellIndex}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button onClick={handleClose} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || isLoading}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              {isLoading ? "Importing..." : "Import Data"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelImportDialog;
