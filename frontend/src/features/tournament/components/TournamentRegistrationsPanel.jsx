import React from "react";

export default function TournamentRegistrationsPanel({
  isOpen,
  registrations,
  loading,
  error,
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

              <div className="text-xs text-gray-600">
                Jelentkezés ideje: {formatDateTime(createdAt)}
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