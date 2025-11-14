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
import { FileText, Save, Upload, TrendingUp, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ProjectMasterProps,
  ProjectData,
  Company,
} from "@/types/project.types";
import {
  createProjectApi,
  getProjectsListApi,
  updateProjectApi,
} from "@/api/project.api";
import { getCompaniesListApi } from "@/api/company.api";

const projectSchema = z.object({
  companyId: z.string().min(1, "Company selection is required"),
  projectName: z.string().min(1, "Project name is required"),
  totalArea: z.number().positive("Total area must be greater than 0"),
  estimatedLandCost: z.number().min(0).default(0),
  estimatedConstructionCost: z.number().min(0).default(0),
  reportDate: z.string().optional(),
  actualLandCost: z.number().min(0).default(0),
  actualConstructionCost: z.number().min(0).default(0),
});

const ProjectMaster = ({ reportingDate }: ProjectMasterProps) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      companyId: "",
      projectName: "",
      totalArea: 0,
      estimatedLandCost: 0,
      estimatedConstructionCost: 0,
      reportDate: reportingDate || "",
      actualLandCost: 0,
      actualConstructionCost: 0,
    },
  });

  // Watch form values for calculations
  const watchedValues = form.watch();

  // Call the getCompanies API to fetch company data
  useEffect(() => {
    getCompaniesList();
    getProjectsList();
  }, []);

  const getProjectsList = async () => {
    try {
      const data = await getProjectsListApi();
      // Map database column names (snake_case) to frontend types (camelCase)
      const mappedData = (data || []).map((project: any) => ({
        id: project.id,
        companyId: project.company_id,
        companyName: project.company_name || "",
        projectName: project.project_name,
        totalArea: Number(project.total_area) || 0,
        estimatedLandCost: Number(project.estimated_land_cost) || 0,
        estimatedConstructionCost: Number(project.estimated_construction_cost) || 0,
        totalEstimatedCost: Number(project.total_estimated_cost) || 0,
        reportDate: project.report_date || "",
        actualLandCost: Number(project.actual_land_cost) || 0,
        actualConstructionCost: Number(project.actual_construction_cost) || 0,
        totalActualCost: Number(project.total_actual_cost) || 0,
        projectCompletionPercentage: project.project_completion_percentage || "0.00",
        constructionPercentage: project.construction_percentage || "0.00",
        revenueRecognized: project.revenue_recognized || false,
      }));
      setProjects(mappedData);
      console.log("Projects fetched successfully");
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch projects. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCompaniesList = async () => {
    try {
      const data = await getCompaniesListApi();
      // Map database column names (snake_case) to frontend types (camelCase)
      const mappedData = (data || []).map((company: any) => ({
        id: company.id,
        companyName: company.company_name,
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

  // Auto-calculate derived fields
  const totalEstimatedCost =
    Number(watchedValues.estimatedLandCost || 0) +
    Number(watchedValues.estimatedConstructionCost || 0);
  const totalActualCost =
    Number(watchedValues.actualLandCost || 0) +
    Number(watchedValues.actualConstructionCost || 0);
  const projectCompletion =
    totalEstimatedCost > 0 ? (totalActualCost / totalEstimatedCost) * 100 : 0;
  const constructionCompletion =
    Number(watchedValues.estimatedConstructionCost || 0) > 0
      ? (Number(watchedValues.actualConstructionCost || 0) /
          Number(watchedValues.estimatedConstructionCost || 0)) *
        100
      : 0;
  const revenueRecognized = Number(constructionCompletion) >= 25;

  // Set report date from reporting date
  useEffect(() => {
    if (reportingDate) {
      form.setValue("reportDate", reportingDate);
    }
  }, [reportingDate, form]);

  const handleSave = async (values: z.infer<typeof projectSchema>) => {
    // Check if either the prop or form value has a reporting date
    if (!reportingDate && !values.reportDate) {
      toast({
        title: "Validation Error",
        description: "Please set the reporting date first",
        variant: "destructive",
      });
      return;
    }

    const selectedCompany = companies.find((c) => c.id === values.companyId);

    try {
      const payload = {
        company_id: values.companyId,
        project_name: values.projectName,
        total_area: values.totalArea,
        estimated_land_cost: values.estimatedLandCost,
        estimated_construction_cost: values.estimatedConstructionCost,
        total_estimated_cost: totalEstimatedCost,
        report_date: values.reportDate || reportingDate,
        actual_land_cost: values.actualLandCost,
        actual_construction_cost: values.actualConstructionCost,
        total_actual_cost: totalActualCost,
        project_completion_percentage: projectCompletion.toFixed(2),
        construction_percentage: constructionCompletion.toFixed(2),
        revenue_recognized: revenueRecognized,
      };

      if (editingId) {
        const response = await updateProjectApi(payload, editingId);
        const updatedProject: ProjectData = {
          id: response.id,
          companyId: response.company_id,
          companyName: selectedCompany?.companyName || "",
          projectName: response.project_name,
          totalArea: Number(response.total_area) || 0,
          estimatedLandCost: Number(response.estimated_land_cost) || 0,
          estimatedConstructionCost: Number(response.estimated_construction_cost) || 0,
          totalEstimatedCost: Number(response.total_estimated_cost) || 0,
          reportDate: response.report_date || "",
          actualLandCost: Number(response.actual_land_cost) || 0,
          actualConstructionCost: Number(response.actual_construction_cost) || 0,
          totalActualCost: Number(response.total_actual_cost) || 0,
          projectCompletionPercentage: response.project_completion_percentage || "0.00",
          constructionPercentage: response.construction_percentage || "0.00",
          revenueRecognized: response.revenue_recognized || false,
        };
        setProjects((prev) =>
          prev.map((p) => (p.id === editingId ? updatedProject : p))
        );
        toast({
          title: "Success",
          description: "Project updated successfully",
        });
      } else {
        const response = await createProjectApi(payload);
        const newProject: ProjectData = {
          id: response.id,
          companyId: response.company_id,
          companyName: selectedCompany?.companyName || "",
          projectName: response.project_name,
          totalArea: Number(response.total_area) || 0,
          estimatedLandCost: Number(response.estimated_land_cost) || 0,
          estimatedConstructionCost: Number(response.estimated_construction_cost) || 0,
          totalEstimatedCost: Number(response.total_estimated_cost) || 0,
          reportDate: response.report_date || "",
          actualLandCost: Number(response.actual_land_cost) || 0,
          actualConstructionCost: Number(response.actual_construction_cost) || 0,
          totalActualCost: Number(response.total_actual_cost) || 0,
          projectCompletionPercentage: response.project_completion_percentage || "0.00",
          constructionPercentage: response.construction_percentage || "0.00",
          revenueRecognized: response.revenue_recognized || false,
        };
        setProjects((prev) => [...prev, newProject]);
        toast({
          title: "Success",
          description: "Project added successfully",
        });
      }

      // Reset form
      setEditingId(null);
      form.reset({
        companyId: "",
        projectName: "",
        totalArea: 0,
        estimatedLandCost: 0,
        estimatedConstructionCost: 0,
        reportDate: reportingDate || "",
        actualLandCost: 0,
        actualConstructionCost: 0,
      });
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: "Failed to save project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (projectToEdit: ProjectData) => {
    setEditingId(projectToEdit.id || null);
    form.reset({
      companyId: projectToEdit.companyId,
      projectName: projectToEdit.projectName,
      totalArea: projectToEdit.totalArea,
      estimatedLandCost: projectToEdit.estimatedLandCost,
      estimatedConstructionCost: projectToEdit.estimatedConstructionCost,
      reportDate: projectToEdit.reportDate,
      actualLandCost: projectToEdit.actualLandCost,
      actualConstructionCost: projectToEdit.actualConstructionCost,
    });
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: "Success",
      description: "Project deleted successfully",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset({
      companyId: "",
      projectName: "",
      totalArea: 0,
      estimatedLandCost: 0,
      estimatedConstructionCost: 0,
      reportDate: reportingDate || "",
      actualLandCost: 0,
      actualConstructionCost: 0,
    });
  };

  const exportToExcel = () => {
    toast({
      title: "Export",
      description:
        "Excel export functionality will be implemented in the next phase",
    });
  };

  const importFromExcel = () => {
    toast({
      title: "Import",
      description:
        "Excel import functionality will be implemented in the next phase",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Master
          </CardTitle>
          <CardDescription>
            Manage project costs, area, and completion tracking linked to
            companies
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={importFromExcel}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Import Excel
        </Button>
        <Button
          onClick={exportToExcel}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Project Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {editingId ? "Edit Project" : "Add New Project"}
          </CardTitle>
          <CardDescription>
            Enter project details linked to company
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Project Info */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">
                    Basic Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.companyName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Ojash"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Area of Construction (Sq. Mtr) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 11711.20"
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
                    name="reportDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Report</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            disabled={!!reportingDate}
                            className={reportingDate ? "bg-gray-50" : ""}
                            {...field}
                          />
                        </FormControl>
                        {reportingDate && (
                          <p className="text-xs text-gray-600 mt-1">
                            Automatically set from global reporting date
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Estimated Costs */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">
                    Estimated Costs
                  </h3>

                  <FormField
                    control={form.control}
                    name="estimatedLandCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Land Cost (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
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
                    name="estimatedConstructionCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Construction Cost (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
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

                  <div>
                    <Label htmlFor="total-est-cost">
                      Total Estimated Project Cost (₹)
                    </Label>
                    <Input
                      id="total-est-cost"
                      type="number"
                      step="0.01"
                      value={totalEstimatedCost.toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Auto-calculated: Land Cost + Construction Cost
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">
                    Actual Costs
                  </h3>

                  <FormField
                    control={form.control}
                    name="actualLandCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actual Land Cost (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
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
                    name="actualConstructionCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actual Construction Cost (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
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

                  <div>
                    <Label htmlFor="total-actual-cost">
                      Total Actual Project Cost (₹)
                    </Label>
                    <Input
                      id="total-actual-cost"
                      type="number"
                      step="0.01"
                      value={totalActualCost.toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Auto-calculated: Actual Land + Actual Construction
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">
                    Completion Metrics
                  </h3>

                  <div>
                    <Label htmlFor="project-completion">
                      Project Completion (%)
                    </Label>
                    <Input
                      id="project-completion"
                      type="number"
                      step="0.01"
                      value={projectCompletion.toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Auto-calculated: (Total Actual / Total Estimated) × 100
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="construction-completion">
                      Construction Completion (%)
                    </Label>
                    <Input
                      id="construction-completion"
                      type="number"
                      step="0.01"
                      value={constructionCompletion.toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Auto-calculated: (Actual Construction / Estimated
                      Construction) × 100
                    </p>
                  </div>

                  <div>
                    <Label>Revenue Recognition Status</Label>
                    <div
                      className={`p-3 rounded-lg flex items-center gap-2 ${
                        revenueRecognized
                          ? "bg-green-50 text-green-800"
                          : "bg-orange-50 text-orange-800"
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" />
                      {revenueRecognized
                        ? "Revenue Recognized (≥25% construction)"
                        : "Work in Progress (<25% construction)"}
                    </div>
                  </div>
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
                  {editingId ? "Update Project" : "Save Project"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Projects List */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              List of all projects with their completion status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {proj.companyName} - {proj.projectName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Area: {proj.totalArea.toLocaleString()} Sq.Mtr
                      </p>
                      <p className="text-sm text-gray-600">
                        Report Date:{" "}
                        {new Date(proj.reportDate).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Est. Cost:</span> ₹
                        {proj.totalEstimatedCost.toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium">Actual Cost:</span> ₹
                        {proj.totalActualCost.toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium">Completion:</span>
                        {Number(proj.projectCompletionPercentage).toFixed(2)}%
                      </p>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                          proj.revenueRecognized
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {proj.revenueRecognized
                          ? "Revenue Eligible"
                          : "Work in Progress"}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(proj)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(proj.id)}
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectMaster;
