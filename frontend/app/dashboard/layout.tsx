"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  LogOut,
  BarChart3,
  Layers,
  Menu,
  X,
  User
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token && pathname !== "/dashboard/login") {
      router.push("/dashboard/login");
    } else if (token) {
      setIsAuthorized(true);
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/dashboard/login");
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Feedback", href: "/dashboard/feedback", icon: MessageSquare },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  if (pathname === "/dashboard/login") {
    return <>{children}</>;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/5 glass shadow-xl z-20">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Layers size={18} />
            </div>
            <span className="font-bold text-xl tracking-tighter">FeedPulse</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
              >
                <Icon size={20} className={isActive ? "text-primary" : "group-hover:translate-x-1 transition-transform"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5 space-y-4">
          <div className="px-4 py-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground">
              <User size={16} />
            </div>
            <div>
              <p className="text-sm font-medium truncate">{user?.email || "Admin"}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Platform Admin</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive transition-colors group cursor-pointer" onClick={handleLogout}>
            <LogOut size={20} className="mr-3 group-hover:-translate-x-1 transition-transform" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-in fade-in" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Mobile Navigation */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-card z-40 md:hidden transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Layers size={18} />
            </div>
            <span className="font-bold text-xl">FeedPulse</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-secondary">
            <X size={20} />
          </button>
        </div>
        <nav className="px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 flex items-center px-4 border-b border-white/5 glass z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/5 mr-2">
            <Menu size={24} />
          </button>
          <span className="font-bold">FeedPulse</span>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8 relative">
          {/* Subtle background glow for the dashboard area */}
          <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10 animate-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
