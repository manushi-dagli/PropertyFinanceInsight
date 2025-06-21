
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndianRupee, Plus, Trash2, Edit, Save, X } from "lucide-react";

export interface PaymentData {
  id: string;
  amount: number;
  paymentDate: string;
  payerName: string;
  modeOfPayment: string;
  bankName: string;
  bankAccountNo: string;
  depositedInBank: string;
  depositedInAccountNo: string;
}

interface PaymentEntryProps {
  payments: PaymentData[];
  onPaymentsChange: (payments: PaymentData[]) => void;
  customerName: string;
  jointOwners: string[];
}

const PaymentEntry = ({ payments, onPaymentsChange, customerName, jointOwners }: PaymentEntryProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<PaymentData>({
    id: "",
    amount: 0,
    paymentDate: "",
    payerName: customerName,
    modeOfPayment: "Cheque",
    bankName: "",
    bankAccountNo: "",
    depositedInBank: "",
    depositedInAccountNo: ""
  });

  const handleInputChange = (field: keyof PaymentData, value: string | number) => {
    setCurrentPayment(prev => ({
      ...prev,
      [field]: field === 'amount' ? (parseFloat(value as string) || 0) : value
    }));
  };

  const handleSave = () => {
    if (currentPayment.amount <= 0) {
      alert("Payment amount must be greater than 0");
      return;
    }

    if (!currentPayment.paymentDate) {
      alert("Payment date is required");
      return;
    }

    if (!currentPayment.payerName.trim()) {
      alert("Payer name is required");
      return;
    }

    if (editingId) {
      // Update existing payment
      const updatedPayments = payments.map(payment => 
        payment.id === editingId ? { ...currentPayment, id: editingId } : payment
      );
      onPaymentsChange(updatedPayments);
      setEditingId(null);
    } else {
      // Add new payment
      const newPayment = { ...currentPayment, id: Date.now().toString() };
      onPaymentsChange([...payments, newPayment]);
    }

    // Reset form
    setCurrentPayment({
      id: "",
      amount: 0,
      paymentDate: "",
      payerName: customerName,
      modeOfPayment: "Cheque",
      bankName: "",
      bankAccountNo: "",
      depositedInBank: "",
      depositedInAccountNo: ""
    });
    setShowAddForm(false);
  };

  const handleEdit = (payment: PaymentData) => {
    setCurrentPayment(payment);
    setEditingId(payment.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    const updatedPayments = payments.filter(payment => payment.id !== id);
    onPaymentsChange(updatedPayments);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setCurrentPayment({
      id: "",
      amount: 0,
      paymentDate: "",
      payerName: customerName,
      modeOfPayment: "Cash",
      bankName: "",
      bankAccountNo: "",
      depositedInBank: "",
      depositedInAccountNo: ""
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const totalPaid = payments.reduce((total, payment) => total + payment.amount, 0);

  // Create list of available payers (customer + joint owners)
  const availablePayers = [customerName, ...jointOwners].filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-900">Payment Entries</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            Total Paid: ₹{totalPaid.toLocaleString()}
          </span>
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Payment
          </Button>
        </div>
      </div>

      {/* Add/Edit Payment Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              {editingId ? "Edit Payment" : "Add Payment Entry"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="payment-amount">Payment Amount (₹) *</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  value={currentPayment.amount || ""}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="payment-date">Payment Date *</Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={currentPayment.paymentDate}
                  onChange={(e) => handleInputChange("paymentDate", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="payer-name">Payer Name *</Label>
                <Select value={currentPayment.payerName} onValueChange={(value) => handleInputChange("payerName", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payer" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePayers.map((payer, index) => (
                      <SelectItem key={index} value={payer}>
                        {payer} {index === 0 ? "(Customer)" : `(Joint Owner ${index})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mode-of-payment">Mode of Payment</Label>
                <Select value={currentPayment.modeOfPayment} onValueChange={(value) => handleInputChange("modeOfPayment", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="NEFT/RTGS">NEFT/RTGS</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Demand Draft">Demand Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  value={currentPayment.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                  placeholder="Customer's Bank Name"
                />
              </div>

              <div>
                <Label htmlFor="bank-account-no">Bank Account No</Label>
                <Input
                  id="bank-account-no"
                  value={currentPayment.bankAccountNo}
                  onChange={(e) => handleInputChange("bankAccountNo", e.target.value)}
                  placeholder="Customer's Account Number"
                />
              </div>

              <div>
                <Label htmlFor="deposited-in-bank">Deposited in Bank</Label>
                <Input
                  id="deposited-in-bank"
                  value={currentPayment.depositedInBank}
                  onChange={(e) => handleInputChange("depositedInBank", e.target.value)}
                  placeholder="Company's Bank Name"
                />
              </div>

              <div>
                <Label htmlFor="deposited-account-no">Deposited in Account No</Label>
                <Input
                  id="deposited-account-no"
                  value={currentPayment.depositedInAccountNo}
                  onChange={(e) => handleInputChange("depositedInAccountNo", e.target.value)}
                  placeholder="Company's Account Number"
                />
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

      {/* Payment List */}
      {payments.length > 0 && (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <p className="font-medium text-gray-900">₹{payment.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Date: {formatDate(payment.paymentDate)}</p>
                  <p className="text-sm text-gray-600">Mode: {payment.modeOfPayment}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600"><span className="font-medium">Payer:</span> {payment.payerName}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Bank:</span> {payment.bankName}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">A/c:</span> {payment.bankAccountNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600"><span className="font-medium">Deposited in:</span> {payment.depositedInBank}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">A/c No:</span> {payment.depositedInAccountNo}</p>
                </div>
                <div className="flex justify-end gap-2">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentEntry;
