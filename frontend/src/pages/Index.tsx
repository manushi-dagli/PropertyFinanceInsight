
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import CompanyMaster from "@/components/CompanyMaster";
import ProjectMaster from "@/components/ProjectMaster";
import WingMaster from "@/components/WingMaster";
import FlatMaster from "@/components/FlatMaster";
import CustomerMaster from "@/components/CustomerMaster";
import BookingEntry from "@/components/BookingEntry";
import CancellationEntry from "@/components/CancellationEntry";
import ReportingDate from "@/components/ReportingDate";
import RevenueRecognitionReport from "@/components/RevenueRecognitionReport";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reportingDate, setReportingDate] = useState<string>("");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                Real Estate Accounting Dashboard
              </CardTitle>
              <CardDescription>
                Welcome to your Real Estate CRM system. Use the sidebar to navigate between different modules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Select a module from the sidebar to get started with managing your real estate business.
              </p>
            </CardContent>
          </Card>
        );
      case 'company':
        return <CompanyMaster />;
      case 'project':
        return <ProjectMaster reportingDate={reportingDate} />;
      case 'wings':
        return <WingMaster reportingDate={reportingDate} />;
      case 'flats':
        return <FlatMaster reportingDate={reportingDate} />;
      case 'customers':
        return <CustomerMaster reportingDate={reportingDate} />;
      case 'booking':
        return <BookingEntry reportingDate={reportingDate} />;
      case 'cancellation':
        return <CancellationEntry reportingDate={reportingDate} />;
      case 'reports':
        return <RevenueRecognitionReport reportingDate={reportingDate} />;
      default:
        return <CompanyMaster />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarInset>
          {/* Header */}
          <header className="bg-background border-b border-border">
            <div className="flex justify-between items-center h-16 px-6 relative">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-foreground">Real Estate Accounting</h1>
              </div>
              <ReportingDate reportingDate={reportingDate} setReportingDate={setReportingDate} />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {renderActiveComponent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
