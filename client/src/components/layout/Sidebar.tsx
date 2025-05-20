import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Gavel, 
  UserSearch, 
  FileText, 
  Building, 
  Settings, 
  User, 
  Book
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  currentPath: string;
}

function SidebarLink({ href, icon, children, currentPath }: SidebarLinkProps) {
  const [_, setLocation] = useLocation();
  const isActive = currentPath === href;

  return (
    <a 
      href={href}
      onClick={(e) => {
        e.preventDefault();
        setLocation(href);
      }}
      className={cn(
        "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
        isActive 
          ? "bg-primary-50 text-primary" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      {icon}
      {children}
    </a>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const userRole = user?.role || 'guest';

  return (
    <aside className={cn("hidden md:flex md:flex-shrink-0", className)}>
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto custom-scrollbar">
          {isAuthenticated && (
            <div className="px-4 mb-4">
              <div className="bg-primary-50 rounded-md py-2 px-3 text-sm">
                <span className="font-medium text-primary-700">
                  Role: <span className="capitalize">{userRole}</span>
                </span>
              </div>
            </div>
          )}
          
          <nav className="mt-2 flex-1 px-2 bg-white space-y-1">
            {/* Dashboard - available to all */}
            <SidebarLink 
              href="/"
              icon={<LayoutDashboard className="mr-3 h-5 w-5 text-gray-500" />}
              currentPath={location === "/" || location === "/dashboard" ? "/dashboard" : location}
            >
              Dashboard
            </SidebarLink>
            
            {/* User Management Section (Admin, Officer) */}
            {isAuthenticated && (userRole === 'admin' || userRole === 'officer') && (
              <div className="pt-2">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User Management
                </h3>
                <div className="space-y-1 mt-1">
                  <SidebarLink 
                    href="/users"
                    icon={<Users className="mr-3 h-5 w-5 text-gray-500" />}
                    currentPath={location}
                  >
                    Users
                  </SidebarLink>
                  <SidebarLink 
                    href="/officers"
                    icon={<UserCheck className="mr-3 h-5 w-5 text-gray-500" />}
                    currentPath={location}
                  >
                    Officers
                  </SidebarLink>
                </div>
              </div>
            )}
            
            {/* Case Management - available to all */}
            <div className="pt-2">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Case Management
              </h3>
              <div className="space-y-1 mt-1">
                <SidebarLink 
                  href="/crimes"
                  icon={<Gavel className="mr-3 h-5 w-5 text-gray-500" />}
                  currentPath={location}
                >
                  Crimes
                </SidebarLink>
                <SidebarLink 
                  href="/criminals"
                  icon={<UserSearch className="mr-3 h-5 w-5 text-gray-500" />}
                  currentPath={location}
                >
                  Criminals
                </SidebarLink>
                <SidebarLink 
                  href="/fir"
                  icon={<FileText className="mr-3 h-5 w-5 text-gray-500" />}
                  currentPath={location}
                >
                  FIR Details
                </SidebarLink>
              </div>
            </div>
            
            {/* Admin Section */}
            {isAuthenticated && userRole === 'admin' && (
              <div className="pt-2">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administration
                </h3>
                <div className="space-y-1 mt-1">
                  <SidebarLink 
                    href="/police-stations"
                    icon={<Building className="mr-3 h-5 w-5 text-gray-500" />}
                    currentPath={location}
                  >
                    Police Stations
                  </SidebarLink>
                  <SidebarLink 
                    href="/system-settings"
                    icon={<Settings className="mr-3 h-5 w-5 text-gray-500" />}
                    currentPath={location}
                  >
                    System Settings
                  </SidebarLink>
                </div>
              </div>
            )}
            
            {/* User Profile Section - available if logged in */}
            {isAuthenticated && (
              <div className="pt-2">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  My Account
                </h3>
                <div className="space-y-1 mt-1">
                  <SidebarLink 
                    href="/profile"
                    icon={<User className="mr-3 h-5 w-5 text-gray-500" />}
                    currentPath={location}
                  >
                    Profile
                  </SidebarLink>
                  <SidebarLink 
                    href="/my-reports"
                    icon={<Book className="mr-3 h-5 w-5 text-gray-500" />}
                    currentPath={location}
                  >
                    My Reports
                  </SidebarLink>
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </aside>
  );
}
