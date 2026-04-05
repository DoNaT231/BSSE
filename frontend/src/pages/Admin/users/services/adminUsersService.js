import {
  getAllUsersAdmin,
  getUserByIdAdmin,
  updateUserAdmin,
  adjustThursdayPointsAdmin,
  deactivateUserAdmin,
  activateUserAdmin,
  deleteUserAdmin,
} from "../api/adminUsersApi";

export async function fetchAdminUsers() {
  return getAllUsersAdmin();
}

export async function fetchAdminUserById(userId) {
  return getUserByIdAdmin(userId);
}

export async function saveAdminUser(userId, payload) {
  return updateUserAdmin(userId, payload);
}

export async function adjustAdminThursdayPoints(userId, delta) {
  return adjustThursdayPointsAdmin(userId, delta);
}

export async function deactivateAdminUser(userId) {
  return deactivateUserAdmin(userId);
}

export async function activateAdminUser(userId) {
  return activateUserAdmin(userId);
}

export async function removeAdminUser(userId) {
  return deleteUserAdmin(userId);
}