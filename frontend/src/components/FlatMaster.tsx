import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  createFlatApi,
  getFlatsListApi,
  updateFlatApi,
  deleteFlatApi,
} from "@/api/flat.api";
import { getWingsListApi } from "@/api/wing.api";
import { mapFlatToApi, mapFlatFromApi, mapWingFromApi } from "@/utils/dataMapper";

const flatSchema = z.object({
  flatNumber: z.string().min(1, "Flat number is required"),
  wingId: z.string().min(1, "Wing selection is required"),
  carpetArea: z.number().positive("Carpet area must be greater than 0"),
  status: z.string().optional(),
  agreementValue: z.number().min(0).default(0),
});

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

  const form = useForm<z.infer<typeof flatSchema>>({
    resolver: zodResolver(flatSchema),
    defaultValues: {
      flatNumber: "",
      wingId: "",
      carpetArea: 0,
      status: "Available",
      agreementValue: 0,
    },
  });

  useEffect(() => {
    loadWings();
    loadFlats();
  }, []);

  const loadWings = async () => {
    try {
      const data = await getWingsListApi();
      const mappedWings = (data || []).map((wing: any) => ({
        id: wing.id,
        wingName: wing.wing_name,
        projectId: wing.project_id,
        projectName: wing.project_name || "",
        companyName: wing.company_name || "",
        constructionArea: Number(wing.construction_area) || 0,
      }));
      setWings(mappedWings);
    } catch (error) {
      console.error("Error loading wings:", error);
      toast({
        title: "Error",
        description: "Failed to load wings",
        variant: "destructive",
      });
    }
  };

  const loadFlats = async () => {
    try {
      const data = await getFlatsListApi();
      // Need to join with wings to get wing details
      const mappedFlats = await Promise.all(
        (data || []).map(async (flat: any) => {
          const wing = wings.find((w) => w.id === flat.wing_id);
          return {
            id: flat.id,
            flatNumber: flat.flat_number,
            wingId: flat.wing_id,
            wingName: wing?.wingName || "",
            projectName: wing?.projectName || "",
            companyName: wing?.companyName || "",
            carpetArea: Number(flat.carpet_area) || 0,
            status: flat.status || "Available",
            agreementValue: Number(flat.agreement_value) || 0,
          };
        })
      );
      setFlats(mappedFlats);
    } catch (error) {
      console.error("Error loading flats:", error);
      toast({
        title: "Error",
        description: "Failed to load flats",
        variant: "destructive",
      });
    }
  };

  // Reload flats when wings are loaded
  useEffect(() => {
    if (wings.length > 0) {
      loadFlats();
    }
  }, [wings.length]);

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

  const handleDeleteSelected = async () => {
    if (selectedFlats.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select flats to delete",
        variant: "destructive",
      });
      return;
    }

    try {
      await Promise.all(selectedFlats.map((id) => deleteFlatApi(id)));
      setFlats((prev) => prev.filter((flat) => !selectedFlats.includes(flat.id)));
      setSelectedFlats([]);
      setSelectAll(false);
      toast({
        title: "Success",
        description: `${selectedFlats.length} flat(s) deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting flats:", error);
      toast({
        title: "Error",
        description: "Failed to delete some flats. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAll = async () => {
    if (flats.length === 0) {
      toast({
        title: "No Data",
        description: "No flats to delete",
        variant: "destructive",
      });
      return;
    }

    try {
      await Promise.all(flats.map(flat => deleteFlatApi(flat.id)));
      setFlats([]);
      setSelectedFlats([]);
      setSelectAll(false);
      toast({
        title: "Success",
        description: "All flats deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting all flats:", error);
      toast({
        title: "Error",
        description: "Failed to delete all flats. Please try again.",
        variant: "destructive",
      });
    }
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

  const handleExcelImport = async (data: any[]) => {
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
      (flat) => flat.flatNumber && flat.carpetArea > 0 && flat.wingId
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

    try {
      const apiDataArray = validFlats.map(flat => mapFlatToApi({
        flatNumber: flat.flatNumber,
        wingId: flat.wingId,
        carpetArea: flat.carpetArea,
        status: flat.status,
        agreementValue: flat.agreementValue,
      }));

      // Create all flats in Supabase
      const results = await Promise.all(
        apiDataArray.map(data => createFlatApi(data))
      );

      // Reload flats to get the full data with wing details
      await loadFlats();

      toast({
        title: "Success",
        description: `${validFlats.length} flats imported successfully`,
      });
    } catch (error) {
      console.error("Error importing flats:", error);
      toast({
        title: "Error",
        description: "Failed to import some flats. Please try again.",
        variant: "destructive",
      });
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

  const handleSave = async (values: z.infer<typeof flatSchema>) => {
    const duplicateFlat = flats.find(
      (flat) =>
        flat.wingId === values.wingId &&
        flat.flatNumber === values.flatNumber &&
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
      values.wingId,
      values.carpetArea,
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

    try {
      const selectedWing = wings.find((w) => w.id === values.wingId);
      const apiData = mapFlatToApi({
        flatNumber: values.flatNumber,
        wingId: values.wingId,
        carpetArea: values.carpetArea,
        status: values.status,
        agreementValue: values.agreementValue,
      });

      if (editingId) {
        const response = await updateFlatApi(apiData, editingId);
        const updatedFlat: FlatData = {
          id: response.id,
          flatNumber: response.flat_number,
          wingId: response.wing_id,
          wingName: selectedWing?.wingName || "",
          projectName: selectedWing?.projectName || "",
          companyName: selectedWing?.companyName || "",
          carpetArea: Number(response.carpet_area) || 0,
          status: response.status || "Available",
          agreementValue: Number(response.agreement_value) || 0,
        };
        setFlats((prev) =>
          prev.map((flat) => (flat.id === editingId ? updatedFlat : flat))
        );
        toast({
          title: "Success",
          description: "Flat updated successfully",
        });
      } else {
        const response = await createFlatApi(apiData);
        const newFlat: FlatData = {
          id: response.id,
          flatNumber: response.flat_number,
          wingId: response.wing_id,
          wingName: selectedWing?.wingName || "",
          projectName: selectedWing?.projectName || "",
          companyName: selectedWing?.companyName || "",
          carpetArea: Number(response.carpet_area) || 0,
          status: response.status || "Available",
          agreementValue: Number(response.agreement_value) || 0,
        };
        setFlats((prev) => [...prev, newFlat]);
        toast({
          title: "Success",
          description: "Flat added successfully",
        });
      }

      setEditingId(null);
      form.reset({
        flatNumber: "",
        wingId: "",
        carpetArea: 0,
        status: "Available",
        agreementValue: 0,
      });
    } catch (error) {
      console.error("Error saving flat:", error);
      toast({
        title: "Error",
        description: "Failed to save flat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (flat: FlatData) => {
    setEditingId(flat.id);
    form.reset({
      flatNumber: flat.flatNumber,
      wingId: flat.wingId,
      carpetArea: flat.carpetArea,
      status: flat.status || "Available",
      agreementValue: flat.agreementValue || 0,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFlatApi(id);
      setFlats((prev) => prev.filter((flat) => flat.id !== id));
      if (editingId === id) {
        setEditingId(null);
        form.reset();
      }
      toast({
        title: "Success",
        description: "Flat deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting flat:", error);
      toast({
        title: "Error",
        description: "Failed to delete flat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset({
      flatNumber: "",
      wingId: "",
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">
                    Basic Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="wingId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wing *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a wing" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wings.map((wing) => (
                              <SelectItem key={wing.id} value={wing.id}>
                                {wing.companyName} - {wing.projectName} - {wing.wingName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("wingId") && (() => {
                    const selectedWing = wings.find(w => w.id === form.watch("wingId"));
                    const summary = getWingAreaSummary(form.watch("wingId"));
                    return (
                      <>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900">Wing Area Summary</h4>
                          <div className="text-sm text-blue-800 mt-1">
                            <p>Total Area: {summary.totalArea} sq.m</p>
                            <p>Allocated: {summary.allocatedArea} sq.m</p>
                            <p>Remaining: {summary.remainingArea} sq.m</p>
                          </div>
                        </div>
                        {selectedWing && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900">Selected Wing Details</h4>
                            <div className="text-sm text-gray-600 mt-1">
                              <p>Company: {selectedWing.companyName}</p>
                              <p>Project: {selectedWing.projectName}</p>
                              <p>Wing: {selectedWing.wingName}</p>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  <FormField
                    control={form.control}
                    name="flatNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flat Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="carpetArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carpet Area (Sq.m) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter carpet area"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">
                    Additional Details
                  </h3>

                  <FormField
                    control={form.control}
                    name="agreementValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agreement Value</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Agreement value"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Booked">Booked</SelectItem>
                            <SelectItem value="Sold">Sold</SelectItem>
                            <SelectItem value="Blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                {editingId && (
                  <Button type="button" onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                )}
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingId ? "Update Flat" : "Save Flat"}
                </Button>
              </div>
            </form>
          </Form>
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
