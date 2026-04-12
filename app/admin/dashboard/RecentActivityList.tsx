"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

type ActivityLog = {
  id: number;
  action: string;
  details: string | null;
  createdAt: Date | null;
};

type RecentActivityListProps = Readonly<{
  logs: readonly ActivityLog[];
}>;

const DETAILS_PREVIEW_LIMIT = 50;

function getPreview(details: string) {
  if (details.length <= DETAILS_PREVIEW_LIMIT) {
    return details;
  }

  return `${details.slice(0, DETAILS_PREVIEW_LIMIT).trimEnd()}...`;
}

export default function RecentActivityList(props: RecentActivityListProps) {
  const { logs } = props;
  const [expandedLogIds, setExpandedLogIds] = useState<number[]>([]);

  const toggleExpanded = (logId: number) => {
    setExpandedLogIds((currentIds) =>
      currentIds.includes(logId)
        ? currentIds.filter((currentId) => currentId !== logId)
        : [...currentIds, logId],
    );
  };

  return (
    <ul className="divide-y divide-gray-50">
      {logs.map((log) => {
        const actionLabel = log.action.split("_").join(" ");
        const hasDetails = Boolean(log.details);
        const shouldClampDetails = Boolean(log.details && log.details.length > DETAILS_PREVIEW_LIMIT);
        const isExpanded = expandedLogIds.includes(log.id);

        return (
          <li key={log.id} className="flex items-start justify-between gap-4 px-6 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-700">{actionLabel}</p>
              {hasDetails && (
                <motion.div layout className="mt-0.5 overflow-hidden">
                  <AnimatePresence initial={false} mode="wait">
                    <motion.p
                      key={isExpanded ? `expanded-${log.id}` : `preview-${log.id}`}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="whitespace-pre-wrap text-xs leading-5 text-slate-500"
                      style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                    >
                      {shouldClampDetails && !isExpanded ? getPreview(log.details!) : log.details}
                    </motion.p>
                  </AnimatePresence>
                  {shouldClampDetails && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(log.id)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
                    >
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                      />
                      {isExpanded ? "Hide full message" : "View full message"}
                    </button>
                  )}
                </motion.div>
              )}
            </div>
            <span className="shrink-0 whitespace-nowrap text-xs text-slate-400">
              {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}