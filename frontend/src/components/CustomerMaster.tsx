import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Save, Edit, Trash2, Plus, Minus, X, RefreshCw, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExcelImportDialog from "./ExcelImportDialog";
import { exportToExcel, EXCEL_TEMPLATES } from "@/utils/excelUtils";

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
  const [currentCustomer, setCurrentCustomer] = useState<CustomerData>({
    id: "",
    customerName: "",
    flatId: "",
    flatNumber: "",
    wingName: "",
    projectName: "",
    companyName: "",
    contactNumber: "",
    email: "",
    aadharNumber: "",
    address: "",
    pinCode: ""
  });
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

  useEffect(() => {
    const savedFlats = localStorage.getItem('flats');
    if (savedFlats) {
      setFlats(JSON.parse(savedFlats));
    }
  }, []);

  useEffect(() => {
    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    const selectedFlatId = localStorage.getItem('selectedFlatForCustomer');
    if (selectedFlatId) {
      const selectedFlat = flats.find(flat => flat.id === selectedFlatId);
      if (selectedFlat) {
        setCurrentCustomer(prev => ({
          ...prev,
          flatId: selectedFlat.id,
          flatNumber: selectedFlat.flatNumber,
          wingName: selectedFlat.wingName,
          projectName: selectedFlat.projectName,
          companyName: selectedFlat.companyName
        }));
      }
    }
  }, [flats]);

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

  const handleDeleteSelected = () => {
    if (selectedCustomers.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select customers to delete",
        variant: "destructive"
      });
      return;
    }

    setCustomers(prev => prev.filter(customer => !selectedCustomers.includes(customer.id)));
    setSelectedCustomers([]);
    setSelectAll(false);
    
    toast({
      title: "Success",
      description: `${selectedCustomers.length} customer(s) deleted successfully`
    });
  };

  const handleDeleteAll = () => {
    if (customers.length === 0) {
      toast({
        title: "No Data",
        description: "No customers to delete",
        variant: "destructive"
      });
      return;
    }

    setCustomers([]);
    setSelectedCustomers([]);
    setSelectAll(false);
    
    toast({
      title: "Success",
      description: "All customers deleted successfully"
    });
  };

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setCurrentCustomer(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFlatChange = (flatId: string) => {
    const selectedFlat = flats.find(flat => flat.id === flatId);
    if (selectedFlat) {
      setCurrentCustomer(prev => ({
        ...prev,
        flatId,
        flatNumber: selectedFlat.flatNumber,
        wingName: selectedFlat.wingName,
        projectName: selectedFlat.projectName,
        companyName: selectedFlat.companyName
      }));
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

  const handleSave = () => {
    if (!currentCustomer.customerName.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer name is required",
        variant: "destructive"
      });
      return;
    }

    if (currentCustomer.flatId) {
      const flatAvailability = checkFlatAvailability(currentCustomer.flatId, editingId || undefined);
      if (!flatAvailability.available) {
        toast({
          title: "Flat Availability Error",
          description: flatAvailability.message,
          variant: "destructive"
        });
        return;
      }

      const selectedFlat = flats.find(flat => flat.id === currentCustomer.flatId);
      if (!selectedFlat) {
        toast({
          title: "Validation Error",
          description: "Please select a valid flat number",
          variant: "destructive"
        });
        return;
      }
    }

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
    }

    if (currentCustomer.contactNumber && !/^\d{10}$/.test(currentCustomer.contactNumber)) {
      toast({
        title: "Validation Error",
        description: "Contact Number must be exactly 10 digits if provided",
        variant: "destructive"
      });
      return;
    }

    if (currentCustomer.aadharNumber && !/^\d{12}$/.test(currentCustomer.aadharNumber)) {
      toast({
        title: "Validation Error",
        description: "Aadhar Number must be exactly 12 digits if provided",
        variant: "destructive"
      });
      return;
    }

    if (currentCustomer.pinCode && !/^\d{6}$/.test(currentCustomer.pinCode)) {
      toast({
        title: "Validation Error",
        description: "Pin Code must be exactly 6 digits if provided",
        variant: "destructive"
      });
      return;
    }

    for (let i = 0; i < jointOwners.length; i++) {
      const owner = jointOwners[i];
      
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

    if (editingId) {
      setCustomers(prev => prev.map(customer => 
        customer.id === editingId ? { ...currentCustomer, id: editingId } : customer
      ));
      setEditingId(null);
      toast({
        title: "Success",
        description: "Customer updated successfully"
      });
    } else {
      const newCustomer = { ...currentCustomer, id: Date.now().toString() };
      setCustomers(prev => [...prev, newCustomer]);
      toast({
        title: "Success",
        description: "Customer added successfully"
      });
    }

    setCurrentCustomer({
      id: "",
      customerName: "",
      flatId: "",
      flatNumber: "",
      wingName: "",
      projectName: "",
      companyName: "",
      contactNumber: "",
      email: "",
      aadharNumber: "",
      address: "",
      pinCode: ""
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

  const handleEdit = (customer: CustomerData) => {
    setCurrentCustomer(customer);
    setEditingId(customer.id);
  };

  const handleDelete = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
    toast({
      title: "Success",
      description: "Customer deleted successfully"
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setCurrentCustomer({
      id: "",
      customerName: "",
      flatId: "",
      flatNumber: "",
      wingName: "",
      projectName: "",
      companyName: "",
      contactNumber: "",
      email: "",
      aadharNumber: "",
      address: "",
      pinCode: ""
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

  exportToExcel(exportData, 'CustomerMaster', EXCEL_TEMPLATES.customers);

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
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div>
                <Label htmlFor="customer-name">Customer Name *</Label>
                <Input
                  id="customer-name"
                  value={currentCustomer.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <Label htmlFor="flat-select">Flat Number *</Label>
                <Select value={currentCustomer.flatId} onValueChange={handleFlatChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a flat" />
                  </SelectTrigger>
                  <SelectContent>
                    {flats.map((flat) => (
                      <SelectItem key={flat.id} value={flat.id}>
                        {flat.companyName} - {flat.projectName} - {flat.wingName} - {flat.flatNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentCustomer.flatId && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Selected Flat Details</h4>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>Company: {currentCustomer.companyName}</p>
                    <p>Project: {currentCustomer.projectName}</p>
                    <p>Wing: {currentCustomer.wingName}</p>
                    <p>Flat: {currentCustomer.flatNumber}</p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="contact-number">Contact Number</Label>
                <Input
                  id="contact-number"
                  value={currentCustomer.contactNumber}
                  onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                  placeholder="e.g., 9876543210"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentCustomer.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="e.g., john.doe@example.com"
                />
              </div>

              <div>
                <Label htmlFor="aadhar-number">Aadhar Number</Label>
                <Input
                  id="aadhar-number"
                  value={currentCustomer.aadharNumber}
                  onChange={(e) => handleInputChange("aadharNumber", e.target.value)}
                  placeholder="e.g., 123456789012"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Address Details</h3>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={currentCustomer.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter address"
                />
              </div>

              <div>
                <Label htmlFor="pin-code">Pin Code</Label>
                <Input
                  id="pin-code"
                  value={currentCustomer.pinCode}
                  onChange={(e) => handleInputChange("pinCode", e.target.value)}
                  placeholder="e.g., 400001"
                />
              </div>
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
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {editingId ? "Update Customer" : "Save Customer"}
            </Button>
          </div>
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
