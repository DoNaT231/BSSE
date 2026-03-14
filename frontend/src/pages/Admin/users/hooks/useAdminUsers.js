import { useEffect, useState } from "react";
import {
  fetchAdminUsers,
  fetchAdminUserById,
  saveAdminUser,
  activateAdminUser,
  deactivateAdminUser,
  removeAdminUser,
} from "../services/adminUsersService";

export default function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  async function loadUsers() {
    try {
      setIsLoading(true);
      setError("");

      const data = await fetchAdminUsers();
      console.log(data)
      setUsers(data);

      if (selectedUser?.id) {
        const refreshedSelected =
          data.find((user) => Number(user.id) === Number(selectedUser.id)) ||
          null;

        setSelectedUser(refreshedSelected);
      }
    } catch (err) {
      setError(err.message || "Nem sikerült lekérni a felhasználókat.");
    } finally {
      setIsLoading(false);
    }
  }

  async function selectUser(userId) {
    try {
      setError("");
      const data = await fetchAdminUserById(userId);
      setSelectedUser(data);
    } catch (err) {
      setError(err.message || "Nem sikerült lekérni a felhasználó adatait.");
    }
  }

  async function refreshSelectedUser() {
    if (!selectedUser?.id) return;

    try {
      const data = await fetchAdminUserById(selectedUser.id);
      setSelectedUser(data);
    } catch (err) {
      setError(err.message || "Nem sikerült frissíteni a felhasználót.");
    }
  }

  async function updateUser(userId, payload) {
    try {
      setIsActionLoading(true);
      setError("");

      const updatedUser = await saveAdminUser(userId, payload);

      setModalMessage("A felhasználó adatai sikeresen frissültek.");
      setModalOpen(true);

      setSelectedUser(updatedUser);
      await loadUsers();

      return updatedUser;
    } catch (err) {
      setModalMessage(err.message || "Nem sikerült módosítani a felhasználót.");
      setModalOpen(true);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  }

  async function deactivateUser(userId) {
    try {
      setIsActionLoading(true);
      setError("");

      const updatedUser = await deactivateAdminUser(userId);

      setModalMessage("A felhasználó sikeresen deaktiválva lett.");
      setModalOpen(true);

      setSelectedUser(updatedUser);
      await loadUsers();

      return updatedUser;
    } catch (err) {
      setModalMessage(err.message || "Nem sikerült deaktiválni a felhasználót.");
      setModalOpen(true);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  }

  async function activateUser(userId) {
    try {
      setIsActionLoading(true);
      setError("");

      const updatedUser = await activateAdminUser(userId);

      setModalMessage("A felhasználó sikeresen aktiválva lett.");
      setModalOpen(true);

      setSelectedUser(updatedUser);
      await loadUsers();

      return updatedUser;
    } catch (err) {
      setModalMessage(err.message || "Nem sikerült aktiválni a felhasználót.");
      setModalOpen(true);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  }

  async function deleteUser(userId) {
    try {
      setIsActionLoading(true);
      setError("");

      await removeAdminUser(userId);

      setModalMessage("A felhasználó sikeresen törölve lett.");
      setModalOpen(true);

      if (Number(selectedUser?.id) === Number(userId)) {
        setSelectedUser(null);
      }

      await loadUsers();
    } catch (err) {
      setModalMessage(err.message || "Nem sikerült törölni a felhasználót.");
      setModalOpen(true);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    selectedUser,
    setSelectedUser,
    selectUser,
    refreshSelectedUser,
    loadUsers,
    updateUser,
    deactivateUser,
    activateUser,
    deleteUser,
    isLoading,
    isActionLoading,
    error,
    modalOpen,
    modalMessage,
    closeModal: () => setModalOpen(false),
  };
}