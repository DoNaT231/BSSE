export default function UsersToolbar({ usersCount, onRefresh, isLoading }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold md:text-2xl">👤 Felhasználók</h2>
        <p className="mt-1 text-sm text-gray-600">
          Felhasználók listája és kezelése admin jogosultsággal.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="px-2 py-1 text-xs border rounded-full">
          {usersCount} db
        </span>

        <button
          onClick={onRefresh}
          className="px-3 py-2 text-sm border shrink-0 rounded-xl hover:bg-gray-50 disabled:opacity-50"
          title="Felhasználó lista frissítése"
          disabled={isLoading}
        >
          🔄 Frissítés
        </button>
      </div>
    </div>
  );
}