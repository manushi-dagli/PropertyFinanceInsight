
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import ReportingDate from "./ReportingDate";

const Dashboard = () => {
  const [reportingDate, setReportingDate] = useState<string>('');

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    setReportingDate(formattedDate);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Real Estate Accounting Dashboard
          </CardTitle>
          <CardDescription>
            <ReportingDate reportingDate={reportingDate} setReportingDate={setReportingDate} />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Welcome to your Real Estate CRM system. Use the sidebar to navigate between different modules.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
