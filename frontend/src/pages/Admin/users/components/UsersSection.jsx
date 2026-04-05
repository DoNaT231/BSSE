import Modal from "../../../../components/Modal";
import useAdminUsers from "../hooks/useAdminUsers";
import UserDetailsPanel from "./UserDetailsPanel";
import UsersSidebar from "./UsersSidebar";
import UsersToolbar from "./UsersToolbar";

export default function UsersSection() {
  const {
    users,
    selectedUser,
    setSelectedUser,
    selectUser,
    loadUsers,
    updateUser,
    adjustThursdayPoints,
    activateUser,
    deactivateUser,
    deleteUser,
    isLoading,
    isActionLoading,
    error,
    modalOpen,
    modalMessage,
    closeModal,
  } = useAdminUsers();

  return (
    <section className="w-full p-4 bg-white shadow rounded-2xl md:p-6">
      <UsersToolbar
        usersCount={users.length}
        onRefresh={loadUsers}
        isLoading={isLoading}
      />

      {error ? (
        <div className="p-3 mt-4 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 mt-6 lg:grid-cols-3">
        <UsersSidebar
          users={users}
          selectedUser={selectedUser}
          onSelectUser={selectUser}
          isLoading={isLoading}
        />

        <UserDetailsPanel
          selectedUser={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={updateUser}
          onAdjustThursdayPoints={adjustThursdayPoints}
          onActivate={activateUser}
          onDeactivate={deactivateUser}
          onDelete={deleteUser}
          isActionLoading={isActionLoading}
        />
      </div>

      {modalOpen && (
        <Modal onClose={closeModal}>
          <div>
            <h3 className="text-lg font-semibold">Értesítés</h3>
            <p className="mt-2 text-sm">{modalMessage}</p>

            <div className="flex justify-end mt-4">
              <button
                onClick={closeModal}
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
}