import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../../config";

/**
 * TournamentsAdminSection
 * ------------------------------------------------------------
 * Admin felület szekció:
 * - Összes verseny listázása (GET /tournaments/admin/all)
 * - Létrehozás (POST /tournaments)
 * - Szerkesztés (PUT /tournaments/:id) -> status is itt
 * - Törlés (DELETE /tournaments/:id)
 *
 * Fontos:
 * - A backend requireAdmin middleware miatt a requestekhez auth kell.
 * - start_at: datetime-local input -> ISO stringet küldünk.
 */
export default function TournamentsAdminSection() {
  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");
   const token = localStorage.getItem("token");

  // Create form
  const [createForm, setCreateForm] = useState({
    title: "",
    category: "",
    description: "",
    start_at: "", // datetime-local
    status: "active",
  });
  const [creating, setCreating] = useState(false);

  // Edit modal/state
  const [editing, setEditing] = useState(null); // tournament object
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    description: "",
    start_at: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);

  const sortedItems = useMemo(() => {
    // admin listában created_at DESC jön, de ha mégis: stabilan rendezzük
    return [...items].sort((a, b) => {
      const ad = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const bd = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return bd - ad;
    });
  }, [items]);

  function toDatetimeLocalValue(isoStringOrNull) {
    if (!isoStringOrNull) return "";
    const d = new Date(isoStringOrNull);
    if (Number.isNaN(d.getTime())) return "";
    // datetime-local: "YYYY-MM-DDTHH:mm"
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }
  
  function datetimeLocalToString(value) {
  if (!value) return null;

  // biztonsági ellenőrzés (opcionális)
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    console.warn("Invalid datetime-local format:", value);
    return null;
  }

  return `${value}:00`;
}

  async function request(path, options = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
        },
    });

    const isJson = res.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await res.json().catch(() => null) : null;

    if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}`);
    }
    return data;
    }

  async function loadAll() {
    try {
      setError("");
      setLoadingList(true);
      const data = await request("/api/tournaments/admin/all", { method: "GET" });
      setItems(Array.isArray(data) ? data : []);
      console.log("load utan ezt az objektumot kapja: ", data)
    } catch (e) {
      setError(e.message || "Ismeretlen hiba a lista betöltésekor.");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      setError("");
      setCreating(true);

      const payload = {
        title: createForm.title.trim(),
        category: createForm.category.trim(),
        description: createForm.description?.trim() || null,
        start_at: datetimeLocalToString(createForm.start_at),
        status: createForm.status || "active",
      };
      console.log(JSON.stringify(payload))

      if (!payload.title || !payload.category) {
        setError("A title és category kötelező.");
        return;
      }

      const created = await request("/api/tournaments", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // frissítsük a listát gyorsan (append), majd biztos ami biztos loadAll
      setItems((prev) => [created, ...prev]);
      console.log("create során ezt küldöm a frontendről: ", payload)
      setCreateForm({
        title: "",
        category: "",
        description: "",
        start_at: "",
        status: "active",
      });
    } catch (e2) {
      setError(e2.message || "Hiba a létrehozáskor.");
    } finally {
      setCreating(false);
    }
  }

  function openEdit(t) {
    setEditing(t);
    setEditForm({
      title: t?.title || "",
      category: t?.category || "",
      description: t?.description || "",
      start_at: toDatetimeLocalValue(t?.start_at),
      status: t?.status || "active",
    });
  }

  function closeEdit() {
    setEditing(null);
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editing?.id) return;

    try {
      setError("");
      setSaving(true);

      // COALESCE miatt nyugodtan küldhetünk null-t is, de UI-ból inkább tisztán:
      const payload = {
        title: editForm.title.trim() || null,
        category: editForm.category.trim() || null,
        description: editForm.description?.trim() || null,
        start_at: datetimeLocalToString(editForm.start_at),
        status: editForm.status || null,
      };

      const updated = await request(`/api/tournaments/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      closeEdit();
    } catch (e2) {
      setError(e2.message || "Hiba a mentéskor.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!id) return;
    const ok = window.confirm("Biztos törlöd ezt a versenyt? (A jelentkezések is törlődhetnek.)");
    if (!ok) return;

    try {
      setError("");
      await request(`/api/tournaments/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      setError(e.message || "Hiba törlés közben.");
    }
  }

  return (
    <section className="w-full p-4 bg-white shadow rounded-2xl md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold md:text-2xl">Versenyek (Admin)</h2>
          <p className="mt-1 text-sm text-gray-600">
            Itt tudsz versenyt létrehozni, szerkeszteni (status is), és törölni.
          </p>
        </div>

        <button
          onClick={loadAll}
          className="px-3 py-2 text-sm border shrink-0 rounded-xl hover:bg-gray-50"
          disabled={loadingList}
          title="Lista frissítése"
        >
          {loadingList ? "Frissítés..." : "Frissítés"}
        </button>
      </div>

      {error ? (
        <div className="px-4 py-3 mt-4 text-sm text-red-800 border border-red-200 rounded-xl bg-red-50">
          {error}
        </div>
      ) : null}

      {/* CREATE */}
      <div className="p-4 mt-6 border rounded-2xl md:p-5">
        <h3 className="font-semibold">Új verseny létrehozása</h3>

        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-gray-700">Cím (title) *</label>
            <input
              className="w-full px-3 py-2 mt-1 border rounded-xl"
              value={createForm.title}
              onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Pl. Balatonalmádi Strandsport Kupa"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Kategória (category) *</label>
            <input
              className="w-full px-3 py-2 mt-1 border rounded-xl"
              value={createForm.category}
              onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))}
              placeholder="Pl. vegyes / amatőr / utánpótlás"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Leírás (description)</label>
            <textarea
              className="mt-1 w-full rounded-xl border px-3 py-2 min-h-[90px]"
              value={createForm.description}
              onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Rövid leírás a toborzáshoz..."
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Kezdés (start_at)</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 mt-1 border rounded-xl"
              value={createForm.start_at}
              onChange={(e) => setCreateForm((p) => ({ ...p, start_at: e.target.value }))}
            />
            <p className="mt-1 text-xs text-gray-500">
              Ha üres, NULL lesz (de ajánlott megadni).
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-700">Státusz (status)</label>
            <select
              className="w-full px-3 py-2 mt-1 border rounded-xl"
              value={createForm.status}
              onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="draft">draft</option>
              <option value="archived">archived</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              A publikus lista csak <code>active</code> versenyeket ad vissza.
            </p>
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 text-sm text-white bg-black rounded-xl hover:opacity-90 disabled:opacity-60"
            >
              {creating ? "Létrehozás..." : "Létrehozás"}
            </button>

            <button
              type="button"
              className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50"
              onClick={() =>
                setCreateForm({ title: "", category: "", description: "", start_at: "", status: "active" })
              }
              disabled={creating}
            >
              Ürítés
            </button>
          </div>
        </form>
      </div>

      {/* LIST */}
      <div className="mt-6">
        <h3 className="font-semibold">Összes verseny</h3>

        {loadingList ? (
          <div className="mt-3 text-sm text-gray-600">Betöltés...</div>
        ) : sortedItems.length === 0 ? (
          <div className="mt-3 text-sm text-gray-600">Nincs verseny.</div>
        ) : (
          <div className="mt-3 space-y-3">
            {sortedItems.map((t) => (
              <div
                key={t.id}
                className="flex flex-col gap-3 p-4 border rounded-2xl md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold truncate">{t.title}</div>
                    <span className="px-2 py-1 text-xs text-gray-700 border rounded-full">
                      {t.category}
                    </span>
                    <span className="px-2 py-1 text-xs text-gray-700 border rounded-full">
                      status: {t.status}
                    </span>
                  </div>

                  <div className="mt-1 text-sm text-gray-700 line-clamp-2">
                    {t.description || <span className="text-gray-400">Nincs leírás.</span>}
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Kezdés:{" "}
                    {t.start_at ? (
                      <span>{new Date(t.start_at).toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400">nincs megadva</span>
                    )}
                    {" • "}
                    ID: {t.id}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(t)}
                    className="px-3 py-2 text-sm border rounded-xl hover:bg-gray-50"
                  >
                    Szerkesztés
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="px-3 py-2 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50 hover:bg-red-100"
                  >
                    Törlés
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-2xl bg-white border shadow-xl rounded-2xl">
            <div className="flex items-start justify-between gap-4 p-4 border-b md:p-5">
              <div>
                <div className="text-lg font-semibold">Verseny szerkesztése</div>
                <div className="mt-1 text-xs text-gray-500">ID: {editing.id}</div>
              </div>
              <button
                onClick={closeEdit}
                className="px-3 py-2 text-sm border rounded-xl hover:bg-gray-50"
              >
                Bezárás
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 gap-4 p-4 md:p-5 md:grid-cols-2">
              <div>
                <label className="text-sm text-gray-700">Cím (title)</label>
                <input
                  className="w-full px-3 py-2 mt-1 border rounded-xl"
                  value={editForm.title}
                  onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">Kategória (category)</label>
                <input
                  className="w-full px-3 py-2 mt-1 border rounded-xl"
                  value={editForm.category}
                  onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-700">Leírás (description)</label>
                <textarea
                  className="mt-1 w-full rounded-xl border px-3 py-2 min-h-[110px]"
                  value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">Kezdés (start_at)</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 mt-1 border rounded-xl"
                  value={editForm.start_at}
                  onChange={(e) => setEditForm((p) => ({ ...p, start_at: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">Státusz (status)</label>
                <select
                  className="w-full px-3 py-2 mt-1 border rounded-xl"
                  value={editForm.status}
                  onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="draft">draft</option>
                  <option value="archived">archived</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 md:col-span-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50"
                  disabled={saving}
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-black rounded-xl hover:opacity-90 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Mentés..." : "Mentés"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
