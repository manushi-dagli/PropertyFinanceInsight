import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Save, Edit, Trash2, Plus, Minus, X, RefreshCw, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExcelImportDialog from "./ExcelImportDialog";
import { exportToExcel } from "@/utils/excelUtils";
import { EXCEL_TEMPLATES, EXCEL_MODULE_NAMES } from "@/types/excel.types";
import {
  createCustomerApi,
  getCustomersListApi,
  updateCustomerApi,
  deleteCustomerApi,
} from "@/api/customer.api";
import { getFlatsListApi } from "@/api/flat.api";
import { mapCustomerToApi, mapCustomerFromApi } from "@/utils/dataMapper";

const customerSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  flatId: z.string().optional(),
  contactNumber: z.string().regex(/^\d{10}$|^$/, "Contact number must be exactly 10 digits if provided").optional(),
  email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
  aadharNumber: z.string().regex(/^\d{12}$|^$/, "Aadhar number must be exactly 12 digits if provided").optional(),
  address: z.string().optional(),
  pinCode: z.string().regex(/^\d{6}$|^$/, "Pin code must be exactly 6 digits if provided").optional(),
});

interface CustomerData {
  id: string;
  customerName: string;
  flatId: string;
  flatNumber: string;
  wingName: string;
  projectName: string;
  companyName: string;
  contactNumber: string;
  email: string;
  aadharNumber: string;
  address: string;
  pinCode: string;
}

interface Flat {
  id: string;
  flatNumber: string;
  wingName: string;
  projectName: string;
  companyName: string;
}

interface JointOwner {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  aadharNumber: string;
  address: string;
  pinCode: string;
}

const CustomerMaster = ({ reportingDate }: { reportingDate: string }) => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [jointOwners, setJointOwners] = useState<JointOwner[]>([{
    id: Date.now().toString(),
    name: "",
    contactNumber: "",
    email: "",
    aadharNumber: "",
    address: "",
    pinCode: ""
  }]);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerName: "",
      flatId: "",
      contactNumber: "",
      email: "",
      aadharNumber: "",
      address: "",
      pinCode: "",
    },
  });

  useEffect(() => {
    loadFlats();
    loadCustomers();
  }, []);

  const loadFlats = async () => {
    try {
      const data = await getFlatsListApi();
      // Need to join with wings to get full details
      const { getWingsListApi } = await import("@/api/wing.api");
      const wingsData = await getWingsListApi();
      
      const mappedFlats = (data || []).map((flat: any) => {
        const wing = wingsData.find((w: any) => w.id === flat.wing_id);
        return {
          id: flat.id,
          flatNumber: flat.flat_number,
          wingName: wing?.wing_name || "",
          projectName: wing?.project_name || "",
          companyName: wing?.company_name || "",
        };
      });
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

  const loadCustomers = async () => {
    try {
      const data = await getCustomersListApi();
      // Need to join with flats to get flat details
      const mappedCustomers = await Promise.all(
        (data || []).map(async (customer: any) => {
          const flat = flats.find(f => f.id === customer.flat_id);
          return {
            id: customer.id,
            customerName: customer.customer_name || "",
            flatId: customer.flat_id || "",
            flatNumber: flat?.flatNumber || "",
            wingName: flat?.wingName || "",
            projectName: flat?.projectName || "",
            companyName: flat?.companyName || "",
            contactNumber: customer.contact_number?.toString() || "",
            email: customer.email || "",
            aadharNumber: customer.aadhar_number || "",
            address: customer.address || "",
            pinCode: customer.pin_code?.toString() || "",
          };
        })
      );
      setCustomers(mappedCustomers);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    }
  };

  // Reload customers when flats are loaded
  useEffect(() => {
    if (flats.length > 0) {
      loadCustomers();
    }
  }, [flats.length]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedCustomers(customers.map(customer => customer.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers(prev => [...prev, customerId]);
    } else {
      setSelectedCustomers(prev => prev.filter(id => id !== customerId));
      setSelectAll(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedCustomers.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select customers to delete",
        variant: "destructive"
      });
      return;
    }

    try {
      await Promise.all(selectedCustomers.map(id => deleteCustomerApi(id)));
      setCustomers(prev => prev.filter(customer => !selectedCustomers.includes(customer.id)));
      setSelectedCustomers([]);
      setSelectAll(false);
      toast({
        title: "Success",
        description: `${selectedCustomers.length} customer(s) deleted successfully`
      });
    } catch (error) {
      console.error("Error deleting customers:", error);
      toast({
        title: "Error",
        description: "Failed to delete some customers. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAll = async () => {
    if (customers.length === 0) {
      toast({
        title: "No Data",
        description: "No customers to delete",
        variant: "destructive"
      });
      return;
    }

    try {
      await Promise.all(customers.map(customer => deleteCustomerApi(customer.id)));
      setCustomers([]);
      setSelectedCustomers([]);
      setSelectAll(false);
      toast({
        title: "Success",
        description: "All customers deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting all customers:", error);
      toast({
        title: "Error",
        description: "Failed to delete all customers. Please try again.",
        variant: "destructive",
      });
    }
  };


  const handleAddJointOwner = () => {
    setJointOwners(prev => [...prev, {
      id: Date.now().toString(),
      name: "",
      contactNumber: "",
      email: "",
      aadharNumber: "",
      address: "",
      pinCode: ""
    }]);
  };

  const handleRemoveJointOwner = (id: string) => {
    setJointOwners(prev => prev.filter(owner => owner.id !== id));
  };

  const handleJointOwnerChange = (id: string, field: keyof JointOwner, value: string) => {
    setJointOwners(prev => prev.map(owner => {
      if (owner.id === id) {
        return { ...owner, [field]: value };
      }
      return owner;
    }));
  };

  const checkFlatAvailability = (flatId: string, excludeCustomerId?: string) => {
    const existingCustomer = customers.find(customer => 
      customer.flatId === flatId && customer.id !== excludeCustomerId
    );

    if (existingCustomer) {
      return {
        available: false,
        message: `The selected flat is already occupied by another customer (${existingCustomer.customerName}). Please choose a different flat.`
      };
    }

    return { available: true, message: "" };
  };

  const handleSave = async (values: z.infer<typeof customerSchema>) => {
    // Validate joint owners
    for (let i = 0; i < jointOwners.length; i++) {
      const owner = jointOwners[i];
      if (!owner.name.trim()) {
        toast({
          title: "Validation Error",
          description: `Joint Owner ${i + 1}: Name is required`,
          variant: "destructive"
        });
        return;
      }
      
      if (owner.contactNumber && !/^\d{10}$/.test(owner.contactNumber)) {
        toast({
          title: "Validation Error",
          description: `Joint Owner ${i + 1}: Contact Number must be exactly 10 digits if provided`,
          variant: "destructive"
        });
        return;
      }

      if (owner.aadharNumber && !/^\d{12}$/.test(owner.aadharNumber)) {
        toast({
          title: "Validation Error",
          description: `Joint Owner ${i + 1}: Aadhar Number must be exactly 12 digits if provided`,
          variant: "destructive"
        });
        return;
      }

      if (owner.pinCode && !/^\d{6}$/.test(owner.pinCode)) {
        toast({
          title: "Validation Error",
          description: `Joint Owner ${i + 1}: Pin Code must be exactly 6 digits if provided`,
          variant: "destructive"
        });
        return;
      }
    }

    if (values.flatId) {
      const flatAvailability = checkFlatAvailability(values.flatId, editingId || undefined);
      if (!flatAvailability.available) {
        toast({
          title: "Flat Availability Error",
          description: flatAvailability.message,
          variant: "destructive"
        });
        return;
      }
    }

    try {
      const apiData = mapCustomerToApi({
        customerName: values.customerName,
        flatId: values.flatId,
        contactNumber: values.contactNumber,
        email: values.email,
        aadharNumber: values.aadharNumber,
        address: values.address,
        pinCode: values.pinCode,
      });

      if (editingId) {
        const response = await updateCustomerApi(apiData, editingId);
        const selectedFlat = flats.find(f => f.id === values.flatId);
        const updatedCustomer: CustomerData = {
          id: response.id,
          customerName: response.customer_name || "",
          flatId: response.flat_id || "",
          flatNumber: selectedFlat?.flatNumber || "",
          wingName: selectedFlat?.wingName || "",
          projectName: selectedFlat?.projectName || "",
          companyName: selectedFlat?.companyName || "",
          contactNumber: response.contact_number?.toString() || "",
          email: response.email || "",
          aadharNumber: response.aadhar_number || "",
          address: response.address || "",
          pinCode: response.pin_code?.toString() || "",
        };
        setCustomers(prev => prev.map(customer => 
          customer.id === editingId ? updatedCustomer : customer
        ));
        toast({
          title: "Success",
          description: "Customer updated successfully"
        });
      } else {
        const response = await createCustomerApi(apiData);
        const selectedFlat = flats.find(f => f.id === values.flatId);
        const newCustomer: CustomerData = {
          id: response.id,
          customerName: response.customer_name || "",
          flatId: response.flat_id || "",
          flatNumber: selectedFlat?.flatNumber || "",
          wingName: selectedFlat?.wingName || "",
          projectName: selectedFlat?.projectName || "",
          companyName: selectedFlat?.companyName || "",
          contactNumber: response.contact_number?.toString() || "",
          email: response.email || "",
          aadharNumber: response.aadhar_number || "",
          address: response.address || "",
          pinCode: response.pin_code?.toString() || "",
        };
        setCustomers(prev => [...prev, newCustomer]);
        toast({
          title: "Success",
          description: "Customer added successfully"
        });
      }

      setEditingId(null);
      form.reset({
        customerName: "",
        flatId: "",
        contactNumber: "",
        email: "",
        aadharNumber: "",
        address: "",
        pinCode: "",
      });
      setJointOwners([{
        id: Date.now().toString(),
        name: "",
        contactNumber: "",
        email: "",
        aadharNumber: "",
        address: "",
        pinCode: ""
      }]);
    } catch (error) {
      console.error("Error saving customer:", error);
      toast({
        title: "Error",
        description: "Failed to save customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (customer: CustomerData) => {
    setEditingId(customer.id);
    form.reset({
      customerName: customer.customerName,
      flatId: customer.flatId,
      contactNumber: customer.contactNumber,
      email: customer.email,
      aadharNumber: customer.aadharNumber,
      address: customer.address,
      pinCode: customer.pinCode,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomerApi(id);
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      if (editingId === id) {
        setEditingId(null);
        form.reset();
      }
      toast({
        title: "Success",
        description: "Customer deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset({
      customerName: "",
      flatId: "",
      contactNumber: "",
      email: "",
      aadharNumber: "",
      address: "",
      pinCode: "",
    });
    setJointOwners([{
      id: Date.now().toString(),
      name: "",
      contactNumber: "",
      email: "",
      aadharNumber: "",
      address: "",
      pinCode: ""
    }]);
  };

  const handleExport = () => {
    if (customers.length === 0) {
      toast({
        title: "No Data",
        description: "No customers available to export",
        variant: "destructive"
      });
      return;
    }

  // "Agreement" column removed in EXCEL_TEMPLATES.customers
  const exportData = customers.map(customer => [
    customer.customerName,
    customer.aadharNumber,
    customer.contactNumber,
    customer.email,
    customer.address,
    customer.pinCode,
    customer.aadharNumber,
    customer.flatNumber
  ]);

  exportToExcel(exportData, EXCEL_MODULE_NAMES.CUSTOMER_MASTER, EXCEL_TEMPLATES.customers);

  toast({
    title: "Success",
    description: "Customers data exported successfully"
  });
};

// update handleImport to expect corrected template structure
const handleImport = (data: any[]) => {
  try {
    console.log('Raw customer import data:', data);

    // indexes: customerName, pan, mobileNumber, email, address, pinCode, aadharNumber, flatNumber
    const importedCustomers = data.map((row, index) => {
      const customerName = row[0]?.toString() || '';
      const pan = row[1]?.toString() || '';
      const mobileNumber = row[2]?.toString() || '';
      const email = row[3]?.toString() || '';
      const address = row[4]?.toString() || '';
      const pinCode = row[5]?.toString() || '';
      const aadharNumber = row[6]?.toString() || '';
      const flatNumber = row[7]?.toString() || '';

      // Find flat by flat number
      const flat = flats.find(f => f.flatNumber === flatNumber);

      if (!customerName.trim()) {
        throw new Error(`Row ${index + 2}: Customer name is required`);
      }

      return {
        id: Date.now().toString() + index,
        customerName: customerName.trim(),
        flatId: flat?.id || '',
        flatNumber: flat?.flatNumber || flatNumber,
        wingName: flat?.wingName || '',
        projectName: flat?.projectName || '',
        companyName: flat?.companyName || '',
        contactNumber: mobileNumber,
        email: email.trim(),
        aadharNumber: aadharNumber,
        address: address.trim(),
        pinCode: pinCode
      };
    });

    setCustomers(prev => [...prev, ...importedCustomers]);

    toast({
      title: "Success",
      description: `Imported ${importedCustomers.length} customers successfully`
    });
  } catch (error) {
    toast({
      title: "Import Error",
      description: error instanceof Error ? error.message : "Failed to import customers",
      variant: "destructive"
    });
  }
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Master
          </CardTitle>
          <CardDescription>
            Manage customer details and flat assignments
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Import/Export Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={() => setShowImportDialog(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Import Excel
        </Button>
        <Button
          onClick={handleExport}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Bulk Actions */}
      {customers.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-customers"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all-customers">Select All ({customers.length})</Label>
                </div>
                {selectedCustomers.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedCustomers.length} selected
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDeleteSelected}
                  variant="destructive"
                  size="sm"
                  disabled={selectedCustomers.length === 0}
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

      {/* Excel Import Dialog */}
      <ExcelImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
        moduleName="customers"
        title="Customer Master"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {editingId ? "Edit Customer" : "Add New Customer"}
          </CardTitle>
          <CardDescription>
            Enter customer details and assign a flat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="flatId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flat Number</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a flat" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {flats.map((flat) => (
                              <SelectItem key={flat.id} value={flat.id}>
                                {flat.companyName} - {flat.projectName} - {flat.wingName} - {flat.flatNumber}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("flatId") && (() => {
                    const selectedFlat = flats.find(f => f.id === form.watch("flatId"));
                    return selectedFlat ? (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">Selected Flat Details</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          <p>Company: {selectedFlat.companyName}</p>
                          <p>Project: {selectedFlat.projectName}</p>
                          <p>Wing: {selectedFlat.wingName}</p>
                          <p>Flat: {selectedFlat.flatNumber}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="e.g., john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aadharNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aadhar Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 123456789012" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">Address Details</h3>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pinCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pin Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 400001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 border-b pb-2">
              Joint Owners
              <Button onClick={handleAddJointOwner} variant="ghost" size="sm" className="ml-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Owner
              </Button>
            </h3>
            
            {jointOwners.map((owner, index) => (
              <div key={owner.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-800">Joint Owner {index + 1}</h4>
                  <Button onClick={() => handleRemoveJointOwner(owner.id)} variant="ghost" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`joint-owner-name-${owner.id}`}>Name *</Label>
                    <Input
                      id={`joint-owner-name-${owner.id}`}
                      value={owner.name}
                      onChange={(e) => handleJointOwnerChange(owner.id, "name", e.target.value)}
                      placeholder="e.g., Jane Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`joint-owner-contact-${owner.id}`}>Contact Number</Label>
                    <Input
                      id={`joint-owner-contact-${owner.id}`}
                      value={owner.contactNumber}
                      onChange={(e) => handleJointOwnerChange(owner.id, "contactNumber", e.target.value)}
                      placeholder="e.g., 9876543210"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`joint-owner-email-${owner.id}`}>Email</Label>
                    <Input
                      id={`joint-owner-email-${owner.id}`}
                      type="email"
                      value={owner.email}
                      onChange={(e) => handleJointOwnerChange(owner.id, "email", e.target.value)}
                      placeholder="e.g., jane.doe@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`joint-owner-aadhar-${owner.id}`}>Aadhar Number</Label>
                    <Input
                      id={`joint-owner-aadhar-${owner.id}`}
                      value={owner.aadharNumber}
                      onChange={(e) => handleJointOwnerChange(owner.id, "aadharNumber", e.target.value)}
                      placeholder="e.g., 123456789012"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`joint-owner-address-${owner.id}`}>Address</Label>
                    <Textarea
                      id={`joint-owner-address-${owner.id}`}
                      value={owner.address}
                      onChange={(e) => handleJointOwnerChange(owner.id, "address", e.target.value)}
                      placeholder="Enter address"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`joint-owner-pin-${owner.id}`}>Pin Code</Label>
                    <Input
                      id={`joint-owner-pin-${owner.id}`}
                      value={owner.pinCode}
                      onChange={(e) => handleJointOwnerChange(owner.id, "pinCode", e.target.value)}
                      placeholder="e.g., 400001"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

              <div className="flex justify-end gap-3">
                {editingId && (
                  <Button type="button" onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                )}
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingId ? "Update Customer" : "Save Customer"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Customers List */}
      {customers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registered Customers</CardTitle>
            <CardDescription>
              List of all customers and their assigned flats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customers.map((customer) => (
                <div key={customer.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked as boolean)}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{customer.customerName}</h3>
                        <p className="text-sm text-gray-600">
                          Flat: {customer.companyName} - {customer.projectName} - {customer.wingName} - {customer.flatNumber}
                        </p>
                        <p className="text-sm text-gray-600">Contact: {customer.contactNumber || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><span className="font-medium">Email:</span> {customer.email || 'Not provided'}</p>
                      <p><span className="font-medium">Aadhar:</span> {customer.aadharNumber || 'Not provided'}</p>
                      <p><span className="font-medium">Address:</span> {customer.address || 'Not provided'}, {customer.pinCode || ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(customer)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(customer.id)}
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerMaster;
