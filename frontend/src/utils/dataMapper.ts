/**
 * Utility functions to map between frontend camelCase and database snake_case
 */

export const mapWingToApi = (wing: {
  id?: string;
  wingName: string;
  projectId: string;
  projectName?: string;
  companyName?: string;
  constructionArea: number;
}) => {
  const apiData: any = {
    wing_name: wing.wingName,
    project_id: wing.projectId,
    construction_area: wing.constructionArea,
  };
  
  // Only include id if it's provided and not empty
  if (wing.id && wing.id.trim() !== "") {
    apiData.id = wing.id;
  }
  
  // Only include optional fields if they have values
  if (wing.projectName) {
    apiData.project_name = wing.projectName;
  }
  if (wing.companyName) {
    apiData.company_name = wing.companyName;
  }
  
  return apiData;
};

export const mapWingFromApi = (wing: any) => ({
  id: wing.id,
  wingName: wing.wing_name,
  projectId: wing.project_id,
  projectName: wing.project_name,
  companyName: wing.company_name,
  constructionArea: Number(wing.construction_area) || 0,
});

export const mapFlatToApi = (flat: {
  id?: string;
  flatNumber: string;
  wingId: string;
  carpetArea?: number;
  status?: string;
  agreementValue?: number;
}) => {
  const apiData: any = {
    flat_number: flat.flatNumber,
    wing_id: flat.wingId,
  };
  
  // Only include id if it's provided and not empty
  if (flat.id && flat.id.trim() !== "") {
    apiData.id = flat.id;
  }
  
  // Only include optional fields if they have values
  if (flat.carpetArea !== undefined && flat.carpetArea !== null) {
    apiData.carpet_area = flat.carpetArea;
  }
  if (flat.status) {
    apiData.status = flat.status;
  }
  if (flat.agreementValue !== undefined && flat.agreementValue !== null) {
    apiData.agreement_value = flat.agreementValue;
  }
  
  return apiData;
};

export const mapFlatFromApi = (flat: any) => ({
  id: flat.id,
  flatNumber: flat.flat_number,
  wingId: flat.wing_id,
  carpetArea: Number(flat.carpet_area) || 0,
  status: flat.status || "Available",
  agreementValue: Number(flat.agreement_value) || 0,
});

export const mapCustomerToApi = (customer: {
  id?: string;
  customerName?: string;
  flatId?: string;
  contactNumber?: string;
  email?: string;
  aadharNumber?: string;
  address?: string;
  pinCode?: string;
}) => ({
  id: customer.id,
  customer_name: customer.customerName,
  flat_id: customer.flatId,
  contact_number: customer.contactNumber ? Number(customer.contactNumber) : null,
  email: customer.email,
  aadhar_number: customer.aadharNumber,
  address: customer.address,
  pin_code: customer.pinCode ? Number(customer.pinCode) : null,
});

export const mapCustomerFromApi = (customer: any) => ({
  id: customer.id,
  customerName: customer.customer_name,
  flatId: customer.flat_id,
  contactNumber: customer.contact_number?.toString() || "",
  email: customer.email || "",
  aadharNumber: customer.aadhar_number || "",
  address: customer.address || "",
  pinCode: customer.pin_code?.toString() || "",
});

export const mapBookingToApi = (booking: {
  id?: string;
  customerId: string;
  flatId: string;
  paymentDate?: string;
  payerName?: string;
  modeOfPayment?: string;
  amountPaid?: number;
  customerBankName?: string;
  customerAccountNo?: string;
  companyBankName?: string;
  companyAccountNo?: string;
  agreementValue?: number;
  bookingAmount?: number;
  outstandingAmount?: number;
}) => ({
  id: booking.id,
  customer_id: booking.customerId,
  flat_id: booking.flatId,
  payment_date: booking.paymentDate,
  payer_name: booking.payerName,
  mode_of_payment: booking.modeOfPayment,
  amount_paid: booking.amountPaid,
  customer_bank_name: booking.customerBankName,
  customer_account_no: booking.customerAccountNo,
  company_bank_name: booking.companyBankName,
  company_account_no: booking.companyAccountNo,
  agreement_value: booking.agreementValue,
  booking_amount: booking.bookingAmount,
  outstanding_amount: booking.outstandingAmount,
});

export const mapBookingFromApi = (booking: any) => ({
  id: booking.id,
  customerId: booking.customer_id,
  flatId: booking.flat_id,
  paymentDate: booking.payment_date || "",
  payerName: booking.payer_name || "",
  modeOfPayment: booking.mode_of_payment || "",
  amountPaid: Number(booking.amount_paid) || 0,
  customerBankName: booking.customer_bank_name || "",
  customerAccountNo: booking.customer_account_no || "",
  companyBankName: booking.company_bank_name || "",
  companyAccountNo: booking.company_account_no || "",
  agreementValue: Number(booking.agreement_value) || 0,
  bookingAmount: Number(booking.booking_amount) || 0,
  outstandingAmount: Number(booking.outstanding_amount) || 0,
});

export const mapCancellationToApi = (cancellation: {
  id?: string;
  customerId: string;
  flatId: string;
  refundDate?: string;
  payeeName?: string;
  modeOfPayment?: string;
  amountRefunded?: number;
  customerBankName?: string;
  customerAccountNo?: string;
  companyBankName?: string;
  companyAccountNo?: string;
  remarks?: string;
}) => ({
  id: cancellation.id,
  customer_id: cancellation.customerId,
  flat_id: cancellation.flatId,
  refund_date: cancellation.refundDate,
  payee_name: cancellation.payeeName,
  mode_of_payment: cancellation.modeOfPayment,
  amount_refunded: cancellation.amountRefunded,
  customer_bank_name: cancellation.customerBankName,
  customer_account_no: cancellation.customerAccountNo,
  company_bank_name: cancellation.companyBankName,
  company_account_no: cancellation.companyAccountNo,
  remarks: cancellation.remarks,
});

export const mapCancellationFromApi = (cancellation: any) => ({
  id: cancellation.id,
  customerId: cancellation.customer_id,
  flatId: cancellation.flat_id,
  refundDate: cancellation.refund_date || "",
  payeeName: cancellation.payee_name || "",
  modeOfPayment: cancellation.mode_of_payment || "",
  amountRefunded: Number(cancellation.amount_refunded) || 0,
  customerBankName: cancellation.customer_bank_name || "",
  customerAccountNo: cancellation.customer_account_no || "",
  companyBankName: cancellation.company_bank_name || "",
  companyAccountNo: cancellation.company_account_no || "",
  remarks: cancellation.remarks || "",
});

