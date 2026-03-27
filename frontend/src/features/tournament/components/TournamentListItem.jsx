import React, { useState } from "react";
import TournamentRegistrationsPanel from "./TournamentRegistrationsPanel";
import TournamentSlotModal from "./TournamentSlotModal";

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("hu-HU");
}

function formatSlotTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("hu-HU", { dateStyle: "short", timeStyle: "short" });
}

export default function TournamentListItem({
  tournament,
  courts = [],
  onEdit,
  onDelete,
  onToggleRegistrations,
  onAddSlot,
  onUpdateSlot,
  onDeleteSlot,
  slotActionLoading = false,
  isRegistrationsOpen,
  registrations,
  regsLoading,
  regsError,
}) {
  const [slotModal, setSlotModal] = useState(null);
  const [slotModalError, setSlotModalError] = useState("");

  const getCourtName = (courtId) => {
    const c = courts.find((x) => Number(x.id) === Number(courtId));
    return c?.name || `Pálya #${courtId}`;
  };

  const slots = Array.isArray(tournament.slots) ? tournament.slots : [];

  async function handleSlotSave(payload) {
    setSlotModalError("");
    try {
      if (slotModal?.mode === "add") {
        const targetCourtIds =
          Array.isArray(payload?.courtIds) && payload.courtIds.length > 0
            ? payload.courtIds
            : [payload?.courtId];

        for (const courtId of targetCourtIds) {
          if (!courtId) continue;
          await onAddSlot?.(tournament.id, {
            ...payload,
            courtId: Number(courtId),
          });
        }
      } else if (slotModal?.mode === "edit" && slotModal?.slot) {
        await onUpdateSlot?.(tournament.id, slotModal.slot.slotId, payload);
      }
      setSlotModal(null);
    } catch (error) {
      setSlotModalError(
        error?.message || "Nem sikerült menteni a slotot a backend hibája miatt."
      );
    }
  }

  async function handleSlotDelete(slot) {
    if (!window.confirm("Biztosan törlöd ezt az időpontot?")) return;
    await onDeleteSlot?.(tournament.id, slot.slotId);
    setSlotModal(null);
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 p-4 border rounded-2xl md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-semibold truncate">
              {tournament.title || `Verseny #${tournament.id}`}
            </div>

            {tournament.maxTeams != null && (
              <span className="px-2 py-1 text-xs text-gray-700 border rounded-full">
                max {tournament.maxTeams} csapat
              </span>
            )}

            {tournament.team_size != null && (
              <span className="px-2 py-1 text-xs text-gray-700 border rounded-full">
                csapatlétszám: {tournament.team_size}
              </span>
            )}

            {(tournament.entry_fee != null && tournament.entry_fee !== 0) && (
              <span className="px-2 py-1 text-xs text-gray-700 border rounded-full">
                nevezési díj: {Number(tournament.entry_fee).toLocaleString("hu-HU")} Ft
              </span>
            )}
          </div>

          <div className="mt-1 text-sm text-gray-700 line-clamp-2">
            {tournament.description || (
              <span className="text-gray-400">Nincs leírás.</span>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            {tournament.organizerName && (
              <span>Szervező: {tournament.organizerName}</span>
            )}
            {tournament.registrationDeadline && (
              <>
                {tournament.organizerName && " • "}
                Nevezési határidő: {formatDate(tournament.registrationDeadline)}
              </>
            )}
            {" • "}ID: {tournament.id}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onEdit(tournament)}
            className="px-3 py-2 text-sm border rounded-xl hover:bg-gray-50"
          >
            Szerkesztés
          </button>

          <button
            onClick={() => onDelete(tournament)}
            className="px-3 py-2 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50 hover:bg-red-100"
          >
            Törlés
          </button>

          <button
            onClick={() => onToggleRegistrations(tournament.id)}
            className="px-3 py-2 text-sm bg-gray-100 border rounded-xl hover:bg-gray-200"
          >
            Jelentkezők
          </button>
        </div>
      </div>

      <div className="mt-0 rounded-b-2xl border border-t-0 border-gray-200 bg-gray-50/80 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Időpontok (slots)</div>
          <button
            type="button"
            onClick={() => {
              setSlotModalError("");
              setSlotModal({ mode: "add" });
            }}
            disabled={slotActionLoading}
            className="text-sm px-2 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-60"
          >
            + Új slot
          </button>
        </div>
        {slots.length > 0 ? (
          <ul className="mt-2 space-y-1.5">
            {slots.map((slot) => (
              <li key={slot.slotId} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-700">
                <span className="font-medium">{getCourtName(slot.courtId)}</span>
                <span className="text-gray-500">
                  {formatSlotTime(slot.startTime)} – {formatSlotTime(slot.endTime)}
                </span>
                {slot.slotStatus && (
                  <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs">{slot.slotStatus}</span>
                )}
                <span className="ml-auto flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSlotModalError("");
                      setSlotModal({ mode: "edit", slot });
                    }}
                    disabled={slotActionLoading}
                    className="text-xs px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-60"
                  >
                    Szerk
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSlotDelete(slot)}
                    disabled={slotActionLoading}
                    className="text-xs px-2 py-1 text-red-700 border border-red-200 rounded hover:bg-red-50 disabled:opacity-60"
                  >
                    Törlés
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-500">Nincs még slot. Kattints az &quot;Új slot&quot; gombra.</p>
        )}
      </div>

      <TournamentSlotModal
        open={slotModal !== null}
        mode={slotModal?.mode ?? "add"}
        slot={slotModal?.mode === "edit" ? slotModal.slot : null}
        tournament={tournament}
        courts={courts}
        onSave={handleSlotSave}
        onClose={() => {
          setSlotModalError("");
          setSlotModal(null);
        }}
        saving={slotActionLoading}
        externalError={slotModalError}
      />

      <TournamentRegistrationsPanel
        isOpen={isRegistrationsOpen}
        registrations={registrations}
        loading={regsLoading}
        error={regsError}
      />
    </div>
  );
}