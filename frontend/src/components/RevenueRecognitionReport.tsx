
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, FileText, Filter, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RevenueRecognitionData {
  flatId: string;
  flatNumber: string;
  projectName: string;
  companyName: string;
  wingName: string;
  carpetArea: number;
  agreementValue: number;
  totalAmountReceived: number;
  eligibleForRevenue: boolean;
  estimatedLandCost: number;
  estimatedConstructionCost: number;
  estimatedFlatCost: number;
  actualLandCost: number;
  actualConstructionCost: number;
  actualFlatCost: number;
  recognizedRevenue: number;
  workInProgress: number;
  remarks: string;
}

const RevenueRecognitionReport = ({ reportingDate }: { reportingDate: string }) => {
  const { toast } = useToast();
  const [revenueData, setRevenueData] = useState<RevenueRecognitionData[]>([]);
  const [filteredData, setFilteredData] = useState<RevenueRecognitionData[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [bookingPayments, setBookingPayments] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  
  // Filters
  const [selectedProject, setSelectedProject] = useState<string>("ALL");
  const [selectedFlat, setSelectedFlat] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Load data from localStorage with correct keys
  useEffect(() => {
    console.log("Loading data from localStorage...");
    
    // Load projects data (contains estimated/actual costs and total area)
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const projectsData = JSON.parse(savedProjects);
      console.log("Projects loaded:", projectsData);
      setProjects(projectsData);
    }

    // Load booking payments data (contains agreement values and amounts received)
    const savedBookingPayments = localStorage.getItem('bookingPayments');
    if (savedBookingPayments) {
      const paymentsData = JSON.parse(savedBookingPayments);
      console.log("Booking payments loaded:", paymentsData);
      setBookingPayments(paymentsData);
    }

    // Load flats data (contains carpet area)
    const savedFlats = localStorage.getItem('flats');
    if (savedFlats) {
      const flatsData = JSON.parse(savedFlats);
      console.log("Flats loaded:", flatsData);
      setFlats(flatsData);
    }
  }, []);

  // Calculate revenue recognition data
  useEffect(() => {
    console.log("Calculating revenue recognition data...");
    console.log("Projects count:", projects.length);
    console.log("Booking payments count:", bookingPayments.length);
    console.log("Flats count:", flats.length);

    if (projects.length === 0 || bookingPayments.length === 0 || flats.length === 0) {
      console.log("Insufficient data for calculations");
      return;
    }

    const calculatedData: RevenueRecognitionData[] = [];

    // Group booking payments by customer/flat to get total amount received per flat
    const flatPaymentSummary = bookingPayments.reduce((acc: any, payment: any) => {
      const key = `${payment.customerId}_${payment.flatNumber}`;
      if (!acc[key]) {
        acc[key] = {
          customerId: payment.customerId,
          customerName: payment.customerName,
          projectName: payment.projectName,
          wingName: payment.wingName,
          flatNumber: payment.flatNumber,
          agreementValue: payment.agreementValue,
          totalAmountReceived: 0,
          payments: []
        };
      }
      acc[key].totalAmountReceived += payment.amountPaid;
      acc[key].payments.push(payment);
      return acc;
    }, {});

    console.log("Flat payment summary:", flatPaymentSummary);

    // Process each flat with payments
    Object.values(flatPaymentSummary).forEach((flatPayment: any) => {
      // Find the corresponding flat data to get carpet area
      const flat = flats.find(f => 
        f.flatNumber === flatPayment.flatNumber && 
        f.projectName === flatPayment.projectName
      );
      
      if (!flat) {
        console.log(`Flat not found for ${flatPayment.flatNumber} in ${flatPayment.projectName}`);
        return;
      }

      // Find the corresponding project data to get costs and total area
      const project = projects.find(p => 
        p.projectName === flatPayment.projectName
      );
      
      if (!project) {
        console.log(`Project not found: ${flatPayment.projectName}`);
        return;
      }

      console.log(`Processing flat ${flat.flatNumber} in project ${project.projectName}`);
      console.log(`Project total area: ${project.totalArea}`);
      console.log(`Flat carpet area: ${flat.carpetArea}`);

      if (!project.totalArea || project.totalArea === 0) {
        console.log(`Invalid total area for project ${project.projectName}`);
        return;
      }

      // Check if eligible for revenue recognition (≥10% of agreement value)
      const eligibleForRevenue = flatPayment.totalAmountReceived >= (flatPayment.agreementValue * 0.1);

      // Calculate ESTIMATED costs per flat
      // X = Estimated Land Cost per Flat = (Project Estimated Land Cost / Total Construction Area) × Carpet Area
      const estimatedLandCostPerSqMtr = (project.estimatedLandCost || 0) / project.totalArea;
      const estimatedLandCost = estimatedLandCostPerSqMtr * flat.carpetArea;
      
      // Y = Estimated Construction Cost per Flat = (Project Estimated Construction Cost / Total Construction Area) × Carpet Area  
      const estimatedConstructionCostPerSqMtr = (project.estimatedConstructionCost || 0) / project.totalArea;
      const estimatedConstructionCost = estimatedConstructionCostPerSqMtr * flat.carpetArea;
      
      // Estimated Flat Cost = X + Y
      const estimatedFlatCost = estimatedLandCost + estimatedConstructionCost;

      // Calculate ACTUAL costs per flat
      // M = Actual Land Cost per Flat = (Project Actual Land Cost / Total Construction Area) × Carpet Area
      const actualLandCostPerSqMtr = (project.actualLandCost || 0) / project.totalArea;
      const actualLandCost = actualLandCostPerSqMtr * flat.carpetArea;
      
      // N = Actual Construction Cost per Flat = (Project Actual Construction Cost / Total Construction Area) × Carpet Area
      const actualConstructionCostPerSqMtr = (project.actualConstructionCost || 0) / project.totalArea;
      const actualConstructionCost = actualConstructionCostPerSqMtr * flat.carpetArea;
      
      // Actual Flat Cost = M + N
      const actualFlatCost = actualLandCost + actualConstructionCost;

      // Calculate recognized revenue or work in progress
      let recognizedRevenue = 0;
      let workInProgress = 0;
      let remarks = "";

      if (eligibleForRevenue && estimatedFlatCost > 0) {
        // Revenue Recognition = (Actual Flat Cost ÷ Estimated Flat Cost) × Agreement Value
        // Revenue Recognition = (M+N) ÷ (X+Y) × Agreement Value
        recognizedRevenue = (actualFlatCost / estimatedFlatCost) * flatPayment.agreementValue;
        remarks = `Revenue recognized - Amount received (₹${flatPayment.totalAmountReceived.toLocaleString()}) ≥ 10% of Agreement Value (₹${(flatPayment.agreementValue * 0.1).toLocaleString()})`;
      } else {
        // Work in Progress = Entire Actual Flat Cost (M + N)
        workInProgress = actualFlatCost;
        remarks = eligibleForRevenue ? 
          "Work in Progress - Estimated cost calculation error" : 
          `Work in Progress - Amount received (₹${flatPayment.totalAmountReceived.toLocaleString()}) < 10% of Agreement Value (₹${(flatPayment.agreementValue * 0.1).toLocaleString()})`;
      }

      console.log(`Calculated data for ${flat.flatNumber}:`, {
        estimatedFlatCost,
        actualFlatCost,
        recognizedRevenue,
        workInProgress
      });

      calculatedData.push({
        flatId: flat.id,
        flatNumber: flat.flatNumber,
        projectName: flatPayment.projectName,
        companyName: flat.companyName,
        wingName: flatPayment.wingName,
        carpetArea: flat.carpetArea,
        agreementValue: flatPayment.agreementValue,
        totalAmountReceived: flatPayment.totalAmountReceived,
        eligibleForRevenue,
        estimatedLandCost,
        estimatedConstructionCost,
        estimatedFlatCost,
        actualLandCost,
        actualConstructionCost,
        actualFlatCost,
        recognizedRevenue,
        workInProgress,
        remarks
      });
    });

    console.log("Final calculated data:", calculatedData);
    setRevenueData(calculatedData);
    setFilteredData(calculatedData);
  }, [projects, bookingPayments, flats]);

  // Apply filters
  useEffect(() => {
    let filtered = [...revenueData];

    if (selectedProject && selectedProject !== "ALL") {
      filtered = filtered.filter(item => item.projectName === selectedProject);
    }

    if (selectedFlat && selectedFlat !== "ALL") {
      filtered = filtered.filter(item => item.flatNumber === selectedFlat);
    }

    if (dateFrom || dateTo) {
      const relevantPayments = bookingPayments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        const fromDate = dateFrom ? new Date(dateFrom) : new Date('1900-01-01');
        const toDate = dateTo ? new Date(dateTo) : new Date('2100-12-31');
        return paymentDate >= fromDate && paymentDate <= toDate;
      });

      const eligibleFlatNumbers = [...new Set(relevantPayments.map(p => p.flatNumber))];
      filtered = filtered.filter(item => 
        eligibleFlatNumbers.includes(item.flatNumber) || 
        (!dateFrom && !dateTo)
      );
    }

    setFilteredData(filtered);
  }, [revenueData, selectedProject, selectedFlat, dateFrom, dateTo, bookingPayments]);

  const clearFilters = () => {
    setSelectedProject("ALL");
    setSelectedFlat("ALL");
    setDateFrom("");
    setDateTo("");
  };

  const exportToExcel = () => {
    const csvContent = [
      // Header
      [
        "Company", "Project", "Wing", "Flat Number", "Carpet Area (Sq.m)", 
        "Agreement Value", "Amount Received", "Eligible for Revenue", 
        "Estimated Land Cost (X)", "Estimated Construction Cost (Y)", "Estimated Flat Cost (X+Y)",
        "Actual Land Cost (M)", "Actual Construction Cost (N)", "Actual Flat Cost (M+N)",
        "Recognized Revenue", "Work in Progress", "Remarks"
      ].join(","),
      // Data rows
      ...filteredData.map(row => [
        row.companyName,
        row.projectName,
        row.wingName,
        row.flatNumber,
        row.carpetArea,
        row.agreementValue,
        row.totalAmountReceived,
        row.eligibleForRevenue ? "Yes" : "No",
        row.estimatedLandCost.toFixed(2),
        row.estimatedConstructionCost.toFixed(2),
        row.estimatedFlatCost.toFixed(2),
        row.actualLandCost.toFixed(2),
        row.actualConstructionCost.toFixed(2),
        row.actualFlatCost.toFixed(2),
        row.recognizedRevenue.toFixed(2),
        row.workInProgress.toFixed(2),
        `"${row.remarks}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Revenue_Recognition_Report_${reportingDate || new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Revenue Recognition report exported to CSV"
    });
  };

  // Calculate summary totals
  const summary = filteredData.reduce((acc, item) => {
    acc.totalAgreementValue += item.agreementValue;
    acc.totalAmountReceived += item.totalAmountReceived;
    acc.totalRecognizedRevenue += item.recognizedRevenue;
    acc.totalWorkInProgress += item.workInProgress;
    acc.eligibleFlats += item.eligibleForRevenue ? 1 : 0;
    return acc;
  }, {
    totalAgreementValue: 0,
    totalAmountReceived: 0,
    totalRecognizedRevenue: 0,
    totalWorkInProgress: 0,
    eligibleFlats: 0
  });

  const uniqueProjects = [...new Set(revenueData.map(item => item.projectName))];
  const uniqueFlats = [...new Set(revenueData.map(item => item.flatNumber))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Recognition & Work-in-Progress Report
          </CardTitle>
          <CardDescription>
            Revenue recognition based on 10% payment criteria and flat cost calculations using data from Projects, Flats, and Booking Entry modules
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Data Source Info */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-600">
            <h4 className="font-medium text-gray-900 mb-2">Data Sources:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Projects:</strong> Estimated/Actual Land & Construction Costs, Total Construction Area - {projects.length} projects loaded</li>
              <li><strong>Flats:</strong> Carpet Area of each flat - {flats.length} flats loaded</li>
              <li><strong>Booking Entry:</strong> Agreement Value, Amount Received - {bookingPayments.length} payments loaded</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Label htmlFor="project-filter">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Projects</SelectItem>
                  {uniqueProjects.map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="flat-filter">Flat Number</Label>
              <Select value={selectedFlat} onValueChange={setSelectedFlat}>
                <SelectTrigger>
                  <SelectValue placeholder="All Flats" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Flats</SelectItem>
                  {uniqueFlats.map(flat => (
                    <SelectItem key={flat} value={flat}>{flat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-from">Payment Date From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="date-to">Payment Date To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
              <Button onClick={exportToExcel} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">₹{summary.totalAgreementValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Agreement Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">₹{summary.totalAmountReceived.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Amount Received</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">₹{summary.totalRecognizedRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Recognized Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">₹{summary.totalWorkInProgress.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Work in Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Recognition Details</CardTitle>
          <CardDescription>
            Showing {filteredData.length} flats | {summary.eligibleFlats} eligible for revenue recognition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flat Details</TableHead>
                  <TableHead>Agreement Value</TableHead>
                  <TableHead>Amount Received</TableHead>
                  <TableHead>Eligible (≥10%)</TableHead>
                  <TableHead>Estimated Cost (X+Y)</TableHead>
                  <TableHead>Actual Cost (M+N)</TableHead>
                  <TableHead>Recognized Revenue</TableHead>
                  <TableHead>Work in Progress</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{item.companyName}</div>
                        <div className="text-sm text-gray-600">{item.projectName} - {item.wingName}</div>
                        <div className="text-sm font-medium text-blue-600">{item.flatNumber}</div>
                        <div className="text-xs text-gray-500">{item.carpetArea} Sq.m</div>
                      </div>
                    </TableCell>
                    <TableCell>₹{item.agreementValue.toLocaleString()}</TableCell>
                    <TableCell>
                      <div>₹{item.totalAmountReceived.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        {((item.totalAmountReceived / item.agreementValue) * 100).toFixed(1)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.eligibleForRevenue 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.eligibleForRevenue ? 'Yes' : 'No'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">₹{item.estimatedFlatCost.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          X: ₹{item.estimatedLandCost.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Y: ₹{item.estimatedConstructionCost.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">₹{item.actualFlatCost.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          M: ₹{item.actualLandCost.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          N: ₹{item.actualConstructionCost.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-green-600 font-medium">
                        {item.recognizedRevenue > 0 ? `₹${item.recognizedRevenue.toLocaleString()}` : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-orange-600 font-medium">
                        {item.workInProgress > 0 ? `₹${item.workInProgress.toLocaleString()}` : '-'}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-xs text-gray-600 break-words">
                        {item.remarks}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <h3 className="font-medium text-lg mb-4">No revenue recognition data available</h3>
              <div className="text-left inline-block">
                <p className="mb-2">Please ensure you have completed the following steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li><strong>Projects Menu:</strong> Created projects with Estimated & Actual Land Cost, Estimated & Actual Construction Cost, and Total Construction Area</li>
                  <li><strong>Flats Menu:</strong> Registered flats with Carpet Area linked to projects</li>
                  <li><strong>Booking Entry Menu:</strong> Made booking payments with Agreement Values and Amount Received</li>
                </ol>
                <p className="mt-3 text-xs text-gray-400">
                  Current data: {projects.length} projects, {flats.length} flats, {bookingPayments.length} payments
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Logic Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Logic Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900">Data Sources:</h4>
              <div className="text-gray-600 ml-4">
                <p>• <strong>Project Menu:</strong> Estimated Land Cost, Estimated Construction Cost, Actual Land Cost, Actual Construction Cost, Total Construction Area</p>
                <p>• <strong>Flats Menu:</strong> Carpet Area of Booked Flat</p>
                <p>• <strong>Booking Entry Menu:</strong> Agreement Value, Amount Received</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Revenue Recognition Criteria:</h4>
              <p className="text-gray-600">Amount received (from Booking Entry) ≥ 10% of Agreement Value</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Estimated Flat Cost Calculation:</h4>
              <div className="text-gray-600 ml-4">
                <p>X = (Project Estimated Land Cost ÷ Total Construction Area) × Carpet Area</p>
                <p>Y = (Project Estimated Construction Cost ÷ Total Construction Area) × Carpet Area</p>
                <p><strong>Estimated Flat Cost = X + Y</strong></p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Actual Flat Cost Calculation:</h4>
              <div className="text-gray-600 ml-4">
                <p>M = (Project Actual Land Cost ÷ Total Construction Area) × Carpet Area</p>
                <p>N = (Project Actual Construction Cost ÷ Total Construction Area) × Carpet Area</p>
                <p><strong>Actual Flat Cost = M + N</strong></p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Revenue Recognition Formula:</h4>
              <p className="text-gray-600"><strong>Revenue Recognition = (M + N) ÷ (X + Y) × Agreement Value</strong></p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Work-in-Progress:</h4>
              <p className="text-gray-600">When revenue recognition criteria not met, entire Actual Flat Cost (M + N) is shown as Work-in-Progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueRecognitionReport;
