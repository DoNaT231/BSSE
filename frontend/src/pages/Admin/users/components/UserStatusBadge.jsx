export default function UserStatusBadge({ isActive }) {
  return (
    <span
      className={`px-2 py-1 text-xs rounded-full border ${
        isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-red-50 text-red-700 border-red-200"
      }`}
    >
      {isActive ? "Aktív" : "Inaktív"}
    </span>
  );
}