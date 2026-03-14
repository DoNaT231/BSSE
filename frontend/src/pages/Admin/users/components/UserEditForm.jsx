export default function UserEditForm({
  formData,
  onChange,
  onSubmit,
  onReset,
  isLoading,
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6">
      <h4 className="mb-3 font-semibold">Szerkesztés</h4>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="p-3 border rounded-xl">
          <label className="block text-xs text-gray-500">Felhasználónév</label>
          <input
            name="username"
            value={formData.username}
            onChange={onChange}
            className="w-full mt-1 outline-none"
          />
        </div>

        <div className="p-3 border rounded-xl">
          <label className="block text-xs text-gray-500">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            className="w-full mt-1 outline-none"
          />
        </div>

        <div className="p-3 border rounded-xl">
          <label className="block text-xs text-gray-500">Szerep</label>
          <select
            name="userType"
            value={formData.userType}
            onChange={onChange}
            className="w-full mt-1 bg-transparent outline-none"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="p-3 border rounded-xl">
          <label className="block text-xs text-gray-500">Telefonszám</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={onChange}
            className="w-full mt-1 outline-none"
          />
        </div>

        <label className="flex items-center gap-2 p-3 border rounded-xl">
          <input
            type="checkbox"
            name="isLocal"
            checked={formData.isLocal}
            onChange={onChange}
          />
          <span className="text-sm">Local felhasználó</span>
        </label>

        <label className="flex items-center gap-2 p-3 border rounded-xl">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={onChange}
          />
          <span className="text-sm">Aktív</span>
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 text-sm border rounded-xl"
          disabled={isLoading}
        >
          Visszaállítás
        </button>

        <button
          type="submit"
          className="px-4 py-2 text-sm text-white bg-black rounded-xl disabled:opacity-50"
          disabled={isLoading}
        >
          Mentés
        </button>
      </div>
    </form>
  );
}