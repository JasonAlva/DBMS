import ChatPage from "@/features/chat/ChatPage";
import TimetablePanel from "@/features/timetable/TimetablePanel";
import { useState } from "react";

type TabKey = "timetable" | "chat" | "announcements" | "settings" | "help";

export default function AdminDashboard() {
  const [tab, setTab] = useState<TabKey>("timetable");

  return (
    <div className="w-full flex flex-col">
      {tab === "timetable" ? (
        <TimetablePanel role="admin" />
      ) : tab === "chat" ? (
        <ChatPage />
      ) : (
        <div className="p-6 text-gray-500">
          No content yet for this section.
        </div>
      )}
    </div>
  );
}
