import React, { useState } from "react";
import LogDetailModal, { formatDate } from "./LogDetailModal";
import { fetchActivityLogById } from "../api/adminLogsApi";

export default function ActivityLogTable({
  items,
  total,
  page,
  filters,
  onFiltersChange,
  onPageChange,
}) {
  const [selected, setSelected] = useState(null);

  async function openDetails(id) {
    const data = await fetchActivityLogById(id);
    setSelected(data);
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

        <input
          type="text"
          placeholder="Esemény típus (pl. booking.sync.success)"
          value={filters.eventType}
          onChange={(e) =>
            onFiltersChange({ ...filters, eventType: e.target.value, page: 1 })
          }
          className="px-3 py-2 text-sm border rounded-lg min-w-[240px]"
        />
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Idő</th>
              <th className="px-3 py-2">Kategória</th>
              <th className="px-3 py-2">Esemény</th>
              <th className="px-3 py-2">Felhasználó</th>
              <th className="px-3 py-2">HTTP</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  Nincs megjeleníthető esemény.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                  <td className="px-3 py-2">{item.category}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{item.eventType}</div>
                    <div className="text-gray-600 break-words">{item.message}</div>
                  </td>
                  <td className="px-3 py-2">{item.userEmail || "—"}</td>
                  <td className="px-3 py-2">{item.httpStatus ?? "—"}</td>
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
        title={`Esemény #${selected?.id ?? ""}`}
        data={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
