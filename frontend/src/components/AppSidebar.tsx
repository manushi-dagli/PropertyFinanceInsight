
import { Building2, FileText, Home, Users, IndianRupee, Ban, TrendingUp, MapPin, DoorOpen, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'company', label: 'Company Master', icon: Building2 },
  { id: 'project', label: 'Project Master', icon: MapPin },
  { id: 'wings', label: 'Wing Master', icon: Home },
  { id: 'flats', label: 'Flat Master', icon: DoorOpen },
  { id: 'customers', label: 'Customer Master', icon: Users },
  { id: 'booking', label: 'Booking Entry', icon: IndianRupee },
  { id: 'cancellation', label: 'Cancellation Entry', icon: Ban },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export function AppSidebar({ activeTab, setActiveTab }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <SidebarTrigger />
          <span className="font-semibold text-sidebar-foreground">Real Estate CRM</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
