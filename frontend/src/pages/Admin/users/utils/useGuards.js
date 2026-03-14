export function isSameUser(userA, userB) {
  return Number(userA?.id) === Number(userB?.id);
}

export function canDeactivateUser(user) {
  return Boolean(user?.is_active);
}

export function canActivateUser(user) {
  return !user?.is_active;
}