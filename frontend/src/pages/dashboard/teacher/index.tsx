import React, { useState } from "react";
import ChatPage from "@/features/chat/ChatPage";
import TimetablePanel from "@/features/timetable/TimetablePanel";

type TabKey = "timetable" | "chat" | "announcements" | "settings" | "help";

export default function TeacherDashboard() {
  const [tab, setTab] = useState<TabKey>("timetable");

  return (
    <div className="w-full flex flex-col">
      {tab === "timetable" ? (
        <TimetablePanel role="teacher" />
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
