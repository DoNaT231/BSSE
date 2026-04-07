export function formatUserType(userType) {
  switch (userType) {
    case "ADMIN":
      return "Admin";
    case "USER":
      return "Felhasználó";
    case "STRAND_WORKER":
      return "Stranddolgozó";
    default:
      return userType || "—";
  }
}

export function formatBoolean(value) {
  return value ? "Igen" : "Nem";
}

export function mapUserToForm(user) {
  return {
    username: user?.username || "",
    email: user?.email || "",
    userType: user?.user_type || "USER",
    isLocal: Boolean(user?.is_local),
    phone: user?.phone || "",
    isActive: Boolean(user?.is_active),
  };
}