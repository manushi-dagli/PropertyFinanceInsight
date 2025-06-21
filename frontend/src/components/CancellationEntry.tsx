import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Ban, Plus, Edit, Trash2, Save, X, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExcelImportDialog from "./ExcelImportDialog";
import { exportToExcel, EXCEL_TEMPLATES } from "@/utils/excelUtils";

interface Customer {
  id: string;
  customerName: string;
  flatId: string;
  flatNumber: string;
  wingName: string;
  projectName: string;
  companyName: string;
  email: string;
  contactNumber: string;
}

interface JointOwner {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
}

interface BookingPayment {
  id: string;
  customerId: string;
  customerName: string;
  projectName: string;
  wingName: string;
  flatNumber: string;
  paymentDate: string;
  payerName: string;
  modeOfPayment: string;
  amountPaid: number;
  customerBankName: string;
  customerAccountNo: string;
  companyBankName: string;
  companyAccountNo: string;
  agreementValue: number;
  bookingAmount: number;
  outstandingAmount: number;
}

interface CancellationPayment {
  id: string;
  customerId: string;
  customerName: string;
  projectName: string;
  wingName: string;
  flatNumber: string;
  refundDate: string;
  payeeName: string;
  modeOfPayment: string;
  amountRefunded: number;
  customerBankName: string;
  customerAccountNo: string;
  companyBankName: string;
  companyAccountNo: string;
  remarks: string;
}

const CancellationEntry = ({ reportingDate }: { reportingDate: string }) => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookingPayments, setBookingPayments] = useState<BookingPayment[]>([]);
  const [cancellationPayments, setCancellationPayments] = useState<CancellationPayment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [jointOwners, setJointOwners] = useState<JointOwner[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedCancellations, setSelectedCancellations] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [currentRefund, setCurrentRefund] = useState<CancellationPayment>({
    id: "",
    customerId: "",
    customerName: "",
    projectName: "",
    wingName: "",
    flatNumber: "",
    refundDate: "",
    payeeName: "",
    modeOfPayment: "Cheque",
    amountRefunded: 0,
    customerBankName: "",
    customerAccountNo: "",
    companyBankName: "",
    companyAccountNo: "",
    remarks: ""
  });

  useEffect(() => {
    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }

    const savedBookingPayments = localStorage.getItem('bookingPayments');
    if (savedBookingPayments) {
      setBookingPayments(JSON.parse(savedBookingPayments));
    }

    const savedCancellationPayments = localStorage.getItem('cancellationPayments');
    if (savedCancellationPayments) {
      setCancellationPayments(JSON.parse(savedCancellationPayments));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cancellationPayments', JSON.stringify(cancellationPayments));
  }, [cancellationPayments]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedCancellations(cancellationPayments.map(cancellation => cancellation.id));
    } else {
      setSelectedCancellations([]);
    }
  };

  const handleSelectCancellation = (cancellationId: string, checked: boolean) => {
    if (checked) {
      setSelectedCancellations(prev => [...prev, cancellationId]);
    } else {
      setSelectedCancellations(prev => prev.filter(id => id !== cancellationId));
      setSelectAll(false);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedCancellations.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select cancellations to delete",
        variant: "destructive"
      });
      return;
    }

    setCancellationPayments(prev => prev.filter(cancellation => !selectedCancellations.includes(cancellation.id)));
    setSelectedCancellations([]);
    setSelectAll(false);
    
    toast({
      title: "Success",
      description: `${selectedCancellations.length} cancellation(s) deleted successfully`
    });
  };

  const handleDeleteAll = () => {
    if (cancellationPayments.length === 0) {
      toast({
        title: "No Data",
        description: "No cancellations to delete",
        variant: "destructive"
      });
      return;
    }

    setCancellationPayments([]);
    setSelectedCancellations([]);
    setSelectAll(false);
    
    toast({
      title: "Success",
      description: "All cancellations deleted successfully"
    });
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      
      const savedJointOwners = localStorage.getItem(`jointOwners_${customerId}`);
      if (savedJointOwners) {
        setJointOwners(JSON.parse(savedJointOwners));
      } else {
        setJointOwners([]);
      }

      setCurrentRefund(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.customerName,
        projectName: customer.projectName,
        wingName: customer.wingName,
        flatNumber: customer.flatNumber,
        payeeName: customer.customerName
      }));
    }
  };

  const handleInputChange = (field: keyof CancellationPayment, value: string | number) => {
    setCurrentRefund(prev => ({
      ...prev,
      [field]: field === 'amountRefunded' 
        ? (parseFloat(value as string) || 0) 
        : value
    }));
  };

  const getTotalPaidByCustomer = (customerId: string) => {
    return bookingPayments
      .filter(p => p.customerId === customerId)
      .reduce((sum, p) => sum + p.amountPaid, 0);
  };

  const getTotalRefundedForCustomer = (customerId: string, excludeId?: string) => {
    return cancellationPayments
      .filter(p => p.customerId === customerId && p.id !== excludeId)
      .reduce((sum, p) => sum + p.amountRefunded, 0);
  };

  const validateRefund = () => {
    if (!currentRefund.customerId) {
      toast({
        title: "Validation Error",
        description: "Please select a customer",
        variant: "destructive"
      });
      return false;
    }

    if (!currentRefund.refundDate) {
      toast({
        title: "Validation Error",
        description: "Refund date is required",
        variant: "destructive"
      });
      return false;
    }

    if (currentRefund.amountRefunded <= 0) {
      toast({
        title: "Validation Error",
        description: "Refund amount must be greater than 0",
        variant: "destructive"
      });
      return false;
    }

    if (!currentRefund.payeeName.trim()) {
      toast({
        title: "Validation Error",
        description: "Payee name is required",
        variant: "destructive"
      });
      return false;
    }

    const totalPaid = getTotalPaidByCustomer(currentRefund.customerId);
    const totalRefundedSoFar = getTotalRefundedForCustomer(currentRefund.customerId, editingId);
    const availableForRefund = totalPaid - totalRefundedSoFar;
    
    if (currentRefund.amountRefunded > availableForRefund) {
      toast({
        title: "Validation Error",
        description: `Refund amount (₹${currentRefund.amountRefunded.toLocaleString()}) cannot exceed available refund amount (₹${availableForRefund.toLocaleString()})`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateRefund()) return;

    if (editingId) {
      setCancellationPayments(prev => prev.map(refund => 
        refund.id === editingId ? { ...currentRefund, id: editingId } : refund
      ));
      setEditingId(null);
      toast({
        title: "Success",
        description: "Cancellation refund updated successfully"
      });
    } else {
      const newRefund = { ...currentRefund, id: Date.now().toString() };
      setCancellationPayments(prev => [...prev, newRefund]);
      toast({
        title: "Success",
        description: "Cancellation refund added successfully"
      });
    }

    handleCancel();
  };

  const handleEdit = (refund: CancellationPayment) => {
    setCurrentRefund(refund);
    setEditingId(refund.id);
    setShowAddForm(true);
    
    const customer = customers.find(c => c.id === refund.customerId);
    if (customer) {
      setSelectedCustomer(customer);
      const savedJointOwners = localStorage.getItem(`jointOwners_${customer.id}`);
      if (savedJointOwners) {
        setJointOwners(JSON.parse(savedJointOwners));
      }
    }
  };

  const handleDelete = (id: string) => {
    setCancellationPayments(prev => prev.filter(refund => refund.id !== id));
    toast({
      title: "Success",
      description: "Cancellation refund deleted successfully"
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setSelectedCustomer(null);
    setJointOwners([]);
    setCurrentRefund({
      id: "",
      customerId: "",
      customerName: "",
      projectName: "",
      wingName: "",
      flatNumber: "",
      refundDate: "",
      payeeName: "",
      modeOfPayment: "Cheque",
      amountRefunded: 0,
      customerBankName: "",
      customerAccountNo: "",
      companyBankName: "",
      companyAccountNo: "",
      remarks: ""
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const getAvailablePayees = () => {
    const payees = [selectedCustomer?.customerName];
    jointOwners.forEach(owner => payees.push(owner.name));
    return payees.filter(Boolean);
  };

  const customersWithPayments = customers.filter(customer => 
    bookingPayments.some(payment => payment.customerId === customer.id)
  );

  const handleExport = () => {
    if (cancellationPayments.length === 0) {
      toast({
        title: "No Data",
        description: "No cancellation payments available to export",
        variant: "destructive"
      });
      return;
    }

    const exportData = cancellationPayments.map(payment => [
      payment.flatNumber,
      payment.customerName,
      formatDate(payment.refundDate),
      payment.amountRefunded,
      payment.remarks || ''
    ]);

    exportToExcel(exportData, 'CancellationEntry', EXCEL_TEMPLATES.cancellations);
    
    toast({
      title: "Success",
      description: "Cancellation payments exported successfully"
    });
  };

  const handleImport = (data: any[]) => {
    try {
      console.log('Raw cancellation import data:', data);
      
      const importedCancellations = data.map((row, index) => {
        console.log(`Processing cancellation row ${index + 1}:`, row);
        
        const flatNumber = row[0]?.toString() || '';
        const customerName = row[1]?.toString() || '';
        const cancellationDate = row[2]?.toString() || '';
        const refundAmount = parseFloat(row[3]) || 0;
        const cancellationReason = row[4]?.toString() || '';

        const customer = customers.find(c => 
          c.customerName?.toLowerCase().trim() === customerName.toLowerCase().trim() && 
          c.flatNumber === flatNumber
        );
        
        if (!customer && customerName && flatNumber) {
          console.warn(`Customer '${customerName}' with flat '${flatNumber}' not found`);
        }

        if (refundAmount <= 0) {
          throw new Error(`Row ${index + 2}: Refund amount must be greater than 0`);
        }

        let formattedDate = cancellationDate;
        if (typeof cancellationDate === 'string' && cancellationDate.includes('/')) {
          const parts = cancellationDate.split('/');
          if (parts.length === 3) {
            formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }

        return {
          id: Date.now().toString() + index,
          customerId: customer?.id || '',
          customerName: customer?.customerName || customerName,
          projectName: customer?.projectName || '',
          wingName: customer?.wingName || '',
          flatNumber: customer?.flatNumber || flatNumber,
          refundDate: formattedDate,
          payeeName: customer?.customerName || customerName,
          modeOfPayment: 'Cheque',
          amountRefunded: refundAmount,
          customerBankName: '',
          customerAccountNo: '',
          companyBankName: '',
          companyAccountNo: '',
          remarks: cancellationReason
        };
      });

      setCancellationPayments(prev => [...prev, ...importedCancellations]);
      
      toast({
        title: "Success",
        description: `Imported ${importedCancellations.length} cancellation payments successfully`
      });
    } catch (error) {
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : "Failed to import cancellation payments",
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
            <Ban className="h-5 w-5" />
            Cancellation Entry
          </CardTitle>
          <CardDescription>
            Process refunds for cancelled bookings and track cancellation history
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Import/Export and Add Refund Buttons */}
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
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Cancellation Refund
        </Button>
      </div>

      {/* Bulk Actions */}
      {cancellationPayments.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-cancellations"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all-cancellations">Select All ({cancellationPayments.length})</Label>
                </div>
                {selectedCancellations.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedCancellations.length} selected
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDeleteSelected}
                  variant="destructive"
                  size="sm"
                  disabled={selectedCancellations.length === 0}
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
        moduleName="cancellations"
        title="Cancellation Entry"
      />

      {/* Add/Edit Refund Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit Cancellation Refund" : "Add Cancellation Refund"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Selection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="customer-select">Select Customer *</Label>
                <Select value={currentRefund.customerId} onValueChange={handleCustomerChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer with payments" />
                  </SelectTrigger>
                  <SelectContent>
                    {customersWithPayments.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.customerName} - {customer.companyName} - {customer.projectName} - {customer.wingName} - {customer.flatNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomer && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Payment Summary</h4>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>Total Paid: ₹{getTotalPaidByCustomer(selectedCustomer.id).toLocaleString()}</p>
                    <p>Total Refunded: ₹{getTotalRefundedForCustomer(selectedCustomer.id).toLocaleString()}</p>
                    <p className="font-medium text-green-600">
                      Available for Refund: ₹{(getTotalPaidByCustomer(selectedCustomer.id) - getTotalRefundedForCustomer(selectedCustomer.id)).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Refund Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="refund-date">Refund Date (DD/MM/YYYY) *</Label>
                <Input
                  id="refund-date"
                  type="date"
                  value={currentRefund.refundDate}
                  onChange={(e) => handleInputChange("refundDate", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="payee-name">Payee Name *</Label>
                <Select value={currentRefund.payeeName} onValueChange={(value) => handleInputChange("payeeName", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payee" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePayees().map((payee, index) => (
                      <SelectItem key={index} value={payee!}>
                        {payee} {index === 0 ? "(Customer)" : `(Joint Owner)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mode-payment">Mode of Payment *</Label>
                <Select value={currentRefund.modeOfPayment} onValueChange={(value) => handleInputChange("modeOfPayment", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="NEFT/RTGS">NEFT/RTGS</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Demand Draft">Demand Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount-refunded">Amount to Refund (₹) *</Label>
                <Input
                  id="amount-refunded"
                  type="number"
                  step="0.01"
                  value={currentRefund.amountRefunded || ""}
                  onChange={(e) => handleInputChange("amountRefunded", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Bank Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Customer's Bank Details</h4>
                <div>
                  <Label htmlFor="customer-bank">Bank Name</Label>
                  <Input
                    id="customer-bank"
                    value={currentRefund.customerBankName}
                    onChange={(e) => handleInputChange("customerBankName", e.target.value)}
                    placeholder="Customer's Bank Name"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-account">Account Number</Label>
                  <Input
                    id="customer-account"
                    value={currentRefund.customerAccountNo}
                    onChange={(e) => handleInputChange("customerAccountNo", e.target.value)}
                    placeholder="Customer's Account Number"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Company's Bank Details</h4>
                <div>
                  <Label htmlFor="company-bank">Bank Name</Label>
                  <Input
                    id="company-bank"
                    value={currentRefund.companyBankName}
                    onChange={(e) => handleInputChange("companyBankName", e.target.value)}
                    placeholder="Company's Bank Name"
                  />
                </div>
                <div>
                  <Label htmlFor="company-account">Account Number</Label>
                  <Input
                    id="company-account"
                    value={currentRefund.companyAccountNo}
                    onChange={(e) => handleInputChange("companyAccountNo", e.target.value)}
                    placeholder="Company's Account Number"
                  />
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Input
                id="remarks"
                value={currentRefund.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                placeholder="Additional remarks for the refund"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={handleCancel} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {editingId ? "Update Refund" : "Save Refund"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancellation Refunds List */}
      {cancellationPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cancellation Refund History</CardTitle>
            <CardDescription>
              List of all processed refunds for cancelled bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Flat Details</TableHead>
                  <TableHead>Refund Date</TableHead>
                  <TableHead>Payee</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Amount Refunded</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cancellationPayments.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCancellations.includes(refund.id)}
                        onCheckedChange={(checked) => handleSelectCancellation(refund.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>{refund.customerName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{refund.projectName}</p>
                        <p className="text-gray-600">{refund.wingName} - {refund.flatNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(refund.refundDate)}</TableCell>
                    <TableCell>{refund.payeeName}</TableCell>
                    <TableCell>{refund.modeOfPayment}</TableCell>
                    <TableCell className="font-medium text-green-600">₹{refund.amountRefunded.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{refund.remarks}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(refund)}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(refund.id)}
                          variant="destructive"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CancellationEntry;
