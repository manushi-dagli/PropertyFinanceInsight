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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

const companySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  emailAddress: z
    .union([z.string().email("Invalid email address"), z.literal("")])
    .optional(),
  companyAddress: z.string().optional(),
  contactNumber: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  cinNumber: z.string().optional(),
  contactPersonName: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

const CompanyMaster = () => {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "",
      emailAddress: "",
      companyAddress: "",
      contactNumber: "",
      gstNumber: "",
      panNumber: "",
      cinNumber: "",
      contactPersonName: "",
    },
  });

  // Get companies from backend on component mount
  useEffect(() => {
    getCompaniesList();
  }, []);

  const getCompaniesList = async () => {
    try {
      const data = await getCompaniesListApi();
      // Map database column names (snake_case) to frontend types (camelCase)
      const mappedData = (data || []).map((company: any) => ({
        id: company.id,
        companyName: company.company_name,
        emailAddress: company.email_address,
        companyAddress: company.company_address,
        contactNumber: company.contact_number,
        gstNumber: company.gst_number,
        panNumber: company.pan_number,
        cinNumber: company.cin_number,
        contactPersonName: company.contact_person_name,
      }));
      setCompanies(mappedData);
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

  const onSubmit = async (values: CompanyFormValues) => {
    try {
      if (editingCompanyId) {
        // Map frontend camelCase to database snake_case
        const updatePayload = {
          company_name: values.companyName,
          email_address: values.emailAddress || undefined,
          company_address: values.companyAddress || undefined,
          contact_number: values.contactNumber || undefined,
          gst_number: values.gstNumber || undefined,
          pan_number: values.panNumber || undefined,
          cin_number: values.cinNumber || undefined,
          contact_person_name: values.contactPersonName || undefined,
        };
        const response = await updateCompanyApi(updatePayload, editingCompanyId);
        // Map response back to camelCase
        const updatedCompany = {
          id: response.id,
          companyName: response.company_name,
          emailAddress: response.email_address || "",
          companyAddress: response.company_address || "",
          contactNumber: response.contact_number || "",
          gstNumber: response.gst_number || "",
          panNumber: response.pan_number || "",
          cinNumber: response.cin_number || "",
          contactPersonName: response.contact_person_name || "",
        };
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === editingCompanyId ? updatedCompany : company
          )
        );
        toast({
          title: "Success",
          description: "Company updated successfully",
        });
      } else {
        // Map frontend camelCase to database snake_case
        const createPayload = {
          company_name: values.companyName,
          email_address: values.emailAddress || undefined,
          company_address: values.companyAddress || undefined,
          contact_number: values.contactNumber || undefined,
          gst_number: values.gstNumber || undefined,
          pan_number: values.panNumber || undefined,
          cin_number: values.cinNumber || undefined,
          contact_person_name: values.contactPersonName || undefined,
        };
        const response = await createCompanyApi(createPayload);
        // Map response back to camelCase
        const newCompany = {
          id: response.id,
          companyName: response.company_name,
          emailAddress: response.email_address || "",
          companyAddress: response.company_address || "",
          contactNumber: response.contact_number || "",
          gstNumber: response.gst_number || "",
          panNumber: response.pan_number || "",
          cinNumber: response.cin_number || "",
          contactPersonName: response.contact_person_name || "",
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
    form.reset();
  };

  const handleEdit = (company: CompanyData) => {
    setEditingCompanyId(company?.id || null);
    form.reset({
      companyName: company.companyName || "",
      emailAddress: company.emailAddress || "",
      companyAddress: company.companyAddress || "",
      contactNumber: company.contactNumber || "",
      gstNumber: company.gstNumber || "",
      panNumber: company.panNumber || "",
      cinNumber: company.cinNumber || "",
      contactPersonName: company.contactPersonName || "",
    });
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
        form.reset();
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
    form.reset();
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">
                    Basic Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter company name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cinNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CIN</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter CIN number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPersonName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter contact person name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter complete address"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emailAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email ID</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="company@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter contact number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Statutory Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">
                    Statutory Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="gstNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GSTIN</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter GSTIN number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="panNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter PAN number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                {editingCompanyId && (
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingCompanyId ? "Update Company" : "Save Company"}
                </Button>
              </div>
            </form>
          </Form>
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
