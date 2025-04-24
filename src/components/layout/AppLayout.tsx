
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/upload":
        return "Upload Dataset";
      case "/visualization":
        return "Visualizations";
      case "/analysis":
        return "Analysis";
      case "/settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <span>Multi-Agent Arbitrage</span>
              <ArrowRight size={14} />
              <span>{getPageTitle()}</span>
            </div>
            <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
            <Separator className="mt-4" />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
