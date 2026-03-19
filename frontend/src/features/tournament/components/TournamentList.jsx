import React from "react";
import TournamentListItem from "./TournamentListItem";

export default function TournamentList({
  items,
  loading,
  courts = [],
  onEdit,
  onDelete,
  onToggleRegistrations,
  onAddSlot,
  onUpdateSlot,
  onDeleteSlot,
  slotActionLoading = false,
  openRegsId,
  registrations,
  regsLoading,
  regsError,
}) {
  return (
    <div className="mt-6">
      <h3 className="font-semibold">Összes verseny</h3>

      {loading ? (
        <div className="mt-3 text-sm text-gray-600">Betöltés...</div>
      ) : items.length === 0 ? (
        <div className="mt-3 text-sm text-gray-600">Nincs verseny.</div>
      ) : (
        <div className="mt-3 space-y-3">
          {items.map((tournament) => (
            <TournamentListItem
              key={tournament.id}
              tournament={tournament}
              courts={courts}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleRegistrations={onToggleRegistrations}
              onAddSlot={onAddSlot}
              onUpdateSlot={onUpdateSlot}
              onDeleteSlot={onDeleteSlot}
              slotActionLoading={slotActionLoading}
              isRegistrationsOpen={openRegsId === tournament.id}
              registrations={openRegsId === tournament.id ? registrations : []}
              regsLoading={openRegsId === tournament.id ? regsLoading : false}
              regsError={openRegsId === tournament.id ? regsError : ""}
            />
          ))}
        </div>
      )}
    </div>
  );
}