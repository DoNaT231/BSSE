import React from "react";
import useAdminTournaments from "../hooks/useAdminTournaments";
import useTournamentRegistrations from "../hooks/useTournamentRegistrations.js";

import TournamentCreateForm from "./TournamentCreateForm";
import TournamentDeleteModal from "./TournamentDeleteModal";
import TournamentEditModal from "./TournamentEditModal";
import TournamentList from "./TournamentList";

export default function TournamentsAdminSection() {
  const token = localStorage.getItem("token");

  const tournaments = useAdminTournaments(token);
  const registrations = useTournamentRegistrations(token);

  return (
    <section className="w-full p-4 bg-white shadow rounded-2xl md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold md:text-2xl">
            Versenyek (Admin)
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Itt tudsz versenyt létrehozni, szerkeszteni, és törölni.
          </p>
        </div>

        <button
          onClick={tournaments.loadAll}
          className="px-3 py-2 text-sm border shrink-0 rounded-xl hover:bg-gray-50"
          disabled={tournaments.loadingList}
          title="Lista frissítése"
        >
          {tournaments.loadingList ? "Frissítés..." : "Frissítés"}
        </button>
      </div>

      {tournaments.error ? (
        <div className="px-4 py-3 mt-4 text-sm text-red-800 border border-red-200 rounded-xl bg-red-50">
          {tournaments.error}
        </div>
      ) : null}

      <TournamentCreateForm
        createForm={tournaments.createForm}
        setCreateForm={tournaments.setCreateForm}
        slotForm={tournaments.slotForm}
        setSlotForm={tournaments.setSlotForm}
        slots={tournaments.slots}
        courts={tournaments.courts}
        creating={tournaments.creating}
        onAddSlot={tournaments.handleAddSlot}
        onRemoveSlot={tournaments.handleRemoveSlot}
        onSubmit={tournaments.handleCreate}
        onReset={tournaments.resetCreateForm}
      />

      <TournamentList
        items={tournaments.items}
        loading={tournaments.loadingList}
        courts={tournaments.courts}
        onEdit={tournaments.openEdit}
        onDelete={tournaments.openDeleteConfirm}
        onToggleRegistrations={registrations.toggleRegistrations}
        onAddSlot={tournaments.addSlotToTournament}
        onUpdateSlot={tournaments.updateSlot}
        onDeleteSlot={tournaments.deleteSlot}
        slotActionLoading={tournaments.slotActionLoading}
        openRegsId={registrations.openRegsId}
        registrations={registrations.registrations}
        regsLoading={registrations.regsLoading}
        regsError={registrations.regsError}
        onStatusChange={registrations.changeRegistrationStatus}
        statusUpdateLoadingId={registrations.statusUpdateLoadingId}
        onPaidChange={registrations.changeRegistrationPaid}
        paidUpdateLoadingId={registrations.paidUpdateLoadingId}
      />

      <TournamentDeleteModal
        tournament={tournaments.deleteConfirming}
        onClose={tournaments.closeDeleteConfirm}
        onConfirm={tournaments.handleConfirmDelete}
        deleting={tournaments.deleting}
      />

      <TournamentEditModal
        editing={tournaments.editing}
        editForm={tournaments.editForm}
        setEditForm={tournaments.setEditForm}
        saving={tournaments.saving}
        onClose={tournaments.closeEdit}
        onSubmit={tournaments.handleSaveEdit}
      />
    </section>
  );
}