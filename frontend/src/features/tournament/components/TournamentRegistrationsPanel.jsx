// +------------------------------------------------------------------+
// |                TournamentRegistrationsPanel.jsx                   |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * TournamentRegistrationsPanel.jsx - Jelentkezők listázása
 * =====================================================================
 *
 * Funkcio:
 * - Versenyjelentkezők listázása és kezelése
 * - Státusz módosítása és fizetési állapot kezelése
 *
 * Felelosseg:
 * - Jelentkezők megjelenítése
 * - Számlázási adatok listázása
 * - Admin műveletek kezelése
 */

import React from "react";

export default function TournamentRegistrationsPanel({
  isOpen,
  registrations,
  loading,
  error,
  onStatusChange,
  statusUpdateLoadingId,
  onPaidChange,
  paidUpdateLoadingId,
}) {
  if (!isOpen) return null;

  function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("hu-HU");
  }

  return (
    <div className="p-4 mt-3 border bg-gray-50 rounded-2xl">
      {loading && <div className="text-sm text-gray-600">Betöltés...</div>}

      {error && (
        <div className="text-sm font-semibold text-red-600">{error}</div>
      )}

      {!loading && registrations.length === 0 && !error && (
        <div className="text-sm text-gray-600">
          Nincs nevezés erre a versenyre.
        </div>
      )}

      {!loading && registrations.length > 0 && (
        <div className="space-y-3">
          {registrations.map((r, index) => (
            <div key={r.id} className="p-3 bg-white border rounded-xl">
              {/*
                A backend különböző endpointjai camelCase/snake_case neveket is adhatnak.
                Mindkét formátumot támogatjuk, hogy biztosan látszódjanak az adatok.
              */}
              {(() => {
                const teamName = r.teamName ?? r.team_name ?? "";
                const telNumber = r.telNumber ?? r.tel_number ?? "";
                const contactEmail = r.contactEmail ?? r.contact_email ?? "";
                const userEmail = r.userEmail ?? r.user_email ?? "";
                const createdAt = r.createdAt ?? r.created_at ?? null;
                const players = Array.isArray(r.players) ? r.players : [];
                const status = String(
                  r.status ?? r.registration_status ?? "CONFIRMED"
                ).toUpperCase();
                const isUpdating = Number(statusUpdateLoadingId) === Number(r.id);
                const paid = Boolean(r.paid ?? r.registration_paid ?? false);
                const isPaidUpdating = Number(paidUpdateLoadingId) === Number(r.id);
                
                // Új számlázási mezők
                const billingName = r.billingName ?? r.billing_name ?? "";
                const companyName = r.companyName ?? r.company_name ?? "";
                const taxNumber = r.taxNumber ?? r.tax_number ?? "";
                const address = r.address ?? "";

                return (
                  <>
              <div className="text-sm font-semibold">
                {index + 1}. {teamName || "Névtelen csapat"}
              </div>

              <div className="mt-1 text-xs text-gray-600">
                Tel: {telNumber || "—"}
              </div>

              <div className="text-xs text-gray-600">
                Kapcsolati email: {contactEmail || "—"}
              </div>

              <div className="text-xs text-gray-600">
                Felhasználó email: {userEmail || "—"}
              </div>

              {/* Számlázási információk - mindig megjelenik */}
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs font-semibold text-blue-800 mb-1">
                  📄 Számlázási adatok:
                </div>
                <div className="text-xs text-gray-700">
                  Számlázási név: <span className="font-medium">{billingName || "—"}</span>
                </div>
                <div className="text-xs text-gray-700">
                  Cégnév: <span className="font-medium">{companyName || "—"}</span>
                </div>
                <div className="text-xs text-gray-700">
                  Adószám: <span className="font-medium">{taxNumber || "—"}</span>
                </div>
                <div className="text-xs text-gray-700">
                  Cím: <span className="font-medium">{address || "—"}</span>
                </div>
              </div>

              <div className="text-xs text-gray-600">
                Jelentkezés ideje: {formatDateTime(createdAt)}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">Státusz:</span>
                <select
                  value={status}
                  onChange={(e) => onStatusChange?.(r.id, e.target.value)}
                  disabled={isUpdating}
                  className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 disabled:opacity-60"
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="WAITLISTED">WAITLISTED</option>
                </select>
                {isUpdating && (
                  <span className="text-[11px] text-gray-500">Mentés...</span>
                )}
              </div>

              <div className="mt-2 flex items-center gap-3">
                <div className="text-xs font-semibold text-gray-700">Fizetve</div>

                <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={paid}
                    disabled={isPaidUpdating}
                    onChange={(e) => onPaidChange?.(r.id, e.target.checked)}
                    className="sr-only"
                  />

                  <div
                    className={`relative w-11 h-6 rounded-full border transition-colors ${
                      paid ? "bg-emerald-500 border-emerald-500" : "bg-gray-200 border-gray-200"
                    } ${isPaidUpdating ? "opacity-60" : ""}`}
                  >
                    <div
                      className={`absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        paid ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>

                  {isPaidUpdating && (
                    <span className="text-[11px] text-gray-500">Mentés...</span>
                  )}
                </label>
              </div>

              {players.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {players.map((p, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs border rounded-full bg-gray-50"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}