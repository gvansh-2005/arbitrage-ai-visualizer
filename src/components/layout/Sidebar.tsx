
import React from "react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  FileUp,
  Home,
  PieChart,
  Settings,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  return (
    <aside
      className={cn(
        "h-full bg-sidebar border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-border">
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">Arbitrage AI</span>
        )}
        {collapsed && <span className="font-bold text-lg mx-auto">AI</span>}
      </div>

      <div className="flex-1 py-4 space-y-1">
        <NavItem to="/" label="Dashboard" icon={<Home size={20} />} collapsed={collapsed} />
        <NavItem
          to="/upload"
          label="Upload Dataset"
          icon={<FileUp size={20} />}
          collapsed={collapsed}
        />
        <NavItem
          to="/visualization"
          label="Visualizations"
          icon={<PieChart size={20} />}
          collapsed={collapsed}
        />
        <NavItem
          to="/analysis"
          label="Analysis"
          icon={<BarChart3 size={20} />}
          collapsed={collapsed}
        />
        <NavItem
          to="/settings"
          label="Settings"
          icon={<Settings size={20} />}
          collapsed={collapsed}
        />
      </div>

      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
        </Button>
      </div>
    </aside>
  );
};

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, collapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center px-4 py-2 text-sm rounded-md mx-2",
          "transition-colors duration-200",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
        )
      }
    >
      <span className="mr-3">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

export default Sidebar;
