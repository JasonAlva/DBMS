import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ChatPage from "@/features/chat/ChatPage";
import TimetablePanel from "@/features/timetable/TimetablePanel";

type TabKey = "timetable" | "chat" | "announcements" | "settings" | "help";

export default function StudentDashboard() {
  const [tab, setTab] = useState<TabKey>("timetable");

  return (
    <DashboardLayout role="student">
      <div className="w-full flex flex-col">
        {tab === "timetable" ? (
          <TimetablePanel role="student" />
        ) : tab === "chat" ? (
          <ChatPage />
        ) : (
          <div className="p-6 text-gray-500">
            No content yet for this section.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
