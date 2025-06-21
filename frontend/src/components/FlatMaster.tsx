import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building,
  Save,
  Edit,
  Trash2,
  Home,
  Users,
  Upload,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExcelImportDialog from "./ExcelImportDialog";
import { exportToExcel } from "@/utils/excelUtils";
import { EXCEL_MODULE_NAMES, EXCEL_TEMPLATES } from "@/types/excel.types";

interface FlatData {
  id: string;
  flatNumber: string;
  wingId: string;
  wingName: string;
  projectName: string;
  companyName: string;
  carpetArea: number;
  status: string;
  agreementValue?: number;
}

interface Wing {
  id: string;
  wingName: string;
  projectName: string;
  companyName: string;
  constructionArea: number;
}

interface Company {
  id: string;
  companyName: string;
}

const FlatMaster = ({ reportingDate }: { reportingDate: string }) => {
  const { toast } = useToast();
  const [flats, setFlats] = useState<FlatData[]>([]);
  const [wings, setWings] = useState<Wing[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedFlats, setSelectedFlats] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentFlat, setCurrentFlat] = useState<FlatData>({
    id: "",
    flatNumber: "",
    wingId: "",
    wingName: "",
    projectName: "",
    companyName: "",
    carpetArea: 0,
    status: "Available",
    agreementValue: 0,
  });

  useEffect(() => {
    const savedWings = localStorage.getItem("wings");
    if (savedWings) {
      const wingsData = JSON.parse(savedWings);
      setWings(wingsData);
    }

    const savedCompanies = localStorage.getItem("companies");
    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    }
  }, []);

  useEffect(() => {
    const savedFlats = localStorage.getItem("flats");
    if (savedFlats) {
      setFlats(JSON.parse(savedFlats));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("flats", JSON.stringify(flats));
  }, [flats]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedFlats(flats.map((flat) => flat.id));
    } else {
      setSelectedFlats([]);
    }
  };

  const handleSelectFlat = (flatId: string, checked: boolean) => {
    if (checked) {
      setSelectedFlats((prev) => [...prev, flatId]);
    } else {
      setSelectedFlats((prev) => prev.filter((id) => id !== flatId));
      setSelectAll(false);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedFlats.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select flats to delete",
        variant: "destructive",
      });
      return;
    }

    setFlats((prev) => prev.filter((flat) => !selectedFlats.includes(flat.id)));
    setSelectedFlats([]);
    setSelectAll(false);

    toast({
      title: "Success",
      description: `${selectedFlats.length} flat(s) deleted successfully`,
    });
  };

  const handleDeleteAll = () => {
    if (flats.length === 0) {
      toast({
        title: "No Data",
        description: "No flats to delete",
        variant: "destructive",
      });
      return;
    }

    setFlats([]);
    setSelectedFlats([]);
    setSelectAll(false);

    toast({
      title: "Success",
      description: "All flats deleted successfully",
    });
  };

  const handleExcelExport = () => {
    if (flats.length === 0) {
      toast({
        title: "No Data",
        description: "No flats data available to export",
        variant: "destructive",
      });
      return;
    }

    const exportData = flats.map((flat) => [
      flat.flatNumber,
      flat.wingName,
      flat.companyName,
      flat.carpetArea,
      flat.agreementValue || "",
      flat.status,
    ]);

    exportToExcel(
      exportData,
      EXCEL_MODULE_NAMES.FLAT_MASTER,
      EXCEL_TEMPLATES.flats
    );

    toast({
      title: "Success",
      description: "Flats data exported successfully",
    });
  };

  const handleExcelImport = (data: any[]) => {
    const importedFlats = data.map((row, index) => {
      const flatNumber = row[0]?.toString() || "";
      const wingName = row[1]?.toString() || "";
      const companyName = row[2]?.toString() || "";
      const carpetArea = parseFloat(row[3]) || 0;
      const agreementValue = parseFloat(row[4]) || 0;
      const status = row[5]?.toString() || "Available";

      const selectedWing = wings.find(
        (wing) =>
          wing.wingName?.toLowerCase().trim() ===
            wingName.toLowerCase().trim() &&
          wing.companyName?.toLowerCase().trim() ===
            companyName.toLowerCase().trim()
      );
      if (!selectedWing && wingName) {
        console.warn(
          `Wing not found for row ${
            index + 1
          }: ${wingName} with company: ${companyName}.`
        );
      }
      return {
        id: Date.now().toString() + index,
        flatNumber,
        wingId: selectedWing?.id || "",
        wingName: selectedWing?.wingName || wingName,
        projectName: selectedWing?.projectName || "",
        companyName: selectedWing?.companyName || companyName,
        carpetArea,
        agreementValue,
        status,
      };
    });

    const validFlats = importedFlats.filter(
      (flat) => flat.flatNumber && flat.carpetArea > 0
    );

    if (validFlats.length !== importedFlats.length) {
      toast({
        title: "Warning",
        description: `${
          importedFlats.length - validFlats.length
        } rows were skipped due to missing required data`,
        variant: "destructive",
      });
    }

    setFlats((prev) => [...prev, ...validFlats]);

    toast({
      title: "Success",
      description: `${validFlats.length} flats imported successfully`,
    });
  };

  const handleInputChange = (field: keyof FlatData, value: string | number) => {
    setCurrentFlat((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWingChange = (wingId: string) => {
    const selectedWing = wings.find((wing) => wing.id === wingId);
    if (selectedWing) {
      setCurrentFlat((prev) => ({
        ...prev,
        wingId,
        wingName: selectedWing.wingName,
        projectName: selectedWing.projectName,
        companyName: selectedWing.companyName,
      }));
    }
  };

  const calculateWingAllocatedArea = (wingId: string) => {
    return flats
      .filter((flat) => flat.wingId === wingId)
      .reduce((total, flat) => total + flat.carpetArea, 0);
  };

  const validateAreaAllocation = (
    wingId: string,
    newCarpetArea: number,
    excludeFlatId?: string
  ) => {
    const wing = wings.find((w) => w.id === wingId);
    if (!wing) return { valid: false, message: "Wing not found" };

    const currentAllocated = flats
      .filter((flat) => flat.wingId === wingId && flat.id !== excludeFlatId)
      .reduce((total, flat) => total + flat.carpetArea, 0);

    const totalAfterAddition = currentAllocated + newCarpetArea;

    if (totalAfterAddition > wing.constructionArea) {
      return {
        valid: false,
        message: `The Carpet Area of this flat exceeds the Construction Area of the assigned wing. Wing Construction Area: ${
          wing.constructionArea
        } sq.m, Currently allocated: ${currentAllocated} sq.m, Remaining: ${
          wing.constructionArea - currentAllocated
        } sq.m`,
      };
    }

    return { valid: true, message: "" };
  };

  const handleSave = () => {
    if (!currentFlat.flatNumber.trim() || !currentFlat.wingId) {
      toast({
        title: "Validation Error",
        description: "Flat number and wing selection are required",
        variant: "destructive",
      });
      return;
    }

    if (currentFlat.carpetArea <= 0) {
      toast({
        title: "Validation Error",
        description: "Carpet area must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(currentFlat.carpetArea)) {
      toast({
        title: "Validation Error",
        description: "Carpet area must be a valid numeric value",
        variant: "destructive",
      });
      return;
    }

    const duplicateFlat = flats.find(
      (flat) =>
        flat.wingId === currentFlat.wingId &&
        flat.flatNumber === currentFlat.flatNumber &&
        flat.id !== editingId
    );

    if (duplicateFlat) {
      toast({
        title: "Validation Error",
        description: "Flat number already exists in this wing",
        variant: "destructive",
      });
      return;
    }

    const validation = validateAreaAllocation(
      currentFlat.wingId,
      currentFlat.carpetArea,
      editingId || undefined
    );
    if (!validation.valid) {
      toast({
        title: "Area Validation Error",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      setFlats((prev) =>
        prev.map((flat) =>
          flat.id === editingId ? { ...currentFlat, id: editingId } : flat
        )
      );
      setEditingId(null);
      toast({
        title: "Success",
        description: "Flat updated successfully",
      });
    } else {
      const newFlat = { ...currentFlat, id: Date.now().toString() };
      setFlats((prev) => [...prev, newFlat]);
      toast({
        title: "Success",
        description: "Flat added successfully",
      });
    }

    setCurrentFlat({
      id: "",
      flatNumber: "",
      wingId: "",
      wingName: "",
      projectName: "",
      companyName: "",
      carpetArea: 0,
      status: "Available",
      agreementValue: 0,
    });
  };

  const handleEdit = (flat: FlatData) => {
    setCurrentFlat(flat);
    setEditingId(flat.id);
  };

  const handleDelete = (id: string) => {
    setFlats((prev) => prev.filter((flat) => flat.id !== id));
    toast({
      title: "Success",
      description: "Flat deleted successfully",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setCurrentFlat({
      id: "",
      flatNumber: "",
      wingId: "",
      wingName: "",
      projectName: "",
      companyName: "",
      carpetArea: 0,
      status: "Available",
      agreementValue: 0,
    });
  };

  const handleCustomerLink = (flatId: string) => {
    localStorage.setItem("selectedFlatForCustomer", flatId);
    toast({
      title: "Info",
      description: "Go to Customer tab to add customer details for this flat",
    });
  };

  const getWingAreaSummary = (wingId: string) => {
    const wing = wings.find((w) => w.id === wingId);
    const allocatedArea = calculateWingAllocatedArea(wingId);
    return {
      totalArea: wing?.constructionArea || 0,
      allocatedArea,
      remainingArea: (wing?.constructionArea || 0) - allocatedArea,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Flat Master
              </CardTitle>
              <CardDescription>
                Manage flat details and carpet areas linked to wings
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsImportDialogOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import Excel
              </Button>
              <Button
                onClick={handleExcelExport}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bulk Actions */}
      {flats.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all">
                    Select All ({flats.length})
                  </Label>
                </div>
                {selectedFlats.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedFlats.length} selected
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDeleteSelected}
                  variant="destructive"
                  size="sm"
                  disabled={selectedFlats.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
                <Button
                  onClick={handleDeleteAll}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flat Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {editingId ? "Edit Flat" : "Add New Flat"}
          </CardTitle>
          <CardDescription>
            Enter flat details and carpet area allocation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">
                Basic Information
              </h3>

              <div>
                <Label htmlFor="wing-select">Wing *</Label>
                <Select
                  value={currentFlat.wingId}
                  onValueChange={handleWingChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a wing" />
                  </SelectTrigger>
                  <SelectContent>
                    {wings.map((wing) => (
                      <SelectItem key={wing.id} value={wing.id}>
                        {wing.companyName} - {wing.projectName} -{" "}
                        {wing.wingName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="company-select">Company Name *</Label>
                <Select
                  value={currentFlat.companyName || ""}
                  onValueChange={(value) =>
                    handleInputChange("companyName", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.companyName}>
                        {company.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentFlat.wingId && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">
                    Wing Area Summary
                  </h4>
                  {(() => {
                    const summary = getWingAreaSummary(currentFlat.wingId);
                    return (
                      <div className="text-sm text-blue-800 mt-1">
                        <p>Total Area: {summary.totalArea} sq.m</p>
                        <p>Allocated: {summary.allocatedArea} sq.m</p>
                        <p>Remaining: {summary.remainingArea} sq.m</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div>
                <Label htmlFor="flat-number">Flat Number *</Label>
                <Input
                  id="flat-number"
                  value={currentFlat.flatNumber}
                  onChange={(e) =>
                    handleInputChange("flatNumber", e.target.value)
                  }
                  placeholder="e.g., 101"
                />
              </div>

              <div>
                <Label htmlFor="carpet-area">Carpet Area (Sq.m) *</Label>
                <Input
                  id="carpet-area"
                  type="number"
                  step="0.01"
                  value={currentFlat.carpetArea}
                  onChange={(e) =>
                    handleInputChange(
                      "carpetArea",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="Enter carpet area"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">
                Additional Details
              </h3>

              <div>
                <Label htmlFor="agreement-value">Agreement Value</Label>
                <Input
                  id="agreement-value"
                  type="number"
                  step="0.01"
                  value={currentFlat.agreementValue || 0}
                  onChange={(e) =>
                    handleInputChange(
                      "agreementValue",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="Agreement value"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={currentFlat.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Booked">Booked</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {currentFlat.wingId && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">
                    Selected Wing Details
                  </h4>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>Company: {currentFlat.companyName}</p>
                    <p>Project: {currentFlat.projectName}</p>
                    <p>Wing: {currentFlat.wingName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {editingId && (
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {editingId ? "Update Flat" : "Save Flat"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flats List */}
      {flats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registered Flats</CardTitle>
            <CardDescription>
              List of all flats in the system grouped by wings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {wings.map((wing) => {
                const wingFlats = flats.filter(
                  (flat) => flat.wingId === wing.id
                );
                if (wingFlats.length === 0) return null;

                const summary = getWingAreaSummary(wing.id);

                return (
                  <div
                    key={wing.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {wing.companyName} - {wing.projectName} -{" "}
                          {wing.wingName}
                        </h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <span>Total Area: {summary.totalArea} sq.m | </span>
                          <span>
                            Allocated: {summary.allocatedArea} sq.m |{" "}
                          </span>
                          <span>Remaining: {summary.remainingArea} sq.m</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {wingFlats.length} flat
                          {wingFlats.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {wingFlats.map((flat) => (
                        <div
                          key={flat.id}
                          className="p-3 border border-gray-100 rounded-lg bg-gray-50"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-2">
                              <Checkbox
                                checked={selectedFlats.includes(flat.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectFlat(flat.id, checked as boolean)
                                }
                              />
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {flat.flatNumber}
                                </h4>
                                <div className="text-sm text-gray-600 mt-1">
                                  <p>Area: {flat.carpetArea} sq.m</p>
                                  <p>
                                    Status:{" "}
                                    <span
                                      className={`font-medium ${
                                        flat.status === "Available"
                                          ? "text-green-600"
                                          : flat.status === "Booked"
                                          ? "text-blue-600"
                                          : flat.status === "Sold"
                                          ? "text-purple-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {flat.status}
                                    </span>
                                  </p>
                                </div>
                                <Button
                                  onClick={() => handleCustomerLink(flat.id)}
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 h-7 text-xs flex items-center gap-1"
                                >
                                  <Users className="h-3 w-3" />
                                  Add Customer
                                </Button>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                onClick={() => handleEdit(flat)}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(flat.id)}
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Excel Import Dialog */}
      <ExcelImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleExcelImport}
        moduleName="flats"
        title="Flats"
      />
    </div>
  );
};

export default FlatMaster;
