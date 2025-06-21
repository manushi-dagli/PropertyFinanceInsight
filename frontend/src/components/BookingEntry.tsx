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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IndianRupee,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExcelImportDialog from "./ExcelImportDialog";
import { exportToExcel } from "@/utils/excelUtils";
import { EXCEL_MODULE_NAMES, EXCEL_TEMPLATES } from "@/types/excel.types";

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

const BookingEntry = ({ reportingDate }: { reportingDate: string }) => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookingPayments, setBookingPayments] = useState<BookingPayment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [jointOwners, setJointOwners] = useState<JointOwner[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [currentPayment, setCurrentPayment] = useState<BookingPayment>({
    id: "",
    customerId: "",
    customerName: "",
    projectName: "",
    wingName: "",
    flatNumber: "",
    paymentDate: "",
    payerName: "",
    modeOfPayment: "Cheque",
    amountPaid: 0,
    customerBankName: "",
    customerAccountNo: "",
    companyBankName: "",
    companyAccountNo: "",
    agreementValue: 0,
    bookingAmount: 0,
    outstandingAmount: 0,
  });

  useEffect(() => {
    const savedCustomers = localStorage.getItem("customers");
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
  }, []);

  useEffect(() => {
    const savedBookingPayments = localStorage.getItem("bookingPayments");
    if (savedBookingPayments) {
      setBookingPayments(JSON.parse(savedBookingPayments));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bookingPayments", JSON.stringify(bookingPayments));
  }, [bookingPayments]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedPayments(bookingPayments.map((payment) => payment.id));
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (paymentId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayments((prev) => [...prev, paymentId]);
    } else {
      setSelectedPayments((prev) => prev.filter((id) => id !== paymentId));
      setSelectAll(false);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedPayments.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select payments to delete",
        variant: "destructive",
      });
      return;
    }

    setBookingPayments((prev) =>
      prev.filter((payment) => !selectedPayments.includes(payment.id))
    );
    setSelectedPayments([]);
    setSelectAll(false);

    toast({
      title: "Success",
      description: `${selectedPayments.length} payment(s) deleted successfully`,
    });
  };

  const handleDeleteAll = () => {
    if (bookingPayments.length === 0) {
      toast({
        title: "No Data",
        description: "No payments to delete",
        variant: "destructive",
      });
      return;
    }

    setBookingPayments([]);
    setSelectedPayments([]);
    setSelectAll(false);

    toast({
      title: "Success",
      description: "All payments deleted successfully",
    });
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);

      const savedJointOwners = localStorage.getItem(
        `jointOwners_${customerId}`
      );
      if (savedJointOwners) {
        setJointOwners(JSON.parse(savedJointOwners));
      } else {
        setJointOwners([]);
      }

      const existingPayment = bookingPayments.find(
        (p) => p.customerId === customerId
      );

      setCurrentPayment((prev) => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.customerName,
        projectName: customer.projectName,
        wingName: customer.wingName,
        flatNumber: customer.flatNumber,
        payerName: customer.customerName,
        agreementValue: existingPayment?.agreementValue || 0,
        bookingAmount: existingPayment?.bookingAmount || 0,
        outstandingAmount: existingPayment?.outstandingAmount || 0,
      }));
    }
  };

  const calculateOutstandingAmount = (
    agreementValue: number,
    totalPaidSoFar: number
  ) => {
    return Math.max(0, agreementValue - totalPaidSoFar);
  };

  const getTotalPaidForCustomer = (customerId: string, excludeId?: string) => {
    return bookingPayments
      .filter((p) => p.customerId === customerId && p.id !== excludeId)
      .reduce((sum, p) => sum + p.amountPaid, 0);
  };

  const handleInputChange = (
    field: keyof BookingPayment,
    value: string | number
  ) => {
    setCurrentPayment((prev) => {
      const updated = {
        ...prev,
        [field]:
          field === "amountPaid" ||
          field === "agreementValue" ||
          field === "bookingAmount"
            ? parseFloat(value as string) || 0
            : value,
      };

      if (field === "agreementValue" || field === "amountPaid") {
        const totalPaidSoFar = getTotalPaidForCustomer(
          updated.customerId,
          editingId
        );
        const newTotalPaid = totalPaidSoFar + (updated.amountPaid || 0);
        updated.outstandingAmount = calculateOutstandingAmount(
          updated.agreementValue,
          newTotalPaid
        );
      }

      return updated;
    });
  };

  const validatePayment = () => {
    if (!currentPayment.customerId) {
      toast({
        title: "Validation Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return false;
    }

    if (!currentPayment.paymentDate) {
      toast({
        title: "Validation Error",
        description: "Payment date is required",
        variant: "destructive",
      });
      return false;
    }

    if (currentPayment.amountPaid <= 0) {
      toast({
        title: "Validation Error",
        description: "Amount paid must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    if (!currentPayment.payerName.trim()) {
      toast({
        title: "Validation Error",
        description: "Payer name is required",
        variant: "destructive",
      });
      return false;
    }

    if (currentPayment.agreementValue <= 0) {
      toast({
        title: "Validation Error",
        description: "Agreement value must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    const totalPaidSoFar = getTotalPaidForCustomer(
      currentPayment.customerId,
      editingId
    );
    const remainingAmount = currentPayment.agreementValue - totalPaidSoFar;

    if (currentPayment.amountPaid > remainingAmount) {
      toast({
        title: "Validation Error",
        description: `Payment amount (₹${currentPayment.amountPaid.toLocaleString()}) cannot exceed outstanding balance (₹${remainingAmount.toLocaleString()})`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validatePayment()) return;

    const totalPaidSoFar = getTotalPaidForCustomer(
      currentPayment.customerId,
      editingId
    );
    const newTotalPaid = totalPaidSoFar + currentPayment.amountPaid;
    const newOutstandingAmount = calculateOutstandingAmount(
      currentPayment.agreementValue,
      newTotalPaid
    );

    const paymentToSave = {
      ...currentPayment,
      outstandingAmount: newOutstandingAmount,
    };

    if (editingId) {
      setBookingPayments((prev) =>
        prev.map((payment) =>
          payment.id === editingId
            ? { ...paymentToSave, id: editingId }
            : payment
        )
      );
      setEditingId(null);
      toast({
        title: "Success",
        description: "Booking payment updated successfully",
      });
    } else {
      const newPayment = { ...paymentToSave, id: Date.now().toString() };
      setBookingPayments((prev) => [...prev, newPayment]);
      toast({
        title: "Success",
        description: "Booking payment added successfully",
      });
    }

    setBookingPayments((prev) =>
      prev.map((payment) =>
        payment.customerId === currentPayment.customerId
          ? {
              ...payment,
              agreementValue: currentPayment.agreementValue,
              outstandingAmount: newOutstandingAmount,
            }
          : payment
      )
    );

    handleCancel();
  };

  const handleEdit = (payment: BookingPayment) => {
    setCurrentPayment(payment);
    setEditingId(payment.id);
    setShowAddForm(true);

    const customer = customers.find((c) => c.id === payment.customerId);
    if (customer) {
      setSelectedCustomer(customer);
      const savedJointOwners = localStorage.getItem(
        `jointOwners_${customer.id}`
      );
      if (savedJointOwners) {
        setJointOwners(JSON.parse(savedJointOwners));
      }
    }
  };

  const handleDelete = (id: string) => {
    const paymentToDelete = bookingPayments.find((p) => p.id === id);
    if (!paymentToDelete) return;

    const otherPayments = bookingPayments.filter(
      (p) => p.id !== id && p.customerId === paymentToDelete.customerId
    );
    const totalPaidAfterDeletion = otherPayments.reduce(
      (sum, p) => sum + p.amountPaid,
      0
    );
    const newOutstandingAmount = calculateOutstandingAmount(
      paymentToDelete.agreementValue,
      totalPaidAfterDeletion
    );

    setBookingPayments((prev) =>
      prev
        .filter((payment) => payment.id !== id)
        .map((payment) =>
          payment.customerId === paymentToDelete.customerId
            ? { ...payment, outstandingAmount: newOutstandingAmount }
            : payment
        )
    );

    toast({
      title: "Success",
      description: "Booking payment deleted successfully",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setSelectedCustomer(null);
    setJointOwners([]);
    setCurrentPayment({
      id: "",
      customerId: "",
      customerName: "",
      projectName: "",
      wingName: "",
      flatNumber: "",
      paymentDate: "",
      payerName: "",
      modeOfPayment: "Cheque",
      amountPaid: 0,
      customerBankName: "",
      customerAccountNo: "",
      companyBankName: "",
      companyAccountNo: "",
      agreementValue: 0,
      bookingAmount: 0,
      outstandingAmount: 0,
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const getAvailablePayers = () => {
    const payers = [selectedCustomer?.customerName];
    jointOwners.forEach((owner) => payers.push(owner.name));
    return payers.filter(Boolean);
  };

  const getCurrentOutstandingForCustomer = (customerId: string) => {
    const customerPayments = bookingPayments.filter(
      (p) => p.customerId === customerId
    );
    if (customerPayments.length === 0) return 0;

    const latestPayment = customerPayments[customerPayments.length - 1];
    return latestPayment.outstandingAmount;
  };

  const handleExport = () => {
    if (bookingPayments.length === 0) {
      toast({
        title: "No Data",
        description: "No booking payments available to export",
        variant: "destructive",
      });
      return;
    }

    const exportData = bookingPayments.map((payment) => [
      payment.flatNumber,
      payment.customerName,
      formatDate(payment.paymentDate),
      payment.amountPaid,
      payment.modeOfPayment,
      payment.customerAccountNo || "",
      payment.customerBankName || "",
    ]);

    exportToExcel(
      exportData,
      EXCEL_MODULE_NAMES.BOOKING_MASTER,
      EXCEL_TEMPLATES.bookings
    );

    toast({
      title: "Success",
      description: "Booking payments exported successfully",
    });
  };

  const handleImport = (data: any[]) => {
    try {
      console.log("Raw booking import data:", data);

      const importedPayments = data.map((row, index) => {
        console.log(`Processing booking row ${index + 1}:`, row);

        const flatNumber = row[0]?.toString() || "";
        const customerName = row[1]?.toString() || "";
        const bookingDate = row[2]?.toString() || "";
        const amountReceived = parseFloat(row[3]) || 0;
        const paymentMode = row[4]?.toString() || "Cheque";
        const referenceNo = row[5]?.toString() || "";
        const bankName = row[6]?.toString() || "";

        const customer = customers.find(
          (c) =>
            c.customerName?.toLowerCase().trim() ===
              customerName.toLowerCase().trim() && c.flatNumber === flatNumber
        );

        if (!customer && customerName && flatNumber) {
          console.warn(
            `Customer '${customerName}' with flat '${flatNumber}' not found`
          );
        }

        if (amountReceived <= 0) {
          throw new Error(
            `Row ${index + 2}: Amount received must be greater than 0`
          );
        }

        let formattedDate = bookingDate;
        if (typeof bookingDate === "string" && bookingDate.includes("/")) {
          const parts = bookingDate.split("/");
          if (parts.length === 3) {
            formattedDate = `${parts[2]}-${parts[1].padStart(
              2,
              "0"
            )}-${parts[0].padStart(2, "0")}`;
          }
        }

        return {
          id: Date.now().toString() + index,
          customerId: customer?.id || "",
          customerName: customer?.customerName || customerName,
          projectName: customer?.projectName || "",
          wingName: customer?.wingName || "",
          flatNumber: customer?.flatNumber || flatNumber,
          paymentDate: formattedDate,
          payerName: customer?.customerName || customerName,
          modeOfPayment: paymentMode,
          amountPaid: amountReceived,
          customerBankName: bankName,
          customerAccountNo: referenceNo,
          companyBankName: "",
          companyAccountNo: "",
          agreementValue: 0,
          bookingAmount: 0,
          outstandingAmount: 0,
        };
      });

      setBookingPayments((prev) => [...prev, ...importedPayments]);

      toast({
        title: "Success",
        description: `Imported ${importedPayments.length} booking payments successfully`,
      });
    } catch (error) {
      toast({
        title: "Import Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to import booking payments",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Booking Entry
          </CardTitle>
          <CardDescription>
            Manage booking payments and track outstanding amounts for customers
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Import/Export and Add Payment Buttons */}
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
          Add Booking Payment
        </Button>
      </div>

      {/* Bulk Actions */}
      {bookingPayments.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-payments"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all-payments">
                    Select All ({bookingPayments.length})
                  </Label>
                </div>
                {selectedPayments.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedPayments.length} selected
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDeleteSelected}
                  variant="destructive"
                  size="sm"
                  disabled={selectedPayments.length === 0}
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
        moduleName="bookings"
        title="Booking Entry"
      />

      {/* Add/Edit Payment Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit Booking Payment" : "Add Booking Payment"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="customer-select">Select Customer *</Label>
                <Select
                  value={currentPayment.customerId}
                  onValueChange={handleCustomerChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.customerName} - {customer.companyName} -{" "}
                        {customer.projectName} - {customer.wingName} -{" "}
                        {customer.flatNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomer && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">
                    Customer Details
                  </h4>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>Project: {selectedCustomer.projectName}</p>
                    <p>Wing: {selectedCustomer.wingName}</p>
                    <p>Flat: {selectedCustomer.flatNumber}</p>
                    <p className="font-medium text-red-600">
                      Current Outstanding: ₹
                      {getCurrentOutstandingForCustomer(
                        selectedCustomer.id
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="agreement-value">Agreement Value (₹) *</Label>
                <Input
                  id="agreement-value"
                  type="number"
                  step="0.01"
                  value={currentPayment.agreementValue || ""}
                  onChange={(e) =>
                    handleInputChange("agreementValue", e.target.value)
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="outstanding-amount">
                  Outstanding Amount (₹)
                </Label>
                <Input
                  id="outstanding-amount"
                  type="number"
                  value={currentPayment.outstandingAmount || ""}
                  readOnly
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-calculated: Agreement Value - Total Payments Made
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="payment-date">
                  Payment Date (DD/MM/YYYY) *
                </Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={currentPayment.paymentDate}
                  onChange={(e) =>
                    handleInputChange("paymentDate", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="payer-name">Payer Name *</Label>
                <Select
                  value={currentPayment.payerName}
                  onValueChange={(value) =>
                    handleInputChange("payerName", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payer" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePayers().map((payer, index) => (
                      <SelectItem key={index} value={payer!}>
                        {payer} {index === 0 ? "(Customer)" : `(Joint Owner)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mode-payment">Mode of Payment *</Label>
                <Select
                  value={currentPayment.modeOfPayment}
                  onValueChange={(value) =>
                    handleInputChange("modeOfPayment", value)
                  }
                >
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
                <Label htmlFor="amount-paid">Amount Paid (₹) *</Label>
                <Input
                  id="amount-paid"
                  type="number"
                  step="0.01"
                  value={currentPayment.amountPaid || ""}
                  onChange={(e) =>
                    handleInputChange("amountPaid", e.target.value)
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">
                  Customer's Bank Details
                </h4>
                <div>
                  <Label htmlFor="customer-bank">Bank Name</Label>
                  <Input
                    id="customer-bank"
                    value={currentPayment.customerBankName}
                    onChange={(e) =>
                      handleInputChange("customerBankName", e.target.value)
                    }
                    placeholder="Customer's Bank Name"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-account">Account Number</Label>
                  <Input
                    id="customer-account"
                    value={currentPayment.customerAccountNo}
                    onChange={(e) =>
                      handleInputChange("customerAccountNo", e.target.value)
                    }
                    placeholder="Customer's Account Number"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">
                  Company's Bank Details
                </h4>
                <div>
                  <Label htmlFor="company-bank">Bank Name</Label>
                  <Input
                    id="company-bank"
                    value={currentPayment.companyBankName}
                    onChange={(e) =>
                      handleInputChange("companyBankName", e.target.value)
                    }
                    placeholder="Company's Bank Name"
                  />
                </div>
                <div>
                  <Label htmlFor="company-account">Account Number</Label>
                  <Input
                    id="company-account"
                    value={currentPayment.companyAccountNo}
                    onChange={(e) =>
                      handleInputChange("companyAccountNo", e.target.value)
                    }
                    placeholder="Company's Account Number"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={handleCancel} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {editingId ? "Update Payment" : "Save Payment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Payments List */}
      {bookingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Payment History</CardTitle>
            <CardDescription>
              List of all booking payments with outstanding balance tracking
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
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Payer</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Agreement Value</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPayments.includes(payment.id)}
                        onCheckedChange={(checked) =>
                          handleSelectPayment(payment.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>{payment.customerName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{payment.projectName}</p>
                        <p className="text-gray-600">
                          {payment.wingName} - {payment.flatNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>{payment.payerName}</TableCell>
                    <TableCell>{payment.modeOfPayment}</TableCell>
                    <TableCell>
                      ₹{payment.amountPaid.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      ₹{payment.agreementValue.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-red-600">
                      ₹{payment.outstandingAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(payment)}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(payment.id)}
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

export default BookingEntry;
