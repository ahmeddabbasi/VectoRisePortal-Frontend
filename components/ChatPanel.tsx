"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

export function ChatPanel({ eyebrow }: { eyebrow: string }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadConversations() {
    setConversations(await api.chatConversations());
  }

  useEffect(() => {
    Promise.all([api.chatConversations(), api.chatUsers()]).then(([convs, chatUsers]) => {
      setConversations(convs);
      setUsers(chatUsers);
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const refresh = () => {
      Promise.all([api.chatMessages(activeId), api.chatConversations()]).then(([msgs, convs]) => {
        setMessages(msgs);
        setConversations(convs);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      });
    };
    refresh();
    const interval = setInterval(() => {
      if (document.hidden) return;
      refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeId]);

  async function startChat(userId: number) {
    const res = await api.startDirectChat({ user_id: userId });
    await loadConversations();
    setActiveId(res.id);
  }

  async function send() {
    if (!activeId || !draft.trim()) return;
    setLoading(true);
    try {
      await api.sendChatMessage(activeId, draft.trim());
      setDraft("");
      setMessages(await api.chatMessages(activeId));
      await loadConversations();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } finally {
      setLoading(false);
    }
  }

  const active = conversations.find((c) => c.id === activeId);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} title="Internal Chat" description="Message teammates and admins in real time." />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="card flex max-h-[70vh] flex-col overflow-hidden">
          <div className="border-b border-ink/10 p-4">
            <p className="kpi-label mb-2">Start conversation</p>
            <select
              className="input w-full text-sm"
              defaultValue=""
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id) startChat(id);
                e.target.value = "";
              }}
            >
              <option value="">Select person...</option>
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`mb-1 w-full rounded-xl px-3 py-3 text-left text-sm transition ${activeId === c.id ? "bg-brand/10 text-brand" : "hover:bg-ink/5"}`}
              >
                <p className="font-medium">{c.title}</p>
                <p className="truncate text-xs text-muted-foreground">{c.last_message || "No messages yet"}</p>
                {c.unread_count ? <span className="mt-1 inline-block rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">{c.unread_count}</span> : null}
              </button>
            ))}
          </div>
        </div>
        <div className="card flex max-h-[70vh] flex-col overflow-hidden">
          {activeId ? (
            <>
              <div className="border-b border-ink/10 px-4 py-3 font-medium">{active?.title || "Conversation"}</div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.is_mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.is_mine ? "bg-brand text-white" : "bg-ink/5"}`}>
                      {!m.is_mine ? <p className="mb-1 text-[10px] font-medium opacity-70">{m.sender_name}</p> : null}
                      <p>{m.body}</p>
                      <p className={`mt-1 text-[10px] ${m.is_mine ? "text-white/70" : "text-muted-foreground"}`}>
                        {new Date(m.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="flex gap-2 border-t border-ink/10 p-4">
                <input
                  className="input flex-1"
                  placeholder="Type a message..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                />
                <button type="button" className="btn-primary" onClick={send} disabled={loading || !draft.trim()}>Send</button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">Select or start a conversation</div>
          )}
        </div>
      </div>
    </div>
  );
}
