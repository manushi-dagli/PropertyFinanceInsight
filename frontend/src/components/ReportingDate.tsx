
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface ReportingDateProps {
  reportingDate: string;
  setReportingDate: (date: string) => void;
}

const ReportingDate = ({ reportingDate, setReportingDate }: ReportingDateProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Set Reporting Date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="w-80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Reporting Date</CardTitle>
          <CardDescription className="text-xs">
            This is the trigger date for all reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="reporting-date" className="text-xs">Date</Label>
            <Input
              id="reporting-date"
              type="date"
              value={reportingDate}
              onChange={(e) => setReportingDate(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="h-7 text-xs">
              Save
            </Button>
            <Button 
              onClick={() => setIsEditing(false)} 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      onClick={() => setIsEditing(true)}
      variant="outline"
      className="flex items-center gap-2 h-9"
    >
      <Calendar className="h-4 w-4" />
      {formatDate(reportingDate)}
    </Button>
  );
};

export default ReportingDate;
