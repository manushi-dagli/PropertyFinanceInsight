import * as XLSX from 'xlsx';

// Excel templates for each module
export const EXCEL_TEMPLATES = {
  companies: [
    'Company Name',
    'CIN',
    'PAN',
    'GSTIN', 
    'Address',
    'Contact Person',
    'Contact Number',
    'Email ID'
  ],
  projects: [
    'Project Name',
    'Company Name',
    'Location',
    'Start Date',
    'End Date',
    'Total Carpet Area (Sq.M)',
    'Estimated Land Cost',
    'Estimated Construction Cost'
  ],
  wings: [
    'Wing Name',
    'Project Name',
    'Company Name',
    'Total Floors'
  ],
  flats: [
    'Flat Number',
    'Wing Name',
    'Company Name',
    'Carpet Area (Sq.M)',
    'Agreement Value',
    'Status (Available/Booked/Sold)'
  ],
  customers: [
    'Customer Name',
    'PAN',
    'Mobile Number',
    'Email',
    'Address',
    'Pin Code',
    'Aadhar Number',
    'Flat Number'
  ],
  bookings: [
    'Flat Number',
    'Customer Name',
    'Agreement Value',
    'Booking Date',
    'Amount Received',
    'Payment Mode',
    'Reference No',
    'Bank Name'
  ],
  cancellations: [
    'Flat Number',
    'Customer Name',
    'Cancellation Date',
    'Refund Amount',
    'Cancellation Reason'
  ]
};

export const downloadTemplate = (moduleName: keyof typeof EXCEL_TEMPLATES) => {
  const headers = EXCEL_TEMPLATES[moduleName];
  const worksheet = XLSX.utils.aoa_to_sheet([headers]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  
  const fileName = `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Template.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportToExcel = (data: any[], moduleName: string, headers: string[]) => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Convert data to array format for export
  const exportData = [headers, ...data];

  const worksheet = XLSX.utils.aoa_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, moduleName);
  
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB').replace(/\//g, '-');
  const fileName = `${moduleName}_${dateStr}.xlsx`;
  
  XLSX.writeFile(workbook, fileName);
};

export const readExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // Skip header row and filter out empty rows
        const dataRows = jsonData.slice(1).filter((row: any) => row && row.length > 0 && row.some((cell: any) => cell !== null && cell !== undefined && cell !== ''));
        resolve(dataRows as any[]);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const validateImportData = (data: any[], expectedHeaders: string[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (data.length === 0) {
    errors.push('File is empty');
    return { isValid: false, errors };
  }

  return { isValid: errors.length === 0, errors };
};
