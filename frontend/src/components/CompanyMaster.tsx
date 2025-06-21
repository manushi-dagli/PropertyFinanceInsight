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
import { Textarea } from "@/components/ui/textarea";
import { Building2, Save, FileText, Upload, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel, } from "@/utils/excelUtils";
import ExcelImportDialog from "./ExcelImportDialog";
import {
  createCompanyApi,
  deleteCompanyApi,
  getCompaniesListApi,
  updateCompanyApi,
} from "@/api/company.api";
import { CompanyData } from "@/types/company.types";
import { EXCEL_MODULE_NAMES, EXCEL_TEMPLATES } from "@/types/excel.types";

const CompanyMaster = () => {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<CompanyData>({
    id: "",
    companyName: "",
    emailAddress: "",
    companyAddress: "",
    contactNumber: "",
    gstNumber: "",
    panNumber: "",
    cinNumber: "",
    contactPersonName: "",
  });

  // Get companies from backend on component mount
  useEffect(() => {
    getCompaniesList();
  }, []);

  const getCompaniesList = async () => {
    try {
      const response = await getCompaniesListApi();
      setCompanies(response.data);
      console.log("Companies fetched successfully");
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Error",
        description: "Failed to fetch companies. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setCurrentCompany((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!currentCompany.companyName.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCompanyId) {
        const { id: editingCompanyId, ...updatePayload } = currentCompany;
        const response = await updateCompanyApi(
          // rmeove id from currentCompany
          updatePayload,
          editingCompanyId
        );
        console.log("Company updated successfully:", response);
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === editingCompanyId ? currentCompany : company
          )
        );
        toast({
          title: "Success",
          description: "Company updated successfully",
        });
      } else {
        // Create
        const response = await createCompanyApi(currentCompany);
        const newCompany = {
          ...currentCompany,
          id: response.data.id ?? Date.now().toString(),
        };
        setCompanies((prev) => [...prev, newCompany]);
        toast({
          title: "Success",
          description: "Company added successfully",
        });
      }
    } catch (error) {
      console.error("Error saving company:", error);
      toast({
        title: "Error",
        description: "Failed to save company. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setEditingCompanyId(null);
    setCurrentCompany({
      id: "",
      companyName: "",
      emailAddress: "",
      companyAddress: "",
      contactNumber: "",
      gstNumber: "",
      panNumber: "",
      cinNumber: "",
      contactPersonName: "",
    });
  };

  const handleEdit = (company: CompanyData) => {
    setEditingCompanyId(company?.id);
    setCurrentCompany(company);
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      toast({
        title: "Error",
        description: "Invalid company ID",
        variant: "destructive",
      });
      return;
    }
    // Call API to delete company
    try {
      const response = await deleteCompanyApi(id);
      console.log("Company deleted successfully:", response);
      setCompanies((prev) => prev.filter((company) => company.id !== id));
      if (editingCompanyId === id) {
        setEditingCompanyId(null);
        setCurrentCompany({
          id: "",
          companyName: "",
          emailAddress: "",
          companyAddress: "",
          contactNumber: "",
          gstNumber: "",
          panNumber: "",
          cinNumber: "",
          contactPersonName: "",
        });
      }
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting company:", error);
      toast({
        title: "Error",
        description: "Failed to delete company. Please try again.",
        variant: "destructive",
      });
      return;
    }
  };

  const handleCancel = () => {
    setEditingCompanyId(null);
    setCurrentCompany({
      id: "",
      companyName: "",
      emailAddress: "",
      companyAddress: "",
      contactNumber: "",
      gstNumber: "",
      panNumber: "",
      cinNumber: "",
      contactPersonName: "",
    });
  };

  const handleExcelImport = (data: CompanyData[]) => {
    const importedCompanies = data.map((row: CompanyData) => ({
      companyName: row.companyName,
      emailAddress: row.emailAddress,
      companyAddress: row.companyAddress,
      contactNumber: row.contactNumber,
      gstNumber: row.gstNumber,
      panNumber: row.panNumber,
      cinNumber: row.cinNumber,
      contactPersonName: row.contactPersonName,
    }));

    setCompanies((prev) => [...prev, ...importedCompanies]);
  };

  const handleExcelExport = () => {
    const exportData = companies.map((company) => [
      company.companyName,
      company.cinNumber,
      company.panNumber,
      company.gstNumber,
      company.companyAddress,
      company.contactPersonName,
      company.contactNumber,
      company.emailAddress,
    ]);

    exportToExcel(exportData, EXCEL_MODULE_NAMES.COMPANY_MASTER, EXCEL_TEMPLATES.companies);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Master
          </CardTitle>
          <CardDescription>
            Manage company information and statutory details
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => setShowImportDialog(true)}
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
          <FileText className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Company Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {editingCompanyId ? "Edit Company" : "Add New Company"}
          </CardTitle>
          <CardDescription>
            Enter company details and statutory clearances
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">
                Basic Information
              </h3>

              <div>
                <Label htmlFor="company-name">Company Name *</Label>
                <Input
                  id="company-name"
                  value={currentCompany.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <Label htmlFor="cin">CIN</Label>
                <Input
                  id="cin"
                  value={currentCompany.cinNumber}
                  onChange={(e) =>
                    handleInputChange("cinNumber", e.target.value)
                  }
                  placeholder="Enter CIN number"
                />
              </div>

              <div>
                <Label htmlFor="contact-person">Contact Person</Label>
                <Input
                  id="contact-person"
                  value={currentCompany.contactPersonName}
                  onChange={(e) =>
                    handleInputChange("contactPersonName", e.target.value)
                  }
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={currentCompany.companyAddress}
                  onChange={(e) =>
                    handleInputChange("companyAddress", e.target.value)
                  }
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="email">Email ID</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentCompany.emailAddress}
                  onChange={(e) =>
                    handleInputChange("emailAddress", e.target.value)
                  }
                  placeholder="company@example.com"
                />
              </div>

              <div>
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={currentCompany.contactNumber}
                  onChange={(e) =>
                    handleInputChange("contactNumber", e.target.value)
                  }
                  placeholder="Enter contact number"
                />
              </div>
            </div>

            {/* Statutory Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">
                Statutory Information
              </h3>

              <div>
                <Label htmlFor="gstn">GSTIN</Label>
                <Input
                  id="gstn"
                  value={currentCompany.gstNumber}
                  onChange={(e) =>
                    handleInputChange("gstNumber", e.target.value)
                  }
                  placeholder="Enter GSTIN number"
                />
              </div>

              <div>
                <Label htmlFor="pan">PAN</Label>
                <Input
                  id="pan"
                  value={currentCompany.panNumber}
                  onChange={(e) =>
                    handleInputChange("panNumber", e.target.value)
                  }
                  placeholder="Enter PAN number"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {editingCompanyId && (
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {editingCompanyId ? "Update Company" : "Save Company"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Companies List */}
      {companies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registered Companies</CardTitle>
            <CardDescription>
              List of all companies in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {company.companyName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {company.companyAddress}
                      </p>
                      <p className="text-sm text-gray-600">
                        {company.emailAddress}
                      </p>
                      <p className="text-sm text-gray-600">
                        {company.contactNumber}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <span className="font-medium">CIN:</span>{" "}
                        {company.cinNumber}
                      </p>
                      <p>
                        <span className="font-medium">GSTIN:</span>{" "}
                        {company.gstNumber}
                      </p>
                      <p>
                        <span className="font-medium">PAN:</span>{" "}
                        {company.panNumber}
                      </p>
                      <p>
                        <span className="font-medium">Contact Person:</span>{" "}
                        {company.contactPersonName}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      onClick={() => handleEdit(company)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      disabled={editingCompanyId === company.id}
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(company.id)}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-1"
                      disabled={editingCompanyId === company.id}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ExcelImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleExcelImport}
        moduleName="companies"
        title="Company Master"
      />
    </div>
  );
};

export default CompanyMaster;
