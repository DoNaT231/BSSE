import React, { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import { API_BASE_URL } from "../../../config";

/**
 * UserList (Admin)
 * ------------------------------------------------------------------
 * - Felhasználók listázása
 * - Részletek megtekintése
 * - Felhasználó törlése
 * - Lista manuális frissítése (🔄)
 * ------------------------------------------------------------------
 */

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const token = localStorage.getItem("token");

  const [modal, setModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  /**
   * Felhasználók lekérése (GET /api/user/)
   */
  const fetchUsers = () => {
    fetch(`${API_BASE_URL}/api/user/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Hiba a felhasználók lekérésekor");
        }
        return response.json();
      })
      .then((data) => setUsers(data))
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Felhasználó törlése
   */
  const deleteUser = (id) => {
    fetch(`${API_BASE_URL}/api/user/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        const result = await response.text();
        setModal(true);
        if (!response.ok) {
          setModalMessage("Hiba a törlés során: " + result);
        } else {
          setModalMessage("Sikeres törlés: " + result);
        }
      })
      .catch((error) => {
        setModal(true);
        setModalMessage("Hálózati hiba: " + error.message);
      });
  };

  return (
    <section className="w-full p-4 bg-white shadow rounded-2xl md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold md:text-2xl">👤 Felhasználók</h2>
          <p className="mt-1 text-sm text-gray-600">
            Felhasználók listája és kezelése admin jogosultsággal.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="px-3 py-2 text-sm border shrink-0 rounded-xl hover:bg-gray-50"
          title="Felhasználó lista frissítése"
        >
          🔄 Frissítés
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-6 lg:grid-cols-3">
        {/* Lista */}
        <div className="p-4 border lg:col-span-1 rounded-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Felhasználók</h3>
            <span className="px-2 py-1 text-xs border rounded-full">
              {users.length} db
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full text-left rounded-2xl border px-3 py-3 hover:bg-gray-50 ${
                  selectedUser?.id === user.id ? "border-black bg-gray-50" : ""
                }`}
              >
                <div className="font-semibold truncate">{user.username}</div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email || "—"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Részletek */}
        <div className="p-4 border lg:col-span-2 rounded-2xl">
          {!selectedUser ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-600">
              Válassz ki egy felhasználót a listából.
            </div>
          ) : (
            <div>
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">Felhasználó adatai</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-3 py-2 text-sm border rounded-xl"
                >
                  Bezárás
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 border rounded-xl">
                  <div className="text-xs text-gray-500">ID</div>
                  <div className="font-semibold">{selectedUser.id}</div>
                </div>

                <div className="p-3 border rounded-xl">
                  <div className="text-xs text-gray-500">Szerep</div>
                  <div className="font-semibold">
                    {selectedUser.user_type}
                  </div>
                </div>

                <div className="col-span-2 p-3 border rounded-xl">
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="font-semibold">
                    {selectedUser.email || "—"}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => deleteUser(selectedUser.id)}
                  className="px-4 py-2 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50 hover:bg-red-100"
                >
                  🗑️ Felhasználó törlése
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <Modal onClose={() => setModal(false)}>
          <div>
            <h3 className="text-lg font-semibold">Értesítés</h3>
            <p className="mt-2 text-sm">{modalMessage}</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setModal(false)}
                className="px-4 py-2 text-sm text-white bg-black rounded-xl"
              >
                OK
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default UserList;
