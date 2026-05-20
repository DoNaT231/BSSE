import React from "react";
import useAdminLogs from "./hooks/useAdminLogs";
import ActivityLogTable from "./components/ActivityLogTable";
import ErrorLogTable from "./components/ErrorLogTable";
import { formatDate } from "./components/LogDetailModal";

function SummaryCard({ label, value, tone = "default" }) {
  const toneClass =
    tone === "danger"
      ? "text-red-700"
      : tone === "success"
        ? "text-green-700"
        : "text-[#2c3e50]";

  return (
    <div className="p-4 bg-white border rounded-xl">
      <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
        {label}
      </div>
      <div className={`mt-2 text-3xl font-bold ${toneClass}`}>{value ?? 0}</div>
    </div>
  );
}

export default function LogsSection() {
  const {
    tab,
    setTab,
    summary,
    activity,
    errors,
    loading,
    error,
    activityFilters,
    setActivityFilters,
    errorFilters,
    setErrorFilters,
    markErrorResolved,
  } = useAdminLogs();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          { id: "summary", label: "Összefoglaló" },
          { id: "activity", label: "Események" },
          { id: "errors", label: "Hibák" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg border ${
              tab === item.id
                ? "bg-[#2c3e50] text-white border-[#2c3e50]"
                : "bg-white text-[#2c3e50] hover:bg-gray-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-sm text-gray-600">Betöltés...</div>
      )}

      {tab === "summary" && summary && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              label="Sikeres foglalások (ma)"
              value={summary.today.bookingSyncSuccess}
              tone="success"
            />
            <SummaryCard
              label="Elutasított sync (ma)"
              value={summary.today.bookingSyncRejected}
            />
            <SummaryCard
              label="Sikeres nevezések (ma)"
              value={summary.today.tournamentRegisterSuccess}
              tone="success"
            />
            <SummaryCard
              label="Elutasított nevezések (ma)"
              value={summary.today.tournamentRegisterRejected}
            />
            <SummaryCard
              label="Nyitott hibák (ma)"
              value={summary.today.unresolvedErrors}
              tone="danger"
            />
          </div>

          {summary.topRejections?.length > 0 && (
            <div className="p-4 bg-white border rounded-xl">
              <h4 className="font-semibold text-[#2c3e50]">Gyakori elutasítások (ma)</h4>
              <ul className="mt-3 space-y-2 text-sm">
                {summary.topRejections.map((item) => (
                  <li key={item.message} className="flex justify-between gap-3">
                    <span className="break-words">{item.message}</span>
                    <span className="font-semibold shrink-0">{item.count}x</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.recentErrors?.length > 0 && (
            <div className="p-4 bg-white border rounded-xl">
              <h4 className="font-semibold text-[#2c3e50]">Legutóbbi nyitott hibák</h4>
              <ul className="mt-3 space-y-2 text-sm">
                {summary.recentErrors.map((item) => (
                  <li key={item.id} className="border-t pt-2 first:border-t-0 first:pt-0">
                    <div className="text-xs text-gray-500">{formatDate(item.createdAt)}</div>
                    <div className="break-words">{item.message}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === "activity" && (
        <ActivityLogTable
          items={activity.items}
          total={activity.total}
          page={activity.page}
          filters={activityFilters}
          onFiltersChange={setActivityFilters}
          onPageChange={(page) => setActivityFilters((prev) => ({ ...prev, page }))}
        />
      )}

      {tab === "errors" && (
        <ErrorLogTable
          items={errors.items}
          total={errors.total}
          page={errors.page}
          filters={errorFilters}
          onFiltersChange={setErrorFilters}
          onPageChange={(page) => setErrorFilters((prev) => ({ ...prev, page }))}
          onResolve={markErrorResolved}
        />
      )}
    </div>
  );
}
