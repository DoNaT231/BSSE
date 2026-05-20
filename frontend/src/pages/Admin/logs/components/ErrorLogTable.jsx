import React, { useState } from "react";
import LogDetailModal, { formatDate } from "./LogDetailModal";
import { fetchErrorLogById } from "../api/adminLogsApi";

export default function ErrorLogTable({
  items,
  total,
  page,
  filters,
  onFiltersChange,
  onPageChange,
  onResolve,
}) {
  const [selected, setSelected] = useState(null);
  const [resolveNote, setResolveNote] = useState("");
  const [resolving, setResolving] = useState(false);

  async function openDetails(id) {
    const data = await fetchErrorLogById(id);
    setSelected(data);
    setResolveNote(data.resolvedNote || "");
  }

  async function handleResolve() {
    if (!selected?.id) return;
    setResolving(true);
    try {
      await onResolve(selected.id, resolveNote);
      setSelected(null);
    } finally {
      setResolving(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filters.category}
          onChange={(e) =>
            onFiltersChange({ ...filters, category: e.target.value, page: 1 })
          }
          className="px-3 py-2 text-sm border rounded-lg"
        >
          <option value="">Minden kategória</option>
          <option value="booking">Foglalás</option>
          <option value="tournament">Verseny</option>
          <option value="admin">Admin</option>
          <option value="system">Rendszer</option>
        </select>

        <select
          value={filters.resolved}
          onChange={(e) =>
            onFiltersChange({ ...filters, resolved: e.target.value, page: 1 })
          }
          className="px-3 py-2 text-sm border rounded-lg"
        >
          <option value="">Minden állapot</option>
          <option value="false">Nyitott</option>
          <option value="true">Megoldva</option>
        </select>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Idő</th>
              <th className="px-3 py-2">Súlyosság</th>
              <th className="px-3 py-2">Üzenet</th>
              <th className="px-3 py-2">API</th>
              <th className="px-3 py-2">Állapot</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  Nincs megjeleníthető hiba.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                  <td className="px-3 py-2">{item.severity}</td>
                  <td className="px-3 py-2 break-words max-w-xs">{item.message}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {item.httpMethod} {item.httpPath}
                  </td>
                  <td className="px-3 py-2">
                    {item.resolved ? (
                      <span className="text-green-700">Megoldva</span>
                    ) : (
                      <span className="text-red-700">Nyitott</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => openDetails(item.id)}
                      className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                    >
                      Részletek
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-sm">
        <span>Összesen: {total}</span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Előző
          </button>
          <span className="px-2 py-1">{page}. oldal</span>
          <button
            type="button"
            disabled={page * 50 >= total}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Következő
          </button>
        </div>
      </div>

      <LogDetailModal
        open={Boolean(selected)}
        title={`Hiba #${selected?.id ?? ""}`}
        data={selected}
        onClose={() => setSelected(null)}
        footer={
          selected && !selected.resolved ? (
            <div className="space-y-2">
              <textarea
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                placeholder="Megoldás jegyzete (opcionális)"
                className="w-full px-3 py-2 text-sm border rounded-lg min-h-[80px]"
              />
              <button
                type="button"
                disabled={resolving}
                onClick={handleResolve}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-60"
              >
                Megjelölés megoldottként
              </button>
            </div>
          ) : null
        }
      />
    </>
  );
}
