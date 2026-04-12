import { Activity } from "lucide-react";
import { getLogs } from "@/server/actions/adminLogs";
import RecentActivityList from "../RecentActivityList";

type SearchParams = Promise<{
  q?: string | string[];
  limit?: string | string[];
}>;

const LIMIT_OPTIONS = [10, 20, 50, 100] as const;

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSelectedLimit(rawLimit: string | undefined) {
  const parsedLimit = Number(rawLimit);

  if (LIMIT_OPTIONS.includes(parsedLimit as (typeof LIMIT_OPTIONS)[number])) {
    return parsedLimit;
  }

  return 20;
}

export default async function ActivityPage({
  searchParams,
}: Readonly<{
  searchParams: SearchParams;
}>) {
  const params = await searchParams;
  const query = getSingleValue(params.q)?.trim() ?? "";
  const selectedLimit = getSelectedLimit(getSingleValue(params.limit));
  const activityLogs = await getLogs({ limit: selectedLimit, query });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Activity</h1>
          <p className="admin-page-copy">
            Search the activity log and control how many entries are shown.
          </p>
        </div>
      </div>

      <div className="admin-panel admin-panel-body">
        <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_11rem_auto] md:items-end">
          <div>
            <label htmlFor="activity-search" className="admin-kicker mb-1.5 block">
              Search Logs
            </label>
            <input
              id="activity-search"
              name="q"
              defaultValue={query}
              placeholder="Search action, entity, or message"
              className="admin-field"
            />
          </div>

          <div>
            <label htmlFor="activity-limit" className="admin-kicker mb-1.5 block">
              Show Entries
            </label>
            <select
              id="activity-limit"
              name="limit"
              defaultValue={String(selectedLimit)}
              className="admin-select"
            >
              {LIMIT_OPTIONS.map((limitOption) => (
                <option key={limitOption} value={limitOption}>
                  {limitOption}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="admin-button-primary"
          >
            Apply
          </button>
        </form>
      </div>

      <div className="admin-panel overflow-hidden">
        <div className="admin-panel-header">
          <div className="flex items-center gap-2 min-w-0">
            <Activity size={16} className="shrink-0 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
          </div>
          <span className="whitespace-nowrap text-xs text-slate-400">
            Showing {activityLogs.length} of {selectedLimit}
          </span>
        </div>
        {activityLogs.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-400">
            {query ? "No activity matched your search." : "No activity yet."}
          </p>
        ) : (
          <RecentActivityList logs={activityLogs} />
        )}
      </div>
    </div>
  );
}