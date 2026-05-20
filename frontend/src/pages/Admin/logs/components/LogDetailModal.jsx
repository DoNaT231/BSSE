import React from "react";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("hu-HU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
}

export default function LogDetailModal({ open, title, data, onClose, footer = null }) {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold text-[#2c3e50]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
          >
            Bezárás
          </button>
        </div>

        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-sm">
          <div>
            <div className="text-xs font-semibold uppercase text-gray-500">Idő</div>
            <div>{formatDate(data.createdAt)}</div>
          </div>

          {data.message && (
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">Üzenet</div>
              <div className="whitespace-pre-wrap break-words">{data.message}</div>
            </div>
          )}

          {Array.isArray(data.metadata?.debugHints) &&
            data.metadata.debugHints.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase text-gray-500">
                  Debug tippek
                </div>
                <ul className="p-3 space-y-1 text-sm list-disc list-inside border rounded-lg bg-amber-50 border-amber-200 text-amber-950">
                  {data.metadata.debugHints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}

          {data.stackTrace && (
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">Stack trace</div>
              <pre className="p-3 overflow-x-auto text-xs bg-gray-50 border rounded-lg">
                {data.stackTrace}
              </pre>
            </div>
          )}

          {data.metadata && (
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">Metadata</div>
              <pre className="p-3 overflow-x-auto text-xs bg-gray-50 border rounded-lg">
                {JSON.stringify(data.metadata, null, 2)}
              </pre>
            </div>
          )}

          {data.requestBody && (
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">Request body</div>
              <pre className="p-3 overflow-x-auto text-xs bg-gray-50 border rounded-lg">
                {JSON.stringify(data.requestBody, null, 2)}
              </pre>
            </div>
          )}

          {data.requestQuery && (
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">Query</div>
              <pre className="p-3 overflow-x-auto text-xs bg-gray-50 border rounded-lg">
                {JSON.stringify(data.requestQuery, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {footer && <div className="px-5 py-4 border-t">{footer}</div>}
      </div>
    </div>
  );
}

export { formatDate };
