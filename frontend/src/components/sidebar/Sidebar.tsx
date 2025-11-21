import { useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Home,
  MessageSquare,
  FileText,
  Users,
  BarChart,
  PlusSquare,
  Edit3,
} from "lucide-react";

export type Role = "student" | "teacher" | "admin";

interface SidebarProps {
  role: Role;
  onSelect?: (key: string) => void;
}

export default function Sidebar({ role, onSelect }: SidebarProps) {
  const navigate = useNavigate();

  const common = [
    {
      to: "/dashboard",
      key: "dashboard",
      title: "Overview",
      icon: <Home className="w-5 h-5" />,
    },
    {
      to: "/dashboard/chat",
      key: "chat",
      title: "Chat",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      to: "/dashboard/timetable",
      key: "timetable",
      title: "Timetable",
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  const student = [
    {
      to: "/dashboard/my-queries",
      title: "My Queries",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      to: "/dashboard/submit",
      title: "Submit Query",
      icon: <PlusSquare className="w-5 h-5" />,
    },
  ];

  const teacher = [
    {
      to: "/dashboard/student-queries",
      title: "Student Queries",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      to: "/dashboard/respond",
      title: "Respond",
      icon: <Edit3 className="w-5 h-5" />,
    },
  ];

  const admin = [
    {
      to: "/dashboard/manage-users",
      title: "Manage Users",
      icon: <Users className="w-5 h-5" />,
    },
    {
      to: "/dashboard/reports",
      title: "Reports",
      icon: <BarChart className="w-5 h-5" />,
    },
  ];

  const roleItems =
    role === "student" ? student : role === "teacher" ? teacher : admin;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-6 py-5 border-b">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-sky-500 text-white w-9 h-9 flex items-center justify-center font-bold">
            CQ
          </div>
          <div>
            <div className="text-sm font-semibold">College Query</div>
            <div className="text-xs text-muted-foreground">{role}</div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="px-4 py-4 space-y-1">
          {common.map((c) =>
            onSelect ? (
              <div key={c.to}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-2"
                  onClick={() => onSelect?.(c.to)}
                >
                  {c.icon}
                  <span className="text-sm font-medium">{c.title}</span>
                </Button>
              </div>
            ) : (
              <SidebarItem key={c.to} to={c.to} title={c.title} icon={c.icon} />
            )
          )}

          <Separator className="my-2" />

          {roleItems.map((c) =>
            onSelect ? (
              <div key={c.to}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-2"
                  onClick={() => onSelect?.(c.to)}
                >
                  {c.icon}
                  <span className="text-sm font-medium">{c.title}</span>
                </Button>
              </div>
            ) : (
              <SidebarItem key={c.to} to={c.to} title={c.title} icon={c.icon} />
            )
          )}
        </nav>
      </ScrollArea>

      <div className="px-4 py-3 border-t">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center text-white">
            U
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{user?.name || "User"}</div>
            <div className="text-xs text-muted-foreground">
              {user?.role || role}
            </div>
          </div>
          <div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
