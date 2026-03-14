import UserStatusBadge from "./UserStatusBadge";

export default function UsersSidebar({
  users,
  selectedUser,
  onSelectUser,
  isLoading,
}) {
  return (
    <div className="p-4 border lg:col-span-1 rounded-2xl">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Felhasználók</h3>
      </div>

      <div className="mt-3 space-y-2">
        {isLoading ? (
          <div className="text-sm text-gray-500">Betöltés...</div>
        ) : users.length === 0 ? (
          <div className="text-sm text-gray-500">Nincs felhasználó.</div>
        ) : (
          users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user.id)}
              className={`w-full text-left rounded-2xl border px-3 py-3 hover:bg-gray-50 ${
                selectedUser?.id === user.id ? "border-black bg-gray-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {user.username || "Névtelen felhasználó"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email || "—"}
                  </div>
                </div>

                <UserStatusBadge isActive={Boolean(user.is_active)} />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}