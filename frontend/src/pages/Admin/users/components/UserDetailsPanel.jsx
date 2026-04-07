import { useEffect, useState } from "react";
import useUserEditor from "../hooks/useUserEditor";
import { formatBoolean, formatUserType } from "../utils/userFormatters";
import UserEditForm from "./UserEditForm";

export default function UserDetailsPanel({
  selectedUser,
  onClose,
  onUpdate,
  onAdjustThursdayPoints,
  onActivate,
  onDeactivate,
  onDelete,
  isActionLoading,
}) {
  const { formData, handleChange, resetForm } = useUserEditor(selectedUser);
  const [pointsAmount, setPointsAmount] = useState("1");

  useEffect(() => {
    setPointsAmount("1");
  }, [selectedUser?.id]);

  if (!selectedUser) {
    return (
      <div className="p-4 border lg:col-span-2 rounded-2xl">
        <div className="flex items-center justify-center h-full text-sm text-gray-600">
          Válassz ki egy felhasználót a listából.
        </div>
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onUpdate(selectedUser.id, formData);
  }

  function parsePointsDelta() {
    const n = Number.parseInt(String(pointsAmount).trim(), 10);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }

  async function handleAddPoints() {
    const n = parsePointsDelta();
    if (n == null) return;
    await onAdjustThursdayPoints(selectedUser.id, n);
  }

  async function handleSubtractPoints() {
    const n = parsePointsDelta();
    if (n == null) return;
    await onAdjustThursdayPoints(selectedUser.id, -n);
  }

  const pointsDeltaValid = parsePointsDelta() != null;

  return (
    <div className="p-4 border lg:col-span-2 rounded-2xl">
      <div className="flex justify-between gap-3">
        <h3 className="text-lg font-semibold">Felhasználó adatai</h3>

        <button
          onClick={onClose}
          className="px-3 py-2 text-sm border rounded-xl"
        >
          Bezárás
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 mt-4 md:grid-cols-2">
        <div className="p-3 border rounded-xl">
          <div className="text-xs text-gray-500">ID</div>
          <div className="font-semibold">{selectedUser.id}</div>
        </div>

        <div className="p-3 border rounded-xl">
          <div className="text-xs text-gray-500">Szerep</div>
          <div className="font-semibold">
            {formatUserType(selectedUser.user_type)}
          </div>
        </div>

        <div className="col-span-1 p-3 border rounded-xl md:col-span-2">
          <div className="text-xs text-gray-500">Email</div>
          <div className="font-semibold">{selectedUser.email || "—"}</div>
        </div>

        <div className="p-3 border rounded-xl">
          <div className="text-xs text-gray-500">Local</div>
          <div className="font-semibold">
            {formatBoolean(Boolean(selectedUser.is_local))}
          </div>
        </div>

        <div className="p-3 border rounded-xl">
          <div className="text-xs text-gray-500">Aktív</div>
          <div className="font-semibold">
            {formatBoolean(Boolean(selectedUser.is_active))}
          </div>
        </div>

        <div className="col-span-1 p-3 border rounded-xl md:col-span-2">
          <div className="text-xs text-gray-500">Telefonszám</div>
          <div className="font-semibold">{selectedUser.phone || "—"}</div>
        </div>

        <div className="col-span-1 p-3 border rounded-xl md:col-span-2">
          <div className="text-xs text-gray-500">Csütörtöki pontok</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">
            {Number(selectedUser.thursday_points ?? 0)}
          </div>
          <div className="flex flex-wrap items-end gap-2 mt-3">
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              Összeg
              <input
                type="number"
                min={1}
                step={1}
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                className="w-24 px-2 py-1.5 text-sm border rounded-lg"
              />
            </label>
            <button
              type="button"
              onClick={handleAddPoints}
              disabled={isActionLoading || !pointsDeltaValid}
              className="px-3 py-2 text-sm text-emerald-800 border border-emerald-200 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50"
            >
              + Hozzáadás
            </button>
            <button
              type="button"
              onClick={handleSubtractPoints}
              disabled={isActionLoading || !pointsDeltaValid}
              className="px-3 py-2 text-sm text-amber-900 border border-amber-200 rounded-xl bg-amber-50 hover:bg-amber-100 disabled:opacity-50"
            >
              − Levonás
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Csak admin módosíthatja; a pontszám nem mehet 0 alá.
          </p>
        </div>
      </div>

      <UserEditForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onReset={resetForm}
        isLoading={isActionLoading}
      />

      <div className="flex flex-wrap justify-end gap-2 mt-6">
        {!selectedUser.is_active ? (
          <button
            onClick={() => onActivate(selectedUser.id)}
            className="px-4 py-2 text-sm border text-emerald-700 border-emerald-200 rounded-xl bg-emerald-50 hover:bg-emerald-100"
            disabled={isActionLoading}
          >
            Aktiválás
          </button>
        ) : (
          <button
            onClick={() => onDeactivate(selectedUser.id)}
            className="px-4 py-2 text-sm text-yellow-800 border border-yellow-200 rounded-xl bg-yellow-50 hover:bg-yellow-100"
            disabled={isActionLoading}
          >
            Deaktiválás
          </button>
        )}

        <button
          onClick={() => onDelete(selectedUser.id)}
          className="px-4 py-2 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50 hover:bg-red-100"
          disabled={isActionLoading}
        >
          🗑️ Felhasználó törlése
        </button>
      </div>
    </div>
  );
}