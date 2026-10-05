"use client";
import { ProtectedPage } from "@/components/ProtectedPage";

export default function MessagesPage() {
  return (
    <ProtectedPage titleKey="Messages">
      <div className="content-card">
        <div className="content-heading">Messages</div>
        <p>No messages yet.</p>
      </div>
    </ProtectedPage>
  );
}
