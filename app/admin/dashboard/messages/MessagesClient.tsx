"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAsRead, deleteMessage, replyToMessage } from "@/server/actions/adminMessages";
import {
  Mail,
  MailOpen,
  Trash2,
  Send,
  X,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Reply,
} from "lucide-react";

type Message = {
  id: number;
  name: string | null;
  email: string | null;
  message: string | null;
  read: boolean;
  replied: boolean;
  createdAt: Date | null;
};

export default function MessagesClient({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState<number | null>(null);

  const refresh = () => router.refresh();

  const handleExpand = (msg: Message) => {
    const next = expanded === msg.id ? null : msg.id;
    setExpanded(next);
    setReplyId(null);
    if (next && !msg.read) {
      startTransition(async () => {
        await markAsRead(msg.id);
        refresh();
      });
    }
  };

  const handleReply = (id: number) => {
    setReplyId(id);
    setReplyBody("");
    setError("");
  };

  const handleSendReply = (msg: Message) => {
    if (!replyBody.trim()) return;
    setError("");
    startTransition(async () => {
      try {
        await replyToMessage(msg.id, msg.email!, msg.name!, replyBody);
        setReplyId(null);
        setReplyBody("");
        setSuccessId(msg.id);
        setTimeout(() => setSuccessId(null), 3000);
        refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send reply");
      }
    });
  };

  const handleDelete = (id: number) => {
    startTransition(async () => {
      try {
        await deleteMessage(id);
        setDeleteId(null);
        if (expanded === id) setExpanded(null);
        refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to delete");
      }
    });
  };

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="admin-page max-w-5xl">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Messages</h1>
          <p className="admin-page-copy">
            {messages.length} total
            {unread > 0 && (
              <span className="admin-badge admin-badge-pink ml-2 align-middle">
                {unread} unread
              </span>
            )}
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-banner-error">
          {error}
        </div>
      )}

      {/* Message list */}
      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-16 text-center">
          <Mail size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => {
            const isExpanded = expanded === msg.id;
            const isReplying = replyId === msg.id;
            const isDeleting = deleteId === msg.id;
            const justReplied = successId === msg.id;

            return (
              <div
                key={msg.id}
                className={`admin-panel overflow-hidden transition-shadow ${
                  !msg.read
                    ? "border-pink-200 shadow-pink-100/60"
                    : ""
                }`}
              >
                {/* Row */}
                <div
                  className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70"
                  onClick={() => handleExpand(msg)}
                >
                  <div className={`shrink-0 ${!msg.read ? "text-pink-500" : "text-slate-300"}`}>
                    {!msg.read ? <Mail size={18} /> : <MailOpen size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`truncate text-sm ${!msg.read ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                        {msg.name ?? "Unknown"}
                      </p>
                      {!msg.read && (
                        <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                      )}
                      {msg.replied && (
                        <span className="admin-badge admin-badge-green shrink-0">
                          Replied
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-400">{msg.email}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden text-xs text-slate-400 sm:block">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : "—"}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 pb-5">
                    {/* Message text */}
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                      {msg.message}
                    </div>

                    {/* Success banner */}
                    {justReplied && (
                      <div className="admin-banner-success mt-3 flex items-center gap-2">
                        <Check size={15} /> Reply sent successfully.
                      </div>
                    )}

                    {/* Reply compose */}
                    {isReplying && (
                      <div className="mt-4 space-y-3">
                        <p className="admin-kicker text-[0.72rem] text-slate-500">
                          Reply to {msg.name} &lt;{msg.email}&gt;
                        </p>
                        <textarea
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          rows={5}
                          placeholder="Type your reply..."
                          className="admin-textarea"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setReplyId(null)}
                            className="admin-button-secondary"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendReply(msg)}
                            disabled={isPending || !replyBody.trim()}
                            className="admin-button-primary disabled:opacity-60"
                          >
                            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Send Reply
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action bar */}
                    {!isReplying && (
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => handleReply(msg.id)}
                          className="admin-badge admin-badge-purple"
                        >
                          <Reply size={13} /> Reply
                        </button>

                        {isDeleting ? (
                          <>
                            <button
                              onClick={() => handleDelete(msg.id)}
                              disabled={isPending}
                              className="admin-button-danger px-3 py-1.5 text-xs"
                            >
                              {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                              Confirm Delete
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="admin-button-secondary px-3 py-1.5 text-xs"
                            >
                              <X size={13} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteId(msg.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
